import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Canvas } from '@react-three/fiber';
import { api } from '../lib/api';
import { Company, INDUSTRY_LABELS } from '../types';
import CompanyCard from '../components/CompanyCard';
import { Search as SearchIcon, Loader2, Filter, ShieldCheck, Sparkles, MapPin, Building2 } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { motion } from 'framer-motion';
import ShaderBackgroundVariants from '../components/ShaderBackgroundVariants';
import ShaderButton from '../components/ShaderButton';

const cities = [
  'İstanbul', 'Ankara', 'İzmir', 'Bursa', 'Antalya', 'Adana', 'Konya',
  'Gaziantep', 'Kayseri', 'Mersin', 'Denizli', 'Kocaeli', 'Eskişehir'
];

const capabilityHints = ['GOTS sertifikalı baskı', 'Same-day lojistik', 'Dijital pazarlama', 'Eco kumaş tedariki'];

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [companies, setCompanies] = useState<Company[]>([]);
  const [recommendations, setRecommendations] = useState<Company[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [filters, setFilters] = useState({
    industryType: '',
    city: '',
    companySize: '',
    capability: '',
    seekingPartners: true,
  });
  const [capabilityHintIndex] = useState(() => Math.floor(Math.random() * capabilityHints.length));
  const { user } = useAuthStore();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    if (user?.company?.id) {
      fetchRecommendations(user.company.id);
    }
  }, [user?.company?.id]);

  const fetchRecommendations = async (companyId: string) => {
    try {
      const { data } = await api.get('/search/recommendations', {
        params: { companyId },
      });
      setRecommendations(data);
    } catch (error) {
      // console.error('Öneriler alınamadı', error);
    }
  };

  const performSearch = async (overrideQuery?: string) => {
    setLoading(true);
    setSearched(true);

    try {
      const { data } = await api.get('/search', {
        params: {
          query: (overrideQuery ?? query) || undefined,
          limit: 24,
          industryType: filters.industryType || undefined,
          city: filters.city || undefined,
          companySize: filters.companySize || undefined,
          hasCapability: filters.capability || undefined,
          seekingPartners: filters.seekingPartners ? 'true' : undefined,
        },
      });
      setCompanies(data.companies);
    } catch (error) {
      // console.error('Arama hatası:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch();
  };

  useEffect(() => {
    const presetCompany = searchParams.get('company');
    if (presetCompany) {
      setQuery(presetCompany);
      performSearch(presetCompany);
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-slate-800 pb-20">
      {/* Header Section with Shader */}
      <div className="relative pt-24 pb-12 px-4 overflow-hidden">
        {/* Shader Background */}
        <div className="absolute inset-0 z-0">
          <Canvas camera={{ position: [0, 0, 1] }}>
            <ShaderBackgroundVariants variant="interactive" />
          </Canvas>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row justify-between items-end gap-6"
          >
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-semibold mb-4 backdrop-blur-sm">
                <ShieldCheck className="w-4 h-4" /> Zincir Matchmaking
              </div>
              <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-4 text-white">
                İş Ortağını <span className="text-gradient">Bul</span>
              </h1>
              <p className="text-lg text-slate-300 max-w-2xl">
                Akıllı filtreler ve yapay zeka destekli önerilerle en doğru partneri keşfedin.
              </p>
            </div>

            <div className="flex gap-4 text-sm text-slate-400">
              <div className="flex items-center gap-2 glass-panel px-4 py-2">
                <Sparkles className="w-4 h-4 text-emerald-400" /> Akıllı Öneriler
              </div>
              <div className="flex items-center gap-2 glass-panel px-4 py-2">
                <Filter className="w-4 h-4 text-emerald-400" /> Detaylı Filtre
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
        <div className="glass-panel dither-border p-6 mb-10 glow-emerald">
          <form onSubmit={handleSearch} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr,auto] gap-4">
              <div className="relative">
                <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-400" />
                <input
                  type="text"
                  className="input w-full pl-12 text-lg"
                  placeholder="Ne arıyorsunuz? (Örn: organik baskı, lojistik, ambalaj)"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>
              <ShaderButton type="submit" variant="primary" size="lg">
                Ara
              </ShaderButton>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-emerald-400 uppercase tracking-wider ml-1">Sektör</label>
                <div className="relative">
                  <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <select
                    className="input w-full pl-10 pr-8 appearance-none"
                    value={filters.industryType}
                    onChange={(e) => setFilters({ ...filters, industryType: e.target.value })}
                  >
                    <option value="">Tüm Sektörler</option>
                    {Object.entries(INDUSTRY_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-emerald-400 uppercase tracking-wider ml-1">Şehir</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <select
                    className="input w-full pl-10 pr-8 appearance-none"
                    value={filters.city}
                    onChange={(e) => setFilters({ ...filters, city: e.target.value })}
                  >
                    <option value="">Tüm Şehirler</option>
                    {cities.map((city) => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-emerald-400 uppercase tracking-wider ml-1">Yetkinlik</label>
                <input
                  type="text"
                  className="input w-full"
                  placeholder={capabilityHints[capabilityHintIndex]}
                  value={filters.capability}
                  onChange={(e) => setFilters({ ...filters, capability: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-emerald-400 uppercase tracking-wider ml-1">Partner Arayanlar</label>
                <button
                  type="button"
                  onClick={() => setFilters({ ...filters, seekingPartners: !filters.seekingPartners })}
                  className={`w-full h-[46px] px-4 rounded-xl flex items-center justify-between border transition-all ${filters.seekingPartners
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                    : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                    }`}
                >
                  <span className="text-sm font-medium">Sadece Arayanlar</span>
                  <div className={`w-10 h-6 rounded-full relative transition-colors ${filters.seekingPartners ? 'bg-emerald-500' : 'bg-slate-600'}`}>
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${filters.seekingPartners ? 'left-5' : 'left-1'}`} />
                  </div>
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Results */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-emerald-500" />
          </div>
        ) : (
          <div className="space-y-12">
            {searched && companies.length === 0 ? (
              <div className="text-center py-20 glass-panel">
                <SearchIcon className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white">Sonuç Bulunamadı</h3>
                <p className="text-slate-400 mt-2">Arama kriterlerinizi değiştirerek tekrar deneyin.</p>
              </div>
            ) : searched && companies.length > 0 && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-white">Arama Sonuçları ({companies.length})</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {companies.map((company, index) => (
                    <motion.div
                      key={company.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <CompanyCard company={company} />
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommendations */}
            {!searched && recommendations.length > 0 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                    <Sparkles className="w-6 h-6 text-emerald-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-white">Size Özel Öneriler</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {recommendations.map((company, index) => (
                    <motion.div
                      key={company.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <CompanyCard company={company} />
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
