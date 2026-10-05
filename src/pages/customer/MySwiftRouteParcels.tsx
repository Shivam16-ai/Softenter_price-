import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Package, 
  PlusCircle, 
  Search, 
  CheckCircle2, 
  Truck,
  Eye,
  DollarSign,
  TrendingUp,
  ArrowUpDown
} from 'lucide-react';
import { motion } from 'motion/react';
import { api } from '../../services/api';
import { formatCurrency, getCurrencySymbol } from '../../utils/currency';
import { Parcel, Payment } from '../../../shared/types';
import { StatusBadge } from '../../components/common/StatusBadge';
import { TrackingTimeline } from '../../components/common/TrackingTimeline';
import { InvoiceModal } from '../../components/common/InvoiceModal';
import { PaymentModal } from '../../components/common/PaymentModal';
import { AnimatedCounter } from '../../components/common/AnimatedCounter';
import { TableSkeleton } from '../../components/common/SkeletonLoader';
import { EmptyState } from '../../components/common/EmptyState';

export const MySwiftRouteParcels: React.FC = () => {
  const navigate = useNavigate();
  const [parcels, setParcels] = useState<Parcel[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<'date' | 'cost' | 'status'>('date');
  const [sortAsc, setSortAsc] = useState(false);

  // Modals & Drawers
  const [selectedParcelForTracking, setSelectedParcelForTracking] = useState<any>(null);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);
  const [selectedPaymentParcel, setSelectedPaymentParcel] = useState<Parcel | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [parcelsRes, paymentsRes] = await Promise.all([
        api.getParcels({ status: statusFilter, search: searchQuery }),
        api.getPaymentHistory(),
      ]);
      setParcels(parcelsRes.data || []);
      setPayments(paymentsRes.data || []);
    } catch (err) {
      console.error('Failed to load customer data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [statusFilter, searchQuery]);

  const handleViewTracking = async (parcelId: string) => {
    try {
      const res = await api.getParcelById(parcelId);
      setSelectedParcelForTracking(res.data);
    } catch (err: any) {
      alert(err.message || 'Failed to load tracking timeline');
    }
  };

  // Metrics
  const totalParcelsCount = parcels.length;
  const inTransitCount = parcels.filter((p) => ['picked_up', 'in_transit', 'out_for_delivery'].includes(p.status)).length;
  const deliveredCount = parcels.filter((p) => p.status === 'delivered').length;
  const totalSpent = payments.reduce((acc, curr) => acc + (curr.amount || 0), 0);

  // Sorted list
  const sortedParcels = [...parcels].sort((a, b) => {
    if (sortField === 'cost') {
      return sortAsc ? a.shipping_cost - b.shipping_cost : b.shipping_cost - a.shipping_cost;
    }
    if (sortField === 'status') {
      return sortAsc ? a.status.localeCompare(b.status) : b.status.localeCompare(a.status);
    }
    const timeA = new Date(a.created_at).getTime();
    const timeB = new Date(b.created_at).getTime();
    return sortAsc ? timeA - timeB : timeB - timeA;
  });

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            My SwiftRoute Parcels
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Track live GPS progress, download commercial invoices, and manage deliveries.
          </p>
        </div>
        <button
          onClick={() => navigate('/customer/book-shipment')}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/20 transition-all cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Book New Shipment</span>
        </button>
      </div>

      <div className="space-y-6">
        {/* Top KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.div
            whileHover={{ y: -2 }}
            className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Total Bookings</span>
              <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <Package className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">
              <AnimatedCounter value={totalParcelsCount} />
            </div>
            <div className="mt-2 flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
              <TrendingUp className="w-3 h-3" />
              <span>+12.5% this quarter</span>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ y: -2 }}
            className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Active In Transit</span>
              <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <Truck className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400 font-mono">
              <AnimatedCounter value={inTransitCount} />
            </div>
            <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
              <span>Real-time GPS routing</span>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ y: -2 }}
            className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Delivered With e-POD</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
              <AnimatedCounter value={deliveredCount} />
            </div>
            <div className="mt-2 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
              <span>100% handover verified</span>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ y: -2 }}
            className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Total Freight Spend</span>
              <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">
              {getCurrencySymbol()}<AnimatedCounter value={totalSpent} decimals={2} />
            </div>
            <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
              <span>Itemized commercial invoices</span>
            </div>
          </motion.div>
        </div>

        {/* Filtering & Live Search Strip */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tracking, recipient, city..."
              className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
            {['all', 'in_transit', 'out_for_delivery', 'delivered', 'pending'].map((filter) => (
              <button
                key={filter}
                onClick={() => setStatusFilter(filter)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  statusFilter === filter
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {filter.replace('_', ' ').toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Table Container */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
          {loading ? (
            <TableSkeleton rows={4} />
          ) : sortedParcels.length === 0 ? (
            <EmptyState
              title="No consignments found"
              description={
                searchQuery || statusFilter !== 'all'
                  ? 'No shipments match your current search criteria.'
                  : 'You haven\'t booked any parcel consignments yet. Create your first shipment now.'
              }
              actionText="Book New Shipment"
              onAction={() => navigate('/customer/book-shipment')}
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4">Tracking Reference</th>
                    <th className="py-3.5 px-4">Consignee & Route</th>
                    <th className="py-3.5 px-4">Category</th>
                    <th 
                      className="py-3.5 px-4 cursor-pointer hover:text-blue-600"
                      onClick={() => {
                        setSortField('cost');
                        setSortAsc(!sortAsc);
                      }}
                    >
                      <div className="flex items-center gap-1">
                        <span>Freight Cost</span>
                        <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {sortedParcels.map((p) => (
                    <tr 
                      key={p.id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white">
                        <button
                          onClick={() => handleViewTracking(p.id)}
                          className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1.5"
                        >
                          <span>{p.tracking_number}</span>
                          <Eye className="w-3 h-3" />
                        </button>
                        <span className="text-[10px] text-slate-400 block font-sans font-normal mt-0.5">
                          {new Date(p.created_at).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-800 dark:text-slate-100">{p.recipient_name}</div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-xs">{p.delivery_address}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {p.parcel_type}
                        </span>
                        <span className="text-[10px] text-slate-400 block mt-0.5 font-mono">{p.weight_kg} kg</span>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white">
                        {formatCurrency(p.shipping_cost)}
                      </td>
                      <td className="py-3.5 px-4">
                        <StatusBadge status={p.status} size="sm" />
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-1.5 whitespace-nowrap">
                        {p.payment_status === 'unpaid' && (
                          <button
                            onClick={() => setSelectedPaymentParcel(p)}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors shadow-2xs cursor-pointer"
                          >
                            Pay Now
                          </button>
                        )}
                        <button
                          onClick={() => setSelectedInvoiceId(p.id)}
                          title="View commercial invoice"
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

      {/* Tracking Modal Detail Overlay */}
      {selectedParcelForTracking && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="max-w-4xl w-full my-8">
            <div className="flex justify-end mb-2">
              <button
                onClick={() => setSelectedParcelForTracking(null)}
                className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-700 shadow-sm"
              >
                Close Tracking View ✕
              </button>
            </div>
            <TrackingTimeline
              parcel={selectedParcelForTracking.parcel}
              tracking={selectedParcelForTracking.tracking}
              proof={selectedParcelForTracking.proof}
              onViewInvoice={(id) => setSelectedInvoiceId(id)}
            />
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

      {/* Payment Checkout Modal */}
      {selectedPaymentParcel && (
        <PaymentModal
          parcel={selectedPaymentParcel}
          onClose={() => setSelectedPaymentParcel(null)}
          onSuccess={() => {
            loadData();
          }}
        />
      )}
    </div>
  );
};
