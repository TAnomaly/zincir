import { useEffect, useState, useRef } from 'react';
import { api } from '../lib/api';
import { useAuthStore } from '../store/authStore';
import { Loader2, Send, Search, MessageCircle } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';

interface Conversation {
    otherUser: {
        id: string;
        companyId: string;
        name: string;
        logo: string | null;
        slug: string;
    };
    lastMessage: {
        content: string;
        createdAt: string;
        isRead: boolean;
        senderId: string;
    };
    unreadCount: number;
}

interface Message {
    id: string;
    senderId: string;
    receiverId: string;
    content: string;
    createdAt: string;
    isRead: boolean;
    senderCompany: {
        name: string;
        logo: string | null;
    };
}

export default function ChatPage() {
    const { user } = useAuthStore();
    const [searchParams] = useSearchParams();
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [loadingConversations, setLoadingConversations] = useState(true);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [newMessage, setNewMessage] = useState('');
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [autoStartLoading, setAutoStartLoading] = useState(false);

    const fetchConversations = async () => {
        try {
            const { data } = await api.get('/messages/conversations');
            setConversations(data);
        } catch (error) {
            // console.error('Konuşmalar yüklenemedi', error);
        } finally {
            setLoadingConversations(false);
        }
    };

    const fetchMessages = async (userId: string) => {
        setLoadingMessages(true);
        try {
            const { data } = await api.get(`/messages/${userId}`);
            setMessages(data);
            // Update unread count locally
            setConversations(prev => prev.map(c =>
                c.otherUser.id === userId ? { ...c, unreadCount: 0 } : c
            ));
        } catch (error) {
            // console.error('Mesajlar yüklenemedi', error);
        } finally {
            setLoadingMessages(false);
        }
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedUserId) return;

        setSending(true);
        try {
            const { data } = await api.post('/messages', {
                receiverId: selectedUserId,
                content: newMessage,
            });

            setMessages([...messages, data.data]);
            setNewMessage('');

            // Update conversation list order
            fetchConversations();
        } catch (error) {
            // console.error('Mesaj gönderilemedi', error);
            alert('Mesaj gönderilemedi');
        } finally {
            setSending(false);
        }
    };

    useEffect(() => {
        fetchConversations();
        // Poll for new conversations every 30 seconds
        const interval = setInterval(fetchConversations, 30000);
        return () => clearInterval(interval);
    }, []);

    // Auto-start chat if userId or companyId is provided
    useEffect(() => {
        const userId = searchParams.get('userId');
        const companyId = searchParams.get('companyId');

        if (userId && !selectedUserId) {
            // Direct user ID provided - use it immediately
            setSelectedUserId(userId);
        } else if (companyId && conversations.length > 0 && !selectedUserId) {
            // Find user by companyId
            const conversation = conversations.find(c => c.otherUser.companyId === companyId);
            if (conversation) {
                setSelectedUserId(conversation.otherUser.id);
            } else {
                // If no conversation exists, fetch the company to get owner's userId
                setAutoStartLoading(true);
                api.get(`/companies/${companyId}`)
                    .then(({ data }) => {
                        if (data.ownerId) {
                            setSelectedUserId(data.ownerId);
                        }
                        setAutoStartLoading(false);
                    })
                    .catch(() => setAutoStartLoading(false));
            }
        }
    }, [conversations, searchParams, selectedUserId]);

    useEffect(() => {
        if (selectedUserId) {
            fetchMessages(selectedUserId);
            // Poll for new messages in active chat every 5 seconds
            const interval = setInterval(() => fetchMessages(selectedUserId), 5000);
            return () => clearInterval(interval);
        }
    }, [selectedUserId]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const selectedConversation = conversations.find(c => c.otherUser.id === selectedUserId);

    return (
        <div className="min-h-screen bg-slate-50 pt-20 pb-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-[calc(100vh-8rem)]">
                <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden h-full flex">

                    {/* Sidebar - Conversations List */}
                    <div className={`w-full md:w-1/3 border-r border-slate-100 flex flex-col ${selectedUserId ? 'hidden md:flex' : 'flex'}`}>
                        <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                            <h2 className="text-xl font-bold text-slate-800 mb-4">Sohbetler</h2>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Sohbet ara..."
                                    className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                                />
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto">
                            {loadingConversations ? (
                                <div className="flex justify-center p-8">
                                    <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
                                </div>
                            ) : conversations.length === 0 ? (
                                <div className="text-center p-8 text-slate-500">
                                    <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                    <p>Henüz hiç mesajınız yok.</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-slate-50">
                                    {conversations.map((conv) => (
                                        <button
                                            key={conv.otherUser.id}
                                            onClick={() => setSelectedUserId(conv.otherUser.id)}
                                            className={`w-full p-4 flex items-center gap-4 hover:bg-slate-50 transition-colors text-left ${selectedUserId === conv.otherUser.id ? 'bg-emerald-50 hover:bg-emerald-50' : ''}`}
                                        >
                                            <div className="relative">
                                                {conv.otherUser.logo ? (
                                                    <img src={conv.otherUser.logo} alt="" className="w-12 h-12 rounded-full object-cover border border-slate-200" />
                                                ) : (
                                                    <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-lg">
                                                        {conv.otherUser.name.charAt(0)}
                                                    </div>
                                                )}
                                                {conv.unreadCount > 0 && (
                                                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold flex items-center justify-center rounded-full border-2 border-white">
                                                        {conv.unreadCount}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-baseline mb-1">
                                                    <h3 className="font-semibold text-slate-900 truncate">{conv.otherUser.name}</h3>
                                                    <span className="text-xs text-slate-400 whitespace-nowrap ml-2">
                                                        {new Date(conv.lastMessage.createdAt).toLocaleDateString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                                <p className={`text-sm truncate ${conv.unreadCount > 0 ? 'font-semibold text-slate-800' : 'text-slate-500'}`}>
                                                    {conv.lastMessage.senderId === user?.id && 'Siz: '}
                                                    {conv.lastMessage.content}
                                                </p>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Main Chat Area */}
                    <div className={`flex-1 flex flex-col bg-slate-50/30 ${!selectedUserId ? 'hidden md:flex' : 'flex'}`}>
                        {selectedUserId ? (
                            <>
                                {/* Chat Header */}
                                <div className="p-4 bg-white border-b border-slate-100 flex items-center gap-4 shadow-sm z-10">
                                    <button
                                        onClick={() => setSelectedUserId(null)}
                                        className="md:hidden p-2 -ml-2 hover:bg-slate-100 rounded-full"
                                    >
                                        <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                                    </button>

                                    {selectedConversation?.otherUser.logo ? (
                                        <img src={selectedConversation.otherUser.logo} alt="" className="w-10 h-10 rounded-full object-cover border border-slate-200" />
                                    ) : (
                                        <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold">
                                            {selectedConversation?.otherUser.name.charAt(0)}
                                        </div>
                                    )}

                                    <div>
                                        <h3 className="font-bold text-slate-900">{selectedConversation?.otherUser.name}</h3>
                                        <Link to={`/companies/${selectedConversation?.otherUser.slug}`} className="text-xs text-emerald-600 hover:underline">
                                            Şirket Profilini Görüntüle
                                        </Link>
                                    </div>
                                </div>

                                {/* Messages List */}
                                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
                                    {loadingMessages ? (
                                        <div className="flex justify-center p-8">
                                            <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
                                        </div>
                                    ) : (
                                        messages.map((msg) => {
                                            const isMe = msg.senderId === user?.id;
                                            return (
                                                <motion.div
                                                    key={msg.id}
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                                                >
                                                    <div className={`max-w-[80%] md:max-w-[70%] rounded-2xl p-4 shadow-sm ${isMe
                                                        ? 'bg-emerald-600 text-white rounded-tr-none'
                                                        : 'bg-white text-slate-800 border border-slate-100 rounded-tl-none'
                                                        }`}>
                                                        <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.content}</p>
                                                        <div className={`text-[10px] mt-1 text-right ${isMe ? 'text-emerald-100' : 'text-slate-400'}`}>
                                                            {new Date(msg.createdAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                                                            {isMe && (
                                                                <span className="ml-1">
                                                                    {msg.isRead ? '✓✓' : '✓'}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            );
                                        })
                                    )}
                                    <div ref={messagesEndRef} />
                                </div>

                                {/* Input Area */}
                                <div className="p-4 bg-white border-t border-slate-100">
                                    <form onSubmit={handleSendMessage} className="flex gap-2">
                                        <input
                                            type="text"
                                            value={newMessage}
                                            onChange={(e) => setNewMessage(e.target.value)}
                                            placeholder="Mesajınızı yazın..."
                                            className="flex-1 p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                                        />
                                        <button
                                            type="submit"
                                            disabled={sending || !newMessage.trim()}
                                            className="btn btn-primary p-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                                        </button>
                                    </form>
                                </div>
                            </>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8">
                                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                                    <MessageCircle className="w-10 h-10 text-slate-300" />
                                </div>
                                <h3 className="text-lg font-medium text-slate-600 mb-2">Sohbet Başlatın</h3>
                                <p className="text-center max-w-xs">
                                    Sol taraftaki listeden bir kişi seçin veya şirket profillerinden yeni bir sohbet başlatın.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
