import React from 'react';
import { Navigation } from '@/components/ui/navigation';
import { LanguageSwitcherFloat } from '@/components/ui/language-switcher-float';
import Footer from '@/components/layout/Footer';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans antialiased flex flex-col">
      <Navigation />
      <main className="flex-1 relative">
        {children}
      </main>
      <Footer />
      <LanguageSwitcherFloat />
    </div>
  );
}