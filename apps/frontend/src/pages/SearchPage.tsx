import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../lib/api';
import { Company, INDUSTRY_LABELS, COMPANY_SIZE_LABELS } from '../types';
import CompanyCard from '../components/CompanyCard';
import { Search as SearchIcon, Loader2, Filter, ShieldCheck, Sparkles, RefreshCw, MapPin, Building2 } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { motion } from 'framer-motion';

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
      console.error('Öneriler alınamadı', error);
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
      console.error('Arama hatası:', error);
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
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header Section */}
      <div className="bg-slate-900 text-white pt-24 pb-12 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-emerald-900/40 via-slate-900 to-slate-900" />
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
              <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4">
                İş Ortağını <span className="text-emerald-500">Bul</span>
              </h1>
              <p className="text-lg text-slate-400 max-w-2xl">
                Akıllı filtreler ve yapay zeka destekli önerilerle en doğru partneri keşfedin.
              </p>
            </div>

            <div className="flex gap-4 text-sm text-slate-400">
              <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-xl border border-white/10 backdrop-blur-sm">
                <Sparkles className="w-4 h-4 text-emerald-400" /> Akıllı Öneriler
              </div>
              <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-xl border border-white/10 backdrop-blur-sm">
                <Filter className="w-4 h-4 text-emerald-400" /> Detaylı Filtre
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
        <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 p-6 mb-10">
          <form onSubmit={handleSearch} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr,auto] gap-4">
              <div className="relative">
                <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-lg"
                  placeholder="Ne arıyorsunuz? (Örn: organik baskı, lojistik, ambalaj)"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>
              <button type="submit" className="btn btn-primary px-8 py-4 text-lg shadow-lg shadow-emerald-600/20">
                Ara
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Sektör</label>
                <div className="relative">
                  <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <select
                    className="w-full pl-10 pr-8 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 appearance-none transition-all"
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
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Şehir</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <select
                    className="w-full pl-10 pr-8 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 appearance-none transition-all"
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
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Yetkinlik</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                  placeholder={capabilityHints[capabilityHintIndex]}
                  value={filters.capability}
                  onChange={(e) => setFilters({ ...filters, capability: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Partner Arayanlar</label>
                <button
                  type="button"
                  onClick={() => setFilters({ ...filters, seekingPartners: !filters.seekingPartners })}
                  className={`w-full h-[46px] px-4 rounded-xl flex items-center justify-between border transition-all ${filters.seekingPartners
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                >
                  <span className="text-sm font-medium">Sadece Arayanlar</span>
                  <div className={`w-10 h-6 rounded-full relative transition-colors ${filters.seekingPartners ? 'bg-emerald-500' : 'bg-slate-300'}`}>
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
            <Loader2 className="w-10 h-10 animate-spin text-emerald-600" />
          </div>
        ) : (
          <div className="space-y-12">
            {searched && companies.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm">
                <SearchIcon className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-slate-900">Sonuç Bulunamadı</h3>
                <p className="text-slate-500 mt-2">Arama kriterlerinizi değiştirerek tekrar deneyin.</p>
              </div>
            ) : searched && companies.length > 0 && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-slate-900">Arama Sonuçları ({companies.length})</h2>
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
                  <div className="p-2 bg-emerald-100 rounded-lg">
                    <Sparkles className="w-5 h-5 text-emerald-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900">Size Özel Öneriler</h2>
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
