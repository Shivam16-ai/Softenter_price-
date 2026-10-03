import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Gauge, BatteryCharging, Clock, Thermometer, ShieldCheck } from 'lucide-react';

export const FleetShowcase: React.FC = () => {
  const [speed, setSpeed] = useState(72);
  const [batteryTemp, setBatteryTemp] = useState(32.1);
  const [distance, setDistance] = useState(124);

  // Subtle live telemetry fluctuations
  useEffect(() => {
    const timer = setInterval(() => {
      setSpeed(71 + Math.floor(Math.random() * 3));
      setBatteryTemp(+(31.9 + Math.random() * 0.4).toFixed(1));
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative py-32 px-4 sm:px-6 lg:px-8 bg-[#04060d] text-white overflow-hidden border-t border-b border-white/5">
      {/* Background cinematic lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[350px] bg-gradient-to-r from-blue-700/10 via-sky-500/10 to-transparent blur-[160px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Luxury Automotive Header */}
        <div className="max-w-3xl mb-16">
          <span className="text-xs font-mono uppercase tracking-[0.25em] text-sky-400 block mb-3">
            FLEET ARCHITECTURE · HEAVY FREIGHT
          </span>
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-white leading-tight">
            Engineered for endurance.{' '}
            <span className="font-serif italic font-normal text-transparent bg-clip-text bg-gradient-to-r from-sky-200 to-white">
              Zero compromises.
            </span>
          </h2>
          <p className="mt-4 text-sm sm:text-base text-slate-400 font-light">
            Next-generation long-haul transport vessels combining aerodynamic carbon composite chassis with active CAN-bus diagnostic telemetry.
          </p>
        </div>

        {/* Large Cinematic Truck Stage */}
        <div className="relative w-full aspect-[21/9] min-h-[320px] max-h-[500px] rounded-3xl bg-slate-950/80 border border-white/10 overflow-hidden flex items-center justify-center p-6 shadow-2xl backdrop-blur-md">
          {/* Animated Highway Horizon Perspective */}
          <div className="absolute inset-0 pointer-events-none opacity-20">
            <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 1000 400">
              <line x1="500" y1="200" x2="0" y2="400" stroke="#38bdf8" strokeWidth="1" strokeDasharray="10 15" />
              <line x1="500" y1="200" x2="1000" y2="400" stroke="#38bdf8" strokeWidth="1" strokeDasharray="10 15" />
              <line x1="500" y1="200" x2="500" y2="400" stroke="#ffffff" strokeWidth="1.5" strokeDasharray="20 20" />
            </svg>
          </div>

          {/* Luxury Electric Freight Truck Side Profile Illustration */}
          <div className="relative z-10 w-full max-w-4xl transform transition-transform duration-1000 hover:scale-[1.02]">
            <svg viewBox="0 0 900 320" className="w-full h-auto drop-shadow-[0_20px_50px_rgba(2,132,199,0.3)]">
              {/* Road Ground Reflection */}
              <ellipse cx="450" cy="275" rx="380" ry="16" fill="#0284c7" opacity="0.25" filter="blur(18px)" />
              
              {/* Cargo Container Body */}
              <rect x="120" y="50" width="480" height="180" rx="14" fill="#090d16" stroke="#334155" strokeWidth="2.5" />
              <line x1="120" y1="140" x2="600" y2="140" stroke="#38bdf8" strokeWidth="2" opacity="0.75" />
              <text x="210" y="125" fill="#f8fafc" fontSize="22" fontFamily="Manrope, sans-serif" fontWeight="800" letterSpacing="8">
                SWIFTROUTE
              </text>
              <text x="250" y="168" fill="#94a3b8" fontSize="12" fontFamily="JetBrains Mono, monospace" letterSpacing="4">
                HIGH-CUBE ELECTRIC FREIGHT
              </text>

              {/* Aerodynamic Cabin */}
              <path d="M600 80 L710 90 L790 155 L795 230 L600 230 Z" fill="#050811" stroke="#38bdf8" strokeWidth="2" />
              {/* Futuristic Panoramic Windshield */}
              <path d="M680 95 L765 155 L710 155 L630 105 Z" fill="#0284c7" fillOpacity="0.35" stroke="#7dd3fc" strokeWidth="1.5" />
              {/* Signature Cyan LED Front Lightbar */}
              <line x1="785" y1="160" x2="795" y2="210" stroke="#38bdf8" strokeWidth="4" strokeLinecap="round" />
              <polygon points="795,190 890,140 890,240 795,210" fill="url(#beamGlow)" opacity="0.65" />

              {/* Heavy Alloy Wheels */}
              {[190, 275, 480, 565, 715].map((cx, i) => (
                <g key={i}>
                  <circle cx={cx} cy="235" r="32" fill="#090d16" stroke="#475569" strokeWidth="7" />
                  <circle cx={cx} cy="235" r="16" fill="#1e293b" stroke="#38bdf8" strokeWidth="2" />
                </g>
              ))}

              <defs>
                <linearGradient id="beamGlow" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          {/* Floating Subtle Telemetry HUD Bar */}
          <div className="absolute bottom-6 left-6 right-6 z-20 flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/80 border border-white/10 backdrop-blur-md font-mono text-xs">
            <div className="flex items-center gap-2">
              <Gauge className="w-4 h-4 text-sky-400" />
              <span className="text-slate-400">Velocity:</span>
              <span className="font-bold text-white tracking-wider">{speed} km/h</span>
            </div>

            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-sky-400" />
              <span className="text-slate-400">Range Remaining:</span>
              <span className="font-bold text-white tracking-wider">{distance} km</span>
            </div>

            <div className="flex items-center gap-2">
              <BatteryCharging className="w-4 h-4 text-emerald-400" />
              <span className="text-slate-400">Target ETA:</span>
              <span className="font-bold text-sky-300 tracking-wider">Today — 18:40</span>
            </div>

            <div className="flex items-center gap-2">
              <Thermometer className="w-4 h-4 text-amber-400" />
              <span className="text-slate-400">Battery Thermal:</span>
              <span className="font-bold text-white tracking-wider">{batteryTemp}°C</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
