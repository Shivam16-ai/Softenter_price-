import React, { useState, useEffect } from 'react';
import { Truck, Search, FileText } from 'lucide-react';
import { api } from '../../services/api';
import { User, Parcel } from '../../../shared/types';
import { TableSkeleton } from '../../components/common/SkeletonLoader';

export const AdminCouriers: React.FC = () => {
  const [agents, setAgents] = useState<User[]>([]);
  const [parcels, setParcels] = useState<Parcel[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
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
      console.error('Failed to load courier data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (userId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'active' ? 'suspended' : 'active';
    try {
      await api.updateUserStatus(userId, nextStatus as any);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to update status');
    }
  };

  const filteredAgents = agents.filter(a => 
    a.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (a.employee_id && a.employee_id.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">Fleet Couriers</h1>
        <p className="text-sm text-slate-400">Manage delivery agents and fleet operations</p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search couriers by name or employee ID..."
          className="w-full pl-10 pr-4 py-2 bg-[#0d1117] border border-white/10 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Table */}
      <div className="bg-[#0d1117] border border-white/10 rounded-xl overflow-hidden">
        <div className="p-5 border-b border-white/10">
          <h2 className="text-lg font-bold text-white">Courier Personnel</h2>
          <p className="text-xs text-slate-400 mt-1">Registered delivery agents and drivers</p>
        </div>

        {loading ? (
          <TableSkeleton rows={5} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0a0e1a] border-b border-white/10 text-slate-400 font-bold uppercase">
                <tr>
                  <th className="py-3.5 px-4">Courier & Depot</th>
                  <th className="py-3.5 px-4">Employee ID & Vehicle</th>
                  <th className="py-3.5 px-4">Contact</th>
                  <th className="py-3.5 px-4">Verification</th>
                  <th className="py-3.5 px-4">Active Load</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredAgents.map((agent) => {
                  const agentLoad = parcels.filter(
                    p => p.assigned_agent_id === agent.id && p.status !== 'delivered' && p.status !== 'cancelled'
                  ).length;

                  const isPending = agent.verification_status === 'pending_verification';
                  const isApproved = agent.verification_status === 'approved' || (!agent.verification_status && agent.status === 'active');

                  return (
                    <tr key={agent.id} className="hover:bg-white/5 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-white flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
                          <Truck className="w-4 h-4" />
                        </div>
                        <div>
                          <span>{agent.full_name}</span>
                          <span className="text-[10px] text-slate-400 block font-normal">
                            {agent.company_name || agent.address || 'Regional Depot'}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-mono text-white font-bold">{agent.employee_id || 'N/A'}</div>
                        <div className="text-[10px] font-mono text-slate-400">
                          Veh: <span className="font-bold text-indigo-400">{agent.vehicle_number || 'N/A'}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-mono text-slate-300">{agent.company_email || agent.email}</div>
                        <div className="text-[10px] text-slate-400">{agent.phone || 'N/A'}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        {isPending && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-500/20 text-amber-400 border border-amber-500/30">
                            Pending
                          </span>
                        )}
                        {isApproved && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            Approved
                          </span>
                        )}
                        {agent.id_document_path && (
                          <a
                            href={`/api/admin/agents/${agent.id}/document`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-[11px] text-blue-400 hover:underline mt-1"
                          >
                            <FileText className="w-3 h-3" />
                            View ID
                          </a>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-indigo-400">
                        {agentLoad} parcels
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => handleToggleStatus(agent.id, agent.status)}
                          className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                            agent.status === 'active'
                              ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30'
                              : 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/30'
                          }`}
                        >
                          {agent.status === 'active' ? 'Suspend' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
