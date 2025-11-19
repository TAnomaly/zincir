import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, PerspectiveCamera, Environment, Stars } from '@react-three/drei';
import { motion } from 'framer-motion';
import {
  ArrowRight, ShieldCheck, Globe, Zap,
  Users, Building2, Search, TrendingUp
} from 'lucide-react';
import * as THREE from 'three';

function FloatingParticles() {
  const mesh = useRef<THREE.Points>(null!);

  useFrame((state) => {
    if (mesh.current) {
      mesh.current.rotation.y = state.clock.getElapsedTime() * 0.05;
      mesh.current.rotation.x = state.clock.getElapsedTime() * 0.02;
    }
  });

  return (
    <points ref={mesh}>
      <sphereGeometry args={[10, 64, 64]} />
      <pointsMaterial
        size={0.05}
        color="#10b981"
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  );
}

function HeroScene() {
  return (
    <div className="absolute inset-0 z-0">
      <Canvas>
        <PerspectiveCamera makeDefault position={[0, 0, 20]} />
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
          <FloatingParticles />
        </Float>
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        <Environment preset="city" />
      </Canvas>
    </div>
  );
}

const FEATURES = [
  {
    icon: ShieldCheck,
    title: "Doğrulanmış İş Ağı",
    description: "Tüm şirketler vergi levhası ve ticari sicil kontrolünden geçer. Güvenle ticaret yapın."
  },
  {
    icon: Zap,
    title: "Akıllı Eşleştirme",
    description: "Yapay zeka destekli algoritmamız, ihtiyaçlarınıza en uygun tedarikçileri anında bulur."
  },
  {
    icon: Globe,
    title: "Global Erişim",
    description: "Sadece yerel değil, uluslararası pazarlardaki fırsatlara da tek platformdan ulaşın."
  }
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-900 text-white overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <HeroScene />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl"
          >
            <span className="inline-block py-1 px-3 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-semibold mb-6 backdrop-blur-sm">
              B2B İş Ortaklığı Platformu
            </span>
            <h1 className="text-6xl md:text-8xl font-black text-white tracking-tighter mb-6 leading-[1.1]">
              İş Dünyasının <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-200 to-emerald-400 animate-gradient bg-300%">
                Yeni Boyutu
              </span>
            </h1>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed">
              Tedarikçileri bulun, iş ortakları edinin ve ticaret hacminizi büyütün.
              Güvenilir şirketlerle bağlantı kurmanın en hızlı yolu.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/search"
                className="w-full sm:w-auto px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-lg transition-all shadow-lg shadow-emerald-600/25 hover:shadow-emerald-600/40 flex items-center justify-center gap-2"
              >
                <Search className="w-5 h-5" />
                Partner Ara
              </Link>
              <Link
                to="/needs"
                className="w-full sm:w-auto px-8 py-4 bg-white/10 hover:bg-white/20 text-white border border-white/10 rounded-xl font-bold text-lg transition-all backdrop-blur-sm flex items-center justify-center gap-2"
              >
                <TrendingUp className="w-5 h-5" />
                Fırsatları Gör
              </Link>
            </div>
          </motion.div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-slate-900 to-transparent z-10" />
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-slate-900 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { label: "Aktif Şirket", value: "2,500+" },
              { label: "Günlük Eşleşme", value: "150+" },
              { label: "Sektör", value: "40+" },
              { label: "Ticaret Hacmi", value: "₺500M+" },
            ].map((stat, index) => (
              <div key={index} className="p-6 rounded-2xl bg-white/5 border border-white/5">
                <div className="text-3xl md:text-4xl font-bold text-white mb-2">{stat.value}</div>
                <div className="text-slate-400 text-sm uppercase tracking-wider">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-32 bg-slate-950 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">Neden Zincir?</h2>
            <p className="text-slate-400 max-w-2xl mx-auto text-lg">
              Geleneksel ticaretin zorluklarını modern teknoloji ile aşıyoruz.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {FEATURES.map((feature, index) => (
              <motion.div
                key={index}
                whileHover={{ y: -10 }}
                className="p-8 rounded-3xl bg-slate-900 border border-white/10 hover:border-emerald-500/30 transition-colors group"
              >
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-6 group-hover:bg-emerald-500/20 transition-colors">
                  <feature.icon className="w-7 h-7 text-emerald-400" />
                </div>
                <h3 className="text-xl font-bold mb-4 text-white">{feature.title}</h3>
                <p className="text-slate-400 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-slate-900/80 z-0" />
        <div className="absolute inset-0 bg-emerald-900/40 z-0 mix-blend-overlay" />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <h2 className="text-4xl md:text-6xl font-black mb-8 text-white drop-shadow-lg">
            Şirketinizi Büyütmeye <br /> Hazır Mısınız?
          </h2>
          <p className="text-xl text-slate-300 mb-12 max-w-2xl mx-auto">
            Hemen ücretsiz profilinizi oluşturun, binlerce potansiyel iş ortağına ulaşın.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              to="/register"
              className="px-10 py-5 bg-white text-slate-900 rounded-xl font-bold text-lg hover:bg-slate-100 transition-colors flex items-center justify-center gap-2"
            >
              <Building2 className="w-5 h-5" />
              Şirket Hesabı Oluştur
            </Link>
            <Link
              to="/login"
              className="px-10 py-5 bg-transparent border border-white/20 text-white rounded-xl font-bold text-lg hover:bg-white/10 transition-colors"
            >
              Giriş Yap
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
