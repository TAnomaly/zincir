import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface AnimatedCardProps {
    children: ReactNode;
    className?: string;
    delay?: number;
    hover?: boolean;
}

export default function AnimatedCard({
    children,
    className = '',
    delay = 0,
    hover = true
}: AnimatedCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay, ease: [0.25, 0.1, 0.25, 1] }}
            whileHover={hover ? { y: -5, scale: 1.02 } : undefined}
            className={`
        relative overflow-hidden rounded-2xl 
        bg-slate-900/50 backdrop-blur-md 
        border border-white/10
        shadow-lg shadow-emerald-500/5
        hover:border-emerald-500/30 hover:shadow-emerald-500/10
        transition-all duration-300
        ${className}
      `}
            style={{
                background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 41, 59, 0.6) 100%)',
            }}
        >
            {/* Dithered border effect */}
            <div
                className="absolute inset-0 rounded-2xl opacity-30"
                style={{
                    background: `
            repeating-linear-gradient(
              45deg,
              transparent,
              transparent 2px,
              rgba(16, 185, 129, 0.1) 2px,
              rgba(16, 185, 129, 0.1) 4px
            )
          `,
                    mixBlendMode: 'overlay'
                }}
            />

            {/* Content */}
            <div className="relative z-10">
                {children}
            </div>

            {/* Hover glow */}
            <motion.div
                className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ zIndex: -1 }}
            />
        </motion.div>
    );
}
