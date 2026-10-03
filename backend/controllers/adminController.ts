import { Response } from 'express';
import fs from 'fs';
import path from 'path';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { db } from '../database/connection';
import { sendSuccess, sendError } from '../utils/apiResponse';
import * as reportService from '../services/reportService';
import * as activityService from '../services/activityService';
import { hashPassword } from '../utils/passwordUtils';
import { UserRole, User } from '../../shared/types';

export const getDashboardStatsHandler = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const stats = reportService.getDashboardStats();
    return sendSuccess(res, stats);
  } catch (err: any) {
    return sendError(res, err.message || 'Error compiling dashboard statistics', 500);
  }
};

export const getReportsHandler = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const monthlyDeliveries = reportService.getMonthlyDeliveryReports();
    const revenueReports = reportService.getRevenueReports();
    return sendSuccess(res, { monthlyDeliveries, revenueReports });
  } catch (err: any) {
    return sendError(res, err.message || 'Error generating reports', 500);
  }
};

export const getUsersHandler = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { role } = req.query;
    let users = db.getTable('users');

    if (role && role !== 'all') {
      users = users.filter((u) => u.role === role);
    }

    const safeUsers = users.map(({ password_hash, ...rest }) => rest);
    return sendSuccess(res, safeUsers, 'Users fetched', 200, { total: safeUsers.length });
  } catch (err: any) {
    return sendError(res, err.message || 'Error fetching users', 500);
  }
};

export const createAgentHandler = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { full_name, email, password, phone, address } = req.body;

    if (!full_name || !email || !password || !phone) {
      return sendError(res, 'Name, email, password, and phone are required for agent onboarding', 422);
    }

    const existing = db.getTable('users').find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      return sendError(res, 'An account with this email already exists', 409);
    }

    const password_hash = await hashPassword(password);
    const newAgent: User & { password_hash: string } = {
      id: `usr_agent_${Date.now().toString().slice(-4)}`,
      full_name,
      email: email.toLowerCase(),
      password_hash,
      role: 'agent',
      phone,
      address: address || 'Fleet Depot',
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    db.insert('users', newAgent);

    activityService.logActivity(
      req.user || null,
      'AGENT_CREATED',
      'user',
      newAgent.id,
      `Administrator onboarded new courier agent: ${newAgent.full_name} (${newAgent.email})`
    );

    const { password_hash: _, ...safeAgent } = newAgent;
    return sendSuccess(res, safeAgent, 'Courier agent onboarded successfully', 201);
  } catch (err: any) {
    return sendError(res, err.message || 'Failed to onboard agent', 500);
  }
};

export const updateUserStatusHandler = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !['active', 'suspended'].includes(status)) {
      return sendError(res, 'Valid status (active or suspended) is required', 400);
    }

    const updated = db.update('users', id, { status });
    if (!updated) {
      return sendError(res, 'User record not found', 404);
    }

    activityService.logActivity(
      req.user || null,
      'USER_STATUS_CHANGE',
      'user',
      id,
      `User ${updated.full_name} status updated to ${status}`
    );

    const { password_hash: _, ...safeUser } = updated;
    return sendSuccess(res, safeUser, `User status updated to ${status}`);
  } catch (err: any) {
    return sendError(res, err.message || 'Failed to update user status', 500);
  }
};

export const getActivityLogsHandler = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const logs = activityService.getActivityLogs(100);
    return sendSuccess(res, logs);
  } catch (err: any) {
    return sendError(res, err.message || 'Error fetching activity logs', 500);
  }
};

export const getSettingsHandler = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const settings = db.getTable('system_settings');
    return sendSuccess(res, settings);
  } catch (err: any) {
    return sendError(res, err.message || 'Failed to fetch settings', 500);
  }
};

export const updateSettingsHandler = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const updates = req.body;
    const updated = db.update('system_settings', '', updates);

    activityService.logActivity(
      req.user || null,
      'SETTINGS_UPDATED',
      'system',
      'system_settings',
      'System logistics parameters and rates updated by admin'
    );

    return sendSuccess(res, updated, 'System settings updated successfully');
  } catch (err: any) {
    return sendError(res, err.message || 'Failed to update settings', 500);
  }
};

export const updateAgentVerificationHandler = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !['approved', 'rejected', 'pending_verification'].includes(status)) {
      return sendError(res, 'Valid verification status (approved, rejected, pending_verification) is required', 422);
    }

    const users = db.getTable('users');
    const agent = users.find((u) => u.id === id && u.role === 'agent');
    if (!agent) {
      return sendError(res, 'Delivery agent not found', 404);
    }

    const updates: Partial<User> = {
      verification_status: status,
      verification_reviewed_at: new Date().toISOString(),
      verification_reviewed_by: req.user?.id,
      updated_at: new Date().toISOString(),
    };

    if (status === 'approved') {
      updates.status = 'active';
    }

    const updatedAgent = db.update('users', id, updates);

    activityService.logActivity(
      req.user || null,
      'AGENT_VERIFICATION_UPDATED',
      'user',
      id,
      `Delivery agent ${agent.full_name} (${agent.employee_id || 'ID N/A'}) verification status set to ${status.toUpperCase()} by admin.`
    );

    const { password_hash: _, ...safeAgent } = updatedAgent;
    return sendSuccess(res, safeAgent, `Agent status successfully set to ${status}.`);
  } catch (err: any) {
    return sendError(res, err.message || 'Failed to update agent verification status', 500);
  }
};

export const getAgentDocumentHandler = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const users = db.getTable('users');
    const agent = users.find((u) => u.id === id && u.role === 'agent');

    if (!agent || !agent.id_document_path) {
      return sendError(res, 'Identity document not found for this delivery agent.', 404);
    }

    const secureStorageDir = path.resolve(process.cwd(), 'backend/secure_storage/documents');
    const filePath = path.join(secureStorageDir, path.basename(agent.id_document_path));

    if (!fs.existsSync(filePath)) {
      return sendError(res, 'The requested document file could not be located in secure storage.', 404);
    }

    const ext = path.extname(filePath).toLowerCase();
    let contentType = 'application/octet-stream';
    if (ext === '.pdf') contentType = 'application/pdf';
    else if (ext === '.png') contentType = 'image/png';
    else if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
    else if (ext === '.webp') contentType = 'image/webp';

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `inline; filename="${path.basename(filePath)}"`);
    res.setHeader('Cache-Control', 'private, no-cache, no-store, must-revalidate');

    const fileStream = fs.createReadStream(filePath);
    return fileStream.pipe(res);
  } catch (err: any) {
    return sendError(res, err.message || 'Failed to retrieve agent document', 500);
  }
};

