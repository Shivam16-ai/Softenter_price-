import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Database, Link2, Key, ShieldCheck, Check } from 'lucide-react';

interface Entity {
  id: string;
  name: string;
  table: string;
  pk: string;
  x: number;
  y: number;
  connections: string[]; // IDs of connected entities
  attributes: string[];
  relationshipNotes: string;
}

const ENTITIES: Entity[] = [
  {
    id: 'customer',
    name: 'Customer',
    table: 'users',
    pk: 'id (PK)',
    x: 180,
    y: 120,
    connections: ['parcel', 'shipment', 'payment', 'invoice'],
    attributes: ['id', 'full_name', 'email', 'phone', 'role: customer', 'created_at'],
    relationshipNotes: '1-to-Many with Parcel (sender_id) and Payment records.',
  },
  {
    id: 'shipment',
    name: 'Shipment',
    table: 'shipments',
    pk: 'shipment_id (PK)',
    x: 420,
    y: 100,
    connections: ['customer', 'parcel', 'route'],
    attributes: ['shipment_id', 'consignor_id', 'total_weight', 'booking_date', 'status'],
    relationshipNotes: 'Groups multiple parcels into consolidated linehaul manifests.',
  },
  {
    id: 'parcel',
    name: 'Parcel',
    table: 'parcels',
    pk: 'tracking_number (PK)',
    x: 320,
    y: 220,
    connections: ['customer', 'shipment', 'vehicle', 'hub', 'delivery', 'invoice'],
    attributes: ['id', 'tracking_number', 'sender_id', 'weight_kg', 'dimensions', 'status'],
    relationshipNotes: 'Core entity linking sender, assigned vehicle, checkpoints, and POD.',
  },
  {
    id: 'vehicle',
    name: 'Vehicle',
    table: 'vehicles',
    pk: 'vehicle_id (PK)',
    x: 620,
    y: 160,
    connections: ['parcel', 'driver', 'route', 'hub'],
    attributes: ['vehicle_id', 'model', 'plate_number', 'capacity_kg', 'battery_status'],
    relationshipNotes: 'Assigned to active driver and scheduled along highway corridors.',
  },
  {
    id: 'driver',
    name: 'Driver',
    table: 'users (agent)',
    pk: 'driver_id (PK)',
    x: 740,
    y: 250,
    connections: ['vehicle', 'delivery', 'route'],
    attributes: ['id', 'full_name', 'phone', 'license_no', 'duty_status'],
    relationshipNotes: 'Executes assigned transit run and submits cryptographic proof of delivery.',
  },
  {
    id: 'hub',
    name: 'Hub',
    table: 'hubs',
    pk: 'hub_code (PK)',
    x: 520,
    y: 300,
    connections: ['parcel', 'vehicle', 'route'],
    attributes: ['hub_code', 'hub_name', 'coordinates', 'sorting_capacity'],
    relationshipNotes: 'Regional sorting facilities where parcel tracking scans are registered.',
  },
  {
    id: 'route',
    name: 'Route',
    table: 'routes',
    pk: 'route_id (PK)',
    x: 640,
    y: 380,
    connections: ['shipment', 'vehicle', 'driver', 'hub'],
    attributes: ['route_id', 'origin_hub', 'dest_hub', 'distance_km', 'toll_rate'],
    relationshipNotes: 'Pre-calculated high-speed highway corridors with optimal waypoints.',
  },
  {
    id: 'delivery',
    name: 'Delivery',
    table: 'delivery_proofs',
    pk: 'proof_id (PK)',
    x: 200,
    y: 340,
    connections: ['parcel', 'driver'],
    attributes: ['id', 'parcel_id', 'recipient_name', 'signature_url', 'delivered_at'],
    relationshipNotes: '1-to-1 with completed Parcel, capturing digital signature and photo POD.',
  },
  {
    id: 'invoice',
    name: 'Invoice',
    table: 'invoices',
    pk: 'invoice_no (PK)',
    x: 140,
    y: 240,
    connections: ['customer', 'parcel', 'payment'],
    attributes: ['invoice_no', 'parcel_id', 'subtotal', 'tax_amount', 'total_amount'],
    relationshipNotes: 'Generated upon consignment pickup factoring dimensional weight & tariffs.',
  },
  {
    id: 'payment',
    name: 'Payment',
    table: 'payments',
    pk: 'transaction_id (PK)',
    x: 340,
    y: 390,
    connections: ['customer', 'invoice'],
    attributes: ['id', 'parcel_id', 'amount', 'payment_method', 'status: completed'],
    relationshipNotes: 'Recorded with unique transaction IDs and audited in 3NF ledger.',
  },
];

