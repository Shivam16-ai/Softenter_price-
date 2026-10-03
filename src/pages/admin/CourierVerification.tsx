import React, { useState, useEffect } from 'react';
import { ShieldCheck, UserCheck, UserX, FileText } from 'lucide-react';
import { api } from '../../services/api';
import { User } from '../../../shared/types';

export const AdminCourierVerification: React.FC = () => {
  const [pendingAgents, setPendingAgents] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPendingAgents();
  }, []);

  const loadPendingAgents = async () => {
    setLoading(true);
    try {
      const res = await api.getAdminUsers();
      const users = res.data || [];
      const agents = users.filter(u => u.role === 'agent' && u.verification_status === 'pending_verification');
      setPendingAgents(agents);
    } catch (error) {
      console.error('Failed to load pending agents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerification = async (agentId: string, status: 'approved' | 'rejected') => {
    try {
      await api.updateAgentVerification(agentId, status);
      loadPendingAgents();
    } catch (err: any) {
      alert(err.message || `Failed to ${status} agent`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 border-3 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-slate-400">Loading verification queue...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">Courier Verification</h1>
        <p className="text-sm text-slate-400">Review and approve delivery agent registrations</p>
      </div>

      {pendingAgents.length === 0 ? (
        <div className="bg-[#0d1117] border border-white/10 rounded-xl p-12 text-center">
          <ShieldCheck className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-white mb-2">All Caught Up!</h3>
          <p className="text-sm text-slate-400">No pending courier verifications</p>
        </div>
      ) : (
        <div className="space-y-4">
          {pendingAgents.map((agent) => (
            <div key={agent.id} className="bg-[#0d1117] border border-white/10 rounded-xl p-6">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                <div className="flex-1 space-y-4">
                  <div>
                    <h3 className="text-lg font-bold text-white mb-1">{agent.full_name}</h3>
                    <span className="px-2 py-1 rounded bg-amber-500/20 text-amber-400 text-xs font-bold">
                      PENDING VERIFICATION
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-slate-400 uppercase font-bold mb-1">Employee ID</p>
                      <p className="text-sm text-white font-mono">{agent.employee_id || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 uppercase font-bold mb-1">Email</p>
                      <p className="text-sm text-white font-mono">{agent.company_email || agent.email}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 uppercase font-bold mb-1">Phone</p>
                      <p className="text-sm text-white">{agent.phone || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 uppercase font-bold mb-1">Company</p>
                      <p className="text-sm text-white">{agent.company_name || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 uppercase font-bold mb-1">Vehicle Number</p>
                      <p className="text-sm text-white font-mono">{agent.vehicle_number || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 uppercase font-bold mb-1">Department</p>
                      <p className="text-sm text-white">{agent.department || 'N/A'}</p>
                    </div>
                  </div>

                  {agent.id_document_path && (
                    <div>
                      <p className="text-xs text-slate-400 uppercase font-bold mb-2">Identity Document</p>
                      <a
                        href={`/api/admin/agents/${agent.id}/document`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg text-sm font-medium transition-colors"
                      >
                        <FileText className="w-4 h-4" />
                        View ID Document
                      </a>
                    </div>
                  )}

                  <div>
                    <p className="text-xs text-slate-400 uppercase font-bold mb-1">Submission Date</p>
                    <p className="text-sm text-white">{new Date(agent.created_at).toLocaleString()}</p>
                  </div>
                </div>

                <div className="flex lg:flex-col gap-2">
                  <button
                    onClick={() => handleVerification(agent.id, 'approved')}
                    className="flex-1 lg:flex-none px-4 py-2 bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/30 rounded-lg font-bold text-sm transition-colors flex items-center justify-center gap-2"
                  >
                    <UserCheck className="w-4 h-4" />
                    Approve
                  </button>
                  <button
                    onClick={() => handleVerification(agent.id, 'rejected')}
                    className="flex-1 lg:flex-none px-4 py-2 bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30 rounded-lg font-bold text-sm transition-colors flex items-center justify-center gap-2"
                  >
                    <UserX className="w-4 h-4" />
                    Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
