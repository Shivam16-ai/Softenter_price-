import React, { useState, useEffect } from 'react';
import { Search, Truck, Eye, Clock } from 'lucide-react';
import { api } from '../../services/api';
import { Parcel, User } from '../../../shared/types';
import { StatusBadge } from '../../components/common/StatusBadge';
import { TableSkeleton } from '../../components/common/SkeletonLoader';
import { EmptyState } from '../../components/common/EmptyState';
import { InvoiceModal } from '../../components/common/InvoiceModal';
import { TrackingTimeline } from '../../components/common/TrackingTimeline';

export const AdminDispatch: React.FC = () => {
  const [parcels, setParcels] = useState<Parcel[]>([]);
  const [agents, setAgents] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);
  const [selectedTrackingData, setSelectedTrackingData] = useState<any>(null);
  const [assignParcel, setAssignParcel] = useState<Parcel | null>(null);
  const [selectedAgentId, setSelectedAgentId] = useState('');
  const [isAssigning, setIsAssigning] = useState(false);

  useEffect(() => {
    loadData();
  }, [statusFilter, searchQuery]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [parcelsRes, usersRes] = await Promise.allSettled([
        api.getParcels({ status: statusFilter, search: searchQuery }),
        api.getAdminUsers()
      ]);

      if (parcelsRes.status === 'fulfilled') {
        setParcels(parcelsRes.value.data || []);
      }
      if (usersRes.status === 'fulfilled') {
        const users = usersRes.value.data || [];
        setAgents(users.filter(u => u.role === 'agent'));
      }
    } catch (error) {
      console.error('Failed to load dispatch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignParcel || !selectedAgentId) return;

    setIsAssigning(true);
    try {
      await api.assignAgent(assignParcel.id, selectedAgentId);
      setAssignParcel(null);
      setSelectedAgentId('');
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to assign agent');
    } finally {
      setIsAssigning(false);
    }
  };

  const handleViewTracking = async (parcelId: string) => {
    try {
      const res = await api.getParcelById(parcelId);
      setSelectedTrackingData(res.data);
    } catch (err: any) {
      alert(err.message || 'Failed to view tracking');
    }
  };

  const statusFilters = ['all', 'pending', 'assigned', 'picked_up', 'in_transit', 'out_for_delivery', 'delivered'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">
          Consignment Dispatch & Fleet Allocation
        </h1>
        <p className="text-sm text-slate-400">
          Manage shipment assignments and monitor delivery operations
        </p>
      </div>

      {/* Filters */}
      <div className="bg-[#0d1117] border border-white/10 rounded-xl p-4 flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tracking, recipient, shipper..."
            className="w-full pl-10 pr-4 py-2 bg-[#0a0e1a] border border-white/10 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto">
          {statusFilters.map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                statusFilter === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-[#0a0e1a] text-slate-400 hover:text-white border border-white/10'
              }`}
            >
              {status.replace('_', ' ').toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#0d1117] border border-white/10 rounded-xl overflow-hidden">
        {loading ? (
          <TableSkeleton rows={5} />
        ) : parcels.length === 0 ? (
          <EmptyState
            title="No shipments found"
            description="Try adjusting your search or filters"
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0a0e1a] border-b border-white/10 text-slate-400 font-bold uppercase">
                <tr>
                  <th className="py-3.5 px-4">Tracking Number</th>
                  <th className="py-3.5 px-4">Shipper & Recipient</th>
                  <th className="py-3.5 px-4">Type & Weight</th>
                  <th className="py-3.5 px-4">Assigned Agent</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {parcels.map((p) => (
                  <tr key={p.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-white">
                      <button
                        onClick={() => handleViewTracking(p.id)}
                        className="text-blue-400 hover:underline flex items-center gap-1"
                      >
                        {p.tracking_number}
                        <Eye className="w-3 h-3" />
                      </button>
                      <span className="text-[10px] text-slate-500 block mt-0.5">
                        {new Date(p.created_at).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-white">To: {p.recipient_name}</div>
                      <div className="text-[11px] text-slate-400 truncate max-w-xs">
                        From: {p.sender_name || 'Commercial Shipper'}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-slate-800 text-slate-300">
                        {p.parcel_type}
                      </span>
                      <span className="text-[10px] text-slate-400 block mt-0.5 font-mono">{p.weight_kg} kg</span>
                    </td>
                    <td className="py-3.5 px-4">
                      {p.assigned_agent_name ? (
                        <span className="font-semibold text-indigo-400 flex items-center gap-1">
                          <Truck className="w-3 h-3" />
                          {p.assigned_agent_name}
                        </span>
                      ) : (
                        <span className="text-amber-400 text-[11px] font-semibold flex items-center gap-1">
                          <Clock className="w-3 h-3" /> Unassigned
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={p.status} size="sm" />
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-1.5 whitespace-nowrap">
                      <button
                        onClick={() => {
                          setAssignParcel(p);
                          setSelectedAgentId(p.assigned_agent_id || '');
                        }}
                        className="px-2.5 py-1 bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg text-xs font-bold transition-colors"
                      >
                        Assign Fleet
                      </button>
                      <button
                        onClick={() => setSelectedInvoiceId(p.id)}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold transition-colors"
                      >
                        Invoice
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Assign Agent Modal */}
      {assignParcel && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0d1117] rounded-xl shadow-2xl max-w-md w-full border border-white/10 p-6">
            <h3 className="text-lg font-bold text-white mb-4">Assign Fleet Courier</h3>
            <form onSubmit={handleAssignSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">
                  Tracking: {assignParcel.tracking_number}
                </label>
                <select
                  value={selectedAgentId}
                  onChange={(e) => setSelectedAgentId(e.target.value)}
                  className="w-full px-3 py-2 bg-[#0a0e1a] border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select courier...</option>
                  {agents.map((agent) => (
                    <option key={agent.id} value={agent.id}>
                      {agent.full_name} - {agent.employee_id || 'N/A'}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setAssignParcel(null)}
                  className="flex-1 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAssigning}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  {isAssigning ? 'Assigning...' : 'Assign'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Invoice Modal */}
      {selectedInvoiceId && (
        <InvoiceModal
          parcelId={selectedInvoiceId}
          onClose={() => setSelectedInvoiceId(null)}
        />
      )}

      {/* Tracking Timeline Modal */}
      {selectedTrackingData && (
        <TrackingTimeline
          data={selectedTrackingData}
          onClose={() => setSelectedTrackingData(null)}
        />
      )}
    </div>
  );
};
