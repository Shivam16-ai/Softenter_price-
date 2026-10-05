/**
 * SWIFTRoute - Shared Constants
 * Common constants used across all microservices
 */

// ============================================================================
// Service Configuration
// ============================================================================

export const SERVICE_PORTS = {
  MONOLITH: 3000,
  GATEWAY: 4000,
  AUTH: 4001,
  ORDER: 4003,
  SHIPMENT: 4004,
  DELIVERY: 4005,
  PAYMENT: 4006,
  NOTIFICATION: 4007,
  ADMIN: 4008,
} as const;

export const SERVICE_NAMES = {
  MONOLITH: 'monolith',
  GATEWAY: 'api-gateway',
  AUTH: 'auth-service',
  ORDER: 'order-service',
  SHIPMENT: 'shipment-service',
  DELIVERY: 'delivery-service',
  PAYMENT: 'payment-service',
  NOTIFICATION: 'notification-service',
  ADMIN: 'admin-service',
} as const;

// ============================================================================
// User Roles
// ============================================================================

export const USER_ROLES = {
  ADMIN: 'admin',
  AGENT: 'agent',
  CUSTOMER: 'customer',
} as const;

export const PRISMA_ROLE_CODES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  ADMIN: 'ADMIN',
  DISPATCHER: 'DISPATCHER',
  COURIER_AGENT: 'COURIER_AGENT',
  CUSTOMER: 'CUSTOMER',
  HUB_MANAGER: 'HUB_MANAGER',
} as const;

// ============================================================================
// Parcel Constants
// ============================================================================

export const PARCEL_TYPES = {
  STANDARD: 'standard',
  EXPRESS: 'express',
  FRAGILE: 'fragile',
  HEAVY_FREIGHT: 'heavy_freight',
  DOCUMENT: 'document',
  COLD_CHAIN: 'cold_chain',
  HAZARDOUS_MATERIAL: 'hazardous_material',
} as const;

export const PARCEL_STATUSES = {
  PENDING: 'pending',
  ASSIGNED: 'assigned',
  PICKED_UP: 'picked_up',
  IN_SORTING: 'in_sorting',
  IN_TRANSIT: 'in_transit',
  ARRIVED_AT_HUB: 'arrived_at_hub',
  OUT_FOR_DELIVERY: 'out_for_delivery',
  DELIVERED: 'delivered',
  ATTEMPTED_DELIVERY: 'attempted_delivery',
  FAILED: 'failed',
  RETURNED_TO_SENDER: 'returned_to_sender',
  CANCELLED: 'cancelled',
  ON_HOLD: 'on_hold',
} as const;

export const PARCEL_STATUS_FLOW = [
  'pending',
  'assigned',
  'picked_up',
  'in_sorting',
  'in_transit',
  'arrived_at_hub',
  'out_for_delivery',
  'delivered',
] as const;

// ============================================================================
// Payment Constants
// ============================================================================

export const PAYMENT_STATUSES = {
  UNPAID: 'unpaid',
  PARTIALLY_PAID: 'partially_paid',
  PAID: 'paid',
  REFUNDED: 'refunded',
  WAIVED: 'waived',
} as const;

export const PAYMENT_METHODS = {
  CREDIT_CARD: 'credit_card',
  DEBIT_CARD: 'debit_card',
  BANK_TRANSFER: 'bank_transfer',
  CASH_ON_DELIVERY: 'cash_on_delivery',
  DIGITAL_WALLET: 'digital_wallet',
  STRIPE: 'stripe',
  PAYPAL: 'paypal',
  CORPORATE_ACCOUNT: 'corporate_account',
} as const;

// ============================================================================
// Order Constants
// ============================================================================

export const ORDER_PLATFORMS = {
  SWIFTROUTE: 'swiftroute',
  AMAZON: 'amazon',
  EBAY: 'ebay',
  SHOPIFY: 'shopify',
  EXTERNAL: 'external',
} as const;

export const ORDER_STATUSES = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  IN_TRANSIT: 'in_transit',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
  RETURNED: 'returned',
} as const;

