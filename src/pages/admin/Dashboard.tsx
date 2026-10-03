import React, { useState, useEffect } from 'react';
import {
  Package,
  Truck,
  CheckCircle2,
  Clock,
  AlertTriangle,
  DollarSign,
  TrendingUp,
  Users,
  Building2,
  Activity,
  ArrowRight,
  Eye
} from 'lucide-react';
import { motion } from 'motion/react';
import { api } from '../../services/api';
import { DashboardStats, Parcel, User } from '../../../shared/types';
import { AnimatedCounter } from '../../components/common/AnimatedCounter';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Link } from 'react-router-dom';

interface KPICard {
  title: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
  trend?: string;
  decimals?: number;
  prefix?: string;
}

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentParcels, setRecentParcels] = useState<Parcel[]>([]);
  const [recentUsers, setRecentUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [statsRes, parcelsRes, usersRes] = await Promise.allSettled([
        api.getAdminStats(),
        api.getParcels({ status: 'all' }),
        api.getAdminUsers()
      ]);

      if (statsRes.status === 'fulfilled') {
        setStats(statsRes.value.data || null);
      }
      if (parcelsRes.status === 'fulfilled') {
        const parcels = parcelsRes.value.data || [];
        setRecentParcels(parcels.slice(0, 5));
      }
      if (usersRes.status === 'fulfilled') {
        const users = usersRes.value.data || [];
        setRecentUsers(users.slice(0, 5));
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate additional metrics
  const totalParcels = stats?.totalParcels || 0;
  const delivered = stats?.delivered || 0;
  const inTransit = stats?.inTransit || 0;
  const pending = stats?.pending || 0;
  const failed = stats?.failed || 0;
  const totalRevenue = stats?.totalRevenue || 0;

  // Calculate active/available couriers from recent users
  const agents = recentUsers.filter(u => u.role === 'agent');
  const activeCouriers = agents.filter(a => a.status === 'active').length;
  const customers = recentUsers.filter(u => u.role === 'customer').length;

  // Calculate delivery success rate
  const deliverySuccessRate = totalParcels > 0 
    ? ((delivered / totalParcels) * 100) 
    : 0;

  const kpiCards: KPICard[] = [
    {
      title: 'Total Shipments',
      value: totalParcels,
      icon: Package,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
      trend: '+12.5% this month'
    },
    {
      title: 'Pending Shipments',
      value: pending,
      icon: Clock,
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/10',
      trend: 'Awaiting assignment'
    },
    {
      title: 'In Transit',
      value: inTransit,
      icon: Truck,
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-500/10',
      trend: 'Active deliveries'
    },
    {
      title: 'Delivered',
      value: delivered,
      icon: CheckCircle2,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10',
      trend: deliverySuccessRate.toFixed(1) + '% success rate'
    },
    {
      title: 'Failed Deliveries',
      value: failed,
      icon: AlertTriangle,
      color: 'text-red-400',
      bgColor: 'bg-red-500/10',
      trend: 'Requires attention'
    },
    {
      title: 'Active Couriers',
      value: activeCouriers,
      icon: Truck,
      color: 'text-indigo-400',
      bgColor: 'bg-indigo-500/10',
      trend: 'Fleet operational'
    },
    {
      title: 'Commercial Shippers',
      value: customers,
      icon: Building2,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
      trend: 'Active accounts'
    },
    {
      title: 'Total Revenue',
      value: totalRevenue,
      icon: DollarSign,
      color: 'text-green-400',
      bgColor: 'bg-green-500/10',
      trend: '+18.3% vs last month',
      decimals: 2,
      prefix: '$'
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 border-3 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-slate-400">Loading command center...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">
          Enterprise Logistics Command Center
        </h1>
        <p className="text-sm text-slate-400">
          Real-time operations monitoring and fleet management dashboard
        </p>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-[#0d1117] border border-white/10 rounded-xl p-5 hover:border-white/20 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  {card.title}
                </span>
                <div className={`w-10 h-10 rounded-lg ${card.bgColor} flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${card.color}`} />
                </div>
              </div>
              <div className="text-3xl font-black text-white font-mono mb-2">
                {card.prefix}
                <AnimatedCounter value={card.value} decimals={card.decimals || 0} />
              </div>
              {card.trend && (
                <div className="flex items-center gap-1 text-xs text-slate-400">
                  <TrendingUp className="w-3 h-3" />
                  <span>{card.trend}</span>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Shipments */}
        <div className="bg-[#0d1117] border border-white/10 rounded-xl overflow-hidden">
          <div className="p-5 border-b border-white/10 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white">Recent Shipments</h2>
              <p className="text-xs text-slate-400 mt-1">Latest parcel operations</p>
            </div>
            <Link
              to="/admin/parcels"
              className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1"
            >
              View All
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="p-5 space-y-3">
            {recentParcels.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-8">
                No recent shipments
              </p>
            ) : (
              recentParcels.map((parcel) => (
                <Link
                  key={parcel.id}
                  to={`/admin/parcels`}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors group"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white font-mono truncate">
                      {parcel.tracking_number}
                    </p>
                    <p className="text-xs text-slate-400 truncate">
                      {parcel.recipient_name}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 ml-3">
                    <StatusBadge status={parcel.status} size="sm" />
                    <Eye className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Quick Actions & Stats */}
        <div className="space-y-4">
          {/* Status Distribution */}
          <div className="bg-[#0d1117] border border-white/10 rounded-xl p-5">
            <h2 className="text-lg font-bold text-white mb-4">Shipment Status</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">Pending</span>
                <span className="text-sm font-bold text-amber-400">{pending}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">In Transit</span>
                <span className="text-sm font-bold text-cyan-400">{inTransit}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">Delivered</span>
                <span className="text-sm font-bold text-emerald-400">{delivered}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">Failed</span>
                <span className="text-sm font-bold text-red-400">{failed}</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-[#0d1117] border border-white/10 rounded-xl p-5">
            <h2 className="text-lg font-bold text-white mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-2">
              <Link
                to="/admin/dispatch"
                className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/20 transition-colors text-center"
              >
                <Package className="w-5 h-5 text-blue-400 mx-auto mb-1" />
                <span className="text-xs font-semibold text-blue-400">Dispatch</span>
              </Link>
              <Link
                to="/admin/fleet/live"
                className="p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/20 hover:bg-cyan-500/20 transition-colors text-center"
              >
                <Truck className="w-5 h-5 text-cyan-400 mx-auto mb-1" />
                <span className="text-xs font-semibold text-cyan-400">Live Fleet</span>
              </Link>
              <Link
                to="/admin/exceptions"
                className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition-colors text-center"
              >
                <AlertTriangle className="w-5 h-5 text-red-400 mx-auto mb-1" />
                <span className="text-xs font-semibold text-red-400">Exceptions</span>
              </Link>
              <Link
                to="/admin/revenue"
                className="p-3 rounded-lg bg-green-500/10 border border-green-500/20 hover:bg-green-500/20 transition-colors text-center"
              >
                <DollarSign className="w-5 h-5 text-green-400 mx-auto mb-1" />
                <span className="text-xs font-semibold text-green-400">Revenue</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
