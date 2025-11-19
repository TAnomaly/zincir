import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../lib/api';
import { useAuthStore } from '../store/authStore';
import { Company, INDUSTRY_LABELS, COMPANY_SIZE_LABELS, Product } from '../types';
import {
  Building2, MapPin, Phone, Mail, Globe, Calendar,
  Link as LinkIcon, Loader2, Award, Briefcase, Star, Package,
  CheckCircle2, ArrowRight, ShieldCheck, Users
} from 'lucide-react';
import ProductCard from '../components/ProductCard';

export default function CompanyDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { token, user } = useAuthStore();
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [activeTab, setActiveTab] = useState<'profil' | 'hizmetler' | 'yetenekler' | 'urunler' | 'ortaklik'>('profil');
  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);

  const tabs = [
    { id: 'profil', label: 'Genel Bakış' },
    { id: 'hizmetler', label: 'Hizmetler' },
    { id: 'yetenekler', label: 'Yetkinlikler' },
    { id: 'urunler', label: 'Ürün Kataloğu' },
    { id: 'ortaklik', label: 'İş Ortaklığı' },
  ] as const;

  useEffect(() => {
    fetchCompany();
  }, [slug]);

  useEffect(() => {
    if (company?.id) {
      fetchProducts(company.id);
    }
  }, [company?.id]);

  const fetchCompany = async () => {
    try {
      const { data } = await api.get(`/companies/${slug}`);
      setCompany(data);
    } catch (error) {
      console.error('Şirket yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async () => {
    if (!token) {
      navigate('/login');
      return;
    }

    setSending(true);
    try {
      await api.post('/connections', {
        receiverId: company!.id,
        message: 'Merhaba, iş birliği yapmak isterim.',
      });
      alert('Bağlantı isteği gönderildi!');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Hata oluştu');
    } finally {
      setSending(false);
    }
  };

  const fetchProducts = async (companyId: string) => {
    setProductsLoading(true);
    try {
      const { data } = await api.get('/products', {
        params: {
          companyId,
          limit: 6,
          sortBy: 'viewCount',
          sortOrder: 'desc',
        },
      });
      setProducts(data.products || []);
    } catch (error) {
      console.error('Ürünler yüklenemedi', error);
    } finally {
      setProductsLoading(false);
    }
  };

  const renderTabContent = () => {
    if (!company) return null;

    switch (activeTab) {
      case 'profil':
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="card">
              <h2 className="text-xl font-bold mb-6 text-slate-900">Şirket Hakkında</h2>
              <p className="text-slate-600 leading-relaxed text-lg">{company.description}</p>

              <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="text-sm text-slate-500 mb-1">Sektör</div>
                  <div className="font-semibold text-slate-900">{INDUSTRY_LABELS[company.industryType]}</div>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="text-sm text-slate-500 mb-1">Şirket Büyüklüğü</div>
                  <div className="font-semibold text-slate-900">{COMPANY_SIZE_LABELS[company.companySize]}</div>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="text-sm text-slate-500 mb-1">Kuruluş Yılı</div>
                  <div className="font-semibold text-slate-900">{company.foundedYear || '-'}</div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="card">
                <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  Platform Metrikleri
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
                    <span className="text-slate-600">Bağlantı Ağı</span>
                    <span className="font-bold text-slate-900">{company.connectionCount} Partner</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
                    <span className="text-slate-600">Profil Görüntülenme</span>
                    <span className="font-bold text-slate-900">{company.viewCount}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
                    <span className="text-slate-600">Üyelik Durumu</span>
                    <span className={`font-bold ${company.isPremium ? 'text-emerald-600' : 'text-slate-900'}`}>
                      {company.isPremium ? 'Premium Üye' : 'Standart Üye'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="card">
                <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-emerald-600" />
                  Konum ve İletişim
                </h3>
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <MapPin className="w-5 h-5 text-slate-400 flex-shrink-0" />
                    <div>
                      <div className="font-medium text-slate-900">{company.city}</div>
                      <div className="text-sm text-slate-500">{company.address}</div>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Phone className="w-5 h-5 text-slate-400 flex-shrink-0" />
                    <a href={`tel:${company.phone}`} className="text-slate-600 hover:text-emerald-600 transition-colors">
                      {company.phone}
                    </a>
                  </div>
                  <div className="flex gap-3">
                    <Mail className="w-5 h-5 text-slate-400 flex-shrink-0" />
                    <a href={`mailto:${company.email}`} className="text-slate-600 hover:text-emerald-600 transition-colors">
                      {company.email}
                    </a>
                  </div>
                  {company.website && (
                    <div className="flex gap-3">
                      <Globe className="w-5 h-5 text-slate-400 flex-shrink-0" />
                      <a href={company.website} target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:underline">
                        {company.website}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      case 'hizmetler':
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">Hizmetler ve Çözümler</h2>
              <span className="text-sm text-slate-500">{company.services?.length || 0} Hizmet</span>
            </div>
            {company.services && company.services.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {company.services.map((service) => (
                  <div key={service.id} className="card hover:border-emerald-200 transition-colors group">
                    <div className="flex items-start justify-between mb-3">
                      <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100 transition-colors">
                        <Briefcase className="w-6 h-6" />
                      </div>
                      <span className="badge badge-secondary">{service.category}</span>
                    </div>
                    <h3 className="font-bold text-lg text-slate-900 mb-2">{service.title}</h3>
                    <p className="text-slate-600 text-sm leading-relaxed">{service.description}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500">Bu şirket henüz hizmet bilgisi eklemedi.</p>
              </div>
            )}
          </div>
        );
      case 'yetenekler':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="card h-fit">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Star className="w-5 h-5 text-emerald-600" />
                Yetkinlikler
              </h2>
              {company.capabilities && company.capabilities.length > 0 ? (
                <div className="flex flex-wrap gap-3">
                  {company.capabilities.map((capability) => (
                    <div key={capability.id} className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-50 border border-slate-100 text-slate-700">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      <span className="font-medium">{capability.name}</span>
                      {capability.yearsExp && (
                        <span className="text-xs text-slate-400 border-l border-slate-200 pl-2 ml-1">
                          {capability.yearsExp} yıl
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500">Tanımlı yetenek bulunamadı.</p>
              )}
            </div>

            <div className="card h-fit">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Award className="w-5 h-5 text-emerald-600" />
                Sertifikalar ve Belgeler
              </h2>
              {company.certifications && company.certifications.length > 0 ? (
                <div className="space-y-4">
                  {company.certifications.map((cert) => (
                    <div key={cert.id} className="flex items-start gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
                      <div className="p-2 bg-white rounded-lg shadow-sm">
                        <Award className="w-6 h-6 text-amber-500" />
                      </div>
                      <div>
                        <div className="font-bold text-slate-900">{cert.name}</div>
                        <div className="text-sm text-slate-500 mt-1">{cert.issuer}</div>
                        {cert.issueDate && (
                          <div className="text-xs text-slate-400 mt-2">
                            Veriliş: {new Date(cert.issueDate).toLocaleDateString('tr-TR')}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500">Henüz sertifika eklenmedi.</p>
              )}
            </div>
          </div>
        );
      case 'urunler':
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Ürün Kataloğu</h2>
                <p className="text-sm text-slate-500 mt-1">Şirketin sunduğu ürünler ve çözümler</p>
              </div>
              <Link to={`/search?company=${company.slug}`} className="btn btn-outline py-2 text-sm">
                Tümünü Gör
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {productsLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
              </div>
            ) : products.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500">Bu şirket henüz ürün eklemedi.</p>
              </div>
            )}
          </div>
        );
      case 'ortaklik':
        return (
          <div className="card max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-emerald-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">İş Ortaklığı Profili</h2>
              <p className="text-slate-600 mt-2">Bu şirketle iş birliği yapma fırsatlarını değerlendirin.</p>
            </div>

            <div className="bg-slate-50 rounded-xl p-6 mb-8 border border-slate-100">
              <div className="flex items-center justify-between mb-4">
                <span className="font-medium text-slate-700">Partner Arayışı</span>
                <span className={`badge ${company.seekingPartners ? 'badge-primary' : 'badge-secondary'} text-sm py-1 px-3`}>
                  {company.seekingPartners ? 'Aktif - Partner Arıyor' : 'Şu an pasif'}
                </span>
              </div>

              {company.partnerCriteria && (
                <div className="mt-4 pt-4 border-t border-slate-200">
                  <span className="block text-sm font-semibold text-slate-900 mb-2">Partner Kriterleri</span>
                  <p className="text-slate-600 text-sm leading-relaxed">{company.partnerCriteria}</p>
                </div>
              )}
            </div>

            <button
              onClick={handleConnect}
              disabled={sending}
              className="btn btn-primary w-full py-4 text-lg shadow-xl shadow-emerald-600/20"
            >
              {sending ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Gönderiliyor...
                </>
              ) : (
                <>
                  <LinkIcon className="w-5 h-5" />
                  Bağlantı İsteği Gönder
                </>
              )}
            </button>
            <p className="text-xs text-center text-slate-400 mt-4">
              Bağlantı isteği göndererek Zincir platform kurallarını kabul etmiş olursunuz.
            </p>
          </div>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (!company) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-slate-900">Şirket bulunamadı</h1>
        <Link to="/companies" className="btn btn-primary mt-4">Şirketlere Dön</Link>
      </div>
    );
  }

  return (
    <div className="pb-20 bg-slate-50 min-h-screen">
      {/* Hero Section */}
      <div className="relative h-80 w-full bg-slate-900 overflow-hidden">
        {company.coverImage ? (
          <img
            src={company.coverImage}
            alt={company.name}
            className="w-full h-full object-cover opacity-60"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-900 opacity-90" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-transparent to-transparent" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-32 relative z-10">
        <div className="flex flex-col md:flex-row items-end gap-8 mb-8">
          <div className="relative">
            {company.logo ? (
              <img
                src={company.logo}
                alt={company.name}
                className="w-40 h-40 rounded-3xl object-cover border-4 border-white shadow-2xl bg-white"
              />
            ) : (
              <div className="w-40 h-40 rounded-3xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center border-4 border-white shadow-2xl text-white">
                <Building2 className="w-16 h-16" />
              </div>
            )}
            {company.isPremium && (
              <div className="absolute -bottom-3 -right-3 bg-amber-400 text-amber-950 text-xs font-bold px-3 py-1 rounded-full shadow-lg border-2 border-white flex items-center gap-1">
                <Award className="w-3 h-3" /> Premium
              </div>
            )}
          </div>

          <div className="flex-1 pb-2">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-4xl font-black text-white mb-2 drop-shadow-sm">{company.name}</h1>
                <div className="flex flex-wrap gap-3 text-slate-200">
                  <span className="flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-sm border border-white/10">
                    <Building2 className="w-4 h-4" /> {INDUSTRY_LABELS[company.industryType]}
                  </span>
                  <span className="flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-sm border border-white/10">
                    <MapPin className="w-4 h-4" /> {company.city}
                  </span>
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={handleConnect} className="btn btn-primary shadow-xl shadow-emerald-900/20 border-2 border-transparent">
                  <LinkIcon className="w-4 h-4" />
                  Bağlantı Kur
                </button>
                <button className="btn bg-white/10 backdrop-blur-md text-white border-2 border-white/20 hover:bg-white/20">
                  <Star className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex overflow-x-auto pb-4 gap-2 mb-8 no-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 rounded-xl font-semibold whitespace-nowrap transition-all duration-200 ${activeTab === tab.id
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20'
                  : 'bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-slate-200'
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="min-h-[400px]">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
}
