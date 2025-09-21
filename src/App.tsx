import React, { useState, useEffect } from 'react';
import Footer from "@/components/layout/Footer";
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
import { Layout } from "./components/layout/Layout";
import CallToAction from "./components/layout/CallToAction";
import { supabase } from "@/integrations/supabase/client";

const queryClient = new QueryClient();

const App = () => { 
  // Mova os hooks para DENTRO do componente
  const [session, setSession] = useState(null);

  useEffect(() => {
    // Busca a sessão inicial quando o app carrega
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // Escuta por mudanças no estado de autenticação (login/logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      }
    );

    // Limpa a inscrição quando o componente é desmontado
    return () => subscription.unsubscribe();
  }, []);

  // Adicione a declaração "return"
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
                  <CallToAction user={{ isAuthenticated: !!session }} /> 
                  <Footer />
                </Layout>
              } 
            />
            {/* O resto das suas rotas continua aqui... */}
            <Route path="/catalog" element={<Layout><Catalog /><Footer /></Layout>} />
            <Route path="/discover" element={<Layout><Discover /><Footer /></Layout>} />
            <Route path="/glossary" element={<Layout><Glossary /><Footer /></Layout>} />
            <Route path="/species/:dinoId" element={<Layout><SpeciesDetail /><Footer /></Layout>} />
            <Route path="/map" element={<Layout><Map /><Footer /></Layout>} />
            <Route path="/timeline" element={<Layout><Timeline /><Footer /></Layout>} />
            <Route path="/education" element={<Layout><Education /><Footer /></Layout>} />
            <Route path="/profile" element={<Layout><Profile /><Footer /></Layout>} />
            <Route path="/auth" element={<Auth />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}; 

export default App;