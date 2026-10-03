import React from 'react';
import { AlertTriangle } from 'lucide-react';

export const AdminExceptions: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">Exception & Incident Center</h1>
        <p className="text-sm text-slate-400">Monitor and resolve operational issues</p>
      </div>
      <div className="bg-[#0d1117] border border-white/10 rounded-xl p-12 text-center">
        <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-white mb-2">No Active Exceptions</h3>
        <p className="text-sm text-slate-400">All operations running smoothly</p>
      </div>
    </div>
  );
};
