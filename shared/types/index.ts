/**
 * SWIFTRoute - Shared TypeScript Types
 * Common types used across all microservices
 */

// ============================================================================
// API Response Types
// ============================================================================

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code?: string;
    message: string;
    details?: any;
  };
  message?: string;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    [key: string]: any;
  };
}

// ============================================================================
// User & Authentication Types
// ============================================================================

export type UserRole = 'admin' | 'agent' | 'customer';

export type UserStatus = 'active' | 'suspended' | 'pending_verification' | 'deactivated';

export interface User {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  address?: string;
  avatar_url?: string;
  role: UserRole;
  status: UserStatus;
  created_at: string;
  updated_at: string;
  employee_id?: string; // For agents
  verification_status?: string; // For agents
}

export interface AuthResponseData {
  token: string;
  user: User;
}

export interface JwtPayload {
  id: string;
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    full_name: string;
    role: UserRole;
    customerId?: string;
    agentId?: string;
    roleCode?: string;
  };
}

// ============================================================================
// Parcel & Shipment Types
// ============================================================================

export type ParcelType = 'standard' | 'express' | 'fragile' | 'heavy_freight' | 'document' | 'cold_chain' | 'hazardous_material';

export type ParcelStatus = 
  | 'pending' 
  | 'assigned' 
  | 'picked_up' 
  | 'in_sorting' 
  | 'in_transit' 
  | 'arrived_at_hub' 
  | 'out_for_delivery' 
  | 'delivered' 
  | 'attempted_delivery' 
  | 'failed' 
  | 'returned_to_sender' 
  | 'cancelled' 
  | 'on_hold';

export type PaymentStatus = 'unpaid' | 'partially_paid' | 'paid' | 'refunded' | 'waived';

export type PaymentMethod = 
  | 'credit_card' 
  | 'debit_card' 
  | 'bank_transfer' 
  | 'cash_on_delivery' 
  | 'digital_wallet' 
  | 'stripe' 
  | 'paypal' 
  | 'corporate_account';

export interface Parcel {
  id: string;
  tracking_number: string;
  sender_id: string;
  sender_name: string;
  sender_phone: string;
  sender_email?: string;
  recipient_name: string;
  recipient_phone: string;
  recipient_email?: string;
  pickup_address: string;
  pickup_city?: string;
  pickup_postal_code?: string;
  delivery_address: string;
  delivery_city?: string;
  delivery_postal_code?: string;
  weight_kg: number;
  dimensions?: string;
  parcel_type: ParcelType;
  status: ParcelStatus;
  assigned_agent_id?: string;
  shipping_cost: number;
  payment_status: PaymentStatus;
  payment_terms?: string;
  estimated_delivery: string;
  actual_delivery?: string;
  special_instructions?: string;
  created_at: string;
  updated_at: string;
}

export interface TrackingCheckpoint {
  id: string;
  parcel_id: string;
  status: ParcelStatus;
  location: string;
  description: string;
  timestamp: string;
}

// ============================================================================
// Delivery & Proof Types
// ============================================================================

export interface DeliveryProof {
  id: string;
  parcel_id: string;
  agent_id: string;
  recipient_name: string;
  signature_url?: string;
  photo_url?: string;
  notes?: string;
  delivered_at: string;
}

// ============================================================================
// Payment & Invoice Types
// ============================================================================

export interface Payment {
  id: string;
  payment_reference: string;
  parcel_id: string;
  parcel_tracking?: string;
  amount: number;
  currency: string;
  payment_method: PaymentMethod;
  transaction_id?: string;
  status: string;
  created_at: string;
  processed_at?: string;
}

export interface Invoice {
  id: string;
  invoice_number: string;
  parcel_id: string;
  total_amount: number;
  amount_paid: number;
  balance_due: number;
  status: string;
  issued_date: string;
  due_date: string;
  paid_at?: string;
}

// ============================================================================
// Order Hub Types
// ============================================================================

