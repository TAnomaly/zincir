import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { Message } from '../types';
import { Inbox, Send, Loader2 } from 'lucide-react';
import AnimatedCard from '../components/AnimatedCard';

export default function MessagesPage() {
  const [activeTab, setActiveTab] = useState<'inbox' | 'sent'>('inbox');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMessages();
  }, [activeTab]);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const endpoint = activeTab === 'inbox' ? '/messages/inbox' : '/messages/sent';
      const { data } = await api.get(endpoint);
      setMessages(data);
    } catch (error) {
      // console.error('Mesajlar yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await api.put(`/messages/${id}/read`);
      fetchMessages();
    } catch (error) {
      // console.error('Mesaj okundu işaretlenirken hata:', error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-800 pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-white mb-8">Mesajlar</h1>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-white/10">
          <button
            onClick={() => setActiveTab('inbox')}
            className={`pb-3 px-4 font-medium transition-colors ${activeTab === 'inbox'
              ? 'border-b-2 border-emerald-500 text-emerald-400'
              : 'text-slate-400 hover:text-white'
              }`}
          >
            <Inbox className="w-4 h-4 inline mr-2" />
            Gelen Kutusu
          </button>
          <button
            onClick={() => setActiveTab('sent')}
            className={`pb-3 px-4 font-medium transition-colors ${activeTab === 'sent'
              ? 'border-b-2 border-emerald-500 text-emerald-400'
              : 'text-slate-400 hover:text-white'
              }`}
          >
            <Send className="w-4 h-4 inline mr-2" />
            Gönderilen
          </button>
        </div>

        {/* Messages */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-slate-400">Mesaj bulunmamaktadır</p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message, i) => (
              <AnimatedCard
                key={message.id}
                delay={i * 0.05}
              >
                <div
                  className={`cursor-pointer ${!message.isRead && activeTab === 'inbox' ? 'border-l-4 border-emerald-500' : ''}`}
                  onClick={() => {
                    if (!message.isRead && activeTab === 'inbox') {
                      markAsRead(message.id);
                    }
                  }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-emerald-500/20 rounded-full flex items-center justify-center border border-emerald-500/30">
                        {activeTab === 'inbox' ? (
                          <span className="text-sm font-semibold text-emerald-400">
                            {message.senderCompany.name?.charAt(0)}
                          </span>
                        ) : (
                          <span className="text-sm font-semibold text-emerald-400">
                            {message.receiverCompany.name?.charAt(0)}
                          </span>
                        )}
                      </div>
                      <div>
                        <div className="font-semibold text-white">
                          {activeTab === 'inbox'
                            ? message.senderCompany.name
                            : message.receiverCompany.name}
                        </div>
                        {message.subject && (
                          <div className="text-sm text-slate-400">{message.subject}</div>
                        )}
                      </div>
                    </div>
                    <div className="text-sm text-slate-400">
                      {new Date(message.createdAt).toLocaleDateString('tr-TR')}
                    </div>
                  </div>
                  <p className="text-slate-300 whitespace-pre-wrap">{message.content}</p>
                  {!message.isRead && activeTab === 'inbox' && (
                    <div className="mt-2">
                      <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 text-xs font-bold rounded-full">Yeni</span>
                    </div>
                  )}
                </div>
              </AnimatedCard>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
