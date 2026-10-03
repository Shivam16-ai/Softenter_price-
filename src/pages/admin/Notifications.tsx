import React, { useState, useEffect } from 'react';
import { Bell, Check } from 'lucide-react';
import { api } from '../../services/api';

interface Notification {
  id: string;
  title: string;
  message: string;
  category: string;
  is_read: boolean;
  created_at: string;
}

export const AdminNotifications: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const res = await api.getNotifications();
      setNotifications(res.data || []);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await api.markNotificationAsRead(id);
      loadNotifications();
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await api.markAllNotificationsAsRead();
      loadNotifications();
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const filteredNotifications = filter === 'unread' 
    ? notifications.filter(n => !n.is_read)
    : notifications;

  const unreadCount = notifications.filter(n => !n.is_read).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 border-3 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-slate-400">Loading notifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Notifications</h1>
          <p className="text-sm text-slate-400">System alerts and operational updates</p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            className="px-4 py-2 bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg text-sm font-bold transition-colors flex items-center gap-2"
          >
            <Check className="w-4 h-4" />
            Mark All Read
          </button>
        )}
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${
            filter === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-[#0d1117] text-slate-400 border border-white/10 hover:text-white'
          }`}
        >
          All ({notifications.length})
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${
            filter === 'unread'
              ? 'bg-blue-600 text-white'
              : 'bg-[#0d1117] text-slate-400 border border-white/10 hover:text-white'
          }`}
        >
          Unread ({unreadCount})
        </button>
      </div>

      {filteredNotifications.length === 0 ? (
        <div className="bg-[#0d1117] border border-white/10 rounded-xl p-12 text-center">
          <Bell className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-white mb-2">No Notifications</h3>
          <p className="text-sm text-slate-400">You're all caught up!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`bg-[#0d1117] border rounded-xl p-4 hover:border-white/20 transition-colors ${
                notification.is_read ? 'border-white/10' : 'border-blue-500/30 bg-blue-500/5'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                  notification.is_read ? 'bg-slate-800 text-slate-400' : 'bg-blue-500/20 text-blue-400'
                }`}>
                  <Bell className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-bold text-white mb-1">{notification.title}</h3>
                      <p className="text-sm text-slate-300 mb-2">{notification.message}</p>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-slate-800 text-slate-400">
                          {notification.category}
                        </span>
                        <span className="text-xs text-slate-500">
                          {new Date(notification.created_at).toLocaleString()}
                        </span>
                      </div>
                    </div>
                    {!notification.is_read && (
                      <button
                        onClick={() => handleMarkAsRead(notification.id)}
                        className="px-3 py-1 bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg text-xs font-bold transition-colors whitespace-nowrap"
                      >
                        Mark Read
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
