import { Link } from 'react-router-dom';
import { Canvas } from '@react-three/fiber';
import {
  ShieldCheck,
  Zap,
  Globe,
  MessageSquare,
  FileCheck,
  BarChart3,
  Smartphone,
  Headphones
} from 'lucide-react';
import { motion } from 'framer-motion';
import ShaderBackgroundVariants from '../components/ShaderBackgroundVariants';
import AnimatedCard from '../components/AnimatedCard';
import ShaderButton from '../components/ShaderButton';

const FEATURES = [
  {
    title: 'Güvenli Ticaret Ağı',
    icon: ShieldCheck,
    description: 'Tüm üyeler vergi levhası ve ticari sicil kontrolünden geçer. Sadece doğrulanmış şirketlerle ticaret yaparsınız.',
    color: 'text-emerald-400',
  },
  {
    title: 'Akıllı Eşleştirme',
    icon: Zap,
    description: 'Yapay zeka algoritmamız, sektörünüz ve ihtiyaçlarınıza en uygun iş ortaklarını size otomatik olarak önerir.',
    color: 'text-amber-400',
  },
  {
    title: 'Global Pazar Erişimi',
    icon: Globe,
    description: 'Sadece yerel değil, uluslararası pazarlardaki fırsatlara da tek platformdan ulaşın ve ihracatınızı artırın.',
    color: 'text-cyan-400',
  },
  {
    title: 'Onaylı Tedarikçiler',
    icon: FileCheck,
    description: 'Sertifikaları ve referansları kontrol edilmiş tedarikçi havuzundan dilediğinizle hemen çalışmaya başlayın.',
    color: 'text-purple-400',
  },
  {
    title: 'Anlık İletişim',
    icon: MessageSquare,
    description: 'Potansiyel ortaklarınızla platform üzerinden güvenli ve hızlı bir şekilde mesajlaşın, dosya paylaşın.',
    color: 'text-pink-400',
  },
  {
    title: 'Gelişmiş Analitik',
    icon: BarChart3,
    description: 'Profilinizin performansını, görüntülenme sayılarını ve etkileşim oranlarını detaylı grafiklerle takip edin.',
    color: 'text-indigo-400',
  }
];

export default function PlatformPage() {
  return (
    <div className="min-h-screen bg-slate-800">
      {/* Hero Section with Shader */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Canvas camera={{ position: [0, 0, 1] }}>
            <ShaderBackgroundVariants variant="hero" />
          </Canvas>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block py-1 px-3 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-semibold mb-6 backdrop-blur-sm">
              Zincir Platform Özellikleri
            </span>
            <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-6 text-white">
              İşinizi Büyütmek İçin <br />
              <span className="text-gradient">
                İhtiyacınız Olan Her Şey
              </span>
            </h1>
            <p className="text-xl text-slate-200 max-w-2xl mx-auto mb-10 leading-relaxed">
              Zincir, şirketlerin birbirini bulmasını, güvenle ticaret yapmasını ve büyümesini sağlayan
              yeni nesil B2B iş ortaklığı platformudur.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/register">
                <ShaderButton variant="primary" size="lg">
                  Hemen Başlayın
                </ShaderButton>
              </Link>
              <Link to="/contact">
                <ShaderButton variant="secondary" size="lg">
                  Bize Ulaşın
                </ShaderButton>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-black text-white mb-4">Neden Zincir'i Tercih Etmelisiniz?</h2>
          <p className="text-slate-300 max-w-2xl mx-auto text-lg">
            Geleneksel ticaretin zorluklarını teknoloji ile aşıyor, size zaman ve maliyet avantajı sağlıyoruz.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {FEATURES.map((feature, index) => (
            <AnimatedCard key={feature.title} delay={index * 0.1}>
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-white/5">
                  <feature.icon className={`w-7 h-7 ${feature.color}`} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                  <p className="text-slate-300 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            </AnimatedCard>
          ))}
        </div>
      </section>

      {/* Stats / Trust Section with Shader */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-40">
          <Canvas camera={{ position: [0, 0, 1] }}>
            <ShaderBackgroundVariants variant="accent" />
          </Canvas>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-black mb-6 text-white">
                Binlerce Şirketin <br />
                <span className="text-gradient">Güvenilir Tercihi</span>
              </h2>
              <p className="text-slate-200 text-lg mb-8 leading-relaxed">
                Zincir platformu üzerinden her gün yüzlerce yeni iş bağlantısı kuruluyor.
                Sektörün önde gelen firmaları tedarik süreçlerini ve partner arayışlarını
                Zincir üzerinden yönetiyor.
              </p>
              <ul className="space-y-4">
                {[
                  'Onaylanmış Kurumsal Profiller',
                  'KVKK Uyumlu Veri Güvenliği',
                  '7/24 Canlı Destek',
                  'Ücretsiz Temel Üyelik'
                ].map((item, i) => (
                  <motion.li
                    key={item}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-center gap-3 text-slate-100"
                  >
                    <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                      <ShieldCheck className="w-5 h-5 text-emerald-400" />
                    </div>
                    <span className="font-semibold">{item}</span>
                  </motion.li>
                ))}
              </ul>
            </div>
            <div className="grid grid-cols-2 gap-6">
              {[
                { value: '2.5K+', label: 'Aktif Şirket' },
                { value: '₺500M+', label: 'Ticaret Hacmi' },
                { value: '40+', label: 'Farklı Sektör' },
                { value: '%98', label: 'Müşteri Memnuniyeti' }
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, type: 'spring' }}
                  className={`glass-panel p-6 text-center ${i % 2 === 1 ? 'mt-8' : ''}`}
                >
                  <div className="text-4xl font-black text-white mb-2">{stat.value}</div>
                  <div className="text-sm text-emerald-400 font-bold uppercase tracking-wider">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Mobile App CTA */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-panel p-12 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-12 dither-border">
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

          <div className="relative z-10 max-w-xl">
            <h2 className="text-3xl md:text-4xl font-black text-white mb-6">
              İşiniz Her An Yanınızda
            </h2>
            <p className="text-slate-200 text-lg mb-8 leading-relaxed">
              Zincir mobil uygulaması ile teklifleri cebinizden yönetin, mesajlara anında cevap verin
              ve hiçbir fırsatı kaçırmayın. Çok yakında App Store ve Google Play'de.
            </p>
            <div className="flex gap-4">
              <ShaderButton variant="primary" size="md">
                <Smartphone className="w-5 h-5" />
                Mobil Uygulama
              </ShaderButton>
              <ShaderButton variant="secondary" size="md">
                <Headphones className="w-5 h-5" />
                Destek Alın
              </ShaderButton>
            </div>
          </div>

          <div className="relative z-10">
            <div className="w-64 h-64 rounded-full flex items-center justify-center border-4 border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 backdrop-blur-sm">
              <Smartphone className="w-32 h-32 text-emerald-400/70" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
