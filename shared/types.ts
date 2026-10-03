export type UserRole = 'customer' | 'agent' | 'admin';

export interface User {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
  phone: string;
  address?: string;
  status: 'active' | 'suspended';
  created_at: string;
  updated_at?: string;

  // Delivery Agent Specific Verification & Employment Fields
  employee_id?: string;
  company_email?: string;
  company_name?: string;
  department?: string;
  vehicle_number?: string;
  id_document_path?: string;
  verification_status?: 'pending_verification' | 'approved' | 'rejected' | 'suspended';
  verification_reviewed_at?: string;
  verification_reviewed_by?: string;
}

export type ParcelStatus = 
  | 'pending'
  | 'assigned'
  | 'picked_up'
  | 'in_transit'
  | 'out_for_delivery'
  | 'delivered'
  | 'failed'
  | 'cancelled';

export type ParcelType = 'standard' | 'express' | 'fragile' | 'heavy' | 'document';

export type PaymentStatus = 'unpaid' | 'paid' | 'refunded';

export type PaymentMethod = 'card' | 'bank_transfer' | 'cash_on_delivery' | 'wallet';

export interface Parcel {
  id: string;
  tracking_number: string;
  sender_id: string;
  sender_name?: string;
  recipient_name: string;
  recipient_phone: string;
  recipient_email?: string;
  pickup_address: string;
  delivery_address: string;
  weight_kg: number;
  dimensions?: string; // e.g. "30x20x15 cm"
  parcel_type: ParcelType;
  status: ParcelStatus;
  assigned_agent_id?: string | null;
  assigned_agent_name?: string | null;
  shipping_cost: number;
  payment_status: PaymentStatus;
  estimated_delivery: string;
  special_instructions?: string;
  created_at: string;
  updated_at: string;
}

export interface TrackingCheckpoint {
  id: string;
  parcel_id: string;
  tracking_number: string;
  status: ParcelStatus;
  location: string;
  description: string;
  updated_by?: string;
  timestamp: string;
}

export interface Payment {
  id: string;
  parcel_id: string;
  user_id: string;
  amount: number;
  payment_method: PaymentMethod;
  transaction_id: string;
  status: 'completed' | 'pending' | 'failed';
  created_at: string;
}

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

export interface ActivityLog {
  id: string;
  user_id?: string;
  user_name?: string;
  user_role?: UserRole;
  action: string;
  entity_type: 'parcel' | 'user' | 'payment' | 'system' | 'delivery_preference' | 'external_order' | 'return_request' | 'customer_notification';
  entity_id?: string;
  details: string;
  created_at: string;
}

export interface SystemSettings {
  company_name: string;
  support_email: string;
  support_phone: string;
  currency: string;
  base_rate_per_kg: number;
  express_surcharge: number;
  fragile_surcharge: number;
  tax_rate_percent: number;
  enable_email_notifications: boolean;
  enable_sms_notifications: boolean;
  maintenance_mode: boolean;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    [key: string]: any;
  };
}

export interface AuthResponseData {
  token: string;
  user: User;
}

export interface DashboardStats {
  totalParcels: number;
  pendingDeliveries: number;
  inTransit: number;
  deliveredToday: number;
  totalRevenue: number;
  activeAgents: number;
  totalCustomers: number;
  deliverySuccessRate: number;
}

// =============================================================================
// UNIVERSAL ORDER HUB TYPES
// =============================================================================

export type ExternalPlatform = 
  | 'amazon' 
  | 'flipkart' 
  | 'myntra' 
  | 'meesho' 
  | 'swiggy' 
  | 'zomato'
  | 'ebay'
  | 'etsy'
  | 'other'
  | 'manual';

export type ExternalAccountStatus = 
  | 'connected' 
  | 'disconnected' 
  | 'expired' 
  | 'error'
  | 'pending_auth';

export type ExternalOrderStatus = 
  | 'ordered'
  | 'packed'
  | 'shipped'
  | 'in_transit'
  | 'out_for_delivery'
  | 'delivered'
  | 'delayed'
  | 'returned'
  | 'cancelled'
  | 'unknown';

export type ReturnStatus = 
  | 'requested'
  | 'approved'
  | 'rejected'
  | 'pickup_assigned'
  | 'picked_up'
  | 'in_transit_to_warehouse'
  | 'received_at_warehouse'
  | 'completed'
  | 'cancelled';

