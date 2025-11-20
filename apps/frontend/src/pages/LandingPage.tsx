import { useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Zap, Shield, Globe } from 'lucide-react';
import ShaderBackground from '../components/ShaderBackground';
import NetworkGraph3D from '../components/NetworkGraph3D';

export default function LandingPage() {
    const containerRef = useRef<HTMLDivElement>(null);

    return (
        <div ref={containerRef} className="relative min-h-screen w-full bg-slate-800 text-white overflow-hidden font-sans">
            {/* 3D Background with Network Graph */}
            <div className="absolute inset-0 z-0">
                <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
                    <ShaderBackground />
                    <NetworkGraph3D
                        nodeCount={60}
                        connectionDensity={0.12}
                        color="#10b981"
                    />
                </Canvas>
            </div>

            {/* Overlay Content */}
            <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 sm:px-6 lg:px-8 text-center pointer-events-none">
                <div className="max-w-5xl mx-auto pointer-events-auto">
                    <motion.div
                        initial={{ y: 100, opacity: 0, skewY: 7 }}
                        animate={{ y: 0, opacity: 1, skewY: 0 }}
                        transition={{ duration: 1.2, ease: 'easeOut' }}
                        className="overflow-hidden mb-6"
                    >
                        <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60 drop-shadow-2xl">
                            ZINCIR
                            <span className="block text-4xl md:text-6xl mt-2 text-emerald-400 font-bold tracking-wide">
                                INTELLIGENCE
                            </span>
                        </h1>
                    </motion.div>

                    <motion.p
                        initial={{ y: 50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 1, delay: 0.4, ease: 'easeOut' }}
                        className="text-xl md:text-2xl text-slate-300 max-w-2xl mx-auto mb-12 leading-relaxed font-light"
                    >
                        The next generation B2B partnership platform powered by neural networks and verified trust protocols.
                    </motion.p>

                    <motion.div
                        initial={{ y: 30, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.8, delay: 0.6, ease: 'easeOut' }}
                        className="flex flex-col sm:flex-row items-center justify-center gap-6"
                    >
                        <Link
                            to="/search"
                            className="group relative px-8 py-4 bg-emerald-500 text-slate-950 font-bold text-lg rounded-full overflow-hidden transition-all hover:scale-105 hover:shadow-[0_0_40px_-10px_rgba(16,185,129,0.5)]"
                        >
                            <span className="relative z-10 flex items-center gap-2">
                                Start Exploring <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </span>
                            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                        </Link>

                        <Link
                            to="/register"
                            className="px-8 py-4 bg-white/5 backdrop-blur-md border border-white/10 text-white font-semibold text-lg rounded-full hover:bg-white/10 transition-all hover:border-white/20"
                        >
                            Create Account
                        </Link>
                    </motion.div>
                </div>
            </div>

            {/* Feature Grid (Bottom) */}
            <div className="absolute bottom-0 left-0 right-0 z-10 p-8 hidden md:block">
                <div className="max-w-7xl mx-auto grid grid-cols-3 gap-8 text-slate-400">
                    <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-900/50 backdrop-blur-sm border border-white/5">
                        <Shield className="w-8 h-8 text-emerald-500" />
                        <div>
                            <h3 className="text-white font-bold">Verified Trust</h3>
                            <p className="text-sm">100% Identity Verification</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-900/50 backdrop-blur-sm border border-white/5">
                        <Zap className="w-8 h-8 text-emerald-500" />
                        <div>
                            <h3 className="text-white font-bold">AI Matching</h3>
                            <p className="text-sm">Neural Partner Discovery</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-900/50 backdrop-blur-sm border border-white/5">
                        <Globe className="w-8 h-8 text-emerald-500" />
                        <div>
                            <h3 className="text-white font-bold">Global Network</h3>
                            <p className="text-sm">Cross-border Trade</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