export type OrderPlatform = 'swiftroute' | 'amazon' | 'ebay' | 'shopify' | 'external';

export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'in_transit' | 'delivered' | 'cancelled' | 'returned';

export interface ExternalOrder {
  id: string;
  platform: OrderPlatform;
  order_number: string;
  customer_name: string;
  tracking_number?: string;
  status: OrderStatus;
  created_at: string;
  updated_at: string;
}

export interface ReturnRequest {
  id: string;
  order_id: string;
  reason: string;
  description?: string;
  preferred_resolution: string;
  status: string;
  created_at: string;
}

export interface DeliveryPreference {
  id: string;
  preference_type: string;
  value: string;
  enabled: boolean;
  created_at: string;
}

// ============================================================================
// Notification Types
// ============================================================================

export type NotificationType = 
  | 'parcel_booked' 
  | 'status_update' 
  | 'out_for_delivery' 
  | 'delivered' 
  | 'delivery_failed' 
  | 'payment_success' 
  | 'invoice_generated' 
  | 'agent_assigned' 
  | 'security_alert' 
  | 'system_announcement';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  is_read: boolean;
  read_at?: string;
  created_at: string;
}

// ============================================================================
// Admin & Dashboard Types
// ============================================================================

export interface DashboardStats {
  totalParcels: number;
  pendingDeliveries: number;
  inTransit: number;
  deliveredToday: number;
  delivered: number;
  failed: number;
  totalRevenue: number;
  activeAgents: number;
  totalCustomers: number;
  totalUsers: number;
  deliverySuccessRate: number;
}

export interface ActivityLog {
  id: string;
  user_id: string;
  action: string;
  entity_type?: string;
  entity_id?: string;
  description: string;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

export interface SystemSettings {
  id: string;
  key: string;
  value: string;
  category: string;
  description?: string;
  updated_at: string;
}

// ============================================================================
// Agent Types
// ============================================================================

export type AgentEmploymentStatus = 'active' | 'on_leave' | 'probation' | 'suspended' | 'terminated';

export interface DeliveryAgent {
  id: string;
  user_id: string;
  employee_code: string;
  employment_status: AgentEmploymentStatus;
  rating: number;
  total_deliveries: number;
  successful_deliveries: number;
  failed_deliveries: number;
  verification_status: string;
  created_at: string;
}

// ============================================================================
// Utility Types
// ============================================================================

export interface PaginationParams {
  page?: number;
  limit?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface FilterParams {
  status?: string;
  search?: string;
  date_from?: string;
  date_to?: string;
  [key: string]: any;
}

// ============================================================================
// Service Communication Types
// ============================================================================

export interface ServiceHealthCheck {
  service: string;
  status: 'ok' | 'degraded' | 'down';
  timestamp: string;
  version?: string;
  dependencies?: Record<string, 'ok' | 'down'>;
}

export interface InterServiceRequest<T = any> {
  requestId?: string;
  timestamp: string;
  service: string;
  data: T;
  metadata?: Record<string, any>;
}

// ============================================================================
// Event Types (for future event-driven architecture)
// ============================================================================

export interface DomainEvent {
  eventId: string;
  eventType: string;
  aggregateId: string;
  aggregateType: string;
  timestamp: string;
  data: any;
  metadata?: {
    userId?: string;
    correlationId?: string;
    causationId?: string;
  };
}

export type ParcelEventType = 
  | 'parcel.created'
  | 'parcel.assigned'
  | 'parcel.picked_up'
  | 'parcel.in_transit'
  | 'parcel.out_for_delivery'
  | 'parcel.delivered'
  | 'parcel.failed'
  | 'parcel.returned';

export type PaymentEventType = 
  | 'payment.initiated'
  | 'payment.authorized'
  | 'payment.completed'
  | 'payment.failed'
  | 'payment.refunded';

export type NotificationEventType = 
  | 'notification.created'
  | 'notification.sent'
  | 'notification.read'
  | 'notification.failed';
