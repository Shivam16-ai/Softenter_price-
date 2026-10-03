import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Cpu, 
  MapPin, 
  Truck, 
  User, 
  Clock, 
  ShieldCheck, 
  FileText, 
  Activity, 
  Zap, 
  ArrowRight,
  Database,
  CheckCircle2
} from 'lucide-react';

export const TechnologySection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<number>(0);

  const capabilities = [
    {
      num: '01',
      title: 'Dynamic Automated Dispatch & Load Balancing',
      summary: 'Mathematical route optimization across millions of parcel vectors.',
      details: 'Continuously clusters volumetric parcel consignments, matches trailer cubing efficiency to 98.4%, and assigns verified linehaul carriers with zero human dispatch bottleneck.',
      metric: '0.04s Execution Time',
    },
    {
      num: '02',
      title: 'Sub-Second GPS & IoT Mesh Telematics',
      summary: 'Continuous sensor streaming from vehicle CAN-bus and cargo bay nodes.',
      details: 'Streams vehicle velocity, engine load, vibration shock levels, ambient temperature, and satellite positioning with sub-meter accuracy directly into the central telemetry stream.',
      metric: '1,000ms Ping Interval',
    },
    {
      num: '03',
      title: 'Cryptographic Geofenced Proof of Delivery',
      summary: 'Tamper-proof delivery validation with biometric and visual verification.',
      details: 'Upon arrival within a 2-meter delivery geofence, the agent captures a recipient digital signature and timestamped photo. A SHA-256 validation hash is committed instantly.',
      metric: 'SHA-256 Ledger Verifiable',
    },
    {
      num: '04',
      title: 'Automated Commercial Invoicing & Instant Settlement',
      summary: 'Immediate invoice dispatch and audit trail reconciliation.',
      details: 'Eliminates billing disputes. The moment delivery is certified, an official commercial invoice with dimensional breakdown and tax ledger entries is automatically generated and delivered.',
      metric: '120ms Post-Delivery Billing',
    },
  ];

  return (
    <section id="technology" className="relative py-28 sm:py-36 bg-[#0c0d12] text-white border-t border-white/10 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 space-y-20">
        {/* Section Header */}
        <div className="space-y-4 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono">
            <Cpu className="w-3.5 h-3.5 text-[#FF5500]" />
            <span className="uppercase tracking-[0.25em] text-slate-300">
              PHYSICAL TO DIGITAL CONVERGENCE
            </span>
          </div>

          <h2 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold uppercase tracking-tight text-white leading-[0.95]">
            THE PHYSICAL WORLD.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-blue-200 to-white">
              CONNECTED IN REAL TIME.
            </span>
          </h2>

          <p className="text-base sm:text-lg text-slate-300 font-light leading-relaxed">
            Software that understands the real physics of heavy freight, interstate travel times, and precision delivery execution.
          </p>
        </div>

        {/* Major Editorial Feature Split: "EVERY PARCEL HAS A STORY" */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center rounded-3xl bg-[#13151f] border border-white/10 p-8 sm:p-12 shadow-2xl">
          {/* Left: Oversized Typography */}
          <div className="lg:col-span-5 space-y-6">
            <span className="text-xs font-mono uppercase tracking-[0.25em] text-[#FF5500] font-bold block">
              INDIVIDUAL CONSIGNMENT TELEMETRY
            </span>

            <h3 className="text-4xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tight text-white leading-[0.95] font-sans">
              EVERY PARCEL{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-orange-400">
                HAS A STORY.
              </span>
            </h3>

            <p className="text-sm sm:text-base text-slate-300 font-light leading-relaxed">
              Every parcel in our network is continuously tracked through physical sort events, carrier handovers, temperature monitors, and geofenced handoffs with zero data ambiguity.
            </p>

            <div className="pt-2 flex items-center gap-3 text-xs font-mono text-slate-400">
              <span className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-emerald-400 font-bold">
                100% AUDITABLE
              </span>
              <span>·</span>
              <span>ZERO MOCK DATA</span>
              <span>·</span>
              <span>RELATIONAL DBMS</span>
            </div>
          </div>

          {/* Right: Live Realistic Telemetry Inspector HUD */}
          <div className="lg:col-span-7 rounded-2xl bg-black/80 border border-white/15 p-6 sm:p-8 space-y-5 shadow-inner">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-xs font-mono text-white font-bold tracking-wider">
                  WAYBILL: SR-2026CA-892104
                </span>
              </div>
              <span className="px-2.5 py-1 rounded bg-[#FF5500]/20 text-[#FF5500] text-[10px] font-mono font-bold uppercase">
                IN_TRANSIT · HIGHWAY CRUISE
              </span>
            </div>

            {/* Grid Coordinates & Route */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
              <div className="p-3 rounded-xl bg-white/5">
                <span className="text-slate-400 block text-[10px] uppercase">ORIGIN</span>
                <span className="text-white font-bold truncate block">Hyderabad Hub</span>
              </div>
              <div className="p-3 rounded-xl bg-white/5">
                <span className="text-slate-400 block text-[10px] uppercase">DESTINATION</span>
                <span className="text-white font-bold truncate block">Bengaluru Tech Hub</span>
              </div>
              <div className="p-3 rounded-xl bg-white/5">
                <span className="text-slate-400 block text-[10px] uppercase">CURRENT NODE</span>
                <span className="text-amber-400 font-bold truncate block">NH-44 Km 312</span>
              </div>
              <div className="p-3 rounded-xl bg-white/5">
                <span className="text-slate-400 block text-[10px] uppercase">ESTIMATED TIME</span>
                <span className="text-emerald-400 font-bold block">18:40 Today</span>
              </div>
            </div>

            {/* Assigned Assets */}
            <div className="p-4 rounded-xl bg-[#11131a] border border-white/10 space-y-3 text-xs font-mono">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-300">
                  <User className="w-4 h-4 text-[#FF5500]" />
                  <span>Assigned Driver: <strong className="text-white font-semibold">Marcus Vance</strong></span>
                </div>
                <span className="text-slate-500">Badge #SR-DRV-104</span>
              </div>

              <div className="flex items-center justify-between border-t border-white/5 pt-2">
                <div className="flex items-center gap-2 text-slate-300">
                  <Truck className="w-4 h-4 text-sky-400" />
                  <span>Assigned Carrier: <strong className="text-white font-semibold">SR-TRK-204 (Scania High-Cube)</strong></span>
                </div>
                <span className="text-emerald-400">78 km/h · 4.2°C Reefer</span>
              </div>
            </div>

            {/* Cryptographic Ledger Verification Hash */}
            <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5 flex items-center justify-between text-[11px] font-mono text-slate-400">
              <span className="flex items-center gap-2 truncate">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="truncate">PROOF HASH: 0x8f2d...41a9e91c7802b1f3</span>
              </span>
              <span className="text-slate-500 shrink-0 ml-2">VERIFIED ON DISPATCH</span>
            </div>
          </div>
        </div>

        {/* 4 Deep Technology Pillars (Editorial Asymmetric Layout) */}
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <span className="text-xs font-mono uppercase tracking-[0.2em] text-[#FF5500] font-bold">
              SYSTEM CAPABILITIES
            </span>
            <span className="text-xs font-mono text-slate-400">01 THROUGH 04</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {capabilities.map((cap, idx) => (
              <div
                key={cap.num}
                className="p-8 rounded-3xl bg-[#14161f] border border-white/10 hover:border-[#FF5500]/40 transition-all space-y-4 group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-[#FF5500]">
                    {cap.num}
                  </span>
                  <span className="px-2.5 py-0.5 rounded bg-white/5 border border-white/10 text-[11px] font-mono text-slate-300">
                    {cap.metric}
                  </span>
                </div>

                <h4 className="text-xl font-bold text-white group-hover:text-orange-400 transition-colors">
                  {cap.title}
                </h4>

                <p className="text-xs font-mono text-amber-400">
                  {cap.summary}
                </p>

                <p className="text-sm text-slate-400 font-light leading-relaxed">
                  {cap.details}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
