import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Package, 
  CheckCircle2, 
  Truck, 
  Building2, 
  MapPin, 
  ShieldCheck, 
  ArrowRight,
  Clock,
  QrCode,
  FileCheck
} from 'lucide-react';

interface JourneyStep {
  id: string;
  stage: string;
  title: string;
  time: string;
  location: string;
  detail: string;
  telemetry: string;
  icon: React.ElementType;
}

const JOURNEY_STEPS: JourneyStep[] = [
  {
    id: 'step_1',
    stage: '01',
    title: 'ORDERED',
    time: '08:15 UTC',
    location: 'Consignor Terminal · San Francisco, CA',
    detail: 'Consignment manifest generated. Dimensions and weight certified electronically.',
    telemetry: 'Payload 4.8kg · Barcode Encoded',
    icon: Package,
  },
  {
    id: 'step_2',
    stage: '02',
    title: 'PICKED UP',
    time: '09:40 UTC',
    location: 'Bay Area First-Mile Fleet #402',
    detail: 'Carrier accepted consignment. Scan validated via mobile biometric signature.',
    telemetry: 'Courier ID #AG-892 · Verified',
    icon: Truck,
  },
  {
    id: 'step_3',
    stage: '03',
    title: 'IN TRANSIT',
    time: '11:20 UTC',
    location: 'Interstate Highway Corridor 101',
    detail: 'Linehaul vehicle traversing active GPS corridor. Cold-chain sensors nominal.',
    telemetry: 'Speed 74 km/h · Temp 20.4°C',
    icon: ArrowRight,
  },
  {
    id: 'step_4',
    stage: '04',
    title: 'HUB SORTED',
    time: '14:05 UTC',
    location: 'Regional Automated Distribution Hub',
    detail: 'High-speed automated optical sorter redirected package to final delivery lane.',
    telemetry: 'Conveyor Gate B-14 · Optical Pass',
    icon: Building2,
  },
  {
    id: 'step_5',
    stage: '05',
    title: 'OUT FOR DELIVERY',
    time: '16:30 UTC',
    location: 'Last-Mile Electric Van #EV-18',
    detail: 'Loaded onto dispatch run. Recipient notified with dynamic 20-minute ETA window.',
    telemetry: 'ETA 17:45 · 4 Stops Remaining',
    icon: MapPin,
  },
  {
    id: 'step_6',
    stage: '06',
    title: 'DELIVERED',
    time: '17:42 UTC',
    location: 'Recipient Destination · Palo Alto, CA',
    detail: 'Cryptographic proof of delivery captured with high-res photo and stylus signature.',
    telemetry: 'ECDSA Hash Verified · Settled',
    icon: CheckCircle2,
  },
];

export const ShipmentJourney: React.FC = () => {
  const [activeStepIndex, setActiveStepIndex] = useState(2); // default to In Transit

  // Auto-advance step every 4.5 seconds for ambient cinematic storytelling
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStepIndex((prev) => (prev + 1) % JOURNEY_STEPS.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  const currentStep = JOURNEY_STEPS[activeStepIndex];

  return (
    <section id="journey" className="relative py-28 px-4 sm:px-6 lg:px-8 bg-[#070b16] text-white border-t border-b border-white/5 overflow-hidden">
      {/* Background Lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-blue-600/10 blur-[130px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Editorial Section Header */}
        <div className="max-w-3xl mb-16">
          <span className="text-xs font-mono uppercase tracking-[0.25em] text-sky-400 block mb-3">
            LIFECYCLE TELEMETRY
          </span>
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-white leading-tight">
            One shipment.{' '}
            <span className="font-serif italic font-normal text-transparent bg-clip-text bg-gradient-to-r from-sky-200 to-white">
              Every system connected.
            </span>
          </h2>
          <p className="mt-4 text-sm sm:text-base text-slate-400 font-light">
            Follow the digital ledger of an enterprise parcel as it transitions seamlessly from initial booking to certified final delivery.
          </p>
        </div>

        {/* Horizontal Route Progression Line */}
        <div className="relative mb-14 pt-4">
          {/* Background Track Line */}
          <div className="absolute top-7 left-4 right-4 h-[2px] bg-slate-800" />
          
          {/* Animated Glowing Progress Line */}
          <div
            className="absolute top-7 left-4 h-[2px] bg-gradient-to-r from-sky-500 to-blue-400 transition-all duration-700 ease-out shadow-[0_0_12px_rgba(56,189,248,0.7)]"
            style={{
              width: `${(activeStepIndex / (JOURNEY_STEPS.length - 1)) * 96}%`,
            }}
          />

          {/* Steps Horizontal Row */}
          <div className="relative grid grid-cols-6 gap-2">
            {JOURNEY_STEPS.map((step, idx) => {
              const Icon = step.icon;
              const isActive = idx === activeStepIndex;
              const isPast = idx < activeStepIndex;

              return (
                <button
                  key={step.id}
                  onClick={() => setActiveStepIndex(idx)}
                  className="flex flex-col items-center text-center group cursor-pointer focus:outline-none"
                >
                  {/* Step Node Dot / Circle */}
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 relative ${
                      isActive
                        ? 'bg-sky-500 text-white shadow-[0_0_24px_rgba(56,189,248,0.6)] scale-110 border border-sky-300'
                        : isPast
                        ? 'bg-blue-950/80 text-sky-400 border border-sky-800/80'
                        : 'bg-slate-900/90 text-slate-500 border border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {isActive && (
                      <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-300 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-sky-400" />
                      </span>
                    )}
                  </div>

                  {/* Stage Label */}
                  <div className="mt-3">
                    <span className="font-mono text-[10px] text-slate-500 uppercase tracking-widest block">
                      {step.stage}
                    </span>
                    <span
                      className={`text-xs font-bold tracking-tight block mt-0.5 ${
                        isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'
                      }`}
                    >
                      {step.title}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Stage Detail Showcase */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="p-6 sm:p-8 rounded-2xl bg-slate-900/80 border border-white/10 backdrop-blur-md shadow-2xl"
          >
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              <div className="md:col-span-8 space-y-3">
                <div className="flex items-center gap-3">
                  <span className="px-2.5 py-0.5 rounded text-[11px] font-mono font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30">
                    STAGE {currentStep.stage} OF 06
                  </span>
                  <span className="text-xs font-mono text-slate-400 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    {currentStep.time}
                  </span>
                </div>

                <h3 className="text-2xl font-bold text-white tracking-tight">
                  {currentStep.title} — {currentStep.location}
                </h3>

                <p className="text-sm text-slate-300 leading-relaxed font-light">
                  {currentStep.detail}
                </p>
              </div>

              <div className="md:col-span-4 bg-slate-950/80 p-4 rounded-xl border border-white/5 space-y-2.5 font-mono text-xs">
                <div className="text-slate-400 text-[10px] uppercase tracking-wider">
                  Live Sensor & Protocol Stream
                </div>
                <div className="text-sky-300 font-semibold flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  {currentStep.telemetry}
                </div>
                <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Routing Protocol:</span>
                  <span className="text-white">OS-TRANSIT-V4</span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>State Hash:</span>
                  <span className="text-slate-300">0x7F4B...99C2</span>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
};
