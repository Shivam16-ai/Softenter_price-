import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Search, Package, ShieldCheck } from 'lucide-react';

interface FinalCTAProps {
  onEnterPlatform: () => void;
  onTrackShipment: () => void;
}

export const FinalCTA: React.FC<FinalCTAProps> = ({ onEnterPlatform, onTrackShipment }) => {
  return (
    <section className="relative py-36 px-4 sm:px-6 lg:px-8 bg-[#04060c] text-white overflow-hidden text-center">
      {/* Background Receding Perspective Highway Lines & Taillights */}
      <div className="absolute inset-0 pointer-events-none opacity-25">
        <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 1200 600">
          {/* Receding road lines toward center vanishing point (600, 240) */}
          <line x1="600" y1="240" x2="100" y2="600" stroke="#38bdf8" strokeWidth="1.5" strokeOpacity="0.4" />
          <line x1="600" y1="240" x2="1100" y2="600" stroke="#38bdf8" strokeWidth="1.5" strokeOpacity="0.4" />
          <line x1="600" y1="240" x2="600" y2="600" stroke="#ffffff" strokeWidth="2" strokeDasharray="16 16" strokeOpacity="0.6" />
          {/* Fading twin red LED taillights disappearing into distance */}
          <circle cx="594" cy="245" r="2.5" fill="#f43f5e" className="shadow-[0_0_8px_#f43f5e]" />
          <circle cx="606" cy="245" r="2.5" fill="#f43f5e" className="shadow-[0_0_8px_#f43f5e]" />
        </svg>
      </div>

      {/* Atmospheric center spotlight */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-gradient-to-t from-blue-600/15 via-sky-500/5 to-transparent blur-[140px] rounded-full pointer-events-none" />

      <div className="max-w-4xl mx-auto relative z-10 space-y-8">
        {/* Subtle Brand Insignia */}
        <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-slate-300 text-xs font-mono uppercase tracking-widest backdrop-blur-md">
          <Package className="w-3.5 h-3.5 text-sky-400" />
          <span>SwiftRoute Global OS</span>
        </div>

        {/* Master Closing Headline */}
        <h2 className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-white leading-tight">
          Logistics, without the{' '}
          <span className="font-serif italic font-normal text-transparent bg-clip-text bg-gradient-to-r from-sky-200 via-white to-blue-200">
            blind spots.
          </span>
        </h2>

        {/* Subtitle */}
        <p className="text-base sm:text-xl text-slate-400 font-light max-w-xl mx-auto leading-relaxed">
          One platform for every shipment, every route and every delivery.
        </p>

        {/* Action Controls */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={onEnterPlatform}
            className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold text-xs rounded-xl shadow-[0_0_40px_rgba(2,132,199,0.35)] transition-all flex items-center justify-center gap-2 cursor-pointer group"
          >
            <span>Enter SwiftRoute</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            onClick={onTrackShipment}
            className="w-full sm:w-auto px-8 py-4 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white font-bold text-xs rounded-xl border border-white/10 hover:border-white/20 transition-all flex items-center justify-center gap-2 cursor-pointer backdrop-blur-md"
          >
            <Search className="w-4 h-4 text-sky-400" />
            <span>Track a Shipment</span>
          </button>
        </div>

        {/* Trust Stamp */}
        <div className="pt-12 text-xs font-mono text-slate-500 flex items-center justify-center gap-4">
          <span>Enterprise SLA 99.9%</span>
          <span>·</span>
          <span>256-Bit Cryptographic Telemetry</span>
          <span>·</span>
          <span>Multi-Tenant RBAC</span>
        </div>
      </div>
    </section>
  );
};
