import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Truck, 
  Package, 
  AlertCircle, 
  FileText, 
  Calendar, 
  ShieldCheck, 
  Copy, 
  Check, 
  ArrowRight,
  ExternalLink,
  Navigation,
  Sparkles
} from 'lucide-react';
import { motion } from 'motion/react';
import { Parcel, TrackingCheckpoint, DeliveryProof, ParcelStatus } from '../../../shared/types';
import { StatusBadge } from './StatusBadge';

interface TrackingTimelineProps {
  parcel: Parcel;
  tracking: TrackingCheckpoint[];
  proof?: DeliveryProof;
  onViewInvoice?: (parcelId: string) => void;
}

const STATUS_STEPS: { key: ParcelStatus; label: string; icon: any }[] = [
  { key: 'pending', label: 'Order Booked', icon: Package },
  { key: 'picked_up', label: 'Picked Up', icon: Navigation },
  { key: 'in_transit', label: 'In Transit', icon: Truck },
  { key: 'out_for_delivery', label: 'Out for Delivery', icon: Clock },
  { key: 'delivered', label: 'Delivered', icon: CheckCircle2 },
];

export const TrackingTimeline: React.FC<TrackingTimelineProps> = ({
  parcel,
  tracking,
  proof,
  onViewInvoice,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(parcel.tracking_number);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getStepStatus = (stepKey: ParcelStatus) => {
    const stepOrder: Record<string, number> = {
      pending: 0,
      assigned: 0,
      picked_up: 1,
      in_transit: 2,
      out_for_delivery: 3,
      delivered: 4,
      failed: -1,
      cancelled: -1,
    };

    const currentOrder = stepOrder[parcel.status] ?? 0;
    const targetOrder = stepOrder[stepKey] ?? 0;

    if (parcel.status === 'failed' || parcel.status === 'cancelled') {
      return 'error';
    }
    if (targetOrder < currentOrder) return 'completed';
    if (targetOrder === currentOrder) return 'current';
    return 'upcoming';
  };

  const currentProgressPercent = () => {
    switch (parcel.status) {
      case 'pending':
      case 'assigned':
        return 12;
      case 'picked_up':
        return 35;
      case 'in_transit':
        return 65;
      case 'out_for_delivery':
        return 88;
      case 'delivered':
        return 100;
      default:
        return 10;
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden transition-colors">
      {/* Top Consignment Banner */}
      <div className="relative p-6 sm:p-8 bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 text-white overflow-hidden">
        {/* Background decorative grid */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:16px_16px]" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] uppercase tracking-wider font-bold text-blue-400 bg-blue-500/10 px-2.5 py-0.5 rounded-full border border-blue-500/20">
                Logistics Telemetry
              </span>
              <span className="text-[11px] uppercase tracking-wider font-bold text-slate-400 bg-slate-800 px-2.5 py-0.5 rounded-full border border-slate-700">
                {parcel.parcel_type} freight
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                Weight: {parcel.weight_kg} kg
              </span>
            </div>

            <div className="flex items-center gap-3">
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-mono text-white">
                {parcel.tracking_number}
              </h2>
              <button
                onClick={handleCopy}
                title="Copy tracking number"
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-all text-xs flex items-center gap-1"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copied && <span className="text-[10px] text-emerald-400 font-medium">Copied</span>}
              </button>
            </div>

            <p className="text-xs text-slate-400 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-blue-400" />
              Estimated Delivery SLA: <span className="text-white font-medium">{new Date(parcel.estimated_delivery).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <StatusBadge status={parcel.status} size="lg" />
            {onViewInvoice && (
              <button
                onClick={() => onViewInvoice(parcel.id)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/20 text-white border border-white/15 shadow-xs transition-all backdrop-blur-md"
              >
                <FileText className="w-3.5 h-3.5" />
                Shipping Invoice
              </button>
            )}
          </div>
        </div>

        {/* Live Route Progress Bar */}
        <div className="relative mt-8 pt-4 border-t border-white/10">
          <div className="flex justify-between text-[11px] text-slate-400 mb-2">
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3 text-blue-400" />
              Origin Hub
            </span>
            <span className="font-mono text-blue-400 font-bold">{currentProgressPercent()}% Journey Complete</span>
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              Final Destination
            </span>
          </div>

          <div className="relative h-2 w-full bg-slate-800 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${currentProgressPercent()}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="h-full bg-gradient-to-r from-blue-500 to-indigo-400 rounded-full relative"
            >
              <div className="absolute right-0 top-0 bottom-0 w-2 bg-white/80 animate-ping" />
            </motion.div>
          </div>
        </div>
      </div>

      {/* Stepper Dots */}
      <div className="p-6 sm:p-8 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/40">
        <div className="relative flex justify-between items-center max-w-4xl mx-auto">
          {/* Progress bar line between icons */}
          <div className="absolute top-1/2 left-6 right-6 -translate-y-1/2 h-1 bg-slate-200 dark:bg-slate-800 -z-0" />

          {STATUS_STEPS.map((step, idx) => {
            const state = getStepStatus(step.key);
            const StepIcon = step.icon;
            return (
              <div key={step.key} className="relative z-10 flex flex-col items-center">
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${
                    state === 'completed'
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20 ring-4 ring-emerald-100 dark:ring-emerald-950'
                      : state === 'current'
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 ring-4 ring-blue-100 dark:ring-blue-950 animate-pulse'
                      : 'bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-700 text-slate-400'
                  }`}
                >
                  <StepIcon className="w-4 h-4" />
                </motion.div>
                <span
                  className={`mt-2.5 text-xs text-center whitespace-nowrap ${
                    state === 'completed' || state === 'current'
                      ? 'text-slate-900 dark:text-slate-100 font-bold'
                      : 'text-slate-400 dark:text-slate-500 font-medium'
                  }`}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Route & Consignment Specifications Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 sm:p-8 border-b border-slate-100 dark:border-slate-800">
        {/* Origin to Destination Route */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500">
              Freight Manifest
            </h4>
            <span className="text-[11px] font-medium text-blue-600 dark:text-blue-400 flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Priority Logistics
            </span>
          </div>

          <div className="relative pl-6 space-y-5 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
            <div className="relative">
              <span className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-blue-600 ring-4 ring-blue-100 dark:ring-blue-950" />
              <p className="text-xs font-semibold text-slate-400 dark:text-slate-500">Shipper / Origin</p>
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{parcel.pickup_address}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Shipper: {parcel.sender_name || 'Commercial Client'}</p>
            </div>

            <div className="relative">
              <span className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-emerald-600 ring-4 ring-emerald-100 dark:ring-emerald-950" />
              <p className="text-xs font-semibold text-slate-400 dark:text-slate-500">Consignee / Destination</p>
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{parcel.delivery_address}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Recipient: {parcel.recipient_name} ({parcel.recipient_phone})
              </p>
            </div>
          </div>
        </div>

        {/* Technical Specs Card */}
        <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 space-y-3.5">
          <h4 className="text-xs uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500">
            Consignment Parameters
          </h4>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Weight</span>
              <span className="font-bold text-slate-900 dark:text-slate-100 font-mono text-sm">{parcel.weight_kg} kg</span>
            </div>
            <div>
              <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Dimensions</span>
              <span className="font-bold text-slate-900 dark:text-slate-100 font-mono text-sm">{parcel.dimensions || 'Standard'}</span>
            </div>
            <div>
              <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Assigned Agent</span>
              <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                {parcel.assigned_agent_name || 'Depot Dispatching'}
              </span>
            </div>
            <div>
              <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Settlement</span>
              <StatusBadge status={parcel.payment_status} type="payment" size="sm" />
            </div>
          </div>

          {parcel.special_instructions && (
            <div className="pt-3 border-t border-slate-200 dark:border-slate-700/60">
              <span className="text-slate-500 dark:text-slate-400 text-[11px] block font-medium">Handling Instructions:</span>
              <p className="text-xs text-slate-700 dark:text-slate-300 italic mt-0.5">{parcel.special_instructions}</p>
            </div>
          )}
        </div>
      </div>

      {/* Verified Delivery Proof (if available) */}
      {proof && (
        <div className="p-6 sm:p-8 bg-emerald-50/60 dark:bg-emerald-950/20 border-b border-emerald-200 dark:border-emerald-900/40">
          <div className="flex items-center gap-2 mb-4 text-emerald-800 dark:text-emerald-400 font-bold text-sm">
            <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            Verified Electronic Proof of Delivery (e-POD)
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-emerald-200 dark:border-emerald-900/40">
              <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Signee Name</span>
              <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">{proof.recipient_name}</span>
            </div>
            <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-emerald-200 dark:border-emerald-900/40">
              <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Timestamp</span>
              <span className="font-bold text-slate-900 dark:text-slate-100 font-mono text-xs">
                {new Date(proof.delivered_at).toLocaleString()}
              </span>
            </div>
            <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-emerald-200 dark:border-emerald-900/40">
              <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Handover Notes</span>
              <span className="text-slate-700 dark:text-slate-300">{proof.notes || 'Verified handover with ID.'}</span>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-6">
            {proof.signature_url && (
              <div>
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mb-1">
                  Recipient Signature Sign-off:
                </span>
                <div className="bg-white p-2 rounded-xl border border-slate-300 dark:border-slate-700 inline-block shadow-2xs">
                  <img
                    src={proof.signature_url}
                    alt="Recipient Signature"
                    className="h-10 max-w-[200px] object-contain"
                  />
                </div>
              </div>
            )}

            {proof.photo_url && (
              <div>
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mb-1">
                  Delivery Verification Photo:
                </span>
                <a
                  href={proof.photo_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  View GPS & Photo Record
                </a>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Audit Checkpoint Telemetry Feed */}
      <div className="p-6 sm:p-8">
        <h4 className="text-xs uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500 mb-6">
          Carrier Checkpoint Telemetry ({tracking.length} verified logs)
        </h4>

        <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
          {[...tracking].reverse().map((checkpoint, idx) => (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              key={checkpoint.id || idx}
              className="relative group"
            >
              <span
                className={`absolute -left-6 top-1 w-3.5 h-3.5 rounded-full ring-4 ring-white dark:ring-slate-900 transition-all ${
                  idx === 0
                    ? 'bg-blue-600 ring-blue-100 dark:ring-blue-950 scale-110'
                    : 'bg-slate-300 dark:bg-slate-700'
                }`}
              />

              <div className="bg-slate-50/70 dark:bg-slate-800/40 p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800/80 hover:border-blue-300 dark:hover:border-blue-700 transition-all">
                <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900 dark:text-slate-100 capitalize">
                      {checkpoint.status.replace('_', ' ')}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-blue-500" />
                      {checkpoint.location}
                    </span>
                  </div>
                  <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(checkpoint.timestamp).toLocaleString(undefined, {
                      dateStyle: 'short',
                      timeStyle: 'medium',
                    })}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">{checkpoint.description}</p>
                {checkpoint.updated_by && (
                  <p className="text-[11px] text-slate-400 mt-0.5">Operator ID: {checkpoint.updated_by}</p>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};
