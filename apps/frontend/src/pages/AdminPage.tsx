import { useEffect, useState } from 'react';
import { Users, Building2, Package, MessageSquare, CheckCircle, XCircle } from 'lucide-react';
import { api } from '../lib/api';
import { useAuthStore } from '../store/authStore';

interface AdminStats {
    totalUsers: number;
    totalCompanies: number;
    totalProducts: number;
    totalMessages: number;
    activeCompanies: number;
    pendingCompanies: number;
}

interface Company {
    id: string;
    name: string;
    isActive: boolean;
    user: {
        email: string;
    };
}

export default function AdminPage() {
    const { token } = useAuthStore();
    const [stats, setStats] = useState<AdminStats | null>(null);
    const [companies, setCompanies] = useState<Company[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [statsRes, companiesRes] = await Promise.all([
                api.get('/admin/stats'),
                api.get('/admin/companies')
            ]);

            setStats(statsRes.data);
            setCompanies(companiesRes.data);
        } catch (error) {
            // console.error('Admin verileri yüklenemedi:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateCompanyStatus = async (id: string, isActive: boolean) => {
        try {
            await api.put(
                `/admin/companies/${id}/status`,
                { isActive }
            );
            fetchData(); // Listeyi yenile
        } catch (error) {
            // console.error('Durum güncellenemedi:', error);
        }
    };

    if (loading) {
        return <div className="p-8 text-center">Yükleniyor...</div>;
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Yönetici Paneli</h1>

            {/* İstatistikler */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
                <StatCard icon={Users} label="Kullanıcılar" value={stats?.totalUsers} color="blue" />
                <StatCard icon={Building2} label="Şirketler" value={stats?.totalCompanies} color="indigo" />
                <StatCard icon={Package} label="Ürünler" value={stats?.totalProducts} color="green" />
                <StatCard icon={MessageSquare} label="Mesajlar" value={stats?.totalMessages} color="purple" />
                <StatCard icon={CheckCircle} label="Aktif Şirket" value={stats?.activeCompanies} color="emerald" />
                <StatCard icon={XCircle} label="Onay Bekleyen" value={stats?.pendingCompanies} color="yellow" />
            </div>

            {/* Şirket Listesi */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">Şirket Yönetimi</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Şirket Adı</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">E-posta</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Durum</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">İşlemler</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {companies.map((company) => (
                                <tr key={company.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{company.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{company.user.email}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${company.isActive ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                            }`}>
                                            {company.isActive ? 'Aktif' : 'Pasif/Onay Bekliyor'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <button
                                            onClick={() => updateCompanyStatus(company.id, !company.isActive)}
                                            className={`text-sm font-medium ${company.isActive ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'
                                                }`}
                                        >
                                            {company.isActive ? 'Pasife Al' : 'Aktifleştir'}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

function StatCard({ icon: Icon, label, value, color }: any) {
    return (
        <div className="bg-white rounded-lg shadow p-4 flex items-center space-x-4">
            <div className={`p-3 rounded-full bg-${color}-100 text-${color}-600`}>
                <Icon className="w-6 h-6" />
            </div>
            <div>
                <p className="text-sm text-gray-500">{label}</p>
                <p className="text-xl font-bold text-gray-900">{value || 0}</p>
            </div>
        </div>
    );
}
