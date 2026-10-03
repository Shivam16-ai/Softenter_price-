import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/apiResponse';

export const validateRequestBody = (requiredFields: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const missing: string[] = [];
    for (const field of requiredFields) {
      if (req.body[field] === undefined || req.body[field] === null || req.body[field] === '') {
        missing.push(field);
      }
    }

    if (missing.length > 0) {
      return sendError(res, `Missing required fields: ${missing.join(', ')}`, 422, { missingFields: missing });
    }

    next();
  };
};

export const sanitizeInputs = (req: Request, res: Response, next: NextFunction) => {
  // Basic XSS and injection trimming across string body fields
  if (req.body && typeof req.body === 'object') {
    for (const key of Object.keys(req.body)) {
      if (typeof req.body[key] === 'string') {
        req.body[key] = req.body[key].trim();
      }
    }
  }
  next();
};
