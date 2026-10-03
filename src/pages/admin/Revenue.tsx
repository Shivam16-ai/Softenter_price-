import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingUp } from 'lucide-react';
import { api } from '../../services/api';
import { DashboardStats } from '../../../shared/types';
import { AnimatedCounter } from '../../components/common/AnimatedCounter';

export const AdminRevenue: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRevenueData();
  }, []);

  const loadRevenueData = async () => {
    setLoading(true);
    try {
      const res = await api.getAdminStats();
      setStats(res.data || null);
    } catch (error) {
      console.error('Failed to load revenue data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 border-3 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-slate-400">Loading revenue analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">Revenue Analytics</h1>
        <p className="text-sm text-slate-400">Financial performance and revenue tracking</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#0d1117] border border-white/10 rounded-xl p-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-400 uppercase">Total Revenue</span>
            <DollarSign className="w-5 h-5 text-green-400" />
          </div>
          <div className="text-3xl font-black text-white font-mono mb-2">
            $<AnimatedCounter value={stats?.totalRevenue || 0} decimals={2} />
          </div>
          <div className="flex items-center gap-1 text-xs text-green-400">
            <TrendingUp className="w-3 h-3" />
            <span>+18.3% vs last month</span>
          </div>
        </div>

        <div className="bg-[#0d1117] border border-white/10 rounded-xl p-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-400 uppercase">Average Order Value</span>
            <DollarSign className="w-5 h-5 text-blue-400" />
          </div>
          <div className="text-3xl font-black text-white font-mono">
            ${stats?.totalParcels ? ((stats.totalRevenue || 0) / stats.totalParcels).toFixed(2) : '0.00'}
          </div>
          <p className="text-xs text-slate-400 mt-2">Per shipment</p>
        </div>

        <div className="bg-[#0d1117] border border-white/10 rounded-xl p-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-400 uppercase">Total Orders</span>
            <DollarSign className="w-5 h-5 text-cyan-400" />
          </div>
          <div className="text-3xl font-black text-white font-mono">
            <AnimatedCounter value={stats?.totalParcels || 0} />
          </div>
          <p className="text-xs text-slate-400 mt-2">Billable shipments</p>
        </div>
      </div>

      <div className="bg-[#0d1117] border border-white/10 rounded-xl p-8 text-center">
        <DollarSign className="w-12 h-12 text-slate-600 mx-auto mb-3" />
        <p className="text-sm text-slate-400">Revenue charts and detailed analytics</p>
        <p className="text-xs text-slate-500 mt-1">Connect to analytics service for detailed reports</p>
      </div>
    </div>
  );
};
