import React, { useState, useEffect } from 'react';
import { Activity, Search } from 'lucide-react';
import { api } from '../../services/api';
import { ActivityLog } from '../../../shared/types';
import { TableSkeleton } from '../../components/common/SkeletonLoader';

export const AdminAuditLogs: React.FC = () => {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const res = await api.getActivityLogs();
      setLogs(res.data || []);
    } catch (error) {
      console.error('Failed to load audit logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter(log => 
    log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.details.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">System Audit Logs</h1>
        <p className="text-sm text-slate-400">Administrative and operational activity tracking</p>
      </div>

      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search audit logs..."
          className="w-full pl-10 pr-4 py-2 bg-[#0d1117] border border-white/10 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="bg-[#0d1117] border border-white/10 rounded-xl overflow-hidden">
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white">Activity Logs</h2>
            <p className="text-xs text-slate-400 mt-1">System-wide audit trail</p>
          </div>
          <span className="text-xs font-mono font-bold text-slate-400 bg-[#0a0e1a] px-3 py-1 rounded-lg">
            {filteredLogs.length} Records
          </span>
        </div>

        {loading ? (
          <TableSkeleton rows={10} />
        ) : filteredLogs.length === 0 ? (
          <div className="p-12 text-center">
            <Activity className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <p className="text-sm text-slate-400">No audit logs found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0a0e1a] border-b border-white/10 text-slate-400 font-bold uppercase">
                <tr>
                  <th className="py-3.5 px-4">Timestamp</th>
                  <th className="py-3.5 px-4">User</th>
                  <th className="py-3.5 px-4">Action</th>
                  <th className="py-3.5 px-4">Entity</th>
                  <th className="py-3.5 px-4">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-3.5 px-4 font-mono text-slate-300">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-white">{log.user_name}</div>
                      <div className="text-[10px] text-slate-400">{log.user_role}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-300">
                      {log.entity_type}
                    </td>
                    <td className="py-3.5 px-4 text-slate-300 max-w-md truncate">
                      {log.details}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
