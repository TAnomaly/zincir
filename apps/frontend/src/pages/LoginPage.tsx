import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Canvas } from '@react-three/fiber';
import { motion } from 'framer-motion';
import { useAuthStore } from '../store/authStore';
import { LogIn, AlertCircle } from 'lucide-react';
import ShaderBackgroundVariants from '../components/ShaderBackgroundVariants';
import ShaderButton from '../components/ShaderButton';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const user = await login(email, password);

      if (user?.role === 'ADMIN') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Giriş yapılırken bir hata oluştu');
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Shader Background */}
      <div className="absolute inset-0 z-0">
        <Canvas camera={{ position: [0, 0, 1] }}>
          <ShaderBackgroundVariants variant="subtle" />
        </Canvas>
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-md w-full"
        >
          {/* Glassmorphic Card */}
          <div className="glass-panel p-8 dither-border">
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring' }}
                className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-4 glow-emerald"
              >
                <LogIn className="w-8 h-8 text-slate-950" />
              </motion.div>
              <h2 className="text-3xl font-black text-white">Giriş Yap</h2>
              <p className="text-slate-400 mt-2">Hesabınıza erişin</p>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="mb-6 p-4 bg-red-500/10 border border-red-500/20 backdrop-blur-sm text-red-400 rounded-xl flex items-start gap-3"
              >
                <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <span className="text-sm">{error}</span>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-slate-300 mb-2">
                  E-posta
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  className="input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ornek@email.com"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-slate-300 mb-2">
                  Şifre
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  className="input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </div>

              <ShaderButton
                variant="primary"
                size="lg"
                className="w-full"
                disabled={isLoading}
                onClick={handleSubmit}
              >
                {isLoading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
              </ShaderButton>
            </form>

            <div className="mt-6 text-center">
              <p className="text-slate-400">
                Hesabınız yok mu?{' '}
                <Link to="/register" className="text-emerald-400 hover:text-emerald-300 font-semibold transition-colors">
                  Kayıt olun
                </Link>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
