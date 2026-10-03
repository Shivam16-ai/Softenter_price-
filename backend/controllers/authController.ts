import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import prisma from '../database/prisma';
import { config } from '../config';
import { hashPassword, comparePassword } from '../utils/passwordUtils';
import { sendSuccess, sendError } from '../utils/apiResponse';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { logActivity } from '../services/activityService';
import { User, UserRole } from '../../shared/types';
import passport from '../config/passport';
import * as userService from '../services/userService';

const SECURE_DOCS_DIR = path.resolve(process.cwd(), 'backend/secure_storage/documents');
if (!fs.existsSync(SECURE_DOCS_DIR)) {
  fs.mkdirSync(SECURE_DOCS_DIR, { recursive: true });
}

/**
 * Customer / Shipper Registration
 */
export const register = async (req: Request, res: Response) => {
  try {
    const { full_name, email, password, role = 'customer', phone, address } = req.body;

    if (!full_name || !email || !password || !phone) {
      return sendError(res, 'Name, email, password, and phone are required', 422);
    }

    if (role === 'admin') {
      return sendError(res, 'Administrator accounts cannot be created via public registration.', 403);
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return sendError(res, 'Please provide a valid corporate or personal email address', 422);
    }

    if (password.length < 6) {
      return sendError(res, 'Password must be at least 6 characters long', 422);
    }

    const users = db.getTable('users');
    const existing = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      // If the account was created via Google OAuth and has no password yet, allow setting the password
      if (!existing.password_hash || existing.password_hash.trim() === '') {
        const password_hash = await hashPassword(password);
        const updates: any = { password_hash };
        if (full_name) updates.full_name = full_name;
        if (phone) updates.phone = phone;
        if (address) updates.address = address;
        db.update('users', existing.id, updates);

        const token = jwt.sign(
          { id: existing.id, email: existing.email, role: existing.role },
          config.jwtSecret,
          { expiresIn: '7d' }
        );

        logActivity(
          { id: existing.id, full_name: updates.full_name || existing.full_name, role: existing.role },
          'USER_PASSWORD_SET',
          'user',
          existing.id,
          `Password established for account: ${existing.email}`
        );

        const { password_hash: _, ...safeUser } = { ...existing, ...updates };
        return sendSuccess(res, { token, user: safeUser }, 'Password set and registered successfully! You can now log in with your email and password.', 200);
      }
      return sendError(res, 'An account with this email address already exists. Please log in or use Forgot Password.', 409);
    }

    const password_hash = await hashPassword(password);
    const newUser: User & { password_hash: string } = {
      id: `usr_cust_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      full_name: full_name.trim(),
      email: email.toLowerCase().trim(),
      password_hash,
      role: 'customer',
      phone: phone.trim(),
      address: address ? address.trim() : '',
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    db.insert('users', newUser);

    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, role: newUser.role },
      config.jwtSecret,
      { expiresIn: '7d' }
    );

    logActivity(
      { id: newUser.id, full_name: newUser.full_name, role: newUser.role },
      'USER_REGISTERED',
      'user',
      newUser.id,
      `New customer registered: ${newUser.full_name} (${newUser.email})`
    );

    const { password_hash: _, ...safeUser } = newUser;
    return sendSuccess(res, { token, user: safeUser }, 'Account successfully registered', 201);
  } catch (error: any) {
    return sendError(res, error.message || 'Registration failed', 500);
  }
};

/**
 * Dedicated Delivery Agent Registration Flow
 */
export const registerAgent = async (req: Request, res: Response) => {
  try {
    const { 
      full_name, 
      email, 
      employee_id, 
      phone, 
      company_name, 
      department, 
      vehicle_number, 
      id_document,
      password,
      password_confirm
    } = req.body;

    // 1. Mandatory Field Validation
    if (!full_name || !email || !employee_id || !phone || !company_name || !vehicle_number || !password || !id_document) {
      return sendError(res, 'All fields marked with * (Full Name, Official Email, Employee ID, Phone, Company, Vehicle Number, ID Document, Password) are mandatory.', 422);
    }

    if (password !== password_confirm) {
      return sendError(res, 'Password and confirmation password do not match.', 422);
    }

    if (password.length < 6) {
      return sendError(res, 'Password must be at least 6 characters long.', 422);
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return sendError(res, 'Please provide a valid company email address.', 422);
    }

    const normalizedEmail = email.toLowerCase().trim();
    const normalizedEmpId = employee_id.trim().toUpperCase();
    const normalizedVehicle = vehicle_number.trim().toUpperCase().replace(/\s+/g, '');

    const users = db.getTable('users');

    // 2. Duplicate Checks
    if (users.some(u => u.email.toLowerCase() === normalizedEmail || (u.company_email && u.company_email.toLowerCase() === normalizedEmail))) {
      return sendError(res, 'An account with this email address already exists.', 409);
    }

    if (users.some(u => u.employee_id && u.employee_id.toUpperCase() === normalizedEmpId)) {
      return sendError(res, `Employee ID "${normalizedEmpId}" is already registered in the system.`, 409);
    }

    // Check if vehicle number is already assigned to an active delivery agent
    const existingVehicleAgent = users.find(u => 
      u.role === 'agent' && 
      u.status === 'active' && 
      u.vehicle_number && 
      u.vehicle_number.toUpperCase().replace(/\s+/g, '') === normalizedVehicle
    );
    if (existingVehicleAgent) {
      return sendError(res, `Vehicle Registration Number "${normalizedVehicle}" is already assigned to active delivery agent ${existingVehicleAgent.full_name}.`, 409);
    }

    // 3. Document File Validation & Secure Storage
    const base64Match = id_document.match(/^data:(image\/jpeg|image\/png|image\/webp|application\/pdf);base64,(.+)$/);
    if (!base64Match) {
      return sendError(res, 'Invalid document format. Please upload a valid JPG, PNG, or PDF company ID document.', 422);
    }

    const mimeType = base64Match[1];
    const base64Data = base64Match[2];
    const fileBuffer = Buffer.from(base64Data, 'base64');

    // Enforce 5MB limit
    if (fileBuffer.length > 5 * 1024 * 1024) {
      return sendError(res, 'The uploaded ID document exceeds the maximum allowed size of 5MB.', 422);
    }

    let extension = 'png';
    if (mimeType === 'image/jpeg') extension = 'jpg';
    else if (mimeType === 'application/pdf') extension = 'pdf';
    else if (mimeType === 'image/webp') extension = 'webp';

    const documentFilename = `doc_emp_${normalizedEmpId}_${Date.now()}_${crypto.randomBytes(4).toString('hex')}.${extension}`;
    const secureFilePath = path.join(SECURE_DOCS_DIR, documentFilename);

    // Save strictly to private storage outside of public static assets
    fs.writeFileSync(secureFilePath, fileBuffer);

    // 4. Hash password and save delivery agent record with pending verification
    const password_hash = await hashPassword(password);
    const newAgent: User & { password_hash: string } = {
      id: `usr_agent_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      full_name: full_name.trim(),
      email: normalizedEmail,
      company_email: normalizedEmail,
      employee_id: normalizedEmpId,
      password_hash,
      role: 'agent',
      phone: phone.trim(),
      address: company_name.trim(),
      company_name: company_name.trim(),
      department: department ? department.trim() : undefined,
      vehicle_number: normalizedVehicle,
      id_document_path: documentFilename,
      verification_status: 'pending_verification',
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    db.insert('users', newAgent);

    logActivity(
      { id: newAgent.id, full_name: newAgent.full_name, role: 'agent' },
      'AGENT_REGISTRATION_SUBMITTED',
      'user',
      newAgent.id,
      `Delivery agent onboarding application submitted: ${newAgent.full_name} (${normalizedEmpId}) - Vehicle: ${normalizedVehicle}. Pending admin verification.`
    );

    const { password_hash: _, ...safeAgent } = newAgent;
    return sendSuccess(
      res, 
      { user: safeAgent }, 
      'Delivery Agent registration submitted successfully! Your account is currently in PENDING VERIFICATION status. Once dispatch administration reviews your company ID card and vehicle details, your operational account will be activated.', 
      201
    );
  } catch (error: any) {
    return sendError(res, error.message || 'Delivery Agent registration could not be completed.', 500);
  }
};

