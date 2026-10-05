/**
 * SWIFTRoute - Shared Validation Utilities
 * Common validation helpers
 */

import { REGEX_PATTERNS, VALIDATION } from '../constants';

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  return REGEX_PATTERNS.EMAIL.test(email.trim());
}

/**
 * Validate phone number format
 */
export function isValidPhone(phone: string): boolean {
  return REGEX_PATTERNS.PHONE.test(phone.trim());
}

/**
 * Validate password strength
 */
export function isValidPassword(password: string): boolean {
  if (password.length < VALIDATION.MIN_PASSWORD_LENGTH) {
    return false;
  }
  if (password.length > VALIDATION.MAX_PASSWORD_LENGTH) {
    return false;
  }
  // At least one lowercase, one uppercase, one digit
  return REGEX_PATTERNS.PASSWORD.test(password);
}

/**
 * Validate tracking number format
 */
export function isValidTrackingNumber(trackingNumber: string): boolean {
  return REGEX_PATTERNS.TRACKING_NUMBER.test(trackingNumber.trim());
}

/**
 * Validate postal code (US format)
 */
export function isValidPostalCode(postalCode: string, international: boolean = false): boolean {
  const pattern = international ? REGEX_PATTERNS.POSTAL_CODE_INTL : REGEX_PATTERNS.POSTAL_CODE_US;
  return pattern.test(postalCode.trim());
}

/**
 * Validate weight value
 */
export function isValidWeight(weight: number): boolean {
  return weight >= VALIDATION.MIN_WEIGHT_KG && weight <= VALIDATION.MAX_WEIGHT_KG;
}

/**
 * Sanitize input string (remove potential XSS)
 */
export function sanitizeString(input: string): string {
  return input
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .trim();
}

/**
 * Validate required fields
 */
export function validateRequired(
  data: Record<string, any>,
  requiredFields: string[]
): { valid: boolean; missing: string[] } {
  const missing = requiredFields.filter((field) => {
    const value = data[field];
    return value === undefined || value === null || value === '';
  });

  return {
    valid: missing.length === 0,
    missing,
  };
}

/**
 * Validate enum value
 */
export function isValidEnum<T extends Record<string, string>>(
  value: string,
  enumObj: T
): boolean {
  return Object.values(enumObj).includes(value);
}

/**
 * Validate UUID format
 */
export function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * Validate date string
 */
export function isValidDate(dateString: string): boolean {
  const date = new Date(dateString);
  return !isNaN(date.getTime());
}

/**
 * Validate date range
 */
export function isValidDateRange(startDate: string, endDate: string): boolean {
  if (!isValidDate(startDate) || !isValidDate(endDate)) {
    return false;
  }
  return new Date(startDate) <= new Date(endDate);
}

/**
 * Validate pagination parameters
 */
export function validatePagination(params: {
  page?: string | number;
  limit?: string | number;
}): { page: number; limit: number; valid: boolean } {
  const page = Math.max(1, parseInt(String(params.page || 1), 10));
  const limit = Math.min(100, Math.max(1, parseInt(String(params.limit || 10), 10)));

  return {
    page: isNaN(page) ? 1 : page,
    limit: isNaN(limit) ? 10 : limit,
    valid: !isNaN(page) && !isNaN(limit),
  };
}

/**
 * Create validation error message
 */
export function createValidationError(field: string, message: string): Record<string, string> {
  return { [field]: message };
}

/**
 * Merge validation errors
 */
export function mergeValidationErrors(
  ...errors: Record<string, string>[]
): Record<string, string> {
  return Object.assign({}, ...errors);
}

/**
 * Check if object has validation errors
 */
export function hasValidationErrors(errors: Record<string, string>): boolean {
  return Object.keys(errors).length > 0;
}
