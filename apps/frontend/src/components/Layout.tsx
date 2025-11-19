import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import {
  LayoutDashboard, LogOut, Menu, X,
  Building2, Search, Globe, Briefcase, ChevronRight, MessageCircle, BookOpen
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import NotificationDropdown from './NotificationDropdown';

interface LayoutProps {
  children?: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { user, logout } = useAuthStore();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const isTransparentPage = location.pathname === '/' || location.pathname === '/needs';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Şirketler', path: '/companies', icon: Building2 },
    { name: 'İhtiyaçlar', path: '/needs', icon: Search },
    { name: 'Blog', path: '/blog', icon: BookOpen },
    { name: 'Platform', path: '/platform', icon: Globe },
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-emerald-500/30">
      {/* Navbar */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled || mobileMenuOpen || (location.pathname !== '/' && location.pathname !== '/needs')
          ? 'bg-white/90 backdrop-blur-md border-b border-slate-200/50 shadow-sm py-3'
          : 'bg-transparent py-5'
          }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/30 group-hover:scale-105 transition-transform duration-300">
                <Briefcase className="w-6 h-6" />
              </div>
              <span className={`text-2xl font-black tracking-tight transition-colors ${isScrolled || mobileMenuOpen || (location.pathname !== '/' && location.pathname !== '/needs') ? 'text-slate-900' : 'text-white'
                }`}>
                zincir<span className="text-emerald-500">.</span>
              </span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`text-sm font-semibold transition-colors flex items-center gap-2 hover:text-emerald-500 ${location.pathname === link.path
                    ? 'text-emerald-500'
                    : isScrolled || (location.pathname !== '/' && location.pathname !== '/needs') ? 'text-slate-600' : 'text-white/90 hover:text-white'
                    }`}
                >
                  {link.name}
                </Link>
              ))}
              {user && (
                <Link
                  to="/chat"
                  className={`text-sm font-semibold transition-colors flex items-center gap-2 hover:text-emerald-500 ${location.pathname === '/chat'
                    ? 'text-emerald-500'
                    : isScrolled || (location.pathname !== '/' && location.pathname !== '/needs') ? 'text-slate-600' : 'text-white/90 hover:text-white'
                    }`}
                >
                  Sohbet
                </Link>
              )}
            </div>

            {/* Auth Buttons */}
            <div className="hidden md:flex items-center gap-4">
              {user ? (
                <div className="flex items-center gap-4">
                  <NotificationDropdown />
                  <Link
                    to="/dashboard"
                    className={`flex items-center gap-2 text-sm font-bold transition-colors ${isScrolled || (location.pathname !== '/' && location.pathname !== '/needs') ? 'text-slate-700 hover:text-emerald-600' : 'text-white hover:text-emerald-200'
                      }`}
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    Panel
                  </Link>
                  <button
                    onClick={logout}
                    className={`p-2 rounded-full transition-colors ${isScrolled || (location.pathname !== '/' && location.pathname !== '/needs') ? 'bg-slate-100 text-slate-600 hover:bg-red-50 hover:text-red-500' : 'bg-white/10 text-white hover:bg-white/20'
                      }`}
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <>
                  <Link
                    to="/login"
                    className={`text-sm font-bold transition-colors ${isScrolled || !isTransparentPage ? 'text-slate-600 hover:text-emerald-600' : 'text-white hover:text-emerald-200'
                      }`}
                  >
                    Giriş Yap
                  </Link>
                  <Link
                    to="/register"
                    className="px-5 py-2.5 rounded-xl bg-white text-emerald-900 text-sm font-bold hover:bg-emerald-50 transition-all shadow-lg shadow-white/10"
                  >
                    Üye Ol
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`md:hidden p-2 rounded-lg ${isScrolled || mobileMenuOpen || !isTransparentPage ? 'text-slate-900' : 'text-white'
                }`}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-40 bg-white pt-24 px-6 md:hidden"
          >
            <div className="flex flex-col gap-6">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-4 text-xl font-bold text-slate-900"
                >
                  <div className="p-3 rounded-xl bg-slate-50 text-emerald-600">
                    <link.icon className="w-6 h-6" />
                  </div>
                  {link.name}
                </Link>
              ))}
              {user && (
                <Link
                  to="/chat"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-4 text-xl font-bold text-slate-900"
                >
                  <div className="p-3 rounded-xl bg-slate-50 text-emerald-600">
                    <MessageCircle className="w-6 h-6" />
                  </div>
                  Sohbet
                </Link>
              )}
              <hr className="border-slate-100" />
              {user ? (
                <>
                  <Link
                    to="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-4 text-xl font-bold text-slate-900"
                  >
                    <div className="p-3 rounded-xl bg-slate-50 text-emerald-600">
                      <LayoutDashboard className="w-6 h-6" />
                    </div>
                    Panel
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center gap-4 text-xl font-bold text-red-500"
                  >
                    <div className="p-3 rounded-xl bg-red-50 text-red-500">
                      <LogOut className="w-6 h-6" />
                    </div>
                    Çıkış Yap
                  </button>
                </>
              ) : (
                <div className="flex flex-col gap-4">
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full py-4 rounded-xl border border-slate-200 text-center font-bold text-slate-900"
                  >
                    Giriş Yap
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full py-4 rounded-xl bg-emerald-600 text-white text-center font-bold shadow-lg shadow-emerald-200"
                  >
                    Hemen Üye Ol
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="pt-0 min-h-screen">
        {children || <Outlet />}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-16 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            <div>
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-white">
                  <Briefcase className="w-5 h-5" />
                </div>
                <span className="text-xl font-bold text-white">zincir.</span>
              </div>
              <p className="text-sm leading-relaxed">
                İş dünyasının güvenilir bağlantı noktası. Tedarikçileri bulun,
                partnerlikler kurun ve ticaretinizi güvenle büyütün.
              </p>
            </div>

            <div>
              <h3 className="text-white font-bold mb-6">Platform</h3>
              <ul className="space-y-4 text-sm">
                <li><Link to="/companies" className="hover:text-emerald-400 transition-colors">Şirketler</Link></li>
                <li><Link to="/needs" className="hover:text-emerald-400 transition-colors">İhtiyaç Pazarı</Link></li>
                <li><Link to="/platform" className="hover:text-emerald-400 transition-colors">Özellikler</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="text-white font-bold mb-6">Kurumsal</h3>
              <ul className="space-y-4 text-sm">
                <li><Link to="/about" className="hover:text-emerald-400 transition-colors">Hakkımızda</Link></li>
                <li><Link to="/contact" className="hover:text-emerald-400 transition-colors">İletişim</Link></li>
                <li><Link to="/privacy" className="hover:text-emerald-400 transition-colors">Gizlilik Politikası</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="text-white font-bold mb-6">Bülten</h3>
              <p className="text-sm mb-4">Sektörel gelişmelerden haberdar olun.</p>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="E-posta adresiniz"
                  className="bg-slate-800 border-none rounded-lg px-4 py-2 text-sm w-full focus:ring-2 focus:ring-emerald-500"
                />
                <button className="p-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-500 transition-colors">
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
          <div className="mt-16 pt-8 border-t border-slate-800 text-center text-sm">
            &copy; {new Date().getFullYear()} Zincir Teknoloji A.Ş. Tüm hakları saklıdır.
          </div>
        </div>
      </footer>
    </div>
  );
}
