import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { config } from '../config';
import { logger } from '../config/logger';
import * as userRepo from '../repositories/userRepository';

export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, 12);
};

export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};

export const generateToken = (payload: { id: string; email: string; role: string }): string => {
  return jwt.sign(payload, config.jwtSecret, { expiresIn: config.jwtExpiresIn } as any);
};

export const registerCustomer = async (data: {
  full_name: string;
  email: string;
  password: string;
  phone: string;
  address?: string;
}) => {
  const existing = await userRepo.findUserByEmail(data.email);
  if (existing) {
    // If Google OAuth user with no password, allow setting password
    if (!existing.passwordHash || existing.passwordHash === '') {
      const passwordHash = await hashPassword(data.password);
      await userRepo.updateUserPasswordHash(existing.id, passwordHash);
      const token = generateToken({ id: existing.id, email: existing.email, role: 'customer' });
      return { token, user: userRepo.mapUserToResponse({ ...existing, passwordHash }) };
    }
    throw new Error('An account with this email already exists');
  }

  if (data.password.length < 6) throw new Error('Password must be at least 6 characters');

  const passwordHash = await hashPassword(data.password);
  const user = await userRepo.createCustomerUser({
    email: data.email,
    passwordHash,
    fullName: data.full_name,
    phone: data.phone,
    address: data.address,
  });

  const token = generateToken({ id: user.id, email: user.email, role: 'customer' });
  logger.info(`Customer registered: ${user.email}`);
  return { token, user: userRepo.mapUserToResponse(user) };
};

export const registerAgent = async (data: {
  full_name: string;
  email: string;
  password: string;
  employee_id: string;
  phone: string;
  company_name?: string;
  vehicle_number?: string;
}) => {
  const existing = await userRepo.findUserByEmail(data.email);
  if (existing) throw new Error('An account with this email already exists');

  if (data.password.length < 6) throw new Error('Password must be at least 6 characters');

  const passwordHash = await hashPassword(data.password);
  const user = await userRepo.createAgentUser({
    email: data.email,
    passwordHash,
    fullName: data.full_name,
    phone: data.phone,
    employeeId: data.employee_id,
    companyName: data.company_name,
    vehicleNumber: data.vehicle_number,
  });

  logger.info(`Agent registered (pending verification): ${user.email}`);
  return { user: userRepo.mapUserToResponse(user) };
};

export const loginUser = async (identifier: string, password: string, portalType?: string) => {
  const user = await userRepo.findUserByEmail(identifier);
  if (!user) throw new Error('Invalid credentials');

  if (user.status === 'SUSPENDED') throw new Error('Account has been suspended');

  // Portal type validation
  const userRole = user.role.code === 'ADMIN' ? 'admin' :
                   user.role.code === 'COURIER_AGENT' ? 'agent' : 'customer';

  if (portalType && userRole !== 'admin') {
    if (portalType === 'customer' && userRole === 'agent') {
      throw new Error('This is a Delivery Agent account. Please use the Delivery Agent portal.');
    }
    if (portalType === 'agent' && userRole === 'customer') {
      throw new Error('This is a Customer account. Please use the Customer portal.');
    }
  }

  // Pending verification check for agents
  if (user.status === 'PENDING_VERIFICATION') {
    throw new Error('Your account is pending administrative verification.');
  }

  // Handle Google OAuth users with no password
  if (!user.passwordHash || user.passwordHash === '') {
    if (password.length < 6) {
      throw new Error('Your account was created with Google. Enter a password (min 6 chars) to set one.');
    }
    const newHash = await hashPassword(password);
    await userRepo.updateUserPasswordHash(user.id, newHash);
  } else {
    const isMatch = await comparePassword(password, user.passwordHash);
    if (!isMatch) throw new Error('Invalid credentials');
  }

  const token = generateToken({ id: user.id, email: user.email, role: userRole });
  logger.info(`User logged in: ${user.email} (${userRole})`);
  return { token, user: userRepo.mapUserToResponse(user) };
};

export const resetPassword = async (email: string, newPassword: string) => {
  if (newPassword.length < 6) throw new Error('Password must be at least 6 characters');
  const user = await userRepo.findUserByEmail(email);
  if (!user) throw new Error('No account found with this email');

  const passwordHash = await hashPassword(newPassword);
  await userRepo.updateUserPasswordHash(user.id, passwordHash);

  const userRole = user.role.code === 'ADMIN' ? 'admin' :
                   user.role.code === 'COURIER_AGENT' ? 'agent' : 'customer';
  const token = generateToken({ id: user.id, email: user.email, role: userRole });
  return { token, user: userRepo.mapUserToResponse(user) };
};

export const getCurrentUser = async (userId: string) => {
  const user = await userRepo.findUserById(userId);
  if (!user) throw new Error('User not found');
  return userRepo.mapUserToResponse(user);
};

export const updateProfile = async (userId: string, data: {
  full_name?: string;
  phone?: string;
  address?: string;
  password?: string;
}) => {
  const updateData: any = {};
  if (data.full_name) updateData.fullName = data.full_name;
  if (data.phone) updateData.phone = data.phone;
  if (data.address !== undefined) updateData.address = data.address;
  if (data.password) {
    if (data.password.length < 6) throw new Error('Password must be at least 6 characters');
    updateData.passwordHash = await hashPassword(data.password);
  }

  const { prisma: prismaClient } = await import('../config/prisma');
  const user = await (await import('../config/prisma')).default.user.update({
    where: { id: userId },
    data: updateData,
    include: { role: true, customerProfile: true, deliveryAgentProfile: true },
  });
  return userRepo.mapUserToResponse(user);
};
