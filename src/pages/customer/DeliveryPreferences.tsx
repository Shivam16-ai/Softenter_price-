import React, { useState, useEffect } from 'react';
import {
  Settings,
  Phone,
  Home,
  Lock,
  Clock,
  CheckCircle2,
  Smartphone,
  MessageSquare,
  Save,
  AlertCircle,
} from 'lucide-react';
import { motion } from 'motion/react';
import { api } from '../../services/api';
import { DeliveryPreferenceType } from '../../../shared/types';

interface DeliveryPreference {
  id?: string;
  preference_type: DeliveryPreferenceType;
  is_enabled: boolean;
  preferred_time_start?: string;
  preferred_time_end?: string;
  special_instructions?: string;
}

const preferenceOptions: {
  type: DeliveryPreferenceType;
  title: string;
  description: string;
  icon: any;
  color: string;
}[] = [
  {
    type: 'call_before_delivery',
    title: 'Call Before Delivery',
    description: 'Receive a phone call 15-30 minutes before delivery arrives',
    icon: Phone,
    color: 'blue',
  },
  {
    type: 'leave_at_doorstep',
    title: 'Leave at Doorstep',
    description: 'Authorize deliveries to be left at your doorstep without signature',
    icon: Home,
    color: 'green',
  },
  {
    type: 'require_otp',
    title: 'OTP Verification',
    description: 'Require one-time password for delivery handover',
    icon: Lock,
    color: 'purple',
  },
  {
    type: 'signature_required',
    title: 'Signature Required',
    description: 'Require physical or digital signature for all deliveries',
    icon: CheckCircle2,
    color: 'orange',
  },
  {
    type: 'no_contact_delivery',
    title: 'No-Contact Delivery',
    description: 'Minimize contact during delivery for safety and convenience',
    icon: Smartphone,
    color: 'cyan',
  },
];

export const DeliveryPreferences: React.FC = () => {
  const [preferences, setPreferences] = useState<Record<string, DeliveryPreference>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [deliveryInstructions, setDeliveryInstructions] = useState('');
  const [preferredTimeStart, setPreferredTimeStart] = useState('09:00');
  const [preferredTimeEnd, setPreferredTimeEnd] = useState('18:00');

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    setLoading(true);
    try {
      const res = await api.getDeliveryPreferences();
      const prefsMap: Record<string, DeliveryPreference> = {};
      
      (res.data || []).forEach((pref: any) => {
        prefsMap[pref.preference_type] = pref;
        if (pref.special_instructions) {
          setDeliveryInstructions(pref.special_instructions);
        }
        if (pref.preferred_time_start) {
          setPreferredTimeStart(pref.preferred_time_start);
        }
        if (pref.preferred_time_end) {
          setPreferredTimeEnd(pref.preferred_time_end);
        }
      });

      setPreferences(prefsMap);
    } catch (err) {
      console.error('Failed to load preferences', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePreference = async (type: DeliveryPreferenceType) => {
    try {
      const currentPref = preferences[type];
      const newState = !currentPref?.is_enabled;

      // Optimistic update
      setPreferences({
        ...preferences,
        [type]: {
          ...currentPref,
          preference_type: type,
          is_enabled: newState,
        },
      });

      await api.toggleDeliveryPreference(type);
    } catch (err) {
      console.error('Failed to toggle preference', err);
      // Revert on error
      loadPreferences();
    }
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    setSaveSuccess(false);

    try {
      // Save delivery instructions and time preferences
      const promises = preferenceOptions.map((option) => {
        const pref = preferences[option.type];
        if (pref?.is_enabled) {
          return api.setDeliveryPreference({
            preference_type: option.type,
            is_enabled: true,
            preferred_time_start: preferredTimeStart,
            preferred_time_end: preferredTimeEnd,
            special_instructions: deliveryInstructions,
          });
        }
        return Promise.resolve();
      });

      await Promise.all(promises);

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to save settings', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-br from-teal-600 via-emerald-600 to-green-600 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNnoiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLXdpZHRoPSIuNSIgb3BhY2l0eT0iLjEiLz48L2c+PC9zdmc+')] opacity-20"></div>

        <div className="relative z-10">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-black text-white mb-2 flex items-center gap-3">
                <Settings className="w-8 h-8" />
                Delivery Preferences
              </h1>
              <p className="text-teal-100 text-sm max-w-2xl">
                Customize how you receive your deliveries for a better experience
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Save Success Message */}
      {saveSuccess && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-800 rounded-xl p-4 flex items-center gap-3"
        >
          <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
          <div className="flex-1">
            <p className="text-sm font-bold text-green-800 dark:text-green-200">Preferences Saved!</p>
            <p className="text-xs text-green-600 dark:text-green-400 mt-0.5">
              Your delivery preferences have been updated successfully.
            </p>
          </div>
        </motion.div>
      )}

      {/* Preference Toggles */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Delivery Options</h3>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-20 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {preferenceOptions.map((option) => {
              const Icon = option.icon;
              const isEnabled = preferences[option.type]?.is_enabled || false;

              const colorConfig: Record<string, string> = {
                blue: 'bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400',
                green: 'bg-green-100 dark:bg-green-950/60 text-green-600 dark:text-green-400',
                purple: 'bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400',
                orange: 'bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400',
                cyan: 'bg-cyan-100 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400',
              };

              return (
                <motion.div
                  key={option.type}
                  whileHover={{ scale: 1.01 }}
                  className={`p-5 rounded-xl border-2 transition-all cursor-pointer ${
                    isEnabled
                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800'
                  }`}
                  onClick={() => handleTogglePreference(option.type)}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl ${colorConfig[option.color]} flex items-center justify-center flex-shrink-0`}>
                      <Icon className="w-6 h-6" />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">{option.title}</h4>
                        <button
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            isEnabled ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-600'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              isEnabled ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400">{option.description}</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Preferred Delivery Time */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Preferred Delivery Window</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Set your preferred time range for deliveries</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Start Time</label>
            <input
              type="time"
              value={preferredTimeStart}
              onChange={(e) => setPreferredTimeStart(e.target.value)}
              className="w-full px-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">End Time</label>
            <input
              type="time"
              value={preferredTimeEnd}
              onChange={(e) => setPreferredTimeEnd(e.target.value)}
              className="w-full px-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>
        </div>
      </div>

      {/* Delivery Instructions */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Special Delivery Instructions</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Provide specific instructions for delivery agents
            </p>
          </div>
        </div>

        <textarea
          value={deliveryInstructions}
          onChange={(e) => setDeliveryInstructions(e.target.value)}
          rows={4}
          placeholder="e.g., Ring doorbell twice, Leave package at side gate, Building entry code: #1234"
          className="w-full px-4 py-3 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-emerald-500 outline-none resize-none"
        />

        <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-bold text-blue-800 dark:text-blue-200 mb-1">Helpful Tips</p>
            <ul className="text-xs text-blue-600 dark:text-blue-400 space-y-1">
              <li>• Include building/gate codes if applicable</li>
              <li>• Mention specific landmarks for easy location</li>
              <li>• Indicate where to leave packages safely</li>
              <li>• Provide alternative contact numbers if needed</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSaveSettings}
          disabled={saving}
          className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-emerald-600/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center gap-2"
        >
          {saving ? (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
              />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Save Preferences
            </>
          )}
        </button>
      </div>
    </div>
  );
};
