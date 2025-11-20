import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import { Connection, Company, Product } from '../types';
import { useAuthStore } from '../store/authStore';
import {
  Users,
  UserPlus,
  UserCheck,
  Loader2,
  ShieldCheck,
  TrendingUp,
  Package,
  Upload,
  Trash2,
  Plus,
  X,
  Image as ImageIcon,
  CheckCircle2,
  Eye,
  MessageCircle,
  Briefcase
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import StoriesBar from '../components/StoriesBar';
import CreateStoryModal from '../components/CreateStoryModal';
import StoryViewer from '../components/StoryViewer';

const TABS = [
  { id: 'overview', label: 'Genel Bakış' },
  { id: 'requests', label: 'Bağlantı Talepleri' },
  { id: 'connections', label: 'Bağlantılarım' },
  { id: 'offers', label: 'Teklifler' },
  { id: 'products', label: 'Ürün Yönetimi' },
  { id: 'analytics', label: 'İstatistikler' },
  { id: 'profile', label: 'Şirket Profilim' },
] as const;

export default function DashboardPage() {
  const [receivedConnections, setReceivedConnections] = useState<Connection[]>([]);
  const [sentConnections, setSentConnections] = useState<Connection[]>([]);
  const [acceptedConnections, setAcceptedConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profile, setProfile] = useState<Company | null>(null);
  const [profileForm, setProfileForm] = useState({
    name: '',
    description: '',
    city: '',
    address: '',
    phone: '',
    website: '',
  });
  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [productSaving, setProductSaving] = useState(false);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    category: '',
    price: '',
    currency: 'TRY',
    mainImage: '',
    images: [] as string[],
    videos: [] as string[],
    tags: '',
    isAvailable: true,
  });
  const [activeTab, setActiveTab] = useState<'overview' | 'requests' | 'connections' | 'offers' | 'products' | 'profile' | 'analytics'>('overview');
  const [offers, setOffers] = useState<any[]>([]);
  const [offersLoading, setOffersLoading] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<Company[]>([]);
  const [offerModalOpen, setOfferModalOpen] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState<Company | null>(null);
  const [offerAmount, setOfferAmount] = useState('');
  const [offerMessage, setOfferMessage] = useState('');

  const { user } = useAuthStore();

  // Stories State
  const [showCreateStoryModal, setShowCreateStoryModal] = useState(false);
  const [viewingStories, setViewingStories] = useState<any[] | null>(null);
  const [viewingCompanyId, setViewingCompanyId] = useState<string | null>(null);

  useEffect(() => {
    fetchConnections();
    fetchRecommendations();
  }, []);

  useEffect(() => {
    if (user?.company?.slug) {
      fetchProfile(user.company.slug);
    } else {
      setProfile(null);
    }
  }, [user?.company?.slug]);

  useEffect(() => {
    if (profile?.id) {
      fetchProducts(profile.id);
    } else {
      setProducts([]);
    }
  }, [profile?.id]);

  useEffect(() => {
    if (activeTab === 'analytics' && user?.company?.id) {
      fetchStats();
    }
  }, [activeTab, user?.company?.id]);

  useEffect(() => {
    if (activeTab === 'offers') {
      fetchOffers();
    }
  }, [activeTab]);

  const fetchOffers = async () => {
    setOffersLoading(true);
    try {
      const { data } = await api.get('/messages/inbox');
      // [İLAN TEKLİFİ] ile başlayan mesajları filtrele
      const offerMessages = data.filter((msg: any) =>
        msg.content && msg.content.includes('[İLAN TEKLİFİ]')
      );
      setOffers(offerMessages);
    } catch (error) {
      // Hata sessizce yönetiliyor
    } finally {
      setOffersLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const { data } = await api.get('/analytics');
      setStats(data);
    } catch (error) {
      // Hata sessizce yönetiliyor
    }
  };

  const fetchRecommendations = async () => {
    try {
      const { data } = await api.get('/companies/recommendations');
      setRecommendations(data);
    } catch (error) {
      // console.error('Öneriler alınamadı', error);
    }
  };

  const fetchConnections = async () => {
    try {
      const [received, sent, accepted] = await Promise.all([
        api.get('/connections/received'),
        api.get('/connections/sent'),
        api.get('/connections/accepted'),
      ]);

      setReceivedConnections(received.data);
      setSentConnections(sent.data);
      setAcceptedConnections(accepted.data);
    } catch (error) {
      // Hata sessizce yönetiliyor
    } finally {
      setLoading(false);
    }
  };

  const fetchProfile = async (slug: string) => {
    setProfileLoading(true);
    try {
      const { data } = await api.get(`/companies/${slug}`);
      setProfile(data);
      setProfileForm({
        name: data.name || '',
        description: data.description || '',
        city: data.city || '',
        address: data.address || '',
        phone: data.phone || '',
        website: data.website || '',
      });
    } catch (error) {
      // Hata sessizce yönetiliyor
    } finally {
      setProfileLoading(false);
    }
  };

  const fetchProducts = async (companyId: string) => {
    setProductsLoading(true);
    try {
      const { data } = await api.get('/products', {
        params: { companyId, limit: 50, sortBy: 'createdAt', sortOrder: 'desc' },
      });
      setProducts(data.products || []);
    } catch (error) {
      // Hata sessizce yönetiliyor
    } finally {
      setProductsLoading(false);
    }
  };

  const handleAccept = async (id: string) => {
    try {
      await api.put(`/connections/${id}/accept`);
      fetchConnections();
    } catch (error) {
      alert('Bağlantı kabul edilirken hata oluştu');
    }
  };

  const handleReject = async (id: string) => {
    try {
      await api.put(`/connections/${id}/reject`);
      fetchConnections();
    } catch (error) {
      alert('Bağlantı reddedilirken hata oluştu');
    }
  };

  const handleSendOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPartner || !offerAmount) {
      alert('Lütfen teklif miktarını girin');
      return;
    }

    // Sohbet sayfasına yönlendir
    window.location.href = `/chat?companyId=${selectedPartner.id}`;
  };

  const openOfferModal = (partner: Company) => {
    setSelectedPartner(partner);
    setOfferModalOpen(true);
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setProfileSaving(true);
    try {
      await api.put(`/companies/${profile.id}`, profileForm);
      await fetchProfile(profile.slug);
      alert('Profil başarıyla güncellendi');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Profil güncellenemedi');
    } finally {
      setProfileSaving(false);
    }
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setProductSaving(true);
    try {
      const payload: any = {
        name: productForm.name,
        description: productForm.description,
        category: productForm.category,
        currency: productForm.currency,
        mainImage: productForm.mainImage || undefined,
        images: productForm.images,
        videos: productForm.videos,
        isAvailable: productForm.isAvailable,
      };
      if (productForm.price) {
        payload.price = parseFloat(productForm.price);
      }
      if (productForm.tags) {
        payload.tags = productForm.tags
          .split(',')
          .map((tag) => tag.trim())
          .filter(Boolean);
      }

      await api.post('/products', payload);
      await fetchProducts(profile.id);
      setProductForm({
        name: '',
        description: '',
        category: '',
        price: '',
        currency: 'TRY',
        mainImage: '',
        images: [],
        videos: [],
        tags: '',
        isAvailable: true,
      });
      setIsAddingProduct(false);
      alert('Ürün başarıyla eklendi!');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Ürün kaydedilemedi');
    } finally {
      setProductSaving(false);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!profile) return;
    if (!confirm('Ürünü silmek istediğinize emin misiniz?')) return;
    try {
      await api.delete(`/products/${productId}`);
      await fetchProducts(profile.id);
    } catch (error: any) {
      alert(error.response?.data?.message || 'Ürün silinemedi');
    }
  };

  const addImageField = () => {
    setProductForm({ ...productForm, images: [...productForm.images, ''] });
  };

  const updateImageField = (index: number, value: string) => {
    const newImages = [...productForm.images];
    newImages[index] = value;
    setProductForm({ ...productForm, images: newImages });
  };

  const removeImageField = (index: number) => {
    const newImages = productForm.images.filter((_, i) => i !== index);
    setProductForm({ ...productForm, images: newImages });
  };

  const addVideoField = () => {
    setProductForm({ ...productForm, videos: [...productForm.videos, ''] });
  };

  const updateVideoField = (index: number, value: string) => {
    const newVideos = [...productForm.videos];
    newVideos[index] = value;
    setProductForm({ ...productForm, videos: newVideos });
  };

  const removeVideoField = (index: number) => {
    const newVideos = productForm.videos.filter((_, i) => i !== index);
    setProductForm({ ...productForm, videos: newVideos });
  };

  const trustScore = Math.min(99, 60 + acceptedConnections.length * 5 + (profile?.certifications?.length || 0) * 4);

  const overviewCards = [
    {
      label: 'Bekleyen İstek',
      value: receivedConnections.length,
      icon: UserPlus,
      accent: 'from-primary-500/10 to-primary-500/5 text-primary-700',
    },
    {
      label: 'Onaylı Bağlantı',
      value: acceptedConnections.length,
      icon: UserCheck,
      accent: 'from-emerald-500/10 to-emerald-500/5 text-emerald-700',
    },
    {
      label: 'Gönderilen İstek',
      value: sentConnections.length,
      icon: Users,
      accent: 'from-accent-500/10 to-accent-500/5 text-accent-700',
    },
    {
      label: 'Güven Skoru',
      value: `${trustScore}%`,
      icon: ShieldCheck,
      accent: 'from-amber-500/10 to-amber-500/5 text-amber-700',
    },
  ];

  const renderOverview = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {overviewCards.map((card) => (
          <div key={card.label} className="card hover:shadow-lg transition-shadow duration-300">
            <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${card.accent} flex items-center justify-center mb-4`}>
              <card.icon className="w-6 h-6" />
            </div>
            <p className="text-sm text-gray-500 font-medium">{card.label}</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card bg-gradient-to-br from-slate-900 to-slate-800 text-white border-none shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-emerald-400 font-bold">Finansal Güven</p>
              <h3 className="text-2xl font-bold mt-2">İş Ortaklığı Kasası</h3>
            </div>
            <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
              <ShieldCheck className="w-8 h-8 text-emerald-400" />
            </div>
          </div>
          <p className="text-slate-300 leading-relaxed mb-8">
            Zincir, partnerlerle olan anlaşmalarınızı kayıt altına almanızı ve finansal güven katsayınızı
            yükseltmenizi sağlar. Sertifika ve bağlantı sayınız arttıkça görünürlüğünüz artar.
          </p>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-sm text-slate-400 mb-1">Güven Endeksi</p>
              <div className="text-5xl font-black text-white tracking-tight">
                {trustScore}<span className="text-2xl text-emerald-500">%</span>
              </div>
            </div>
            <Link to="/platform" className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold transition-colors shadow-lg shadow-emerald-900/20">
              Detayları Gör
            </Link>
          </div>
        </div>

        <div className="card">
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary-600" />
            Pipeline Özeti
          </h3>
          <div className="space-y-4">
            {[
              { label: 'Bekleyen İstekler', value: receivedConnections.length, color: 'bg-primary-50 text-primary-700' },
              { label: 'Gönderilen İstekler', value: sentConnections.length, color: 'bg-amber-50 text-amber-700' },
              { label: 'Onaylanan Bağlantılar', value: acceptedConnections.length, color: 'bg-emerald-50 text-emerald-700' },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between p-4 rounded-xl bg-gray-50 border border-gray-100">
                <span className="font-medium text-gray-700">{item.label}</span>
                <span className={`px-3 py-1 rounded-lg font-bold ${item.color}`}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AI Recommendations Section */}
      <div className="card border-emerald-100 bg-emerald-50/50">
        <div className="flex items-center gap-2 mb-6">
          <div className="p-2 bg-emerald-100 rounded-lg">
            <TrendingUp className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">Sizin İçin Önerilenler</h3>
            <p className="text-sm text-gray-500">Yapay zeka destekli iş ortağı önerileri</p>
          </div>
        </div>

        {recommendations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recommendations.map((company) => (
              <div key={company.id} className="bg-white p-4 rounded-xl border border-emerald-100 hover:shadow-md transition-all group">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                    {company.logo ? (
                      <img src={company.logo} alt={company.name} className="w-full h-full object-cover rounded-lg" />
                    ) : (
                      <span className="text-xl font-bold text-gray-400">{company.name.charAt(0)}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-gray-900 truncate">{company.name}</h4>
                    <p className="text-xs text-gray-500 truncate">{company.industryType} • {company.city}</p>
                    <div className="mt-3 flex gap-2">
                      <Link
                        to={`/companies/${company.slug}`}
                        className="flex-1 py-1.5 text-xs font-medium text-center text-emerald-700 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors"
                      >
                        Profili İncele
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">
            Şu an için size özel bir önerimiz bulunmuyor. Profilinizi güncelleyerek daha iyi eşleşmeler yakalayabilirsiniz.
          </p>
        )}
      </div>
    </div>
  );

  const renderAnalytics = () => {
    if (!stats) {
      return (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
        </div>
      );
    }

    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="card bg-white border border-slate-100 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-blue-50 text-blue-600">
                <Eye className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-slate-500 font-medium">Toplam Görüntülenme</p>
                <p className="text-2xl font-bold text-slate-900">{stats.totalViews}</p>
              </div>
            </div>
          </div>
          <div className="card bg-white border border-slate-100 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-purple-50 text-purple-600">
                <UserPlus className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-slate-500 font-medium">Bağlantı İstekleri</p>
                <p className="text-2xl font-bold text-slate-900">{stats.pendingRequests}</p>
              </div>
            </div>
          </div>
          <div className="card bg-white border border-slate-100 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-amber-50 text-amber-600">
                <MessageCircle className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-slate-500 font-medium">Okunmamış Mesajlar</p>
                <p className="text-2xl font-bold text-slate-900">{stats.unreadMessages}</p>
              </div>
            </div>
          </div>
          <div className="card bg-white border border-slate-100 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-slate-500 font-medium">Etkileşim Oranı</p>
                <p className="text-2xl font-bold text-slate-900">%12.5</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card">
            <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
              Popüler Aramalar
            </h3>
            <div className="space-y-4">
              {stats.popularSearches?.map((search: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
                  <span className="font-medium text-slate-700">{search.term}</span>
                  <span className="text-sm text-slate-500">{search.count} arama</span>
                </div>
              ))}
              {(!stats.popularSearches || stats.popularSearches.length === 0) && (
                <p className="text-slate-500 text-center py-4">Henüz veri yok.</p>
              )}
            </div>
          </div>

          <div className="card">
            <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
              <Eye className="w-5 h-5 text-blue-600" />
              En Çok Görüntülenen Ürünler
            </h3>
            <div className="space-y-4">
              {stats.topProducts?.map((product: any) => (
                <div key={product.id} className="flex items-center gap-4 p-3 rounded-lg bg-slate-50">
                  {product.mainImage ? (
                    <img src={product.mainImage} alt={product.name} className="w-12 h-12 rounded-lg object-cover" />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-slate-200 flex items-center justify-center">
                      <Package className="w-6 h-6 text-slate-400" />
                    </div>
                  )}
                  <div>
                    <p className="font-bold text-slate-900">{product.name}</p>
                    <p className="text-sm text-slate-500">{product.viewCount} görüntülenme</p>
                  </div>
                </div>
              ))}
              {(!stats.topProducts || stats.topProducts.length === 0) && (
                <p className="text-slate-500 text-center py-4">Henüz veri yok.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderRequests = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="card">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
          <div className="p-2 bg-primary-50 rounded-lg">
            <UserPlus className="w-5 h-5 text-primary-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Gelen Bağlantı İstekleri</h2>
        </div>
        {receivedConnections.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <UserPlus className="w-8 h-8 text-gray-300" />
            </div>
            <p className="text-gray-500">Henüz bekleyen bağlantı isteğiniz yok.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {receivedConnections.map((connection) => (
              <div key={connection.id} className="flex items-center justify-between p-4 rounded-xl bg-gray-50 border border-gray-100 hover:border-primary-200 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-white border border-gray-200 flex items-center justify-center font-bold text-primary-700 text-lg">
                    {(connection.requester?.name || '?').charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">{connection.requester?.name}</p>
                    <p className="text-sm text-gray-500">{connection.requester?.city}</p>
                    {connection.message && (
                      <p className="text-sm text-gray-600 mt-1 bg-white px-3 py-1 rounded-lg border border-gray-100 inline-block">
                        "{connection.message}"
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleAccept(connection.id)} className="btn btn-primary px-6">
                    Kabul Et
                  </button>
                  <button onClick={() => handleReject(connection.id)} className="btn btn-secondary px-6">
                    Reddet
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderConnections = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="card">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
          <div className="p-2 bg-emerald-50 rounded-lg">
            <UserCheck className="w-5 h-5 text-emerald-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Bağlantılarım</h2>
          <span className="ml-auto px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-sm font-bold">
            {acceptedConnections.length} Aktif Bağlantı
          </span>
        </div>
        {acceptedConnections.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <UserCheck className="w-8 h-8 text-gray-300" />
            </div>
            <p className="text-gray-500">Henüz onaylı bağlantınız yok.</p>
            <p className="text-gray-400 text-sm mt-2">Şirketlerle bağlantı kurmak için arama yapın.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {acceptedConnections.map((connection) => {
              const partner = connection.requester?.id === user?.company?.id
                ? connection.receiver
                : connection.requester;

              return (
                <div key={connection.id} className="p-5 rounded-xl bg-gradient-to-br from-white to-gray-50 border border-gray-200 hover:border-emerald-300 hover:shadow-lg transition-all duration-300 group">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center font-bold text-white text-xl shadow-lg">
                      {(partner?.name || '?').charAt(0)}
                    </div>
                    <div className="flex-1">
                      <Link
                        to={`/companies/${partner?.slug}`}
                        className="font-bold text-gray-900 hover:text-emerald-600 transition-colors text-lg"
                      >
                        {partner?.name}
                      </Link>
                      <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                        <span>{partner?.city}</span>
                        {partner?.industryType && (
                          <>
                            <span className="text-gray-300">•</span>
                            <span>{partner?.industryType}</span>
                          </>
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 mt-4">
                    {partner && (
                      <>
                        <button
                          onClick={() => openOfferModal(partner as Company)}
                          className="w-full btn btn-primary gap-2 justify-center text-sm py-2.5 shadow-md hover:shadow-lg transition-all"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          Teklif Ver
                        </button>
                        <Link
                          to={`/chat?companyId=${partner.id}`}
                          className="w-full btn btn-outline gap-2 justify-center text-sm py-2.5 hover:bg-emerald-50 hover:border-emerald-300 transition-all"
                        >
                          <MessageCircle className="w-4 h-4" />
                          Sohbete Geç
                        </Link>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Teklif Modal */}
      <AnimatePresence>
        {offerModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setOfferModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900">Teklif Gönder</h3>
                <button
                  onClick={() => setOfferModalOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {selectedPartner && (
                <div className="mb-6 p-4 bg-gray-50 rounded-xl">
                  <p className="text-sm text-gray-500">Teklif gönderilecek şirket:</p>
                  <p className="font-bold text-gray-900 text-lg">{selectedPartner.name}</p>
                </div>
              )}

              <form onSubmit={handleSendOffer} className="space-y-4">
                <div>
                  <label className="label">Teklif Miktarı (TRY)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    className="input"
                    placeholder="Örn: 50000"
                    value={offerAmount}
                    onChange={(e) => setOfferAmount(e.target.value)}
                  />
                </div>

                <div>
                  <label className="label">Mesaj (Opsiyonel)</label>
                  <textarea
                    rows={4}
                    className="input"
                    placeholder="Teklifiniz hakkında detay ekleyin..."
                    value={offerMessage}
                    onChange={(e) => setOfferMessage(e.target.value)}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Boş bırakılırsa varsayılan mesaj gönderilir.
                  </p>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setOfferModalOpen(false)}
                    className="flex-1 btn btn-secondary"
                  >
                    İptal
                  </button>
                  <button
                    type="submit"
                    className="flex-1 btn btn-primary"
                  >
                    Teklifi Gönder
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  const renderOffers = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="card">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
          <div className="p-2 bg-amber-50 rounded-lg">
            <Briefcase className="w-5 h-5 text-amber-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Gelen Teklifler</h2>
          <span className="ml-auto px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-sm font-bold">
            {offers.filter(o => !o.isRead).length} Okunmamış
          </span>
        </div>

        {offersLoading ? (
          <div className="text-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-amber-600 mx-auto" />
          </div>
        ) : offers.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Briefcase className="w-8 h-8 text-gray-300" />
            </div>
            <p className="text-gray-500">Henüz teklif almadınız.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {offers.map((offer) => {
              // Mesajdan ilan başlığını ve fiyatı çıkar
              const titleMatch = offer.content.match(/\[İLAN TEKLİFİ\] (.+?)\n/);
              const priceMatch = offer.content.match(/💰 Teklif Fiyatı: (.+?)\n/);
              const messageContent = offer.content
                .replace(/\[İLAN TEKLİFİ\].+?\n\n/, '')
                .replace(/💰 Teklif Fiyatı:.+?\n\n/, '');

              return (
                <div
                  key={offer.id}
                  className={`p-5 rounded-xl border transition-all ${offer.isRead
                    ? 'bg-white border-gray-200'
                    : 'bg-amber-50 border-amber-300 shadow-md'
                    }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center font-bold text-white text-lg shadow-lg">
                        {offer.senderCompany?.name?.charAt(0) || '?'}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">{offer.senderCompany?.name}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(offer.createdAt).toLocaleDateString('tr-TR', {
                            day: 'numeric',
                            month: 'long',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </div>
                    {!offer.isRead && (
                      <span className="px-3 py-1 bg-amber-600 text-white text-xs font-bold rounded-full">
                        Yeni
                      </span>
                    )}
                  </div>

                  {titleMatch && (
                    <h3 className="font-bold text-lg text-gray-900 mb-2">
                      📋 {titleMatch[1]}
                    </h3>
                  )}

                  {priceMatch && (
                    <div className="mb-3 p-3 bg-emerald-50 border border-emerald-200 rounded-lg inline-block">
                      <p className="text-emerald-700 font-bold text-lg">{priceMatch[1]}</p>
                    </div>
                  )}

                  <p className="text-gray-700 whitespace-pre-wrap mb-4">{messageContent}</p>

                  <div className="flex gap-2">
                    <Link
                      to={`/chat?userId=${offer.senderId}`}
                      className="btn btn-primary text-sm"
                    >
                      <MessageCircle className="w-4 h-4" />
                      Yanıtla
                    </Link>
                    <Link
                      to={`/companies/${offer.senderCompany?.slug}`}
                      className="btn btn-outline text-sm"
                    >
                      Profili Görüntüle
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );

  const renderProducts = () => {
    if (!profile) {
      return (
        <div className="card text-center py-20">
          <div className="w-20 h-20 bg-primary-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <Package className="w-10 h-10 text-primary-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Ürün eklemek için profil oluşturun</h2>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">Ürün kataloğunuzu Zincir ağına açarak daha fazla partner çekebilir ve ticaret hacminizi artırabilirsiniz.</p>
          <Link to="/create-company" className="btn btn-primary py-3 px-8 text-lg shadow-xl shadow-primary-600/20">
            Şirket Profili Oluştur
          </Link>
        </div>
      );
    }

    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Ürün Yönetimi</h2>
            <p className="text-gray-500">Kataloğunuzu yönetin ve yeni ürünler ekleyin.</p>
          </div>
          <button
            onClick={() => setIsAddingProduct(!isAddingProduct)}
            className={`btn ${isAddingProduct ? 'btn-secondary' : 'btn-primary'} gap-2`}
          >
            {isAddingProduct ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
            {isAddingProduct ? 'İptal Et' : 'Yeni Ürün Ekle'}
          </button>
        </div>

        <AnimatePresence>
          {isAddingProduct && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="card border-2 border-primary-100 shadow-xl shadow-primary-900/5">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                  <div className="p-2 bg-primary-50 rounded-lg">
                    <Upload className="w-5 h-5 text-primary-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">Yeni Ürün Ekle</h3>
                </div>

                <form className="space-y-6" onSubmit={handleProductSubmit}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="label">Ürün Adı</label>
                      <input
                        type="text"
                        required
                        className="input"
                        placeholder="Örn: Pamuklu Kumaş"
                        value={productForm.name}
                        onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="label">Kategori</label>
                      <input
                        type="text"
                        required
                        className="input"
                        placeholder="Örn: Tekstil"
                        value={productForm.category}
                        onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="label">Fiyat</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        className="input"
                        placeholder="0.00"
                        value={productForm.price}
                        onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="label">Para Birimi</label>
                      <select
                        className="input"
                        value={productForm.currency}
                        onChange={(e) => setProductForm({ ...productForm, currency: e.target.value })}
                      >
                        <option value="TRY">TRY (₺)</option>
                        <option value="USD">USD ($)</option>
                        <option value="EUR">EUR (€)</option>
                      </select>
                    </div>
                    <div>
                      <label className="label">Durum</label>
                      <button
                        type="button"
                        onClick={() => setProductForm({ ...productForm, isAvailable: !productForm.isAvailable })}
                        className={`w-full h-[46px] rounded-xl flex items-center px-2 transition-colors ${productForm.isAvailable ? 'bg-emerald-500 justify-end' : 'bg-gray-200 justify-start'
                          }`}
                      >
                        <span className="w-8 h-8 bg-white rounded-lg shadow-sm flex items-center justify-center">
                          {productForm.isAvailable ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : <X className="w-5 h-5 text-gray-400" />}
                        </span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="label">Açıklama</label>
                    <textarea
                      rows={4}
                      className="input"
                      placeholder="Ürün özelliklerini detaylıca açıklayın..."
                      value={productForm.description}
                      onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                    />
                  </div>

                  <div className="space-y-4">
                    <label className="label">Medya (Görsel & Video)</label>

                    {/* Ana Görsel */}
                    <div className="space-y-2">
                      <span className="text-sm font-medium text-gray-700">Ana Görsel (Kapak)</span>
                      <div className="flex gap-2 items-center">
                        <div className="relative flex-1">
                          {productForm.mainImage ? (
                            <div className="flex items-center gap-2 px-4 py-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 w-full">
                              <ImageIcon className="w-4 h-4" />
                              <span className="text-sm font-medium truncate flex-1">
                                {productForm.mainImage.split('/').pop()}
                              </span>
                              <button
                                type="button"
                                onClick={() => setProductForm({ ...productForm, mainImage: '' })}
                                className="p-1 hover:bg-emerald-100 rounded-full transition-colors"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <div className="relative">
                              <input
                                type="text"
                                className="input pl-10"
                                placeholder="Görsel URL'si veya dosya yükleyin"
                                value={productForm.mainImage}
                                onChange={(e) => setProductForm({ ...productForm, mainImage: e.target.value })}
                              />
                              <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <label className="btn btn-secondary cursor-pointer px-4">
                          <Upload className="w-5 h-5" />
                          <input
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              const formData = new FormData();
                              formData.append('file', file);
                              try {
                                const { data } = await api.post('/upload', formData, {
                                  headers: { 'Content-Type': 'multipart/form-data' },
                                });
                                setProductForm({ ...productForm, mainImage: data.url });
                              } catch (error) {
                                alert('Dosya yüklenirken hata oluştu');
                              }
                            }}
                          />
                        </label>
                      </div>
                    </div>

                    {/* Ek Görseller */}
                    <div className="space-y-3">
                      <span className="text-sm font-medium text-gray-700">Ek Görseller</span>
                      {productForm.images.map((url, index) => (
                        <div key={index} className="flex gap-2 items-center">
                          <input
                            type="text"
                            className="input flex-1"
                            placeholder={`Ek görsel URL #${index + 1}`}
                            value={url}
                            onChange={(e) => updateImageField(index, e.target.value)}
                          />
                          <button
                            type="button"
                            onClick={() => setProductForm({ ...productForm, mainImage: url })}
                            className="btn btn-secondary px-3 text-blue-600 hover:bg-blue-50 text-xs"
                            title="Ana Görsel Yap"
                          >
                            Kapak Yap
                          </button>
                          <button
                            type="button"
                            onClick={() => removeImageField(index)}
                            className="btn btn-secondary px-3 text-red-500 hover:bg-red-50"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={addImageField}
                        className="text-sm font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-1"
                      >
                        <Plus className="w-4 h-4" /> Daha fazla görsel ekle
                      </button>
                    </div>

                    {/* Videolar */}
                    <div className="space-y-3 pt-4 border-t border-gray-100">
                      <span className="text-sm font-medium text-gray-700">Videolar</span>
                      {productForm.videos.map((url, index) => (
                        <div key={index} className="flex gap-2 items-center">
                          <input
                            type="text"
                            className="input flex-1"
                            placeholder={`Video URL #${index + 1}`}
                            value={url}
                            onChange={(e) => updateVideoField(index, e.target.value)}
                          />
                          <button
                            type="button"
                            onClick={() => removeVideoField(index)}
                            className="btn btn-secondary px-3 text-red-500 hover:bg-red-50"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={addVideoField}
                        className="text-sm font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-1"
                      >
                        <Plus className="w-4 h-4" /> Video ekle
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="label">Etiketler</label>
                    <input
                      type="text"
                      className="input"
                      placeholder="Örn: organik, pamuk, yerli üretim (virgülle ayırın)"
                      value={productForm.tags}
                      onChange={(e) => setProductForm({ ...productForm, tags: e.target.value })}
                    />
                  </div>

                  <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setIsAddingProduct(false)}
                      className="btn btn-secondary"
                    >
                      İptal
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary px-8"
                      disabled={productSaving}
                    >
                      {productSaving ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Kaydediliyor...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-5 h-5" />
                          Ürünü Yayınla
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {productsLoading ? (
            <div className="col-span-full flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
            </div>
          ) : products.length === 0 ? (
            <div className="col-span-full text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
              <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">Henüz ürün eklenmemiş.</p>
            </div>
          ) : (
            products.map((product) => (
              <div key={product.id} className="group card p-0 overflow-hidden hover:shadow-xl transition-all duration-300">
                <div className="relative h-48 bg-gray-100 overflow-hidden">
                  {product.mainImage ? (
                    <img src={product.mainImage} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                      <ImageIcon className="w-12 h-12" />
                    </div>
                  )}
                  <div className="absolute top-3 right-3 flex gap-2">
                    <button
                      onClick={() => handleDeleteProduct(product.id)}
                      className="p-2 bg-white/90 backdrop-blur rounded-lg text-red-500 hover:bg-red-50 transition-colors shadow-sm"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="absolute bottom-3 left-3">
                    <span className={`px-3 py-1 rounded-lg text-xs font-bold backdrop-blur-md shadow-sm ${product.isAvailable ? 'bg-emerald-500/90 text-white' : 'bg-gray-500/90 text-white'
                      }`}>
                      {product.isAvailable ? 'Yayında' : 'Pasif'}
                    </span>
                  </div>
                </div>

                <div className="p-5">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-bold text-gray-900 line-clamp-1 group-hover:text-primary-600 transition-colors">
                        <Link to={`/products/${product.id}`}>{product.name}</Link>
                      </h3>
                      <p className="text-sm text-gray-500">{product.category}</p>
                    </div>
                    {product.price && (
                      <span className="font-bold text-primary-700 bg-primary-50 px-2 py-1 rounded-lg text-sm">
                        {product.price.toLocaleString('tr-TR', { style: 'currency', currency: product.currency || 'TRY' })}
                      </span>
                    )}
                  </div>

                  <p className="text-sm text-gray-600 line-clamp-2 mb-4 h-10">
                    {product.description}
                  </p>

                  <Link
                    to={`/products/${product.id}`}
                    className="btn btn-outline w-full text-sm py-2"
                  >
                    Detayları Gör
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  const renderProfile = () => {
    if (profileLoading) {
      return (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
        </div>
      );
    }

    if (!profile) {
      return (
        <div className="card text-center py-20">
          <ShieldCheck className="w-16 h-16 text-primary-600 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Şirket profiliniz hazır değil</h2>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">Şirketinizi ekleyin, Zincir ağında güvenli bir vitrin oluşturun ve binlerce potansiyel partnere ulaşın.</p>
          <Link to="/create-company" className="btn btn-primary py-3 px-8 text-lg shadow-xl shadow-primary-600/20">
            Şirket Profili Oluştur
          </Link>
        </div>
      );
    }

    return (
      <div className="card animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-100">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Profil Düzenle</h2>
            <p className="text-gray-500">Şirket bilgilerinizi güncel tutun.</p>
          </div>
          <Link to={`/companies/${profile.slug}`} className="btn btn-outline gap-2">
            <Users className="w-4 h-4" />
            Canlı Profili Gör
          </Link>
        </div>

        <form className="space-y-6" onSubmit={handleProfileSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="label">Şirket Adı</label>
              <input
                type="text"
                className="input"
                value={profileForm.name}
                onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Şehir</label>
              <input
                type="text"
                className="input"
                value={profileForm.city}
                onChange={(e) => setProfileForm({ ...profileForm, city: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="label">Hakkında</label>
            <textarea
              rows={4}
              className="input"
              value={profileForm.description}
              onChange={(e) => setProfileForm({ ...profileForm, description: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="label">Adres</label>
              <input
                type="text"
                className="input"
                value={profileForm.address}
                onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Telefon</label>
              <input
                type="text"
                className="input"
                value={profileForm.phone}
                onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="label">Website</label>
            <input
              type="text"
              className="input"
              value={profileForm.website}
              onChange={(e) => setProfileForm({ ...profileForm, website: e.target.value })}
            />
          </div>

          <div className="pt-6 border-t border-gray-100 flex justify-end">
            <button type="submit" className="btn btn-primary px-8 py-3 text-lg" disabled={profileSaving}>
              {profileSaving ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Kaydediliyor...
                </>
              ) : (
                'Değişiklikleri Kaydet'
              )}
            </button>
          </div>
        </form>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-slate-50">
        <Loader2 className="w-10 h-10 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Kontrol Paneli</h1>
            <p className="text-gray-500 mt-1">Hoş geldin, {user?.email}</p>
          </div>
          <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-full border border-gray-200 shadow-sm">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-sm font-semibold text-gray-700">Sistem Aktif</span>
          </div>
        </div>

        {/* Stories Section */}
        <StoriesBar
          onCreateStory={() => setShowCreateStoryModal(true)}
          onViewStory={(companyId, stories) => {
            setViewingCompanyId(companyId);
            setViewingStories(stories);
          }}
        />

        <div className="bg-white p-1.5 rounded-2xl border border-gray-200 shadow-sm inline-flex flex-wrap gap-1 mb-10">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 rounded-xl text-sm font-bold transition-all duration-200 ${activeTab === tab.id
                ? 'bg-slate-900 text-white shadow-lg'
                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'requests' && renderRequests()}
        {activeTab === 'connections' && renderConnections()}
        {activeTab === 'offers' && renderOffers()}
        {activeTab === 'products' && renderProducts()}
        {activeTab === 'analytics' && renderAnalytics()}
        {activeTab === 'profile' && renderProfile()}
      </div>
      {/* Stories Modals */}
      {showCreateStoryModal && (
        <CreateStoryModal
          onClose={() => setShowCreateStoryModal(false)}
          onSuccess={() => {
            // Refresh stories logic could be added here, 
            // but StoriesBar fetches on mount so maybe force refresh?
            // For now just close, user can refresh page or we can add a refresh trigger
            window.location.reload();
          }}
        />
      )}

      {viewingStories && (
        <StoryViewer
          stories={viewingStories}
          onClose={() => {
            setViewingStories(null);
            setViewingCompanyId(null);
          }}
        />
      )}
    </div>
  );
}
