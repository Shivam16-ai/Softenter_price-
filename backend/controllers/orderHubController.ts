import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { sendSuccess, sendError } from '../utils/apiResponse';
import * as orderHubService from '../services/orderHubService';
import * as returnService from '../services/returnService';
import * as notificationService from '../services/notificationService';
import * as deliveryPreferenceService from '../services/deliveryPreferenceService';

// =============================================================================
// EXTERNAL ORDERS / UNIVERSAL ORDER HUB
// =============================================================================

export const createExternalOrderHandler = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user!;
    
    // Ensure user is a customer
    if (user.role !== 'customer') {
      return sendError(res, 'Only customers can add external orders', 403);
    }

    const {
      platform,
      platform_order_id,
      platform_tracking_number,
      product_name,
      product_category,
      product_image_url,
      quantity,
      order_amount,
      currency_code,
      order_date,
      expected_delivery_date,
      courier_name,
      delivery_address,
      delivery_city,
      delivery_postal_code,
      recipient_name,
      recipient_phone,
      special_instructions,
      notes,
    } = req.body;

    if (!platform || !platform_order_id || !product_name || !order_date || !delivery_address) {
      return sendError(res, 'Missing required order fields', 422);
    }

    const order = orderHubService.createExternalOrder(
      {
        customer_id: user.id,
        platform,
        platform_order_id,
        platform_tracking_number,
        product_name,
        product_category,
        product_image_url,
        quantity,
        order_amount,
        currency_code,
        order_date,
        expected_delivery_date,
        courier_name,
        delivery_address,
        delivery_city,
        delivery_postal_code,
        recipient_name,
        recipient_phone,
        special_instructions,
        notes,
      },
      user
    );

    // Create notification
    notificationService.createNotification({
      customer_id: user.id,
      title: '📦 Order Added to Hub',
      message: `${product_name} from ${platform.toUpperCase()} has been added to your order hub.`,
      type: 'ORDER_ADDED',
      priority: 'low',
      external_order_id: order.id,
    });

    return sendSuccess(res, order, 'External order added successfully', 201);
  } catch (err: any) {
    return sendError(res, err.message || 'Failed to add external order', 500);
  }
};

export const getExternalOrdersHandler = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user!;
    const { status, platform, search } = req.query;

    const orders = orderHubService.getExternalOrders({
      customerId: user.id,
      status: status ? String(status) : undefined,
      platform: platform ? String(platform) : undefined,
      search: search ? String(search) : undefined,
    });

    return sendSuccess(res, orders, 'External orders retrieved successfully', 200, {
      total: orders.length,
    });
  } catch (err: any) {
    return sendError(res, err.message || 'Failed to retrieve external orders', 500);
  }
};

export const getExternalOrderByIdHandler = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user!;
    const { id } = req.params;

    const data = orderHubService.getExternalOrderById(id);
    if (!data) {
      return sendError(res, 'Order not found', 404);
    }

    // Authorization check
    if (user.role === 'customer' && data.order.customer_id !== user.id) {
      return sendError(res, 'Unauthorized to view this order', 403);
    }

    return sendSuccess(res, data, 'Order details retrieved successfully');
  } catch (err: any) {
    return sendError(res, err.message || 'Failed to retrieve order', 500);
  }
};

export const updateExternalOrderStatusHandler = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user!;
    const { id } = req.params;
    const { status, location, description } = req.body;

    if (!status) {
      return sendError(res, 'Status is required', 400);
    }

    const updated = orderHubService.updateExternalOrderStatus(
      id,
      status,
      location || 'Location Update',
      description || `Status updated to ${status}`,
      user
    );

    if (!updated) {
      return sendError(res, 'Order not found', 404);
    }

    // Notify customer of status change
    notificationService.notifyOrderStatusChange(
      updated.customer_id,
      updated.id,
      'external',
      updated.platform_order_id,
      status,
      updated.product_name
    );

    return sendSuccess(res, updated, 'Order status updated successfully');
  } catch (err: any) {
    return sendError(res, err.message || 'Failed to update order status', 500);
  }
};

