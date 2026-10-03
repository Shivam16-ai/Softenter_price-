import React, { useState, useEffect } from 'react';
import { CreditCard, Download } from 'lucide-react';
import { api } from '../../services/api';
import { Payment } from '../../../shared/types';
import { TableSkeleton } from '../../components/common/SkeletonLoader';

export const AdminPayments: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = async () => {
    setLoading(true);
    try {
      const res = await api.getPaymentHistory();
      setPayments(res.data || []);
    } catch (error) {
      console.error('Failed to load payments:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">Payments & Invoices</h1>
        <p className="text-sm text-slate-400">Manage payment records and invoice generation</p>
      </div>

      <div className="bg-[#0d1117] border border-white/10 rounded-xl overflow-hidden">
        <div className="p-5 border-b border-white/10">
          <h2 className="text-lg font-bold text-white">Payment History</h2>
          <p className="text-xs text-slate-400 mt-1">Recent payment transactions</p>
        </div>

        {loading ? (
          <TableSkeleton rows={5} />
        ) : payments.length === 0 ? (
          <div className="p-12 text-center">
            <CreditCard className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <p className="text-sm text-slate-400">No payment records found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0a0e1a] border-b border-white/10 text-slate-400 font-bold uppercase">
                <tr>
                  <th className="py-3.5 px-4">Payment ID</th>
                  <th className="py-3.5 px-4">Parcel ID</th>
                  <th className="py-3.5 px-4">Amount</th>
                  <th className="py-3.5 px-4">Method</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {payments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-white">{payment.id}</td>
                    <td className="py-3.5 px-4 font-mono text-slate-300">{payment.parcel_id}</td>
                    <td className="py-3.5 px-4 font-mono font-bold text-green-400">
                      ${payment.amount.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-slate-800 text-slate-300">
                        {payment.payment_method}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        payment.payment_status === 'completed'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : payment.payment_status === 'pending'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : 'bg-red-500/20 text-red-400 border border-red-500/30'
                      }`}>
                        {payment.payment_status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-300">
                      {new Date(payment.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button className="px-2.5 py-1 bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg text-xs font-bold transition-colors inline-flex items-center gap-1">
                        <Download className="w-3 h-3" />
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
    </div>
  );
};
