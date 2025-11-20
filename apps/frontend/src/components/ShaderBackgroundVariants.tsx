import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { shaderMaterial } from '@react-three/drei';
import { extend } from '@react-three/fiber';

// Dither Shader Material
const DitherShaderMaterial = shaderMaterial(
    {
        uTime: 0,
        uColorStart: new THREE.Color('#10b981'),
        uColorEnd: new THREE.Color('#0f172a'),
        uResolution: new THREE.Vector2(0, 0),
        uMouse: new THREE.Vector2(0, 0),
        uIntensity: 1.0,
        uSpeed: 0.1,
    },
    // Vertex Shader
    `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
  `,
    // Fragment Shader
    `
  uniform float uTime;
  uniform vec3 uColorStart;
  uniform vec3 uColorEnd;
  uniform vec2 uResolution;
  uniform vec2 uMouse;
  uniform float uIntensity;
  uniform float uSpeed;
  varying vec2 vUv;

  // Simplex 2D noise
  vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }

  float snoise(vec2 v){
    const vec4 C = vec4(0.211324865405187, 0.366025403784439,
             -0.577350269189626, 0.024390243902439);
    vec2 i  = floor(v + dot(v, C.yy) );
    vec2 x0 = v -   i + dot(i, C.xx);
    vec2 i1;
    i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod(i, 289.0);
    vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
    + i.x + vec3(0.0, i1.x, 1.0 ));
    vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
    m = m*m ;
    m = m*m ;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
    vec3 g;
    g.x  = a0.x  * x0.x  + h.x  * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }

  void main() {
    vec2 uv = vUv;
    
    // Dynamic movement
    float noiseValue = snoise(uv * 3.0 + uTime * uSpeed);
    
    // Mouse interaction
    float dist = distance(uv, uMouse);
    float interaction = smoothstep(0.5, 0.0, dist);
    
    // Mix colors based on noise and interaction
    vec3 color = mix(uColorStart, uColorEnd, uv.y + noiseValue * 0.2 * uIntensity);
    color = mix(color, vec3(1.0), interaction * 0.1 * uIntensity);

    // Dithering
    float dither = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453);
    color += (dither - 0.5) * 0.05 * uIntensity;

    gl_FragColor = vec4(color, 1.0);
  }
  `
);

extend({ DitherShaderMaterial });

type ShaderVariant = 'hero' | 'subtle' | 'accent' | 'interactive';

interface ShaderBackgroundProps {
    variant?: ShaderVariant;
    colorStart?: string;
    colorEnd?: string;
}

export default function ShaderBackgroundVariants({
    variant = 'hero',
    colorStart,
    colorEnd
}: ShaderBackgroundProps) {
    const materialRef = useRef<any>(null);
    const { size, viewport } = useThree();

    // Variant configurations
    const config = {
        hero: { intensity: 1.0, speed: 0.1, startColor: '#1e293b', endColor: '#10b981' },
        subtle: { intensity: 0.3, speed: 0.05, startColor: '#334155', endColor: '#475569' },
        accent: { intensity: 0.6, speed: 0.15, startColor: '#10b981', endColor: '#34d399' },
        interactive: { intensity: 0.8, speed: 0.2, startColor: '#0ea5e9', endColor: '#34d399' }
    }[variant];

    useFrame((state) => {
        if (materialRef.current) {
            materialRef.current.uTime = state.clock.getElapsedTime();
            materialRef.current.uResolution = new THREE.Vector2(size.width, size.height);
            materialRef.current.uMouse = new THREE.Vector2(
                (state.pointer.x + 1) / 2,
                (state.pointer.y + 1) / 2
            );
        }
    });

    return (
        <mesh scale={[viewport.width, viewport.height, 1]}>
            <planeGeometry args={[1, 1]} />
            {/* @ts-ignore */}
            <ditherShaderMaterial
                ref={materialRef}
                uColorStart={new THREE.Color(colorStart || config.startColor)}
                uColorEnd={new THREE.Color(colorEnd || config.endColor)}
                uIntensity={config.intensity}
                uSpeed={config.speed}
            />
        </mesh>
    );
}
