import React, { useState, useEffect } from 'react';
import {
  RotateCcw,
  Package,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Truck,
  Search,
  PlusCircle,
  Eye,
  Calendar,
  MapPin,
  User,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge } from '../../components/common/StatusBadge';
import { AnimatedCounter } from '../../components/common/AnimatedCounter';
import { TableSkeleton } from '../../components/common/SkeletonLoader';
import { EmptyState } from '../../components/common/EmptyState';

interface ReturnRequest {
  id: string;
  return_number: string;
  product_name: string;
  reason: string;
  status: string;
  pickup_address: string;
  preferred_pickup_date?: string;
  created_at: string;
  order_platform?: string;
}

export const ReturnsManagement: React.FC = () => {
  const { user } = useAuth();
  const [returns, setReturns] = useState<ReturnRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateReturnModal, setShowCreateReturnModal] = useState(false);
  const [selectedReturn, setSelectedReturn] = useState<ReturnRequest | null>(null);

  const loadReturns = async () => {
    setLoading(true);
    try {
      const res = await api.getReturnRequests({
        status: statusFilter !== 'all' ? statusFilter : undefined,
      });
      setReturns(res.data || []);
    } catch (err) {
      console.error('Failed to load returns', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReturns();
  }, [statusFilter]);

  const filteredReturns = returns.filter((ret) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        ret.return_number.toLowerCase().includes(q) ||
        ret.product_name.toLowerCase().includes(q) ||
        ret.reason.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const stats = {
    total: returns.length,
    requested: returns.filter((r) => r.status === 'requested').length,
    in_progress: returns.filter((r) =>
      ['approved', 'pickup_assigned', 'picked_up', 'in_transit_to_warehouse'].includes(r.status)
    ).length,
    completed: returns.filter((r) => r.status === 'completed').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-br from-orange-600 via-red-600 to-pink-600 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNnoiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLXdpZHRoPSIuNSIgb3BhY2l0eT0iLjEiLz48L2c+PC9zdmc+')] opacity-20"></div>

        <div className="relative z-10">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-black text-white mb-2 flex items-center gap-3">
                <RotateCcw className="w-8 h-8" />
                Returns & Reverse Logistics
              </h1>
              <p className="text-orange-100 text-sm max-w-2xl">
                Manage product returns and pickup requests for all your orders
              </p>
            </div>

            <button
              onClick={() => setShowCreateReturnModal(true)}
              className="px-4 py-2.5 rounded-xl bg-white hover:bg-orange-50 text-orange-700 text-xs font-bold shadow-lg transition-all cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 inline mr-2" />
              Request Return
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4">
              <div className="text-2xl font-black text-white font-mono">
                <AnimatedCounter value={stats.total} />
              </div>
              <div className="text-xs text-orange-100 mt-1 font-semibold">Total Returns</div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4">
              <div className="text-2xl font-black text-yellow-300 font-mono">
                <AnimatedCounter value={stats.requested} />
              </div>
              <div className="text-xs text-orange-100 mt-1 font-semibold">Pending Approval</div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4">
              <div className="text-2xl font-black text-blue-300 font-mono">
                <AnimatedCounter value={stats.in_progress} />
              </div>
              <div className="text-xs text-orange-100 mt-1 font-semibold">In Progress</div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4">
              <div className="text-2xl font-black text-green-300 font-mono">
                <AnimatedCounter value={stats.completed} />
              </div>
              <div className="text-xs text-orange-100 mt-1 font-semibold">Completed</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-5">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          {/* Search */}
          <div className="relative w-full lg:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search returns by number, product, reason..."
              className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-orange-500 outline-none"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2 flex-wrap">
            {['all', 'requested', 'approved', 'pickup_assigned', 'picked_up', 'completed'].map((filter) => (
              <button
                key={filter}
                onClick={() => setStatusFilter(filter)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  statusFilter === filter
                    ? 'bg-orange-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {filter.replace(/_/g, ' ').toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Returns List */}
      {loading ? (
        <TableSkeleton rows={4} />
      ) : filteredReturns.length === 0 ? (
        <EmptyState
          title="No returns found"
          description={
            searchQuery || statusFilter !== 'all'
              ? 'No returns match your current filters.'
              : 'You haven\'t requested any returns yet. If you need to return a product, click "Request Return" above.'
          }
          actionText="Request Return"
          onAction={() => setShowCreateReturnModal(true)}
        />
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Return Number</th>
                  <th className="py-3.5 px-4">Product</th>
                  <th className="py-3.5 px-4">Reason</th>
                  <th className="py-3.5 px-4">Pickup Details</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Requested</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredReturns.map((returnReq) => (
                  <motion.tr
                    key={returnReq.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-3.5 px-4">
                      <div className="font-mono font-bold text-slate-900 dark:text-white text-[11px]">
                        {returnReq.return_number}
                      </div>
                      {returnReq.order_platform && (
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          {returnReq.order_platform}
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800 dark:text-slate-100 max-w-xs truncate">
                        {returnReq.product_name}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {returnReq.reason.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="text-[11px] text-slate-600 dark:text-slate-400 max-w-xs truncate">
                        {returnReq.pickup_address}
                      </div>
                      {returnReq.preferred_pickup_date && (
                        <div className="text-[10px] text-blue-600 dark:text-blue-400 mt-0.5">
                          Preferred: {new Date(returnReq.preferred_pickup_date).toLocaleDateString()}
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <ReturnStatusBadge status={returnReq.status} />
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">
                      {new Date(returnReq.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setSelectedReturn(returnReq)}
                        className="px-2.5 py-1 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-xs font-bold transition-colors shadow-sm cursor-pointer"
                      >
                        <Eye className="w-3 h-3 inline mr-1" />
                        View
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modals */}
      {showCreateReturnModal && (
        <CreateReturnModal
          onClose={() => setShowCreateReturnModal(false)}
          onSuccess={loadReturns}
        />
      )}

      {selectedReturn && (
        <ReturnDetailsModal
          returnRequest={selectedReturn}
          onClose={() => setSelectedReturn(null)}
        />
      )}
    </div>
  );
};

// Return Status Badge
const ReturnStatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const statusConfig: Record<string, { color: string; label: string; icon: any }> = {
    requested: { color: 'bg-yellow-100 text-yellow-700 border-yellow-200', label: 'Requested', icon: Clock },
    approved: { color: 'bg-green-100 text-green-700 border-green-200', label: 'Approved', icon: CheckCircle2 },
    rejected: { color: 'bg-red-100 text-red-700 border-red-200', label: 'Rejected', icon: XCircle },
    pickup_assigned: { color: 'bg-blue-100 text-blue-700 border-blue-200', label: 'Pickup Assigned', icon: Truck },
    picked_up: { color: 'bg-indigo-100 text-indigo-700 border-indigo-200', label: 'Picked Up', icon: Package },
    in_transit_to_warehouse: { color: 'bg-purple-100 text-purple-700 border-purple-200', label: 'In Transit', icon: Truck },
    received_at_warehouse: { color: 'bg-cyan-100 text-cyan-700 border-cyan-200', label: 'At Warehouse', icon: Package },
    completed: { color: 'bg-emerald-100 text-emerald-700 border-emerald-200', label: 'Completed', icon: CheckCircle2 },
    cancelled: { color: 'bg-gray-100 text-gray-700 border-gray-200', label: 'Cancelled', icon: XCircle },
  };

  const config = statusConfig[status] || statusConfig.requested;
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold border ${config.color}`}>
      <Icon className="w-3 h-3" />
      {config.label}
    </span>
  );
};

// Create Return Modal (Placeholder)
const CreateReturnModal: React.FC<{ onClose: () => void; onSuccess: () => void }> = ({ onClose, onSuccess }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-2xl w-full p-8">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Request Return</h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
          Form to request a return will be implemented here with fields for selecting order, reason, pickup details, etc.
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white text-sm font-bold rounded-xl transition-colors cursor-pointer">
            Submit Return Request
          </button>
        </div>
      </div>
    </div>
  );
};

// Return Details Modal (Placeholder)
const ReturnDetailsModal: React.FC<{ returnRequest: ReturnRequest; onClose: () => void }> = ({
  returnRequest,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-3xl w-full p-8">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Return Details: {returnRequest.return_number}
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
          Detailed return information and tracking will be shown here.
        </p>
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
