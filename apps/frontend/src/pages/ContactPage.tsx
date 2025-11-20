import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import { Canvas } from '@react-three/fiber';
import { motion } from 'framer-motion';
import OptimizedShaderBackground from '../components/OptimizedShaderBackground';
import ShaderButton from '../components/ShaderButton';
import AnimatedCard from '../components/AnimatedCard';

export default function ContactPage() {
    return (
        <div className="min-h-screen bg-slate-800">
            {/* Hero with Shader */}
            <div className="relative pt-24 pb-16 px-4 overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <Canvas camera={{ position: [0, 0, 1] }}>
                        <OptimizedShaderBackground variant="interactive" />
                    </Canvas>
                </div>

                <div className="max-w-4xl mx-auto relative z-10 text-center">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-5xl md:text-6xl font-black text-white mb-4"
                    >
                        Bize <span className="text-gradient">Ulaşın</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-xl text-slate-200"
                    >
                        Sorularınız için buradayız. Size en kısa sürede dönüş yapacağız.
                    </motion.p>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-6xl mx-auto px-4 pb-20 -mt-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
                    <AnimatedCard delay={0.1}>
                        <div className="text-center">
                            <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                                <Mail className="w-6 h-6 text-emerald-400" />
                            </div>
                            <h3 className="font-bold text-white mb-2">Email</h3>
                            <a href="mailto:info@zincir.com" className="text-emerald-400 hover:underline">
                                info@zincir.com
                            </a>
                        </div>
                    </AnimatedCard>

                    <AnimatedCard delay={0.2}>
                        <div className="text-center">
                            <div className="w-12 h-12 bg-cyan-500/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                                <Phone className="w-6 h-6 text-cyan-400" />
                            </div>
                            <h3 className="font-bold text-white mb-2">Telefon</h3>
                            <a href="tel:+902121234567" className="text-cyan-400 hover:underline">
                                +90 (212) 123 45 67
                            </a>
                        </div>
                    </AnimatedCard>

                    <AnimatedCard delay={0.3}>
                        <div className="text-center">
                            <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                                <MapPin className="w-6 h-6 text-purple-400" />
                            </div>
                            <h3 className="font-bold text-white mb-2">Adres</h3>
                            <p className="text-slate-300">
                                İstanbul, Türkiye
                            </p>
                        </div>
                    </AnimatedCard>
                </div>

                {/* Contact Form */}
                <AnimatedCard delay={0.4}>
                    <h2 className="text-2xl font-bold text-white mb-6">Mesaj Gönderin</h2>
                    <form className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input
                                type="text"
                                placeholder="Adınız"
                                className="input"
                            />
                            <input
                                type="email"
                                placeholder="Email"
                                className="input"
                            />
                        </div>
                        <input
                            type="text"
                            placeholder="Konu"
                            className="input"
                        />
                        <textarea
                            rows={6}
                            placeholder="Mesajınız"
                            className="input resize-none"
                        />
                        <ShaderButton variant="primary" size="lg">
                            <Send className="w-5 h-5" />
                            Mesaj Gönder
                        </ShaderButton>
                    </form>
                </AnimatedCard>
            </div>
        </div>
    );
}
