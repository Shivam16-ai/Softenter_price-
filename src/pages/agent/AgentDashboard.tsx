import React, { useState, useEffect } from 'react';
import { 
  Truck, 
  MapPin, 
  CheckCircle2, 
  Clock, 
  Navigation, 
  ShieldCheck, 
  Package, 
  Phone, 
  AlertCircle,
  Eye,
  Camera,
  Search,
  Check,
  TrendingUp,
  Award,
  Zap,
  RotateCcw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Parcel, ParcelStatus } from '../../../shared/types';
import { StatusBadge } from '../../components/common/StatusBadge';
import { ProofModal } from '../../components/common/ProofModal';
import { TrackingTimeline } from '../../components/common/TrackingTimeline';
import { DashboardLayout, NavItem } from '../../components/common/DashboardLayout';
import { AnimatedCounter } from '../../components/common/AnimatedCounter';
import { TableSkeleton } from '../../components/common/SkeletonLoader';
import { EmptyState } from '../../components/common/EmptyState';

export const AgentDashboard: React.FC = () => {
  const { user } = useAuth();
  const [parcels, setParcels] = useState<Parcel[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterView, setFilterView] = useState<'active' | 'history'>('active');
  const [searchQuery, setSearchQuery] = useState('');

  // Status update modal
  const [statusModalParcel, setStatusModalParcel] = useState<Parcel | null>(null);
  const [newStatus, setNewStatus] = useState<ParcelStatus>('picked_up');
  const [updateLocation, setUpdateLocation] = useState('San Francisco Delivery Hub');
  const [updateNotes, setUpdateNotes] = useState('');
  const [statusUpdating, setStatusUpdating] = useState(false);

  // Proof Modal
  const [proofParcel, setProofParcel] = useState<Parcel | null>(null);

  // Tracking Timeline Modal
  const [selectedTrackingData, setSelectedTrackingData] = useState<any>(null);

  const loadAgentParcels = async () => {
    setLoading(true);
    try {
      const res = await api.getParcels();
      setParcels(res.data || []);
    } catch (err) {
      console.error('Failed to load agent assignments', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAgentParcels();
  }, []);

  const handleStatusSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!statusModalParcel) return;
    setStatusUpdating(true);

    try {
      await api.updateParcelStatus(statusModalParcel.id, {
        status: newStatus,
        location: updateLocation,
        description: updateNotes || `Consignment updated to ${newStatus.replace('_', ' ')} by courier`,
      });
      setStatusModalParcel(null);
      loadAgentParcels();
    } catch (err: any) {
      alert(err.message || 'Failed to update status');
    } finally {
      setStatusUpdating(false);
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

  const activeAssignments = parcels.filter((p) => p.status !== 'delivered' && p.status !== 'cancelled');
  const completedDeliveries = parcels.filter((p) => p.status === 'delivered');

  const displayedList = (filterView === 'active' ? activeAssignments : completedDeliveries).filter((p) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.tracking_number.toLowerCase().includes(q) ||
      p.recipient_name.toLowerCase().includes(q) ||
      p.delivery_address.toLowerCase().includes(q)
    );
  });

  const navItems: NavItem[] = [
    { id: 'active', label: 'Active Manifest Run', icon: Truck, badge: activeAssignments.length },
    { id: 'history', label: 'Delivered History', icon: CheckCircle2, badge: completedDeliveries.length },
  ];

  const completionRate = parcels.length > 0 ? Math.round((completedDeliveries.length / parcels.length) * 100) : 100;

  return (
    <DashboardLayout
      title="Courier Operations Console"
      subtitle={`Mobile manifest & field telemetry for Courier Agent ${user?.full_name || 'Driver'}`}
      roleBadgeText="Courier Agent"
      roleBadgeColor="bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800"
      navItems={navItems}
      activeNavId={filterView}
      onSelectNav={(id) => setFilterView(id as any)}
      breadcrumbs={[
        { label: 'Agent Console' },
        { label: filterView === 'active' ? 'Active Route Manifest' : 'Completed Delivery Proofs', active: true },
      ]}
      headerAction={
        <div className="flex items-center gap-2">
          <button
            onClick={loadAgentParcels}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Refresh Manifest"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* KPI Top Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <motion.div
            whileHover={{ y: -2 }}
            className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Pending Handover</span>
              <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <Truck className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-blue-600 dark:text-blue-400 font-mono">
              <AnimatedCounter value={activeAssignments.length} />
            </div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 block">
              Active assigned consignments
            </span>
          </motion.div>

          <motion.div
            whileHover={{ y: -2 }}
            className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Delivered Today</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
              <AnimatedCounter value={completedDeliveries.length} />
            </div>
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1 block">
              Verified electronic signatures
            </span>
          </motion.div>

          <motion.div
            whileHover={{ y: -2 }}
            className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Route SLA Clearance</span>
              <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <Award className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">
              <AnimatedCounter value={completionRate} suffix="%" />
            </div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 block">
              Manifest on-time delivery rate
            </span>
          </motion.div>
        </div>

        {/* Search and Tabs Switcher */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by tracking, recipient, address..."
              className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilterView('active')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                filterView === 'active'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Active Manifest ({activeAssignments.length})
            </button>
            <button
              onClick={() => setFilterView('history')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                filterView === 'history'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Delivered Archive ({completedDeliveries.length})
            </button>
          </div>
        </div>

        {/* Parcels List */}
        {loading ? (
          <TableSkeleton rows={4} />
        ) : displayedList.length === 0 ? (
          <EmptyState
            title={filterView === 'active' ? 'No active deliveries' : 'No delivered archive yet'}
            description={
              filterView === 'active'
                ? 'All assigned consignments have been delivered or cleared from your manifest.'
                : 'Delivered shipments with digital signoffs will appear here.'
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {displayedList.map((parcel) => (
              <motion.div
                key={parcel.id}
                whileHover={{ y: -2 }}
                className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-sm text-slate-900 dark:text-white">
                        {parcel.tracking_number}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {parcel.parcel_type}
                      </span>
                    </div>
                    <StatusBadge status={parcel.status} size="sm" />
                  </div>

                  <div className="space-y-2.5 text-xs">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-slate-400 dark:text-slate-500 block text-[10px]">Destination Handover</span>
                        <p className="font-semibold text-slate-800 dark:text-slate-200">{parcel.delivery_address}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <Phone className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-slate-400 dark:text-slate-500 block text-[10px]">Recipient Contact</span>
                        <p className="font-medium text-slate-700 dark:text-slate-300">
                          {parcel.recipient_name} ({parcel.recipient_phone})
                        </p>
                      </div>
                    </div>

                    {parcel.special_instructions && (
                      <div className="p-2.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/40 text-[11px] text-amber-800 dark:text-amber-300">
                        <span className="font-bold">Instructions: </span>
                        {parcel.special_instructions}
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
                  <button
                    onClick={() => handleViewTracking(parcel.id)}
                    className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-semibold flex items-center gap-1"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Inspect Timeline
                  </button>

                  <div className="flex items-center gap-2">
                    {parcel.status !== 'delivered' && (
                      <>
                        <button
                          onClick={() => {
                            setStatusModalParcel(parcel);
                            setNewStatus(parcel.status === 'pending' ? 'picked_up' : 'in_transit');
                          }}
                          className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition-colors cursor-pointer"
                        >
                          Update Checkpoint
                        </button>

                        <button
                          onClick={() => setProofParcel(parcel)}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors cursor-pointer"
                        >
                          <Camera className="w-3.5 h-3.5" />
                          Confirm Delivery
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Checkpoint Status Update Modal */}
      {statusModalParcel && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Logistics Checkpoint Update
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Update transit telemetry for consignment <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{statusModalParcel.tracking_number}</span>
            </p>

            <form onSubmit={handleStatusSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  New Status
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as ParcelStatus)}
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="picked_up">Picked Up from Shipper Depot</option>
                  <option value="in_transit">In Transit / Regional Sorting Hub</option>
                  <option value="out_for_delivery">Out for Delivery (On Courier Van)</option>
                  <option value="failed">Delivery Exception / Failed Attempt</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Location Facility / Checkpoint Name *
                </label>
                <input
                  type="text"
                  required
                  value={updateLocation}
                  onChange={(e) => setUpdateLocation(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Checkpoint Log Description
                </label>
                <textarea
                  rows={2}
                  value={updateNotes}
                  onChange={(e) => setUpdateNotes(e.target.value)}
                  placeholder="e.g. Scanned into delivery vehicle; route dispatched."
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setStatusModalParcel(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={statusUpdating}
                  className="px-5 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs transition-all disabled:opacity-50 cursor-pointer"
                >
                  {statusUpdating ? 'Posting...' : 'Record Checkpoint'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Proof of Delivery Modal */}
      {proofParcel && (
        <ProofModal
          parcelId={proofParcel.id}
          defaultRecipient={proofParcel.recipient_name}
          onClose={() => setProofParcel(null)}
          onSuccess={() => {
            loadAgentParcels();
          }}
        />
      )}

      {/* Tracking Modal Detail Overlay */}
      {selectedTrackingData && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="max-w-4xl w-full my-8">
            <div className="flex justify-end mb-2">
              <button
                onClick={() => setSelectedTrackingData(null)}
                className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-700 shadow-sm"
              >
                Close Tracking View ✕
              </button>
            </div>
            <TrackingTimeline
              parcel={selectedTrackingData.parcel}
              tracking={selectedTrackingData.tracking}
              proof={selectedTrackingData.proof}
            />
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};
