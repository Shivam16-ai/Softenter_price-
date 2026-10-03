import React, { useState, useEffect } from 'react';
import {
  Package,
  MapPin,
  Clock,
  Truck,
  CheckCircle2,
  AlertCircle,
  Calendar,
  User,
  Phone,
  Mail,
  Navigation,
  X,
  ExternalLink,
  Download,
  RotateCcw,
  MessageCircle,
  Copy,
  Check,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { StatusBadge } from '../../components/common/StatusBadge';

interface OrderDetailsViewProps {
  order: any;
  tracking: any[];
  onClose: () => void;
  onRequestReturn?: (orderId: string) => void;
  getPlatformConfig: (platform: string) => { name: string; color: string; logo: string };
}

export const OrderDetailsView: React.FC<OrderDetailsViewProps> = ({
  order,
  tracking,
  onClose,
  onRequestReturn,
  getPlatformConfig,
}) => {
  const [activeTab, setActiveTab] = useState<'timeline' | 'details' | 'live'>('timeline');
  const [copied, setCopied] = useState(false);

  const platform = getPlatformConfig(order.platform);

  const copyTrackingNumber = () => {
    const trackingNum = order.platform_tracking_number || order.tracking_number || order.platform_order_id;
    navigator.clipboard.writeText(trackingNum);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const calculateETA = () => {
    if (order.estimated_time_minutes) {
      return `${order.estimated_time_minutes} min`;
    }
    if (order.expected_delivery_date) {
      const eta = new Date(order.expected_delivery_date);
      const now = new Date();
      const diffMs = eta.getTime() - now.getTime();
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffHours / 24);

      if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? 's' : ''}`;
      if (diffHours > 0) return `${diffHours} hour${diffHours > 1 ? 's' : ''}`;
      return 'Soon';
    }
    return 'ETA unavailable';
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="relative bg-gradient-to-br from-slate-900 to-slate-800 p-6 border-b border-slate-700">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-5 h-5 text-white" />
            </button>

            <div className="flex items-start gap-4">
              <div className={`w-14 h-14 rounded-2xl ${platform.color} flex items-center justify-center text-white text-2xl shadow-lg`}>
                {platform.logo}
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-2xl font-black text-white">
                    {order.product_name || `Parcel to ${order.recipient_name}`}
                  </h2>
                  <StatusBadge status={order.status} />
                </div>

                <div className="flex flex-wrap items-center gap-4 text-sm text-slate-300">
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4" />
                    <span className="font-mono font-bold">
                      {order.platform_tracking_number || order.tracking_number || order.platform_order_id}
                    </span>
                    <button
                      onClick={copyTrackingNumber}
                      className="p-1 hover:bg-white/10 rounded transition-colors cursor-pointer"
                    >
                      {copied ? (
                        <Check className="w-3 h-3 text-green-400" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>Ordered {formatDate(order.order_date || order.created_at)}</span>
                  </div>

                  {order.courier_name && (
                    <div className="flex items-center gap-2">
                      <Truck className="w-4 h-4" />
                      <span>{order.courier_name}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* ETA Banner */}
            {['in_transit', 'out_for_delivery'].includes(order.status) && (
              <div className="mt-4 bg-blue-600/20 border border-blue-500/50 backdrop-blur-sm rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs text-blue-200 font-semibold mb-1">Estimated Arrival</div>
                    <div className="text-2xl font-black text-white">{calculateETA()}</div>
                  </div>
                  {order.current_location && (
                    <div className="text-right">
                      <div className="text-xs text-blue-200 font-semibold mb-1">Current Location</div>
                      <div className="text-sm font-bold text-white">{order.current_location}</div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Tabs */}
          <div className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
            <div className="flex gap-1 p-2">
              {[
                { id: 'timeline', label: 'Delivery Timeline', icon: Clock },
                { id: 'details', label: 'Order Details', icon: Package },
                { id: 'live', label: 'Live Tracking', icon: MapPin },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                    activeTab === tab.id
                      ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="overflow-y-auto max-h-[calc(90vh-320px)] p-6">
            {activeTab === 'timeline' && (
              <DeliveryTimeline tracking={tracking} currentStatus={order.status} />
            )}

            {activeTab === 'details' && (
              <OrderDetailsTab order={order} platform={platform} />
            )}

            {activeTab === 'live' && (
              <LiveTrackingTab order={order} />
            )}
          </div>

          {/* Footer Actions */}
          <div className="border-t border-slate-200 dark:border-slate-800 p-4 bg-slate-50 dark:bg-slate-900/50 flex items-center justify-between">
            <div className="flex gap-2">
              {order.status === 'delivered' && onRequestReturn && (
                <button
                  onClick={() => onRequestReturn(order.id)}
                  className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-sm font-bold transition-colors cursor-pointer flex items-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  Request Return
                </button>
              )}
              <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold transition-colors cursor-pointer flex items-center gap-2">
                <MessageCircle className="w-4 h-4" />
                Contact Support
              </button>
            </div>

            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-bold transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// Delivery Timeline Component
const DeliveryTimeline: React.FC<{ tracking: any[]; currentStatus: string }> = ({ tracking, currentStatus }) => {
  const statusIcons: Record<string, any> = {
    ordered: Package,
    packed: Package,
    shipped: Truck,
    in_transit: Truck,
    out_for_delivery: Navigation,
    delivered: CheckCircle2,
    delayed: AlertCircle,
    failed: AlertCircle,
  };

  const statusColors: Record<string, string> = {
    ordered: 'bg-blue-600',
    packed: 'bg-indigo-600',
    shipped: 'bg-purple-600',
    in_transit: 'bg-yellow-600',
    out_for_delivery: 'bg-orange-600',
    delivered: 'bg-green-600',
    delayed: 'bg-red-600',
    failed: 'bg-red-700',
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Delivery Progress</h3>

      <div className="relative">
        {tracking.length === 0 ? (
          <div className="text-center py-12">
            <Clock className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <p className="text-sm text-slate-500 dark:text-slate-400">No tracking information available yet</p>
          </div>
        ) : (
          <div className="space-y-6">
            {tracking.map((event, index) => {
              const Icon = statusIcons[event.status] || Package;
              const isLatest = index === tracking.length - 1;

              return (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="relative flex gap-4"
                >
                  {/* Timeline line */}
                  {index < tracking.length - 1 && (
                    <div className="absolute left-[19px] top-10 w-0.5 h-full bg-slate-200 dark:bg-slate-800" />
                  )}

                  {/* Icon */}
                  <div
                    className={`w-10 h-10 rounded-full ${
                      statusColors[event.status] || 'bg-slate-600'
                    } flex items-center justify-center flex-shrink-0 relative z-10 ${
                      isLatest ? 'ring-4 ring-blue-100 dark:ring-blue-950' : ''
                    }`}
                  >
                    <Icon className="w-5 h-5 text-white" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 pb-8">
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 shadow-sm">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                            {event.status.replace(/_/g, ' ').toUpperCase()}
                          </h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            {event.location}
                          </p>
                        </div>
                        <span className="text-xs text-slate-400 dark:text-slate-500">
                          {new Date(event.event_timestamp || event.timestamp).toLocaleString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-300">{event.description}</p>
                      {event.updated_by && (
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">
                          Updated by: {event.updated_by}
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

// Order Details Tab
const OrderDetailsTab: React.FC<{ order: any; platform: any }> = ({ order, platform }) => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Order Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InfoCard label="Platform" value={platform.name} icon={<span className="text-xl">{platform.logo}</span>} />
          <InfoCard label="Order ID" value={order.platform_order_id || 'N/A'} icon={<Package className="w-5 h-5" />} />
          {order.order_amount && (
            <InfoCard
              label="Order Amount"
              value={`${order.currency_code || 'USD'} ${order.order_amount.toFixed(2)}`}
              icon={<span className="text-xl">💰</span>}
            />
          )}
          {order.quantity && (
            <InfoCard label="Quantity" value={`${order.quantity} item${order.quantity > 1 ? 's' : ''}`} icon={<Package className="w-5 h-5" />} />
          )}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Delivery Information</h3>
        <div className="space-y-3">
          <InfoCard
            label="Delivery Address"
            value={order.delivery_address}
            icon={<MapPin className="w-5 h-5" />}
            fullWidth
          />
          {order.recipient_name && (
            <InfoCard label="Recipient" value={order.recipient_name} icon={<User className="w-5 h-5" />} />
          )}
          {order.recipient_phone && (
            <InfoCard label="Phone" value={order.recipient_phone} icon={<Phone className="w-5 h-5" />} />
          )}
          {order.special_instructions && (
            <InfoCard
              label="Delivery Instructions"
              value={order.special_instructions}
              icon={<MessageCircle className="w-5 h-5" />}
              fullWidth
            />
          )}
        </div>
      </div>

      {order.notes && (
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Notes</h3>
          <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
            <p className="text-sm text-slate-700 dark:text-slate-300">{order.notes}</p>
          </div>
        </div>
      )}
    </div>
  );
};

// Live Tracking Tab
const LiveTrackingTab: React.FC<{ order: any }> = ({ order }) => {
  const hasLiveTracking = order.current_latitude && order.current_longitude;

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Live GPS Tracking</h3>

      {hasLiveTracking ? (
        <div className="space-y-4">
          <div className="bg-slate-100 dark:bg-slate-800 rounded-2xl p-6 aspect-video flex items-center justify-center border-2 border-dashed border-slate-300 dark:border-slate-700">
            <div className="text-center">
              <MapPin className="w-12 h-12 text-blue-600 dark:text-blue-400 mx-auto mb-3" />
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Map View</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Lat: {order.current_latitude?.toFixed(6)}, Lng: {order.current_longitude?.toFixed(6)}
              </p>
            </div>
          </div>

          {order.current_location && (
            <InfoCard
              label="Current Location"
              value={order.current_location}
              icon={<Navigation className="w-5 h-5" />}
              fullWidth
            />
          )}

          {order.estimated_time_minutes && (
            <InfoCard
              label="Estimated Arrival"
              value={`${order.estimated_time_minutes} minutes`}
              icon={<Clock className="w-5 h-5" />}
            />
          )}
        </div>
      ) : (
        <div className="text-center py-12">
          <MapPin className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
          <h4 className="text-lg font-bold text-slate-700 dark:text-slate-300 mb-2">Live Tracking Unavailable</h4>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            Real-time GPS tracking is not available for this shipment. Check the delivery timeline for the latest updates.
          </p>
        </div>
      )}
    </div>
  );
};

// Info Card Component
const InfoCard: React.FC<{
  label: string;
  value: string;
  icon: React.ReactNode;
  fullWidth?: boolean;
}> = ({ label, value, icon, fullWidth }) => {
  return (
    <div
      className={`bg-slate-50 dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 ${
        fullWidth ? 'col-span-full' : ''
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center flex-shrink-0">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">{label}</div>
          <div className="text-sm font-semibold text-slate-900 dark:text-white break-words">{value}</div>
        </div>
      </div>
    </div>
  );
};
