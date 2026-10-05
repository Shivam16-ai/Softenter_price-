import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import * as authService from '../services/authService';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { config } from '../config';
import { logger } from '../config/logger';

const sendSuccess = (res: Response, data: any, message = 'Success', status = 200) =>
  res.status(status).json({ success: true, data, message });

const sendError = (res: Response, message: string, status = 400) =>
  res.status(status).json({ success: false, error: { message } });

export const register = async (req: Request, res: Response) => {
  try {
    const { full_name, email, password, phone, address } = req.body;
    if (!full_name || !email || !password || !phone) {
      return sendError(res, 'Name, email, password, and phone are required', 422);
    }
    const result = await authService.registerCustomer({ full_name, email, password, phone, address });
    return sendSuccess(res, result, 'Account registered successfully', 201);
  } catch (err: any) {
    const status = err.message.includes('already exists') ? 409 : 400;
    return sendError(res, err.message, status);
  }
};

export const registerAgent = async (req: Request, res: Response) => {
  try {
    const { full_name, email, password, password_confirm, employee_id, phone, company_name, vehicle_number } = req.body;
    if (!full_name || !email || !password || !employee_id || !phone) {
      return sendError(res, 'All required fields must be provided', 422);
    }
    if (password !== password_confirm) {
      return sendError(res, 'Passwords do not match', 422);
    }
    const result = await authService.registerAgent({ full_name, email, password, employee_id, phone, company_name, vehicle_number });
    return sendSuccess(res, result, 'Agent registration submitted. Pending verification.', 201);
  } catch (err: any) {
    return sendError(res, err.message, 400);
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { identifier, email, password, portalType } = req.body;
    const loginId = (identifier || email || '').trim();
    if (!loginId || !password) {
      return sendError(res, 'Email and password are required', 400);
    }
    const result = await authService.loginUser(loginId, password, portalType);
    return sendSuccess(res, result, 'Authenticated successfully');
  } catch (err: any) {
    const status = err.message.includes('suspended') ? 403 :
                   err.message.includes('pending') ? 403 : 401;
    return sendError(res, err.message, status);
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { email, new_password } = req.body;
    if (!email || !new_password) return sendError(res, 'Email and new password required', 400);
    const result = await authService.resetPassword(email, new_password);
    return sendSuccess(res, result, 'Password updated successfully');
  } catch (err: any) {
    return sendError(res, err.message, 400);
  }
};

export const getCurrentUser = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) return sendError(res, 'Not authenticated', 401);
    return sendSuccess(res, req.user);
  } catch (err: any) {
    return sendError(res, err.message, 500);
  }
};

export const updateProfile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) return sendError(res, 'Not authenticated', 401);
    const { full_name, phone, address, password } = req.body;
    const updated = await authService.updateProfile(req.user.id, { full_name, phone, address, password });
    return sendSuccess(res, updated, 'Profile updated');
  } catch (err: any) {
    return sendError(res, err.message, 400);
  }
};

export const googleCallback = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.redirect('/auth?error=authentication_failed');
    const user = req.user as any;
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      config.jwtSecret,
      { expiresIn: '7d' } as any
    );
    logger.info(`Google OAuth login: ${user.email}`);
    return res.redirect(`/auth?token=${token}`);
  } catch (err: any) {
    return res.redirect('/auth?error=google_auth_exception');
  }
};
