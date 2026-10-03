// SwiftRoute Enterprise - Database Adapter
// Provides a unified interface that routes to Prisma (PostgreSQL)
// This adapter replaces the JSON database layer

import prisma from './prisma';
import { logger } from '../utils/logger';

// Export prisma instance as db for backward compatibility during migration
export const db = {
  // User operations
  users: {
    async findByEmail(email: string) {
      return await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
        include: {
          role: true,
          customerProfile: true,
          deliveryAgentProfile: true,
        },
      });
    },
    async findById(id: string) {
      return await prisma.user.findUnique({
        where: { id },
        include: {
          role: true,
          customerProfile: true,
          deliveryAgentProfile: true,
        },
      });
    },
    async findAll(filters?: { roleCode?: string; status?: string }) {
      const where: any = {};
      if (filters?.roleCode) {
        const role = await prisma.role.findUnique({ where: { code: filters.roleCode as any } });
        if (role) where.roleId = role.id;
      }
      if (filters?.status) {
        where.status = filters.status;
      }
      return await prisma.user.findMany({
        where,
        include: {
          role: true,
          customerProfile: true,
          deliveryAgentProfile: true,
        },
      });
    },
  },

  // Parcel operations
  parcels: {
    async findById(id: string) {
      return await prisma.parcel.findUnique({
        where: { id },
        include: {
          sender: { include: { role: true } },
          customer: true,
          category: true,
          assignedAgent: { include: { user: true } },
          trackingHistory: { orderBy: { checkpointTimestamp: 'desc' } },
          deliveryProof: true,
          payments: true,
        },
      });
    },
    async findByTracking(trackingNumber: string) {
      return await prisma.parcel.findUnique({
        where: { trackingNumber },
        include: {
          sender: { include: { role: true } },
          customer: true,
          category: true,
          assignedAgent: { include: { user: true } },
          trackingHistory: { orderBy: { checkpointTimestamp: 'desc' } },
          deliveryProof: true,
        },
      });
    },
    async findAll(filters?: { senderId?: string; agentId?: string; status?: string }) {
      const where: any = {};
      if (filters?.senderId) {
        where.senderId = filters.senderId;
      }
      if (filters?.agentId) {
        const agent = await prisma.deliveryAgent.findFirst({
          where: { userId: filters.agentId },
        });
        if (agent) where.assignedAgentId = agent.id;
      }
      if (filters?.status) {
        where.status = filters.status;
      }
      return await prisma.parcel.findMany({
        where,
        include: {
          sender: { include: { role: true } },
          customer: true,
          category: true,
          assignedAgent: { include: { user: true } },
        },
        orderBy: { createdAt: 'desc' },
      });
    },
  },

  // Activity logs
  activityLogs: {
    async create(data: {
      userId?: string;
      userName?: string;
      userRole?: string;
      action: string;
      entityType: string;
      entityId?: string;
      details: string;
    }) {
      return await prisma.activityLog.create({
        data: {
          userId: data.userId || null,
          userName: data.userName || null,
          userRole: data.userRole || null,
          action: data.action,
          entityType: data.entityType,
          entityId: data.entityId || null,
          details: data.details,
          createdAt: new Date(),
        },
      });
    },
    async findAll(limit = 100) {
      return await prisma.activityLog.findMany({
        take: limit,
        orderBy: { createdAt: 'desc' },
      });
    },
  },

  // System settings
  settings: {
    async get(key: string) {
      const setting = await prisma.systemSetting.findUnique({
        where: { key },
      });
      return setting?.value || null;
    },
    async set(key: string, value: string) {
      return await prisma.systemSetting.upsert({
        where: { key },
        create: {
          key,
          value,
          dataType: 'STRING',
          category: 'GENERAL',
        },
        update: { value },
      });
    },
    async getAll() {
      const settings = await prisma.systemSetting.findMany();
      const result: Record<string, string> = {};
      settings.forEach(s => {
        result[s.key] = s.value;
      });
      return result;
    },
  },

  // Legacy compatibility methods
  getTable(tableName: string): any {
    logger.warn(`Legacy getTable('${tableName}') called - should be replaced with Prisma`);
    return [];
  },

  insert(tableName: string, item: any): any {
    logger.warn(`Legacy insert('${tableName}') called - should be replaced with Prisma`);
    return item;
  },

  update(tableName: string, idOrFilter: string | Function, updates: any): any {
    logger.warn(`Legacy update('${tableName}') called - should be replaced with Prisma`);
    return updates;
  },

  delete(tableName: string, id: string): boolean {
    logger.warn(`Legacy delete('${tableName}') called - should be replaced with Prisma`);
    return true;
  },

  connect() {
    logger.info('Database adapter initialized (Prisma/PostgreSQL)');
  },
};

// Export individual prisma instance for direct use
export { prisma };
export default db;
