import { db } from '../database/connection';
import { ActivityLog, User } from '../../shared/types';

export const logActivity = (
  user: Partial<User> | null,
  action: string,
  entity_type: 'parcel' | 'user' | 'payment' | 'system' | 'delivery_preference' | 'external_order' | 'return_request' | 'customer_notification',
  entity_id: string | undefined,
  details: string
): ActivityLog => {
  const newLog: ActivityLog = {
    id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    user_id: user?.id,
    user_name: user?.full_name,
    user_role: user?.role,
    action,
    entity_type,
    entity_id,
    details,
    created_at: new Date().toISOString(),
  };

  return db.insert('activity_logs', newLog);
};

export const getActivityLogs = (limit: number = 50): ActivityLog[] => {
  const logs = db.getTable('activity_logs');
  return [...logs].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, limit);
};
