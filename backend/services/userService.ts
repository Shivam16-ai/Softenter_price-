// SwiftRoute Enterprise - User Service (Prisma/PostgreSQL)
import prisma from '../database/prisma';
import { hashPassword } from '../utils/passwordUtils';
import { logger } from '../utils/logger';

export interface CreateUserDTO {
  email: string;
  password?: string;
  fullName: string;
  phone: string;
  address?: string;
  role: 'admin' | 'agent' | 'customer';
  googleId?: string;
}

export interface UpdateUserDTO {
  fullName?: string;
  phone?: string;
  address?: string;
  avatarUrl?: string;
}

export const getUserByEmail = async (email: string) => {
  return await prisma.user.findUnique({
    where: { email },
    include: {
      role: true,
      customerProfile: true,
      deliveryAgentProfile: true,
    },
  });
};

export const getUserById = async (id: string) => {
  return await prisma.user.findUnique({
    where: { id },
    include: {
      role: true,
      customerProfile: true,
      deliveryAgentProfile: true,
    },
  });
};

export const createUser = async (dto: CreateUserDTO) => {
  // Get role ID
  const roleMap: Record<string, string> = {
    'admin': 'ADMIN',
    'agent': 'COURIER_AGENT',
    'customer': 'CUSTOMER',
  };
  
  const role = await prisma.role.findUnique({
    where: { code: roleMap[dto.role] as any },
  });

  if (!role) {
    throw new Error(`Role not found: ${dto.role}`);
  }

  // Hash password if provided
  const passwordHash = dto.password ? await hashPassword(dto.password) : '';

  // Create user
  const user = await prisma.user.create({
    data: {
      email: dto.email,
      passwordHash: passwordHash,
      fullName: dto.fullName,
      phone: dto.phone || '',
      address: dto.address || '',
      roleId: role.id,
      status: 'ACTIVE',
      isEmailVerified: !!dto.googleId,
    },
    include: {
      role: true,
    },
  });

  // Create profile based on role
  if (dto.role === 'customer') {
    await prisma.customer.create({
      data: {
        userId: user.id,
        accountType: 'INDIVIDUAL',
        creditLimit: 0,
        currentBalance: 0,
        paymentTermsDays: 0,
        customDiscountPercent: 0,
      },
    });
  } else if (dto.role === 'agent') {
    await prisma.deliveryAgent.create({
      data: {
        userId: user.id,
        employeeCode: `EMP-${user.id.substring(0, 8).toUpperCase()}`,
        employmentStatus: 'PROBATION',
        rating: 5.0,
        totalDeliveriesCount: 0,
        successfulDeliveriesCount: 0,
        failedDeliveriesCount: 0,
      },
    });
  }

  logger.info(`User created: ${user.email} (${dto.role})`);
  return user;
};

export const updateUser = async (userId: string, dto: UpdateUserDTO) => {
  return await prisma.user.update({
    where: { id: userId },
    data: dto,
    include: {
      role: true,
      customerProfile: true,
      deliveryAgentProfile: true,
    },
  });
};

export const updateUserPassword = async (userId: string, newPassword: string) => {
  const passwordHash = await hashPassword(newPassword);
  return await prisma.user.update({
    where: { id: userId },
    data: { passwordHash },
  });
};

export const getAllUsers = async (filters?: { role?: string; status?: string }) => {
  const where: any = {};

  if (filters?.role) {
    const roleMap: Record<string, string> = {
      'admin': 'ADMIN',
      'agent': 'COURIER_AGENT',
      'customer': 'CUSTOMER',
    };
    const role = await prisma.role.findUnique({
      where: { code: roleMap[filters.role] as any },
    });
    if (role) {
      where.roleId = role.id;
    }
  }

  if (filters?.status) {
    where.status = filters.status.toUpperCase();
  }

  return await prisma.user.findMany({
    where,
    include: {
      role: true,
      customerProfile: true,
      deliveryAgentProfile: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
};

export const getDeliveryAgents = async () => {
  return await prisma.deliveryAgent.findMany({
    where: {
      employmentStatus: 'ACTIVE',
    },
    include: {
      user: {
        include: {
          role: true,
        },
      },
    },
    orderBy: {
      rating: 'desc',
    },
  });
};
