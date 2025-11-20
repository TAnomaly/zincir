import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ShieldCheck, Globe, Zap,
  Building2, Search, TrendingUp
} from 'lucide-react';
import { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, PerspectiveCamera, Environment, Stars, Html } from '@react-three/drei';
import * as THREE from 'three';

// Türkiye'deki önemli şehirler ve koordinatları
const TURKEY_CITIES = [
  { name: 'İstanbul', lat: 41.0082, lon: 28.9784, companies: 156 },
  { name: 'Ankara', lat: 39.9334, lon: 32.8597, companies: 89 },
  { name: 'İzmir', lat: 38.4237, lon: 27.1428, companies: 67 },
  { name: 'Bursa', lat: 40.1826, lon: 29.0665, companies: 45 },
  { name: 'Antalya', lat: 36.8969, lon: 30.7133, companies: 34 },
  { name: 'Adana', lat: 37.0000, lon: 35.3213, companies: 28 },
  { name: 'Konya', lat: 37.8746, lon: 32.4932, companies: 24 },
  { name: 'Gaziantep', lat: 37.0662, lon: 37.3833, companies: 22 },
  { name: 'Kayseri', lat: 38.7205, lon: 35.4826, companies: 18 },
  { name: 'Mersin', lat: 36.8121, lon: 34.6415, companies: 16 },
];

// Lat/Lon'u 3D küre koordinatlarına çevir
function latLonToVector3(lat: number, lon: number, radius: number) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);

  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);

  return new THREE.Vector3(x, y, z);
}

// Şirket işareti (küçük bina gibi)
function CompanyMarker({ position, city, isHovered, onHover }: any) {
  const meshRef = useRef<THREE.Group>(null!);

  useFrame((state) => {
    if (meshRef.current && isHovered) {
      meshRef.current.scale.lerp(new THREE.Vector3(1.5, 1.5, 1.5), 0.1);
    } else if (meshRef.current) {
      meshRef.current.scale.lerp(new THREE.Vector3(1, 1, 1), 0.1);
    }
  });

  return (
    <group ref={meshRef} position={position}>
      {/* Ana bina gövdesi */}
      <mesh
        onPointerEnter={() => onHover(city)}
        onPointerLeave={() => onHover(null)}
      >
        <boxGeometry args={[0.08, 0.15, 0.08]} />
        <meshStandardMaterial
          color="#10b981"
          emissive="#10b981"
          emissiveIntensity={isHovered ? 0.8 : 0.3}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>

      {/* Bina çatısı */}
      <mesh position={[0, 0.09, 0]}>
        <coneGeometry args={[0.06, 0.08, 4]} />
        <meshStandardMaterial
          color="#059669"
          emissive="#059669"
          emissiveIntensity={isHovered ? 0.6 : 0.2}
        />
      </mesh>

      {/* Parlayan halka efekti */}
      {isHovered && (
        <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, -0.08, 0]}>
          <ringGeometry args={[0.12, 0.15, 32]} />
          <meshBasicMaterial color="#10b981" transparent opacity={0.6} />
        </mesh>
      )}

      {/* Hover bilgi etiketi */}
      {isHovered && (
        <Html distanceFactor={10}>
          <div className="bg-slate-900/95 border border-emerald-500/50 rounded-lg px-3 py-2 text-white shadow-xl backdrop-blur-sm">
            <div className="font-bold text-sm">{city.name}</div>
            <div className="text-emerald-400 text-xs">{city.companies} Aktif Şirket</div>
          </div>
        </Html>
      )}
    </group>
  );
}

// 3D Dünya küresi
function WorldGlobe() {
  const globeRef = useRef<THREE.Mesh>(null!);
  const [hoveredCity, setHoveredCity] = useState<any>(null);

  useFrame((state) => {
    if (globeRef.current) {
      globeRef.current.rotation.y = state.clock.getElapsedTime() * 0.05;
    }
  });

  return (
    <group>
      {/* Ana küre */}
      <mesh ref={globeRef}>
        <sphereGeometry args={[5, 64, 64]} />
        <meshStandardMaterial
          color="#0f172a"
          wireframe={false}
          transparent
          opacity={0.6}
          emissive="#1e293b"
          emissiveIntensity={0.2}
        />
      </mesh>

      {/* Wireframe overlay */}
      <mesh>
        <sphereGeometry args={[5.02, 32, 32]} />
        <meshBasicMaterial
          color="#10b981"
          wireframe
          transparent
          opacity={0.15}
        />
      </mesh>

      {/* Şehir işaretleri */}
      {TURKEY_CITIES.map((city) => {
        const position = latLonToVector3(city.lat, city.lon, 5.15);
        return (
          <CompanyMarker
            key={city.name}
            position={position}
            city={city}
            isHovered={hoveredCity?.name === city.name}
            onHover={setHoveredCity}
          />
        );
      })}

      {/* Parıldayan partiküller */}
      <Float speed={2} rotationIntensity={0.3} floatIntensity={0.5}>
        <points>
          <sphereGeometry args={[5.5, 64, 64]} />
          <pointsMaterial
            size={0.02}
            color="#10b981"
            transparent
            opacity={0.4}
            sizeAttenuation
          />
        </points>
      </Float>
    </group>
  );
}

// Ana 3D sahne
function HeroScene() {
  return (
    <div className="absolute inset-0 z-0">
      <Canvas>
        <PerspectiveCamera makeDefault position={[0, 0, 15]} />
        <ambientLight intensity={0.3} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#10b981" />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#3b82f6" />
        <spotLight position={[0, 15, 0]} angle={0.3} intensity={0.5} color="#10b981" />

        <WorldGlobe />

        <Stars
          radius={100}
          depth={50}
          count={5000}
          factor={4}
          saturation={0}
          fade
          speed={1}
        />
        <Environment preset="night" />
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
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
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
