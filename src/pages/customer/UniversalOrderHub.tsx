import React, { useState, useEffect } from 'react';
import {
  Package,
  PlusCircle,
  Search,
  Clock,
  CheckCircle2,
  TrendingUp,
  AlertCircle,
  RotateCcw,
  Filter,
  Calendar,
  MapPin,
  Eye,
  Trash2,
  ShoppingBag,
  ExternalLink,
  Download,
  ArrowUpDown,
  Grid3x3,
  List,
  Sparkles,
  Truck,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useRealtime } from '../../hooks/useRealtime';
import { StatusBadge } from '../../components/common/StatusBadge';
import { AnimatedCounter } from '../../components/common/AnimatedCounter';
import { TableSkeleton, CardSkeleton } from '../../components/common/SkeletonLoader';
import { EmptyState } from '../../components/common/EmptyState';
import { AddOrderModal } from '../../components/orderHub/AddOrderModal';
import { ImportTrackingModal } from '../../components/orderHub/ImportTrackingModal';
import { OrderDetailsView } from './OrderDetailsView';

interface OrderHubStats {
  total_orders: number;
  in_transit: number;
  out_for_delivery: number;
  delivered: number;
  returns: number;
  attention_required: number;
}

interface PlatformConnection {
  id: string;
  platform: string;
  name: string;
  logo: string;
  status: 'connected' | 'disconnected' | 'available';
  lastSync?: string;
  orderCount?: number;
}

const platformConfigs: Record<string, { name: string; color: string; logo: string }> = {
  swiftroute: { name: 'SwiftRoute', color: 'bg-blue-600', logo: '🚀' },
  amazon: { name: 'Amazon', color: 'bg-orange-600', logo: '📦' },
  flipkart: { name: 'Flipkart', color: 'bg-yellow-500', logo: '🛒' },
  myntra: { name: 'Myntra', color: 'bg-pink-600', logo: '👔' },
  meesho: { name: 'Meesho', color: 'bg-purple-600', logo: '🛍️' },
  manual: { name: 'Manual Import', color: 'bg-slate-600', logo: '📝' },
  other: { name: 'Other', color: 'bg-gray-600', logo: '📋' },
};

