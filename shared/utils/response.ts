/**
 * SWIFTRoute - Shared Response Utilities
 * Standardized API response helpers
 */

import { Response } from 'express';
import { ApiResponse } from '../types';
import { HTTP_STATUS, ERROR_CODES } from '../constants';

/**
 * Send a successful response
 */
export function sendSuccess<T>(
  res: Response,
  data: T,
  message?: string,
  status: number = HTTP_STATUS.OK,
  meta?: Record<string, any>
): Response {
  const response: ApiResponse<T> = {
    success: true,
    data,
  };

  if (message) {
    response.message = message;
  }

  if (meta) {
    response.meta = meta;
  }

  return res.status(status).json(response);
}

/**
 * Send an error response
 */
export function sendError(
  res: Response,
  message: string,
  status: number = HTTP_STATUS.BAD_REQUEST,
  code?: string,
  details?: any
): Response {
  const response: ApiResponse = {
    success: false,
    error: {
      message,
      ...(code && { code }),
      ...(details && { details }),
    },
  };

  return res.status(status).json(response);
}

/**
 * Send a validation error response
 */
export function sendValidationError(
  res: Response,
  errors: Record<string, string> | string
): Response {
  return sendError(
    res,
    typeof errors === 'string' ? errors : 'Validation failed',
    HTTP_STATUS.UNPROCESSABLE_ENTITY,
    ERROR_CODES.VALIDATION_ERROR,
    typeof errors === 'object' ? errors : undefined
  );
}

/**
 * Send an authentication error response
 */
export function sendAuthError(
  res: Response,
  message: string = 'Authentication required',
  code: string = ERROR_CODES.TOKEN_INVALID
): Response {
  return sendError(res, message, HTTP_STATUS.UNAUTHORIZED, code);
}

/**
 * Send a forbidden error response
 */
export function sendForbiddenError(
  res: Response,
  message: string = 'Insufficient permissions'
): Response {
  return sendError(res, message, HTTP_STATUS.FORBIDDEN, ERROR_CODES.FORBIDDEN);
}

/**
 * Send a not found error response
 */
export function sendNotFoundError(
  res: Response,
  resource: string = 'Resource',
  code?: string
): Response {
  return sendError(
    res,
    `${resource} not found`,
    HTTP_STATUS.NOT_FOUND,
    code || ERROR_CODES.NOT_FOUND
  );
}

/**
 * Send a conflict error response
 */
export function sendConflictError(
  res: Response,
  message: string,
  code?: string
): Response {
  return sendError(res, message, HTTP_STATUS.CONFLICT, code);
}

/**
 * Send an internal server error response
 */
export function sendInternalError(
  res: Response,
  message: string = 'Internal server error',
  details?: any
): Response {
  return sendError(
    res,
    message,
    HTTP_STATUS.INTERNAL_SERVER_ERROR,
    ERROR_CODES.INTERNAL_ERROR,
    details
  );
}

/**
 * Send a service unavailable error response
 */
export function sendServiceUnavailableError(
  res: Response,
  service: string
): Response {
  return sendError(
    res,
    `${service} is currently unavailable`,
    HTTP_STATUS.SERVICE_UNAVAILABLE,
    ERROR_CODES.SERVICE_UNAVAILABLE
  );
}

/**
 * Send a rate limit error response
 */
export function sendRateLimitError(
  res: Response,
  message: string = 'Too many requests, please try again later'
): Response {
  return sendError(
    res,
    message,
    HTTP_STATUS.TOO_MANY_REQUESTS,
    ERROR_CODES.RATE_LIMITED
  );
}

/**
 * Handle async route errors
 * Wraps async route handlers to catch errors
 */
export function asyncHandler(
  fn: (req: any, res: Response, next: any) => Promise<any>
) {
  return (req: any, res: Response, next: any) => {
    Promise.resolve(fn(req, res, next)).catch((error) => {
      console.error('Async handler error:', error);
      sendInternalError(res, error.message);
    });
  };
}

/**
 * Format pagination metadata
 */
export function paginationMeta(
  total: number,
  page: number = 1,
  limit: number = 10
): Record<string, any> {
  const totalPages = Math.ceil(total / limit);
  return {
    total,
    page,
    limit,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
}
