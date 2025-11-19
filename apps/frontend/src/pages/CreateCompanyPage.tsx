import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { IndustryType, CompanySize, INDUSTRY_LABELS, COMPANY_SIZE_LABELS } from '../types';
import {
  Building2, ShieldCheck, Users, Link2, CheckCircle2,
  ImageIcon, X, ChevronRight, AlertCircle
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { motion } from 'framer-motion';

const TRUST_STATS = [
  { label: 'Doğrulanmış şirket', value: '500+' },
  { label: 'Kurulan partnerlik', value: '1.200+' },
  { label: 'Sektör', value: '25+' },
];

const ALLIANCE_BENEFITS = [
  'Doğrulanmış tedarik ve hizmet ağında görünür olun',
  'Finansal güven modülleriyle sözleşmelerinizi kayıt altına alın',
  'Akıllı eşleştirme ile aradığınız kapasiteye saniyeler içinde ulaşın',
];

const cities = [
  'İstanbul', 'Ankara', 'İzmir', 'Bursa', 'Antalya', 'Adana', 'Konya',
  'Gaziantep', 'Kayseri', 'Mersin', 'Denizli', 'Kocaeli', 'Eskişehir'
];

export default function CreateCompanyPage() {
  const navigate = useNavigate();
  const refreshUser = useAuthStore((state) => state.refreshUser);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    phone: '',
    email: '',
    website: '',
    address: '',
    city: '',
    district: '',
    industryType: '' as IndustryType,
    companySize: '' as CompanySize,
    foundedYear: '',
    logo: '',
    coverImage: '',
    seekingPartners: true,
    partnerCriteria: '',
  });

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const data = new FormData();
    data.append('file', file);

    try {
      const res = await api.post('/upload', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setFormData({ ...formData, logo: res.data.url });
    } catch (err) {
      alert('Logo yüklenirken bir hata oluştu.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const payload = {
        ...formData,
        foundedYear: formData.foundedYear ? parseInt(formData.foundedYear) : undefined,
      };
      const { data } = await api.post('/companies', payload);
      await refreshUser();
      navigate(`/companies/${data.company.slug}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Bir hata oluştu');
      setLoading(false);
      window.scrollTo(0, 0);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-20">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <div className="rounded-3xl bg-slate-900 text-white p-10 md:p-16 shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-emerald-900/40 via-slate-900 to-slate-900" />
          <div className="relative z-10 flex flex-col lg:flex-row gap-12 items-center">
            <div className="flex-1 space-y-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-semibold backdrop-blur-sm"
              >
                <ShieldCheck className="w-4 h-4" /> Doğrulanmış İş Ağı
              </motion.div>
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-4xl md:text-6xl font-black leading-tight tracking-tight"
              >
                Şirketinizi <span className="text-emerald-500">Zincir</span>'e Taşıyın
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-slate-300 text-lg max-w-2xl leading-relaxed"
              >
                Tekstil, baskı, lojistik, ambalaj ve 20+ sektörde güvenilir partnerlerle eşleşin.
                Finansal güven, teminat ve bağlantı yönetimi tek panelde.
              </motion.p>
              <motion.ul
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="space-y-3 text-slate-300"
              >
                {ALLIANCE_BENEFITS.map((benefit) => (
                  <li key={benefit} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    </div>
                    {benefit}
                  </li>
                ))}
              </motion.ul>
            </div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full lg:w-auto"
            >
              {TRUST_STATS.map((stat) => (
                <div key={stat.label} className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 text-center hover:bg-white/10 transition-colors">
                  <p className="text-3xl font-black text-white mb-1">{stat.value}</p>
                  <p className="text-xs uppercase tracking-wider text-emerald-400 font-bold">{stat.label}</p>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-[350px_1fr] gap-8">
          {/* Sidebar Info */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center">
                  <Users className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Ağ Standartları</h2>
                  <p className="text-xs text-slate-500">Güvenilir profiller, şeffaf bilgiler</p>
                </div>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">
                Zincir, yazılım katalogları değil; finansman, üretim ve dağıtım partnerlerini öncelikli tutan bir iş ağıdır.
                Şirket detaylarınız doğruluk açısından kontrol edilir.
              </p>
            </div>

            <div className="bg-emerald-900 rounded-2xl p-6 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/20 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
              <h3 className="text-lg font-bold mb-4 relative z-10">İpuçları</h3>
              <div className="space-y-4 relative z-10">
                <div className="flex gap-3 text-sm text-emerald-100">
                  <Building2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                  <p>Profilinizde üretim kapasitesi ve teslim sürelerini belirtin.</p>
                </div>
                <div className="flex gap-3 text-sm text-emerald-100">
                  <Link2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                  <p>Partner kriterlerinizi net bir şekilde yazın.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 p-8 md:p-10"
          >
            <div className="flex items-center gap-4 mb-8">
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-600">
                <Building2 className="w-7 h-7" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Şirket Profilini Oluştur</h2>
                <p className="text-slate-500">Görünürlüğe açılmadan önce bilgilerinizi doldurun</p>
              </div>
            </div>

            {error && (
              <div className="mb-8 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center gap-3">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-10">
              {/* Logo Upload */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2">Logo & Görsel</h3>
                <div className="flex items-center gap-6">
                  <div className="relative group">
                    <div className={`w-32 h-32 rounded-2xl border-2 border-dashed flex items-center justify-center overflow-hidden transition-colors ${formData.logo ? 'border-emerald-500 bg-white' : 'border-slate-300 bg-slate-50 group-hover:border-emerald-400'}`}>
                      {formData.logo ? (
                        <img src={formData.logo} alt="Logo" className="w-full h-full object-cover" />
                      ) : (
                        <div className="text-center p-4">
                          <ImageIcon className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                          <span className="text-xs text-slate-500 font-medium">Logo Yükle</span>
                        </div>
                      )}
                    </div>
                    {formData.logo && (
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, logo: '' })}
                        className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full shadow-md hover:bg-red-600 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-900">Şirket Logosu</p>
                    <p className="text-sm text-slate-500 mt-1">
                      JPG, PNG veya WEBP formatında, maksimum 5MB.
                      <br />
                      Şirketinizin tanınabilirliği için önemlidir.
                    </p>
                  </div>
                </div>
              </div>

              {/* Basic Info */}
              <div className="space-y-6">
                <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2">Temel Bilgiler</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="label">Şirket Adı *</label>
                    <input
                      type="text"
                      required
                      className="input"
                      placeholder="Örn: Zincir Teknoloji A.Ş."
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="label">Açıklama *</label>
                    <textarea
                      required
                      rows={4}
                      className="input"
                      placeholder="Şirketinizi, faaliyet alanlarınızı ve güçlü yönlerinizi anlatın..."
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="label">Sektör *</label>
                    <select
                      required
                      className="input"
                      value={formData.industryType}
                      onChange={(e) => setFormData({ ...formData, industryType: e.target.value as IndustryType })}
                    >
                      <option value="">Seçiniz</option>
                      {Object.entries(INDUSTRY_LABELS).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="label">Firma Büyüklüğü *</label>
                    <select
                      required
                      className="input"
                      value={formData.companySize}
                      onChange={(e) => setFormData({ ...formData, companySize: e.target.value as CompanySize })}
                    >
                      <option value="">Seçiniz</option>
                      {Object.entries(COMPANY_SIZE_LABELS).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="label">Kuruluş Yılı</label>
                    <input
                      type="number"
                      min="1900"
                      max={new Date().getFullYear()}
                      className="input"
                      placeholder="2023"
                      value={formData.foundedYear}
                      onChange={(e) => setFormData({ ...formData, foundedYear: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="label">Website</label>
                    <input
                      type="url"
                      className="input"
                      placeholder="https://..."
                      value={formData.website}
                      onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Contact Info */}
              <div className="space-y-6">
                <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2">İletişim Bilgileri</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="label">Telefon *</label>
                    <input
                      type="tel"
                      required
                      className="input"
                      placeholder="0212 123 45 67"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="label">E-posta *</label>
                    <input
                      type="email"
                      required
                      className="input"
                      placeholder="info@sirket.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="label">Adres *</label>
                    <input
                      type="text"
                      required
                      className="input"
                      placeholder="Tam adresiniz"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="label">Şehir *</label>
                    <select
                      required
                      className="input"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    >
                      <option value="">Seçiniz</option>
                      {cities.map((city) => (
                        <option key={city} value={city}>{city}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="label">İlçe</label>
                    <input
                      type="text"
                      className="input"
                      placeholder="İlçe"
                      value={formData.district}
                      onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Partnership Preferences */}
              <div className="space-y-6">
                <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2">İş Ortaklığı</h3>
                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <p className="font-bold text-slate-900">İş ortağı arayışını aç</p>
                      <p className="text-sm text-slate-600">Profiliniz Zincir eşleştirme akışında ve aramalarda öne çıkar.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, seekingPartners: !formData.seekingPartners })}
                      className={`w-14 h-8 rounded-full transition-all flex items-center px-1 ${formData.seekingPartners ? 'bg-emerald-500 justify-end' : 'bg-slate-300 justify-start'
                        }`}
                    >
                      <span className="w-6 h-6 bg-white rounded-full shadow-sm" />
                    </button>
                  </div>

                  <div className={`transition-all duration-300 ${formData.seekingPartners ? 'opacity-100 max-h-96' : 'opacity-50 max-h-96 grayscale'}`}>
                    <label className="label">Partner Kriterleri</label>
                    <textarea
                      rows={3}
                      className="input bg-white"
                      placeholder="Nasıl partnerler arıyorsunuz? (Örn: Yüksek kapasiteli üretim, ihracat tecrübesi...)"
                      value={formData.partnerCriteria}
                      onChange={(e) => setFormData({ ...formData, partnerCriteria: e.target.value })}
                      disabled={!formData.seekingPartners}
                    />
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center gap-6">
                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary w-full sm:w-auto px-10 py-4 text-lg shadow-xl shadow-emerald-600/20"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Kaydediliyor...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      Profili Yayına Al <ChevronRight className="w-5 h-5" />
                    </span>
                  )}
                </button>
                <p className="text-sm text-slate-500 text-center sm:text-left">
                  Devam ederek <a href="#" className="text-emerald-600 hover:underline">Kullanım Koşulları</a>'nı kabul etmiş olursunuz.
                </p>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
