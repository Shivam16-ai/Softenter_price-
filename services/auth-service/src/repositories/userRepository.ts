import prisma from '../config/prisma';
import bcrypt from 'bcryptjs';

export const findUserByEmail = async (email: string) => {
  return prisma.user.findUnique({
    where: { email: email.toLowerCase() },
    include: { role: true, customerProfile: true, deliveryAgentProfile: true },
  });
};

export const findUserById = async (id: string) => {
  return prisma.user.findUnique({
    where: { id },
    include: { role: true, customerProfile: true, deliveryAgentProfile: true },
  });
};

export const createCustomerUser = async (data: {
  email: string;
  passwordHash: string;
  fullName: string;
  phone: string;
  address?: string;
}) => {
  const customerRole = await prisma.role.findUnique({ where: { code: 'CUSTOMER' } });
  if (!customerRole) throw new Error('CUSTOMER role not configured in database');

  const user = await prisma.user.create({
    data: {
      email: data.email.toLowerCase(),
      passwordHash: data.passwordHash,
      fullName: data.fullName,
      phone: data.phone,
      address: data.address || '',
      roleId: customerRole.id,
      status: 'ACTIVE',
      isEmailVerified: false,
    },
    include: { role: true },
  });

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

  return user;
};

export const createAgentUser = async (data: {
  email: string;
  passwordHash: string;
  fullName: string;
  phone: string;
  employeeId: string;
  companyName?: string;
  vehicleNumber?: string;
}) => {
  const agentRole = await prisma.role.findUnique({ where: { code: 'COURIER_AGENT' } });
  if (!agentRole) throw new Error('COURIER_AGENT role not configured in database');

  const user = await prisma.user.create({
    data: {
      email: data.email.toLowerCase(),
      passwordHash: data.passwordHash,
      fullName: data.fullName,
      phone: data.phone,
      address: data.companyName || '',
      roleId: agentRole.id,
      status: 'PENDING_VERIFICATION',
      isEmailVerified: false,
    },
    include: { role: true },
  });

  await prisma.deliveryAgent.create({
    data: {
      userId: user.id,
      employeeCode: data.employeeId.toUpperCase(),
      employmentStatus: 'PROBATION',
      rating: 5.0,
      totalDeliveriesCount: 0,
      successfulDeliveriesCount: 0,
      failedDeliveriesCount: 0,
    },
  });

  return user;
};

export const updateUserPasswordHash = async (userId: string, passwordHash: string) => {
  return prisma.user.update({ where: { id: userId }, data: { passwordHash } });
};

export const mapUserToResponse = (user: any) => ({
  id: user.id,
  email: user.email,
  full_name: user.fullName,
  phone: user.phone,
  address: user.address || '',
  avatar_url: user.avatarUrl || null,
  role: user.role.code === 'ADMIN' ? 'admin' :
        user.role.code === 'COURIER_AGENT' ? 'agent' : 'customer',
  status: user.status.toLowerCase(),
  created_at: user.createdAt.toISOString(),
  updated_at: user.updatedAt.toISOString(),
  verification_status: user.status === 'PENDING_VERIFICATION' ? 'pending_verification' :
                       user.status === 'ACTIVE' ? 'approved' : user.status.toLowerCase(),
});
