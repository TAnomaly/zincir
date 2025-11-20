import { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

interface PerformanceMode {
    mode: 'high' | 'medium' | 'low';
}

// Detect device performance capability
export const detectPerformanceMode = (): PerformanceMode['mode'] => {
    if (typeof window === 'undefined') return 'medium';

    // Check for mobile
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    if (isMobile) return 'low';

    // Check for high-end devices (rough heuristic)
    const memory = (performance as any).memory;
    if (memory && memory.jsHeapSizeLimit > 4000000000) return 'high';

    return 'medium';
};

interface OptimizedShaderBackgroundProps {
    variant?: 'hero' | 'subtle' | 'accent' | 'interactive';
    performanceMode?: PerformanceMode['mode'];
}

export default function OptimizedShaderBackground({
    variant = 'hero',
    performanceMode
}: OptimizedShaderBackgroundProps) {
    const meshRef = useRef<THREE.Mesh>(null);
    const materialRef = useRef<THREE.ShaderMaterial>(null);
    const { viewport } = useThree();

    // Auto-detect if not provided
    const mode = performanceMode || detectPerformanceMode();

    // Performance-based configurations
    const config = useMemo(() => {
        const variants = {
            hero: { intensity: 1.0, speed: 0.1, startColor: '#1e293b', endColor: '#10b981' },
            subtle: { intensity: 0.3, speed: 0.05, startColor: '#334155', endColor: '#475569' },
            accent: { intensity: 0.6, speed: 0.15, startColor: '#10b981', endColor: '#34d399' },
            interactive: { intensity: 0.8, speed: 0.2, startColor: '#0ea5e9', endColor: '#34d399' }
        }[variant];

        // Adjust based on performance mode
        const performanceMultipliers = {
            high: { resolution: 1.0, frameSkip: 1, noiseQuality: 1.0 },
            medium: { resolution: 0.75, frameSkip: 2, noiseQuality: 0.7 },
            low: { resolution: 0.5, frameSkip: 4, noiseQuality: 0.5 }
        }[mode];

        return { ...variants, ...performanceMultipliers };
    }, [variant, mode]);

    // Optimized shader - simplified for performance
    const vertexShader = `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;

    // Simplified fragment shader for better performance
    const fragmentShader = `
    uniform float uTime;
    uniform float uIntensity;
    uniform vec2 uResolution;
    uniform vec3 uColorStart;
    uniform vec3 uColorEnd;
    uniform vec2 uMouse;
    uniform float uNoiseQuality;
    varying vec2 vUv;

    // Simplified noise function for performance
    float simpleNoise(vec2 p) {
      return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
    }

    void main() {
      vec2 uv = vUv;
      
      // Simplified animation
      float noise = simpleNoise(uv * 3.0 + uTime * 0.1) * uNoiseQuality;
      
      // Mouse interaction (only if not low performance)
      float mouseInfluence = 0.0;
      if (uNoiseQuality > 0.6) {
        mouseInfluence = length(uMouse - uv) * 0.5;
      }
      
      // Gradient with noise
      float mixValue = uv.y + noise * 0.2 + mouseInfluence;
      vec3 color = mix(uColorStart, uColorEnd, clamp(mixValue, 0.0, 1.0));
      
      // Optional dithering (disabled on low performance)
      if (uNoiseQuality > 0.7) {
        float dither = mod(gl_FragCoord.x + gl_FragCoord.y, 2.0) * 0.03;
        color += dither;
      }
      
      gl_FragColor = vec4(color * uIntensity, 1.0);
    }
  `;

    const uniforms = useMemo(() => ({
        uTime: { value: 0 },
        uIntensity: { value: config.intensity },
        uResolution: { value: new THREE.Vector2(viewport.width, viewport.height) },
        uColorStart: { value: new THREE.Color(config.startColor) },
        uColorEnd: { value: new THREE.Color(config.endColor) },
        uMouse: { value: new THREE.Vector2(0.5, 0.5) },
        uNoiseQuality: { value: config.noiseQuality }
    }), [config, viewport]);

    // Frame counter for frame skipping
    const frameCounter = useRef(0);

    useFrame((state) => {
        if (!materialRef.current) return;

        // Frame skipping for performance
        frameCounter.current++;
        if (frameCounter.current % config.frameSkip !== 0) return;

        materialRef.current.uniforms.uTime.value = state.clock.elapsedTime * config.speed;

        // Update mouse position (only on medium/high performance)
        if (config.noiseQuality > 0.6) {
            const x = (state.mouse.x + 1) / 2;
            const y = (state.mouse.y + 1) / 2;
            materialRef.current.uniforms.uMouse.value.set(x, y);
        }
    });

    return (
        <mesh ref={meshRef} scale={[viewport.width, viewport.height, 1]}>
            <planeGeometry args={[1, 1, 1, 1]} />
            <shaderMaterial
                ref={materialRef}
                vertexShader={vertexShader}
                fragmentShader={fragmentShader}
                uniforms={uniforms}
            />
        </mesh>
    );
}
