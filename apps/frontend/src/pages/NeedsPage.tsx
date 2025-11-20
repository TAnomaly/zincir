import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Canvas } from '@react-three/fiber';
import { api } from '../lib/api';
import { INDUSTRY_LABELS } from '../types';
import {
    Search, Briefcase, Clock, DollarSign,
    Loader2, Building2, MapPin,
    Sparkles, MessageSquare, Send
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../store/authStore';
import OptimizedShaderBackground from '../components/OptimizedShaderBackground';

interface Need {
    id: string;
    title: string;
    description: string;
    industryType: string;
    quantity?: string;
    budget?: string;
    deadline?: string;
    createdAt: string;
    company: {
        id: string;
        name: string;
        slug: string;
        logo?: string;
        city: string;
        isPremium: boolean;
    };
}

export default function NeedsPage() {
    const { user } = useAuthStore();
    const [needs, setNeeds] = useState<Need[]>([]);
    const [loading, setLoading] = useState(true);

    // Filters & Search State
    const [activeTab, setActiveTab] = useState<'all' | 'my' | 'connections'>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [filters, setFilters] = useState({
        industryType: '',
        status: 'ACTIVE',
    });

    // Create Need State
    const [isCreating, setIsCreating] = useState(false);
    const [creatingLoading, setCreatingLoading] = useState(false);
    const [needForm, setNeedForm] = useState({
        title: '',
        description: '',
        industryType: '',
        quantity: '',
        budget: '',
        deadline: '',
    });

    // Matches State
    const [matches, setMatches] = useState<any[]>([]);
    const [showMatches, setShowMatches] = useState(false);
    const [loadingMatches, setLoadingMatches] = useState(false);

    // Proposal State
    const [showProposalModal, setShowProposalModal] = useState(false);
    const [selectedNeed, setSelectedNeed] = useState<Need | null>(null);
    const [proposalMessage, setProposalMessage] = useState('');
    const [proposalPrice, setProposalPrice] = useState('');
    const [sendingProposal, setSendingProposal] = useState(false);

    const proposalTemplates = [
        'Merhaba, bu ilanla ilgileniyoruz. Detaylı teklifimizi paylaşmak isteriz.',
        'İlanınızı inceledik, kaliteli çözümler sunabiliriz. Görüşmek isteriz.',
        'Firmamız bu alanda uzmanlaşmıştır. Size özel teklif hazırlayabiliriz.',
        'Referanslarımızla birlikte detaylı teklif sunabiliriz.',
    ];

    // Contact Match State
    const [showContactModal, setShowContactModal] = useState(false);
    const [selectedMatch, setSelectedMatch] = useState<any>(null);
    const [contactMessage, setContactMessage] = useState('');
    const [sendingContact, setSendingContact] = useState(false);

    useEffect(() => {
        fetchNeeds();
    }, [filters, activeTab]);

    const fetchNeeds = async () => {
        setLoading(true);
        try {
            const params: any = { ...filters, limit: 12 };

            if (searchQuery.trim()) {
                params.search = searchQuery;
            }

            if (activeTab === 'my') {
                if (user?.company?.id) {
                    params.companyId = user.company.id;
                    // When viewing my needs, I might want to see all statuses
                    if (params.status === 'ACTIVE') {
                        delete params.status; // Or set to ALL if backend supports
                    }
                } else {
                    // If no company, show empty or redirect
                    setNeeds([]);
                    setLoading(false);
                    return;
                }
            } else if (activeTab === 'connections') {
                params.filter = 'connections';
            }

            const { data } = await api.get('/needs', { params });
            setNeeds(data.needs || []);
        } catch (error) {
            // console.error('İhtiyaçlar yüklenemedi:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = () => {
        fetchNeeds();
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    const handleCreateNeed = async (e: React.FormEvent) => {
        e.preventDefault();
        setCreatingLoading(true);
        try {
            const { data } = await api.post('/needs', needForm);
            setMatches(data.matches || []);
            setShowMatches(true);
            setIsCreating(false);
            fetchNeeds();
            setNeedForm({
                title: '',
                description: '',
                industryType: '',
                quantity: '',
                budget: '',
                deadline: '',
            });
        } catch (error: any) {
            alert(error.response?.data?.message || 'Talep oluşturulurken hata oluştu');
        } finally {
            setCreatingLoading(false);
        }
    };

    const handleViewMatches = async (needId: string) => {
        setLoadingMatches(true);
        setShowMatches(true);
        setMatches([]); // Clear previous
        try {
            const { data } = await api.get(`/needs/${needId}/matches`);
            setMatches(data);
        } catch (error) {
            // console.error('Eşleşmeler yüklenemedi', error);
            alert('Eşleşmeler yüklenirken bir hata oluştu.');
            setShowMatches(false);
        } finally {
            setLoadingMatches(false);
        }
    };

    const handleOpenProposal = (need: Need) => {
        if (!user) {
            alert('Teklif vermek için giriş yapmalısınız.');
            return;
        }
        setSelectedNeed(need);
        setProposalMessage('');
        setProposalPrice('');
        setShowProposalModal(true);
    };

    const handleSendProposal = async () => {
        if (!selectedNeed || !proposalMessage.trim()) {
            alert('Lütfen teklif mesajınızı yazın.');
            return;
        }
        setSendingProposal(true);
        try {
            let fullMessage = `[İLAN TEKLİFİ] ${selectedNeed.title}\n\n`;

            if (proposalPrice) {
                fullMessage += `💰 Teklif Fiyatı: ${parseFloat(proposalPrice).toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}\n\n`;
            }

            fullMessage += proposalMessage;

            // Önce bağlantı durumunu kontrol et
            try {
                const { data: acceptedData } = await api.get('/connections/accepted');
                const isConnected = acceptedData.some((conn: any) =>
                    conn.requester?.id === selectedNeed.company.id || conn.receiver?.id === selectedNeed.company.id
                );

                if (isConnected) {
                    // Zaten bağlantı varsa direkt mesaj gönder
                    // Company ID'den owner user ID'yi bul
                    const { data: companyData } = await api.get(`/companies/${selectedNeed.company.id}`);
                    await api.post('/messages', {
                        receiverId: companyData.ownerId,
                        content: fullMessage
                    });
                    alert('Teklifiniz mesaj olarak gönderildi!');
                } else {
                    // Bağlantı yoksa bağlantı isteği gönder
                    await api.post('/connections', {
                        receiverId: selectedNeed.company.id,
                        message: fullMessage
                    });
                    alert('Teklifiniz ve bağlantı isteğiniz gönderildi!');
                }
            } catch (connectionError) {
                // Bağlantı kontrolü başarısızsa direkt bağlantı isteği dene
                await api.post('/connections', {
                    receiverId: selectedNeed.company.id,
                    message: fullMessage
                });
                alert('Teklifiniz ve bağlantı isteğiniz gönderildi!');
            }

            setShowProposalModal(false);
            setProposalMessage('');
            setProposalPrice('');
            setSelectedNeed(null);
        } catch (error: any) {
            alert(error.response?.data?.message || 'Teklif gönderilemedi.');
        } finally {
            setSendingProposal(false);
        }
    };

    const handleOpenContact = (company: any) => {
        setSelectedMatch(company);
        setContactMessage(`Merhaba, ilanınızla ilgileniyoruz. Teklif vermek ve detayları görüşmek isteriz.`);
        setShowContactModal(true);
    };

    const handleSendContact = async () => {
        if (!selectedMatch) return;
        setSendingContact(true);
        try {
            await api.post('/connections', {
                receiverId: selectedMatch.id,
                message: `[EŞLEŞME İLETİŞİMİ]\n\n${contactMessage}`
            });

            alert('Bağlantı isteğiniz ve mesajınız gönderildi!');
            setShowContactModal(false);
            setContactMessage('');
            setSelectedMatch(null);
        } catch (error: any) {
            alert(error.response?.data?.message || 'Mesaj gönderilemedi.');
        } finally {
            setSendingContact(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-800 pb-20">
            {/* Header Section with Shader */}
            <div className="relative text-white pt-24 pb-16 px-4 overflow-hidden">
                {/* WebGL Shader Background */}
                <div className="absolute inset-0 z-0">
                    <Canvas camera={{ position: [0, 0, 1] }}>
                        <OptimizedShaderBackground variant="accent" />
                    </Canvas>
                </div>

                <div className="max-w-7xl mx-auto relative z-10 text-center">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-6xl font-black mb-6 tracking-tight"
                    >
                        <span className="text-white">İş Fırsatları &</span> <span className="text-emerald-400">Talepler</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-lg text-slate-300 max-w-2xl mx-auto mb-10"
                    >
                        Sektördeki güncel satın alma taleplerini, tedarik ihtiyaçlarını ve iş ortaklığı fırsatlarını keşfedin.
                    </motion.p>

                    {/* Tabs */}
                    <div className="flex justify-center mb-8">
                        <div className="bg-white/10 backdrop-blur-md p-1 rounded-xl inline-flex">
                            <button
                                onClick={() => setActiveTab('all')}
                                className={`px-6 py-2 rounded-lg font-medium transition-all ${activeTab === 'all'
                                    ? 'bg-emerald-500 text-white shadow-lg'
                                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                Tüm İlanlar
                            </button>
                            <button
                                onClick={() => setActiveTab('connections')}
                                className={`px-6 py-2 rounded-lg font-medium transition-all ${activeTab === 'connections'
                                    ? 'bg-emerald-500 text-white shadow-lg'
                                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                Bağlantılarım
                            </button>
                            <button
                                onClick={() => setActiveTab('my')}
                                className={`px-6 py-2 rounded-lg font-medium transition-all ${activeTab === 'my'
                                    ? 'bg-emerald-500 text-white shadow-lg'
                                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                İlanlarım
                            </button>
                        </div>
                    </div>

                    {/* Search & Filter Bar */}
                    <div className="max-w-4xl mx-auto bg-white/10 backdrop-blur-md p-2 rounded-2xl border border-white/10 flex flex-col md:flex-row gap-2">
                        <div className="flex-1 relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Ne arıyorsunuz? (Örn: Tekstil kumaş, Lojistik tır)"
                                className="w-full bg-white/90 text-slate-900 pl-12 pr-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={handleKeyDown}
                            />
                        </div>
                        <div className="md:w-48">
                            <select
                                className="w-full h-full bg-white/90 text-slate-900 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 appearance-none"
                                value={filters.industryType}
                                onChange={(e) => setFilters({ ...filters, industryType: e.target.value })}
                            >
                                <option value="">Tüm Sektörler</option>
                                {Object.entries(INDUSTRY_LABELS).map(([key, label]) => (
                                    <option key={key} value={key}>{label}</option>
                                ))}
                            </select>
                        </div>
                        {activeTab === 'my' && (
                            <div className="md:w-40">
                                <select
                                    className="w-full h-full bg-white/90 text-slate-900 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 appearance-none"
                                    value={filters.status}
                                    onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                                >
                                    <option value="ACTIVE">Aktif</option>
                                    <option value="CLOSED">Kapalı</option>
                                    <option value="COMPLETED">Tamamlandı</option>
                                    <option value="ALL">Hepsi</option>
                                </select>
                            </div>
                        )}
                        <button
                            onClick={handleSearch}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-xl font-bold transition-colors"
                        >
                            Ara
                        </button>
                    </div>

                    <div className="mt-8 flex justify-center">
                        <button
                            onClick={() => setIsCreating(true)}
                            className="bg-white text-slate-900 hover:bg-slate-100 px-8 py-3 rounded-xl font-bold transition-colors shadow-lg flex items-center gap-2"
                        >
                            <Briefcase className="w-5 h-5" />
                            Talep Oluştur
                        </button>
                    </div>
                </div>
            </div>

            {/* Create Need Modal */}
            {isCreating && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 shadow-2xl">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-slate-900">Yeni Talep Oluştur</h2>
                            <button onClick={() => setIsCreating(false)} className="p-2 hover:bg-slate-100 rounded-full">
                                <span className="text-2xl">&times;</span>
                            </button>
                        </div>
                        <form onSubmit={handleCreateNeed} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Başlık</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    placeholder="Örn: 5000 Adet Pamuklu Tişört İhtiyacı"
                                    value={needForm.title}
                                    onChange={(e) => setNeedForm({ ...needForm, title: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Sektör</label>
                                <select
                                    required
                                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    value={needForm.industryType}
                                    onChange={(e) => setNeedForm({ ...needForm, industryType: e.target.value })}
                                >
                                    <option value="">Seçiniz</option>
                                    {Object.entries(INDUSTRY_LABELS).map(([key, label]) => (
                                        <option key={key} value={key}>{label}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Miktar</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                        placeholder="Örn: 5000 Adet"
                                        value={needForm.quantity}
                                        onChange={(e) => setNeedForm({ ...needForm, quantity: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Bütçe</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                        placeholder="Örn: 100.000 TL"
                                        value={needForm.budget}
                                        onChange={(e) => setNeedForm({ ...needForm, budget: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Son Tarih</label>
                                <input
                                    type="date"
                                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    value={needForm.deadline}
                                    onChange={(e) => setNeedForm({ ...needForm, deadline: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Açıklama</label>
                                <textarea
                                    required
                                    rows={4}
                                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    placeholder="İhtiyacınızı detaylıca açıklayın..."
                                    value={needForm.description}
                                    onChange={(e) => setNeedForm({ ...needForm, description: e.target.value })}
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={creatingLoading}
                                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-bold transition-colors disabled:opacity-50"
                            >
                                {creatingLoading ? 'Oluşturuluyor...' : 'Talep Oluştur'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Proposal Modal */}
            {showProposalModal && selectedNeed && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
                        <h3 className="text-2xl font-bold text-slate-900 mb-2">Teklif Ver</h3>
                        <p className="text-slate-600 mb-6 text-sm">
                            <span className="font-semibold text-emerald-600">{selectedNeed.title}</span> ilanına teklif gönderin
                        </p>

                        {/* Price Field */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Teklif Fiyatı (TRY) <span className="text-slate-400">(Opsiyonel)</span>
                            </label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">₺</span>
                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    className="w-full pl-8 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                                    placeholder="Örn: 50000"
                                    value={proposalPrice}
                                    onChange={(e) => setProposalPrice(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Quick Templates */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Hızlı Mesaj Şablonları
                            </label>
                            <div className="grid grid-cols-1 gap-2">
                                {proposalTemplates.map((template, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setProposalMessage(template)}
                                        className="text-left text-xs p-2.5 bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 rounded-lg transition-colors"
                                    >
                                        {template}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Message Field */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Mesajınız <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none resize-none h-32"
                                placeholder="Teklif detaylarınızı yazın..."
                                value={proposalMessage}
                                onChange={(e) => setProposalMessage(e.target.value)}
                                required
                            />
                        </div>

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setShowProposalModal(false)}
                                className="btn btn-secondary"
                            >
                                İptal
                            </button>
                            <button
                                onClick={handleSendProposal}
                                disabled={sendingProposal || !proposalMessage.trim()}
                                className="btn btn-primary"
                            >
                                {sendingProposal ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" /> Gönderiliyor...
                                    </>
                                ) : (
                                    <>
                                        <Send className="w-4 h-4" /> Teklifi Gönder
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Contact Match Modal */}
            {showContactModal && selectedMatch && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
                        <h3 className="text-xl font-bold text-slate-900 mb-4">Teklif Gönder</h3>
                        <p className="text-slate-600 mb-4 text-sm">
                            <span className="font-semibold">{selectedMatch.name}</span> şirketine teklif gönderin:
                        </p>
                        <textarea
                            className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none resize-none h-32"
                            placeholder="Teklif detaylarınızı yazın..."
                            value={contactMessage}
                            onChange={(e) => setContactMessage(e.target.value)}
                        />
                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                onClick={() => setShowContactModal(false)}
                                className="btn btn-secondary"
                            >
                                İptal
                            </button>
                            <button
                                onClick={handleSendContact}
                                disabled={sendingContact || !contactMessage.trim()}
                                className="btn btn-primary"
                            >
                                {sendingContact ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" /> Gönderiliyor...
                                    </>
                                ) : (
                                    <>
                                        <Send className="w-4 h-4" /> Gönder
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Matches Modal */}
            {showMatches && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6 shadow-2xl">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h2 className="text-2xl font-bold text-slate-900">Eşleşen Şirketler</h2>
                                <p className="text-emerald-600 font-medium">İhtiyaca uygun potansiyel tedarikçiler.</p>
                            </div>
                            <button onClick={() => setShowMatches(false)} className="p-2 hover:bg-slate-100 rounded-full">
                                <span className="text-2xl">&times;</span>
                            </button>
                        </div>

                        {loadingMatches ? (
                            <div className="flex justify-center py-12">
                                <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
                            </div>
                        ) : matches.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {matches.map((company) => (
                                    <div key={company.id} className="border border-slate-200 rounded-xl p-4 hover:border-emerald-500 transition-colors">
                                        <div className="flex items-center gap-4 mb-3">
                                            <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center overflow-hidden">
                                                {company.logo ? (
                                                    <img src={company.logo} alt={company.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <Building2 className="w-6 h-6 text-slate-400" />
                                                )}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-slate-900">{company.name}</h3>
                                                <p className="text-sm text-slate-500">{company.city}</p>
                                            </div>
                                        </div>
                                        <p className="text-sm text-slate-600 mb-4 line-clamp-2">{company.description}</p>
                                        <div className="flex flex-col gap-2">
                                            <button
                                                onClick={() => handleOpenContact(company)}
                                                className="w-full btn btn-primary text-sm py-2"
                                            >
                                                <MessageSquare className="w-4 h-4" />
                                                Teklif Ver
                                            </button>
                                            <Link
                                                to={`/chat?companyId=${company.id}`}
                                                className="w-full btn btn-outline text-sm py-2 text-center"
                                            >
                                                <MessageSquare className="w-4 h-4" />
                                                Mesaj Gönder
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 bg-slate-50 rounded-xl">
                                <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                                <p className="text-slate-500">Şu an için tam eşleşen şirket bulunamadı.</p>
                            </div>
                        )}

                        <div className="mt-6 flex justify-end">
                            <button
                                onClick={() => setShowMatches(false)}
                                className="bg-slate-900 text-white px-6 py-2 rounded-xl font-bold hover:bg-slate-800 transition-colors"
                            >
                                Kapat
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
                {loading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="w-10 h-10 animate-spin text-emerald-600" />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        {needs.map((need, index) => (
                            <motion.div
                                key={need.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="group bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-xl hover:border-emerald-500/30 transition-all duration-300"
                            >
                                <div className="flex flex-col md:flex-row gap-6">
                                    {/* Company Info */}
                                    <div className="md:w-64 flex-shrink-0 flex flex-row md:flex-col items-center md:items-start gap-4 md:border-r md:border-slate-100 md:pr-6">
                                        <div className="w-16 h-16 rounded-xl bg-slate-100 flex items-center justify-center overflow-hidden border border-slate-200">
                                            {need.company.logo ? (
                                                <img src={need.company.logo} alt={need.company.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <Building2 className="w-8 h-8 text-slate-400" />
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-slate-900 line-clamp-1">{need.company.name}</h3>
                                            <div className="flex items-center gap-1 text-sm text-slate-500 mt-1">
                                                <MapPin className="w-3 h-3" />
                                                {need.company.city}
                                            </div>
                                            {need.company.isPremium && (
                                                <span className="inline-block mt-2 px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-bold rounded-full">
                                                    Premium Üye
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Need Details */}
                                    <div className="flex-1">
                                        <div className="flex items-start justify-between mb-2">
                                            <span className="text-xs font-bold tracking-wider text-emerald-600 uppercase bg-emerald-50 px-2 py-1 rounded-md">
                                                {INDUSTRY_LABELS[need.industryType as keyof typeof INDUSTRY_LABELS] || need.industryType}
                                            </span>
                                            <span className="text-sm text-slate-400 flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                {new Date(need.createdAt).toLocaleDateString('tr-TR')}
                                            </span>
                                        </div>
                                        <h2 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-emerald-700 transition-colors">
                                            {need.title}
                                        </h2>
                                        <p className="text-slate-600 mb-6 line-clamp-2">
                                            {need.description}
                                        </p>

                                        <div className="flex flex-wrap gap-4 text-sm">
                                            {need.quantity && (
                                                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 text-slate-700 font-medium">
                                                    <Briefcase className="w-4 h-4 text-slate-400" />
                                                    Miktar: {need.quantity}
                                                </div>
                                            )}
                                            {need.budget && (
                                                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 text-slate-700 font-medium">
                                                    <DollarSign className="w-4 h-4 text-slate-400" />
                                                    Bütçe: {need.budget}
                                                </div>
                                            )}
                                            {need.deadline && (
                                                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-50 text-red-700 font-medium">
                                                    <Clock className="w-4 h-4 text-red-400" />
                                                    Son Tarih: {new Date(need.deadline).toLocaleDateString('tr-TR')}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Action */}
                                    <div className="flex flex-col justify-center gap-2 md:pl-6 md:border-l md:border-slate-100 min-w-[160px]">
                                        {user?.company?.id === need.company.id ? (
                                            <button
                                                onClick={() => handleViewMatches(need.id)}
                                                className="btn btn-outline whitespace-nowrap flex items-center gap-2 justify-center"
                                            >
                                                <Sparkles className="w-4 h-4" />
                                                Eşleşenleri Gör
                                            </button>
                                        ) : (
                                            <>
                                                <button
                                                    onClick={() => handleOpenProposal(need)}
                                                    className="btn btn-primary whitespace-nowrap flex items-center gap-2 justify-center"
                                                >
                                                    <MessageSquare className="w-4 h-4" />
                                                    Teklif Ver
                                                </button>
                                                <Link
                                                    to={`/chat?companyId=${need.company.id}`}
                                                    className="btn btn-outline whitespace-nowrap text-sm flex items-center gap-2 justify-center"
                                                >
                                                    <MessageSquare className="w-4 h-4" />
                                                    Mesaj Gönder
                                                </Link>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
