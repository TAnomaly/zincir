import { Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuthStore } from './store/authStore';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CompaniesPage from './pages/CompaniesPage';
import CompanyDetailPage from './pages/CompanyDetailPage';
import CreateCompanyPage from './pages/CreateCompanyPage';
import DashboardPage from './pages/DashboardPage';
import SearchPage from './pages/SearchPage';
import PlatformPage from './pages/PlatformPage';
import PartnershipPlaybookPage from './pages/PartnershipPlaybookPage';
import ProductDetailPage from './pages/ProductDetailPage';
import NeedsPage from './pages/NeedsPage';
import ChatPage from './pages/ChatPage';
import BlogPage from './pages/BlogPage';
import AdminPage from './pages/AdminPage';

// Contexts
import { SocketProvider } from './context/SocketContext';

// Layout
import Layout from './components/Layout';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { token } = useAuthStore();
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

function App() {
  const checkAuth = useAuthStore((state) => state.checkAuth);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <SocketProvider>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/companies" element={<CompaniesPage />} />
          <Route path="/companies/:slug" element={<CompanyDetailPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/platform" element={<PlatformPage />} />
          <Route path="/playbook" element={<PartnershipPlaybookPage />} />
          <Route path="/products/:id" element={<ProductDetailPage />} />
          <Route path="/needs" element={<NeedsPage />} />
          <Route path="/blog" element={<BlogPage />} />

          <Route
            path="/create-company"
            element={
              <ProtectedRoute>
                <CreateCompanyPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/chat"
            element={
              <ProtectedRoute>
                <ChatPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Layout>
    </SocketProvider>
  );
}

export default App;
