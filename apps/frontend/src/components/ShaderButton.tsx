import { motion } from 'framer-motion';
import { ReactNode, useState } from 'react';

interface ShaderButtonProps {
    children: ReactNode;
    onClick?: () => void;
    variant?: 'primary' | 'secondary' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    className?: string;
    disabled?: boolean;
    type?: 'button' | 'submit' | 'reset';
}

export default function ShaderButton({
    children,
    onClick,
    variant = 'primary',
    size = 'md',
    className = '',
    disabled = false,
    type = 'button'
}: ShaderButtonProps) {
    const [isHovered, setIsHovered] = useState(false);

    const variants = {
        primary: 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold shadow-lg shadow-emerald-500/25',
        secondary: 'bg-white/5 backdrop-blur-md border border-white/10 text-white font-semibold hover:bg-white/10',
        ghost: 'bg-transparent text-emerald-400 font-semibold hover:bg-emerald-500/10'
    };

    const sizes = {
        sm: 'px-4 py-2 text-sm',
        md: 'px-6 py-3 text-base',
        lg: 'px-8 py-4 text-lg'
    };

    return (
        <motion.button
            type={type}
            onClick={onClick}
            disabled={disabled}
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
            whileHover={{ scale: disabled ? 1 : 1.05 }}
            whileTap={{ scale: disabled ? 1 : 0.98 }}
            className={`
        relative overflow-hidden rounded-full
        transition-all duration-300
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant]}
        ${sizes[size]}
        ${className}
      `}
        >
            {/* Animated gradient overlay */}
            {variant === 'primary' && (
                <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"
                    initial={{ x: '-100%' }}
                    animate={{ x: isHovered ? '100%' : '-100%' }}
                    transition={{ duration: 0.6, ease: 'easeInOut' }}
                />
            )}

            {/* Particle effect on hover */}
            {isHovered && variant === 'primary' && (
                <motion.div
                    className="absolute inset-0"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ duration: 1, repeat: Infinity }}
                >
                    {[...Array(8)].map((_, i) => (
                        <motion.div
                            key={i}
                            className="absolute w-1 h-1 bg-white rounded-full"
                            initial={{
                                x: '50%',
                                y: '50%',
                                scale: 0
                            }}
                            animate={{
                                x: `${50 + Math.cos(i * 45 * Math.PI / 180) * 50}%`,
                                y: `${50 + Math.sin(i * 45 * Math.PI / 180) * 50}%`,
                                scale: [0, 1, 0]
                            }}
                            transition={{
                                duration: 0.8,
                                repeat: Infinity,
                                delay: i * 0.1
                            }}
                        />
                    ))}
                </motion.div>
            )}

            {/* Content */}
            <span className="relative z-10 flex items-center justify-center gap-2">
                {children}
            </span>

            {/* Glow effect */}
            {variant === 'primary' && (
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-500 blur-xl opacity-0 group-hover:opacity-50 transition-opacity -z-10" />
            )}
        </motion.button>
    );
}
