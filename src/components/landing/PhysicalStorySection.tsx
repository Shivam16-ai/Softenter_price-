import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Building, 
  Layers, 
  Truck, 
  MapPin, 
  CheckCircle, 
  Clock, 
  Barcode, 
  Camera, 
  ArrowRight,
  ShieldCheck,
  Package
} from 'lucide-react';

interface Stage {
  step: string;
  title: string;
  subtitle: string;
  description: string;
  telemetry: string;
  image: string;
  metrics: { label: string; value: string }[];
}

export const PhysicalStorySection: React.FC = () => {
  const [activeStepIndex, setActiveStepIndex] = useState(0);

  const stages: Stage[] = [
    {
      step: '01',
      title: 'Warehouse Intake & Induction',
      subtitle: 'High-Bay Receiving & Optical Dimensioning',
      description:
        'Freight pallets arrive at inbound dock levelers. Laser volumetric scanners measure millimeter dimensions and register certified gross tare weights into the DBMS instantly.',
      telemetry: 'LATENCY: 140ms · 3D LASER VOLUMETRICS VERIFIED',
      image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80',
      metrics: [
        { label: 'Induction Speed', value: '0.4s / Pallet' },
        { label: 'Weight Precision', value: '± 0.05 kg' },
        { label: 'Verification', value: 'Optical OCR' },
      ],
    },
    {
      step: '02',
      title: 'Automated High-Speed Sorting',
      subtitle: 'Continuous Cross-Belt Matrix',
      description:
        'Overhead multi-angle barcoding cameras read packages travelling at 2.8 meters per second. Automated shoes divert items into 180 destination chutes based on real-time linehaul routes.',
      telemetry: 'THROUGHPUT: 48,200 UNITS/HR · 0.001% MISROUTE',
      image: 'https://images.unsplash.com/photo-1580674684081-7617fbf3d745?auto=format&fit=crop&w=1200&q=80',
      metrics: [
        { label: 'Sorting Capacity', value: '48k units/hr' },
        { label: 'Camera Resolution', value: '12 MP Multi-Angle' },
        { label: 'Chute Diverts', value: '180 Dynamic Bays' },
      ],
    },
    {
      step: '03',
      title: 'Bay Cross-Dock Dispatch',
      subtitle: 'Interstate Linehaul Staging',
      description:
        'Consignments are loaded directly into high-cube electric linehaul trailers. Electronic manifests are locked cryptographically to the assigned vehicle telematics module before dock departure.',
      telemetry: 'DOCK CYCLE: 18 MINS · TELEMATICS LINKED',
      image: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=1200&q=80',
      metrics: [
        { label: 'Trailer Volume', value: '105 m³ High-Cube' },
        { label: 'Dock Dwell Time', value: '< 25 Mins' },
        { label: 'Lock Status', value: 'Smart E-Seal' },
      ],
    },
    {
      step: '04',
      title: 'Interstate Trunk Highway Transit',
      subtitle: 'Autonomous Telemetry & Fleet Tracking',
      description:
        'Heavy transports cruise continental expressways with constant sensor streaming. Engine performance, ambient cargo bay temperatures, and sub-second GPS coordinates broadcast back to central dispatch.',
      telemetry: 'GPS REFRESH: 1,000ms · REEFER: 4.2°C STABLE',
      image: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=1200&q=80',
      metrics: [
        { label: 'Telemetry Stream', value: '1 Hz Cellular/Sat' },
        { label: 'Thermal Window', value: '2°C to 8°C (Pharma)' },
        { label: 'Corridor Status', value: 'Zero Geo-Deviations' },
      ],
    },
    {
      step: '05',
      title: 'Regional Hub Distribution',
      subtitle: 'Urban Micro-Fulfillment Sorting',
      description:
        'Trunk-haulers arrive at metropolitan distribution depots. Packages are cross-docked into agile electric vans and designated delivery agents according to optimized route clusters.',
      telemetry: 'HUB CROSS-DOCK: 14 MINS · ROUTE CLUSTERED',
      image: 'https://images.unsplash.com/photo-1587293852726-70cdb56c2866?auto=format&fit=crop&w=1200&q=80',
      metrics: [
        { label: 'Cluster Efficiency', value: '98.4% Density' },
        { label: 'Final-Mile Fleet', value: 'Urban EV Vans' },
        { label: 'Turnaround Time', value: '< 30 Mins Total' },
      ],
    },
    {
      step: '06',
      title: 'Final-Mile Handover & Verified Delivery',
      subtitle: 'Geofenced Signature & Instant Settlement',
      description:
        'The delivery agent completes the handover at the recipient door. A geofenced cryptographic digital signature and photo proof are stamped to generate the instant commercial invoice.',
      telemetry: 'SLA MET: 18:40 · GEOFENCE CONFIRMED (± 2m)',
      image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=1200&q=80',
      metrics: [
        { label: 'Geofence Accuracy', value: '± 2 Meters' },
        { label: 'Proof of Delivery', value: 'Photo + Biometric' },
        { label: 'Billing Settlement', value: 'Instant Auto-Invoice' },
      ],
    },
  ];

  const currentStage = stages[activeStepIndex];

  return (
    <section id="story" className="relative py-28 sm:py-36 bg-[#0c0e15] text-white border-t border-white/10 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 space-y-16">
        {/* Section Header */}
        <div className="space-y-4 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-[#FF5500]" />
            <span className="uppercase tracking-[0.25em] text-slate-300">
              END-TO-END PHYSICAL LIFECYCLE
            </span>
          </div>

          <h2 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold uppercase tracking-tight text-white leading-[0.95]">
            FROM WAREHOUSE{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF5500] via-amber-400 to-white">
              TO FRONT DOOR.
            </span>
          </h2>

          <p className="text-base sm:text-lg text-slate-300 font-light leading-relaxed">
            Every shipment follows an unbroken chain of custody through high-speed automated sorting, continental highway linehaul, and geofenced doorstep proof.
          </p>
        </div>

        {/* Horizontal Physical Timeline Navigation */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {stages.map((stage, idx) => (
            <button
              key={stage.step}
              onClick={() => setActiveStepIndex(idx)}
              className={`p-4 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden ${
                activeStepIndex === idx
                  ? 'bg-[#181a24] border-[#FF5500] shadow-xl shadow-orange-950/30'
                  : 'bg-[#11131c] border-white/10 hover:border-white/20'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`text-xs font-mono font-bold ${activeStepIndex === idx ? 'text-[#FF5500]' : 'text-slate-500'}`}>
                  PHASE {stage.step}
                </span>
                {activeStepIndex === idx && (
                  <span className="w-2 h-2 rounded-full bg-[#FF5500] animate-ping" />
                )}
              </div>
              <h3 className="text-sm font-bold text-white line-clamp-1">{stage.title}</h3>
              <p className="text-[11px] font-mono text-slate-400 mt-1 line-clamp-1">{stage.subtitle}</p>
            </button>
          ))}
        </div>

        {/* Selected Stage Full-Width Showcase */}
        <div className="rounded-3xl bg-[#141620] border border-white/10 overflow-hidden shadow-2xl grid grid-cols-1 lg:grid-cols-12">
          {/* Left: Authentic Photography */}
          <div className="lg:col-span-7 relative min-h-[380px] lg:min-h-[500px] overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.img
                key={currentStage.image}
                src={currentStage.image}
                alt={currentStage.title}
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6 }}
                className="absolute inset-0 w-full h-full object-cover filter brightness-[0.9] contrast-[1.05]"
              />
            </AnimatePresence>

            <div className="absolute inset-0 bg-gradient-to-t from-[#141620] via-transparent to-black/40" />

            {/* Bottom Photo Pill */}
            <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between p-3 rounded-xl bg-black/70 backdrop-blur-md border border-white/10 text-xs font-mono">
              <span className="text-amber-400 flex items-center gap-2">
                <Barcode className="w-4 h-4" />
                {currentStage.telemetry}
              </span>
              <span className="text-slate-400 uppercase hidden sm:inline">AUTHENTIC LOGISTICS FOOTAGE</span>
            </div>
          </div>

          {/* Right: Operational Details */}
          <div className="lg:col-span-5 p-8 sm:p-10 flex flex-col justify-between space-y-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 rounded bg-[#FF5500]/20 text-[#FF5500] font-mono text-xs font-bold">
                  STAGE {currentStage.step} OF 06
                </span>
                <span className="text-xs font-mono text-slate-400">UNBROKEN CHAIN OF CUSTODY</span>
              </div>

              <h3 className="text-3xl font-extrabold text-white tracking-tight leading-tight">
                {currentStage.title}
              </h3>
              <span className="text-sm font-mono text-amber-400 block -mt-2">
                {currentStage.subtitle}
              </span>

              <p className="text-sm text-slate-300 font-light leading-relaxed">
                {currentStage.description}
              </p>
            </div>

            {/* Stage Metrics Grid */}
            <div className="grid grid-cols-3 gap-3 border-y border-white/10 py-5">
              {currentStage.metrics.map((m) => (
                <div key={m.label} className="space-y-1">
                  <span className="text-[10px] font-mono uppercase text-slate-400 block">{m.label}</span>
                  <span className="text-sm font-bold text-white font-mono">{m.value}</span>
                </div>
              ))}
            </div>

            {/* Stepper Controls */}
            <div className="flex items-center justify-between pt-2">
              <button
                disabled={activeStepIndex === 0}
                onClick={() => setActiveStepIndex((prev) => Math.max(0, prev - 1))}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-30 text-xs font-mono uppercase text-slate-300 transition-colors cursor-pointer"
              >
                ← Previous Stage
              </button>
              <button
                disabled={activeStepIndex === stages.length - 1}
                onClick={() => setActiveStepIndex((prev) => Math.min(stages.length - 1, prev + 1))}
                className="px-4 py-2 rounded-xl bg-[#FF5500] hover:bg-orange-500 disabled:opacity-30 text-xs font-mono uppercase font-bold text-white transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <span>Next Stage</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
