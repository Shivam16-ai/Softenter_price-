import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Payment } from '../../../shared/types';
import { StatusBadge } from '../../components/common/StatusBadge';
import { InvoiceModal } from '../../components/common/InvoiceModal';
import { EmptyState } from '../../components/common/EmptyState';
import { formatCurrency } from '../../utils/currency';

export const PaymentsInvoices: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const paymentsRes = await api.getPaymentHistory();
      setPayments(paymentsRes.data || []);
    } catch (err) {
      console.error('Failed to load payment data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Payments & Invoices
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Review verified payment history, audit invoices, and settlement receipts.
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Commercial Settlement Ledger</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Audit-ready transactions and electronic payment receipts.</p>
          </div>
          <span className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-xl">
            {payments.length} Transactions
          </span>
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-500">Loading payment history...</div>
        ) : payments.length === 0 ? (
          <EmptyState
            title="No settlement records"
            description="You have no recorded payments in your billing ledger."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Transaction Reference</th>
                  <th className="py-3.5 px-4">Consignment</th>
                  <th className="py-3.5 px-4">Instrument</th>
                  <th className="py-3.5 px-4">Amount</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Timestamp</th>
                  <th className="py-3.5 px-4 text-right">Invoice</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {payments.map((pay) => (
                  <tr key={pay.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white">
                      {pay.transaction_id}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-blue-600 dark:text-blue-400 font-semibold">
                      {pay.tracking_number}
                    </td>
                    <td className="py-3.5 px-4 capitalize text-slate-700 dark:text-slate-300 font-medium">
                      {pay.payment_method.replace('_', ' ')}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white">
                      {formatCurrency(pay.amount)}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={pay.status} type="payment" size="sm" />
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                      {new Date(pay.created_at).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setSelectedInvoiceId(pay.parcel_id)}
                        className="px-3 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                      >
                        View Receipt
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Invoice Modal */}
      {selectedInvoiceId && (
        <InvoiceModal
          parcelId={selectedInvoiceId}
          onClose={() => setSelectedInvoiceId(null)}
        />
      )}
    </div>
  );
};
