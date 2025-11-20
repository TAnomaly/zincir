import { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { api } from '../lib/api';
import { Company, INDUSTRY_LABELS } from '../types';
import CompanyCard from '../components/CompanyCard';
import { Loader2, Building2, Filter, Search, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import ShaderBackgroundVariants from '../components/ShaderBackgroundVariants';
import ShaderButton from '../components/ShaderButton';

const cities = [
  'İstanbul', 'Ankara', 'İzmir', 'Bursa', 'Antalya', 'Adana', 'Konya',
  'Gaziantep', 'Kayseri', 'Mersin', 'Denizli', 'Kocaeli', 'Eskişehir'
];

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    industryType: '',
    city: '',
    companySize: '',
    search: '',
    seekingPartners: true,
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    pages: 0,
  });

  useEffect(() => {
    fetchCompanies();
  }, [filters, pagination.page]);

  const fetchCompanies = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/companies', {
        params: {
          page: pagination.page,
          limit: pagination.limit,
          industryType: filters.industryType || undefined,
          city: filters.city || undefined,
          companySize: filters.companySize || undefined,
          search: filters.search || undefined,
          seekingPartners: filters.seekingPartners ? 'true' : undefined,
        },
      });
      setCompanies(data.companies);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Şirketler yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-800 pb-20">
      {/* Header Section with Shader */}
      <div className="relative pt-24 pb-12 px-4 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Canvas camera={{ position: [0, 0, 1] }}>
            <ShaderBackgroundVariants variant="accent" />
          </Canvas>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row justify-between items-end gap-6"
          >
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-bold mb-4 backdrop-blur-sm">
                <Building2 className="w-4 h-4" /> Zincir Atlası
              </div>
              <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-4 text-white">
                İş Ortaklarını <span className="text-gradient">Keşfet</span>
              </h1>
              <p className="text-lg text-slate-300 max-w-2xl">
                Sektörün önde gelen firmalarıyla bağlantı kurun, tedarik ağınızı genişletin.
              </p>
            </div>

            <div className="flex gap-6 text-sm text-slate-400 glass-panel p-4">
              <div className="flex flex-col">
                <span className="text-2xl font-bold text-white">500+</span>
                <span>Doğrulanmış Şirket</span>
              </div>
              <div className="w-px bg-white/10" />
              <div className="flex flex-col">
                <span className="text-2xl font-bold text-white">40+</span>
                <span>Farklı Sektör</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
        <div className="glass-panel dither-border p-6 mb-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-4 lg:col-span-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-400" />
              <input
                type="text"
                className="input w-full pl-12"
                placeholder="Şirket adı ara..."
                value={filters.search}
                onChange={(e) => {
                  setFilters({ ...filters, search: e.target.value });
                  setPagination({ ...pagination, page: 1 });
                }}
              />
            </div>

            <div className="relative">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <select
                className="input w-full pl-10 pr-8 appearance-none"
                value={filters.industryType}
                onChange={(e) => {
                  setFilters({ ...filters, industryType: e.target.value });
                  setPagination({ ...pagination, page: 1 });
                }}
              >
                <option value="">Tüm Sektörler</option>
                {Object.entries(INDUSTRY_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>

            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <select
                className="input w-full pl-10 pr-8 appearance-none"
                value={filters.city}
                onChange={(e) => {
                  setFilters({ ...filters, city: e.target.value });
                  setPagination({ ...pagination, page: 1 });
                }}
              >
                <option value="">Tüm Şehirler</option>
                {cities.map((city) => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>

            <button
              onClick={() => {
                setFilters({ ...filters, seekingPartners: !filters.seekingPartners });
                setPagination({ ...pagination, page: 1 });
              }}
              className={`flex items-center justify-between px-4 py-3 rounded-xl border transition-all ${filters.seekingPartners
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                }`}
            >
              <span className="text-sm font-medium">Partner Arayanlar</span>
              <div className={`w-10 h-6 rounded-full relative transition-colors ${filters.seekingPartners ? 'bg-emerald-500' : 'bg-slate-600'}`}>
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${filters.seekingPartners ? 'left-5' : 'left-1'}`} />
              </div>
            </button>
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-emerald-500" />
          </div>
        ) : companies.length === 0 ? (
          <div className="text-center py-20 glass-panel">
            <Building2 className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white">Sonuç Bulunamadı</h3>
            <p className="text-slate-400 mt-2">Arama kriterlerinizi değiştirerek tekrar deneyin.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
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

            {pagination.pages > 1 && (
              <div className="flex justify-center gap-2">
                <ShaderButton
                  variant="secondary"
                  size="md"
                  onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                  disabled={pagination.page === 1}
                >
                  Önceki
                </ShaderButton>
                <span className="flex items-center px-6 font-medium text-white glass-panel">
                  {pagination.page} / {pagination.pages}
                </span>
                <ShaderButton
                  variant="secondary"
                  size="md"
                  onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                  disabled={pagination.page === pagination.pages}
                >
                  Sonraki
                </ShaderButton>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
