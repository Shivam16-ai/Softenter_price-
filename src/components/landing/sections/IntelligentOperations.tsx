import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Navigation, 
  Radio, 
  FileCheck2, 
  Receipt, 
  Coins, 
  Network, 
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
  Cpu
} from 'lucide-react';

interface OperationItem {
  number: string;
  title: string;
  category: string;
  description: string;
  metrics: { label: string; value: string }[];
  highlight: string;
  icon: React.ElementType;
}

const OPERATIONS: OperationItem[] = [
  {
    number: '01',
    title: 'Automated Route Dispatch',
    category: 'ALGORITHMIC ENGINE',
    description: 'Dynamic graph solvers ingest live expressway congestion, vehicle payload capacity, and delivery SLA windows to compute optimal multi-stop dispatch paths in milliseconds.',
    metrics: [
      { label: 'Dispatch Latency', value: '< 180ms' },
      { label: 'Mileage Optimization', value: '-19.4%' },
      { label: 'Fuel / Energy Saved', value: '23.8%' },
    ],
    highlight: 'Dijkstra + Ant-Colony Hybrid Route Solver with dynamic weather rerouting',
    icon: Navigation,
  },
  {
    number: '02',
    title: 'Real-Time Fleet Tracking',
    category: 'TELEMETRY MESH',
    description: 'Sub-second GPS telemetry and CAN-bus engine diagnostics broadcast continuous vehicle status, battery thermals, and geofence boundary crosses straight to the dispatch console.',
    metrics: [
      { label: 'GPS Accuracy', value: '< 1.2m' },
      { label: 'Ping Frequency', value: '500ms' },
      { label: 'Telemetry Stream', value: '256-Bit SSL' },
    ],
    highlight: 'Active corridor geofencing with autonomous deviations alert trigger',
    icon: Radio,
  },
  {
    number: '03',
    title: 'Verified Proof of Delivery',
    category: 'CRYPTOGRAPHIC AUDIT',
    description: 'Eliminate disputed drop-offs with electronic stylus signatures, high-resolution cargo condition photos, GPS geo-stamping, and recipient identity verification recorded directly onto the ledger.',
    metrics: [
      { label: 'Dispute Reduction', value: '99.2%' },
      { label: 'Photo Verification', value: '4K Native' },
      { label: 'POD Timestamp', value: 'Atomic UTC' },
    ],
    highlight: 'ECDSA signature hashing ensures delivery certificates cannot be altered retroactively',
    icon: FileCheck2,
  },
  {
    number: '04',
    title: 'Commercial Invoicing',
    category: 'BILLING AUTOMATION',
    description: 'Automated rate matrices instantly compute baseline weight, dimensional volumetric tariffs, fuel surcharges, and state taxes upon pickup, generating exportable PDF invoices immediately.',
    metrics: [
      { label: 'Invoicing Speed', value: 'Instant' },
      { label: 'Tax Accuracy', value: '100% Tax Compliant' },
      { label: 'Multi-Currency', value: 'USD · EUR · INR' },
    ],
    highlight: 'Automated dimensional weight tariff calculation according to IATA standards',
    icon: Receipt,
  },
  {
    number: '05',
    title: 'Settlement Management',
    category: 'FINANCIAL RECONCILIATION',
    description: 'Contract carrier payouts and multi-driver settlement batches are reconciled automatically against verified electronic proof-of-delivery timestamps, eliminating manual reconciliation overhead.',
    metrics: [
      { label: 'Cycle Time', value: 'T+0 Instant' },
      { label: 'Reconciliation', value: 'Automated' },
      { label: 'Audit Trail', value: 'Immutable' },
    ],
    highlight: 'Instant milestone-triggered carrier payouts with automated invoice deductions',
    icon: Coins,
  },
  {
    number: '06',
    title: 'Distribution Hub Operations',
    category: 'FACILITY AUTOMATION',
    description: 'High-throughput distribution cross-docking software coordinates conveyor optical barcode scanners, robotic sortation belts, and dock bay assignments with zero manual sorting latency.',
    metrics: [
      { label: 'Hub Throughput', value: '48,000 pk/hr' },
      { label: 'Sort Error Rate', value: '< 0.001%' },
      { label: 'Dock Turnaround', value: '22 Mins' },
    ],
    highlight: 'Autonomous dock management synchronizing incoming linehauls with outbound vans',
    icon: Network,
  },
];

