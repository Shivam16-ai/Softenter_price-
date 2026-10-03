import { 
  User, 
  Parcel, 
  TrackingCheckpoint, 
  Payment, 
  DeliveryProof, 
  ActivityLog, 
  SystemSettings, 
  DashboardStats,
  ApiResponse,
  AuthResponseData,
  PaymentMethod
} from '../../shared/types';

const BASE_URL = '/api';

const getHeaders = (isJson: boolean = true) => {
  const headers: Record<string, string> = {};
  if (isJson) headers['Content-Type'] = 'application/json';
  const token = localStorage.getItem('swiftroute_token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

async function handleResponse<T>(res: Response): Promise<ApiResponse<T>> {
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || data.message || `Request failed with status ${res.status}`);
  }
  return data;
}

export const api = {
  // Auth
  login: async (credentials: { email: string; password: string; portalType?: 'customer' | 'agent' }) => {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ 
        identifier: credentials.email, 
        password: credentials.password,
        portalType: credentials.portalType 
      }),
    });
    return handleResponse<AuthResponseData>(res);
  },

  registerAgent: async (agentData: any) => {
    const res = await fetch(`${BASE_URL}/auth/register-agent`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(agentData),
    });
    return handleResponse<{ user: User }>(res);
  },

  register: async (userData: any) => {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(userData),
    });
    return handleResponse<AuthResponseData>(res);
  },

  resetPassword: async (data: { email: string; new_password: string }) => {
    const res = await fetch(`${BASE_URL}/auth/reset-password`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<AuthResponseData>(res);
  },

  getCurrentUser: async () => {
    const res = await fetch(`${BASE_URL}/auth/me`, {
      headers: getHeaders(),
    });
    return handleResponse<User>(res);
  },

  updateProfile: async (profileData: Partial<User> & { password?: string }) => {
    const res = await fetch(`${BASE_URL}/auth/profile`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(profileData),
    });
    return handleResponse<User>(res);
  },

  // Public Tracking
  trackParcel: async (trackingNumber: string) => {
    const res = await fetch(`${BASE_URL}/tracking/${encodeURIComponent(trackingNumber)}`);
    return handleResponse<{ parcel: Parcel; tracking: TrackingCheckpoint[]; proof?: DeliveryProof }>(res);
  },

  // Parcels
  getParcels: async (params?: { status?: string; search?: string }) => {
    const query = new URLSearchParams();
    if (params?.status && params.status !== 'all') query.set('status', params.status);
    if (params?.search) query.set('search', params.search);

    const res = await fetch(`${BASE_URL}/parcels?${query.toString()}`, {
      headers: getHeaders(),
    });
    return handleResponse<Parcel[]>(res);
  },

  getParcelById: async (id: string) => {
    const res = await fetch(`${BASE_URL}/parcels/${id}`, {
      headers: getHeaders(),
    });
    return handleResponse<{ parcel: Parcel; tracking: TrackingCheckpoint[]; proof?: DeliveryProof }>(res);
  },

  bookParcel: async (parcelData: any) => {
    const res = await fetch(`${BASE_URL}/parcels`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(parcelData),
    });
    return handleResponse<Parcel>(res);
  },

  updateParcelStatus: async (id: string, statusData: { status: string; location?: string; description?: string }) => {
    const res = await fetch(`${BASE_URL}/parcels/${id}/status`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(statusData),
    });
    return handleResponse<Parcel>(res);
  },

  assignAgent: async (parcelId: string, agentId: string) => {
    const res = await fetch(`${BASE_URL}/parcels/${parcelId}/assign`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ agent_id: agentId }),
    });
    return handleResponse<Parcel>(res);
  },

  submitDeliveryProof: async (parcelId: string, proofData: {
    recipient_name: string;
    signature_url?: string;
    photo_url?: string;
    notes?: string;
  }) => {
    const res = await fetch(`${BASE_URL}/parcels/${parcelId}/proof`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(proofData),
    });
    return handleResponse<DeliveryProof>(res);
  },

  // Payments & Invoices
  checkoutPayment: async (parcelId: string, paymentMethod: PaymentMethod) => {
    const res = await fetch(`${BASE_URL}/payments/checkout`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ parcel_id: parcelId, payment_method: paymentMethod }),
    });
    return handleResponse<{ payment: Payment; parcel: Parcel }>(res);
  },

  getPaymentHistory: async () => {
    const res = await fetch(`${BASE_URL}/payments/history`, {
      headers: getHeaders(),
    });
    return handleResponse<Payment[]>(res);
  },

  getInvoice: async (parcelId: string) => {
    const res = await fetch(`${BASE_URL}/payments/invoice/${parcelId}`, {
      headers: getHeaders(),
    });
    return handleResponse<any>(res);
  },

  // Admin
  getAdminStats: async () => {
    const res = await fetch(`${BASE_URL}/admin/stats`, {
      headers: getHeaders(),
    });
    return handleResponse<DashboardStats>(res);
  },

  getAdminReports: async () => {
    const res = await fetch(`${BASE_URL}/admin/reports`, {
      headers: getHeaders(),
    });
    return handleResponse<{ monthlyDeliveries: any[]; revenueReports: any }>(res);
  },

  getAdminUsers: async (role?: string) => {
    const query = role && role !== 'all' ? `?role=${role}` : '';
    const res = await fetch(`${BASE_URL}/admin/users${query}`, {
      headers: getHeaders(),
    });
    return handleResponse<User[]>(res);
  },

  createAgent: async (agentData: any) => {
    const res = await fetch(`${BASE_URL}/admin/agents`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(agentData),
    });
    return handleResponse<User>(res);
  },

  updateUserStatus: async (userId: string, status: 'active' | 'suspended') => {
    const res = await fetch(`${BASE_URL}/admin/users/${userId}/status`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ status }),
    });
    return handleResponse<User>(res);
  },

  updateAgentVerification: async (agentId: string, status: 'approved' | 'rejected') => {
    const res = await fetch(`${BASE_URL}/admin/agents/${agentId}/verification`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ status }),
    });
    return handleResponse<User>(res);
  },

  getActivityLogs: async () => {
    const res = await fetch(`${BASE_URL}/admin/activity-logs`, {
      headers: getHeaders(),
    });
    return handleResponse<ActivityLog[]>(res);
  },

  getSettings: async () => {
    const res = await fetch(`${BASE_URL}/admin/settings`, {
      headers: getHeaders(),
    });
    return handleResponse<SystemSettings>(res);
  },

  updateSettings: async (settingsData: Partial<SystemSettings>) => {
    const res = await fetch(`${BASE_URL}/admin/settings`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(settingsData),
    });
    return handleResponse<SystemSettings>(res);
  },

  // AI Voice Assistant
  assistantChat: async (payload: { message: string; context?: any; history?: any[] }) => {
    const res = await fetch(`${BASE_URL}/assistant/chat`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse<{
      reply: string;
      action?: { type: string; payload?: any };
      suggestions?: string[];
      trackingData?: any;
      detectedIntent?: string;
    }>(res);
  },

  getAssistantSuggestions: async (params: { currentView?: string; userRole?: string; activeTab?: string }) => {
    const q = new URLSearchParams(params as any).toString();
    const res = await fetch(`${BASE_URL}/assistant/suggestions?${q}`, {
      headers: getHeaders(),
    });
    return handleResponse<{ suggestions: string[] }>(res);
  },

  // =============================================================================
  // ORDER HUB - UNIVERSAL ORDER MANAGEMENT
  // =============================================================================

  // Order Hub Stats
  getOrderHubStats: async () => {
    const res = await fetch(`${BASE_URL}/order-hub/stats`, {
      headers: getHeaders(),
    });
    return handleResponse<any>(res);
  },

  // Get all orders (SwiftRoute + External combined)
  getAllOrders: async (params?: { status?: string; platform?: string; search?: string; sort_by?: string; sort_order?: string }) => {
    const query = new URLSearchParams();
    if (params?.status && params.status !== 'all') query.set('status', params.status);
    if (params?.platform && params.platform !== 'all') query.set('platform', params.platform);
    if (params?.search) query.set('search', params.search);
    if (params?.sort_by) query.set('sort_by', params.sort_by);
    if (params?.sort_order) query.set('sort_order', params.sort_order);

    const res = await fetch(`${BASE_URL}/order-hub/orders/all?${query.toString()}`, {
      headers: getHeaders(),
    });
    return handleResponse<any[]>(res);
  },

  // External Orders
  getExternalOrders: async (params?: { status?: string; platform?: string; search?: string }) => {
    const query = new URLSearchParams();
    if (params?.status && params.status !== 'all') query.set('status', params.status);
    if (params?.platform && params.platform !== 'all') query.set('platform', params.platform);
    if (params?.search) query.set('search', params.search);

    const res = await fetch(`${BASE_URL}/order-hub/orders?${query.toString()}`, {
      headers: getHeaders(),
    });
    return handleResponse<any[]>(res);
  },

  createExternalOrder: async (orderData: any) => {
    const res = await fetch(`${BASE_URL}/order-hub/orders`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(orderData),
    });
    return handleResponse<any>(res);
  },

  importTrackingNumber: async (trackingNumber: string, courier: string) => {
    const res = await fetch(`${BASE_URL}/order-hub/orders/import-tracking`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ tracking_number: trackingNumber, courier }),
    });
    return handleResponse<any>(res);
  },

  getExternalOrderById: async (id: string) => {
    const res = await fetch(`${BASE_URL}/order-hub/orders/${id}`, {
      headers: getHeaders(),
    });
    return handleResponse<{ order: any; tracking: any[] }>(res);
  },

  updateExternalOrderStatus: async (id: string, statusData: { status: string; location?: string; description?: string }) => {
    const res = await fetch(`${BASE_URL}/order-hub/orders/${id}/status`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(statusData),
    });
    return handleResponse<any>(res);
  },

  deleteExternalOrder: async (id: string) => {
    const res = await fetch(`${BASE_URL}/order-hub/orders/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse<any>(res);
  },

  // Returns
  getReturnRequests: async (params?: { status?: string }) => {
    const query = new URLSearchParams();
    if (params?.status && params.status !== 'all') query.set('status', params.status);

    const res = await fetch(`${BASE_URL}/order-hub/returns?${query.toString()}`, {
      headers: getHeaders(),
    });
    return handleResponse<any[]>(res);
  },

  createReturnRequest: async (returnData: any) => {
    const res = await fetch(`${BASE_URL}/order-hub/returns`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(returnData),
    });
    return handleResponse<any>(res);
  },

  getReturnRequestById: async (id: string) => {
    const res = await fetch(`${BASE_URL}/order-hub/returns/${id}`, {
      headers: getHeaders(),
    });
    return handleResponse<any>(res);
  },

  // Notifications
  getNotifications: async (params?: { unread_only?: boolean; limit?: number }) => {
    const query = new URLSearchParams();
    if (params?.unread_only) query.set('unread_only', 'true');
    if (params?.limit) query.set('limit', String(params.limit));

    const res = await fetch(`${BASE_URL}/order-hub/notifications?${query.toString()}`, {
      headers: getHeaders(),
    });
    return handleResponse<any[]>(res);
  },

  getUnreadNotificationCount: async () => {
    const res = await fetch(`${BASE_URL}/order-hub/notifications/unread/count`, {
      headers: getHeaders(),
    });
    return handleResponse<{ count: number }>(res);
  },

  markNotificationAsRead: async (id: string) => {
    const res = await fetch(`${BASE_URL}/order-hub/notifications/${id}/read`, {
      method: 'PATCH',
      headers: getHeaders(),
    });
    return handleResponse<any>(res);
  },

  markAllNotificationsAsRead: async () => {
    const res = await fetch(`${BASE_URL}/order-hub/notifications/read-all`, {
      method: 'POST',
      headers: getHeaders(),
    });
    return handleResponse<{ count: number }>(res);
  },

  // Delivery Preferences
  getDeliveryPreferences: async () => {
    const res = await fetch(`${BASE_URL}/order-hub/preferences`, {
      headers: getHeaders(),
    });
    return handleResponse<any[]>(res);
  },

  setDeliveryPreference: async (preferenceData: any) => {
    const res = await fetch(`${BASE_URL}/order-hub/preferences`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(preferenceData),
    });
    return handleResponse<any>(res);
  },

  toggleDeliveryPreference: async (preferenceType: string) => {
    const res = await fetch(`${BASE_URL}/order-hub/preferences/toggle`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ preference_type: preferenceType }),
    });
    return handleResponse<any>(res);
  },

  // Real-time updates
  /**
   * Establish SSE connection for real-time updates
   * Returns EventSource that emits events
   */
  connectRealtime: () => {
    const token = localStorage.getItem('swiftroute_token');
    const eventSource = new EventSource(`${BASE_URL}/realtime/stream?token=${token}`);
    return eventSource;
  },

  getRealtimeStatus: async () => {
    const res = await fetch(`${BASE_URL}/realtime/status`, {
      headers: getHeaders(),
    });
    return handleResponse<any>(res);
  },

  sendTestNotification: async () => {
    const res = await fetch(`${BASE_URL}/realtime/test`, {
      method: 'POST',
      headers: getHeaders(),
    });
    return handleResponse<any>(res);
  },
};
