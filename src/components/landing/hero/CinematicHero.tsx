import React, { useState, useEffect } from 'react';
import { ArrowRight, Search, RotateCcw, ShieldCheck, Compass, Radio } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ThreeTruckScene } from './ThreeTruckScene';
import { TornPaperReveal } from './TornPaperReveal';

interface CinematicHeroProps {
  onTrackClick: () => void;
  onExploreClick: () => void;
}

export const CinematicHero: React.FC<CinematicHeroProps> = ({ onTrackClick, onExploreClick }) => {
  // Animation states
  // 0: Initial paper manifest
  // 1: Paper tearing in progress
  // 2: Truck bursting through
  // 3: Digital logistics matrix revealed + headline entry
  const [phase, setPhase] = useState<'paper' | 'tearing' | 'burst' | 'complete'>('paper');
  const [tearProgress, setTearProgress] = useState(0);
  const [truckProgress, setTruckProgress] = useState(0);

  // Auto-play the cinematic sequence on load
  useEffect(() => {
    // 1. Brief pause on paper manifest
    const t1 = setTimeout(() => {
      setPhase('tearing');
    }, 700);

    return () => clearTimeout(t1);
  }, []);

  // Tearing progress driver
  useEffect(() => {
    if (phase === 'tearing') {
      let start: number | null = null;
      const duration = 1200; // 1.2s realistic dynamic tear

      const step = (ts: number) => {
        if (!start) start = ts;
        const elapsed = ts - start;
        const p = Math.min(1, elapsed / duration);
        // Easing curve
        const eased = Math.pow(p, 2.2);
        setTearProgress(eased);
        setTruckProgress(p * 0.7);

        if (p < 1) {
          requestAnimationFrame(step);
        } else {
          setPhase('burst');
        }
      };
      requestAnimationFrame(step);
    } else if (phase === 'burst') {
      let start: number | null = null;
      const duration = 900;

      const step = (ts: number) => {
        if (!start) start = ts;
        const elapsed = ts - start;
        const p = Math.min(1, elapsed / duration);
        setTruckProgress(0.7 + p * 0.3);

        if (p < 1) {
          requestAnimationFrame(step);
        } else {
          setPhase('complete');
        }
      };
      requestAnimationFrame(step);
    }
  }, [phase]);

  const handleReplay = () => {
    setTearProgress(0);
    setTruckProgress(0);
    setPhase('paper');
    setTimeout(() => {
      setPhase('tearing');
    }, 400);
  };

  const handleSkip = () => {
    setTearProgress(1);
    setTruckProgress(1);
    setPhase('complete');
  };

  return (
    <section className="relative min-h-[92vh] lg:min-h-screen bg-[#050811] text-white flex flex-col justify-between pt-24 pb-14 px-4 sm:px-6 lg:px-8 overflow-hidden select-none">
      {/* Background Deep Midnight Lighting & Atmosphere */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[850px] h-[450px] bg-gradient-to-b from-blue-600/15 via-sky-500/5 to-transparent blur-[140px] rounded-full" />
        <div className="absolute bottom-10 left-1/4 w-[500px] h-[300px] bg-indigo-900/10 blur-[120px] rounded-full" />
        {/* Subtle coordinate matrix grid */}
        <div className="absolute inset-0 opacity-[0.06] bg-[linear-gradient(to_right,#38bdf8_1px,transparent_1px),linear-gradient(to_bottom,#38bdf8_1px,transparent_1px)] bg-[size:4rem_4rem]" />
      </div>

      {/* Torn Paper Layer (Stage 1 & 2) */}
      <TornPaperReveal
        splitProgress={tearProgress}
        isTorn={phase === 'tearing' || phase === 'burst' || phase === 'complete'}
      />

      {/* 3D / WebGL Truck Burst Canvas */}
      <div className="absolute inset-0 z-10 flex items-center justify-center">
        <ThreeTruckScene
          progress={truckProgress}
          isBursting={phase !== 'paper'}
        />
      </div>

      {/* Top Meta Telemetry Indicators */}
      <div className="relative z-20 max-w-7xl mx-auto w-full flex items-center justify-between text-xs text-slate-400 font-mono">
        <div className="flex items-center gap-3">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-500" />
          </span>
          <span className="text-slate-300 font-medium tracking-wider uppercase text-[11px]">
            TELEMETRY NODE · HYD-BLR-01
          </span>
          <span className="hidden sm:inline text-slate-600">/</span>
          <span className="hidden sm:inline text-slate-500 text-[11px]">
            LAT 17.3850° N · LON 78.4867° E
          </span>
        </div>

        {/* Replay / Skip Animation Toggle */}
        <div className="flex items-center gap-2">
          {phase !== 'complete' ? (
            <button
              onClick={handleSkip}
              className="px-2.5 py-1 text-[11px] font-mono text-slate-400 hover:text-white border border-white/10 hover:border-white/20 rounded-md transition-all cursor-pointer backdrop-blur-md"
            >
              Skip Intro
            </button>
          ) : (
            <button
              onClick={handleReplay}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-mono text-slate-400 hover:text-white border border-white/10 hover:border-white/20 rounded-md transition-all cursor-pointer backdrop-blur-md"
              title="Re-run paper tear animation"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Replay Intro</span>
            </button>
          )}
        </div>
      </div>

      {/* Hero Headline & Value Proposition (Editorial Typography) */}
      <div className="relative z-20 max-w-5xl mx-auto w-full text-center my-auto pt-8 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.2 }}
          className="space-y-6"
        >
          {/* Subtle Category Kicker */}
          <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-[0.25em] text-sky-400/90">
            <span>Autonomous Route Orchestration</span>
            <span className="text-slate-600">·</span>
            <span>Enterprise Parcel OS</span>
          </div>

          {/* Primary Editorial Headline */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-[5.25rem] font-bold tracking-tight text-white leading-[1.08] max-w-4xl mx-auto">
            Move every shipment{' '}
            <br className="hidden sm:inline" />
            with{' '}
            <span className="font-serif italic font-normal text-transparent bg-clip-text bg-gradient-to-r from-sky-200 via-white to-blue-200">
              precision.
            </span>
          </h1>

          {/* Supporting Statement */}
          <p className="text-sm sm:text-base md:text-lg text-slate-400 max-w-2xl mx-auto font-light leading-relaxed">
            An enterprise logistics platform connecting parcels, fleets, routes, and distribution hubs through one intelligent, automated system.
          </p>

          {/* Luxury CTA Controls */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={onTrackClick}
              className="w-full sm:w-auto px-7 py-3.5 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-semibold text-xs rounded-xl shadow-[0_0_35px_rgba(2,132,199,0.35)] transition-all flex items-center justify-center gap-2 cursor-pointer group"
            >
              <Search className="w-4 h-4 text-sky-200 group-hover:scale-110 transition-transform" />
              <span>Track a Shipment</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={onExploreClick}
              className="w-full sm:w-auto px-7 py-3.5 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white font-semibold text-xs rounded-xl border border-white/10 hover:border-white/20 transition-all flex items-center justify-center gap-2 cursor-pointer backdrop-blur-md"
            >
              <span>Explore the Platform</span>
            </button>
          </div>
        </motion.div>
      </div>

      {/* Bottom Telemetry & Trust Badges */}
      <div className="relative z-20 max-w-7xl mx-auto w-full border-t border-white/5 pt-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono">
        <div>
          <span className="text-slate-500 block text-[10px] uppercase">Route Dispatch Accuracy</span>
          <span className="text-white font-bold text-sm tracking-tight">99.84% Verified</span>
        </div>
        <div>
          <span className="text-slate-500 block text-[10px] uppercase">Real-Time Hub Sync</span>
          <span className="text-white font-bold text-sm tracking-tight">&lt; 14ms Global Latency</span>
        </div>
        <div>
          <span className="text-slate-500 block text-[10px] uppercase">Cryptographic Delivery Proof</span>
          <span className="text-white font-bold text-sm tracking-tight">ECDSA Immutable POD</span>
        </div>
        <div>
          <span className="text-slate-500 block text-[10px] uppercase">Carrier Network Density</span>
          <span className="text-white font-bold text-sm tracking-tight">12,400+ Units Active</span>
        </div>
      </div>
    </section>
  );
};
