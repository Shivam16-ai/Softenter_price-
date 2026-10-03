import React from 'react';
import { Heart, CheckCircle, AlertCircle, XCircle } from 'lucide-react';

export const AdminSystemHealth: React.FC = () => {
  const services = [
    { name: 'Authentication Service', status: 'operational', uptime: '99.9%' },
    { name: 'API Gateway', status: 'operational', uptime: '99.8%' },
    { name: 'Database', status: 'operational', uptime: '100%' },
    { name: 'Order Service', status: 'operational', uptime: '99.7%' },
    { name: 'Shipment Service', status: 'operational', uptime: '99.9%' },
    { name: 'Delivery Service', status: 'operational', uptime: '99.5%' },
    { name: 'Notification Service', status: 'operational', uptime: '98.9%' },
    { name: 'GPS/Realtime', status: 'degraded', uptime: '95.2%' },
    { name: 'Storage Service', status: 'operational', uptime: '99.9%' }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'operational':
        return <CheckCircle className="w-5 h-5 text-emerald-400" />;
      case 'degraded':
        return <AlertCircle className="w-5 h-5 text-amber-400" />;
      case 'offline':
        return <XCircle className="w-5 h-5 text-red-400" />;
      default:
        return <CheckCircle className="w-5 h-5 text-slate-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'degraded':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'offline':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-slate-800 text-slate-400 border-slate-700';
    }
  };

  const operationalCount = services.filter(s => s.status === 'operational').length;
  const degradedCount = services.filter(s => s.status === 'degraded').length;
  const offlineCount = services.filter(s => s.status === 'offline').length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">System Health</h1>
        <p className="text-sm text-slate-400">Monitor service availability and system status</p>
      </div>

      {/* Overall Health */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#0d1117] border border-white/10 rounded-xl p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase">Operational</span>
            <CheckCircle className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="text-3xl font-black text-white">{operationalCount}</div>
          <p className="text-xs text-slate-400 mt-1">Services running</p>
        </div>

        <div className="bg-[#0d1117] border border-white/10 rounded-xl p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase">Degraded</span>
            <AlertCircle className="w-5 h-5 text-amber-400" />
          </div>
          <div className="text-3xl font-black text-white">{degradedCount}</div>
          <p className="text-xs text-slate-400 mt-1">Performance issues</p>
        </div>

        <div className="bg-[#0d1117] border border-white/10 rounded-xl p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase">Offline</span>
            <XCircle className="w-5 h-5 text-red-400" />
          </div>
          <div className="text-3xl font-black text-white">{offlineCount}</div>
          <p className="text-xs text-slate-400 mt-1">Services down</p>
        </div>
      </div>

      {/* Services Status */}
      <div className="bg-[#0d1117] border border-white/10 rounded-xl overflow-hidden">
        <div className="p-5 border-b border-white/10">
          <h2 className="text-lg font-bold text-white">Service Status</h2>
          <p className="text-xs text-slate-400 mt-1">Individual service health monitoring</p>
        </div>
        <div className="p-5 space-y-3">
          {services.map((service) => (
            <div
              key={service.name}
              className="flex items-center justify-between p-4 rounded-lg bg-[#0a0e1a] border border-white/5"
            >
              <div className="flex items-center gap-3">
                {getStatusIcon(service.status)}
                <div>
                  <p className="text-sm font-bold text-white">{service.name}</p>
                  <p className="text-xs text-slate-400">Uptime: {service.uptime}</p>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase border ${getStatusColor(service.status)}`}>
                {service.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* System Info */}
      <div className="bg-[#0d1117] border border-white/10 rounded-xl p-5">
        <h2 className="text-lg font-bold text-white mb-4">System Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-slate-400">Server Time:</span>
            <span className="ml-2 text-white font-mono">{new Date().toLocaleString()}</span>
          </div>
          <div>
            <span className="text-slate-400">Environment:</span>
            <span className="ml-2 text-white font-mono">Production</span>
          </div>
          <div>
            <span className="text-slate-400">Version:</span>
            <span className="ml-2 text-white font-mono">1.0.0</span>
          </div>
          <div>
            <span className="text-slate-400">Last Deployment:</span>
            <span className="ml-2 text-white font-mono">{new Date().toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
