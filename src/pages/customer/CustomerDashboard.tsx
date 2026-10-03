import React, { useState, useEffect } from 'react';
import { 
  Package, 
  PlusCircle, 
  Search, 
  CreditCard, 
  Clock, 
  CheckCircle2, 
  FileText, 
  User, 
  ArrowUpRight, 
  Truck,
  Eye,
  DollarSign,
  Calendar,
  Sparkles,
  MapPin,
  ArrowRight,
  TrendingUp,
  SlidersHorizontal,
  ChevronDown,
  ArrowUpDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Parcel, Payment, ParcelType } from '../../../shared/types';
import { StatusBadge } from '../../components/common/StatusBadge';
import { TrackingTimeline } from '../../components/common/TrackingTimeline';
import { InvoiceModal } from '../../components/common/InvoiceModal';
import { PaymentModal } from '../../components/common/PaymentModal';
import { DashboardLayout, NavItem } from '../../components/common/DashboardLayout';
import { AnimatedCounter } from '../../components/common/AnimatedCounter';
import { TableSkeleton, CardSkeleton } from '../../components/common/SkeletonLoader';
import { EmptyState } from '../../components/common/EmptyState';

export const CustomerDashboard: React.FC<{ initialTab?: 'parcels' | 'book' | 'payments' | 'profile' }> = ({ initialTab = 'parcels' }) => {
  const { user, updateProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<'parcels' | 'book' | 'payments' | 'profile'>(initialTab);
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

  // Booking Form State
  const [bookData, setBookData] = useState({
    recipient_name: '',
    recipient_phone: '',
    recipient_email: '',
    pickup_address: user?.address || '582 Market St, Floor 14, San Francisco, CA 94104',
    delivery_address: '',
    weight_kg: 2.5,
    dimensions: '30x20x15 cm',
    parcel_type: 'standard' as ParcelType,
    special_instructions: '',
  });
  const [bookingSubmitting, setBookingSubmitting] = useState(false);
  const [bookingSuccessMsg, setBookingSuccessMsg] = useState<string | null>(null);

  // Profile Form State
  const [profileName, setProfileName] = useState(user?.full_name || '');
  const [profilePhone, setProfilePhone] = useState(user?.phone || '');
  const [profileAddress, setProfileAddress] = useState(user?.address || '');
  const [profilePassword, setProfilePassword] = useState('');
  const [profileMsg, setProfileMsg] = useState<string | null>(null);

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

  const handleBookSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBookingSubmitting(true);
    setBookingSuccessMsg(null);
    try {
      const res = await api.bookParcel(bookData);
      setBookingSuccessMsg(`Consignment created! Tracking Number: ${res.data?.tracking_number}`);
      try {
        confetti({
          particleCount: 75,
          spread: 80,
          origin: { y: 0.6 },
        });
      } catch (err) {}

      setBookData({
        recipient_name: '',
        recipient_phone: '',
        recipient_email: '',
        pickup_address: user?.address || '',
        delivery_address: '',
        weight_kg: 2.5,
        dimensions: '30x20x15 cm',
        parcel_type: 'standard',
        special_instructions: '',
      });
      loadData();
      setTimeout(() => {
        setActiveTab('parcels');
        setBookingSuccessMsg(null);
      }, 2400);
    } catch (err: any) {
      alert(err.message || 'Booking failed');
    } finally {
      setBookingSubmitting(false);
    }
  };

  const handleViewTracking = async (parcelId: string) => {
    try {
      const res = await api.getParcelById(parcelId);
      setSelectedParcelForTracking(res.data);
    } catch (err: any) {
      alert(err.message || 'Failed to load tracking timeline');
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfile({
        full_name: profileName,
        phone: profilePhone,
        address: profileAddress,
        password: profilePassword || undefined,
      });
      setProfileMsg('Profile updated successfully.');
      setTimeout(() => setProfileMsg(null), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed to update profile');
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

  const navItems: NavItem[] = [
    { id: 'parcels', label: 'My Consignments', icon: Package, badge: totalParcelsCount },
    { id: 'book', label: 'Book Shipment', icon: PlusCircle },
    { id: 'payments', label: 'Settlements & Invoices', icon: CreditCard, badge: payments.length },
    { id: 'profile', label: 'Shipper Profile', icon: User },
  ];

  const getBreadcrumbs = () => {
    const titles: Record<string, string> = {
      parcels: 'Active Consignments',
      book: 'Book New Freight',
      payments: 'Settlement Ledgers',
      profile: 'Account Preferences',
    };
    return [
      { label: 'Customer Console' },
      { label: titles[activeTab] || 'Overview', active: true },
    ];
  };

  return (
    <DashboardLayout
      title={
        activeTab === 'parcels'
          ? 'Consignment Hub'
          : activeTab === 'book'
          ? 'Dispatch New Freight'
          : activeTab === 'payments'
          ? 'Settlement & Billing'
          : 'Shipper Profile'
      }
      subtitle={
        activeTab === 'parcels'
          ? 'Track live GPS progress, download commercial invoices, and manage deliveries.'
          : activeTab === 'book'
          ? 'Enter consignee details and dispatch your next consignment.'
          : activeTab === 'payments'
          ? 'Review verified payment history, audit invoices, and settlement receipts.'
          : 'Update your corporate dispatch address, phone, and security credentials.'
      }
      roleBadgeText="Commercial Shipper"
      roleBadgeColor="bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800"
      navItems={navItems}
      activeNavId={activeTab}
      onSelectNav={(id) => setActiveTab(id as any)}
      breadcrumbs={getBreadcrumbs()}
      headerAction={
        activeTab === 'parcels' ? (
          <button
            onClick={() => setActiveTab('book')}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/20 transition-all cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Book New Shipment</span>
          </button>
        ) : null
      }
    >
      {/* Tab 1: Consignments & History */}
      {activeTab === 'parcels' && (
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
                $<AnimatedCounter value={totalSpent} decimals={2} />
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
                    : 'You haven’t booked any parcel consignments yet. Create your first shipment now.'
                }
                actionText="Book New Shipment"
                onAction={() => setActiveTab('book')}
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
                          ${p.shipping_cost.toFixed(2)}
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
      )}

      {/* Tab 2: Book Parcel */}
      {activeTab === 'book' && (
        <div className="max-w-3xl mx-auto">
          <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl transition-colors">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
              Dispatch Freight Consignment
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
              Complete the dispatch manifest. Shipping rates will be computed according to freight tier and weight.
            </p>

            {bookingSuccessMsg && (
              <div className="mb-6 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-400 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span className="font-semibold">{bookingSuccessMsg}</span>
              </div>
            )}

            <form onSubmit={handleBookSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Consignee / Recipient Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={bookData.recipient_name}
                    onChange={(e) => setBookData({ ...bookData, recipient_name: e.target.value })}
                    placeholder="e.g. David Sterling"
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800/70 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Recipient Contact Phone *
                  </label>
                  <input
                    type="tel"
                    required
                    value={bookData.recipient_phone}
                    onChange={(e) => setBookData({ ...bookData, recipient_phone: e.target.value })}
                    placeholder="+1 (555) 492-1084"
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800/70 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Recipient Email (For Delivery Notifications)
                </label>
                <input
                  type="email"
                  value={bookData.recipient_email}
                  onChange={(e) => setBookData({ ...bookData, recipient_email: e.target.value })}
                  placeholder="david@company.com"
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800/70 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Origin Pickup Address *
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={bookData.pickup_address}
                    onChange={(e) => setBookData({ ...bookData, pickup_address: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800/70 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Destination Delivery Address *
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={bookData.delivery_address}
                    onChange={(e) => setBookData({ ...bookData, delivery_address: e.target.value })}
                    placeholder="e.g. 742 Evergreen Terrace, Springfield, OR"
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800/70 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Freight Category
                  </label>
                  <select
                    value={bookData.parcel_type}
                    onChange={(e) => setBookData({ ...bookData, parcel_type: e.target.value as ParcelType })}
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800/70 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="standard">Standard Ground</option>
                    <option value="express">Express Priority Air</option>
                    <option value="fragile">Fragile Handling</option>
                    <option value="heavy">Heavy Freight</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Weight (kg) *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    max="100"
                    required
                    value={bookData.weight_kg}
                    onChange={(e) => setBookData({ ...bookData, weight_kg: parseFloat(e.target.value) || 0.1 })}
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800/70 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Package Dimensions
                  </label>
                  <input
                    type="text"
                    value={bookData.dimensions}
                    onChange={(e) => setBookData({ ...bookData, dimensions: e.target.value })}
                    placeholder="30x20x15 cm"
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800/70 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Courier Special Instructions
                </label>
                <input
                  type="text"
                  value={bookData.special_instructions}
                  onChange={(e) => setBookData({ ...bookData, special_instructions: e.target.value })}
                  placeholder="e.g. Ring doorbell, security gate code #4921"
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800/70 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setActiveTab('parcels')}
                  className="px-4 py-2.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={bookingSubmitting}
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-600/20 transition-all disabled:opacity-50 cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4" />
                  {bookingSubmitting ? 'Registering Consignment...' : 'Book & Generate Waybill'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tab 3: Payments & Invoices */}
      {activeTab === 'payments' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Commercial Settlement Ledger</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Audit-ready transactions and electronic payment receipts.</p>
            </div>
            <span className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-xl">
              {payments.length} Transactions
            </span>
          </div>

          {payments.length === 0 ? (
            <EmptyState
              title="No settlement records"
              description="You have no recorded payments in your billing ledger."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4">Transaction Reference</th>
                    <th className="py-3.5 px-4">Consignment</th>
                    <th className="py-3.5 px-4">Instrument</th>
                    <th className="py-3.5 px-4">Amount</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Timestamp</th>
                    <th className="py-3.5 px-4 text-right">Invoice</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {payments.map((pay) => (
                    <tr key={pay.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white">
                        {pay.transaction_id}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-blue-600 dark:text-blue-400 font-semibold">
                        {pay.tracking_number}
                      </td>
                      <td className="py-3.5 px-4 capitalize text-slate-700 dark:text-slate-300 font-medium">
                        {pay.payment_method.replace('_', ' ')}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white">
                        ${pay.amount.toFixed(2)}
                      </td>
                      <td className="py-3.5 px-4">
                        <StatusBadge status={pay.status} type="payment" size="sm" />
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                        {new Date(pay.created_at).toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => setSelectedInvoiceId(pay.parcel_id)}
                          className="px-3 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                        >
                          View Receipt
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Profile Settings */}
      {activeTab === 'profile' && (
        <div className="max-w-xl mx-auto">
          <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl transition-colors">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">Shipper Profile & Settings</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">Manage corporate identity and default pickup locations.</p>

            {profileMsg && (
              <div className="mb-5 p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-400 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{profileMsg}</span>
              </div>
            )}

            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Company / Full Name</label>
                <input
                  type="text"
                  required
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Account Email (Immutable)</label>
                <input
                  type="email"
                  disabled
                  value={user?.email || ''}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-100 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-500 dark:text-slate-400 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={profilePhone}
                  onChange={(e) => setProfilePhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Default Pickup Address</label>
                <textarea
                  rows={2}
                  value={profileAddress}
                  onChange={(e) => setProfileAddress(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Change Password (Optional)</label>
                <input
                  type="password"
                  value={profilePassword}
                  onChange={(e) => setProfilePassword(e.target.value)}
                  placeholder="Leave empty to keep current password"
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  Save Account Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
    </DashboardLayout>
  );
};
