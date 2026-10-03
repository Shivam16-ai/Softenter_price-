import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Truck, 
  MapPin, 
  Clock, 
  Gauge, 
  Thermometer, 
  ShieldCheck, 
  Navigation, 
  Activity,
  ArrowRight,
  ChevronRight
} from 'lucide-react';

interface JourneyCheckpoint {
  id: number;
  time: string;
  stageName: string;
  environment: string;
  location: string;
  distanceCovered: string;
  speed: string;
  reeferTemp: string;
  narrative: string;
  image: string;
}

export const TruckJourneySection: React.FC = () => {
  const [currentCheckpointIndex, setCurrentCheckpointIndex] = useState(2);

  const checkpoints: JourneyCheckpoint[] = [
    {
      id: 1,
      time: '04:30 AM',
      stageName: 'Bay Induction & Manifest Lock',
      environment: 'Central Fulfillment Hub',
      location: 'Hyderabad Logistics Park, Dock 42',
      distanceCovered: '0 km',
      speed: '0 km/h (Docked)',
      reeferTemp: '3.8°C',
      narrative: 'High-cube Scania R500 linehaul trailer finishes cross-dock loading. Electronic manifest verified by RFID gate reader.',
      image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80',
    },
    {
      id: 2,
      time: '06:15 AM',
      stageName: 'Expressway Inbound Merge',
      environment: 'Outer Ring Expressway',
      location: 'NH-44 Hyderabad South Interchange',
      distanceCovered: '48 km',
      speed: '65 km/h',
      reeferTemp: '4.0°C',
      narrative: 'Truck merges onto interstate arterial. Automated electronic toll collection (FASTag) passes without stop. Telemetry streams at 1 Hz.',
      image: 'https://images.unsplash.com/photo-1519003722824-194d4455a60c?auto=format&fit=crop&w=1200&q=80',
    },
    {
      id: 3,
      time: '11:40 AM',
      stageName: 'High-Speed Highway Linehaul',
      environment: 'Interstate Trunk Highway',
      location: 'NH-44 Andhra-Karnataka Interstate Border',
      distanceCovered: '320 km',
      speed: '78 km/h',
      reeferTemp: '4.1°C',
      narrative: 'Cruising at optimal fuel economy. Driver Marcus Vance logged 4h compliant drive time. Real-time predictive maintenance logs all systems green.',
      image: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=1200&q=80',
    },
    {
      id: 4,
      time: '04:20 PM',
      stageName: 'Metropolitan Inbound Ring',
      environment: 'Urban Outer Logistics Ring',
      location: 'Bengaluru North Logistics Gateway',
      distanceCovered: '512 km',
      speed: '45 km/h',
      reeferTemp: '4.2°C',
      narrative: 'Dynamic routing algorithms steer linehaul around evening commuter congestion directly into regional cross-dock terminal.',
      image: 'https://images.unsplash.com/photo-1587293852726-70cdb56c2866?auto=format&fit=crop&w=1200&q=80',
    },
    {
      id: 5,
      time: '06:35 PM',
      stageName: 'Final Delivery & Geofenced Handover',
      environment: 'Enterprise Tech Terminal',
      location: 'Electronic City, Bengaluru',
      distanceCovered: '568 km',
      speed: '0 km/h (Arrived)',
      reeferTemp: '4.1°C',
      narrative: 'Delivery agent completes recipient biometric handover. Proof of delivery cryptographic hash generated and billing closed in 120ms.',
      image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=1200&q=80',
    },
  ];

  const currentCp = checkpoints[currentCheckpointIndex];

  return (
    <section id="journey" className="relative py-28 sm:py-36 bg-[#090b10] text-white border-t border-white/10 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 space-y-16">
        {/* Section Header */}
        <div className="space-y-4 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono">
            <Truck className="w-3.5 h-3.5 text-[#FF5500]" />
            <span className="uppercase tracking-[0.25em] text-slate-300">
              DOCUMENTARY FLEET ODYSSEY
            </span>
          </div>

          <h2 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold uppercase tracking-tight text-white leading-[0.95]">
            THE INTERSTATE{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF5500] via-amber-400 to-orange-200">
              LINEHAUL JOURNEY.
            </span>
          </h2>

          <p className="text-base sm:text-lg text-slate-300 font-light leading-relaxed">
            Follow Vehicle <span className="text-white font-mono font-bold">SR-TRK-882</span> from early dawn dispatch at Hyderabad Central across 568 km of highway linehaul to verified sunset handover.
          </p>
        </div>

        {/* Interactive Progress Line Bar */}
        <div className="relative pt-6">
          <div className="h-1 bg-white/10 w-full rounded-full relative">
            <div
              className="h-1 bg-gradient-to-r from-[#FF5500] to-amber-400 rounded-full transition-all duration-700"
              style={{ width: `${(currentCheckpointIndex / (checkpoints.length - 1)) * 100}%` }}
            />
          </div>

          {/* Checkpoint Nodes along line */}
          <div className="flex justify-between -mt-3 relative z-10">
            {checkpoints.map((cp, idx) => (
              <button
                key={cp.id}
                onClick={() => setCurrentCheckpointIndex(idx)}
                className="flex flex-col items-center group cursor-pointer"
              >
                <div
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                    idx === currentCheckpointIndex
                      ? 'bg-[#FF5500] border-white scale-125 shadow-[0_0_15px_rgba(255,85,0,0.8)]'
                      : idx < currentCheckpointIndex
                      ? 'bg-amber-500 border-amber-400'
                      : 'bg-[#14161f] border-white/20 group-hover:border-white/50'
                  }`}
                >
                  <span className="text-[10px] font-mono font-bold text-white">{idx + 1}</span>
                </div>
                <span className="hidden sm:block text-[11px] font-mono mt-2 text-slate-400 group-hover:text-white transition-colors">
                  {cp.time}
                </span>
                <span className="hidden md:block text-[10px] text-slate-500 max-w-[90px] text-center truncate">
                  {cp.environment}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Selected Journey Checkpoint Showcase */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pt-6">
          {/* Left: Cinematic Environment Photo */}
          <div className="lg:col-span-7 relative aspect-[16/10] rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
            <AnimatePresence mode="wait">
              <motion.img
                key={currentCp.image}
                src={currentCp.image}
                alt={currentCp.stageName}
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="absolute inset-0 w-full h-full object-cover filter brightness-[0.88] contrast-[1.08]"
              />
            </AnimatePresence>

            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />

            {/* In-Photo HUD Overlay */}
            <div className="absolute top-5 left-5 right-5 flex items-center justify-between text-xs font-mono">
              <div className="px-3 py-1 rounded bg-black/70 border border-white/15 backdrop-blur-md text-amber-400 font-bold">
                ● LIVE CORRIDOR FOOTAGE
              </div>
              <div className="px-3 py-1 rounded bg-black/70 border border-white/15 backdrop-blur-md text-slate-300">
                CAM 01 · FORWARD TELEMATICS
              </div>
            </div>

            <div className="absolute bottom-5 left-5 right-5 p-4 rounded-2xl bg-black/75 backdrop-blur-md border border-white/15 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase text-slate-400 block">CURRENT ENVIRONMENT</span>
                <span className="text-base font-bold text-white font-mono">{currentCp.environment}</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-mono uppercase text-slate-400 block">CHECKPOINT TIME</span>
                <span className="text-base font-bold text-[#FF5500] font-mono">{currentCp.time}</span>
              </div>
            </div>
          </div>

          {/* Right: Telematics & Narrative */}
          <div className="lg:col-span-5 p-8 rounded-3xl bg-[#13151f] border border-white/10 space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <span className="text-xs font-mono uppercase tracking-[0.2em] text-[#FF5500] font-bold block">
                  TRUCK SR-TRK-882 · LINEHAUL
                </span>
                <h3 className="text-2xl font-extrabold text-white mt-1">{currentCp.stageName}</h3>
              </div>
              <span className="px-2.5 py-1 rounded bg-white/5 border border-white/10 text-xs font-mono text-emerald-400">
                ACTIVE
              </span>
            </div>

            <div className="space-y-1 text-xs font-mono text-slate-300">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#FF5500] shrink-0" />
                <span>Location: {currentCp.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <Navigation className="w-4 h-4 text-sky-400 shrink-0" />
                <span>Odometer: {currentCp.distanceCovered} / 568 km</span>
              </div>
            </div>

            <p className="text-sm text-slate-300 font-light leading-relaxed">
              {currentCp.narrative}
            </p>

            {/* Vehicle Telemetry Grid */}
            <div className="grid grid-cols-2 gap-3 pt-2 text-xs font-mono">
              <div className="p-3.5 rounded-xl bg-black/50 border border-white/5 space-y-1">
                <div className="flex items-center gap-1.5 text-slate-400 text-[10px] uppercase">
                  <Gauge className="w-3.5 h-3.5 text-amber-400" />
                  <span>Velocity</span>
                </div>
                <span className="text-lg font-bold text-white block">{currentCp.speed}</span>
              </div>

              <div className="p-3.5 rounded-xl bg-black/50 border border-white/5 space-y-1">
                <div className="flex items-center gap-1.5 text-slate-400 text-[10px] uppercase">
                  <Thermometer className="w-3.5 h-3.5 text-sky-400" />
                  <span>Reefer Cargo Temp</span>
                </div>
                <span className="text-lg font-bold text-sky-300 block">{currentCp.reeferTemp}</span>
              </div>
            </div>

            {/* Checkpoint Stepper Controls */}
            <div className="flex items-center justify-between pt-2 border-t border-white/10">
              <button
                disabled={currentCheckpointIndex === 0}
                onClick={() => setCurrentCheckpointIndex((prev) => Math.max(0, prev - 1))}
                className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 text-xs font-mono text-slate-300 cursor-pointer"
              >
                ← Prev Point
              </button>
              <div className="text-xs font-mono text-slate-500">
                Point {currentCheckpointIndex + 1} of {checkpoints.length}
              </div>
              <button
                disabled={currentCheckpointIndex === checkpoints.length - 1}
                onClick={() => setCurrentCheckpointIndex((prev) => Math.min(checkpoints.length - 1, prev + 1))}
                className="px-3.5 py-1.5 rounded-lg bg-[#FF5500] hover:bg-orange-500 disabled:opacity-30 text-xs font-mono font-bold text-white cursor-pointer"
              >
                Next Point →
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
