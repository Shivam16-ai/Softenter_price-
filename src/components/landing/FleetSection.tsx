import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Truck, 
  BatteryCharging, 
  Gauge, 
  MapPin, 
  Thermometer, 
  Shield, 
  ArrowRight,
  Plane,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface FleetVehicle {
  id: string;
  name: string;
  category: string;
  payload: string;
  powertrain: string;
  range: string;
  assignedRoute: string;
  telemetryStatus: string;
  specialty: string;
  image: string;
}

export const FleetSection: React.FC = () => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const fleet: FleetVehicle[] = [
    {
      id: 'SR-FLT-101',
      name: 'Scania R500 Heavy Linehaul',
      category: 'Interstate Class-8 Heavy Freight',
      payload: '32,000 kg (Gross Weight: 44 Tons)',
      powertrain: '13-L Turbo Euro-6 Clean Diesel',
      range: '1,200 km Continental Range',
      assignedRoute: 'Hyderabad Central ➔ Bengaluru Tech Park (NH-44)',
      telemetryStatus: 'ACTIVE CRUISE · 78 km/h · 4.2°C REEFER',
      specialty: 'High-cube interstate tandem trailer linehaul with dual driver berths.',
      image: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=1200&q=80',
    },
    {
      id: 'SR-FLT-204',
      name: 'Volvo FM Electric Trunk-Hauler',
      category: 'Zero-Emission Urban Corridor',
      payload: '24,000 kg Payload Capacity',
      powertrain: '540 kWh Lithium-Iron · 666 HP Dual Motor',
      range: '320 km Zero-Emission Range',
      assignedRoute: 'Mumbai Port ➔ Pune Distribution Terminal',
      telemetryStatus: 'BATTERY 82% · ZERO NOISE CERTIFIED',
      specialty: 'Silent night-time urban delivery permitted in European and Indian city centers.',
      image: 'https://images.unsplash.com/photo-1519003722824-194d4455a60c?auto=format&fit=crop&w=1200&q=80',
    },
    {
      id: 'SR-FLT-308',
      name: 'Mercedes-Benz Sprinter EV Van',
      category: 'Final-Mile High-Density Delivery',
      payload: '1,800 kg · 14.5 m³ Cargo Bay',
      powertrain: '113 kWh Electric Drive · Fast DC Charging',
      range: '240 km Urban Stop-and-Go',
      assignedRoute: 'Bengaluru Outer Ring ➔ Electronic City Doorstep',
      telemetryStatus: 'DOOR GEOFENCE ACTIVE · 14 DROPS REMAINING',
      specialty: 'Agile city van with automated walk-in shelving and instant barcode scan racks.',
      image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80',
    },
    {
      id: 'SR-FLT-412',
      name: 'Thermo King Cold-Chain Reefer',
      category: 'Active Temperature-Controlled Pharmaceutical',
      payload: '22,000 kg High-Precision Cargo',
      powertrain: 'Hybrid Micro-Turbine Electric Chiller',
      range: 'Continuous 96h Thermal Autonomy',
      assignedRoute: 'Hyderabad Genome Valley ➔ Delhi NCR Pharma Depot',
      telemetryStatus: 'TEMP: 4.0°C (± 0.2°C SLA) · GDP COMPLIANT',
      specialty: 'Certified Good Distribution Practice (GDP) pharma carrier with satellite alarms.',
      image: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=1200&q=80',
    },
  ];

  const currentVehicle = fleet[selectedIndex];

  return (
    <section id="fleet" className="relative py-28 sm:py-36 bg-[#0c0d13] text-white border-t border-white/10 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 space-y-16">
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 pb-6 border-b border-white/10">
          <div className="space-y-4 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono">
              <Truck className="w-3.5 h-3.5 text-[#FF5500]" />
              <span className="uppercase tracking-[0.25em] text-slate-300">
                COMMERCIAL FLEET IN MOTION
              </span>
            </div>

            <h2 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold uppercase tracking-tight text-white leading-[0.95]">
              THE FLEET BEHIND{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF5500] via-amber-400 to-white">
                EVERY DELIVERY.
              </span>
            </h2>

            <p className="text-base sm:text-lg text-slate-300 font-light leading-relaxed">
              Engineered for endurance. Our fleet pairs high-cube linehaul electric transports with agile final-mile delivery vans and pharma reefers.
            </p>
          </div>

          {/* Stepper buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSelectedIndex((prev) => (prev > 0 ? prev - 1 : fleet.length - 1))}
              className="p-3 rounded-full bg-white/5 hover:bg-white/15 border border-white/15 text-white transition-colors cursor-pointer"
              aria-label="Previous vehicle"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-xs font-mono text-slate-400">
              0{selectedIndex + 1} / 0{fleet.length}
            </span>
            <button
              onClick={() => setSelectedIndex((prev) => (prev < fleet.length - 1 ? prev + 1 : 0))}
              className="p-3 rounded-full bg-[#FF5500] hover:bg-orange-500 text-white transition-colors cursor-pointer"
              aria-label="Next vehicle"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Selected Vehicle Showcase (Automotive Commercial Presentation) */}
        <div className="rounded-3xl bg-[#141620] border border-white/10 overflow-hidden shadow-2xl grid grid-cols-1 lg:grid-cols-12 items-center">
          {/* Vehicle Imagery */}
          <div className="lg:col-span-7 relative min-h-[380px] lg:min-h-[520px] overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.img
                key={currentVehicle.id}
                src={currentVehicle.image}
                alt={currentVehicle.name}
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6 }}
                className="absolute inset-0 w-full h-full object-cover filter brightness-[0.88] contrast-[1.08]"
              />
            </AnimatePresence>

            <div className="absolute inset-0 bg-gradient-to-t from-[#141620] via-transparent to-black/40" />

            {/* In-Photo HUD Overlay */}
            <div className="absolute top-6 left-6 right-6 flex items-center justify-between text-xs font-mono">
              <span className="px-3 py-1 rounded-full bg-black/75 border border-white/15 text-amber-400 font-bold backdrop-blur-md">
                ASSET ID: {currentVehicle.id}
              </span>
              <span className="px-3 py-1 rounded-full bg-black/75 border border-white/15 text-slate-300 backdrop-blur-md">
                {currentVehicle.category}
              </span>
            </div>

            <div className="absolute bottom-6 left-6 right-6 p-4 rounded-2xl bg-black/80 backdrop-blur-md border border-white/15 text-xs font-mono text-emerald-400">
              ● {currentVehicle.telemetryStatus}
            </div>
          </div>

          {/* Vehicle Specifications */}
          <div className="lg:col-span-5 p-8 sm:p-12 space-y-6">
            <div className="space-y-2">
              <span className="text-xs font-mono uppercase tracking-[0.2em] text-[#FF5500] font-bold block">
                COMMERCIAL SPECIFICATION
              </span>
              <h3 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                {currentVehicle.name}
              </h3>
              <p className="text-xs font-mono text-slate-400">
                Route: {currentVehicle.assignedRoute}
              </p>
            </div>

            <p className="text-sm text-slate-300 font-light leading-relaxed">
              {currentVehicle.specialty}
            </p>

            {/* Spec Matrix */}
            <div className="grid grid-cols-2 gap-3 pt-2 text-xs font-mono border-t border-white/10">
              <div className="p-3.5 rounded-xl bg-black/50 border border-white/5 space-y-1">
                <span className="text-slate-400 block text-[10px] uppercase">CERTIFIED PAYLOAD</span>
                <span className="text-base font-bold text-white block">{currentVehicle.payload}</span>
              </div>

              <div className="p-3.5 rounded-xl bg-black/50 border border-white/5 space-y-1">
                <span className="text-slate-400 block text-[10px] uppercase">POWERTRAIN</span>
                <span className="text-base font-bold text-amber-400 block">{currentVehicle.powertrain}</span>
              </div>

              <div className="p-3.5 rounded-xl bg-black/50 border border-white/5 space-y-1">
                <span className="text-slate-400 block text-[10px] uppercase">OPERATIONAL RANGE</span>
                <span className="text-base font-bold text-emerald-400 block">{currentVehicle.range}</span>
              </div>

              <div className="p-3.5 rounded-xl bg-black/50 border border-white/5 space-y-1">
                <span className="text-slate-400 block text-[10px] uppercase">TELEMETRY LINK</span>
                <span className="text-base font-bold text-sky-400 block">CAN-Bus / 4G Satellite</span>
              </div>
            </div>

            {/* Selection Dots */}
            <div className="flex items-center gap-2 pt-2">
              {fleet.map((v, i) => (
                <button
                  key={v.id}
                  onClick={() => setSelectedIndex(i)}
                  className={`h-1.5 rounded-full transition-all cursor-pointer ${
                    i === selectedIndex ? 'w-8 bg-[#FF5500]' : 'w-2 bg-white/20 hover:bg-white/40'
                  }`}
                  aria-label={`Select vehicle ${v.name}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
