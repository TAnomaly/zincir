import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Check, Trash2, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';

interface Notification {
    id: string;
    title: string;
    message: string;
    type: string;
    link?: string;
    isRead: boolean;
    createdAt: string;
}

export default function NotificationDropdown() {
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const fetchNotifications = async () => {
        try {
            const { data } = await api.get('/notifications?limit=5');
            setNotifications(data.notifications);
            setUnreadCount(data.unreadCount);
        } catch (error) {
            // console.error('Bildirimler alınamadı', error);
        }
    };

    const markAsRead = async (id: string) => {
        try {
            await api.put(`/notifications/${id}/read`);
            setNotifications(prev =>
                prev.map(n => n.id === id ? { ...n, isRead: true } : n)
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            // console.error('Bildirim güncellenemedi', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await api.put('/notifications/mark-all-read');
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            setUnreadCount(0);
        } catch (error) {
            // console.error('Bildirimler güncellenemedi', error);
        }
    };

    const deleteNotification = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            await api.delete(`/notifications/${id}`);
            setNotifications(prev => prev.filter(n => n.id !== id));
        } catch (error) {
            // console.error('Bildirim silinemedi', error);
        }
    };

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 60000); // Poll every minute
        return () => clearInterval(interval);
    }, []);

    // Close click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-full transition-colors"
            >
                <Bell className="w-6 h-6" />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white">
                        {unreadCount}
                    </span>
                )}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 mt-2 w-80 md:w-96 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-50"
                    >
                        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <h3 className="font-bold text-slate-800">Bildirimler</h3>
                            {unreadCount > 0 && (
                                <button
                                    onClick={markAllAsRead}
                                    className="text-xs text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1"
                                >
                                    <Check className="w-3 h-3" />
                                    Tümünü Okundu İşaretle
                                </button>
                            )}
                        </div>

                        <div className="max-h-[400px] overflow-y-auto">
                            {notifications.length === 0 ? (
                                <div className="p-8 text-center text-slate-400">
                                    <Bell className="w-8 h-8 mx-auto mb-2 opacity-20" />
                                    <p className="text-sm">Henüz bildiriminiz yok</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-slate-50">
                                    {notifications.map((notification) => (
                                        <div
                                            key={notification.id}
                                            className={`p-4 hover:bg-slate-50 transition-colors relative group ${!notification.isRead ? 'bg-emerald-50/30' : ''}`}
                                            onClick={() => !notification.isRead && markAsRead(notification.id)}
                                        >
                                            <div className="flex gap-3">
                                                <div className={`w-2 h-2 mt-2 rounded-full flex-shrink-0 ${!notification.isRead ? 'bg-emerald-500' : 'bg-slate-200'}`} />
                                                <div className="flex-1">
                                                    <h4 className={`text-sm font-medium mb-1 ${!notification.isRead ? 'text-slate-900' : 'text-slate-600'}`}>
                                                        {notification.title}
                                                    </h4>
                                                    <p className="text-xs text-slate-500 leading-relaxed mb-2">
                                                        {notification.message}
                                                    </p>
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-[10px] text-slate-400">
                                                            {new Date(notification.createdAt).toLocaleDateString('tr-TR', {
                                                                day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit'
                                                            })}
                                                        </span>
                                                        {notification.link && (
                                                            <Link
                                                                to={notification.link}
                                                                className="text-xs text-emerald-600 hover:underline flex items-center gap-1"
                                                                onClick={() => setIsOpen(false)}
                                                            >
                                                                Görüntüle <ExternalLink className="w-3 h-3" />
                                                            </Link>
                                                        )}
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={(e) => deleteNotification(notification.id, e)}
                                                    className="absolute top-2 right-2 p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
