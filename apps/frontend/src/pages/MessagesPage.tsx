import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { Message } from '../types';
import { Inbox, Send, Loader2 } from 'lucide-react';

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
      console.error('Mesajlar yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await api.put(`/messages/${id}/read`);
      fetchMessages();
    } catch (error) {
      console.error('Mesaj okundu işaretlenirken hata:', error);
    }
  };

  return (
    <div className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Mesajlar</h1>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('inbox')}
            className={`pb-3 px-4 font-medium transition-colors ${
              activeTab === 'inbox'
                ? 'border-b-2 border-primary-600 text-primary-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Inbox className="w-4 h-4 inline mr-2" />
            Gelen Kutusu
          </button>
          <button
            onClick={() => setActiveTab('sent')}
            className={`pb-3 px-4 font-medium transition-colors ${
              activeTab === 'sent'
                ? 'border-b-2 border-primary-600 text-primary-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Send className="w-4 h-4 inline mr-2" />
            Gönderilen
          </button>
        </div>

        {/* Messages */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500">Mesaj bulunmamaktadır</p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`card cursor-pointer ${
                  !message.isRead && activeTab === 'inbox' ? 'border-primary-300 bg-primary-50' : ''
                }`}
                onClick={() => {
                  if (!message.isRead && activeTab === 'inbox') {
                    markAsRead(message.id);
                  }
                }}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                      {activeTab === 'inbox' ? (
                        <span className="text-sm font-semibold text-primary-600">
                          {message.senderCompany.name?.charAt(0)}
                        </span>
                      ) : (
                        <span className="text-sm font-semibold text-primary-600">
                          {message.receiverCompany.name?.charAt(0)}
                        </span>
                      )}
                    </div>
                    <div>
                      <div className="font-semibold">
                        {activeTab === 'inbox'
                          ? message.senderCompany.name
                          : message.receiverCompany.name}
                      </div>
                      {message.subject && (
                        <div className="text-sm text-gray-600">{message.subject}</div>
                      )}
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">
                    {new Date(message.createdAt).toLocaleDateString('tr-TR')}
                  </div>
                </div>
                <p className="text-gray-700 whitespace-pre-wrap">{message.content}</p>
                {!message.isRead && activeTab === 'inbox' && (
                  <div className="mt-2">
                    <span className="badge badge-primary text-xs">Yeni</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