export const deleteExternalOrderHandler = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user!;
    const { id } = req.params;

    if (user.role !== 'customer') {
      return sendError(res, 'Only customers can delete their orders', 403);
    }

    const deleted = orderHubService.deleteExternalOrder(id, user.id, user);

    if (!deleted) {
      return sendError(res, 'Order not found or already deleted', 404);
    }

    return sendSuccess(res, null, 'Order deleted successfully');
  } catch (err: any) {
    return sendError(res, err.message || 'Failed to delete order', 500);
  }
};

export const importTrackingNumberHandler = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user!;
    const { tracking_number, courier } = req.body;

    if (!tracking_number || !courier) {
      return sendError(res, 'Tracking number and courier are required', 422);
    }

    const order = await orderHubService.importOrderByTrackingNumber(
      user.id,
      tracking_number,
      courier,
      user
    );

    return sendSuccess(res, order, 'Tracking number imported successfully', 201);
  } catch (err: any) {
    return sendError(res, err.message || 'Failed to import tracking number', 500);
  }
};

export const getOrderHubStatsHandler = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user!;
    const stats = orderHubService.getOrderHubStats(user.id);
    return sendSuccess(res, stats, 'Order hub stats retrieved successfully');
  } catch (err: any) {
    return sendError(res, err.message || 'Failed to retrieve stats', 500);
  }
};

export const getAllOrdersHandler = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user!;
    const { status, platform, search, sort_by, sort_order } = req.query;

    const orders = orderHubService.getAllCustomerOrders({
      customerId: user.id,
      status: status ? String(status) : undefined,
      platform: platform ? String(platform) : undefined,
      search: search ? String(search) : undefined,
      sortBy: sort_by as any,
      sortOrder: sort_order as any,
    });

    return sendSuccess(res, orders, 'All orders retrieved successfully', 200, {
      total: orders.length,
    });
  } catch (err: any) {
    return sendError(res, err.message || 'Failed to retrieve orders', 500);
  }
};

// =============================================================================
// RETURN REQUESTS
// =============================================================================

export const createReturnRequestHandler = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user!;

    if (user.role !== 'customer') {
      return sendError(res, 'Only customers can create return requests', 403);
    }

    const {
      parcel_id,
      external_order_id,
      product_name,
      order_platform,
      order_reference,
      reason,
      reason_description,
      pickup_address,
      pickup_city,
      pickup_postal_code,
      preferred_pickup_date,
      notes,
    } = req.body;

    if (!product_name || !reason || !pickup_address) {
      return sendError(res, 'Missing required return fields', 422);
    }

    const returnRequest = returnService.createReturnRequest(
      {
        customer_id: user.id,
        parcel_id,
        external_order_id,
        product_name,
        order_platform,
        order_reference,
        reason,
        reason_description,
        pickup_address,
        pickup_city,
        pickup_postal_code,
        preferred_pickup_date,
        notes,
      },
      user
    );

    // Notify customer
    notificationService.createNotification({
      customer_id: user.id,
      title: '🔄 Return Request Created',
      message: `Your return request ${returnRequest.return_number} for ${product_name} has been submitted.`,
      type: 'RETURN_CREATED',
      priority: 'medium',
      return_request_id: returnRequest.id,
      action_url: `/returns/${returnRequest.id}`,
      action_label: 'View Return',
    });

    return sendSuccess(res, returnRequest, 'Return request created successfully', 201);
  } catch (err: any) {
    return sendError(res, err.message || 'Failed to create return request', 500);
  }
};

export const getReturnRequestsHandler = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user!;
    const { status } = req.query;

    const filters: any = { status: status ? String(status) : undefined };

    if (user.role === 'customer') {
      filters.customerId = user.id;
    } else if (user.role === 'agent') {
      filters.agentId = user.id;
    }

    const returns = returnService.getReturnRequests(filters);

    return sendSuccess(res, returns, 'Return requests retrieved successfully', 200, {
      total: returns.length,
    });
  } catch (err: any) {
    return sendError(res, err.message || 'Failed to retrieve return requests', 500);
  }
};

