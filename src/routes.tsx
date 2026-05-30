import React, { Suspense, lazy } from 'react';
import { Route, Routes } from 'react-router-dom';
import ProtectedRoute from './components/admin/ProtectedRoute';
import ScrollToTop from './components/ScrollToTop';
import Header from './components/Header';
import Footer from './components/Footer';
import WhatsAppButton from './components/WhatsAppButton';
import MobileNav from './components/MobileNav';

// Loading fallback
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
  </div>
);

// Layout envolvendo Header/Footer para rotas públicas
const PublicLayout = ({ children }: { children: React.ReactNode }) => (
  <div className="flex flex-col min-h-screen">
    <Header />
    <main className="flex-grow pb-16 md:pb-0"> 
      {children}
    </main>
    <Footer />
    <WhatsAppButton />
    <MobileNav />
  </div>
);

// Lazy loading - Páginas Públicas
const HomePage = lazy(() => import('./pages/HomePage'));
const GaleryPage = lazy(() => import('./pages/GaleryPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const SpecialtiesPage = lazy(() => import('./pages/SpecialtiesPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

// Lazy loading - Páginas Admin
const LoginPage = lazy(() => import('./pages/admin/LoginPage'));
const DashboardLayout = lazy(() => import('./components/admin/DashboardLayout'));
const Dashboard = lazy(() => import('./pages/admin/Dashboard'));
const GaleriaPageAdmin = lazy(() => import('./pages/admin/GaleriaPage'));
const CatalogPage = lazy(() => import('./pages/admin/CatalogPage'));
const LeadsPage = lazy(() => import('./pages/admin/LeadsPage'));
const ConfiguracoesPage = lazy(() => import('./pages/admin/ConfiguracoesPage'));

export default function AppRoutes() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        {/* Rotas Públicas */}
        <Route path="/" element={<PublicLayout><Suspense fallback={<PageLoader />}><HomePage /></Suspense></PublicLayout>} />
        <Route path="/galeria" element={<PublicLayout><Suspense fallback={<PageLoader />}><GaleryPage /></Suspense></PublicLayout>} />
        <Route path="/sobre" element={<PublicLayout><Suspense fallback={<PageLoader />}><AboutPage /></Suspense></PublicLayout>} />
        <Route path="/especialidades" element={<PublicLayout><Suspense fallback={<PageLoader />}><SpecialtiesPage /></Suspense></PublicLayout>} />
        <Route path="/contato" element={<PublicLayout><Suspense fallback={<PageLoader />}><ContactPage /></Suspense></PublicLayout>} />

        {/* Rota Login Admin - Pública */}
        <Route 
          path="/admin/login" 
          element={
            <Suspense fallback={<PageLoader />}>
              <LoginPage />
            </Suspense>
          } 
        />

        {/* Rotas Admin - Protegidas */}
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute>
              <Suspense fallback={<PageLoader />}>
                <DashboardLayout />
              </Suspense>
            </ProtectedRoute>
          }
        >
          <Route 
            path="dashboard" 
            element={
              <Suspense fallback={<PageLoader />}>
                <Dashboard />
              </Suspense>
            } 
          />
          <Route 
            path="galeria" 
            element={
              <Suspense fallback={<PageLoader />}>
                <GaleriaPageAdmin />
              </Suspense>
            } 
          />
          <Route 
            path="catalogo" 
            element={
              <Suspense fallback={<PageLoader />}>
                <CatalogPage />
              </Suspense>
            } 
          />
          <Route 
            path="leads" 
            element={
              <Suspense fallback={<PageLoader />}>
                <LeadsPage />
              </Suspense>
            } 
          />
          <Route 
            path="configuracoes" 
            element={
              <Suspense fallback={<PageLoader />}>
                <ConfiguracoesPage />
              </Suspense>
            } 
          />
        </Route>

        {/* Rota 404 - Página não encontrada */}
        <Route 
          path="*" 
          element={
            <Suspense fallback={<PageLoader />}>
              <NotFoundPage />
            </Suspense>
          } 
        />
      </Routes>
    </>
  );
}
