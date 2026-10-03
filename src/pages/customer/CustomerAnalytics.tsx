import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  Package,
  Truck,
  CheckCircle2,
  Clock,
  DollarSign,
  Calendar,
  MapPin,
  Award,
  Target,
  Zap,
} from 'lucide-react';
import { motion } from 'motion/react';
import { api } from '../../services/api';
import { AnimatedCounter } from '../../components/common/AnimatedCounter';
import { CardSkeleton } from '../../components/common/SkeletonLoader';

interface AnalyticsData {
  totalOrders: number;
  deliveredOrders: number;
  returnedOrders: number;
  averageDeliveryTime: number;
  delayedOrders: number;
  onTimeDeliveryRate: number;
  totalSpent: number;
  ordersByPlatform: { platform: string; count: number }[];
  monthlyOrders: { month: string; count: number }[];
}

export const CustomerAnalytics: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'30days' | '90days' | 'all'>('30days');

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      // Fetch analytics data from multiple sources
      const [statsRes, ordersRes, paymentsRes] = await Promise.all([
        api.getOrderHubStats(),
        api.getAllOrders({}),
        api.getPaymentHistory(),
      ]);

      const orders = ordersRes.data || [];
      const payments = paymentsRes.data || [];

      // Calculate analytics
      const delivered = orders.filter((o: any) => o.status === 'delivered');
      const returned = orders.filter((o: any) => o.status === 'returned');
      const delayed = orders.filter((o: any) => o.status === 'delayed');

      // Calculate average delivery time (in days)
      const deliveryTimes = delivered
        .filter((o: any) => o.actual_delivery_date && o.order_date)
        .map((o: any) => {
          const orderDate = new Date(o.order_date || o.created_at);
          const deliveryDate = new Date(o.actual_delivery_date);
          return (deliveryDate.getTime() - orderDate.getTime()) / (1000 * 60 * 60 * 24);
        });
      
      const avgDeliveryTime = deliveryTimes.length > 0
        ? deliveryTimes.reduce((a, b) => a + b, 0) / deliveryTimes.length
        : 0;

      // Calculate on-time delivery rate
      const onTimeRate = orders.length > 0
        ? ((delivered.length - delayed.length) / orders.length) * 100
        : 0;

      // Orders by platform
      const platformCounts: Record<string, number> = {};
      orders.forEach((o: any) => {
        platformCounts[o.platform] = (platformCounts[o.platform] || 0) + 1;
      });

      const ordersByPlatform = Object.entries(platformCounts).map(([platform, count]) => ({
        platform,
        count: count as number,
      }));

      // Monthly orders (last 6 months)
      const monthlyData: Record<string, number> = {};
      orders.forEach((o: any) => {
        const date = new Date(o.order_date || o.created_at);
        const monthKey = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        monthlyData[monthKey] = (monthlyData[monthKey] || 0) + 1;
      });

      const monthlyOrders = Object.entries(monthlyData).map(([month, count]) => ({
        month,
        count: count as number,
      })).slice(-6);

      setAnalytics({
        totalOrders: orders.length,
        deliveredOrders: delivered.length,
        returnedOrders: returned.length,
        averageDeliveryTime: avgDeliveryTime,
        delayedOrders: delayed.length,
        onTimeDeliveryRate: onTimeRate,
        totalSpent: payments.reduce((sum: number, p: any) => sum + (p.amount || 0), 0),
        ordersByPlatform,
        monthlyOrders,
      });
    } catch (err) {
      console.error('Failed to load analytics', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <CardSkeleton height="h-64" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <CardSkeleton key={i} height="h-32" />
          ))}
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-12">
        <BarChart3 className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
        <p className="text-sm text-slate-500 dark:text-slate-400">Failed to load analytics data</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-br from-cyan-600 via-blue-600 to-indigo-600 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNnoiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLXdpZHRoPSIuNSIgb3BhY2l0eT0iLjEiLz48L2c+PC9zdmc+')] opacity-20"></div>

        <div className="relative z-10">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-black text-white mb-2 flex items-center gap-3">
                <BarChart3 className="w-8 h-8" />
                My Delivery Analytics
              </h1>
              <p className="text-cyan-100 text-sm max-w-2xl">
                Insights into your delivery patterns, performance metrics, and spending analysis
              </p>
            </div>

            {/* Time Range Selector */}
            <div className="flex gap-2 bg-white/10 backdrop-blur-sm rounded-xl p-1 border border-white/20">
              {[
                { value: '30days', label: '30 Days' },
                { value: '90days', label: '90 Days' },
                { value: 'all', label: 'All Time' },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setTimeRange(option.value as any)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    timeRange === option.value
                      ? 'bg-white text-cyan-700 shadow-sm'
                      : 'text-white hover:bg-white/10'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Orders"
          value={analytics.totalOrders}
          icon={Package}
          color="blue"
          trend="+12%"
        />
        <MetricCard
          title="Delivered"
          value={analytics.deliveredOrders}
          icon={CheckCircle2}
          color="green"
          subtitle={`${((analytics.deliveredOrders / analytics.totalOrders) * 100).toFixed(1)}% success rate`}
        />
        <MetricCard
          title="Avg Delivery Time"
          value={analytics.averageDeliveryTime.toFixed(1)}
          icon={Clock}
          color="orange"
          suffix="days"
        />
        <MetricCard
          title="On-Time Rate"
          value={analytics.onTimeDeliveryRate.toFixed(1)}
          icon={Target}
          color="purple"
          suffix="%"
        />
      </div>

      {/* Performance & Spending */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Score */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Delivery Performance</h3>
            <Award className="w-6 h-6 text-yellow-500" />
          </div>

          <div className="space-y-4">
            <PerformanceBar
              label="Successful Deliveries"
              value={analytics.deliveredOrders}
              max={analytics.totalOrders}
              color="green"
            />
            <PerformanceBar
              label="On-Time Deliveries"
              value={analytics.totalOrders - analytics.delayedOrders}
              max={analytics.totalOrders}
              color="blue"
            />
            <PerformanceBar
              label="Returns"
              value={analytics.returnedOrders}
              max={analytics.totalOrders}
              color="orange"
            />
          </div>

          <div className="mt-6 p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-xl border border-green-200 dark:border-green-800">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-950/60 flex items-center justify-center">
                <Zap className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <div className="text-2xl font-black text-green-700 dark:text-green-400">
                  {analytics.onTimeDeliveryRate >= 90 ? 'Excellent' : analytics.onTimeDeliveryRate >= 75 ? 'Good' : 'Fair'}
                </div>
                <div className="text-xs text-green-600 dark:text-green-500 font-semibold">
                  Your delivery performance score
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Spending Analysis */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Spending Analysis</h3>
            <DollarSign className="w-6 h-6 text-emerald-500" />
          </div>

          <div className="text-center mb-6 p-6 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 rounded-2xl">
            <div className="text-xs text-emerald-600 dark:text-emerald-400 font-bold mb-2">TOTAL FREIGHT SPEND</div>
            <div className="text-4xl font-black text-emerald-700 dark:text-emerald-400 font-mono">
              $<AnimatedCounter value={analytics.totalSpent} decimals={2} />
            </div>
            <div className="text-xs text-emerald-600 dark:text-emerald-500 mt-2">
              Across {analytics.totalOrders} orders
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
              <span className="text-xs font-bold text-slate-600 dark:text-slate-400">Average per Order</span>
              <span className="text-sm font-black text-slate-900 dark:text-white font-mono">
                ${analytics.totalOrders > 0 ? (analytics.totalSpent / analytics.totalOrders).toFixed(2) : '0.00'}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
              <span className="text-xs font-bold text-slate-600 dark:text-slate-400">Estimated Savings</span>
              <span className="text-sm font-black text-green-600 dark:text-green-400 font-mono">
                ${(analytics.totalSpent * 0.15).toFixed(2)}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
              <span className="text-xs font-bold text-slate-600 dark:text-slate-400">Return Costs</span>
              <span className="text-sm font-black text-orange-600 dark:text-orange-400 font-mono">
                ${(analytics.returnedOrders * 5).toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Orders by Platform */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Orders by Platform</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {analytics.ordersByPlatform.map((item) => {
            const platformConfig: Record<string, { name: string; color: string; logo: string }> = {
              swiftroute: { name: 'SwiftRoute', color: 'bg-blue-600', logo: '🚀' },
              amazon: { name: 'Amazon', color: 'bg-orange-600', logo: '📦' },
              flipkart: { name: 'Flipkart', color: 'bg-yellow-500', logo: '🛒' },
              myntra: { name: 'Myntra', color: 'bg-pink-600', logo: '👔' },
              meesho: { name: 'Meesho', color: 'bg-purple-600', logo: '🛍️' },
            };

            const config = platformConfig[item.platform] || { name: item.platform, color: 'bg-gray-600', logo: '📋' };

            return (
              <motion.div
                key={item.platform}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 text-center"
              >
                <div className={`w-12 h-12 ${config.color} rounded-xl mx-auto mb-3 flex items-center justify-center text-2xl`}>
                  {config.logo}
                </div>
                <div className="text-2xl font-black text-slate-900 dark:text-white font-mono mb-1">
                  {item.count}
                </div>
                <div className="text-xs font-bold text-slate-600 dark:text-slate-400">{config.name}</div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Monthly Trend */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Monthly Order Trend</h3>
        
        <div className="flex items-end gap-3 h-48">
          {analytics.monthlyOrders.map((item, index) => {
            const maxCount = Math.max(...analytics.monthlyOrders.map((m) => m.count));
            const height = (item.count / maxCount) * 100;

            return (
              <motion.div
                key={item.month}
                initial={{ height: 0 }}
                animate={{ height: `${height}%` }}
                transition={{ delay: index * 0.1 }}
                className="flex-1 bg-gradient-to-t from-blue-600 to-cyan-500 rounded-t-lg relative group cursor-pointer"
              >
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="bg-slate-900 text-white text-xs font-bold px-2 py-1 rounded shadow-lg whitespace-nowrap">
                    {item.count} orders
                  </div>
                </div>
                <div className="absolute -bottom-6 left-0 right-0 text-center">
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-400">{item.month}</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// Metric Card Component
const MetricCard: React.FC<{
  title: string;
  value: number;
  icon: any;
  color: 'blue' | 'green' | 'orange' | 'purple';
  subtitle?: string;
  suffix?: string;
  trend?: string;
}> = ({ title, value, icon: Icon, color, subtitle, suffix, trend }) => {
  const colorConfig = {
    blue: 'bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400',
    green: 'bg-green-100 dark:bg-green-950/60 text-green-600 dark:text-green-400',
    orange: 'bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400',
    purple: 'bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400',
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-5"
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">{title}</span>
        <div className={`w-10 h-10 rounded-xl ${colorConfig[color]} flex items-center justify-center`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div className="text-3xl font-black text-slate-900 dark:text-white font-mono">
        <AnimatedCounter value={value} />
        {suffix && <span className="text-xl ml-1">{suffix}</span>}
      </div>
      {subtitle && (
        <div className="text-xs text-slate-500 dark:text-slate-400 mt-2">{subtitle}</div>
      )}
      {trend && (
        <div className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400 font-bold mt-2">
          <TrendingUp className="w-3 h-3" />
          {trend}
        </div>
      )}
    </motion.div>
  );
};

// Performance Bar Component
const PerformanceBar: React.FC<{
  label: string;
  value: number;
  max: number;
  color: 'green' | 'blue' | 'orange';
}> = ({ label, value, max, color }) => {
  const percentage = max > 0 ? (value / max) * 100 : 0;

  const colorConfig = {
    green: 'bg-green-500',
    blue: 'bg-blue-500',
    orange: 'bg-orange-500',
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{label}</span>
        <span className="text-xs font-mono font-bold text-slate-600 dark:text-slate-400">
          {value}/{max}
        </span>
      </div>
      <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className={`h-full ${colorConfig[color]} rounded-full`}
        />
      </div>
    </div>
  );
};
