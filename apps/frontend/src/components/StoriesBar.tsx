import { useEffect, useState } from 'react';
import { Plus, Loader2 } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { api } from '../lib/api';
import { motion } from 'framer-motion';

interface Story {
    id: string;
    mediaUrl: string;
    mediaType: 'image' | 'video';
    caption?: string;
    createdAt: string;
}

interface CompanyStories {
    company: {
        id: string;
        name: string;
        slug: string;
        logo?: string;
    };
    stories: Story[];
}

interface StoriesBarProps {
    onCreateStory: () => void;
    onViewStory: (companyId: string, stories: Story[]) => void;
}

export default function StoriesBar({ onCreateStory, onViewStory }: StoriesBarProps) {
    const { user } = useAuthStore();
    const [storiesData, setStoriesData] = useState<CompanyStories[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStories();
    }, []);

    const fetchStories = async () => {
        try {
            const { data } = await api.get('/stories');
            setStoriesData(data);
        } catch (error) {
            // console.error('Hikayeler yüklenemedi', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex gap-4 p-4 overflow-x-auto scrollbar-hide">
                {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex flex-col items-center space-y-2 min-w-[72px]">
                        <div className="w-16 h-16 rounded-full bg-slate-200 animate-pulse" />
                        <div className="w-12 h-3 bg-slate-200 rounded animate-pulse" />
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="flex gap-4 p-4 overflow-x-auto scrollbar-hide bg-white rounded-xl shadow-sm border border-slate-100 mb-6">
            {/* Add Story Button (Only if user has company) */}
            {user?.company && (
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onCreateStory}
                    className="flex flex-col items-center space-y-2 min-w-[72px] group"
                >
                    <div className="relative w-16 h-16 rounded-full border-2 border-dashed border-slate-300 flex items-center justify-center group-hover:border-emerald-500 transition-colors">
                        {user.company.logo ? (
                            <img
                                src={user.company.logo}
                                alt="My Company"
                                className="w-full h-full rounded-full object-cover opacity-50 group-hover:opacity-100 transition-opacity"
                            />
                        ) : (
                            <div className="w-full h-full rounded-full bg-slate-50" />
                        )}
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="bg-emerald-500 text-white rounded-full p-1 shadow-lg">
                                <Plus className="w-5 h-5" />
                            </div>
                        </div>
                    </div>
                    <span className="text-xs font-medium text-slate-600 truncate w-full text-center">
                        Hikaye Ekle
                    </span>
                </motion.button>
            )}

            {/* Stories List */}
            {storiesData.map((item) => (
                <motion.button
                    key={item.company.id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onViewStory(item.company.id, item.stories)}
                    className="flex flex-col items-center space-y-2 min-w-[72px]"
                >
                    <div className="w-16 h-16 rounded-full p-[2px] bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500">
                        <div className="w-full h-full rounded-full border-2 border-white overflow-hidden bg-white">
                            {item.company.logo ? (
                                <img
                                    src={item.company.logo}
                                    alt={item.company.name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-400 font-bold text-xl">
                                    {item.company.name.charAt(0)}
                                </div>
                            )}
                        </div>
                    </div>
                    <span className="text-xs font-medium text-slate-700 truncate w-16 text-center">
                        {item.company.name}
                    </span>
                </motion.button>
            ))}
        </div>
    );
}
