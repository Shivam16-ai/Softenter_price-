import React, { useState, useEffect } from 'react';
import { 
  LogIn, 
  Menu, 
  X, 
  ArrowUpRight 
} from 'lucide-react';
import { ThemeToggle } from '../common/ThemeToggle';
import { SwiftRouteLogo } from '../common/SwiftRouteLogo';

interface EnterpriseNavProps {
  onSignInClick: () => void;
  onNavigateSection: (sectionId: string) => void;
}

export const EnterpriseNav: React.FC<EnterpriseNavProps> = ({
  onSignInClick,
  onNavigateSection,
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('network');

  // Track scroll for sticky glass transition
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 25);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Track active section for clean indicator
  useEffect(() => {
    const sectionIds = ['network', 'story', 'technology', 'journey', 'fleet'];
    const handleScrollSpy = () => {
      const scrollPos = window.scrollY + 200;
      for (const id of sectionIds) {
        const el = document.getElementById(id);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPos >= top && scrollPos < top + height) {
            setActiveSection(id);
            break;
          }
        }
      }
    };
    window.addEventListener('scroll', handleScrollSpy, { passive: true });
    return () => window.removeEventListener('scroll', handleScrollSpy);
  }, []);

  // Primary navigation links strictly matching prompt: NETWORK, SOLUTIONS, TECHNOLOGY, TRACKING, FLEET
  const navItems = [
    { label: 'NETWORK', id: 'network' },
    { label: 'SOLUTIONS', id: 'story' },
    { label: 'TECHNOLOGY', id: 'technology' },
    { label: 'TRACKING', id: 'journey' }, // points to the physical linehaul route & telematics section
    { label: 'FLEET', id: 'fleet' },
  ];

  const handleLinkClick = (id: string) => {
    setMobileMenuOpen(false);
    onNavigateSection(id);
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 h-[76px] sm:h-[80px] transition-all duration-300 ${
          isScrolled
            ? 'bg-[#0a0c12]/90 backdrop-blur-xl border-b border-white/15 shadow-2xl shadow-black/80'
            : 'bg-black/35 backdrop-blur-md border-b border-white/10'
        }`}
      >
        <div className="max-w-[1440px] mx-auto h-full px-6 sm:px-8 xl:px-12 flex items-center justify-between gap-4">
          {/* ======================================================== */}
          {/* ZONE 1 (LEFT): BRAND (Single Source of Truth Logo Asset)  */}
          {/* ======================================================== */}
          <div className="shrink-0 flex items-center min-w-[170px] max-w-[240px]">
            <button
              type="button"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="flex items-center text-left cursor-pointer select-none"
              aria-label="SwiftRoute Enterprise Home"
            >
              <SwiftRouteLogo heightClass="h-10 sm:h-11 md:h-12" />
            </button>
          </div>

          {/* ======================================================== */}
          {/* ZONE 2 (CENTER): PRIMARY NAVIGATION (Centered Flex)      */}
          {/* ======================================================== */}
          <nav className="hidden lg:flex items-center justify-center flex-1 mx-4 gap-7 xl:gap-9 2xl:gap-11">
            {navItems.map((item) => {
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleLinkClick(item.id)}
                  className={`relative py-2 text-xs font-mono tracking-[0.16em] uppercase font-semibold transition-colors duration-200 cursor-pointer whitespace-nowrap group ${
                    isActive ? 'text-white' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  <span>{item.label}</span>
                  {/* Subtle orange underline indicator */}
                  <span
                    className={`absolute bottom-0 left-0 h-[2px] bg-[#FF5500] transition-all duration-300 rounded-full ${
                      isActive ? 'w-full' : 'w-0 group-hover:w-full'
                    }`}
                  />
                </button>
              );
            })}
          </nav>

          {/* ======================================================== */}
          {/* ZONE 3 (RIGHT): UTILITY ACTIONS (PORTAL SIGN IN + THEME) */}
          {/* ======================================================== */}
          <div className="hidden lg:flex items-center justify-end gap-3.5 shrink-0">
            {/* 1. Portal Sign In - Primary Orange CTA Button */}
            <button
              type="button"
              onClick={onSignInClick}
              className="h-11 xl:h-12 px-6 xl:px-7 rounded-xl bg-[#FF5500] hover:bg-orange-500 text-white text-xs font-mono uppercase tracking-wider font-bold shadow-[0_0_22px_rgba(255,85,0,0.4)] hover:shadow-[0_0_28px_rgba(255,85,0,0.6)] transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 whitespace-nowrap min-w-[155px] max-w-[175px] group"
            >
              <LogIn className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              <span>Portal Sign In</span>
            </button>

            {/* 2. Theme Toggle - Perfectly Circular Glass Button */}
            <ThemeToggle className="w-11 h-11 xl:w-12 xl:h-12 !rounded-full bg-white/10 dark:bg-white/10 border-white/15 hover:border-white/30 text-white flex items-center justify-center shrink-0 shadow-sm transition-all" />
          </div>

          {/* ======================================================== */}
          {/* MOBILE CONTROLS (Under lg breakpoint)                   */}
          {/* ======================================================== */}
          <div className="flex items-center gap-2.5 lg:hidden shrink-0">
            {/* Theme Toggle on mobile */}
            <ThemeToggle className="w-10 h-10 !rounded-full bg-white/10 dark:bg-white/10 border-white/15 text-white flex items-center justify-center shrink-0" />

            {/* Hamburger Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="w-10 h-10 rounded-xl bg-white/10 text-white border border-white/15 flex items-center justify-center hover:bg-white/20 transition-colors cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* ======================================================== */}
      {/* MOBILE FULL-SCREEN / GLASS NAVIGATION DRAWER             */}
      {/* ======================================================== */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-[#0a0c12]/98 backdrop-blur-2xl pt-24 px-6 pb-8 flex flex-col justify-between lg:hidden border-b border-white/15 animate-in fade-in duration-200">
          <div className="space-y-4">
            <div className="pb-3 border-b border-white/10 flex items-center justify-between text-xs font-mono text-slate-400">
              <span>EXPLORE PLATFORM</span>
              <span className="text-orange-400 font-bold">142 ACTIVE HUBS</span>
            </div>

            <nav className="flex flex-col gap-2">
              {navItems.map((item) => {
                const isActive = activeSection === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleLinkClick(item.id)}
                    className={`text-left py-3 px-3 rounded-xl font-mono text-sm tracking-wider uppercase font-semibold transition-colors flex items-center justify-between cursor-pointer ${
                      isActive
                        ? 'bg-white/10 text-orange-400 border border-orange-500/20'
                        : 'text-slate-200 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <span>{item.label}</span>
                    <ArrowUpRight className="w-4 h-4 text-slate-500" />
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Mobile Utility Actions */}
          <div className="space-y-3 pt-6 border-t border-white/10">
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                onSignInClick();
              }}
              className="w-full h-12 rounded-xl bg-[#FF5500] hover:bg-orange-500 text-white font-mono text-xs uppercase tracking-wider font-bold flex items-center justify-center gap-2 shadow-lg shadow-orange-950 cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              <span>Portal Sign In</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
};
