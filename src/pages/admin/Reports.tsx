import React from 'react';
import { FileText, Download, Calendar } from 'lucide-react';

export const AdminReports: React.FC = () => {
  const reports = [
    { name: 'Shipment Report', description: 'Complete shipment analytics' },
    { name: 'Courier Performance', description: 'Delivery agent metrics' },
    { name: 'Revenue Report', description: 'Financial performance data' },
    { name: 'Delivery Success Report', description: 'Success rate analysis' },
    { name: 'Failed Delivery Report', description: 'Exception analysis' },
    { name: 'Shipper Report', description: 'Customer activity report' },
    { name: 'Audit Report', description: 'System activity logs' }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">Reports</h1>
        <p className="text-sm text-slate-400">Generate and export operational reports</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {reports.map((report) => (
          <div key={report.name} className="bg-[#0d1117] border border-white/10 rounded-xl p-5 hover:border-white/20 transition-colors">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white mb-1">{report.name}</h3>
                <p className="text-xs text-slate-400">{report.description}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="flex-1 px-3 py-2 bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1">
                <Download className="w-3 h-3" />
                Export CSV
              </button>
              <button className="flex-1 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1">
                <Calendar className="w-3 h-3" />
                Schedule
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-[#0d1117] border border-white/10 rounded-xl p-6">
        <h2 className="text-lg font-bold text-white mb-4">Report Configuration</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Date Range</label>
            <div className="flex gap-2">
              <input
                type="date"
                className="flex-1 px-3 py-2 bg-[#0a0e1a] border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-slate-400 flex items-center">to</span>
              <input
                type="date"
                className="flex-1 px-3 py-2 bg-[#0a0e1a] border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-sm transition-colors">
            Generate Custom Report
          </button>
        </div>
      </div>
    </div>
  );
};
