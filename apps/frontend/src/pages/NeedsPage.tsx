import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import { INDUSTRY_LABELS } from '../types';
import {
    Search, Filter, Briefcase, Clock, DollarSign,
    ArrowRight, Loader2, Building2, MapPin
} from 'lucide-react';
import { motion } from 'framer-motion';

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
    const [needs, setNeeds] = useState<Need[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filters, setFilters] = useState({
        industryType: '',
        status: 'ACTIVE',
    });

    useEffect(() => {
        fetchNeeds();
    }, [filters]);

    const fetchNeeds = async () => {
        setLoading(true);
        try {
            const params: any = { ...filters };
            if (searchQuery.trim()) {
                params.search = searchQuery;
            }
            const { data } = await api.get('/needs', { params });
            setNeeds(data.needs || []);
        } catch (error) {
            console.error('İhtiyaçlar yüklenemedi:', error);
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

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            {/* Header Section */}
            <div className="bg-slate-900 text-white pt-24 pb-16 px-4 relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-emerald-900/40 via-slate-900 to-slate-900" />
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
                        <button
                            onClick={handleSearch}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-xl font-bold transition-colors"
                        >
                            Ara
                        </button>
                    </div>
                </div>
            </div>

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
                                    <div className="flex flex-col justify-center md:pl-6 md:border-l md:border-slate-100">
                                        <Link
                                            to={`/companies/${need.company.slug}`}
                                            className="btn btn-primary whitespace-nowrap"
                                        >
                                            İletişime Geç <ArrowRight className="w-4 h-4" />
                                        </Link>
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
