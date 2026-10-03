import React from 'react';
import { motion } from 'motion/react';
import { 
  Building2, 
  Layers, 
  Clock, 
  Zap, 
  CheckCircle2, 
  ShieldCheck, 
  FileText, 
  Truck,
  ArrowRight,
  Barcode
} from 'lucide-react';

export const WarehouseOperationsSection: React.FC = () => {
  const operations = [
    {
      title: 'Automated Route Dispatch',
      timing: '< 0.04s Algorithm Execution',
      description: 'Dynamically batches thousands of consignments into optimal trailer cubes and dispatches haulers before dock congestion forms.',
      image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80',
    },
    {
      title: 'Real-Time Inventory & Telemetry',
      timing: '100% Pallet Visibility',
      description: 'Continuous RFID tag readers on every conveyor and forklift verify exact pallet shelf coordinates in three-dimensional high-bay space.',
      image: 'https://images.unsplash.com/photo-1580674684081-7617fbf3d745?auto=format&fit=crop&w=800&q=80',
    },
    {
      title: 'Verified Proof of Delivery',
      timing: '± 2-Meter Geofence Lock',
      description: 'Handover at the customer bay requires biometric or cryptographic signature verification, preventing misplacement and cargo tampering.',
      image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=800&q=80',
    },
    {
      title: 'Instant Commercial Invoicing',
      timing: '120ms Post-Handover',
      description: 'Automatic reconciliation between dispatch weight, tariff rates, and proof of delivery eliminates billing dispute cycles entirely.',
      image: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=800&q=80',
    },
  ];

  return (
    <section id="warehouses" className="relative py-28 sm:py-36 bg-[#0f1118] text-white border-t border-white/10 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 space-y-16">
        {/* Section Header */}
        <div className="space-y-4 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono">
            <Building2 className="w-3.5 h-3.5 text-[#FF5500]" />
            <span className="uppercase tracking-[0.25em] text-slate-300">
              DISTRIBUTION CENTER EFFICIENCY
            </span>
          </div>

          <h2 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold uppercase tracking-tight text-white leading-[0.95]">
            EVERY SECOND{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-[#FF5500] to-orange-200">
              COUNTS.
            </span>
          </h2>

          <p className="text-base sm:text-lg text-slate-300 font-light leading-relaxed">
            In global logistics, a ten-minute dock delay cascades across hundreds of downstream deliveries. Our fulfillment centers are engineered for high-velocity cross-docking.
          </p>
        </div>

        {/* 4 Core Operations Editorial Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {operations.map((op, idx) => (
            <div
              key={op.title}
              className="rounded-3xl bg-[#141620] border border-white/10 overflow-hidden group hover:border-[#FF5500]/50 transition-all shadow-xl flex flex-col justify-between"
            >
              <div className="relative aspect-[16/9] w-full overflow-hidden">
                <img
                  src={op.image}
                  alt={op.title}
                  className="w-full h-full object-cover filter brightness-[0.85] group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#141620] via-transparent to-transparent" />
                <div className="absolute top-4 left-4 px-3 py-1 rounded bg-black/70 backdrop-blur-md border border-white/10 text-xs font-mono text-amber-400 font-bold">
                  {op.timing}
                </div>
              </div>

              <div className="p-8 space-y-3">
                <span className="text-xs font-mono uppercase tracking-[0.2em] text-[#FF5500] font-bold">
                  BENCHMARK 0{idx + 1}
                </span>
                <h3 className="text-2xl font-bold text-white group-hover:text-orange-400 transition-colors">
                  {op.title}
                </h3>
                <p className="text-sm text-slate-300 font-light leading-relaxed">
                  {op.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Operational Benchmarks Strip */}
        <div className="p-8 rounded-3xl bg-black/60 border border-white/10 grid grid-cols-2 md:grid-cols-4 gap-6 text-center font-mono">
          <div className="space-y-1">
            <span className="text-3xl sm:text-4xl font-black text-white">18 MINS</span>
            <span className="text-xs text-slate-400 uppercase tracking-wider block">Average Dock Turnaround</span>
          </div>
          <div className="space-y-1">
            <span className="text-3xl sm:text-4xl font-black text-[#FF5500]">48.2K</span>
            <span className="text-xs text-slate-400 uppercase tracking-wider block">Sort Throughput / Hour</span>
          </div>
          <div className="space-y-1">
            <span className="text-3xl sm:text-4xl font-black text-amber-400">99.98%</span>
            <span className="text-xs text-slate-400 uppercase tracking-wider block">Barcode Optical Accuracy</span>
          </div>
          <div className="space-y-1">
            <span className="text-3xl sm:text-4xl font-black text-emerald-400">0.00%</span>
            <span className="text-xs text-slate-400 uppercase tracking-wider block">Unverified Departures</span>
          </div>
        </div>
      </div>
    </section>
  );
};
