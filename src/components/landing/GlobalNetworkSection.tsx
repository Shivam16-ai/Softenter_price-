import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Globe2, 
  Truck, 
  Plane, 
  Building2, 
  MapPin, 
  ArrowRight, 
  Activity, 
  Navigation,
  Compass,
  Zap
} from 'lucide-react';

interface CorridorData {
  id: string;
  name: string;
  origin: string;
  destination: string;
  distance: string;
  transitTime: string;
  dailyTonnage: string;
  activeVehicles: number;
  mode: 'Road Freight' | 'Air Cargo' | 'Express Intermodal';
  status: 'OPTIMAL FLOW' | 'PEAK DISPATCH' | 'CLEAR CORRIDOR';
}

export const GlobalNetworkSection: React.FC = () => {
  const [selectedCorridorId, setSelectedCorridorId] = useState<string>('c1');

  const corridors: CorridorData[] = [
    {
      id: 'c1',
      name: 'Southern Tech Arterial',
      origin: 'Hyderabad Central Fulfillment',
      destination: 'Bengaluru Logistics Park',
      distance: '568 km',
      transitTime: '8h 45m',
      dailyTonnage: '1,420 Tons',
      activeVehicles: 34,
      mode: 'Road Freight',
      status: 'OPTIMAL FLOW',
    },
    {
      id: 'c2',
      name: 'Western Maritime Gateway',
      origin: 'Mumbai Jawaharlal Nehru Port',
      destination: 'Pune Industrial Distribution Hub',
      distance: '152 km',
      transitTime: '3h 15m',
      dailyTonnage: '2,890 Tons',
      activeVehicles: 58,
      mode: 'Road Freight',
      status: 'PEAK DISPATCH',
    },
    {
      id: 'c3',
      name: 'Northern Capital Linehaul',
      origin: 'Delhi NCR Mega Sort Hub',
      destination: 'Jaipur Logistics Terminal',
      distance: '276 km',
      transitTime: '4h 50m',
      dailyTonnage: '1,180 Tons',
      activeVehicles: 27,
      mode: 'Road Freight',
      status: 'CLEAR CORRIDOR',
    },
    {
      id: 'c4',
      name: 'Intercontinental Air Express',
      origin: 'Frankfurt Cargo City (FRA)',
      destination: 'Mumbai International Air Hub (BOM)',
      distance: '6,580 km',
      transitTime: '7h 50m',
      dailyTonnage: '420 Tons',
      activeVehicles: 4,
      mode: 'Air Cargo',
      status: 'OPTIMAL FLOW',
    },
  ];

  const activeCorridor = corridors.find((c) => c.id === selectedCorridorId) || corridors[0];

  return (
    <section id="network" className="relative py-28 sm:py-36 bg-[#0f1117] text-white overflow-hidden border-t border-white/10">
      {/* Subtle background ambient mesh */}
      <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:32px_32px]" />

      <div className="max-w-7xl mx-auto px-6 sm:px-8 relative z-10 space-y-20">
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 pb-6 border-b border-white/10">
          <div className="space-y-4 max-w-3xl">
            <div className="inline-flex items-center gap-2.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono">
              <Compass className="w-3.5 h-3.5 text-[#FF5500]" />
              <span className="uppercase tracking-[0.25em] text-slate-300">
                GLOBAL LOGISTICS INFRASTRUCTURE
              </span>
            </div>

            <h2 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold uppercase tracking-tight text-white leading-[0.95]">
              BUILT FOR MOVEMENT{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF5500] via-amber-400 to-orange-200">
                AT SCALE.
              </span>
            </h2>

            <p className="text-base sm:text-lg text-slate-300 font-light leading-relaxed max-w-2xl">
              142 high-bay distribution hubs, 48 active continental corridors, and thousands of commercial linehaul vehicles operating across uninterrupted highway networks.
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Real-Time Telematics
            </span>
            <span>·</span>
            <span>Sub-second GPS Mesh</span>
          </div>
        </div>

        {/* Live Operational Statistics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="p-6 sm:p-8 rounded-2xl bg-[#14161f] border border-white/10 space-y-2 group hover:border-[#FF5500]/50 transition-colors"
          >
            <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-slate-400 block">
              TOTAL CONSIGNMENTS
            </span>
            <div className="text-4xl sm:text-5xl font-black tracking-tight text-white font-mono flex items-baseline gap-1">
              <span>2.4M</span>
              <span className="text-[#FF5500] text-3xl">+</span>
            </div>
            <p className="text-xs text-slate-400 leading-snug pt-1">
              Parcels and freight pallets processed across our network every month.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="p-6 sm:p-8 rounded-2xl bg-[#14161f] border border-white/10 space-y-2 group hover:border-amber-500/50 transition-colors"
          >
            <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-slate-400 block">
              LOGISTICS NODES
            </span>
            <div className="text-4xl sm:text-5xl font-black tracking-tight text-white font-mono flex items-baseline gap-1">
              <span>142</span>
              <span className="text-amber-400 text-2xl font-bold">HUBS</span>
            </div>
            <p className="text-xs text-slate-400 leading-snug pt-1">
              Automated sort facilities, cross-dock terminals, and fulfillment depots.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="p-6 sm:p-8 rounded-2xl bg-[#14161f] border border-white/10 space-y-2 group hover:border-emerald-500/50 transition-colors"
          >
            <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-slate-400 block">
              SLA RELIABILITY
            </span>
            <div className="text-4xl sm:text-5xl font-black tracking-tight text-emerald-400 font-mono flex items-baseline gap-1">
              <span>99.8%</span>
            </div>
            <p className="text-xs text-slate-400 leading-snug pt-1">
              Verified on-time performance measured against contractual delivery windows.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="p-6 sm:p-8 rounded-2xl bg-[#14161f] border border-white/10 space-y-2 group hover:border-sky-500/50 transition-colors"
          >
            <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-slate-400 block">
              CONTINENTAL ARTERIES
            </span>
            <div className="text-4xl sm:text-5xl font-black tracking-tight text-white font-mono flex items-baseline gap-1">
              <span>48</span>
              <span className="text-sky-400 text-2xl font-bold">LANES</span>
            </div>
            <p className="text-xs text-slate-400 leading-snug pt-1">
              Dedicated high-frequency linehaul trunk routes with sub-minute tracking.
            </p>
          </motion.div>
        </div>

        {/* Sophisticated Editorial Corridor Map & Telemetry Dashboard */}
        <div className="rounded-3xl bg-[#13151e] border border-white/10 p-6 sm:p-10 space-y-8 shadow-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
            <div>
              <span className="text-xs font-mono uppercase tracking-[0.2em] text-[#FF5500] font-bold block">
                ACTIVE FREIGHT ARTERIES
              </span>
              <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Live High-Capacity Linehaul Corridors
              </h3>
            </div>

            {/* Corridor Tabs */}
            <div className="flex flex-wrap items-center gap-2 p-1 rounded-xl bg-black/50 border border-white/10">
              {corridors.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedCorridorId(c.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono uppercase transition-all cursor-pointer ${
                    c.id === selectedCorridorId
                      ? 'bg-[#FF5500] text-white font-bold shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {c.name.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Network Map Visualization */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Visual Vector Map Canvas */}
            <div className="lg:col-span-8 relative aspect-[16/9] w-full rounded-2xl bg-[#090b10] border border-white/10 overflow-hidden flex items-center justify-center p-6">
              {/* Background Map Contours */}
              <svg className="w-full h-full opacity-60" viewBox="0 0 800 450">
                {/* Lat/Long Grid Lines */}
                <line x1="0" y1="150" x2="800" y2="150" stroke="#ffffff" strokeWidth="0.5" strokeDasharray="4,4" opacity="0.1" />
                <line x1="0" y1="300" x2="800" y2="300" stroke="#ffffff" strokeWidth="0.5" strokeDasharray="4,4" opacity="0.1" />
                <line x1="200" y1="0" x2="200" y2="450" stroke="#ffffff" strokeWidth="0.5" strokeDasharray="4,4" opacity="0.1" />
                <line x1="400" y1="0" x2="400" y2="450" stroke="#ffffff" strokeWidth="0.5" strokeDasharray="4,4" opacity="0.1" />
                <line x1="600" y1="0" x2="600" y2="450" stroke="#ffffff" strokeWidth="0.5" strokeDasharray="4,4" opacity="0.1" />

                {/* Major Interstate Highway Corridors */}
                {/* Route 1: Hyderabad -> Bengaluru */}
                <path
                  d="M 460 220 Q 440 280 430 350"
                  fill="none"
                  stroke={selectedCorridorId === 'c1' ? '#FF5500' : '#334155'}
                  strokeWidth={selectedCorridorId === 'c1' ? '4' : '2'}
                  strokeDasharray={selectedCorridorId === 'c1' ? '8,4' : 'none'}
                  className={selectedCorridorId === 'c1' ? 'animate-[dash_20s_linear_infinite]' : ''}
                />

                {/* Route 2: Mumbai -> Pune */}
                <path
                  d="M 330 240 Q 350 260 370 270"
                  fill="none"
                  stroke={selectedCorridorId === 'c2' ? '#FF5500' : '#334155'}
                  strokeWidth={selectedCorridorId === 'c2' ? '4' : '2'}
                />

                {/* Route 3: Delhi -> Jaipur */}
                <path
                  d="M 390 100 Q 370 120 350 145"
                  fill="none"
                  stroke={selectedCorridorId === 'c3' ? '#FF5500' : '#334155'}
                  strokeWidth={selectedCorridorId === 'c3' ? '4' : '2'}
                />

                {/* Route 4: Frankfurt -> Mumbai (Air Curve) */}
                <path
                  d="M 120 60 Q 220 120 330 240"
                  fill="none"
                  stroke={selectedCorridorId === 'c4' ? '#38bdf8' : '#334155'}
                  strokeWidth={selectedCorridorId === 'c4' ? '4' : '2'}
                  strokeDasharray="6,4"
                />

                {/* Inter-Hub Feeder Mesh */}
                <path d="M 390 100 L 460 220" fill="none" stroke="#1e293b" strokeWidth="1.5" />
                <path d="M 330 240 L 460 220" fill="none" stroke="#1e293b" strokeWidth="1.5" />
                <path d="M 370 270 L 430 350" fill="none" stroke="#1e293b" strokeWidth="1.5" />

                {/* Hub Nodes */}
                {/* Delhi */}
                <circle cx="390" cy="100" r="6" fill="#f59e0b" />
                <text x="405" y="104" fill="#94a3b8" fontSize="11" fontFamily="monospace">DELHI NCR MEGA SORT</text>

                {/* Jaipur */}
                <circle cx="350" cy="145" r="4" fill="#94a3b8" />
                <text x="270" y="149" fill="#64748b" fontSize="10" fontFamily="monospace">JAIPUR</text>

                {/* Mumbai */}
                <circle cx="330" cy="240" r="7" fill="#f97316" />
                <text x="210" y="244" fill="#f97316" fontSize="11" fontWeight="bold" fontFamily="monospace">MUMBAI GATEWAY</text>

                {/* Pune */}
                <circle cx="370" cy="270" r="4" fill="#94a3b8" />
                <text x="382" y="274" fill="#64748b" fontSize="10" fontFamily="monospace">PUNE HUB</text>

                {/* Hyderabad */}
                <circle cx="460" cy="220" r="7" fill="#FF5500" />
                <text x="475" y="224" fill="#FF5500" fontSize="11" fontWeight="bold" fontFamily="monospace">HYDERABAD CENTRAL</text>

                {/* Bengaluru */}
                <circle cx="430" cy="350" r="7" fill="#38bdf8" />
                <text x="445" y="354" fill="#38bdf8" fontSize="11" fontWeight="bold" fontFamily="monospace">BENGALURU TECH HUB</text>

                {/* Frankfurt */}
                <circle cx="120" cy="60" r="5" fill="#38bdf8" />
                <text x="135" y="64" fill="#38bdf8" fontSize="10" fontFamily="monospace">FRANKFURT (FRA)</text>

                {/* Moving Carrier Indicator along selected active route */}
                {selectedCorridorId === 'c1' && (
                  <g className="animate-pulse">
                    <circle cx="445" cy="285" r="8" fill="#FF5500" opacity="0.4" />
                    <circle cx="445" cy="285" r="4" fill="#ffffff" />
                  </g>
                )}
                {selectedCorridorId === 'c2' && (
                  <g className="animate-pulse">
                    <circle cx="350" cy="255" r="8" fill="#FF5500" opacity="0.4" />
                    <circle cx="350" cy="255" r="4" fill="#ffffff" />
                  </g>
                )}
              </svg>

              {/* Bottom Map Legend */}
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-[10px] font-mono text-slate-400 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1.5 text-white">
                    <span className="w-2 h-2 rounded-full bg-[#FF5500]" />
                    Central High-Bay Hub
                  </span>
                  <span className="flex items-center gap-1.5 text-white">
                    <span className="w-2 h-2 rounded-full bg-sky-400" />
                    Air Freight Terminal
                  </span>
                  <span className="flex items-center gap-1.5 text-white">
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    Cross-Dock Depot
                  </span>
                </div>
                <span>PROJECTION: MERCATOR CORRIDOR MESH</span>
              </div>
            </div>

            {/* Selected Corridor Operational Card */}
            <div className="lg:col-span-4 p-6 sm:p-7 rounded-2xl bg-black/60 border border-white/10 space-y-5">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded bg-[#FF5500]/20 text-[#FF5500] font-mono text-[11px] font-bold uppercase">
                  {activeCorridor.status}
                </span>
                <span className="text-xs font-mono text-slate-400">{activeCorridor.mode}</span>
              </div>

              <div>
                <h4 className="text-xl font-bold text-white">{activeCorridor.name}</h4>
                <div className="mt-2 space-y-1 text-xs font-mono text-slate-300">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-[#FF5500]" />
                    <span>Origin: {activeCorridor.origin}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Navigation className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Destination: {activeCorridor.destination}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-white/10 text-xs font-mono">
                <div className="p-3 rounded-xl bg-white/5">
                  <span className="text-slate-400 block text-[10px] uppercase">LANE DISTANCE</span>
                  <span className="text-white text-base font-bold">{activeCorridor.distance}</span>
                </div>
                <div className="p-3 rounded-xl bg-white/5">
                  <span className="text-slate-400 block text-[10px] uppercase">AVG TRANSIT</span>
                  <span className="text-amber-400 text-base font-bold">{activeCorridor.transitTime}</span>
                </div>
                <div className="p-3 rounded-xl bg-white/5">
                  <span className="text-slate-400 block text-[10px] uppercase">DAILY CAPACITY</span>
                  <span className="text-white text-base font-bold">{activeCorridor.dailyTonnage}</span>
                </div>
                <div className="p-3 rounded-xl bg-white/5">
                  <span className="text-slate-400 block text-[10px] uppercase">ACTIVE FLEET</span>
                  <span className="text-emerald-400 text-base font-bold">{activeCorridor.activeVehicles} Trucks</span>
                </div>
              </div>

              <div className="pt-2">
                <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/20 text-[11px] font-mono text-emerald-300 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Sub-minute automated cross-dock scans active on this lane.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