export const UniversalOrderHub: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<OrderHubStats | null>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [platformFilter, setPlatformFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [sortBy, setSortBy] = useState<'date' | 'platform' | 'status'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Modal states
  const [showAddOrderModal, setShowAddOrderModal] = useState(false);
  const [showImportTrackingModal, setShowImportTrackingModal] = useState(false);
  const [showPlatformConnectionsModal, setShowPlatformConnectionsModal] = useState(false);
  const [selectedOrderForDetails, setSelectedOrderForDetails] = useState<any>(null);
  const [selectedOrderTracking, setSelectedOrderTracking] = useState<any[]>([]);

  // Real-time connection
  const { isConnected } = useRealtime({
    autoConnect: true,
    onOrderStatusUpdate: (event) => {
      console.log('[OrderHub] Real-time order update:', event.data);
      // Reload data to reflect new status
      loadData();
    },
    onParcelStatusUpdate: (event) => {
      console.log('[OrderHub] Real-time parcel update:', event.data);
      // Reload data to reflect new status
      loadData();
    },
    onReturnStatusUpdate: (event) => {
      console.log('[OrderHub] Real-time return update:', event.data);
      // Reload data to reflect new status
      loadData();
    },
    onConnected: () => {
      console.log('[OrderHub] Real-time connection established');
    },
    onDisconnected: () => {
      console.log('[OrderHub] Real-time connection closed');
    },
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsRes, ordersRes] = await Promise.all([
        api.getOrderHubStats(),
        api.getAllOrders({
          status: statusFilter !== 'all' ? statusFilter : undefined,
          platform: platformFilter !== 'all' ? platformFilter : undefined,
          search: searchQuery || undefined,
          sort_by: sortBy,
          sort_order: sortOrder,
        }),
      ]);
      setStats(statsRes.data);
      setOrders(ordersRes.data || []);
    } catch (err) {
      console.error('Failed to load order hub data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [statusFilter, platformFilter, searchQuery, sortBy, sortOrder]);

  const getPlatformConfig = (platform: string) => {
    return platformConfigs[platform] || platformConfigs.other;
  };

  const handleSortToggle = (field: 'date' | 'platform' | 'status') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const availablePlatforms = Array.from(new Set(orders.map(o => o.platform)));

  const handleViewOrderDetails = async (order: any) => {
    try {
      // Fetch tracking information
      let trackingData;
      if (order.order_type === 'swiftroute') {
        const res = await api.getParcelById(order.id);
        trackingData = res.data?.tracking || [];
      } else {
        const res = await api.getExternalOrderById(order.id);
        trackingData = res.data?.tracking || [];
      }
      
      setSelectedOrderForDetails(order);
      setSelectedOrderTracking(trackingData);
    } catch (err) {
      console.error('Failed to load order details', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 rounded-3xl p-8 shadow-2xl">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNnoiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLXdpZHRoPSIuNSIgb3BhY2l0eT0iLjEiLz48L2c+PC9zdmc+')] opacity-20"></div>
        
        <div className="relative z-10">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-3xl font-black text-white mb-2 flex items-center gap-3">
                <Sparkles className="w-8 h-8 text-yellow-300" />
                Universal Order Hub
              </h1>
              <p className="text-blue-100 text-sm max-w-2xl">
                Every order. Every carrier. One intelligent delivery dashboard. Manage shipments from SwiftRoute, Amazon, Flipkart, and more—all in one place.
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowPlatformConnectionsModal(true)}
                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white text-xs font-bold border border-white/20 transition-all cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4 inline mr-2" />
                Connect Accounts
              </button>
              
              {/* Real-time connection indicator */}
              <div className={`px-3 py-2 rounded-xl flex items-center gap-2 text-xs font-semibold backdrop-blur-sm border transition-all ${
                isConnected
                  ? 'bg-green-500/20 border-green-400/30 text-green-200'
                  : 'bg-slate-500/20 border-slate-400/30 text-slate-300'
              }`}>
                {isConnected ? (
                  <>
                    <Wifi className="w-3.5 h-3.5" />
                    <span>Live</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="w-3.5 h-3.5" />
                    <span>Offline</span>
                  </>
                )}
              </div>
              
              <button
                onClick={() => setShowAddOrderModal(true)}
                className="px-4 py-2.5 rounded-xl bg-white hover:bg-blue-50 text-blue-700 text-xs font-bold shadow-lg transition-all cursor-pointer"
              >
                <PlusCircle className="w-4 h-4 inline mr-2" />
                Add Order
              </button>
              <button
                onClick={() => setShowImportTrackingModal(true)}
                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white text-xs font-bold border border-white/20 transition-all cursor-pointer"
              >
                <Download className="w-4 h-4 inline mr-2" />
                Track Shipment
              </button>
            </div>
          </div>

          {/* Summary Stats */}
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4">
                <div className="text-2xl font-black text-white font-mono">
                  <AnimatedCounter value={stats.total_orders} />
                </div>
                <div className="text-xs text-blue-100 mt-1 font-semibold">Total Orders</div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4">
                <div className="text-2xl font-black text-yellow-300 font-mono">
                  <AnimatedCounter value={stats.in_transit} />
                </div>
                <div className="text-xs text-blue-100 mt-1 font-semibold">In Transit</div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4">
                <div className="text-2xl font-black text-green-300 font-mono">
                  <AnimatedCounter value={stats.out_for_delivery} />
                </div>
                <div className="text-xs text-blue-100 mt-1 font-semibold">Out for Delivery</div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4">
                <div className="text-2xl font-black text-emerald-300 font-mono">
                  <AnimatedCounter value={stats.delivered} />
                </div>
                <div className="text-xs text-blue-100 mt-1 font-semibold">Delivered</div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4">
                <div className="text-2xl font-black text-orange-300 font-mono">
                  <AnimatedCounter value={stats.returns} />
                </div>
                <div className="text-xs text-blue-100 mt-1 font-semibold">Returns</div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4">
                <div className="text-2xl font-black text-red-300 font-mono">
                  <AnimatedCounter value={stats.attention_required} />
                </div>
                <div className="text-xs text-blue-100 mt-1 font-semibold">Attention</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-5">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          {/* Search */}
          <div className="relative w-full lg:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search orders, tracking numbers, products..."
              className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-bold">
              <Filter className="w-3.5 h-3.5" />
              <span>Filters:</span>
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 cursor-pointer focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="all">All Status</option>
              <option value="in_transit">In Transit</option>
              <option value="out_for_delivery">Out for Delivery</option>
              <option value="delivered">Delivered</option>
              <option value="pending">Pending</option>
              <option value="delayed">Delayed</option>
            </select>

            {/* Platform Filter */}
            <select
              value={platformFilter}
              onChange={(e) => setPlatformFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 cursor-pointer focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="all">All Platforms</option>
              {availablePlatforms.map(platform => {
                const config = getPlatformConfig(platform);
                return (
                  <option key={platform} value={platform}>
                    {config.logo} {config.name}
                  </option>
                );
              })}
            </select>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-xl p-1">
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'table'
                    ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                <Grid3x3 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Orders Display */}
      {loading ? (
        <TableSkeleton rows={5} />
      ) : orders.length === 0 ? (
        <EmptyState
          title="No orders found"
          description={
            searchQuery || statusFilter !== 'all' || platformFilter !== 'all'
              ? 'No orders match your current filters. Try adjusting your search criteria.'
              : 'Start managing all your deliveries in one place. Add your first order or connect shopping platforms.'
          }
          actionText="Add Order"
          onAction={() => setShowAddOrderModal(true)}
        />
      ) : viewMode === 'table' ? (
        <OrdersTable
          orders={orders}
          onSort={handleSortToggle}
          sortBy={sortBy}
          sortOrder={sortOrder}
          getPlatformConfig={getPlatformConfig}
          onRefresh={loadData}
          onViewDetails={handleViewOrderDetails}
        />
      ) : (
        <OrdersGrid
          orders={orders}
          getPlatformConfig={getPlatformConfig}
          onRefresh={loadData}
          onViewDetails={handleViewOrderDetails}
        />
      )}

      {/* Modals */}
      <AddOrderModal
        show={showAddOrderModal}
        onClose={() => setShowAddOrderModal(false)}
        onSuccess={loadData}
      />
      <ImportTrackingModal
        show={showImportTrackingModal}
        onClose={() => setShowImportTrackingModal(false)}
        onSuccess={loadData}
      />
      <PlatformConnectionsModal
        show={showPlatformConnectionsModal}
        onClose={() => setShowPlatformConnectionsModal(false)}
      />

      {/* Order Details View */}
      {selectedOrderForDetails && (
        <OrderDetailsView
          order={selectedOrderForDetails}
          tracking={selectedOrderTracking}
          onClose={() => {
            setSelectedOrderForDetails(null);
            setSelectedOrderTracking([]);
          }}
          getPlatformConfig={getPlatformConfig}
        />
      )}
    </div>
  );
};

// Orders Table Component
const OrdersTable: React.FC<{
  orders: any[];
  onSort: (field: 'date' | 'platform' | 'status') => void;
  sortBy: string;
  sortOrder: string;
  getPlatformConfig: (platform: string) => any;
  onRefresh: () => void;
  onViewDetails: (order: any) => void;
}> = ({ orders, onSort, sortBy, sortOrder, getPlatformConfig, onRefresh, onViewDetails }) => {

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
            <tr>
              <th className="py-3.5 px-4">Platform</th>
              <th className="py-3.5 px-4">Order / Tracking</th>
              <th className="py-3.5 px-4">Product</th>
              <th
                className="py-3.5 px-4 cursor-pointer hover:text-blue-600"
                onClick={() => onSort('date')}
              >
                <div className="flex items-center gap-1">
                  <span>Order Date</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-3.5 px-4">Delivery Info</th>
              <th
                className="py-3.5 px-4 cursor-pointer hover:text-blue-600"
                onClick={() => onSort('status')}
              >
                <div className="flex items-center gap-1">
                  <span>Status</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {orders.map((order) => {
              const platform = getPlatformConfig(order.platform);
              return (
                <motion.tr
                  key={order.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-lg ${platform.color} flex items-center justify-center text-white text-sm`}>
                        {platform.logo}
                      </div>
                      <span className="font-bold text-slate-700 dark:text-slate-300 text-[11px]">
                        {platform.name}
                      </span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-mono font-bold text-slate-900 dark:text-white text-[11px]">
                      {order.platform_order_id || order.tracking_number}
                    </div>
                    {order.platform_tracking_number && (
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        Track: {order.platform_tracking_number}
                      </div>
                    )}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-800 dark:text-slate-100 max-w-xs truncate">
                      {order.product_name || `Parcel to ${order.recipient_name}`}
                    </div>
                    {order.courier_name && (
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                        Courier: {order.courier_name}
                      </div>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">
                    {new Date(order.order_date || order.created_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="text-[11px] text-slate-600 dark:text-slate-400 max-w-xs truncate">
                      {order.delivery_address}
                    </div>
                    {order.expected_delivery_date && (
                      <div className="text-[10px] text-blue-600 dark:text-blue-400 mt-0.5">
                        ETA: {new Date(order.expected_delivery_date).toLocaleDateString()}
                      </div>
                    )}
                  </td>
                  <td className="py-3.5 px-4">
                    <StatusBadge status={order.status} size="sm" />
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => onViewDetails(order)}
                      className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors shadow-sm cursor-pointer"
                    >
                      <Eye className="w-3 h-3 inline mr-1" />
                      View
                    </button>
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Orders Grid Component
const OrdersGrid: React.FC<{
  orders: any[];
  getPlatformConfig: (platform: string) => any;
  onRefresh: () => void;
  onViewDetails: (order: any) => void;
}> = ({ orders, getPlatformConfig, onRefresh, onViewDetails }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {orders.map((order) => {
        const platform = getPlatformConfig(order.platform);
        return (
          <motion.div
            key={order.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ y: -4 }}
            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-lg transition-all p-5 cursor-pointer"
          >
            <div className="flex items-start justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl ${platform.color} flex items-center justify-center text-white text-lg`}>
                {platform.logo}
              </div>
              <StatusBadge status={order.status} size="sm" />
            </div>

            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1 line-clamp-2">
              {order.product_name || `Parcel to ${order.recipient_name}`}
            </h3>

            <div className="text-xs text-slate-500 dark:text-slate-400 space-y-1 mb-4">
              <div className="flex items-center gap-1">
                <Package className="w-3 h-3" />
                <span className="font-mono">{order.platform_order_id || order.tracking_number}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span>{new Date(order.order_date || order.created_at).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                <span className="line-clamp-1">{order.delivery_address}</span>
              </div>
            </div>

            <button
              onClick={() => onViewDetails(order)}
              className="w-full px-3 py-2 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-950/60 text-blue-700 dark:text-blue-400 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              <Eye className="w-3 h-3 inline mr-1" />
              View Details
            </button>
          </motion.div>
        );
      })}
    </div>
  );
};

// Platform Connections Modal (placeholder)
const PlatformConnectionsModal: React.FC<{ show: boolean; onClose: () => void }> = ({ show, onClose }) => {
  if (!show) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-4xl w-full mx-4 p-8 max-h-[80vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Connect Shopping Accounts</h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
          Connect your shopping platform accounts to automatically sync orders to your Universal Order Hub.
        </p>
        {/* Platform connection cards will be implemented in next task */}
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
