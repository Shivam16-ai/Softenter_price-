import React, { useState, useEffect } from 'react';
import { Package, LogOut, ArrowRight, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ThemeToggle } from './ThemeToggle';
import { NotificationPopover } from './NotificationPopover';
import { SwiftRouteLogo } from './SwiftRouteLogo';

interface NavbarProps {
  onNavigateHome: () => void;
  onNavigateDashboard: () => void;
  onNavigateAuth: () => void;
  currentView: 'home' | 'auth' | 'dashboard';
}

export const Navbar: React.FC<NavbarProps> = ({
  onNavigateHome,
  onNavigateDashboard,
  onNavigateAuth,
  currentView,
}) => {
  const { user, isAuthenticated, logout } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 25);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    if (currentView !== 'home') {
      onNavigateHome();
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        el?.scrollIntoView({ behavior: 'smooth' });
      }, 150);
    } else {
      const el = document.getElementById(sectionId);
      el?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // The landing page has its dedicated EnterpriseNav - never render a second conflicting header
  if (currentView === 'home') {
    return null;
  }

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled || currentView !== 'home'
          ? 'bg-[#050811]/85 backdrop-blur-xl border-b border-white/10 shadow-lg'
          : 'bg-transparent border-b border-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* Zone 1: Brand Wordmark */}
          <div
            onClick={onNavigateHome}
            className="flex items-center cursor-pointer select-none"
          >
            <SwiftRouteLogo heightClass="h-10 sm:h-11" />
          </div>

          {/* Zone 2: Role-Based Navigation Links */}
          <nav className="hidden md:flex items-center space-x-8 text-xs font-semibold text-slate-300">
            {currentView === 'home' ? (
              // Landing page navigation
              <>
                <button
                  onClick={() => scrollToSection('architecture')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Platform
                </button>
                <button
                  onClick={() => scrollToSection('tracking')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Tracking
                </button>
                <button
                  onClick={() => scrollToSection('operations')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Operations
                </button>
                <button
                  onClick={() => scrollToSection('analytics')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Analytics
                </button>
              </>
            ) : user?.role === 'customer' ? (
              // Customer-specific navigation
              <>
                <button
                  onClick={onNavigateDashboard}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  My Shipments
                </button>
                <button
                  onClick={onNavigateDashboard}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Book Parcel
                </button>
                <button
                  onClick={onNavigateDashboard}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Track Orders
                </button>
                <button
                  onClick={onNavigateDashboard}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Invoices
                </button>
              </>
            ) : user?.role === 'agent' ? (
              // Delivery Agent-specific navigation
              <>
                <button
                  onClick={onNavigateDashboard}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  My Deliveries
                </button>
                <button
                  onClick={onNavigateDashboard}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Active Routes
                </button>
                <button
                  onClick={onNavigateDashboard}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Delivery Proof
                </button>
                <button
                  onClick={onNavigateDashboard}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Vehicle Status
                </button>
              </>
            ) : user?.role === 'admin' ? (
              // Admin-specific navigation
              <>
                <button
                  onClick={onNavigateDashboard}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Dashboard
                </button>
                <button
                  onClick={onNavigateDashboard}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Manage Users
                </button>
                <button
                  onClick={onNavigateDashboard}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Operations
                </button>
                <button
                  onClick={onNavigateDashboard}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Reports
                </button>
              </>
            ) : null}
          </nav>

          {/* Zone 3: Primary Actions */}
          <div className="flex items-center gap-3">
            {currentView === 'home' && (
              <button
                onClick={() => scrollToSection('tracking')}
                className="hidden sm:inline-flex text-xs font-mono font-medium text-slate-300 hover:text-white px-3 py-1.5 rounded-lg border border-white/10 hover:border-white/20 transition-all cursor-pointer"
              >
                Public Tracking
              </button>
            )}

            <ThemeToggle />

            {isAuthenticated && <NotificationPopover />}

            {isAuthenticated && user ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={onNavigateDashboard}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-white cursor-pointer transition-colors"
                >
                  <div className="w-5 h-5 rounded-full bg-sky-500 text-white flex items-center justify-center text-[10px] font-bold">
                    {user.full_name?.charAt(0)}
                  </div>
                  <span className="hidden sm:inline">{user.full_name}</span>
                  <span className="text-[9px] font-mono font-bold uppercase text-sky-400 bg-sky-950/60 px-1.5 py-0.5 rounded border border-sky-800/40">
                    {user.role}
                  </span>
                </button>
                <button
                  onClick={logout}
                  title="Sign out"
                  className="p-2 text-slate-400 hover:text-rose-400 hover:bg-white/5 rounded-xl transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onNavigateAuth}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white shadow-[0_0_20px_rgba(2,132,199,0.3)] transition-all cursor-pointer"
              >
                <span>Sign In</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
