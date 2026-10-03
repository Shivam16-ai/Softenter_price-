import React, { useState, useEffect } from 'react';
import { Settings, Save } from 'lucide-react';
import { api } from '../../services/api';
import { SystemSettings } from '../../../shared/types';

export const AdminConfig: React.FC = () => {
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const res = await api.getSettings();
      setSettings(res.data || null);
    } catch (error) {
      console.error('Failed to load settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;

    setSaving(true);
    try {
      await api.updateSettings(settings);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 border-3 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-slate-400">Loading configuration...</p>
        </div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-400">No settings available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">Logistics Configuration</h1>
        <p className="text-sm text-slate-400">Manage system settings and operational parameters</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Delivery Settings */}
        <div className="bg-[#0d1117] border border-white/10 rounded-xl p-6">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Delivery Configuration
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">
                Base Delivery Rate
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                <input
                  type="number"
                  step="0.01"
                  value={settings.base_delivery_rate || 0}
                  onChange={(e) => setSettings({ ...settings, base_delivery_rate: parseFloat(e.target.value) })}
                  className="w-full pl-8 pr-4 py-2 bg-[#0a0e1a] border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">
                Per KG Rate
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                <input
                  type="number"
                  step="0.01"
                  value={settings.per_kg_rate || 0}
                  onChange={(e) => setSettings({ ...settings, per_kg_rate: parseFloat(e.target.value) })}
                  className="w-full pl-8 pr-4 py-2 bg-[#0a0e1a] border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">
                Max Delivery Distance (km)
              </label>
              <input
                type="number"
                value={settings.max_distance_km || 0}
                onChange={(e) => setSettings({ ...settings, max_distance_km: parseInt(e.target.value) })}
                className="w-full px-4 py-2 bg-[#0a0e1a] border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="bg-[#0d1117] border border-white/10 rounded-xl p-6">
          <h2 className="text-lg font-bold text-white mb-4">Notification Settings</h2>
          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.email_notifications || false}
                onChange={(e) => setSettings({ ...settings, email_notifications: e.target.checked })}
                className="w-5 h-5 rounded bg-[#0a0e1a] border-white/10 text-blue-600 focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-sm text-white">Enable Email Notifications</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.sms_notifications || false}
                onChange={(e) => setSettings({ ...settings, sms_notifications: e.target.checked })}
                className="w-5 h-5 rounded bg-[#0a0e1a] border-white/10 text-blue-600 focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-sm text-white">Enable SMS Notifications</span>
            </label>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Configuration'}
          </button>
          {saved && (
            <span className="text-sm text-emerald-400 font-medium">
              ✓ Settings saved successfully
            </span>
          )}
        </div>
      </form>
    </div>
  );
};
