import React from 'react';
import { 
  ArrowRight, 
  Search, 
  LogIn, 
  ShieldCheck, 
  Globe2, 
  Building2, 
  Phone, 
  Mail, 
  MapPin, 
  CheckCircle2,
  ExternalLink,
  Package
} from 'lucide-react';
import { SwiftRouteLogo } from '../common/SwiftRouteLogo';

interface EnterpriseFooterProps {
  onEnterPlatform: () => void;
  onExploreNetwork?: () => void;
}

export const EnterpriseFooter: React.FC<EnterpriseFooterProps> = ({
  onEnterPlatform,
  onExploreNetwork,
}) => {
  return (
    <footer className="relative bg-[#07090e] text-white border-t border-white/10 overflow-hidden select-none">
      {/* ======================================================== */}
      {/* FINAL MASSIVE CTA WITH NIGHT LOGISTICS BACKDROP          */}
      {/* ======================================================== */}
      <div className="relative py-28 sm:py-36 px-6 sm:px-8 border-b border-white/10 overflow-hidden">
        {/* Background night linehaul highway video */}
        <div className="absolute inset-0 w-full h-full overflow-hidden opacity-30">
          <video
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            poster="/assets/logistics-hero.jpg"
            className="w-full h-full object-cover scale-105 filter brightness-[0.7]"
          >
            <source src="/assets/logistics-highway.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-t from-[#07090e] via-[#07090e]/70 to-[#07090e]" />
        </div>

        <div className="max-w-7xl mx-auto relative z-10 space-y-10 text-center flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/15 backdrop-blur-md text-xs font-mono">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="uppercase tracking-[0.25em] text-slate-200">
              COMMERCIAL ONBOARDING OPEN
            </span>
          </div>

          <div className="space-y-4 max-w-4xl">
            <h2 className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black uppercase tracking-tighter text-white leading-[0.9] font-sans">
              READY TO MOVE{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF5500] via-amber-400 to-orange-200">
                WHAT'S NEXT?
              </span>
            </h2>

            <p className="text-base sm:text-xl text-slate-300 font-light max-w-2xl mx-auto leading-relaxed pt-2">
              Connect your commercial dispatch, supply chain systems, and interstate freight carriers to SwiftRoute Enterprise OS today.
            </p>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto pt-4">
            <button
              onClick={onExploreNetwork}
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-mono text-xs uppercase tracking-wider font-bold border border-white/20 transition-all flex items-center justify-center gap-3 cursor-pointer backdrop-blur-md"
            >
              <ArrowRight className="w-4 h-4 text-[#FF5500]" />
              <span>Explore Active Network</span>
            </button>

            <button
              onClick={onEnterPlatform}
              className="w-full sm:w-auto px-9 py-4 rounded-xl bg-[#FF5500] hover:bg-orange-500 text-white font-bold text-xs uppercase tracking-wider shadow-[0_0_30px_rgba(255,85,0,0.5)] transition-all flex items-center justify-center gap-3 cursor-pointer group"
            >
              <LogIn className="w-4 h-4" />
              <span>Enterprise Portal Access</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Compliance Assurance */}
          <div className="pt-6 flex flex-wrap items-center justify-center gap-6 text-xs font-mono text-slate-400">
            <span className="flex items-center gap-1.5 text-slate-300">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              ISO 27001 Certified Security
            </span>
            <span>·</span>
            <span>ISO 9001 Quality Management</span>
            <span>·</span>
            <span>GDP Pharma Cold-Chain</span>
            <span>·</span>
            <span>TAPA TSR Level 1</span>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* CORPORATE DIRECTORY & REGIONAL HUBS                     */}
      {/* ======================================================== */}
      <div className="max-w-7xl mx-auto px-6 sm:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 border-b border-white/10 pb-16">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#FF5500] flex items-center justify-center text-white shadow-[0_0_20px_rgba(255,85,0,0.4)]">
                <Package className="w-5 h-5" />
              </div>
              <div>
                <span className="font-extrabold text-xl text-white tracking-tight">SwiftRoute</span>
                <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-slate-400 block -mt-1">
                  ENTERPRISE LOGISTICS OS
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-400 font-light leading-relaxed max-w-sm">
              Global parcel, freight, and fleet telemetry infrastructure. Moving millions of daily consignments across interconnected road corridors, high-bay sorting hubs, and verified delivery gates.
            </p>

            <div className="pt-2 text-xs font-mono text-slate-400 space-y-1">
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-[#FF5500]" />
                <span>Global HQ: Financial District, Hyderabad, TS 500032</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-amber-400" />
                <span>Dispatch: dispatch@swiftroute.io</span>
              </div>
            </div>
          </div>

          {/* Regional Hubs */}
          <div className="space-y-3">
            <span className="text-xs font-mono uppercase tracking-[0.2em] text-white font-bold block">
              PRIMARY HUBS
            </span>
            <ul className="space-y-2 text-xs font-mono text-slate-400">
              <li className="hover:text-white transition-colors cursor-pointer">Hyderabad Central Mega Sort</li>
              <li className="hover:text-white transition-colors cursor-pointer">Mumbai Maritime Gateway</li>
              <li className="hover:text-white transition-colors cursor-pointer">Bengaluru Tech Corridor Hub</li>
              <li className="hover:text-white transition-colors cursor-pointer">Delhi NCR Regional Depot</li>
              <li className="hover:text-white transition-colors cursor-pointer">Frankfurt Cargo Hub (FRA)</li>
              <li className="hover:text-white transition-colors cursor-pointer">Singapore Changi Terminal</li>
            </ul>
          </div>

          {/* System Capabilities */}
          <div className="space-y-3">
            <span className="text-xs font-mono uppercase tracking-[0.2em] text-white font-bold block">
              SOLUTIONS
            </span>
            <ul className="space-y-2 text-xs font-mono text-slate-400">
              <li className="hover:text-white transition-colors cursor-pointer">High-Cube Linehaul Dispatch</li>
              <li className="hover:text-white transition-colors cursor-pointer">Cross-Dock Automated Sorting</li>
              <li className="hover:text-white transition-colors cursor-pointer">Cold-Chain GDP Pharma Reefer</li>
              <li className="hover:text-white transition-colors cursor-pointer">Geofenced Delivery Signature</li>
              <li className="hover:text-white transition-colors cursor-pointer">Electronic FASTag Toll Link</li>
              <li className="hover:text-white transition-colors cursor-pointer">Instant Commercial Invoicing</li>
            </ul>
          </div>

          {/* Platform Access */}
          <div className="space-y-3">
            <span className="text-xs font-mono uppercase tracking-[0.2em] text-white font-bold block">
              WORKSPACE
            </span>
            <ul className="space-y-2 text-xs font-mono text-slate-400">
              <li>
                <button onClick={onEnterPlatform} className="hover:text-[#FF5500] transition-colors cursor-pointer">
                  Dispatcher Console
                </button>
              </li>
              <li>
                <button onClick={onEnterPlatform} className="hover:text-[#FF5500] transition-colors cursor-pointer">
                  Courier Agent Gateway
                </button>
              </li>
              <li>
                <button onClick={onEnterPlatform} className="hover:text-[#FF5500] transition-colors cursor-pointer">
                  Shipper Commercial Portal
                </button>
              </li>
              <li>
                <button onClick={onExploreNetwork} className="hover:text-[#FF5500] transition-colors cursor-pointer">
                  Global Corridor Directory
                </button>
              </li>
              <li>
                <button onClick={onEnterPlatform} className="hover:text-[#FF5500] transition-colors cursor-pointer">
                  System Audit Ledger
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Baseline Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-slate-500">
          <div>
            © 2026 SwiftRoute Logistics Technologies Inc. All rights reserved.
          </div>

          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              142/142 Hubs Operational
            </span>
            <span>·</span>
            <span>Telemetry Ping: 14ms</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
