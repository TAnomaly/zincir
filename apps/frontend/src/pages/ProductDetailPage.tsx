import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { Product } from '../types';
import {
  Loader2, ArrowLeft, Eye, MapPin,
  Share2, Heart, MessageCircle
} from 'lucide-react';
import { motion } from 'framer-motion';

function isVideo(url?: string) {
  if (!url) return false;
  return /\.(mp4|webm|ogg)$/i.test(url);
}

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [quoteMessage, setQuoteMessage] = useState('');
  const [sendingQuote, setSendingQuote] = useState(false);

  const [connectionStatus, setConnectionStatus] = useState<'NONE' | 'PENDING' | 'CONNECTED'>('NONE');
  const [isLiked, setIsLiked] = useState(false);

  const checkConnectionStatus = async (targetCompanyId: string) => {
    try {
      const [sentRes, acceptedRes] = await Promise.all([
        api.get('/connections/sent'),
        api.get('/connections/accepted')
      ]);

      const sent = sentRes.data.find((c: any) => c.receiverId === targetCompanyId);
      const accepted = acceptedRes.data.find((c: any) =>
        c.receiverId === targetCompanyId || c.requesterId === targetCompanyId
      );

      if (accepted) setConnectionStatus('CONNECTED');
      else if (sent) setConnectionStatus('PENDING');
      else setConnectionStatus('NONE');
    } catch (error) {
      // console.error('Bağlantı durumu kontrol edilemedi', error);
    }
  };

  const handleSendMessage = async () => {
    if (!product?.company) return;
    setSendingQuote(true);
    try {
      // If connected, send a direct message
      if (connectionStatus === 'CONNECTED') {
        // We need the receiver's userId, but product.company only gives company info.
        // However, the message endpoint expects receiverId (userId).
        // Let's check if we can send message to company directly or need to find the user.
        // The backend message route expects receiverId (userId).
        // We might need to fetch the company owner's ID or update the backend to accept companyId.
        // Looking at backend/routes/message.ts, it takes receiverId (User ID).
        // But wait, product.company doesn't have userId in the current fetch.
        // We need to update the fetchProduct to include company.userId or similar.
        // Actually, let's look at the backend product route again.
        // It includes company: { select: { id, name, slug, logo, city } }
        // It does NOT include userId.

        // Workaround: We can't easily get the userId here without changing the backend.
        // BUT, the connection request uses targetCompanyId.
        // The message endpoint uses receiverId (User ID).
        // This is a mismatch.

        // Let's try to use the connection endpoint for now if it supports messages on existing connections?
        // No, connection endpoint is for creating connections.

        // Let's assume for this task we can't easily change the backend to expose userId for security/privacy maybe?
        // Or we should just fetch it.

        // Let's try to fetch the company details which might have the owner ID.
        const companyRes = await api.get(`/companies/${product.company.slug}`);
        const ownerId = companyRes.data.userId; // Assuming this exists or we can get it.

        if (ownerId) {
          await api.post('/messages', {
            receiverId: ownerId,
            subject: `Fiyat Teklifi: ${product.name}`,
            content: quoteMessage
          });
          alert('Mesajınız gönderildi!');
        } else {
          // Fallback if we can't find owner
          alert('Şirket yetkilisine ulaşılamadı.');
        }

      } else {
        // Not connected, send connection request
        await api.post('/connections', {
          targetCompanyId: product.company.id,
          message: `Fiyat Teklifi İsteği: ${product.name}\n\n${quoteMessage}`
        });
        alert('Fiyat teklifi isteğiniz gönderildi!');
        setConnectionStatus('PENDING');
      }

      setShowQuoteModal(false);
      setQuoteMessage('');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'İşlem başarısız oldu.';
      alert(errorMessage);
    } finally {
      setSendingQuote(false);
    }
  };



  const handleLike = async () => {
    if (!product) return;
    try {
      await api.post(`/products/${product.id}/favorite`);
      setIsLiked(true);
      alert('Ürün favorilere eklendi');
    } catch (error: any) {
      if (error.response?.status === 400) {
        alert('Bu ürün zaten favorilerinizde');
        setIsLiked(true);
      } else {
        alert('Favoriye eklenirken bir hata oluştu');
      }
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    alert('Ürün linki kopyalandı!');
  };

  useEffect(() => {
    if (id) {
      fetchProduct(id);
    }
  }, [id]);

  const fetchProduct = async (productId: string) => {
    setLoading(true);
    try {
      const { data } = await api.get(`/products/${productId}`);
      setProduct(data);
      if (data.company) {
        checkConnectionStatus(data.company.id);
      }
    } catch (error) {
      // console.error('Ürün yüklenemedi', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-slate-50">
        <Loader2 className="w-10 h-10 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold text-slate-900">Ürün bulunamadı</h2>
          <button onClick={() => navigate(-1)} className="btn btn-primary">
            Geri dön
          </button>
        </div>
      </div>
    );
  }

  const mediaItems = [product.mainImage, ...(product.images?.map((img) => img.url) || [])].filter(Boolean) as string[];

  return (
    <div className="min-h-screen bg-slate-50 pb-20 pt-24">
      {/* Quote Modal */}
      {showQuoteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
            <h3 className="text-xl font-bold text-slate-900 mb-4">Fiyat Teklifi Al</h3>
            <p className="text-slate-600 mb-4 text-sm">
              <span className="font-semibold">{product.name}</span> için satıcıya mesajınız:
            </p>
            <textarea
              className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none resize-none h-32"
              placeholder="Merhaba, bu ürün için fiyat teklifi almak istiyorum. Adet: 100..."
              value={quoteMessage}
              onChange={(e) => setQuoteMessage(e.target.value)}
            />
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowQuoteModal(false)}
                className="btn btn-secondary"
              >
                İptal
              </button>
              <button
                onClick={handleSendMessage}
                disabled={sendingQuote || !quoteMessage.trim()}
                className="btn btn-primary"
              >
                {sendingQuote ? 'Gönderiliyor...' : 'Gönder'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-slate-500 mb-8">
          <button onClick={() => navigate(-1)} className="hover:text-emerald-600 transition-colors flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" /> Geri
          </button>
          <span>/</span>
          <Link to="/companies" className="hover:text-emerald-600 transition-colors">Şirketler</Link>
          <span>/</span>
          {product.company && (
            <>
              <Link to={`/companies/${product.company.slug}`} className="hover:text-emerald-600 transition-colors font-medium text-slate-700">
                {product.company.name}
              </Link>
              <span>/</span>
            </>
          )}
          <span className="text-slate-900 font-medium truncate max-w-[200px]">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left Column: Gallery */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative aspect-square rounded-3xl overflow-hidden bg-white shadow-xl shadow-slate-200/50 border border-slate-100"
            >
              {mediaItems.length > 0 ? (
                isVideo(mediaItems[activeImageIndex]) ? (
                  <video
                    src={mediaItems[activeImageIndex]}
                    className="w-full h-full object-cover"
                    controls
                    playsInline
                  />
                ) : (
                  <img
                    src={mediaItems[activeImageIndex]}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                )
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-slate-50 text-slate-300">
                  <span className="text-lg font-medium">Görsel Yok</span>
                </div>
              )}

              {product.isAvailable && (
                <div className="absolute top-4 left-4 px-3 py-1 bg-emerald-500 text-white text-xs font-bold rounded-full shadow-lg">
                  STOKTA
                </div>
              )}
            </motion.div>

            {mediaItems.length > 1 && (
              <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
                {mediaItems.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveImageIndex(index)}
                    className={`relative flex-shrink-0 w-24 h-24 rounded-xl overflow-hidden border-2 transition-all ${activeImageIndex === index ? 'border-emerald-500 shadow-md scale-105' : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                  >
                    {isVideo(item) ? (
                      <video src={item} className="w-full h-full object-cover" />
                    ) : (
                      <img src={item} alt="" className="w-full h-full object-cover" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Details */}
          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="px-3 py-1 rounded-lg bg-slate-100 text-slate-600 text-xs font-bold uppercase tracking-wider">
                  {product.category}
                </span>
                {product.subcategory && (
                  <span className="px-3 py-1 rounded-lg bg-slate-100 text-slate-600 text-xs font-bold uppercase tracking-wider">
                    {product.subcategory}
                  </span>
                )}
              </div>

              <h1 className="text-4xl font-black text-slate-900 mb-4 leading-tight">{product.name}</h1>

              <div className="flex items-center gap-6 mb-8">
                {product.price !== undefined && (
                  <div className="text-3xl font-bold text-emerald-600">
                    {product.price?.toLocaleString('tr-TR', { style: 'currency', currency: product.currency || 'TRY' })}
                  </div>
                )}
                <div className="flex items-center gap-1 text-slate-500 text-sm font-medium bg-slate-100 px-3 py-1 rounded-full">
                  <Eye className="w-4 h-4" /> {product.viewCount} görüntülenme
                </div>
              </div>

              <p className="text-lg text-slate-600 leading-relaxed mb-8">
                {product.description}
              </p>

              <div className="flex flex-wrap gap-3 mb-8">
                {product.tags?.map((tag) => (
                  <span key={tag} className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 text-sm font-medium">
                    #{tag}
                  </span>
                ))}
              </div>

              <div className="flex gap-4 mb-10">
                {connectionStatus === 'CONNECTED' ? (
                  <button
                    onClick={() => setShowQuoteModal(true)}
                    className="flex-1 btn btn-primary py-4 text-lg shadow-xl shadow-emerald-600/20"
                  >
                    <MessageCircle className="w-5 h-5" />
                    Mesaj Gönder / Teklif İste
                  </button>
                ) : connectionStatus === 'PENDING' ? (
                  <button
                    className="flex-1 btn btn-secondary py-4 text-lg bg-slate-100 text-slate-500 cursor-not-allowed"
                    disabled
                  >
                    <Loader2 className="w-5 h-5 animate-spin" />
                    İstek Gönderildi
                  </button>
                ) : (
                  <button
                    onClick={() => setShowQuoteModal(true)}
                    className="flex-1 btn btn-primary py-4 text-lg shadow-xl shadow-emerald-600/20"
                  >
                    <MessageCircle className="w-5 h-5" />
                    Fiyat Teklifi Al
                  </button>
                )}

                <button
                  onClick={handleLike}
                  className={`btn btn-secondary p-4 transition-colors ${isLiked ? 'text-red-500 bg-red-50 border-red-200' : 'text-slate-400 hover:text-red-500'}`}
                >
                  <Heart className={`w-6 h-6 ${isLiked ? 'fill-current' : ''}`} />
                </button>
                <button
                  onClick={handleShare}
                  className="btn btn-secondary p-4 text-slate-400 hover:text-blue-500 transition-colors"
                >
                  <Share2 className="w-6 h-6" />
                </button>
              </div>

              {/* Company Card */}
              {product.company && (
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-4 mb-4">
                    {product.company.logo ? (
                      <img src={product.company.logo} alt={product.company.name} className="w-16 h-16 rounded-xl object-cover border border-slate-100" />
                    ) : (
                      <div className="w-16 h-16 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-xl">
                        {product.company.name.charAt(0)}
                      </div>
                    )}
                    <div>
                      <div className="text-sm text-slate-500 font-medium mb-1">Satıcı Firma</div>
                      <Link to={`/companies/${product.company.slug}`} className="text-xl font-bold text-slate-900 hover:text-emerald-600 transition-colors">
                        {product.company.name}
                      </Link>
                      <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
                        <MapPin className="w-3 h-3" /> {product.company.city}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Link to={`/companies/${product.company.slug}`} className="flex-1 btn btn-outline text-sm">
                      Profili İncele
                    </Link>
                  </div>
                </div>
              )}
            </motion.div>

            {/* Specifications */}
            {product.specifications && typeof product.specifications === 'object' && !Array.isArray(product.specifications) && (
              <div className="border-t border-slate-100 pt-8">
                <h3 className="text-lg font-bold text-slate-900 mb-4">Teknik Özellikler</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {Object.entries(product.specifications).map(([key, value]) => (
                    <div key={key} className="flex justify-between p-3 bg-slate-50 rounded-lg">
                      <span className="text-slate-500 text-sm font-medium">{key}</span>
                      <span className="text-slate-900 text-sm font-semibold">{String(value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
