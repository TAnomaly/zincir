import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import { Calendar, User, ArrowRight, Clock, BookOpen } from 'lucide-react';
import { api } from '../lib/api';
import ShaderBackgroundVariants from '../components/ShaderBackgroundVariants';
import AnimatedCard from '../components/AnimatedCard';
import ShaderButton from '../components/ShaderButton';

interface BlogPost {
    id: string;
    title: string;
    excerpt: string;
    content: string;
    coverImage?: string;
    author: {
        name: string;
        avatar?: string;
    };
    category: string;
    readTime: number;
    createdAt: string;
}

export default function BlogPage() {
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [selectedCategory, setSelectedCategory] = useState('Tümü');

    const categories = ['Tümü', 'Sektörel Haberler', 'Başarı Hikayeleri', 'İhracat İpuçları', 'Teknoloji'];

    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        try {
            const { data } = await api.get('/blog');
            setPosts(data.posts || []);
        } catch (error) {
            // Fallback mock data
            setPosts([
                {
                    id: '1',
                    title: '2024 Yılında İhracatta Öne Çıkan Sektörler',
                    excerpt: 'Türkiye\'nin ihracat potansiyeli en yüksek sektörlerini ve global pazardaki fırsatları detaylıca inceledik.',
                    content: '',
                    coverImage: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
                    author: { name: 'Ahmet Yılmaz' },
                    category: 'Sektörel Haberler',
                    readTime: 5,
                    createdAt: new Date().toISOString()
                },
                {
                    id: '2',
                    title: 'Dijital Dönüşüm ile Tedarik Zinciri Yönetimi',
                    excerpt: 'Tedarik zinciri süreçlerinizi dijitalleştirerek nasıl verimlilik sağlayabileceğinizi ve maliyetleri düşürebileceğinizi öğrenin.',
                    content: '',
                    coverImage: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
                    author: { name: 'Zeynep Demir' },
                    category: 'Teknoloji',
                    readTime: 7,
                    createdAt: new Date(Date.now() - 86400000).toISOString()
                },
                {
                    id: '3',
                    title: 'KOBİ\'ler İçin E-İhracat Rehberi',
                    excerpt: 'Küçük ve orta ölçekli işletmelerin global pazara açılırken dikkat etmesi gereken stratejik adımlar.',
                    content: '',
                    coverImage: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
                    author: { name: 'Mehmet Kaya' },
                    category: 'İhracat İpuçları',
                    readTime: 6,
                    createdAt: new Date(Date.now() - 172800000).toISOString()
                }
            ]);
        }
    };

    const filteredPosts = selectedCategory === 'Tümü'
        ? posts
        : posts.filter(post => post.category === selectedCategory);

    return (
        <div className="min-h-screen bg-slate-800 pb-20">
            {/* Header with Shader */}
            <div className="relative pt-32 pb-20 px-4 overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <Canvas camera={{ position: [0, 0, 1] }}>
                        <ShaderBackgroundVariants variant="subtle" />
                    </Canvas>
                </div>

                <div className="max-w-7xl mx-auto relative z-10 text-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ type: 'spring' }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-bold mb-6"
                    >
                        <BookOpen className="w-4 h-4" /> İş Dünyası İçgörüleri
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-5xl md:text-7xl font-black mb-6 tracking-tight text-white"
                    >
                        Zincir <span className="text-gradient">Blog</span>
                    </motion.h1>
                    <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto">
                        İş dünyasından haberler, sektörel analizler ve başarı hikayeleri.
                    </p>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-20">
                {/* Categories */}
                <div className="flex flex-wrap justify-center gap-3 mb-12">
                    {categories.map((category) => (
                        <ShaderButton
                            key={category}
                            onClick={() => setSelectedCategory(category)}
                            variant={selectedCategory === category ? 'primary' : 'secondary'}
                            size="md"
                        >
                            {category}
                        </ShaderButton>
                    ))}
                </div>

                {/* Posts Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredPosts.map((post, index) => (
                        <AnimatedCard key={post.id} delay={index * 0.1}>
                            <div className="relative h-48 overflow-hidden rounded-t-xl -mx-6 -mt-6 mb-6">
                                <img
                                    src={post.coverImage}
                                    alt={post.title}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80"
                                />
                                <div className="absolute top-4 left-4">
                                    <span className="px-3 py-1 bg-emerald-500/90 backdrop-blur text-white text-xs font-bold rounded-full">
                                        {post.category}
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 text-xs text-slate-400 mb-4">
                                <span className="flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    {new Date(post.createdAt).toLocaleDateString('tr-TR')}
                                </span>
                                <span className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {post.readTime} dk okuma
                                </span>
                            </div>

                            <h2 className="text-xl font-bold text-white mb-3 line-clamp-2 hover:text-emerald-400 transition-colors">
                                {post.title}
                            </h2>

                            <p className="text-slate-300 text-sm mb-6 line-clamp-3 leading-relaxed">
                                {post.excerpt}
                            </p>

                            <div className="flex items-center justify-between pt-6 border-t border-white/10">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-emerald-400">
                                        <User className="w-4 h-4" />
                                    </div>
                                    <span className="text-sm font-medium text-slate-300">{post.author.name}</span>
                                </div>
                                <button className="text-emerald-400 hover:text-emerald-300 font-bold text-sm flex items-center gap-1 transition-colors">
                                    Oku <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                        </AnimatedCard>
                    ))}
                </div>
            </div>
        </div>
    );
}