/**
 * Universal Login: Supports Customer Email, Delivery Agent Company Email, or Delivery Agent Employee ID
 * WITH PORTAL VALIDATION: Detects wrong portal usage and provides guidance
 */
export const login = async (req: Request, res: Response) => {
  try {
    const rawIdentifier = (req.body.identifier || req.body.email || '').trim();
    const { password, portalType } = req.body; // portalType: 'customer' | 'agent' (optional, from frontend)

    if (!rawIdentifier || !password) {
      return sendError(res, 'Email or Employee ID, and password are required', 400);
    }

    const lowerId = rawIdentifier.toLowerCase();
    const upperId = rawIdentifier.toUpperCase();

    const users = db.getTable('users');
    const user = users.find((u) => 
      u.email.toLowerCase() === lowerId ||
      (u.company_email && u.company_email.toLowerCase() === lowerId) ||
      (u.employee_id && u.employee_id.toUpperCase() === upperId)
    );

    if (!user) {
      return sendError(res, 'Invalid credentials. Please verify your email or Employee ID and password.', 401);
    }

    if (user.status === 'suspended') {
      return sendError(res, 'This account has been suspended by administration. Please contact dispatch support.', 403);
    }

    // PORTAL VALIDATION: Detect wrong portal usage
    // If frontend sends portalType, validate that user's role matches the selected portal
    // EXCEPTION: Admin can login through any portal and will be redirected to admin dashboard
    if (portalType && user.role !== 'admin') {
      if (portalType === 'customer' && user.role === 'agent') {
        return sendError(
          res,
          'This account belongs to a Delivery Agent account. Please select the "Delivery Agent" portal to sign in.',
          403
        );
      }
      if (portalType === 'agent' && user.role === 'customer') {
        return sendError(
          res,
          'This account belongs to a Customer account. Please select the "Customer / Shipper" portal to sign in.',
          403
        );
      }
    }

    // Role-specific verification enforcement
    if (user.role === 'agent') {
      if (user.verification_status === 'pending_verification') {
        return sendError(
          res, 
          'Your delivery agent account is currently PENDING ADMINISTRATIVE VERIFICATION. Dispatch administration must review your company ID document and vehicle registration before operational access is granted.', 
          403
        );
      }
      if (user.verification_status === 'rejected') {
        return sendError(
          res, 
          'Your delivery agent application has been rejected by administration. Please contact your dispatch supervisor.', 
          403
        );
      }
    }

    // Handle Google OAuth users who haven't set a direct password yet
    if (!user.password_hash || user.password_hash.trim() === '') {
      if (password.length < 6) {
        return sendError(
          res,
          'Your account was created with Google. To enable direct password login, enter a password of at least 6 characters.',
          422
        );
      }
      const newHash = await hashPassword(password);
      db.update('users', user.id, { password_hash: newHash });
      user.password_hash = newHash;

      logActivity(
        { id: user.id, full_name: user.full_name, role: user.role },
        'PASSWORD_INITIALIZED',
        'user',
        user.id,
        `Direct password initialized for user: ${user.email}`
      );
    } else {
      const isMatch = await comparePassword(password, user.password_hash);
      if (!isMatch) {
        return sendError(res, 'Invalid credentials. Please verify your email or Employee ID and password.', 401);
      }
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      config.jwtSecret,
      { expiresIn: '7d' }
    );

    logActivity(
      { id: user.id, full_name: user.full_name, role: user.role },
      'USER_LOGIN',
      'user',
      user.id,
      `User ${user.full_name} (${user.role}) authenticated successfully via ${portalType || 'unspecified'} portal`
    );

    const { password_hash: _, ...safeUser } = user;
    return sendSuccess(res, { token, user: safeUser }, 'Authenticated successfully');
  } catch (error: any) {
    return sendError(res, error.message || 'Login failed', 500);
  }
};

