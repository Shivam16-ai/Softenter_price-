import React, { useState } from 'react';
import { Bell, CheckCheck, Truck, Package, DollarSign, Clock, ShieldCheck, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'parcel' | 'payment' | 'agent' | 'system';
  unread: boolean;
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'n1',
    title: 'Out for Delivery',
    message: 'Consignment SR-2026CA-892104 loaded onto courier van for Palo Alto.',
    time: '8 mins ago',
    type: 'parcel',
    unread: true,
  },
  {
    id: 'n2',
    title: 'Payment Confirmed',
    message: 'Settlement of ₹44.75 successfully verified via Credit Card.',
    time: '24 mins ago',
    type: 'payment',
    unread: true,
  },
  {
    id: 'n3',
    title: 'Driver Checkpoint',
    message: 'Marcus Vance scanned parcel at Bay Area Distribution Facility.',
    time: '1 hour ago',
    type: 'agent',
    unread: false,
  },
  {
    id: 'n4',
    title: 'Proof Verified',
    message: 'Shipment SR-2026TX-654321 signed off with verified photo proof.',
    time: '2 hours ago',
    type: 'system',
    unread: false,
  },
];

export const NotificationPopover: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);

  const unreadCount = notifications.filter((n) => n.unread).length;

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  const removeNotification = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const getIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'parcel':
        return <Truck className="w-4 h-4 text-blue-500" />;
      case 'payment':
        return <DollarSign className="w-4 h-4 text-emerald-500" />;
      case 'agent':
        return <Package className="w-4 h-4 text-indigo-500" />;
      case 'system':
        return <ShieldCheck className="w-4 h-4 text-purple-500" />;
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800/80 backdrop-blur-md shadow-xs transition-all cursor-pointer"
        aria-label="Notifications"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-blue-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.96 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl z-50 overflow-hidden"
            >
              {/* Header */}
              <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100">Live Logistics Alerts</span>
                  {unreadCount > 0 && (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 font-medium"
                  >
                    <CheckCheck className="w-3 h-3" />
                    Mark read
                  </button>
                )}
              </div>

              {/* List */}
              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                {notifications.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-400">
                    No active notifications
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`p-3.5 flex items-start gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer relative ${
                        n.unread ? 'bg-blue-50/30 dark:bg-blue-950/20' : ''
                      }`}
                    >
                      <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 mt-0.5">
                        {getIcon(n.type)}
                      </div>
                      <div className="flex-1 min-w-0 pr-4">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">{n.title}</h4>
                          <span className="text-[10px] text-slate-400 flex items-center gap-0.5">
                            <Clock className="w-2.5 h-2.5" />
                            {n.time}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5 line-clamp-2 leading-relaxed">
                          {n.message}
                        </p>
                      </div>
                      <button
                        onClick={(e) => removeNotification(n.id, e)}
                        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
                        title="Dismiss"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* Footer */}
              <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-200 dark:border-slate-800 text-center">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                  • Automated Fleet Telemetry Enabled •
                </span>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
