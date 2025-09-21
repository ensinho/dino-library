import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  Home, 
  Search, 
  Map, 
  Clock, 
  GraduationCap, 
  User,
  Menu,
  X,
  Compass
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface NavigationProps {
  className?: string;
}

export function Navigation({ className }: NavigationProps) {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigationItems = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Collection', href: '/catalog', icon: Search },
    { name: 'Discover', href: '/discover', icon: Compass },
    { name: 'Maps', href: '/map', icon: Map },
    { name: 'Timeline', href: '/timeline', icon: Clock },
    { name: 'Learning', href: '/education', icon: GraduationCap },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className={cn("bg-card border-b border-border", className)}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center space-x-8">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-amber rounded-lg flex items-center justify-center">
                {/* <span className="text-amber-foreground font-bold text-lg">🦕</span> */}
                <img src="/logoDinosaur.svg" alt="Dino Library" className="w-6 h-6" />
              </div>
              <span className="font-bold text-xl text-foreground">Dino Library</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex space-x-1">
              {navigationItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    "flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    isActive(item.href)
                      ? "bg-amber text-white shadow-amber"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Profile Button */}
            <Link to="/profile">
              <Button
                variant={isActive('/profile') ? 'default' : 'ghost'}
                size="sm"
                className="flex items-center space-x-2"
              >
                <User className="w-4 h-4" />
                <span className="hidden sm:inline">Profile</span>
              </Button>
            </Link>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navigationItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    "flex items-center space-x-3 px-3 py-2 rounded-md text-base font-medium transition-colors",
                    isActive(item.href)
                      ? "bg-amber text-amber-foreground shadow-amber"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}