/**
 * Forgot / Reset Password
 */
export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { email, new_password } = req.body;

    if (!email || !new_password) {
      return sendError(res, 'Email and new password are required', 400);
    }

    if (new_password.length < 6) {
      return sendError(res, 'Password must be at least 6 characters long', 422);
    }

    const users = db.getTable('users');
    const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());

    if (!user) {
      return sendError(res, 'No account found with this email address', 404);
    }

    const password_hash = await hashPassword(new_password);
    db.update('users', user.id, { password_hash });

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      config.jwtSecret,
      { expiresIn: '7d' }
    );

    logActivity(
      { id: user.id, full_name: user.full_name, role: user.role },
      'PASSWORD_RESET',
      'user',
      user.id,
      `User ${user.full_name} (${user.email}) reset account password.`
    );

    const { password_hash: _, ...safeUser } = { ...user, password_hash };
    return sendSuccess(res, { token, user: safeUser }, 'Password updated successfully! You are now authenticated.');
  } catch (error: any) {
    return sendError(res, error.message || 'Password reset failed', 500);
  }
};

/**
 * Google OAuth Callback Handler
 * CRITICAL: Redirect to /auth (not /) to prevent landing page redirect after successful login
 */
export const googleCallback = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.redirect('/auth?error=authentication_failed');
    }

    const user = req.user as User;

    // Never automatically grant admin role from Google OAuth
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      config.jwtSecret,
      { expiresIn: '7d' }
    );

    logActivity(
      { id: user.id, full_name: user.full_name, role: user.role },
      'USER_GOOGLE_OAUTH_LOGIN',
      'user',
      user.id,
      `User ${user.full_name} authenticated via Google OAuth`
    );

    // Redirect to /auth page which will handle role-based portal navigation
    return res.redirect(`/auth?token=${token}`);
  } catch (error: any) {
    return res.redirect('/auth?error=google_auth_exception');
  }
};

/**
 * Current Authenticated User
 */
export const getCurrentUser = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return sendError(res, 'User not authenticated', 401);
    }
    return sendSuccess(res, req.user);
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to fetch user', 500);
  }
};

/**
 * Update Profile
 */
export const updateProfile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return sendError(res, 'User not authenticated', 401);
    }

    const { full_name, phone, address, password } = req.body;
    const updates: Partial<User> & { password_hash?: string } = {};

    if (full_name) updates.full_name = full_name;
    if (phone) updates.phone = phone;
    if (address !== undefined) updates.address = address;

    if (password) {
      if (password.length < 6) {
        return sendError(res, 'Password must be at least 6 characters long', 422);
      }
      updates.password_hash = await hashPassword(password);
    }

    updates.updated_at = new Date().toISOString();

    const updatedUser = db.update('users', req.user.id, updates);

    logActivity(
      { id: req.user.id, full_name: req.user.full_name, role: req.user.role },
      'USER_PROFILE_UPDATED',
      'user',
      req.user.id,
      `User ${req.user.full_name} updated account details.`
    );

    const { password_hash: _, ...safeUser } = updatedUser;
    return sendSuccess(res, safeUser, 'Profile updated successfully');
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to update profile', 500);
  }
};
