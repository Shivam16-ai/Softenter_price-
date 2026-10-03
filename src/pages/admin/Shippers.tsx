import React, { useState, useEffect } from 'react';
import { Building2, Search } from 'lucide-react';
import { api } from '../../services/api';
import { User } from '../../../shared/types';
import { TableSkeleton } from '../../components/common/SkeletonLoader';

export const AdminShippers: React.FC = () => {
  const [customers, setCustomers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    setLoading(true);
    try {
      const res = await api.getAdminUsers();
      const users = res.data || [];
      setCustomers(users.filter(u => u.role === 'customer'));
    } catch (error) {
      console.error('Failed to load customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (userId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'active' ? 'suspended' : 'active';
    try {
      await api.updateUserStatus(userId, nextStatus as any);
      loadCustomers();
    } catch (err: any) {
      alert(err.message || 'Failed to update user status');
    }
  };

  const filteredCustomers = customers.filter(c => 
    c.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">Commercial Shippers</h1>
        <p className="text-sm text-slate-400">Manage shipper accounts and corporate clients</p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search shippers..."
          className="w-full pl-10 pr-4 py-2 bg-[#0d1117] border border-white/10 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Table */}
      <div className="bg-[#0d1117] border border-white/10 rounded-xl overflow-hidden">
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white">Registered Shippers</h2>
            <p className="text-xs text-slate-400 mt-1">Corporate accounts and enterprise clients</p>
          </div>
          <span className="text-xs font-mono font-bold text-slate-400 bg-[#0a0e1a] px-3 py-1 rounded-lg">
            {filteredCustomers.length} Shippers
          </span>
        </div>

        {loading ? (
          <TableSkeleton rows={5} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0a0e1a] border-b border-white/10 text-slate-400 font-bold uppercase">
                <tr>
                  <th className="py-3.5 px-4">Organization</th>
                  <th className="py-3.5 px-4">Email</th>
                  <th className="py-3.5 px-4">Phone</th>
                  <th className="py-3.5 px-4">Address</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredCustomers.map((cust) => (
                  <tr key={cust.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-white flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs font-bold">
                        {cust.full_name.charAt(0)}
                      </div>
                      {cust.full_name}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-300">{cust.email}</td>
                    <td className="py-3.5 px-4 text-slate-300">{cust.phone || 'N/A'}</td>
                    <td className="py-3.5 px-4 text-slate-300 truncate max-w-xs">{cust.address || 'N/A'}</td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        cust.status === 'active'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-red-500/20 text-red-400 border border-red-500/30'
                      }`}>
                        {cust.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleToggleStatus(cust.id, cust.status)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                          cust.status === 'active'
                            ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30'
                            : 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/30'
                        }`}
                      >
                        {cust.status === 'active' ? 'Suspend' : 'Activate'}
                      </button>
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
