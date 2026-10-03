import { db } from '../database/connection';
import { CustomerNotification, User } from '../../shared/types';
import { realtimeService } from './realtimeService';

export interface CreateNotificationDTO {
  customer_id: string;
  title: string;
  message: string;
  type: string;
  priority?: 'low' | 'medium' | 'high';
  parcel_id?: string;
  external_order_id?: string;
  return_request_id?: string;
  action_url?: string;
  action_label?: string;
  expires_at?: string;
}

export const createNotification = (dto: CreateNotificationDTO): CustomerNotification => {
  const notification: CustomerNotification = {
    id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    customer_id: dto.customer_id,
    title: dto.title,
    message: dto.message,
    type: dto.type,
    priority: dto.priority || 'medium',
    parcel_id: dto.parcel_id,
    external_order_id: dto.external_order_id,
    return_request_id: dto.return_request_id,
    is_read: false,
    action_url: dto.action_url,
    action_label: dto.action_label,
    sent_via_email: false,
    sent_via_sms: false,
    sent_via_push: false,
    expires_at: dto.expires_at,
    created_at: new Date().toISOString(),
  };

  db.insert('customer_notifications', notification);
  
  // Send real-time notification to customer
  realtimeService.notifyCustomer(dto.customer_id, 'notification', {
    notification,
    timestamp: new Date().toISOString(),
  });
  
  return notification;
};

export const getCustomerNotifications = (
  customerId: string,
  filters?: {
    unreadOnly?: boolean;
    limit?: number;
  }
): CustomerNotification[] => {
  let notifications = db.getTable('customer_notifications')
    .filter((n: any) => n.customer_id === customerId);

  if (filters?.unreadOnly) {
    notifications = notifications.filter((n: any) => !n.is_read);
  }

  // Filter out expired notifications
  const now = new Date().toISOString();
  notifications = notifications.filter((n: any) => !n.expires_at || n.expires_at > now);

  // Sort by creation date (newest first)
  notifications.sort((a: any, b: any) =>
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  if (filters?.limit) {
    notifications = notifications.slice(0, filters.limit);
  }

  return notifications;
};

export const markNotificationAsRead = (
  notificationId: string,
  customerId: string
): CustomerNotification | null => {
  const notification = db.getTable('customer_notifications')
    .find((n: any) => n.id === notificationId && n.customer_id === customerId);

  if (!notification) return null;

  return db.update('customer_notifications', notificationId, {
    is_read: true,
    read_at: new Date().toISOString(),
  });
};

export const markAllNotificationsAsRead = (customerId: string): number => {
  const notifications = db.getTable('customer_notifications')
    .filter((n: any) => n.customer_id === customerId && !n.is_read);

  let count = 0;
  notifications.forEach((n: any) => {
    const updated = db.update('customer_notifications', n.id, {
      is_read: true,
      read_at: new Date().toISOString(),
    });
    if (updated) count++;
  });

  return count;
};

export const deleteNotification = (
  notificationId: string,
  customerId: string
): boolean => {
  const notification = db.getTable('customer_notifications')
    .find((n: any) => n.id === notificationId && n.customer_id === customerId);

  if (!notification) return false;

  return db.delete('customer_notifications', notificationId);
};

export const getUnreadCount = (customerId: string): number => {
  return db.getTable('customer_notifications')
    .filter((n: any) => n.customer_id === customerId && !n.is_read).length;
};

// Notification Helpers for Common Events

export const notifyOrderStatusChange = (
  customerId: string,
  orderId: string,
  orderType: 'swiftroute' | 'external',
  orderReference: string,
  newStatus: string,
  productName: string
) => {
  const statusMessages: Record<string, { title: string; message: string; priority: 'low' | 'medium' | 'high' }> = {
    shipped: {
      title: '📦 Order Shipped',
      message: `Your order ${orderReference} (${productName}) has been shipped and is on its way!`,
      priority: 'medium',
    },
    in_transit: {
      title: '🚚 Order In Transit',
      message: `Your order ${orderReference} is in transit and will arrive soon.`,
      priority: 'medium',
    },
    out_for_delivery: {
      title: '🛵 Out for Delivery',
      message: `Great news! Your order ${orderReference} is out for delivery today.`,
      priority: 'high',
    },
    delivered: {
      title: '✅ Delivered Successfully',
      message: `Your order ${orderReference} (${productName}) has been delivered successfully!`,
      priority: 'high',
    },
    delayed: {
      title: '⚠️ Delivery Delayed',
      message: `Your order ${orderReference} has been delayed. We apologize for the inconvenience.`,
      priority: 'high',
    },
    failed: {
      title: '❌ Delivery Failed',
      message: `Delivery attempt for ${orderReference} failed. Please check the details.`,
      priority: 'high',
    },
  };

  const config = statusMessages[newStatus] || {
    title: 'Order Status Update',
    message: `Order ${orderReference} status updated to ${newStatus}`,
    priority: 'medium' as const,
  };

  return createNotification({
    customer_id: customerId,
    title: config.title,
    message: config.message,
    type: 'STATUS_UPDATE',
    priority: config.priority,
    ...(orderType === 'swiftroute' ? { parcel_id: orderId } : { external_order_id: orderId }),
    action_url: `/orders/${orderId}`,
    action_label: 'View Details',
  });
};

export const notifyReturnStatusChange = (
  customerId: string,
  returnId: string,
  returnNumber: string,
  newStatus: string,
  productName: string
) => {
  const statusMessages: Record<string, { title: string; message: string }> = {
    approved: {
      title: '✅ Return Approved',
      message: `Your return request ${returnNumber} for ${productName} has been approved.`,
    },
    rejected: {
      title: '❌ Return Rejected',
      message: `Your return request ${returnNumber} for ${productName} has been rejected. Please contact support.`,
    },
    pickup_assigned: {
      title: '🚚 Pickup Scheduled',
      message: `A courier has been assigned to pick up your return ${returnNumber}.`,
    },
    picked_up: {
      title: '📦 Return Picked Up',
      message: `Your return ${returnNumber} has been picked up and is on its way to the warehouse.`,
    },
    completed: {
      title: '✅ Return Completed',
      message: `Your return ${returnNumber} has been completed. Refund will be processed soon.`,
    },
  };

  const config = statusMessages[newStatus] || {
    title: 'Return Status Update',
    message: `Return ${returnNumber} status updated to ${newStatus}`,
  };

  return createNotification({
    customer_id: customerId,
    title: config.title,
    message: config.message,
    type: 'RETURN_UPDATE',
    priority: 'medium',
    return_request_id: returnId,
    action_url: `/returns/${returnId}`,
    action_label: 'View Return',
  });
};