export const DatabaseNetwork: React.FC = () => {
  const [selectedEntityId, setSelectedEntityId] = useState<string>('parcel');

  const selectedEntity = ENTITIES.find((e) => e.id === selectedEntityId) || ENTITIES[2];

  // Helper to test if two entities are connected
  const isConnected = (idA: string, idB: string) => {
    const entA = ENTITIES.find((e) => e.id === idA);
    return entA?.connections.includes(idB) || false;
  };

  return (
    <section className="relative py-28 px-4 sm:px-6 lg:px-8 bg-[#050811] text-white overflow-hidden border-t border-white/5">
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[750px] h-[400px] bg-blue-600/10 blur-[160px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Editorial Section Header */}
        <div className="max-w-3xl mb-16">
          <span className="text-xs font-mono uppercase tracking-[0.25em] text-sky-400 block mb-3">
            RELATIONAL DATA INTELLIGENCE · 3NF ENGINE
          </span>
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-white leading-tight">
            Database & System Intelligence.{' '}
            <span className="font-serif italic font-normal text-transparent bg-clip-text bg-gradient-to-r from-sky-200 to-white">
              Relational harmony.
            </span>
          </h2>
          <p className="mt-4 text-sm sm:text-base text-slate-400 font-light">
            Behind every consignment lies a rigorous relational model. Hover any entity below to see real-time foreign keys, schema normalization, and dynamic data relationships.
          </p>
        </div>

        {/* Interactive Constellation Graph Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Interactive Visual Network Canvas (8 cols) */}
          <div className="lg:col-span-8 bg-slate-950/80 rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl relative overflow-hidden backdrop-blur-md">
            <div className="absolute inset-0 opacity-[0.05] bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:24px_24px]" />

            {/* SVG Constellation Connections */}
            <div className="relative aspect-[16/10] w-full max-h-[520px]">
              <svg viewBox="80 60 740 380" className="w-full h-full select-none">
                {/* Connecting hairline vectors between entities */}
                {ENTITIES.map((entA) =>
                  entA.connections.map((targetId) => {
                    const entB = ENTITIES.find((e) => e.id === targetId);
                    if (!entB) return null;
                    const isRelated =
                      entA.id === selectedEntityId || entB.id === selectedEntityId;

                    return (
                      <line
                        key={`${entA.id}-${entB.id}`}
                        x1={entA.x}
                        y1={entA.y}
                        x2={entB.x}
                        y2={entB.y}
                        stroke={isRelated ? '#38bdf8' : '#1e293b'}
                        strokeWidth={isRelated ? 2 : 1}
                        strokeOpacity={isRelated ? 0.8 : 0.25}
                        strokeDasharray={isRelated ? 'none' : '3 3'}
                        className="transition-all duration-300"
                      />
                    );
                  })
                )}

                {/* Entity Interactive Nodes */}
                {ENTITIES.map((entity) => {
                  const isSelected = entity.id === selectedEntityId;
                  const isNeighbor = isConnected(selectedEntityId, entity.id);

                  return (
                    <g
                      key={entity.id}
                      onClick={() => setSelectedEntityId(entity.id)}
                      onMouseEnter={() => setSelectedEntityId(entity.id)}
                      className="cursor-pointer group"
                    >
                      {/* Node boundary glow */}
                      <circle
                        cx={entity.x}
                        cy={entity.y}
                        r={isSelected ? 32 : 24}
                        fill={isSelected ? '#090d16' : '#050811'}
                        stroke={
                          isSelected ? '#38bdf8' : isNeighbor ? '#0284c7' : '#334155'
                        }
                        strokeWidth={isSelected ? 2.5 : 1.5}
                        className="transition-all duration-300"
                        style={{
                          filter: isSelected
                            ? 'drop-shadow(0 0 16px rgba(56,189,248,0.5))'
                            : 'none',
                        }}
                      />

                      {/* Center dot */}
                      <circle
                        cx={entity.x}
                        cy={entity.y}
                        r={isSelected ? 5 : 3.5}
                        fill={isSelected ? '#38bdf8' : isNeighbor ? '#7dd3fc' : '#64748b'}
                      />

                      {/* Node Label */}
                      <text
                        x={entity.x}
                        y={entity.y + (isSelected ? 48 : 38)}
                        textAnchor="middle"
                        fill={isSelected ? '#ffffff' : isNeighbor ? '#cbd5e1' : '#64748b'}
                        fontSize={isSelected ? '12' : '10'}
                        fontFamily="Manrope, sans-serif"
                        fontWeight={isSelected ? '800' : '600'}
                        letterSpacing="0.5"
                        className="transition-all duration-300"
                      >
                        {entity.name}
                      </text>

                      {/* Primary Key Badge */}
                      <text
                        x={entity.x}
                        y={entity.y + (isSelected ? 60 : 49)}
                        textAnchor="middle"
                        fill="#38bdf8"
                        fontSize="8"
                        fontFamily="JetBrains Mono, monospace"
                        opacity={isSelected ? 1 : 0.6}
                      >
                        {entity.pk.split(' ')[0]}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Quick Entity Pills */}
            <div className="mt-4 pt-4 border-t border-white/5 flex flex-wrap gap-2">
              {ENTITIES.map((ent) => (
                <button
                  key={ent.id}
                  onClick={() => setSelectedEntityId(ent.id)}
                  className={`px-3 py-1 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                    selectedEntityId === ent.id
                      ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 shadow-[0_0_12px_rgba(56,189,248,0.2)]'
                      : 'bg-white/5 text-slate-400 hover:text-white border border-white/5'
                  }`}
                >
                  {ent.name}
                </button>
              ))}
            </div>
          </div>

          {/* Schema Detail HUD (4 cols) */}
          <div className="lg:col-span-4 bg-slate-900/95 rounded-3xl p-6 sm:p-7 border border-white/10 shadow-2xl backdrop-blur-xl space-y-6">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 block">
                  ENTITY METADATA
                </span>
                <h3 className="font-bold text-xl text-white mt-0.5">
                  {selectedEntity.name} Schema
                </h3>
              </div>
              <span className="px-2.5 py-1 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20 text-[10px] font-mono font-bold">
                Table: {selectedEntity.table}
              </span>
            </div>

            {/* Primary Key & Attributes */}
            <div className="space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/80 border border-white/5">
                <span className="text-slate-400 text-[11px] flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-amber-400" />
                  Primary Key:
                </span>
                <span className="text-amber-300 font-bold">{selectedEntity.pk}</span>
              </div>

              <div>
                <span className="text-slate-400 text-[10px] uppercase tracking-wider block mb-2">
                  Normalized Schema Columns
                </span>
                <div className="space-y-1.5 bg-slate-950/80 p-3.5 rounded-xl border border-white/5">
                  {selectedEntity.attributes.map((attr) => (
                    <div key={attr} className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-300">{attr}</span>
                      <span className="text-slate-500 text-[10px]">attribute</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-slate-400 text-[10px] uppercase tracking-wider block mb-2">
                  Foreign Key Constraints & Relations
                </span>
                <p className="text-xs text-slate-300 font-sans leading-relaxed p-3.5 rounded-xl bg-slate-950/80 border border-white/5 font-light">
                  {selectedEntity.relationshipNotes}
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-slate-400">
              <span>Normalization Standard:</span>
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                Boyce-Codd / 3NF Compliant
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
