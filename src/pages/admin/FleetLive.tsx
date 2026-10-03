import React, { useState, useEffect } from 'react';
import { MapPin, Truck, Clock, Navigation } from 'lucide-react';
import { api } from '../../services/api';
import { User, Parcel } from '../../../shared/types';

export const AdminFleetLive: React.FC = () => {
  const [agents, setAgents] = useState<User[]>([]);
  const [parcels, setParcels] = useState<Parcel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFleetData();
  }, []);

  const loadFleetData = async () => {
    setLoading(true);
    try {
      const [usersRes, parcelsRes] = await Promise.allSettled([
        api.getAdminUsers(),
        api.getParcels({ status: 'all' })
      ]);

      if (usersRes.status === 'fulfilled') {
        const users = usersRes.value.data || [];
        setAgents(users.filter(u => u.role === 'agent'));
      }
      if (parcelsRes.status === 'fulfilled') {
        setParcels(parcelsRes.value.data || []);
      }
    } catch (error) {
      console.error('Failed to load fleet data:', error);
    } finally {
      setLoading(false);
    }
  };

  const activeCouriers = agents.filter(a => a.status === 'active');
  const availableCouriers = agents.filter(a => a.status === 'active' && !parcels.some(p => p.assigned_agent_id === a.id && p.status !== 'delivered'));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 border-3 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-slate-400">Loading fleet operations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">
          Live Fleet Operations
        </h1>
        <p className="text-sm text-slate-400">
          Real-time courier tracking and delivery monitoring
        </p>
      </div>

      {/* Fleet Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#0d1117] border border-white/10 rounded-xl p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase">Active Couriers</span>
            <Truck className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white">{activeCouriers.length}</div>
          <p className="text-xs text-slate-400 mt-1">On duty</p>
        </div>

        <div className="bg-[#0d1117] border border-white/10 rounded-xl p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase">Available</span>
            <Clock className="w-5 h-5 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-white">{availableCouriers.length}</div>
          <p className="text-xs text-slate-400 mt-1">Ready for assignment</p>
        </div>

        <div className="bg-[#0d1117] border border-white/10 rounded-xl p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase">On Delivery</span>
            <Navigation className="w-5 h-5 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-white">{activeCouriers.length - availableCouriers.length}</div>
          <p className="text-xs text-slate-400 mt-1">Currently delivering</p>
        </div>
      </div>

      {/* Fleet List */}
      <div className="bg-[#0d1117] border border-white/10 rounded-xl overflow-hidden">
        <div className="p-5 border-b border-white/10">
          <h2 className="text-lg font-bold text-white">Fleet Status</h2>
          <p className="text-xs text-slate-400 mt-1">Current courier operations</p>
        </div>
        <div className="p-5 space-y-3">
          {agents.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-8">No couriers available</p>
          ) : (
            agents.map((agent) => {
              const assignedParcels = parcels.filter(p => p.assigned_agent_id === agent.id && p.status !== 'delivered');
              const isActive = agent.status === 'active';

              return (
                <div
                  key={agent.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-[#0a0e1a] border border-white/5"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      isActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400'
                    }`}>
                      <Truck className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">{agent.full_name}</p>
                      <p className="text-xs text-slate-400">{agent.employee_id || 'N/A'} • {agent.vehicle_number || 'No vehicle'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      isActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {isActive ? 'ACTIVE' : 'OFFLINE'}
                    </span>
                    {assignedParcels.length > 0 && (
                      <p className="text-xs text-slate-400 mt-1">{assignedParcels.length} active deliveries</p>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Map Placeholder */}
      <div className="bg-[#0d1117] border border-white/10 rounded-xl p-8 text-center">
        <MapPin className="w-12 h-12 text-slate-600 mx-auto mb-3" />
        <p className="text-sm text-slate-400">Real-time GPS tracking map integration</p>
        <p className="text-xs text-slate-500 mt-1">Connect GPS/WebSocket service for live tracking</p>
      </div>
    </div>
  );
};
