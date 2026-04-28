import React, { useState, useEffect } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Catalog from "./pages/Catalog";
import SpeciesDetail from "./pages/SpeciesDetail";
import Discover from "./pages/Discover";
import Glossary from "./pages/Glossary";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import Map from "./pages/Map";
import Timeline from "./pages/Timeline";
import Education from "./pages/Education";
import Profile from "./pages/Profile";
import News from "./pages/News";
import NewsDetail from "./pages/NewsDetail";
import { Layout } from "./components/layout/Layout";
import CallToAction from "./components/layout/CallToAction";
import { LoadingScreen } from "./components/loader";
import { listenToAuthChanges, type AuthUser } from "@/services/firebaseAuthService";

const queryClient = new QueryClient();

/** Minimum time the boot loader stays visible — avoids a jarring flash. */
const BOOT_MIN_MS = 600;

const App = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [booted, setBooted] = useState(false);

  useEffect(() => {
    let authResolved = false;
    let minElapsed = false;

    const finish = () => {
      if (authResolved && minElapsed) setBooted(true);
    };

    const unsub = listenToAuthChanges((u) => {
      setUser(u);
      authResolved = true;
      finish();
    });

    const timer = window.setTimeout(() => {
      minElapsed = true;
      finish();
    }, BOOT_MIN_MS);

    return () => {
      unsub();
      window.clearTimeout(timer);
    };
  }, []);

  if (!booted) {
    return <LoadingScreen size="lg" />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route
              path="/"
              element={
                <Layout>
                  <Home />
                  <CallToAction user={{ isAuthenticated: !!user }} />
                </Layout>
              }
            />
            <Route path="/catalog"           element={<Layout><Catalog /></Layout>} />
            <Route path="/discover"          element={<Layout><Discover /></Layout>} />
            <Route path="/glossary"          element={<Layout><Glossary /></Layout>} />
            <Route path="/species/:dinoId"   element={<Layout><SpeciesDetail /></Layout>} />
            <Route path="/map"               element={<Layout><Map /></Layout>} />
            <Route path="/timeline"          element={<Layout><Timeline /></Layout>} />
            <Route path="/education"         element={<Layout><Education /></Layout>} />
            <Route path="/news"              element={<Layout><News /></Layout>} />
            <Route path="/news/:id"          element={<Layout><NewsDetail /></Layout>} />
            <Route path="/profile"           element={<Layout><Profile /></Layout>} />
            <Route path="/auth"              element={<Auth />} />
            <Route path="*"                  element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;