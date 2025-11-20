import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface OptimizedNetworkGraph3DProps {
    nodeCount?: number;
    connectionDensity?: number;
    color?: string;
    performanceMode?: 'high' | 'medium' | 'low';
}

// Auto-detect performance
const detectPerformance = (): 'high' | 'medium' | 'low' => {
    if (typeof window === 'undefined') return 'medium';
    const isMobile = /Android|webOS|iPhone|iPad|iPod/i.test(navigator.userAgent);
    return isMobile ? 'low' : 'high';
};

export default function OptimizedNetworkGraph3D({
    nodeCount = 50,
    connectionDensity = 0.15,
    color = '#10b981',
    performanceMode
}: OptimizedNetworkGraph3DProps) {
    const mode = performanceMode || detectPerformance();
    const nodesRef = useRef<THREE.Points>(null);
    const linesRef = useRef<THREE.LineSegments>(null);
    const frameCounter = useRef(0);

    // Performance-based configuration
    const perfConfig = useMemo(() => ({
        high: { nodeCount: 60, frameSkip: 1, particleSize: 0.15, lineOpacity: 0.2 },
        medium: { nodeCount: 40, frameSkip: 2, particleSize: 0.12, lineOpacity: 0.15 },
        low: { nodeCount: 20, frameSkip: 4, particleSize: 0.1, lineOpacity: 0.1 }
    }[mode]), [mode]);

    // Generate network nodes and connections
    const { nodes, connections } = useMemo(() => {
        const nodePositions: THREE.Vector3[] = [];
        const connectionPairs: [number, number][] = [];
        const count = perfConfig.nodeCount;

        // Create nodes in 3D space
        for (let i = 0; i < count; i++) {
            const x = (Math.random() - 0.5) * 10;
            const y = (Math.random() - 0.5) * 10;
            const z = (Math.random() - 0.5) * 5;
            nodePositions.push(new THREE.Vector3(x, y, z));
        }

        // Create connections between nearby nodes
        for (let i = 0; i < count; i++) {
            for (let j = i + 1; j < count; j++) {
                const distance = nodePositions[i].distanceTo(nodePositions[j]);
                if (distance < 3 && Math.random() < connectionDensity) {
                    connectionPairs.push([i, j]);
                }
            }
        }

        return { nodes: nodePositions, connections: connectionPairs };
    }, [perfConfig.nodeCount, connectionDensity]);

    // Create node geometry with BufferGeometry for performance
    const nodeGeometry = useMemo(() => {
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(nodes.length * 3);

        nodes.forEach((node, i) => {
            positions[i * 3] = node.x;
            positions[i * 3 + 1] = node.y;
            positions[i * 3 + 2] = node.z;
        });

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        return geometry;
    }, [nodes]);

    // Create connection lines geometry
    const lineGeometry = useMemo(() => {
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(connections.length * 6);

        connections.forEach((connection, i) => {
            const [start, end] = connection;
            positions[i * 6] = nodes[start].x;
            positions[i * 6 + 1] = nodes[start].y;
            positions[i * 6 + 2] = nodes[start].z;
            positions[i * 6 + 3] = nodes[end].x;
            positions[i * 6 + 4] = nodes[end].y;
            positions[i * 6 + 5] = nodes[end].z;
        });

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        return geometry;
    }, [connections, nodes]);

    // Animate the network with frame skipping
    useFrame((state) => {
        frameCounter.current++;

        // Skip frames based on performance mode
        if (frameCounter.current % perfConfig.frameSkip !== 0) return;

        const time = state.clock.elapsedTime;

        if (nodesRef.current) {
            // Slower rotation for better performance
            nodesRef.current.rotation.y = time * 0.05;
            nodesRef.current.rotation.x = Math.sin(time * 0.1) * 0.1;
        }

        if (linesRef.current) {
            linesRef.current.rotation.y = time * 0.05;
            linesRef.current.rotation.x = Math.sin(time * 0.1) * 0.1;
        }
    });

    return (
        <group>
            {/* Network Nodes */}
            <points ref={nodesRef} geometry={nodeGeometry}>
                <pointsMaterial
                    size={perfConfig.particleSize}
                    color={color}
                    transparent
                    opacity={0.8}
                    sizeAttenuation
                    depthWrite={false}
                />
            </points>

            {/* Connection Lines */}
            <lineSegments ref={linesRef} geometry={lineGeometry}>
                <lineBasicMaterial
                    color={color}
                    transparent
                    opacity={perfConfig.lineOpacity}
                    depthWrite={false}
                />
            </lineSegments>

            {/* Ambient glow effect (only on high performance) */}
            {mode === 'high' && (
                <mesh position={[0, 0, -2]}>
                    <sphereGeometry args={[8, 16, 16]} />
                    <meshBasicMaterial
                        color={color}
                        transparent
                        opacity={0.03}
                        side={THREE.BackSide}
                        depthWrite={false}
                    />
                </mesh>
            )}
        </group>
    );
}