// ============================================================================
// Notification Constants
// ============================================================================

export const NOTIFICATION_TYPES = {
  PARCEL_BOOKED: 'parcel_booked',
  STATUS_UPDATE: 'status_update',
  OUT_FOR_DELIVERY: 'out_for_delivery',
  DELIVERED: 'delivered',
  DELIVERY_FAILED: 'delivery_failed',
  PAYMENT_SUCCESS: 'payment_success',
  INVOICE_GENERATED: 'invoice_generated',
  AGENT_ASSIGNED: 'agent_assigned',
  SECURITY_ALERT: 'security_alert',
  SYSTEM_ANNOUNCEMENT: 'system_announcement',
} as const;

export const NOTIFICATION_CHANNELS = {
  IN_APP: 'in_app',
  EMAIL: 'email',
  SMS: 'sms',
  PUSH_DEVICE: 'push_device',
  WEBHOOK: 'webhook',
} as const;

// ============================================================================
// Pricing Constants
// ============================================================================

export const PRICING = {
  BASE_RATE: 8.99,
  PER_KG: 2.5,
  EXPRESS_MULTIPLIER: 1.8,
  FRAGILE_SURCHARGE: 5.0,
  HEAVY_FREIGHT_THRESHOLD_KG: 50,
  HEAVY_FREIGHT_MULTIPLIER: 2.5,
  TAX_RATE: 0.08, // 8%
  INSURANCE_RATE: 0.02, // 2% of declared value
} as const;

// ============================================================================
// Time Constants
// ============================================================================

export const DELIVERY_ESTIMATES = {
  STANDARD_HOURS: 72,
  EXPRESS_HOURS: 24,
  SAME_DAY_HOURS: 6,
  HEAVY_FREIGHT_HOURS: 120,
} as const;

export const JWT_EXPIRY = {
  ACCESS_TOKEN: '7d',
  REFRESH_TOKEN: '30d',
  RESET_PASSWORD: '1h',
  EMAIL_VERIFICATION: '24h',
} as const;

// ============================================================================
// Validation Constants
// ============================================================================

export const VALIDATION = {
  MIN_PASSWORD_LENGTH: 6,
  MAX_PASSWORD_LENGTH: 128,
  MIN_PHONE_LENGTH: 10,
  MAX_PHONE_LENGTH: 15,
  MAX_ADDRESS_LENGTH: 255,
  MAX_NAME_LENGTH: 120,
  MAX_EMAIL_LENGTH: 255,
  MAX_TRACKING_NUMBER_LENGTH: 50,
  MAX_SPECIAL_INSTRUCTIONS: 1000,
  MIN_WEIGHT_KG: 0.1,
  MAX_WEIGHT_KG: 1000,
} as const;

// ============================================================================
// Rate Limiting
// ============================================================================

export const RATE_LIMITS = {
  GLOBAL_WINDOW_MS: 15 * 60 * 1000, // 15 minutes
  GLOBAL_MAX_REQUESTS: 300,
  AUTH_WINDOW_MS: 15 * 60 * 1000, // 15 minutes
  AUTH_MAX_REQUESTS: 30,
  API_WINDOW_MS: 15 * 60 * 1000, // 15 minutes
  API_MAX_REQUESTS: 100,
} as const;

// ============================================================================
// HTTP Status Codes
// ============================================================================

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;

// ============================================================================
// Error Codes
// ============================================================================

