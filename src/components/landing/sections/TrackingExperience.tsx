import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  Package, 
  MapPin, 
  Clock, 
  Truck, 
  User, 
  ShieldCheck, 
  Receipt, 
  CheckCircle2, 
  AlertCircle,
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import { api } from '../../../services/api';

interface TrackingExperienceProps {
  onViewInvoice?: (parcelId: string) => void;
}

export const TrackingExperience: React.FC<TrackingExperienceProps> = ({ onViewInvoice }) => {
  const [trackingNumber, setTrackingNumber] = useState('SR-2026CA-892104');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [trackingData, setTrackingData] = useState<any>({
    parcel: {
      id: 'pcl_101',
      tracking_number: 'SR-2026CA-892104',
      sender_name: 'David Chen',
      recipient_name: 'Aria Montgomery',
      recipient_phone: '+1 (555) 443-8821',
      pickup_address: '582 Market St, Floor 14, San Francisco, CA',
      delivery_address: '224 Rosewood Lane, Palo Alto, CA',
      weight_kg: 3.5,
      dimensions: '30x20x15 cm',
      parcel_type: 'express',
      status: 'in_transit',
      assigned_agent_name: 'Marcus Vance',
      shipping_cost: 44.75,
      payment_status: 'paid',
      estimated_delivery: 'Today — 18:40',
      vehicle_id: 'SR-TRK-204',
      current_location: 'Hyderabad Distribution Hub',
    },
    checkpoints: [
      {
        id: 'chk_1',
        status: 'picked_up',
        location: 'San Francisco Central Dispatch',
        description: 'Carrier Marcus Vance accepted consignment into transit.',
        timestamp: '09:20 UTC',
      },
      {
        id: 'chk_2',
        status: 'in_transit',
        location: 'Hyderabad Distribution Hub',
        description: 'Electronic customs logged; sorted for priority evening delivery.',
        timestamp: '14:35 UTC',
      },
      {
        id: 'chk_3',
        status: 'out_for_delivery',
        location: 'Bay Area Delivery Route #101',
        description: 'Loaded onto courier vehicle. Scheduled arrival today.',
        timestamp: 'Pending — ETA 18:40',
      },
    ],
  });

  const handleSearch = async (e?: React.FormEvent, customNo?: string) => {
    if (e) e.preventDefault();
    const query = (customNo || trackingNumber).trim();
    if (!query) return;

    setLoading(true);
    setError(null);
    try {
      const res = await api.trackParcel(query);
      if (res.data) {
        setTrackingData(res.data);
      }
    } catch (err: any) {
      setError(err.message || 'Consignment number not located in active telemetry network.');
    } finally {
      setLoading(false);
    }
  };

  const parcel = trackingData?.parcel;
  const checkpoints = trackingData?.checkpoints || [];

  return (
    <section id="tracking" className="relative py-28 px-4 sm:px-6 lg:px-8 bg-[#050811] text-white overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-sky-600/10 blur-[140px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Editorial Section Header */}
        <div className="max-w-3xl mb-14">
          <span className="text-xs font-mono uppercase tracking-[0.25em] text-sky-400 block mb-3">
            PUBLIC TELEMETRY PORTAL
          </span>
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-white leading-tight">
            Tracking Experience.{' '}
            <span className="font-serif italic font-normal text-transparent bg-clip-text bg-gradient-to-r from-sky-200 to-white">
              Absolute clarity.
            </span>
          </h2>
          <p className="mt-4 text-sm sm:text-base text-slate-400 font-light">
            Query any enterprise consignment across our global carrier ledger. Real-time GPS status, checkpoint history, and instant billing verification.
          </p>
        </div>

        {/* Live Search Input Bar */}
        <div className="max-w-2xl mb-12">
          <form onSubmit={handleSearch} className="relative flex items-center">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 pointer-events-none" />
            <input
              type="text"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              placeholder="Enter Consignment ID (e.g. SR-2026CA-892104)"
              className="w-full pl-12 pr-32 py-4 rounded-2xl bg-slate-900/90 border border-white/10 text-white placeholder-slate-500 font-mono text-xs focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none transition-all shadow-xl backdrop-blur-md"
            />
            <button
              type="submit"
              disabled={loading}
              className="absolute right-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold text-xs tracking-wide transition-all cursor-pointer shadow-md disabled:opacity-50"
            >
              {loading ? 'Querying...' : 'Track'}
            </button>
          </form>

          {/* Preset Sample ID Badges */}
          <div className="flex flex-wrap items-center gap-2 mt-3 text-xs font-mono text-slate-400">
            <span className="text-slate-500">Live Samples:</span>
            {['SR-2026CA-892104', 'SR-2026NY-419082', 'SR-2026TX-654321'].map((sample) => (
              <button
                key={sample}
                type="button"
                onClick={() => {
                  setTrackingNumber(sample);
                  handleSearch(undefined, sample);
                }}
                className="px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/5 hover:border-white/10 transition-colors cursor-pointer text-[11px]"
              >
                {sample}
              </button>
            ))}
          </div>

          {error && (
            <div className="mt-4 p-3 rounded-xl bg-rose-950/40 border border-rose-900 text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Master Integrated Telemetry Display */}
        {parcel && (
          <div className="bg-slate-900/80 rounded-3xl p-6 sm:p-10 border border-white/10 shadow-2xl backdrop-blur-xl">
            {/* Top Bar Summary */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-8 border-b border-white/10 gap-4">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 block">
                  CONSIGNMENT WAYBILL
                </span>
                <h3 className="text-2xl sm:text-3xl font-extrabold font-mono tracking-tight text-white mt-1">
                  {parcel.tracking_number}
                </h3>
              </div>

              <div className="flex items-center gap-3">
                <span className="px-3 py-1.5 rounded-lg bg-sky-500/20 text-sky-300 border border-sky-500/30 text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-sky-400 animate-ping" />
                  STATUS: {parcel.status.replace(/_/g, ' ')}
                </span>

                {onViewInvoice && (
                  <button
                    onClick={() => onViewInvoice(parcel.id)}
                    className="px-3.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Receipt className="w-3.5 h-3.5" />
                    <span>View Invoice</span>
                  </button>
                )}
              </div>
            </div>

            {/* Core Telemetry Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-8 border-b border-white/10 text-xs font-mono">
              <div>
                <span className="text-slate-400 text-[10px] uppercase block">Current Location</span>
                <span className="text-white font-bold text-sm block mt-1">
                  {parcel.current_location || 'Hyderabad Distribution Hub'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase block">Target ETA</span>
                <span className="text-white font-bold text-sm block mt-1 text-sky-300">
                  {parcel.estimated_delivery || 'Today — 18:40'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase block">Assigned Vehicle</span>
                <span className="text-white font-bold text-sm block mt-1">
                  {parcel.vehicle_id || 'SR-TRK-204'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase block">Assigned Driver</span>
                <span className="text-white font-bold text-sm block mt-1 flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-sky-400" />
                  {parcel.assigned_agent_name || 'Marcus Vance'}
                </span>
              </div>
            </div>

            {/* Checkpoint Timeline */}
            <div className="pt-8">
              <span className="text-xs font-mono uppercase tracking-widest text-slate-400 block mb-6">
                CHRONOLOGICAL CHECKPOINT AUDIT
              </span>

              <div className="space-y-6">
                {checkpoints.map((chk: any, idx: number) => {
                  const isLatest = idx === checkpoints.length - 1;
                  return (
                    <div key={chk.id || idx} className="flex items-start gap-4">
                      {/* Timeline node icon */}
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border ${
                          isLatest
                            ? 'bg-sky-500 text-white border-sky-300 shadow-[0_0_15px_rgba(56,189,248,0.5)]'
                            : 'bg-slate-950 text-slate-400 border-slate-800'
                        }`}
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 bg-slate-950/60 p-4 rounded-xl border border-white/5 space-y-1">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs font-mono gap-1">
                          <span className="font-bold text-white tracking-tight">
                            {chk.location}
                          </span>
                          <span className="text-slate-500 text-[11px]">
                            {chk.timestamp}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 font-light leading-relaxed">
                          {chk.detail || chk.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
