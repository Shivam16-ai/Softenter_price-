import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Navigation2, Truck, ShieldCheck, MapPin, Gauge, Radio, Clock, User } from 'lucide-react';

interface RouteCorridor {
  id: string;
  name: string;
  from: string;
  to: string;
  vehicle: string;
  shipment: string;
  driver: string;
  speed: string;
  eta: string;
  status: 'In Transit' | 'Final Mile' | 'Scheduled';
  pathD: string;
  startPoint: { x: number; y: number };
  endPoint: { x: number; y: number };
  cargo: string;
}

const CORRIDORS: RouteCorridor[] = [
  {
    id: 'corridor_a',
    name: 'South Expressway Corridor',
    from: 'Hyderabad Hub',
    to: 'Bengaluru Tech Terminal',
    vehicle: 'SR-TRK-204 · Scania High-Cube Electric',
    shipment: 'SR-2026-HYD492 (184 Consignments)',
    driver: 'Rajesh Kumar (Senior Carrier Captain)',
    speed: '78 km/h',
    eta: 'Today — 18:40',
    status: 'In Transit',
    pathD: 'M 490 340 Q 470 410 450 490',
    startPoint: { x: 490, y: 340 },
    endPoint: { x: 450, y: 490 },
    cargo: 'High-Value Aerospace Optics & Semiconductor Wafers',
  },
  {
    id: 'corridor_b',
    name: 'Western Commercial Gateway',
    from: 'Mumbai Cargo Gateway',
    to: 'Pune Distribution Hub',
    vehicle: 'SR-TRK-118 · Volvo FM Aerodynamic 6x2',
    shipment: 'SR-2026-MUM108 (310 Consignments)',
    driver: 'Vikram Singh (Fleet Ops Level 3)',
    speed: '64 km/h',
    eta: 'Today — 14:15',
    status: 'In Transit',
    pathD: 'M 350 350 Q 375 365 400 380',
    startPoint: { x: 350, y: 350 },
    endPoint: { x: 400, y: 380 },
    cargo: 'Pharmaceutical Vaccines (Active Cold-Chain 4°C)',
  },
  {
    id: 'corridor_c',
    name: 'Northern Inter-State Freight Run',
    from: 'Delhi NCR Central Gateway',
    to: 'Jaipur Logistics Terminal',
    vehicle: 'SR-TRK-089 · Mercedes-Benz eActros LongHaul',
    shipment: 'SR-2026-DEL841 (92 Heavy Freight Pallets)',
    driver: 'Amit Patel (Automated Fleet Pilot)',
    speed: '72 km/h',
    eta: 'Today — 21:30',
    status: 'In Transit',
    pathD: 'M 420 180 Q 380 200 350 220',
    startPoint: { x: 420, y: 180 },
    endPoint: { x: 350, y: 220 },
    cargo: 'Automotive Precision Engine Sub-assemblies',
  },
];

const HUBS = [
  { id: 'del', name: 'Delhi NCR Central Hub', code: 'HUB-DEL-01', x: 420, y: 180, activeUnits: 84 },
  { id: 'jai', name: 'Jaipur Logistics Terminal', code: 'HUB-JAI-02', x: 350, y: 220, activeUnits: 38 },
  { id: 'bom', name: 'Mumbai Cargo Gateway', code: 'HUB-BOM-03', x: 350, y: 350, activeUnits: 142 },
  { id: 'pnq', name: 'Pune Distribution Facility', code: 'HUB-PNQ-04', x: 400, y: 380, activeUnits: 56 },
  { id: 'hyd', name: 'Hyderabad Central Logistics', code: 'HUB-HYD-05', x: 490, y: 340, activeUnits: 110 },
  { id: 'blr', name: 'Bengaluru Tech Terminal', code: 'HUB-BLR-06', x: 450, y: 490, activeUnits: 128 },
  { id: 'maa', name: 'Chennai Deepwater Terminal', code: 'HUB-MAA-07', x: 530, y: 480, activeUnits: 64 },
  { id: 'ccu', name: 'Kolkata Gateway Complex', code: 'HUB-CCU-08', x: 670, y: 280, activeUnits: 72 },
];

