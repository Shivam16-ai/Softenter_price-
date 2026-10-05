import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Users, 
  Truck, 
  Package, 
  BarChart3, 
  Settings, 
  ShieldCheck, 
  Search, 
  UserCheck, 
  UserX, 
  FileText, 
  Clock, 
  Download, 
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  Sliders,
  DollarSign,
  Activity,
  Eye,
  TrendingUp,
  Sparkles,
  Layers,
  Calendar
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency, getCurrencySymbol } from '../../utils/currency';
import { 
  Parcel, 
  User, 
  ActivityLog, 
  SystemSettings, 
  DashboardStats 
} from '../../../shared/types';
import { StatusBadge } from '../../components/common/StatusBadge';
import { InvoiceModal } from '../../components/common/InvoiceModal';
import { TrackingTimeline } from '../../components/common/TrackingTimeline';
import { DashboardLayout, NavItem } from '../../components/common/DashboardLayout';
import { AnimatedCounter } from '../../components/common/AnimatedCounter';
import { TableSkeleton } from '../../components/common/SkeletonLoader';
import { EmptyState } from '../../components/common/EmptyState';

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'parcels' | 'customers' | 'agents' | 'analytics' | 'logs' | 'settings'>('parcels');

  // Stats & Reports
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [reports, setReports] = useState<any>(null);

  // Data lists
  const [parcels, setParcels] = useState<Parcel[]>([]);
  const [usersList, setUsersList] = useState<User[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [logsError, setLogsError] = useState<string | null>(null);
  const [logsLoading, setLogsLoading] = useState(false);
  const [settings, setSettings] = useState<SystemSettings | null>(null);

  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modals & Forms
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);
  const [selectedTrackingData, setSelectedTrackingData] = useState<any>(null);

  // Assign agent modal
  const [assignParcel, setAssignParcel] = useState<Parcel | null>(null);
  const [selectedAgentId, setSelectedAgentId] = useState<string>('');
  const [isAssigning, setIsAssigning] = useState(false);

  // New Agent Form Modal
  const [showNewAgentModal, setShowNewAgentModal] = useState(false);
  const [newAgentData, setNewAgentData] = useState({
    full_name: '',
    email: '',
    phone: '',
    password: '',
    address: 'Bay Area Regional Depot',
  });
  const [agentSubmitting, setAgentSubmitting] = useState(false);

  // Settings Save State
  const [settingsSaved, setSettingsSaved] = useState(false);

  const loadDashboardData = async () => {
    setLoading(true);
    setLogsError(null);
    setLogsLoading(true);

    const [statsRes, reportsRes, parcelsRes, usersRes, logsRes, settingsRes] = await Promise.allSettled([
      api.getAdminStats(),
      api.getAdminReports(),
      api.getParcels({ status: statusFilter, search: searchQuery }),
      api.getAdminUsers(),
      api.getActivityLogs(),
      api.getSettings(),
    ]);

    if (statsRes.status === 'fulfilled') setStats(statsRes.value.data || null);
    if (reportsRes.status === 'fulfilled') setReports(reportsRes.value.data || null);
    if (parcelsRes.status === 'fulfilled') setParcels(parcelsRes.value.data || []);
    if (usersRes.status === 'fulfilled') setUsersList(usersRes.value.data || []);
    if (settingsRes.status === 'fulfilled') setSettings(settingsRes.value.data || null);

    if (logsRes.status === 'fulfilled') {
      setActivityLogs(logsRes.value.data || []);
    } else {
      setLogsError((logsRes.reason as Error)?.message || 'Failed to load audit logs');
      console.error('Activity logs fetch failed:', logsRes.reason);
    }

    setLogsLoading(false);
    setLoading(false);
  };

  useEffect(() => {
    loadDashboardData();
  }, [statusFilter, searchQuery]);

  const handleAssignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignParcel || !selectedAgentId) return;

    setIsAssigning(true);
    try {
      await api.assignAgent(assignParcel.id, selectedAgentId);
      setAssignParcel(null);
      setSelectedAgentId('');
      loadDashboardData();
    } catch (err: any) {
      alert(err.message || 'Failed to assign agent');
    } finally {
      setIsAssigning(false);
    }
  };

  const handleToggleUserStatus = async (userId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'active' ? 'suspended' : 'active';
    try {
      await api.updateUserStatus(userId, nextStatus as any);
      loadDashboardData();
    } catch (err: any) {
      alert(err.message || 'Failed to update user status');
    }
  };

  const handleAgentVerification = async (agentId: string, status: 'approved' | 'rejected') => {
    try {
      await api.updateAgentVerification(agentId, status);
      loadDashboardData();
    } catch (err: any) {
      alert(err.message || `Failed to update agent verification to ${status}`);
    }
  };

  const handleCreateAgentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAgentSubmitting(true);
    try {
      await api.createAgent(newAgentData);
      setShowNewAgentModal(false);
      setNewAgentData({
        full_name: '',
        email: '',
        phone: '',
        password: '',
        address: 'Bay Area Regional Depot',
      });
      loadDashboardData();
    } catch (err: any) {
      alert(err.message || 'Failed to create agent');
    } finally {
      setAgentSubmitting(false);
    }
  };

  const handleSettingsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    try {
      await api.updateSettings(settings);
      setSettingsSaved(true);
      setTimeout(() => setSettingsSaved(false), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed to save settings');
    }
  };

  const handleViewTracking = async (parcelId: string) => {
    try {
      const res = await api.getParcelById(parcelId);
      setSelectedTrackingData(res.data);
    } catch (err: any) {
      alert(err.message || 'Failed to view tracking');
    }
  };

  const agentsList = usersList.filter((u) => u.role === 'agent');
  const customersList = usersList.filter((u) => u.role === 'customer');

  const navItems: NavItem[] = [
    { id: 'parcels', label: 'Consignment Dispatch', icon: Package, badge: parcels.length },
    { id: 'customers', label: 'Commercial Shippers', icon: Users, badge: customersList.length },
    { id: 'agents', label: 'Fleet Couriers', icon: Truck, badge: agentsList.length },
    { id: 'analytics', label: 'Revenue Analytics', icon: BarChart3 },
    { id: 'logs', label: 'System Audit Logs', icon: Activity, badge: activityLogs.length },
    { id: 'settings', label: 'Logistics Config', icon: Settings },
  ];

  const getBreadcrumbs = () => {
    const titles: Record<string, string> = {
      parcels: 'Freight Dispatch & Fleet Allocations',
      customers: 'Shipper Enterprise Directory',
      agents: 'Courier Fleet Personnel',
      analytics: 'Financial & Volume Reports',
      logs: 'Security & Telemetry Audit Trail',
      settings: 'Global Rate Matrix & SLA Rules',
    };
    return [
      { label: 'Admin Hub' },
      { label: titles[activeTab] || 'Overview', active: true },
    ];
  };

  return (
    <DashboardLayout
      title="Fleet Administration & Dispatch Hub"
      subtitle="Enterprise governance, courier allocations, freight analytics, and audit logging."
      roleBadgeText="Chief Dispatcher"
      roleBadgeColor="bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800"
      navItems={navItems}
      activeNavId={activeTab}
      onSelectNav={(id) => setActiveTab(id as any)}
      breadcrumbs={getBreadcrumbs()}
      headerAction={null}
    >
      {/* Top 4 KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          whileHover={{ y: -2 }}
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Total Consignments</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">
            <AnimatedCounter value={stats?.totalParcels || parcels.length} />
          </div>
          <div className="mt-2 flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
            <TrendingUp className="w-3 h-3" />
            <span>+18.4% network throughput</span>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ y: -2 }}
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Active Routing In Transit</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400 font-mono">
            <AnimatedCounter value={stats?.inTransit || 0} />
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 block">
            Monitored on live route nodes
          </span>
        </motion.div>

        <motion.div
          whileHover={{ y: -2 }}
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Delivered With Proof</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
            <AnimatedCounter value={stats?.delivered || 0} />
          </div>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-2 block">
            Zero unresolved exceptions
          </span>
        </motion.div>

        <motion.div
          whileHover={{ y: -2 }}
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Gross Freight Revenue</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">
            {getCurrencySymbol()}<AnimatedCounter value={stats?.totalRevenue || 0} decimals={2} />
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 block">
            Net settled commercial funds
          </span>
        </motion.div>
      </div>

      {/* Tab 1: Consignment Dispatch Management */}
      {activeTab === 'parcels' && (
        <div className="space-y-4">
          {/* Filters strip */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tracking, recipient, shipper..."
                className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
              {['all', 'pending', 'assigned', 'picked_up', 'in_transit', 'out_for_delivery', 'delivered'].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    statusFilter === st
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {st.replace('_', ' ').toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
            {loading ? (
              <TableSkeleton rows={5} />
            ) : parcels.length === 0 ? (
              <EmptyState
                title="No consignments match criteria"
                description="Try clearing search keywords or choosing another status tab."
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                    <tr>
                      <th className="py-3.5 px-4">Tracking Number</th>
                      <th className="py-3.5 px-4">Shipper & Recipient</th>
                      <th className="py-3.5 px-4">Type & Weight</th>
                      <th className="py-3.5 px-4">Assigned Agent</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {parcels.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white">
                          <button
                            onClick={() => handleViewTracking(p.id)}
                            className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                          >
                            <span>{p.tracking_number}</span>
                            <Eye className="w-3 h-3" />
                          </button>
                          <span className="text-[10px] text-slate-400 block font-sans font-normal mt-0.5">
                            {new Date(p.created_at).toLocaleDateString()}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-800 dark:text-slate-100">
                            To: {p.recipient_name}
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-xs">
                            From: {p.sender_name || 'Commercial Shipper'}
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                            {p.parcel_type}
                          </span>
                          <span className="text-[10px] text-slate-400 block mt-0.5 font-mono">{p.weight_kg} kg</span>
                        </td>
                        <td className="py-3.5 px-4">
                          {p.assigned_agent_name ? (
                            <span className="font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                              <Truck className="w-3 h-3" />
                              {p.assigned_agent_name}
                            </span>
                          ) : (
                            <span className="text-amber-600 dark:text-amber-400 text-[11px] font-semibold flex items-center gap-1">
                              <Clock className="w-3 h-3" /> Unassigned
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          <StatusBadge status={p.status} size="sm" />
                        </td>
                        <td className="py-3.5 px-4 text-right space-x-1.5 whitespace-nowrap">
                          <button
                            onClick={() => {
                              setAssignParcel(p);
                              setSelectedAgentId(p.assigned_agent_id || '');
                            }}
                            className="px-2.5 py-1 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900 border border-blue-200 dark:border-blue-800 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                          >
                            Assign Fleet
                          </button>
                          <button
                            onClick={() => setSelectedInvoiceId(p.id)}
                            className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                          >
                            Invoice
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Commercial Customers Directory */}
      {activeTab === 'customers' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Registered Shippers & Corporate Accounts</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Manage customer credentials and account activity status.</p>
            </div>
            <span className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-xl">
              {customersList.length} Shippers
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Shipper Organization</th>
                  <th className="py-3.5 px-4">Contact Email</th>
                  <th className="py-3.5 px-4">Phone Number</th>
                  <th className="py-3.5 px-4">Default Dispatch Address</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Access Control</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {customersList.map((cust) => (
                  <tr key={cust.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold text-xs">
                        {cust.full_name.charAt(0)}
                      </div>
                      {cust.full_name}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-600 dark:text-slate-300">{cust.email}</td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">{cust.phone || 'N/A'}</td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 truncate max-w-xs">{cust.address || 'N/A'}</td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        cust.status === 'active'
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                          : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800'
                      }`}>
                        {cust.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleToggleUserStatus(cust.id, cust.status)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                          cust.status === 'active'
                            ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 hover:bg-rose-100 border border-rose-200 dark:border-rose-800'
                            : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 border border-emerald-200 dark:border-emerald-800'
                        }`}
                      >
                        {cust.status === 'active' ? 'Suspend' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Courier Agent Fleet Management */}
      {activeTab === 'agents' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="p-6 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Courier Agent Personnel</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Onboard drivers and monitor regional depot assignments.</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Courier & Depot</th>
                  <th className="py-3.5 px-4">Employee ID & Vehicle</th>
                  <th className="py-3.5 px-4">Contact</th>
                  <th className="py-3.5 px-4">Verification & ID Card</th>
                  <th className="py-3.5 px-4">Active Route</th>
                  <th className="py-3.5 px-4 text-right">Administrative Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {agentsList.map((agent) => {
                  const agentLoad = parcels.filter(
                    (p) => p.assigned_agent_id === agent.id && p.status !== 'delivered' && p.status !== 'cancelled'
                  ).length;

                  const isPending = agent.verification_status === 'pending_verification';
                  const isApproved = agent.verification_status === 'approved' || (!agent.verification_status && agent.status === 'active');
                  const isRejected = agent.verification_status === 'rejected';

                  return (
                    <tr key={agent.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 flex items-center justify-center font-bold text-xs shrink-0">
                          <Truck className="w-4 h-4" />
                        </div>
                        <div>
                          <span>{agent.full_name}</span>
                          <span className="text-[10px] text-slate-400 block font-normal">{agent.company_name || agent.address || 'Regional Depot'}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-mono text-slate-800 dark:text-slate-200 font-bold">
                          {agent.employee_id || 'EMP-20481'}
                        </div>
                        <div className="text-[10px] font-mono text-slate-500 flex items-center gap-1 mt-0.5">
                          <span>Veh:</span>
                          <span className="font-bold text-indigo-600 dark:text-indigo-400 uppercase">{agent.vehicle_number || 'SR-VAN-01'}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-mono text-slate-600 dark:text-slate-300">{agent.company_email || agent.email}</div>
                        <div className="text-[10px] text-slate-400">{agent.phone || 'N/A'}</div>
                      </td>
                      <td className="py-3.5 px-4 space-y-1">
                        <div>
                          {isPending && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                              Pending Verification
                            </span>
                          )}
                          {isApproved && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                              Approved
                            </span>
                          )}
                          {isRejected && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800">
                              Rejected
                            </span>
                          )}
                        </div>
                        {agent.id_document_path ? (
                          <a
                            href={`/api/admin/agents/${agent.id}/document`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] font-mono text-blue-600 dark:text-blue-400 hover:underline"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>View ID Document</span>
                          </a>
                        ) : (
                          <span className="text-[10px] font-mono text-slate-400 block">Verified Onboarding</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                        {agentLoad} packages on van
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {isPending ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleAgentVerification(agent.id, 'approved')}
                              className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors cursor-pointer"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleAgentVerification(agent.id, 'rejected')}
                              className="px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white transition-colors cursor-pointer"
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleToggleUserStatus(agent.id, agent.status)}
                            className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                              agent.status === 'active'
                                ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 hover:bg-rose-100 border border-rose-200 dark:border-rose-800'
                                : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 border border-emerald-200 dark:border-emerald-800'
                            }`}
                          >
                            {agent.status === 'active' ? 'Suspend' : 'Activate'}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Analytics & Financial Visualizers */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Status Breakdown Bar chart simulation */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center justify-between">
                <span>Consignment Status Distribution</span>
                <span className="text-xs font-mono text-slate-500 dark:text-slate-400">{parcels.length} Total</span>
              </h4>

              <div className="space-y-3 pt-2">
                {[
                  { label: 'Delivered (e-POD)', count: parcels.filter(p => p.status === 'delivered').length, color: 'bg-emerald-500' },
                  { label: 'Out For Delivery (Courier)', count: parcels.filter(p => p.status === 'out_for_delivery').length, color: 'bg-purple-500' },
                  { label: 'In Transit (Line-haul)', count: parcels.filter(p => p.status === 'in_transit').length, color: 'bg-indigo-500' },
                  { label: 'Picked Up (Origin Depot)', count: parcels.filter(p => p.status === 'picked_up').length, color: 'bg-sky-500' },
                  { label: 'Pending Assignment', count: parcels.filter(p => p.status === 'pending').length, color: 'bg-amber-500' },
                ].map((item) => {
                  const pct = parcels.length > 0 ? Math.round((item.count / parcels.length) * 100) : 0;
                  return (
                    <div key={item.label} className="space-y-1 text-xs">
                      <div className="flex justify-between font-medium text-slate-700 dark:text-slate-300">
                        <span>{item.label}</span>
                        <span className="font-mono font-bold">{item.count} ({pct}%)</span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.8, ease: 'easeOut' }}
                          className={`h-full ${item.color} rounded-full`}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* SLA Performance Card */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 flex flex-col justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
                  Logistics Service Level Reliability (SLA)
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
                  Carrier performance metrics calculated across all regional distribution points.
                </p>

                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800">
                    <span className="text-slate-500 dark:text-slate-400 block text-[11px]">On-Time Handover</span>
                    <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">99.4%</span>
                    <span className="text-[10px] text-slate-400 block mt-1">+0.8% vs last week</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800">
                    <span className="text-slate-500 dark:text-slate-400 block text-[11px]">First-Attempt Success</span>
                    <span className="text-2xl font-black text-blue-600 dark:text-blue-400 font-mono">97.8%</span>
                    <span className="text-[10px] text-slate-400 block mt-1">Verified recipient address</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800">
                    <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Average Dwell Time</span>
                    <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400 font-mono">3.2 hrs</span>
                    <span className="text-[10px] text-slate-400 block mt-1">Sorting facility turnaround</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800">
                    <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Damaged / Claims Rate</span>
                    <span className="text-2xl font-black text-slate-900 dark:text-white font-mono">0.02%</span>
                    <span className="text-[10px] text-slate-400 block mt-1">Industry standard benchmark</span>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-blue-50/60 dark:bg-blue-950/30 rounded-xl text-xs text-blue-800 dark:text-blue-300 border border-blue-200/80 dark:border-blue-900/40 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-500 shrink-0" />
                <span>All consignments covered under standard carrier insurance protocol.</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: System Audit Logs */}
      {activeTab === 'logs' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Security & Dispatch Audit Trail</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Timestamped record of administrative and operator activities.</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-xl">
                {activityLogs.length} Records
              </span>
            </div>
          </div>

          {logsLoading ? (
            <div className="p-10 flex flex-col items-center justify-center gap-3 text-slate-400">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs">Loading audit records...</p>
            </div>
          ) : logsError ? (
            <div className="p-10 flex flex-col items-center justify-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/40 flex items-center justify-center text-rose-500">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200">Failed to load audit logs</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 text-center max-w-xs">{logsError}</p>
              <button
                onClick={loadDashboardData}
                className="mt-1 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors"
              >
                Retry
              </button>
            </div>
          ) : activityLogs.length === 0 ? (
            <div className="p-12 flex flex-col items-center justify-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                <Activity className="w-6 h-6 text-slate-400" />
              </div>
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No audit records yet</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 text-center max-w-xs">
                System activity events will appear here as administrators and operators perform actions.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4">Action</th>
                    <th className="py-3.5 px-4">Actor</th>
                    <th className="py-3.5 px-4">Entity Type & Target</th>
                    <th className="py-3.5 px-4">Details</th>
                    <th className="py-3.5 px-4 text-right">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {activityLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-800 dark:text-slate-200">
                        <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                          {log.action}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300 font-semibold">{log.user_name}</td>
                      <td className="py-3.5 px-4 uppercase text-[10px] font-mono text-slate-500 dark:text-slate-400">
                        {log.entity_type} #{(log.entity_id || '').substring(0, 8)}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">{log.details || '—'}</td>
                      <td className="py-3.5 px-4 text-right font-mono text-slate-400 text-[11px]">
                        {new Date(log.created_at).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 6: Logistics Rate Matrix & Settings */}
      {activeTab === 'settings' && (
        <div className="max-w-2xl mx-auto">
          <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl transition-colors">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
              Logistics Rate Matrix & Governance Rules
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
              Configure system-wide freight multipliers, surcharge tables, and currency codes.
            </p>

            {settingsSaved && (
              <div className="mb-5 p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-400 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Logistics configuration updated successfully across all depots.</span>
              </div>
            )}

            <form onSubmit={handleSettingsSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Company Trade Name</label>
                <input
                  type="text"
                  value={settings.company_name}
                  onChange={(e) => setSettings({ ...settings, company_name: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Support Email</label>
                  <input
                    type="email"
                    value={settings.support_email}
                    onChange={(e) => setSettings({ ...settings, support_email: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Support Phone</label>
                  <input
                    type="tel"
                    value={settings.support_phone}
                    onChange={(e) => setSettings({ ...settings, support_phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Base Rate / Kg (₹)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={settings.base_rate_per_kg}
                    onChange={(e) => setSettings({ ...settings, base_rate_per_kg: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Express Surcharge (₹)</label>
                  <input
                    type="number"
                    step="1"
                    value={settings.express_surcharge}
                    onChange={(e) => setSettings({ ...settings, express_surcharge: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Tax Percentage (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={settings.tax_percentage}
                    onChange={(e) => setSettings({ ...settings, tax_percentage: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  Save Global Configuration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Courier Agent Modal */}
      {assignParcel && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Assign Courier Agent
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Select an on-duty courier agent for consignment <span className="font-mono font-bold text-slate-900 dark:text-white">{assignParcel.tracking_number}</span>
            </p>

            <form onSubmit={handleAssignSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Select Courier Agent *
                </label>
                <select
                  required
                  value={selectedAgentId}
                  onChange={(e) => setSelectedAgentId(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="">-- Choose Courier Agent --</option>
                  {agentsList.map((agent) => (
                    <option key={agent.id} value={agent.id}>
                      {agent.full_name} ({agent.email})
                    </option>
                  ))}
                </select>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800 text-xs space-y-1">
                <div className="text-slate-500 dark:text-slate-400">Delivery Address:</div>
                <div className="font-semibold text-slate-800 dark:text-slate-200">{assignParcel.delivery_address}</div>
                <div className="text-slate-400">Recipient: {assignParcel.recipient_name} ({assignParcel.recipient_phone})</div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setAssignParcel(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAssigning || !selectedAgentId}
                  className="px-5 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs transition-all disabled:opacity-50 cursor-pointer"
                >
                  {isAssigning ? 'Assigning...' : 'Confirm Assignment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Onboard New Courier Agent Modal */}
      {showNewAgentModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Onboard Fleet Courier Agent
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Create credentials for a new delivery driver assigned to regional routing hubs.
            </p>

            <form onSubmit={handleCreateAgentSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Full Legal Name *</label>
                <input
                  type="text"
                  required
                  value={newAgentData.full_name}
                  onChange={(e) => setNewAgentData({ ...newAgentData, full_name: e.target.value })}
                  placeholder="e.g. Marcus Vance"
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Company Email *</label>
                <input
                  type="email"
                  required
                  value={newAgentData.email}
                  onChange={(e) => setNewAgentData({ ...newAgentData, email: e.target.value })}
                  placeholder="agent.marcus@swiftroute.com"
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Mobile Contact Phone *</label>
                <input
                  type="tel"
                  required
                  value={newAgentData.phone}
                  onChange={(e) => setNewAgentData({ ...newAgentData, phone: e.target.value })}
                  placeholder="+1 (555) 302-9182"
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Default Depot Hub Location</label>
                <input
                  type="text"
                  value={newAgentData.address}
                  onChange={(e) => setNewAgentData({ ...newAgentData, address: e.target.value })}
                  placeholder="Bay Area Regional Depot"
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Temporary Password *</label>
                <input
                  type="password"
                  required
                  value={newAgentData.password}
                  onChange={(e) => setNewAgentData({ ...newAgentData, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewAgentModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={agentSubmitting}
                  className="px-5 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs transition-all disabled:opacity-50 cursor-pointer"
                >
                  {agentSubmitting ? 'Onboarding...' : 'Create Driver Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Invoice Modal */}
      {selectedInvoiceId && (
        <InvoiceModal
          parcelId={selectedInvoiceId}
          onClose={() => setSelectedInvoiceId(null)}
        />
      )}

      {/* Tracking Modal Detail Overlay */}
      {selectedTrackingData && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="max-w-4xl w-full my-8">
            <div className="flex justify-end mb-2">
              <button
                onClick={() => setSelectedTrackingData(null)}
                className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-700 shadow-sm cursor-pointer"
              >
                Close Tracking View ✕
              </button>
            </div>
            <TrackingTimeline
              parcel={selectedTrackingData.parcel}
              tracking={selectedTrackingData.tracking}
              proof={selectedTrackingData.proof}
              onViewInvoice={(id) => setSelectedInvoiceId(id)}
            />
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};
