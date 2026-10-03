import React, { useState, useRef } from 'react';
import { 
  ArrowRight, 
  ChevronDown, 
  Truck, 
  ShieldCheck, 
  Building2,
  Play,
  Pause,
  LogIn
} from 'lucide-react';

interface EnterpriseCinematicHeroProps {
  onExploreClick: () => void;
  onSignInClick: () => void;
}

export const EnterpriseCinematicHero: React.FC<EnterpriseCinematicHeroProps> = ({
  onExploreClick,
  onSignInClick,
}) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  const toggleVideoPlayback = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  return (
    <section className="relative min-h-screen w-full flex flex-col justify-between overflow-hidden bg-[#0c0d12] text-white select-none">
      {/* Real-World Logistics Stock Video Background */}
      <div className="absolute inset-0 w-full h-full overflow-hidden">
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster="/assets/logistics-hero.jpg"
          className="absolute inset-0 w-full h-full object-cover scale-105 filter brightness-[0.78] contrast-[1.08] saturate-[1.15] transition-transform duration-1000"
        >
          <source src="/assets/logistics-hero.mp4" type="video/mp4" />
        </video>

        {/* Real-World Rich Lighting Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/55 to-black/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0c0d12] via-transparent to-black/60" />
        <div className="absolute inset-0 bg-radial from-transparent via-black/25 to-[#0c0d12]/90" />
      </div>

      {/* Top spacer for navigation */}
      <div className="pt-28 sm:pt-36" />

      {/* Main Hero Container - Rebalanced & Centered Editorial Composition */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 sm:px-8 w-full py-12 sm:py-16 flex flex-col justify-center flex-1 space-y-8">
        {/* Live Operational Indicator */}
        <div className="inline-flex items-center gap-3 px-3.5 py-1.5 rounded-full bg-black/60 border border-white/15 backdrop-blur-md w-fit">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF5500] opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#FF5500]" />
          </span>
          <span className="text-xs font-mono uppercase tracking-[0.2em] text-slate-200">
            CONTINENTAL CORRIDORS · 48 ACTIVE
          </span>
          <span className="text-slate-500">|</span>
          <span className="text-xs font-mono text-amber-400">99.8% ON-TIME PERFORMANCE</span>
        </div>

        {/* Giant Editorial Headline */}
        <div className="space-y-1">
          <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-extrabold tracking-tighter uppercase text-white leading-[0.9] font-sans">
            <span className="block drop-shadow-lg">PRECISION</span>
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-amber-200">
              MOVES THE
            </span>
            <span className="block text-[#FF5500] drop-shadow-[0_0_35px_rgba(255,85,0,0.5)]">
              WORLD.
            </span>
          </h1>
        </div>

        {/* Secondary Editorial Prose */}
        <p className="text-lg sm:text-xl md:text-2xl text-slate-200 font-light max-w-3xl leading-relaxed drop-shadow-md">
          Enterprise parcel and freight management built for real-world logistics at scale. Connecting automated distribution hubs, high-cube linehaul fleets, and millions of daily consignments.
        </p>

        {/* Primary Action Buttons */}
        <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto">
          <button
            type="button"
            onClick={onExploreClick}
            className="px-7 py-4 rounded-xl bg-[#FF5500] hover:bg-orange-500 text-white font-bold text-xs uppercase tracking-wider shadow-[0_0_25px_rgba(255,85,0,0.4)] transition-all flex items-center justify-center gap-3 cursor-pointer group"
          >
            <span>Explore Global Network</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            type="button"
            onClick={onSignInClick}
            className="px-7 py-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs font-mono uppercase tracking-wider border border-white/20 backdrop-blur-md transition-all flex items-center justify-center gap-2.5 cursor-pointer"
          >
            <LogIn className="w-4 h-4 text-orange-400" />
            <span>Enterprise Portal Access</span>
          </button>
        </div>

        {/* Capabilities Footnote Strip */}
        <div className="pt-4 flex flex-wrap items-center gap-4 text-xs font-mono text-slate-300">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/50 border border-white/10">
            <Truck className="w-3.5 h-3.5 text-[#FF5500]" />
            <span>Heavy Linehaul & High-Cube Carriers</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/50 border border-white/10">
            <Building2 className="w-3.5 h-3.5 text-amber-400" />
            <span>Automated Sort Facilities</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/50 border border-white/10">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Cryptographic Chain of Custody</span>
          </div>
        </div>
      </div>

      {/* Bottom Footer Bar on Hero with Scroll Prompt & Subtle Video Controls */}
      <div className="relative z-10 w-full border-t border-white/10 bg-black/60 backdrop-blur-md px-6 sm:px-8 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Scroll Prompt */}
          <button
            type="button"
            onClick={onExploreClick}
            className="flex items-center gap-2 text-xs font-mono uppercase tracking-[0.2em] text-slate-400 hover:text-white transition-colors cursor-pointer group"
          >
            <span>SCROLL TO EXPLORE</span>
            <ChevronDown className="w-4 h-4 text-[#FF5500] group-hover:translate-y-1 transition-transform" />
          </button>

          {/* Minimalist Footage Control */}
          <div className="flex items-center gap-3 text-xs font-mono text-slate-400">
            <button
              type="button"
              onClick={toggleVideoPlayback}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 text-[11px] transition-colors cursor-pointer"
            >
              {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
              <span>{isPlaying ? 'Pause Video' : 'Play Video'}</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