export const getReturnRequestByIdHandler = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user!;
    const { id } = req.params;

    const returnRequest = returnService.getReturnRequestById(id);
    if (!returnRequest) {
      return sendError(res, 'Return request not found', 404);
    }

    // Authorization check
    if (user.role === 'customer' && returnRequest.customer_id !== user.id) {
      return sendError(res, 'Unauthorized to view this return', 403);
    }

    return sendSuccess(res, returnRequest, 'Return request retrieved successfully');
  } catch (err: any) {
    return sendError(res, err.message || 'Failed to retrieve return request', 500);
  }
};

// =============================================================================
// NOTIFICATIONS
// =============================================================================

export const getNotificationsHandler = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user!;
    const { unread_only, limit } = req.query;

    const notifications = notificationService.getCustomerNotifications(user.id, {
      unreadOnly: unread_only === 'true',
      limit: limit ? parseInt(String(limit)) : undefined,
    });

    return sendSuccess(res, notifications, 'Notifications retrieved successfully', 200, {
      total: notifications.length,
    });
  } catch (err: any) {
    return sendError(res, err.message || 'Failed to retrieve notifications', 500);
  }
};

export const markNotificationReadHandler = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user!;
    const { id } = req.params;

    const notification = notificationService.markNotificationAsRead(id, user.id);
    if (!notification) {
      return sendError(res, 'Notification not found', 404);
    }

    return sendSuccess(res, notification, 'Notification marked as read');
  } catch (err: any) {
    return sendError(res, err.message || 'Failed to mark notification as read', 500);
  }
};

export const markAllNotificationsReadHandler = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user!;
    const count = notificationService.markAllNotificationsAsRead(user.id);
    return sendSuccess(res, { count }, `${count} notifications marked as read`);
  } catch (err: any) {
    return sendError(res, err.message || 'Failed to mark notifications as read', 500);
  }
};

export const getUnreadCountHandler = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user!;
    const count = notificationService.getUnreadCount(user.id);
    return sendSuccess(res, { count }, 'Unread count retrieved');
  } catch (err: any) {
    return sendError(res, err.message || 'Failed to get unread count', 500);
  }
};

// =============================================================================
// DELIVERY PREFERENCES
// =============================================================================

export const getDeliveryPreferencesHandler = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user!;
    const preferences = deliveryPreferenceService.getDeliveryPreferences(user.id);
    return sendSuccess(res, preferences, 'Delivery preferences retrieved successfully');
  } catch (err: any) {
    return sendError(res, err.message || 'Failed to retrieve preferences', 500);
  }
};

export const setDeliveryPreferenceHandler = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user!;
    const {
      preference_type,
      is_enabled,
      preferred_time_start,
      preferred_time_end,
      special_instructions,
    } = req.body;

    if (!preference_type || is_enabled === undefined) {
      return sendError(res, 'Preference type and enabled status are required', 422);
    }

    const preference = deliveryPreferenceService.setDeliveryPreference(
      {
        customer_id: user.id,
        preference_type,
        is_enabled,
        preferred_time_start,
        preferred_time_end,
        special_instructions,
      },
      user
    );

    return sendSuccess(res, preference, 'Delivery preference saved successfully');
  } catch (err: any) {
    return sendError(res, err.message || 'Failed to save preference', 500);
  }
};

export const toggleDeliveryPreferenceHandler = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user!;
    const { preference_type } = req.body;

    if (!preference_type) {
      return sendError(res, 'Preference type is required', 422);
    }

    const preference = deliveryPreferenceService.toggleDeliveryPreference(
      user.id,
      preference_type,
      user
    );

    return sendSuccess(res, preference, 'Delivery preference toggled successfully');
  } catch (err: any) {
    return sendError(res, err.message || 'Failed to toggle preference', 500);
  }
};