export type ReturnReason = 
  | 'damaged_product'
  | 'wrong_product'
  | 'missing_item'
  | 'product_defect'
  | 'size_issue'
  | 'color_issue'
  | 'changed_mind'
  | 'not_as_described'
  | 'quality_issue'
  | 'other';

export interface ExternalAccount {
  id: string;
  customer_id: string;
  platform: ExternalPlatform;
  platform_user_id?: string;
  platform_user_email?: string;
  platform_user_name?: string;
  status: ExternalAccountStatus;
  last_synced_at?: string;
  sync_enabled: boolean;
  error_message?: string;
  created_at: string;
  updated_at: string;
}

export interface ExternalOrder {
  id: string;
  customer_id: string;
  external_account_id?: string;
  platform: ExternalPlatform;
  platform_order_id: string;
  platform_tracking_number?: string;
  
  // Product Information
  product_name: string;
  product_category?: string;
  product_image_url?: string;
  quantity: number;
  order_amount?: number;
  currency_code: string;
  
  // Order Status & Timeline
  status: ExternalOrderStatus;
  order_date: string;
  expected_delivery_date?: string;
  actual_delivery_date?: string;
  
  // Delivery Information
  courier_name?: string;
  delivery_address: string;
  delivery_city?: string;
  delivery_postal_code?: string;
  recipient_name?: string;
  recipient_phone?: string;
  
  // Location Tracking
  current_location?: string;
  current_latitude?: number;
  current_longitude?: number;
  estimated_time_minutes?: number;
  
  // Metadata
  special_instructions?: string;
  is_imported: boolean;
  last_tracking_update?: string;
  notes?: string;
  
  created_at: string;
  updated_at: string;
}

export interface ExternalOrderTracking {
  id: string;
  external_order_id: string;
  status: ExternalOrderStatus;
  location: string;
  description: string;
  latitude?: number;
  longitude?: number;
  event_timestamp: string;
  created_at: string;
}

export interface ReturnRequest {
  id: string;
  return_number: string;
  customer_id: string;
  parcel_id?: string;
  external_order_id?: string;
  
  // Product & Order Details
  product_name: string;
  order_platform?: ExternalPlatform;
  order_reference?: string;
  
  // Return Information
  reason: ReturnReason;
  reason_description?: string;
  status: ReturnStatus;
  
  // Pickup Details
  pickup_address: string;
  pickup_city?: string;
  pickup_postal_code?: string;
  preferred_pickup_date?: string;
  actual_pickup_date?: string;
  
  // Assignment
  assigned_agent_id?: string;
  assigned_at?: string;
  
  // Proof & Verification
  pickup_proof_url?: string;
  warehouse_received_at?: string;
  refund_amount?: number;
  refund_processed_at?: string;
  
  // Admin Actions
  approved_by_admin_id?: string;
  approved_at?: string;
  rejection_reason?: string;
  
  notes?: string;
  created_at: string;
  updated_at: string;
}

export type DeliveryPreferenceType = 
  | 'call_before_delivery'
  | 'leave_at_doorstep'
  | 'require_otp'
  | 'signature_required'
  | 'no_contact_delivery';

export interface DeliveryPreference {
  id: string;
  customer_id: string;
  preference_type: DeliveryPreferenceType;
  is_enabled: boolean;
  preferred_time_start?: string;
  preferred_time_end?: string;
  special_instructions?: string;
  created_at: string;
  updated_at: string;
}

export interface CustomerNotification {
  id: string;
  customer_id: string;
  title: string;
  message: string;
  type: string;
  priority: 'low' | 'medium' | 'high';
  
  // Related Entities
  parcel_id?: string;
  external_order_id?: string;
  return_request_id?: string;
  
  // Notification State
  is_read: boolean;
  read_at?: string;
  action_url?: string;
  action_label?: string;
  
  // Delivery Channels
  sent_via_email: boolean;
  sent_via_sms: boolean;
  sent_via_push: boolean;
  
  expires_at?: string;
  created_at: string;
}

export interface OrderHubStats {
  total_orders: number;
  in_transit: number;
  out_for_delivery: number;
  delivered: number;
  returns: number;
  attention_required: number;
}
