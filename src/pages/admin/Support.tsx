import React from 'react';
import { HeadphonesIcon } from 'lucide-react';

export const AdminSupport: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">Support Center</h1>
        <p className="text-sm text-slate-400">Manage customer support tickets and inquiries</p>
      </div>
      <div className="bg-[#0d1117] border border-white/10 rounded-xl p-12 text-center">
        <HeadphonesIcon className="w-12 h-12 text-blue-500 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-white mb-2">Support Center</h3>
        <p className="text-sm text-slate-400">No active support tickets</p>
      </div>
    </div>
  );
};
