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
import { mapPrismaUserToLegacy } from '../config/passport';

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

    // Check if user exists in Prisma
    const existing = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: { role: true, customerProfile: true },
    });

    if (existing) {
      // If the account was created via Google OAuth and has no password yet, allow setting the password
      if (!existing.passwordHash || existing.passwordHash.trim() === '') {
        const password_hash = await hashPassword(password);
        const updates: any = { passwordHash: password_hash };
        if (full_name) updates.fullName = full_name;
        if (phone) updates.phone = phone;
        if (address) updates.address = address;
        
        const updatedUser = await prisma.user.update({
          where: { id: existing.id },
          data: updates,
          include: { role: true, customerProfile: true },
        });

        const mappedUser = mapPrismaUserToLegacy(updatedUser);
        const token = jwt.sign(
          { id: mappedUser.id, email: mappedUser.email, role: mappedUser.role },
          config.jwtSecret,
          { expiresIn: '7d' }
        );

        logActivity(
          { id: mappedUser.id, full_name: mappedUser.full_name, role: mappedUser.role as UserRole },
          'USER_PASSWORD_SET',
          'user',
          mappedUser.id,
          `Password established for account: ${mappedUser.email}`
        );

        return sendSuccess(res, { token, user: mappedUser }, 'Password set and registered successfully! You can now log in with your email and password.', 200);
      }
      return sendError(res, 'An account with this email address already exists. Please log in or use Forgot Password.', 409);
    }

    // Get customer role
    const customerRole = await prisma.role.findUnique({
      where: { code: 'CUSTOMER' },
    });

    if (!customerRole) {
      return sendError(res, 'System configuration error. Please contact support.', 500);
    }

    // Create new customer user with Prisma
    const password_hash = await hashPassword(password);
    const newUser = await prisma.user.create({
      data: {
        email: email.toLowerCase().trim(),
        passwordHash: password_hash,
        fullName: full_name.trim(),
        phone: phone.trim(),
        address: address ? address.trim() : '',
        roleId: customerRole.id,
        status: 'ACTIVE',
        isEmailVerified: false,
      },
      include: { role: true },
    });

    // Create customer profile
    await prisma.customer.create({
      data: {
        userId: newUser.id,
        accountType: 'INDIVIDUAL',
        creditLimit: 0,
        currentBalance: 0,
        paymentTermsDays: 0,
        customDiscountPercent: 0,
      },
    });

    const mappedUser = mapPrismaUserToLegacy(newUser);
    const token = jwt.sign(
      { id: mappedUser.id, email: mappedUser.email, role: mappedUser.role },
      config.jwtSecret,
      { expiresIn: '7d' }
    );

    logActivity(
      { id: mappedUser.id, full_name: mappedUser.full_name, role: mappedUser.role as UserRole },
      'USER_REGISTERED',
      'user',
      mappedUser.id,
      `New customer registered: ${mappedUser.full_name} (${mappedUser.email})`
    );

    return sendSuccess(res, { token, user: mappedUser }, 'Account successfully registered', 201);
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

    // 2. Duplicate Checks using Prisma
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return sendError(res, 'An account with this email address already exists.', 409);
    }

    const existingAgent = await prisma.deliveryAgent.findFirst({
      where: { employeeCode: normalizedEmpId },
    });

    if (existingAgent) {
      return sendError(res, `Employee ID "${normalizedEmpId}" is already registered in the system.`, 409);
    }

    // Check if vehicle number is already assigned to an active delivery agent
    const existingVehicle = await prisma.agentVehicle.findFirst({
      where: {
        licensePlate: normalizedVehicle,
        agent: {
          employmentStatus: 'ACTIVE',
        },
      },
      include: {
        agent: {
          include: {
            user: true,
          },
        },
      },
    });

    if (existingVehicle) {
      return sendError(res, `Vehicle Registration Number "${normalizedVehicle}" is already assigned to active delivery agent ${existingVehicle.agent.user.fullName}.`, 409);
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

    // 4. Get courier agent role
    const agentRole = await prisma.role.findUnique({
      where: { code: 'COURIER_AGENT' },
    });

    if (!agentRole) {
      return sendError(res, 'System configuration error. Please contact support.', 500);
    }

    // 5. Hash password and save delivery agent record with pending verification
    const password_hash = await hashPassword(password);
    
    const newUser = await prisma.user.create({
      data: {
        email: normalizedEmail,
        passwordHash: password_hash,
        fullName: full_name.trim(),
        phone: phone.trim(),
        address: company_name.trim(),
        roleId: agentRole.id,
        status: 'ACTIVE',
        isEmailVerified: false,
      },
      include: { role: true },
    });

    // Create delivery agent profile
    const agentProfile = await prisma.deliveryAgent.create({
      data: {
        userId: newUser.id,
        employeeCode: normalizedEmpId,
        identityDocumentType: 'COMPANY_ID',
        identityDocumentNumber: documentFilename,
        employmentStatus: 'ACTIVE',
      },
    });

    // Create agent vehicle record
    await prisma.agentVehicle.create({
      data: {
        agentId: agentProfile.id,
        vehicleType: 'CARGO_VAN', // Default
        make: 'Unspecified',
        model: 'Unspecified',
        year: new Date().getFullYear(),
        licensePlate: normalizedVehicle,
        maxWeightCapacityKg: 500,
        maxVolumeCapacityCbm: 10,
        fuelType: 'GASOLINE',
        insurancePolicyNumber: 'PENDING',
        insuranceExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
        lastServiceDate: new Date(),
        nextServiceDue: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
        isActive: true,
      },
    });

    // Set user status to PENDING_VERIFICATION
    await prisma.user.update({
      where: { id: newUser.id },
      data: { status: 'PENDING_VERIFICATION' },
    });

    logActivity(
      { id: newUser.id, full_name: newUser.fullName, role: 'agent' },
      'AGENT_REGISTRATION_SUBMITTED',
      'user',
      newUser.id,
      `Delivery agent onboarding application submitted: ${newUser.fullName} (${normalizedEmpId}) - Vehicle: ${normalizedVehicle}. Pending admin verification.`
    );

    const mappedUser = mapPrismaUserToLegacy({
      ...newUser,
      deliveryAgentProfile: await prisma.deliveryAgent.findUnique({
        where: { userId: newUser.id },
      }),
    });

    return sendSuccess(
      res, 
      { user: mappedUser }, 
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

    // Search for user in Prisma by email or employee code
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: lowerId },
          { deliveryAgentProfile: { employeeCode: upperId } },
        ],
      },
      include: {
        role: true,
        customerProfile: true,
        deliveryAgentProfile: true,
      },
    });

    if (!user) {
      return sendError(res, 'Invalid credentials. Please verify your email or Employee ID and password.', 401);
    }

    if (user.status === 'SUSPENDED') {
      return sendError(res, 'This account has been suspended by administration. Please contact dispatch support.', 403);
    }

    const mappedUser = mapPrismaUserToLegacy(user);

    // PORTAL VALIDATION: Detect wrong portal usage
    // If frontend sends portalType, validate that user's role matches the selected portal
    // EXCEPTION: Admin can login through any portal and will be redirected to admin dashboard
    if (portalType && mappedUser.role !== 'admin') {
      if (portalType === 'customer' && mappedUser.role === 'agent') {
        return sendError(
          res,
          'This account belongs to a Delivery Agent account. Please select the "Delivery Agent" portal to sign in.',
          403
        );
      }
      if (portalType === 'agent' && mappedUser.role === 'customer') {
        return sendError(
          res,
          'This account belongs to a Customer account. Please select the "Customer / Shipper" portal to sign in.',
          403
        );
      }
    }

    // Role-specific verification enforcement for delivery agents
    if (mappedUser.role === 'agent') {
      if (user.status === 'PENDING_VERIFICATION') {
        return sendError(
          res, 
          'Your delivery agent account is currently PENDING ADMINISTRATIVE VERIFICATION. Dispatch administration must review your company ID document and vehicle registration before operational access is granted.', 
          403
        );
      }
      if (user.status === 'DEACTIVATED') {
        return sendError(
          res, 
          'Your delivery agent application has been rejected by administration. Please contact your dispatch supervisor.', 
          403
        );
      }
    }

    // Handle Google OAuth users who haven't set a direct password yet
    if (!user.passwordHash || user.passwordHash.trim() === '') {
      if (password.length < 6) {
        return sendError(
          res,
          'Your account was created with Google. To enable direct password login, enter a password of at least 6 characters.',
          422
        );
      }
      const newHash = await hashPassword(password);
      
      const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: { passwordHash: newHash },
        include: {
          role: true,
          customerProfile: true,
          deliveryAgentProfile: true,
        },
      });

      logActivity(
        { id: mappedUser.id, full_name: mappedUser.full_name, role: mappedUser.role as UserRole },
        'PASSWORD_INITIALIZED',
        'user',
        mappedUser.id,
        `Direct password initialized for user: ${mappedUser.email}`
      );
    } else {
      const isMatch = await comparePassword(password, user.passwordHash);
      if (!isMatch) {
        return sendError(res, 'Invalid credentials. Please verify your email or Employee ID and password.', 401);
      }
    }

    const token = jwt.sign(
      { id: mappedUser.id, email: mappedUser.email, role: mappedUser.role },
      config.jwtSecret,
      { expiresIn: '7d' }
    );

    logActivity(
      { id: mappedUser.id, full_name: mappedUser.full_name, role: mappedUser.role as UserRole },
      'USER_LOGIN',
      'user',
      mappedUser.id,
      `User ${mappedUser.full_name} (${mappedUser.role}) authenticated successfully via ${portalType || 'unspecified'} portal`
    );

    return sendSuccess(res, { token, user: mappedUser }, 'Authenticated successfully');
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

    // Find user in Prisma
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: {
        role: true,
        customerProfile: true,
        deliveryAgentProfile: true,
      },
    });

    if (!user) {
      return sendError(res, 'No account found with this email address', 404);
    }

    const password_hash = await hashPassword(new_password);
    
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: password_hash },
      include: {
        role: true,
        customerProfile: true,
        deliveryAgentProfile: true,
      },
    });

    const mappedUser = mapPrismaUserToLegacy(updatedUser);
    const token = jwt.sign(
      { id: mappedUser.id, email: mappedUser.email, role: mappedUser.role },
      config.jwtSecret,
      { expiresIn: '7d' }
    );

    logActivity(
      { id: mappedUser.id, full_name: mappedUser.full_name, role: mappedUser.role as UserRole },
      'PASSWORD_RESET',
      'user',
      mappedUser.id,
      `User ${mappedUser.full_name} (${mappedUser.email}) reset account password.`
    );

    return sendSuccess(res, { token, user: mappedUser }, 'Password updated successfully! You are now authenticated.');
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
    const updates: any = {};

    if (full_name) updates.fullName = full_name;
    if (phone) updates.phone = phone;
    if (address !== undefined) updates.address = address;

    if (password) {
      if (password.length < 6) {
        return sendError(res, 'Password must be at least 6 characters long', 422);
      }
      updates.passwordHash = await hashPassword(password);
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: updates,
      include: {
        role: true,
        customerProfile: true,
        deliveryAgentProfile: true,
      },
    });

    const mappedUser = mapPrismaUserToLegacy(updatedUser);

    logActivity(
      { id: req.user.id, full_name: req.user.full_name, role: req.user.role },
      'USER_PROFILE_UPDATED',
      'user',
      req.user.id,
      `User ${req.user.full_name} updated account details.`
    );

    return sendSuccess(res, mappedUser, 'Profile updated successfully');
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to update profile', 500);
  }
};
