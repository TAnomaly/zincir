import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, TrendingUp, Users, Package, Briefcase, Building2, User } from 'lucide-react';
import { api } from '../api';
import { Link } from 'react-router-dom';

interface AnalyticsData {
    profile: {
        totalViews: number;
        viewsLast7Days: number;
        viewsLast30Days: number;
    };
    products: {
        totalProducts: number;
        totalViews: number;
    };
    needs: {
        totalNeeds: number;
        totalViews: number;
    };
    recentVisitors: Array<{
        viewedAt: string;
        visitor: {
            type: 'COMPANY' | 'USER';
            id?: string;
            name?: string;
            slug?: string;
            logo?: string;
            email?: string;
            industryType?: string;
        };
    }>;
}

export const AnalyticsPage = () => {
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const { data } = await api.get('/analytics');
                setData(data);
            } catch (error) {
                console.error('Analitik verileri yüklenemedi:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchAnalytics();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="min-h-screen bg-slate-50 pt-24 px-4 text-center">
                <h2 className="text-2xl font-bold text-slate-800">Veri bulunamadı</h2>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-900">Analitikler</h1>
                    <p className="text-slate-600 mt-2">Şirket profilinizin ve içeriklerinizin performansını takip edin.</p>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                                <Eye className="w-6 h-6" />
                            </div>
                            <span className="text-sm font-medium text-green-600 bg-green-50 px-2 py-1 rounded-lg flex items-center gap-1">
                                <TrendingUp className="w-3 h-3" />
                                Son 30 gün
                            </span>
                        </div>
                        <h3 className="text-slate-500 text-sm font-medium">Toplam Profil Görüntülenme</h3>
                        <div className="flex items-baseline gap-2 mt-2">
                            <span className="text-3xl font-bold text-slate-900">{data.profile.totalViews}</span>
                            <span className="text-sm text-slate-400">({data.profile.viewsLast30Days} yeni)</span>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
                                <Package className="w-6 h-6" />
                            </div>
                        </div>
                        <h3 className="text-slate-500 text-sm font-medium">Ürün Etkileşimi</h3>
                        <div className="flex items-baseline gap-2 mt-2">
                            <span className="text-3xl font-bold text-slate-900">{data.products.totalViews}</span>
                            <span className="text-sm text-slate-400">görüntülenme / {data.products.totalProducts} ürün</span>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-orange-50 text-orange-600 rounded-xl">
                                <Briefcase className="w-6 h-6" />
                            </div>
                        </div>
                        <h3 className="text-slate-500 text-sm font-medium">İlan Etkileşimi</h3>
                        <div className="flex items-baseline gap-2 mt-2">
                            <span className="text-3xl font-bold text-slate-900">{data.needs.totalViews}</span>
                            <span className="text-sm text-slate-400">görüntülenme / {data.needs.totalNeeds} ilan</span>
                        </div>
                    </motion.div>
                </div>

                {/* Recent Visitors */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="p-6 border-b border-slate-100">
                        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                            <Users className="w-5 h-5 text-slate-400" />
                            Son Ziyaretçiler
                        </h2>
                    </div>
                    <div className="divide-y divide-slate-100">
                        {data.recentVisitors.length === 0 ? (
                            <div className="p-8 text-center text-slate-500">
                                Henüz ziyaretçi verisi yok.
                            </div>
                        ) : (
                            data.recentVisitors.map((visit, index) => (
                                <div key={index} className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden">
                                            {visit.visitor.logo ? (
                                                <img src={visit.visitor.logo} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                visit.visitor.type === 'COMPANY' ? <Building2 className="w-5 h-5 text-slate-400" /> : <User className="w-5 h-5 text-slate-400" />
                                            )}
                                        </div>
                                        <div>
                                            {visit.visitor.type === 'COMPANY' ? (
                                                <Link to={`/companies/${visit.visitor.slug}`} className="font-medium text-slate-900 hover:text-emerald-600">
                                                    {visit.visitor.name}
                                                </Link>
                                            ) : (
                                                <span className="font-medium text-slate-900">
                                                    {visit.visitor.email?.split('@')[0]}***
                                                </span>
                                            )}
                                            <div className="text-sm text-slate-500">
                                                {visit.visitor.type === 'COMPANY' ? visit.visitor.industryType : 'Bireysel Kullanıcı'}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-sm text-slate-400">
                                        {new Date(visit.viewedAt).toLocaleDateString('tr-TR', {
                                            day: 'numeric',
                                            month: 'long',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