export const ERROR_CODES = {
  // Authentication
  TOKEN_MISSING: 'TOKEN_MISSING',
  TOKEN_INVALID: 'TOKEN_INVALID',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  EMAIL_ALREADY_EXISTS: 'EMAIL_ALREADY_EXISTS',
  ACCOUNT_SUSPENDED: 'ACCOUNT_SUSPENDED',
  PENDING_VERIFICATION: 'PENDING_VERIFICATION',
  
  // Authorization
  FORBIDDEN: 'FORBIDDEN',
  INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',
  
  // Validation
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  MISSING_REQUIRED_FIELD: 'MISSING_REQUIRED_FIELD',
  INVALID_INPUT: 'INVALID_INPUT',
  
  // Business Logic
  PARCEL_NOT_FOUND: 'PARCEL_NOT_FOUND',
  ORDER_NOT_FOUND: 'ORDER_NOT_FOUND',
  PAYMENT_NOT_FOUND: 'PAYMENT_NOT_FOUND',
  ALREADY_PAID: 'ALREADY_PAID',
  PAYMENT_FAILED: 'PAYMENT_FAILED',
  DELIVERY_FAILED: 'DELIVERY_FAILED',
  INVALID_STATUS_TRANSITION: 'INVALID_STATUS_TRANSITION',
  
  // System
  DATABASE_ERROR: 'DATABASE_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  RATE_LIMITED: 'RATE_LIMITED',
  GATEWAY_ERROR: 'GATEWAY_ERROR',
} as const;

// ============================================================================
// Company Information
// ============================================================================

export const COMPANY_INFO = {
  NAME: 'SwiftRoute Enterprise Logistics',
  EMAIL: 'support@swiftroute.com',
  PHONE: '+1 (555) 019-2831',
  ADDRESS: 'One Maritime Plaza, Suite 2400, San Francisco, CA 94111',
  TAX_ID: 'US-EIN-88-2910481',
  WEBSITE: 'https://swiftroute.com',
  SUPPORT_EMAIL: 'support@swiftroute.com',
  TECH_EMAIL: 'tech@swiftroute.com',
} as const;

// ============================================================================
// Regex Patterns
// ============================================================================

export const REGEX_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/,
  TRACKING_NUMBER: /^SR-\d{4}CA-[A-Z0-9]{6}$/,
  POSTAL_CODE_US: /^\d{5}(-\d{4})?$/,
  POSTAL_CODE_INTL: /^[A-Z0-9\s-]{3,10}$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{6,}$/,
} as const;

// ============================================================================
// Feature Flags (for gradual rollout)
// ============================================================================

export const FEATURE_FLAGS = {
  ENABLE_GOOGLE_OAUTH: true,
  ENABLE_AI_ASSISTANT: true,
  ENABLE_REALTIME_UPDATES: true,
  ENABLE_SMS_NOTIFICATIONS: false,
  ENABLE_EMAIL_NOTIFICATIONS: true,
  ENABLE_PUSH_NOTIFICATIONS: false,
  ENABLE_PAYMENT_GATEWAY: true,
  ENABLE_RETURNS_MANAGEMENT: true,
  ENABLE_DELIVERY_PREFERENCES: true,
  ENABLE_EXTERNAL_ORDER_IMPORT: true,
} as const;

// ============================================================================
// Logging Levels
// ============================================================================

export const LOG_LEVELS = {
  ERROR: 'error',
  WARN: 'warn',
  INFO: 'info',
  DEBUG: 'debug',
  VERBOSE: 'verbose',
} as const;

// ============================================================================
// Cache TTL (Time To Live in seconds)
// ============================================================================

export const CACHE_TTL = {
  SHORT: 60, // 1 minute
  MEDIUM: 300, // 5 minutes
  LONG: 3600, // 1 hour
  VERY_LONG: 86400, // 24 hours
} as const;

// ============================================================================
// Export All
// ============================================================================

export default {
  SERVICE_PORTS,
  SERVICE_NAMES,
  USER_ROLES,
  PRISMA_ROLE_CODES,
  PARCEL_TYPES,
  PARCEL_STATUSES,
  PARCEL_STATUS_FLOW,
  PAYMENT_STATUSES,
  PAYMENT_METHODS,
  ORDER_PLATFORMS,
  ORDER_STATUSES,
  NOTIFICATION_TYPES,
  NOTIFICATION_CHANNELS,
  PRICING,
  DELIVERY_ESTIMATES,
  JWT_EXPIRY,
  VALIDATION,
  RATE_LIMITS,
  HTTP_STATUS,
  ERROR_CODES,
  COMPANY_INFO,
  REGEX_PATTERNS,
  FEATURE_FLAGS,
  LOG_LEVELS,
  CACHE_TTL,
};
