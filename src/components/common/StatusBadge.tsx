import React from 'react';
import { ParcelStatus, PaymentStatus } from '../../../shared/types';

interface StatusBadgeProps {
  status: ParcelStatus | PaymentStatus;
  type?: 'parcel' | 'payment';
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, type = 'parcel', size = 'md' }) => {
  const sizeClasses = {
    sm: 'text-[11px] px-2.5 py-0.5',
    md: 'text-xs px-3 py-1',
    lg: 'text-sm px-3.5 py-1.5',
  }[size];

  if (type === 'payment') {
    const config: Record<PaymentStatus, { bg: string; text: string; dot: string; label: string; pulse?: boolean }> = {
      paid: {
        bg: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200/80 dark:border-emerald-800/60',
        text: 'text-emerald-700 dark:text-emerald-400 font-semibold',
        dot: 'bg-emerald-500',
        label: 'Paid in Full',
      },
      unpaid: {
        bg: 'bg-amber-50 dark:bg-amber-950/40 border-amber-200/80 dark:border-amber-800/60',
        text: 'text-amber-700 dark:text-amber-400 font-semibold',
        dot: 'bg-amber-500',
        label: 'Pending Settlement',
        pulse: true,
      },
      refunded: {
        bg: 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700',
        text: 'text-slate-700 dark:text-slate-300 font-medium',
        dot: 'bg-slate-400',
        label: 'Refunded',
      },
    };
    const c = config[status as PaymentStatus] || config.unpaid;
    return (
      <span className={`inline-flex items-center gap-1.5 rounded-full border shadow-2xs backdrop-blur-xs transition-colors whitespace-nowrap ${c.bg} ${c.text} ${sizeClasses}`}>
        <span className="relative flex h-2 w-2">
          {c.pulse && (
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
          )}
          <span className={`relative inline-flex rounded-full h-2 w-2 ${c.dot}`} />
        </span>
        {c.label}
      </span>
    );
  }

  const config: Record<
    ParcelStatus,
    { bg: string; text: string; dot: string; label: string; pulse?: boolean }
  > = {
    pending: {
      bg: 'bg-amber-50 dark:bg-amber-950/40 border-amber-200/80 dark:border-amber-800/60',
      text: 'text-amber-700 dark:text-amber-400 font-semibold',
      dot: 'bg-amber-500',
      label: 'Pending Dispatch',
      pulse: false,
    },
    assigned: {
      bg: 'bg-blue-50 dark:bg-blue-950/40 border-blue-200/80 dark:border-blue-800/60',
      text: 'text-blue-700 dark:text-blue-400 font-semibold',
      dot: 'bg-blue-500',
      label: 'Agent Assigned',
      pulse: false,
    },
    picked_up: {
      bg: 'bg-sky-50 dark:bg-sky-950/40 border-sky-200/80 dark:border-sky-800/60',
      text: 'text-sky-700 dark:text-sky-400 font-semibold',
      dot: 'bg-sky-500',
      label: 'Picked Up',
      pulse: true,
    },
    in_transit: {
      bg: 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200/80 dark:border-indigo-800/60',
      text: 'text-indigo-700 dark:text-indigo-400 font-semibold',
      dot: 'bg-indigo-500',
      label: 'In Transit',
      pulse: true,
    },
    out_for_delivery: {
      bg: 'bg-purple-50 dark:bg-purple-950/40 border-purple-200/80 dark:border-purple-800/60',
      text: 'text-purple-700 dark:text-purple-400 font-semibold',
      dot: 'bg-purple-500',
      label: 'Out for Delivery',
      pulse: true,
    },
    delivered: {
      bg: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200/80 dark:border-emerald-800/60',
      text: 'text-emerald-700 dark:text-emerald-400 font-semibold',
      dot: 'bg-emerald-500',
      label: 'Delivered',
      pulse: false,
    },
    failed: {
      bg: 'bg-rose-50 dark:bg-rose-950/40 border-rose-200/80 dark:border-rose-800/60',
      text: 'text-rose-700 dark:text-rose-400 font-semibold',
      dot: 'bg-rose-500',
      label: 'Delivery Exception',
      pulse: true,
    },
    cancelled: {
      bg: 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700',
      text: 'text-slate-600 dark:text-slate-400 font-medium',
      dot: 'bg-slate-400',
      label: 'Cancelled',
      pulse: false,
    },
  };

  const c = config[status as ParcelStatus] || config.pending;

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border shadow-2xs backdrop-blur-xs transition-colors whitespace-nowrap ${c.bg} ${c.text} ${sizeClasses}`}>
      <span className="relative flex h-2 w-2">
        {c.pulse && (
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />
        )}
        <span className={`relative inline-flex rounded-full h-2 w-2 ${c.dot}`} />
      </span>
      {c.label}
    </span>
  );
};