export const IntelligentOperations: React.FC = () => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const activeOp = OPERATIONS[selectedIndex];
  const Icon = activeOp.icon;

  return (
    <section className="relative py-28 px-4 sm:px-6 lg:px-8 bg-[#070b16] text-white border-t border-white/5 overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-0 w-[500px] h-[500px] bg-blue-600/10 blur-[160px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Editorial Statement Header */}
        <div className="max-w-3xl mb-16">
          <span className="text-xs font-mono uppercase tracking-[0.25em] text-sky-400 block mb-3">
            ENTERPRISE CAPABILITIES
          </span>
          <h2 className="text-4xl sm:text-6xl font-bold tracking-tight text-white leading-tight">
            From dispatch{' '}
            <span className="font-serif italic font-normal text-transparent bg-clip-text bg-gradient-to-r from-sky-200 to-white">
              to delivery.
            </span>
          </h2>
          <p className="mt-4 text-sm sm:text-base text-slate-400 font-light">
            An integrated operating system engineered for enterprise carriers, freight forwarders, and commercial logistics networks.
          </p>
        </div>

        {/* Editorial List (Left) + Interactive Visual HUD (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Editorial Capabilities List (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            {OPERATIONS.map((op, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={op.number}
                  onClick={() => setSelectedIndex(idx)}
                  className={`group p-6 rounded-2xl transition-all duration-300 cursor-pointer border ${
                    isSelected
                      ? 'bg-slate-900/90 border-sky-500/40 shadow-[0_0_30px_rgba(2,132,199,0.15)]'
                      : 'bg-slate-950/40 border-white/5 hover:border-white/15 hover:bg-slate-900/50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-baseline gap-4 sm:gap-6">
                      <span
                        className={`font-mono text-xl sm:text-2xl font-extrabold tracking-tight transition-colors ${
                          isSelected ? 'text-sky-400' : 'text-slate-600 group-hover:text-slate-400'
                        }`}
                      >
                        {op.number}
                      </span>
                      <div>
                        <span className="text-[10px] font-mono tracking-widest uppercase text-slate-500 block">
                          {op.category}
                        </span>
                        <h3
                          className={`text-lg sm:text-2xl font-bold tracking-tight transition-colors mt-0.5 ${
                            isSelected ? 'text-white' : 'text-slate-300 group-hover:text-white'
                          }`}
                        >
                          {op.title}
                        </h3>
                      </div>
                    </div>

                    <ArrowUpRight
                      className={`w-5 h-5 transition-transform duration-300 ${
                        isSelected
                          ? 'text-sky-400 translate-x-0.5 -translate-y-0.5'
                          : 'text-slate-600 group-hover:text-slate-400'
                      }`}
                    />
                  </div>

                  {isSelected && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      transition={{ duration: 0.3 }}
                      className="mt-4 pt-4 border-t border-white/10 text-sm text-slate-300 leading-relaxed font-light"
                    >
                      {op.description}
                    </motion.div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Interactive Live Visual Display (5 cols) */}
          <div className="lg:col-span-5 sticky top-28 bg-slate-900/95 rounded-3xl p-7 border border-white/10 shadow-2xl backdrop-blur-xl space-y-6">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center border border-sky-500/30">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 block">
                    CAPABILITY SPECIFICATION
                  </span>
                  <span className="font-bold text-white text-sm">
                    {activeOp.title}
                  </span>
                </div>
              </div>

              <span className="px-2 py-1 bg-white/5 text-slate-300 text-[10px] font-mono rounded border border-white/10">
                ACTIVE ENGINE
              </span>
            </div>

            {/* Metrics Showcase */}
            <div className="grid grid-cols-3 gap-3">
              {activeOp.metrics.map((m, i) => (
                <div key={i} className="bg-slate-950/80 p-3 rounded-xl border border-white/5 text-center">
                  <span className="text-[9px] font-mono text-slate-400 uppercase block truncate">
                    {m.label}
                  </span>
                  <span className="text-white font-mono font-bold text-sm mt-1 block">
                    {m.value}
                  </span>
                </div>
              ))}
            </div>

            {/* Architecture Highlight Box */}
            <div className="bg-slate-950/90 p-4 rounded-2xl border border-sky-500/20 space-y-2">
              <div className="flex items-center gap-2 text-sky-400 text-xs font-mono font-bold uppercase tracking-wider">
                <Cpu className="w-3.5 h-3.5" />
                <span>Protocol Verification</span>
              </div>
              <p className="text-xs text-slate-300 font-mono leading-relaxed">
                {activeOp.highlight}
              </p>
            </div>

            {/* Status Checklist */}
            <div className="space-y-2 pt-2 border-t border-white/5 text-xs text-slate-400 font-mono">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-slate-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  REST API & Webhook Dispatch
                </span>
                <span className="text-emerald-400">Available</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-slate-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  Role-Based Authorization RBAC
                </span>
                <span className="text-emerald-400">Enforced</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-slate-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  Relational DB Normalization
                </span>
                <span className="text-emerald-400">3NF Structured</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