export const LogisticsMap: React.FC = () => {
  const [selectedCorridor, setSelectedCorridor] = useState<RouteCorridor>(CORRIDORS[0]);
  const [vehicleProgress, setVehicleProgress] = useState(0.45);

  // Subtle vehicle travel animation on the corridor
  useEffect(() => {
    const interval = setInterval(() => {
      setVehicleProgress((prev) => (prev >= 0.95 ? 0.05 : prev + 0.02));
    }, 250);
    return () => clearInterval(interval);
  }, []);

  return (
    <section id="operations" className="relative py-28 px-4 sm:px-6 lg:px-8 bg-[#050811] text-white overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute top-1/3 right-1/4 w-[600px] h-[600px] bg-sky-600/10 blur-[150px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Editorial Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="max-w-2xl">
            <span className="text-xs font-mono uppercase tracking-[0.25em] text-sky-400 block mb-3">
              LIVE CARRIER MESH · GPS TELEMETRY
            </span>
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-white leading-tight">
              Live Logistics World.{' '}
              <span className="font-serif italic font-normal text-transparent bg-clip-text bg-gradient-to-r from-sky-200 to-white">
                Every node illuminated.
              </span>
            </h2>
            <p className="mt-4 text-sm sm:text-base text-slate-400 font-light">
              Autonomous corridors orchestrating inter-city linehaul, distribution hubs, and last-mile electric carriers without human latency.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-xs font-mono text-slate-300">
              Active Corridors: 3 Live Telemetry Feeds
            </span>
          </div>
        </div>

        {/* Map & Telemetry HUD Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Custom Dark Regional Logistics Map (8 cols) */}
          <div className="lg:col-span-8 bg-slate-950/80 rounded-3xl p-4 sm:p-8 border border-white/10 shadow-2xl relative overflow-hidden backdrop-blur-md">
            {/* Grid overlay */}
            <div className="absolute inset-0 opacity-[0.05] bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:20px_20px]" />

            {/* Custom Dark Map Canvas / SVG */}
            <div className="relative aspect-[4/3] w-full max-h-[540px]">
              <svg
                viewBox="200 120 540 440"
                className="w-full h-full select-none"
                style={{ filter: 'drop-shadow(0 0 10px rgba(0,0,0,0.5))' }}
              >
                {/* Secondary Background Route Mesh Lines */}
                <path d="M 420 180 L 670 280" stroke="#1e293b" strokeWidth="1" strokeDasharray="3 3" />
                <path d="M 670 280 L 530 480" stroke="#1e293b" strokeWidth="1" strokeDasharray="3 3" />
                <path d="M 350 350 L 490 340" stroke="#1e293b" strokeWidth="1" strokeDasharray="3 3" />
                <path d="M 490 340 L 530 480" stroke="#1e293b" strokeWidth="1" strokeDasharray="3 3" />
                <path d="M 450 490 L 530 480" stroke="#1e293b" strokeWidth="1" strokeDasharray="3 3" />

                {/* Primary Active Corridors */}
                {CORRIDORS.map((corridor) => {
                  const isSelected = corridor.id === selectedCorridor.id;
                  return (
                    <g
                      key={corridor.id}
                      onClick={() => setSelectedCorridor(corridor)}
                      className="cursor-pointer group"
                    >
                      {/* Outer Glow Line */}
                      <path
                        d={corridor.pathD}
                        fill="none"
                        stroke={isSelected ? '#38bdf8' : '#0284c7'}
                        strokeWidth={isSelected ? 6 : 3}
                        strokeOpacity={isSelected ? 0.3 : 0.15}
                        className="transition-all duration-300"
                      />
                      {/* Core Glowing Corridor Path */}
                      <path
                        d={corridor.pathD}
                        fill="none"
                        stroke={isSelected ? '#38bdf8' : '#334155'}
                        strokeWidth={isSelected ? 2.5 : 1.5}
                        strokeDasharray={isSelected ? '6 4' : '4 4'}
                        className={isSelected ? 'animate-pulse' : ''}
                      />

                      {/* Animated Vehicle Node Marker along corridor */}
                      {isSelected && (
                        <circle
                          cx={corridor.startPoint.x + (corridor.endPoint.x - corridor.startPoint.x) * vehicleProgress}
                          cy={corridor.startPoint.y + (corridor.endPoint.y - corridor.startPoint.y) * vehicleProgress}
                          r="5"
                          fill="#38bdf8"
                          className="shadow-[0_0_12px_#38bdf8]"
                        >
                          <animate attributeName="r" values="4;7;4" dur="1.5s" repeatCount="indefinite" />
                        </circle>
                      )}
                    </g>
                  );
                })}

                {/* Regional Distribution Hub Nodes */}
                {HUBS.map((hub) => (
                  <g key={hub.id} className="group cursor-pointer">
                    <circle cx={hub.x} cy={hub.y} r="8" fill="#090d16" stroke="#38bdf8" strokeWidth="1.5" />
                    <circle cx={hub.x} cy={hub.y} r="3" fill="#38bdf8" />
                    <text
                      x={hub.x + 12}
                      y={hub.y + 4}
                      fill="#e2e8f0"
                      fontSize="9"
                      fontFamily="Manrope, sans-serif"
                      fontWeight="700"
                      letterSpacing="0.5"
                    >
                      {hub.name}
                    </text>
                    <text
                      x={hub.x + 12}
                      y={hub.y + 14}
                      fill="#64748b"
                      fontSize="7"
                      fontFamily="JetBrains Mono, monospace"
                    >
                      {hub.code} · {hub.activeUnits} Units
                    </text>
                  </g>
                ))}
              </svg>
            </div>

            {/* Bottom Quick-Switch Corridor Selector */}
            <div className="mt-4 pt-4 border-t border-white/5 flex flex-wrap gap-2">
              {CORRIDORS.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedCorridor(c)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all cursor-pointer ${
                    selectedCorridor.id === c.id
                      ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 shadow-[0_0_12px_rgba(56,189,248,0.2)]'
                      : 'bg-white/5 text-slate-400 hover:text-white border border-white/5 hover:border-white/10'
                  }`}
                >
                  {c.from.split(' ')[0]} ➔ {c.to.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>

          {/* Luxury Telemetry HUD Panel (4 cols) */}
          <div className="lg:col-span-4 bg-slate-900/90 rounded-3xl p-6 sm:p-7 border border-white/10 shadow-2xl backdrop-blur-md space-y-6">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 block">
                  ACTIVE CORRIDOR TELEMETRY
                </span>
                <h3 className="font-bold text-base text-white mt-0.5">
                  {selectedCorridor.name}
                </h3>
              </div>
              <span className="px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-mono font-bold uppercase">
                {selectedCorridor.status}
              </span>
            </div>

            {/* Telemetry Metrics */}
            <div className="space-y-4 text-xs font-mono">
              <div className="bg-slate-950/80 p-3.5 rounded-xl border border-white/5 space-y-1">
                <span className="text-slate-400 text-[10px] uppercase block">Assigned Transport Vessel</span>
                <span className="text-white font-bold text-sm block tracking-tight">
                  {selectedCorridor.vehicle}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-950/80 p-3 rounded-xl border border-white/5">
                  <span className="text-slate-400 text-[10px] uppercase block flex items-center gap-1">
                    <Gauge className="w-3 h-3 text-sky-400" />
                    Cruising Velocity
                  </span>
                  <span className="text-white font-bold text-base mt-1 block">
                    {selectedCorridor.speed}
                  </span>
                </div>

                <div className="bg-slate-950/80 p-3 rounded-xl border border-white/5">
                  <span className="text-slate-400 text-[10px] uppercase block flex items-center gap-1">
                    <Clock className="w-3 h-3 text-sky-400" />
                    Target ETA
                  </span>
                  <span className="text-white font-bold text-base mt-1 block">
                    {selectedCorridor.eta.split('—')[1] || selectedCorridor.eta}
                  </span>
                </div>
              </div>

              <div className="bg-slate-950/80 p-3.5 rounded-xl border border-white/5 space-y-1">
                <span className="text-slate-400 text-[10px] uppercase block flex items-center gap-1">
                  <User className="w-3 h-3 text-sky-400" />
                  Fleet Pilot
                </span>
                <span className="text-slate-200 font-semibold block">
                  {selectedCorridor.driver}
                </span>
              </div>

              <div className="bg-slate-950/80 p-3.5 rounded-xl border border-white/5 space-y-1">
                <span className="text-slate-400 text-[10px] uppercase block">Manifest Load</span>
                <span className="text-sky-300 font-semibold block">
                  {selectedCorridor.shipment}
                </span>
                <p className="text-[11px] text-slate-400 font-sans mt-1">
                  {selectedCorridor.cargo}
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-slate-400">
              <span>Security Level:</span>
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                ISO 27001 Certified
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
