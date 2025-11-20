import { Canvas } from '@react-three/fiber';
import { ReactNode } from 'react';
import ShaderBackgroundVariants from './ShaderBackgroundVariants';

interface ShaderContainerProps {
    children: ReactNode;
    variant?: 'hero' | 'subtle' | 'accent' | 'interactive';
    className?: string;
}

export default function ShaderContainer({
    children,
    variant = 'subtle',
    className = ''
}: ShaderContainerProps) {
    return (
        <div className={`relative ${className}`}>
            {/* Shader Background */}
            <div className="absolute inset-0 z-0 opacity-40">
                <Canvas camera={{ position: [0, 0, 1] }}>
                    <ShaderBackgroundVariants variant={variant} />
                </Canvas>
            </div>

            {/* Content */}
            <div className="relative z-10">
                {children}
            </div>
        </div>
    );
}
