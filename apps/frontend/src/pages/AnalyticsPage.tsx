import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { Canvas } from '@react-three/fiber';
import { TrendingUp, Users, ShoppingBag, DollarSign, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import OptimizedShaderBackground from '../components/OptimizedShaderBackground';
import AnimatedCard from '../components/AnimatedCard';

export default function AnalyticsPage() {
    const [analytics, setAnalytics] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const { data } = await api.get('/analytics');
                setAnalytics(data);
            } catch (error) {
                console.error('Error fetching analytics:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchAnalytics();
    }, []);

    const stats = [
        {
            label: 'Toplam Görüntüleme',
            value: analytics?.totalViews || 0,
            change: '+12.5%',
            trend: 'up',
            icon: TrendingUp,
            color: 'emerald'
        },
        {
            label: 'Bağlantılar',
            value: analytics?.connectionCount || 0,
            change: '+8.2%',
            trend: 'up',
            icon: Users,
            color: 'cyan'
        },
        {
            label: 'Ürün Görüntüleme',
            value: analytics?.productViews || 0,
            change: '+15.3%',
            trend: 'up',
            icon: ShoppingBag,
            color: 'purple'
        },
        {
            label: 'Etkileşim Oranı',
            value: analytics?.engagementRate ? `${analytics.engagementRate}%` : '0%',
            change: '-2.1%',
            trend: 'down',
            icon: DollarSign,
            color: 'amber'
        },
    ];

    return (
        <div className="min-h-screen bg-slate-800 pb-20">
            {/* Hero with Shader */}
            <div className="relative pt-24 pb-16 px-4 overflow-hidden">
                <div className="absolute inset-0 z-0 opacity-40">
                    <Canvas camera={{ position: [0, 0, 1] }}>
                        <OptimizedShaderBackground variant="accent" />
                    </Canvas>
                </div>

                <div className="max-w-7xl mx-auto relative z-10 text-center">
                    <h1 className="text-5xl md:text-6xl font-black text-white mb-4">
                        Analiz <span className="text-gradient">Merkezi</span>
                    </h1>
                    <p className="text-xl text-slate-200 max-w-2xl mx-auto">
                        Şirketinizin performansını takip edin ve büyüme fırsatlarını keşfedin
                    </p>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="max-w-7xl mx-auto px-4 -mt-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    {stats.map((stat, i) => (
                        <AnimatedCard key={stat.label} delay={i * 0.1}>
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-sm text-slate-400 mb-1">{stat.label}</p>
                                    <p className="text-3xl font-black text-white mb-2">{stat.value}</p>
                                    <div className={`flex items-center gap-1 text-sm ${stat.trend === 'up' ? 'text-emerald-400' : 'text-red-400'}`}>
                                        {stat.trend === 'up' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                                        <span className="font-semibold">{stat.change}</span>
                                    </div>
                                </div>
                                <div className={`p-3 rounded-xl bg-${stat.color}-500/10`}>
                                    <stat.icon className={`w-6 h-6 text-${stat.color}-400`} />
                                </div>
                            </div>
                        </AnimatedCard>
                    ))}
                </div>

                {/* Charts Placeholder */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <AnimatedCard delay={0.4}>
                        <h3 className="text-xl font-bold text-white mb-4">Aylık Trend</h3>
                        <div className="h-64 flex items-center justify-center bg-slate-900/50 rounded-xl border border-white/5">
                            <p className="text-slate-400">Grafik yükleniyor...</p>
                        </div>
                    </AnimatedCard>

                    <AnimatedCard delay={0.5}>
                        <h3 className="text-xl font-bold text-white mb-4">En Çok Görüntülenen</h3>
                        <div className="h-64 flex items-center justify-center bg-slate-900/50 rounded-xl border border-white/5">
                            <p className="text-slate-400">Grafik yükleniyor...</p>
                        </div>
                    </AnimatedCard>
                </div>
            </div>
        </div>
    );
}
