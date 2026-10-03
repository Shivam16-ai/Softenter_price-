import React, { useState, useEffect } from 'react';
import { 
  Search, 
  MapPin, 
  Truck, 
  User, 
  Calendar, 
  ShieldCheck, 
  FileText, 
  CheckCircle2, 
  Clock, 
  ArrowRight,
  AlertCircle,
  Activity,
  Layers,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { api } from '../../services/api';
import { Parcel, TrackingCheckpoint, DeliveryProof } from '../../../shared/types';

interface TrackingData {
  parcel: Parcel;
  tracking: TrackingCheckpoint[];
  proof?: DeliveryProof;
}

interface InteractiveTrackingSectionProps {
  onViewInvoice: (parcelId: string) => void;
  initialTrackingNumber?: string;
}

export const InteractiveTrackingSection: React.FC<InteractiveTrackingSectionProps> = ({
  onViewInvoice,
  initialTrackingNumber = 'SR-2026CA-892104',
}) => {
  const [trackingNumber, setTrackingNumber] = useState(initialTrackingNumber);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<TrackingData | null>(null);

  const fetchTracking = async (numberToFetch: string) => {
    if (!numberToFetch.trim()) return;
    setLoading(true);
    setError(null);

    try {
      const res = await api.trackParcel(numberToFetch.trim());
      if (res.success && res.data) {
        setData(res.data);
      } else {
        setError(res.error || 'No consignment found with this tracking reference.');
      }
    } catch (err: any) {
      setError(err.message || 'Error communicating with tracking servers.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTracking(initialTrackingNumber);
  }, [initialTrackingNumber]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchTracking(trackingNumber);
  };

  return (
    <section id="tracking" className="relative py-28 sm:py-36 bg-[#0f1118] text-white border-t border-white/10 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 space-y-16">
        {/* Section Header */}
        <div className="space-y-4 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-[#FF5500]" />
            <span className="uppercase tracking-[0.25em] text-slate-300">
              MISSION CONTROL ACCESS
            </span>
          </div>

          <h2 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold uppercase tracking-tight text-white leading-[0.95]">
            LIVE TRACKING{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF5500] via-amber-400 to-white">
              EXPERIENCE.
            </span>
          </h2>

          <p className="text-base sm:text-lg text-slate-300 font-light leading-relaxed">
            Directly connected to the enterprise DBMS. Query active shipments moving across road corridors, distribution centers, and final delivery bays.
          </p>
        </div>

        {/* Search Console Input Bar */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#141620] border border-white/10 shadow-2xl">
          <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                placeholder="Enter Consignment Tracking ID..."
                className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-black/60 border border-white/15 text-white font-mono text-xs uppercase tracking-wider focus:outline-none focus:border-[#FF5500] transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-[#FF5500] hover:bg-orange-500 text-white font-bold text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(255,85,0,0.35)] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shrink-0"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Query System</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick preset buttons */}
          <div className="pt-3 flex flex-wrap items-center gap-2 text-xs font-mono text-slate-400">
            <span>Quick Samples:</span>
            {['SR-2026CA-892104', 'SR-2026HY-110482', 'SR-2026BL-491028'].map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => {
                  setTrackingNumber(id);
                  fetchTracking(id);
                }}
                className="px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white cursor-pointer transition-colors"
              >
                {id}
              </button>
            ))}
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-900/50 text-rose-300 text-xs font-mono flex items-center gap-3">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Live Parcel Data Console */}
        {data && (
          <div className="space-y-8">
            {/* Top Overview Strip */}
            <div className="rounded-3xl bg-[#141620] border border-white/10 p-6 sm:p-8 grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="space-y-1">
                <span className="text-[10px] font-mono uppercase text-slate-400 block">WAYBILL REFERENCE</span>
                <span className="text-base sm:text-lg font-bold font-mono text-white block">
                  {data.parcel.tracking_number}
                </span>
                <span className="text-xs font-mono text-amber-400 block">
                  Weight: {data.parcel.weight_kg} kg · {data.parcel.parcel_type}
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-mono uppercase text-slate-400 block">CURRENT STATUS</span>
                <span className="inline-block px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-400 font-mono text-xs font-bold uppercase">
                  {data.parcel.status.replace('_', ' ')}
                </span>
                <span className="text-xs font-mono text-slate-400 block">
                  {data.tracking[0]?.location || 'En Route Highway'}
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-mono uppercase text-slate-400 block">ESTIMATED ARRIVAL</span>
                <span className="text-base sm:text-lg font-bold font-mono text-white block">
                  {data.parcel.estimated_delivery ? new Date(data.parcel.estimated_delivery).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '18:40'}
                </span>
                <span className="text-xs font-mono text-slate-400 block">
                  Today · Scheduled SLA
                </span>
              </div>

              <div className="flex flex-col justify-end space-y-2">
                <button
                  onClick={() => onViewInvoice(data.parcel.id)}
                  className="w-full py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-xs font-mono uppercase font-bold text-white transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5 text-[#FF5500]" />
                  <span>View Commercial Invoice</span>
                </button>
              </div>
            </div>

            {/* Split Screen: Live Route Map Simulation & Audit Checkpoint Timeline */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Map & Corridor Simulation (7 Cols) */}
              <div className="lg:col-span-7 rounded-3xl bg-[#11131c] border border-white/10 p-6 sm:p-8 space-y-6">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-[#FF5500]" />
                    <span className="text-xs font-mono uppercase tracking-wider font-bold text-white">
                      LIVE ROUTE TELEMATICS
                    </span>
                  </div>
                  <span className="text-xs font-mono text-emerald-400">VEHICLE ONLINE (1 Hz)</span>
                </div>

                {/* Vector Map Canvas with Live Truck Marker */}
                <div className="relative aspect-[16/9] w-full rounded-2xl bg-black border border-white/10 overflow-hidden flex items-center justify-center p-6">
                  <svg className="w-full h-full opacity-70" viewBox="0 0 600 340">
                    {/* Background Grid */}
                    <path d="M 0 80 L 600 80 M 0 170 L 600 170 M 0 260 L 600 260" stroke="#334155" strokeWidth="0.5" strokeDasharray="4,4" />
                    <path d="M 150 0 L 150 340 M 300 0 L 300 340 M 450 0 L 450 340" stroke="#334155" strokeWidth="0.5" strokeDasharray="4,4" />

                    {/* Active Route Path */}
                    <path
                      d="M 120 70 Q 280 140 460 250"
                      fill="none"
                      stroke="#FF5500"
                      strokeWidth="4"
                      strokeDasharray="8,4"
                      className="animate-[dash_15s_linear_infinite]"
                    />

                    {/* Origin Node */}
                    <circle cx="120" cy="70" r="7" fill="#f59e0b" />
                    <text x="135" y="74" fill="#cbd5e1" fontSize="11" fontFamily="monospace">ORIGIN: HYDERABAD CENTRAL</text>

                    {/* Moving Carrier Marker */}
                    <g transform="translate(320, 160)">
                      <circle cx="0" cy="0" r="12" fill="#FF5500" opacity="0.3" className="animate-ping" />
                      <circle cx="0" cy="0" r="6" fill="#FF5500" />
                      <circle cx="0" cy="0" r="3" fill="#ffffff" />
                      <text x="12" y="4" fill="#f97316" fontSize="10" fontWeight="bold" fontFamily="monospace">
                        SR-TRK-882 (78 km/h)
                      </text>
                    </g>

                    {/* Destination Node */}
                    <circle cx="460" cy="250" r="7" fill="#38bdf8" />
                    <text x="320" y="275" fill="#38bdf8" fontSize="11" fontFamily="monospace">DEST: BENGALURU TECH HUB</text>
                  </svg>

                  {/* Bottom Map Floating Overlay */}
                  <div className="absolute bottom-3 left-3 right-3 p-3 rounded-xl bg-black/80 backdrop-blur-md border border-white/10 flex items-center justify-between text-[11px] font-mono">
                    <span className="text-slate-300">CARRIER: Scania R500 High-Cube Linehaul</span>
                    <span className="text-amber-400">ETA: 18:40 Today</span>
                  </div>
                </div>

                {/* Assigned Operational Personnel */}
                {data.parcel.assigned_agent_name && (
                  <div className="p-4 rounded-2xl bg-black/40 border border-white/10 flex items-center justify-between text-xs font-mono">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-slate-200">
                        <User className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-white font-bold block">{data.parcel.assigned_agent_name}</span>
                        <span className="text-slate-400">Assigned Logistics Delivery Agent</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-emerald-400 font-bold block">UNIT ACTIVE</span>
                      <span className="text-slate-500">Geofence Armed</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Verified Checkpoint Timeline (5 Cols) */}
              <div className="lg:col-span-5 rounded-3xl bg-[#11131c] border border-white/10 p-6 sm:p-8 space-y-6">
                <div className="border-b border-white/10 pb-4">
                  <span className="text-xs font-mono uppercase tracking-[0.2em] text-[#FF5500] font-bold block">
                    CHAIN OF CUSTODY
                  </span>
                  <h3 className="text-xl font-bold text-white mt-1">Audit Checkpoints</h3>
                </div>

                <div className="space-y-6 relative pl-6 border-l-2 border-white/10 ml-2">
                  {data.tracking.map((cp, idx) => (
                    <div key={cp.id} className="relative space-y-1">
                      {/* Node circle */}
                      <div className="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full bg-[#FF5500] border-2 border-[#11131c]" />

                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="font-bold text-white uppercase">{cp.status.replace('_', ' ')}</span>
                        <span className="text-slate-400">
                          {new Date(cp.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 text-xs font-mono text-amber-400">
                        <MapPin className="w-3 h-3 shrink-0" />
                        <span>{cp.location}</span>
                      </div>

                      {cp.notes && (
                        <p className="text-xs text-slate-400 font-light pt-0.5">
                          {cp.notes}
                        </p>
                      )}
                    </div>
                  ))}
                </div>

                {/* Cryptographic Assurance */}
                <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/20 text-xs font-mono text-emerald-300 flex items-center gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>All checkpoints are immutably signed into the relational audit ledger.</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
