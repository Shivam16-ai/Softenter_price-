import React, { useState } from 'react';
import { 
  Package, 
  ChevronLeft, 
  ChevronRight, 
  Menu, 
  X, 
  LogOut, 
  User as UserIcon, 
  Truck, 
  ShieldCheck, 
  Home,
  LucideIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../../context/AuthContext';
import { ThemeToggle } from './ThemeToggle';
import { NotificationPopover } from './NotificationPopover';
import { Breadcrumbs } from './Breadcrumbs';
import { SwiftRouteLogo } from './SwiftRouteLogo';

export interface NavItem {
  id: string;
  label: string;
  icon: LucideIcon;
  badge?: string | number;
}

interface DashboardLayoutProps {
  title: string;
  subtitle: string;
  roleBadgeText: string;
  roleBadgeColor: string;
  navItems: NavItem[];
  activeNavId: string;
  onSelectNav: (id: string) => void;
  breadcrumbs: { label: string; onClick?: () => void; active?: boolean }[];
  children: React.ReactNode;
  headerAction?: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  title,
  subtitle,
  roleBadgeText,
  roleBadgeColor,
  navItems,
  activeNavId,
  onSelectNav,
  breadcrumbs,
  children,
  headerAction,
}) => {
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#090d16] flex flex-col transition-colors duration-200">
      {/* Unified Top Header */}
      <header className="sticky top-0 z-30 bg-[#050811]/95 dark:bg-[#050811]/95 backdrop-blur-md border-b border-white/10 transition-colors shadow-lg">
        <div className="px-4 sm:px-6 lg:px-8">
          {/* Main Header Row */}
          <div className="h-16 flex items-center justify-between gap-4">
            {/* Left: Logo + Mobile Menu */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                aria-label="Open mobile menu"
              >
                <Menu className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2">
                <SwiftRouteLogo heightClass="h-9" />
                <span className={`hidden sm:inline-block text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded ${roleBadgeColor}`}>
                  {roleBadgeText}
                </span>
              </div>
            </div>

            {/* Center: Desktop Navigation - Only show main items */}
            <nav className="hidden lg:flex items-center gap-1">
              {navItems.slice(0, 5).map((item) => {
                const Icon = item.icon;
                const isActive = activeNavId === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onSelectNav(item.id)}
                    className={`relative px-3 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      isActive
                        ? 'text-white bg-white/10'
                        : 'text-slate-300 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <Icon className="w-3.5 h-3.5" />
                      <span>{item.label}</span>
                      {item.badge !== undefined && Number(item.badge) > 0 && (
                        <span className="px-1.5 py-0.5 rounded-full text-[10px] font-mono bg-blue-500 text-white">
                          {item.badge}
                        </span>
                      )}
                    </span>
                    {isActive && (
                      <motion.div
                        layoutId="activeHeaderIndicator"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500"
                      />
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Right: Utilities */}
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <NotificationPopover />
              
              {/* User Profile Button with Dropdown */}
              <div className="flex items-center gap-2 pl-2 border-l border-white/10">
                <div className="hidden sm:flex items-center gap-2 px-2 py-1 rounded-lg bg-white/5">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xs">
                    {user?.full_name?.charAt(0) || 'U'}
                  </div>
                  <div className="hidden md:block text-left">
                    <span className="text-xs font-semibold text-white block leading-tight">
                      {user?.full_name}
                    </span>
                    <span className="text-[10px] text-slate-400 block font-medium capitalize">
                      {user?.role}
                    </span>
                  </div>
                </div>
                <button
                  onClick={logout}
                  title="Sign out"
                  className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-white/5 transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Compact Breadcrumb Row */}
          <div className="h-8 flex items-center justify-between border-t border-white/5">
            <div className="text-[11px] text-slate-400 font-medium">
              {breadcrumbs.map((crumb, index) => (
                <span key={index}>
                  {index > 0 && <span className="mx-2 text-slate-600">›</span>}
                  <span
                    className={crumb.active ? 'text-blue-400' : 'text-slate-400'}
                    onClick={crumb.onClick}
                    style={{ cursor: crumb.onClick ? 'pointer' : 'default' }}
                  >
                    {crumb.label}
                  </span>
                </span>
              ))}
            </div>
            {headerAction && <div className="text-xs">{headerAction}</div>}
          </div>
        </div>
      </header>

      {/* Main Workspace Body */}
      <div className="flex-1 flex">
        {/* Desktop Sidebar - Compact navigation menu */}
        <aside
          className={`hidden lg:flex flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-all duration-300 relative z-20 ${
            collapsed ? 'w-16' : 'w-56'
          }`}
        >
          {/* Sidebar Header with Collapse Button */}
          <div className="p-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            {!collapsed && (
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Navigation
              </span>
            )}
            <button
              onClick={() => setCollapsed(!collapsed)}
              title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer ml-auto"
            >
              {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeNavId === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectNav(item.id)}
                  title={collapsed ? item.label : undefined}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all relative cursor-pointer ${
                    isActive
                      ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400 shadow-2xs'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/70 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-blue-600 dark:text-blue-400' : ''}`} />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                  {!collapsed && item.badge !== undefined && (
                    <span className="ml-auto px-1.5 py-0.5 rounded-full text-[10px] font-mono bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {item.badge}
                    </span>
                  )}
                  {isActive && (
                    <motion.div
                      layoutId="activeSidebarIndicator"
                      className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-blue-600 dark:bg-blue-500 rounded-r-full"
                    />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Bottom quick meta */}
          {!collapsed && (
            <div className="p-3 m-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400">
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Fleet Dispatch</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <p className="text-[10px] leading-tight text-slate-400">Hub telemetry synchronized in real-time.</p>
            </div>
          )}
        </aside>

        {/* Mobile Slide-over Drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setMobileMenuOpen(false)}
                className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-xs lg:hidden"
              />
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className="fixed inset-y-0 left-0 z-50 w-72 bg-white dark:bg-slate-900 p-5 flex flex-col border-r border-slate-200 dark:border-slate-800 lg:hidden shadow-2xl"
              >
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-4">
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-200">
                    Customer Portal
                  </span>
                  <button onClick={() => setMobileMenuOpen(false)} className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <nav className="space-y-1.5 flex-1">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeNavId === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          onSelectNav(item.id);
                          setMobileMenuOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                          isActive
                            ? 'bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-400'
                            : 'text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{item.label}</span>
                        {item.badge !== undefined && (
                          <span className="ml-auto px-1.5 py-0.5 rounded-full text-[10px] font-mono bg-slate-100 dark:bg-slate-800">
                            {item.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </nav>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={logout}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Center Main Workspace */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
            {/* View Title & Action strip */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  {title}
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {subtitle}
                </p>
              </div>
              {headerAction && <div>{headerAction}</div>}
            </div>

            {/* Injected Tab Body */}
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
