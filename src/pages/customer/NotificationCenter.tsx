import React, { useState, useEffect } from 'react';
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  Package,
  Truck,
  AlertCircle,
  Info,
  CheckCircle2,
  Clock,
  RotateCcw,
  Eye,
  ExternalLink,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { api } from '../../services/api';
import { AnimatedCounter } from '../../components/common/AnimatedCounter';
import { EmptyState } from '../../components/common/EmptyState';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  priority: 'low' | 'medium' | 'high';
  is_read: boolean;
  action_url?: string;
  action_label?: string;
  created_at: string;
}

export const NotificationCenter: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const res = await api.getNotifications({
        unread_only: filter === 'unread',
      });
      setNotifications(res.data || []);
    } catch (err) {
      console.error('Failed to load notifications', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, [filter]);

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await api.markNotificationAsRead(notificationId);
      setNotifications(
        notifications.map((n) => (n.id === notificationId ? { ...n, is_read: true } : n))
      );
    } catch (err) {
      console.error('Failed to mark notification as read', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await api.markAllNotificationsAsRead();
      setNotifications(notifications.map((n) => ({ ...n, is_read: true })));
    } catch (err) {
      console.error('Failed to mark all as read', err);
    }
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;
  const displayedNotifications = filter === 'unread' ? notifications.filter((n) => !n.is_read) : notifications;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNnoiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLXdpZHRoPSIuNSIgb3BhY2l0eT0iLjEiLz48L2c+PC9zdmc+')] opacity-20"></div>

        <div className="relative z-10">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-black text-white mb-2 flex items-center gap-3">
                <Bell className="w-8 h-8" />
                Notification Center
              </h1>
              <p className="text-purple-100 text-sm max-w-2xl">
                Stay updated with real-time delivery notifications and order updates
              </p>
            </div>

            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white text-xs font-bold border border-white/20 transition-all cursor-pointer"
              >
                <CheckCheck className="w-4 h-4 inline mr-2" />
                Mark All Read
              </button>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4">
              <div className="text-2xl font-black text-white font-mono">
                <AnimatedCounter value={notifications.length} />
              </div>
              <div className="text-xs text-purple-100 mt-1 font-semibold">Total Notifications</div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4">
              <div className="text-2xl font-black text-yellow-300 font-mono">
                <AnimatedCounter value={unreadCount} />
              </div>
              <div className="text-xs text-purple-100 mt-1 font-semibold">Unread</div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4">
              <div className="text-2xl font-black text-green-300 font-mono">
                <AnimatedCounter value={notifications.length - unreadCount} />
              </div>
              <div className="text-xs text-purple-100 mt-1 font-semibold">Read</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-xl text-sm font-bold transition-all cursor-pointer ${
            filter === 'all'
              ? 'bg-purple-600 text-white shadow-lg'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:border-purple-300'
          }`}
        >
          All Notifications
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`px-4 py-2 rounded-xl text-sm font-bold transition-all cursor-pointer ${
            filter === 'unread'
              ? 'bg-purple-600 text-white shadow-lg'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:border-purple-300'
          }`}
        >
          Unread {unreadCount > 0 && `(${unreadCount})`}
        </button>
      </div>

      {/* Notifications List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 h-24 animate-pulse"
            />
          ))}
        </div>
      ) : displayedNotifications.length === 0 ? (
        <EmptyState
          title={filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
          description={
            filter === 'unread'
              ? 'You\'re all caught up! Check back later for updates.'
              : 'You\'ll receive notifications here when there are updates to your orders and deliveries.'
          }
        />
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {displayedNotifications.map((notification, index) => (
              <NotificationCard
                key={notification.id}
                notification={notification}
                index={index}
                onMarkAsRead={handleMarkAsRead}
              />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

// Notification Card Component
const NotificationCard: React.FC<{
  notification: Notification;
  index: number;
  onMarkAsRead: (id: string) => void;
}> = ({ notification, index, onMarkAsRead }) => {
  const getIcon = () => {
    if (notification.type.includes('DELIVERY')) return Truck;
    if (notification.type.includes('ORDER')) return Package;
    if (notification.type.includes('RETURN')) return RotateCcw;
    if (notification.type.includes('PAYMENT')) return CheckCircle2;
    if (notification.priority === 'high') return AlertCircle;
    return Bell;
  };

  const getColorScheme = () => {
    if (notification.priority === 'high') {
      return {
        bg: 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800',
        icon: 'bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400',
      };
    }
    if (notification.priority === 'medium') {
      return {
        bg: 'bg-orange-50 dark:bg-orange-950/40 border-orange-200 dark:border-orange-800',
        icon: 'bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400',
      };
    }
    return {
      bg: 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700',
      icon: 'bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400',
    };
  };

  const Icon = getIcon();
  const colors = getColorScheme();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`bg-white dark:bg-slate-900 rounded-2xl border p-5 transition-all ${
        notification.is_read
          ? 'border-slate-200 dark:border-slate-800'
          : 'border-purple-200 dark:border-purple-800 shadow-lg shadow-purple-100 dark:shadow-purple-950/50'
      } ${!notification.is_read ? 'bg-purple-50/50 dark:bg-purple-950/10' : ''}`}
    >
      <div className="flex gap-4">
        {/* Icon */}
        <div className={`w-12 h-12 rounded-xl ${colors.icon} flex items-center justify-center flex-shrink-0`}>
          <Icon className="w-6 h-6" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4 mb-2">
            <div className="flex-1">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">{notification.title}</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{notification.message}</p>
            </div>

            {/* Unread Indicator */}
            {!notification.is_read && (
              <div className="w-2.5 h-2.5 rounded-full bg-purple-600 flex-shrink-0 mt-1" />
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between gap-4 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Clock className="w-3 h-3" />
              {new Date(notification.created_at).toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </div>

            <div className="flex items-center gap-2">
              {notification.action_url && (
                <button className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer">
                  {notification.action_label || 'View'}
                  <ExternalLink className="w-3 h-3 inline ml-1" />
                </button>
              )}

              {!notification.is_read && (
                <button
                  onClick={() => onMarkAsRead(notification.id)}
                  className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                  title="Mark as read"
                >
                  <Check className="w-4 h-4 text-slate-400 hover:text-green-600" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
