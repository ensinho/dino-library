import React, { Suspense, lazy, useEffect } from 'react';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Outlet, Route, Routes, useLocation } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { LoadingScreen } from './components/loader';
import { PageLoader } from './components/PageState';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Home from './pages/Home';

// Every route but the landing page is split into its own chunk.
const Catalog = lazy(() => import('./pages/Catalog'));
const SpeciesDetail = lazy(() => import('./pages/SpeciesDetail'));
const Discover = lazy(() => import('./pages/Discover'));
const Glossary = lazy(() => import('./pages/Glossary'));
const Auth = lazy(() => import('./pages/Auth'));
const NotFound = lazy(() => import('./pages/NotFound'));
const MapPage = lazy(() => import('./pages/Map'));
const Timeline = lazy(() => import('./pages/Timeline'));
const Education = lazy(() => import('./pages/Education'));
const Profile = lazy(() => import('./pages/Profile'));
const News = lazy(() => import('./pages/News'));
const NewsDetail = lazy(() => import('./pages/NewsDetail'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { refetchOnWindowFocus: false, staleTime: 5 * 60 * 1000 },
  },
});

/** SPA navigations should start at the top, like a real page load. */
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [pathname]);
  return null;
}

function SiteLayout() {
  return (
    <Layout>
      <Suspense fallback={<PageLoader />}>
        <Outlet />
      </Suspense>
    </Layout>
  );
}

function AppRoutes() {
  const { ready } = useAuth();
  // Firebase restores the session from IndexedDB almost instantly; waiting
  // avoids a "Sign in" → "Profile" flicker in the navigation.
  if (!ready) return <LoadingScreen size="lg" />;

  return (
    <Routes>
      <Route element={<SiteLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/catalog" element={<Catalog />} />
        <Route path="/discover" element={<Discover />} />
        <Route path="/glossary" element={<Glossary />} />
        <Route path="/species/:dinoId" element={<SpeciesDetail />} />
        <Route path="/map" element={<MapPage />} />
        <Route path="/timeline" element={<Timeline />} />
        <Route path="/education" element={<Education />} />
        <Route path="/news" element={<News />} />
        <Route path="/news/:id" element={<NewsDetail />} />
        <Route path="/profile" element={<Profile />} />
      </Route>
      <Route
        path="/auth"
        element={
          <Suspense fallback={<LoadingScreen size="lg" />}>
            <Auth />
          </Suspense>
        }
      />
      <Route
        path="*"
        element={
          <Suspense fallback={<LoadingScreen size="lg" />}>
            <NotFound />
          </Suspense>
        }
      />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ScrollToTop />
          <AppRoutes />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
