import React, { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard,
  Package,
  Boxes,
  Truck,
  MapPin,
  AlertTriangle,
  Users,
  UserCheck,
  ShieldCheck,
  HeadphonesIcon,
  DollarSign,
  CreditCard,
  FileText,
  Bell,
  Activity,
  Heart,
  Settings,
  LogOut,
  Menu,
  X,
  Search,
  ChevronRight,
  Building2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'motion/react';

interface NavSection {
  title: string;
  items: NavItem[];
}

interface NavItem {
  path: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
}

export const AdminLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const navSections: NavSection[] = [
    {
      title: 'ADMIN HUB',
      items: [
        { path: '/admin', label: 'Dashboard', icon: LayoutDashboard }
      ]
    },
    {
      title: 'OPERATIONS',
      items: [
        { path: '/admin/dispatch', label: 'Consignment Dispatch', icon: Package },
        { path: '/admin/parcels', label: 'Parcel Management', icon: Boxes },
        { path: '/admin/fleet/live', label: 'Live Fleet', icon: MapPin },
        { path: '/admin/exceptions', label: 'Exceptions', icon: AlertTriangle }
      ]
    },
    {
      title: 'PEOPLE',
      items: [
        { path: '/admin/shippers', label: 'Commercial Shippers', icon: Building2 },
        { path: '/admin/couriers', label: 'Fleet Couriers', icon: Truck },
        { path: '/admin/couriers/verification', label: 'Courier Verification', icon: ShieldCheck },
        { path: '/admin/support', label: 'Support Center', icon: HeadphonesIcon }
      ]
    },
    {
      title: 'FINANCE',
      items: [
        { path: '/admin/revenue', label: 'Revenue Analytics', icon: DollarSign },
        { path: '/admin/payments', label: 'Payments & Invoices', icon: CreditCard },
        { path: '/admin/reports', label: 'Reports', icon: FileText }
      ]
    },
    {
      title: 'SYSTEM',
      items: [
        { path: '/admin/notifications', label: 'Notifications', icon: Bell },
        { path: '/admin/audit', label: 'System Audit Logs', icon: Activity },
        { path: '/admin/system-health', label: 'System Health', icon: Heart },
        { path: '/admin/config', label: 'Logistics Config', icon: Settings }
      ]
    }
  ];

  const isActive = (path: string) => {
    if (path === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(path);
  };

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  const handleGlobalSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement global search
    console.log('Search:', searchQuery);
  };

  return (
    <div className="min-h-screen bg-[#0a0e1a] text-white flex">
      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-[#0d1117] border-r border-white/10 transform transition-transform duration-300 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-white/10">
          <Link to="/admin" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
              <Package className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight">SWIFTRoute</span>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 hover:bg-white/5 rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Role Badge */}
        <div className="px-4 py-3 border-b border-white/10">
          <div className="px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
              Chief Dispatcher
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-6">
          {navSections.map((section) => (
            <div key={section.title}>
              <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 px-3">
                {section.title}
              </h3>
              <div className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.path);
                  
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        active
                          ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                          : 'text-slate-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span className="flex-1">{item.label}</span>
                      {item.badge && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-500 text-white">
                          {item.badge}
                        </span>
                      )}
                      {active && <ChevronRight className="w-3 h-3 shrink-0" />}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-white/5">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-xs font-bold">
              {user?.full_name?.charAt(0) || 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">
                {user?.full_name || 'Admin'}
              </p>
              <p className="text-xs text-slate-400 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full mt-2 flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-red-500/10 hover:border-red-500/20 border border-transparent transition-all"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-16 bg-[#0d1117] border-b border-white/10 flex items-center justify-between px-4 lg:px-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 hover:bg-white/5 rounded-lg"
            >
              <Menu className="w-5 h-5" />
            </button>
            
            {/* Global Search */}
            <form onSubmit={handleGlobalSearch} className="hidden md:block">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search shipments, couriers, shippers..."
                  className="w-64 lg:w-80 pl-10 pr-4 py-2 bg-[#0a0e1a] border border-white/10 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </form>
          </div>

          <div className="flex items-center gap-2">
            {/* Notifications */}
            <Link
              to="/admin/notifications"
              className="relative p-2 hover:bg-white/5 rounded-lg transition-colors"
            >
              <Bell className="w-5 h-5 text-slate-400" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>
    </div>
  );
};
