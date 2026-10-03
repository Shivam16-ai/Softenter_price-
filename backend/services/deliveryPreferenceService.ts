import { db } from '../database/connection';
import { DeliveryPreference, DeliveryPreferenceType, User } from '../../shared/types';
import { logActivity } from './activityService';

export interface CreateDeliveryPreferenceDTO {
  customer_id: string;
  preference_type: DeliveryPreferenceType;
  is_enabled: boolean;
  preferred_time_start?: string;
  preferred_time_end?: string;
  special_instructions?: string;
}

export const getDeliveryPreferences = (customerId: string): DeliveryPreference[] => {
  return db.getTable('delivery_preferences')
    .filter((p: any) => p.customer_id === customerId);
};

export const getDeliveryPreference = (
  customerId: string,
  preferenceType: DeliveryPreferenceType
): DeliveryPreference | null => {
  return db.getTable('delivery_preferences')
    .find((p: any) => p.customer_id === customerId && p.preference_type === preferenceType) || null;
};

export const setDeliveryPreference = (
  dto: CreateDeliveryPreferenceDTO,
  user?: User
): DeliveryPreference => {
  // Check if preference already exists
  const existing = db.getTable('delivery_preferences')
    .find((p: any) => 
      p.customer_id === dto.customer_id && 
      p.preference_type === dto.preference_type
    );

  if (existing) {
    // Update existing preference
    const updated = db.update('delivery_preferences', existing.id, {
      is_enabled: dto.is_enabled,
      preferred_time_start: dto.preferred_time_start,
      preferred_time_end: dto.preferred_time_end,
      special_instructions: dto.special_instructions,
      updated_at: new Date().toISOString(),
    });

    logActivity(
      user || null,
      'DELIVERY_PREFERENCE_UPDATED',
      'delivery_preference',
      existing.id,
      `Delivery preference ${dto.preference_type} updated`
    );

    return updated!;
  }

  // Create new preference
  const newPreference: DeliveryPreference = {
    id: `pref_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    customer_id: dto.customer_id,
    preference_type: dto.preference_type,
    is_enabled: dto.is_enabled,
    preferred_time_start: dto.preferred_time_start,
    preferred_time_end: dto.preferred_time_end,
    special_instructions: dto.special_instructions,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  db.insert('delivery_preferences', newPreference);

  logActivity(
    user || null,
    'DELIVERY_PREFERENCE_CREATED',
    'delivery_preference',
    newPreference.id,
    `Delivery preference ${dto.preference_type} created`
  );

  return newPreference;
};

export const updateDeliveryPreference = (
  customerId: string,
  preferenceType: DeliveryPreferenceType,
  updates: Partial<DeliveryPreference>,
  user?: User
): DeliveryPreference | null => {
  const preference = db.getTable('delivery_preferences')
    .find((p: any) => 
      p.customer_id === customerId && 
      p.preference_type === preferenceType
    );

  if (!preference) return null;

  const updated = db.update('delivery_preferences', preference.id, {
    ...updates,
    updated_at: new Date().toISOString(),
  });

  if (updated) {
    logActivity(
      user || null,
      'DELIVERY_PREFERENCE_UPDATED',
      'delivery_preference',
      preference.id,
      `Delivery preference ${preferenceType} updated`
    );
  }

  return updated;
};

export const toggleDeliveryPreference = (
  customerId: string,
  preferenceType: DeliveryPreferenceType,
  user?: User
): DeliveryPreference | null => {
  const preference = db.getTable('delivery_preferences')
    .find((p: any) => 
      p.customer_id === customerId && 
      p.preference_type === preferenceType
    );

  if (!preference) {
    // Create with enabled = true if doesn't exist
    return setDeliveryPreference({
      customer_id: customerId,
      preference_type: preferenceType,
      is_enabled: true,
    }, user);
  }

  const updated = db.update('delivery_preferences', preference.id, {
    is_enabled: !preference.is_enabled,
    updated_at: new Date().toISOString(),
  });

  if (updated) {
    logActivity(
      user || null,
      'DELIVERY_PREFERENCE_TOGGLED',
      'delivery_preference',
      preference.id,
      `Delivery preference ${preferenceType} ${updated.is_enabled ? 'enabled' : 'disabled'}`
    );
  }

  return updated;
};

export const deleteDeliveryPreference = (
  customerId: string,
  preferenceType: DeliveryPreferenceType,
  user?: User
): boolean => {
  const preference = db.getTable('delivery_preferences')
    .find((p: any) => 
      p.customer_id === customerId && 
      p.preference_type === preferenceType
    );

  if (!preference) return false;

  const deleted = db.delete('delivery_preferences', preference.id);

  if (deleted) {
    logActivity(
      user || null,
      'DELIVERY_PREFERENCE_DELETED',
      'delivery_preference',
      preference.id,
      `Delivery preference ${preferenceType} deleted`
    );
  }

  return deleted;
};

export const initializeDefaultPreferences = (customerId: string, user?: User): DeliveryPreference[] => {
  const defaultPreferences: DeliveryPreferenceType[] = [
    'call_before_delivery',
    'signature_required',
  ];

  const createdPreferences: DeliveryPreference[] = [];

  defaultPreferences.forEach(type => {
    const existing = db.getTable('delivery_preferences')
      .find((p: any) => p.customer_id === customerId && p.preference_type === type);

    if (!existing) {
      const pref = setDeliveryPreference({
        customer_id: customerId,
        preference_type: type,
        is_enabled: type === 'signature_required', // Enable signature by default
      }, user);
      createdPreferences.push(pref);
    }
  });

  return createdPreferences;
};
