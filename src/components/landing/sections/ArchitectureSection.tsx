import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  User, 
  Package, 
  Cpu, 
  Truck, 
  Building2, 
  FileCheck2, 
  Receipt, 
  Coins,
  ArrowDown
} from 'lucide-react';

interface ArchNode {
  id: string;
  step: string;
  title: string;
  sub: string;
  table: string;
  detail: string;
  icon: React.ElementType;
}

const ARCH_NODES: ArchNode[] = [
  {
    id: 'customer',
    step: '01',
    title: 'CUSTOMER',
    sub: 'Enterprise Shipper & Consignor',
    table: 'users (role: customer)',
    detail: 'Authenticated portal generating digitally signed shipping manifests and commercial requests.',
    icon: User,
  },
  {
    id: 'parcel',
    step: '02',
    title: 'PARCEL',
    sub: 'Physical Consignment Record',
    table: 'parcels',
    detail: 'Stores certified weight, dimensions, pickup/drop coordinates, and encrypted QR tracking token.',
    icon: Package,
  },
  {
    id: 'route_engine',
    step: '03',
    title: 'ROUTE ENGINE',
    sub: 'Dynamic Path Optimization',
    table: 'routes & corridor_nodes',
    detail: 'Computes optimal inter-hub highway trajectory minimizing toll expense, transit time, and emissions.',
    icon: Cpu,
  },
  {
    id: 'fleet',
    step: '04',
    title: 'FLEET',
    sub: 'Linehaul & Van Transport',
    table: 'vehicles & users (role: agent)',
    detail: 'Active vehicle allocation matched by volumetric capacity, driver duty hours, and telematics health.',
    icon: Truck,
  },
  {
    id: 'hub',
    step: '05',
    title: 'HUB',
    sub: 'Automated Cross-Dock Sortation',
    table: 'parcel_tracking (status: hub)',
    detail: 'High-speed optical barcode scanners sort 48,000 units/hour into designated outbound bay lanes.',
    icon: Building2,
  },
  {
    id: 'delivery',
    step: '06',
    title: 'DELIVERY',
    sub: 'Certified Proof of Delivery',
    table: 'delivery_proofs',
    detail: 'Captures stylus signature, recipient identity badge, GPS coordinates, and timestamped delivery photo.',
    icon: FileCheck2,
  },
  {
    id: 'invoice',
    step: '07',
    title: 'INVOICE',
    sub: 'Automated Commercial Tariffs',
    table: 'payments & invoices',
    detail: 'Calculates base rate per kg, fuel surcharges, priority express fees, and applicable sales taxes.',
    icon: Receipt,
  },
  {
    id: 'settlement',
    step: '08',
    title: 'SETTLEMENT',
    sub: 'Carrier Payout & Ledger Close',
    table: 'activity_logs & settlement_ledger',
    detail: 'Final financial clearing releasing funds to contracted carriers with immutable audit logs.',
    icon: Coins,
  },
];

export const ArchitectureSection: React.FC = () => {
  const [activeNode, setActiveNode] = useState<string>('parcel');

  const selected = ARCH_NODES.find((n) => n.id === activeNode) || ARCH_NODES[1];

  return (
    <section id="architecture" className="relative py-28 px-4 sm:px-6 lg:px-8 bg-[#070b16] text-white border-t border-white/5 overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/3 left-1/3 w-[600px] h-[400px] bg-sky-600/10 blur-[150px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Editorial Section Header */}
        <div className="max-w-3xl mb-16">
          <span className="text-xs font-mono uppercase tracking-[0.25em] text-sky-400 block mb-3">
            SYSTEM BLUEPRINT · END-TO-END FLOW
          </span>
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-white leading-tight">
            Enterprise Architecture.{' '}
            <span className="font-serif italic font-normal text-transparent bg-clip-text bg-gradient-to-r from-sky-200 to-white">
              Deterministic flow.
            </span>
          </h2>
          <p className="mt-4 text-sm sm:text-base text-slate-400 font-light">
            An uninterrupted pipeline where every physical event triggers immediate state transitions across database tables, telemetry hubs, and financial ledgers.
          </p>
        </div>

        {/* Horizontal / Multi-Row Flow Diagram */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 relative">
          {ARCH_NODES.map((node, index) => {
            const Icon = node.icon;
            const isSelected = node.id === activeNode;
            return (
              <div
                key={node.id}
                onClick={() => setActiveNode(node.id)}
                className={`p-4 rounded-2xl border transition-all duration-300 cursor-pointer flex flex-col justify-between relative group ${
                  isSelected
                    ? 'bg-slate-900 border-sky-500/50 shadow-[0_0_20px_rgba(56,189,248,0.2)]'
                    : 'bg-slate-950/60 border-white/5 hover:border-white/20 hover:bg-slate-900/60'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between text-xs font-mono mb-2">
                    <span className="text-slate-500 font-bold">{node.step}</span>
                    <Icon className={`w-4 h-4 ${isSelected ? 'text-sky-400' : 'text-slate-500'}`} />
                  </div>
                  <h4 className="font-bold text-xs tracking-tight text-white uppercase mt-1">
                    {node.title}
                  </h4>
                  <span className="text-[10px] text-slate-400 line-clamp-2 mt-1 font-light leading-snug">
                    {node.sub}
                  </span>
                </div>

                <div className="mt-4 pt-2 border-t border-white/5 font-mono text-[9px] text-sky-400/80 truncate">
                  {node.table.split(' ')[0]}
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Architecture Node Detail Banner */}
        <div className="mt-8 p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-white/10 backdrop-blur-xl shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono font-bold text-sky-400 px-2.5 py-0.5 rounded bg-sky-500/10 border border-sky-500/20">
                PIPELINE NODE {selected.step}
              </span>
              <span className="text-xs font-mono text-slate-400">
                Primary Database Target: <code className="text-white font-semibold">{selected.table}</code>
              </span>
            </div>
            <h3 className="text-xl font-bold text-white tracking-tight">
              {selected.title} — {selected.sub}
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 font-light leading-relaxed">
              {selected.detail}
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono shrink-0">
            <div className="bg-slate-950 p-4 rounded-2xl border border-white/5 text-center">
              <span className="text-slate-500 text-[10px] uppercase block">Event Latency</span>
              <span className="text-white font-bold text-sm block mt-0.5">&lt; 12ms</span>
            </div>
            <div className="bg-slate-950 p-4 rounded-2xl border border-white/5 text-center">
              <span className="text-slate-500 text-[10px] uppercase block">Audit Hash</span>
              <span className="text-emerald-400 font-bold text-sm block mt-0.5">Verified</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
