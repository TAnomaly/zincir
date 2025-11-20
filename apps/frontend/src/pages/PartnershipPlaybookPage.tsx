import { Link } from 'react-router-dom';
import { Check, Zap, Target, TrendingUp } from 'lucide-react';
import { Canvas } from '@react-three/fiber';
import { motion } from 'framer-motion';
import OptimizedShaderBackground from '../components/OptimizedShaderBackground';
import AnimatedCard from '../components/AnimatedCard';
import ShaderButton from '../components/ShaderButton';

export default function PartnershipPlaybookPage() {
  const steps = [
    {
      title: 'Profil Oluşturun',
      description: 'Şirketinizi en iyi şekilde tanıtacak detaylı bir profil oluşturun.',
      icon: Target,
      tips: ['Şirket bilgilerinizi eksiksiz doldurun', 'Görsellerinizi yükleyin', 'Hizmetlerinizi tanımlayın']
    },
    {
      title: 'Hedef Belirleyin',
      description: 'İş ortaklığı hedeflerinizi net bir şekilde belirleyin.',
      icon: Zap,
      tips: ['Partner kriterlerinizi tanımlayın', 'İhtiyaçlarınızı listeleyin', 'Beklentilerinizi açıkça belirtin']
    },
    {
      title: 'Ağınızı Genişletin',
      description: 'Potansiyel partnerlerle bağlantı kurmaya başlayın.',
      icon: TrendingUp,
      tips: ['Aktif olarak arama yapın', 'Mesajlaşmaya başlayın', 'İlişkilerinizi güçlendirin']
    },
  ];

  return (
    <div className="min-h-screen bg-slate-800">
      {/* Hero */}
      <div className="relative pt-24 pb-16 px-4 overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-30">
          <Canvas camera={{ position: [0, 0, 1] }}>
            <OptimizedShaderBackground variant="hero" />
          </Canvas>
        </div>

        <div className="max-w-4xl mx-auto relative z-10 text-center">
          <h1 className="text-5xl md:text-6xl font-black text-white mb-4">
            İş Ortaklığı <span className="text-gradient">Rehberi</span>
          </h1>
          <p className="text-xl text-slate-200">
            Zincir platformunda başarılı iş ortaklıkları kurmanın yolları
          </p>
        </div>
      </div>

      {/* Steps */}
      <div className="max-w-5xl mx-auto px-4 pb-20">
        <div className="space-y-8">
          {steps.map((step, i) => (
            <AnimatedCard key={step.title} delay={i * 0.1}>
              <div className="flex items-start gap-6">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-emerald-500/10 rounded-xl flex items-center justify-center">
                    <step.icon className="w-8 h-8 text-emerald-400" />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-4xl font-black text-emerald-500/20">{i + 1}</span>
                    <h3 className="text-2xl font-bold text-white">{step.title}</h3>
                  </div>
                  <p className="text-slate-300 mb-4">{step.description}</p>
                  <ul className="space-y-2">
                    {step.tips.map((tip) => (
                      <li key={tip} className="flex items-start gap-2 text-slate-400">
                        <Check className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </AnimatedCard>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link to="/register">
            <ShaderButton variant="primary" size="lg">
              Hemen Başlayın
            </ShaderButton>
          </Link>
        </div>
      </div>
    </div>
  );
}
