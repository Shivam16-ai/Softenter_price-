import React, { useEffect, useState } from 'react';
import { X, Printer, Download, CheckCircle, Clock, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { api } from '../../services/api';
import { formatCurrency } from '../../utils/currency';

interface InvoiceModalProps {
  parcelId: string | null;
  onClose: () => void;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({ parcelId, onClose }) => {
  const [invoice, setInvoice] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!parcelId) return;
    const fetchInvoice = async () => {
      setLoading(true);
      try {
        const res = await api.getInvoice(parcelId);
        setInvoice(res.data);
      } catch (err: any) {
        setError(err.message || 'Failed to load invoice');
      } finally {
        setLoading(false);
      }
    };
    fetchInvoice();
  }, [parcelId]);

  if (!parcelId) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-200 dark:border-slate-800"
      >
        {/* Modal Bar */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <span className="text-sm font-bold text-slate-900 dark:text-slate-100 block">Commercial Shipping Invoice</span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">Reference #{invoice?.invoiceNumber || '...'}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              Print
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Invoice Body */}
        <div className="p-8 max-h-[80vh] overflow-y-auto print:p-0 print:bg-white print:text-black">
          {loading ? (
            <div className="py-16 text-center text-slate-500 text-sm">
              <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              Retrieving commercial logistics ledger...
            </div>
          ) : error ? (
            <div className="py-8 text-center text-rose-600 text-sm">{error}</div>
          ) : invoice ? (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex justify-between items-start border-b border-slate-200 dark:border-slate-800 pb-6">
                <div>
                  <h2 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">{invoice.company.name}</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{invoice.company.address}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Support: {invoice.company.email} | {invoice.company.phone}</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 font-mono mt-0.5">Tax ID: {invoice.company.taxId}</p>
                </div>
                <div className="text-right">
                  <span className="inline-block text-xs font-mono font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-2.5 py-1 rounded-lg border border-blue-200 dark:border-blue-800">
                    {invoice.invoiceNumber}
                  </span>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                    Date: {new Date(invoice.invoiceDate).toLocaleDateString()}
                  </p>
                  <div className="mt-2">
                    {invoice.paymentStatus === 'paid' ? (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                        <CheckCircle className="w-3.5 h-3.5" />
                        PAID IN FULL
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2.5 py-0.5 rounded-full border border-amber-200 dark:border-amber-800">
                        <Clock className="w-3.5 h-3.5" />
                        PAYMENT PENDING
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Parties */}
              <div className="grid grid-cols-2 gap-6 text-xs border-b border-slate-200 dark:border-slate-800 pb-6">
                <div>
                  <h4 className="font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Shipper / Sender:</h4>
                  <p className="font-bold text-slate-900 dark:text-slate-100 text-sm">{invoice.sender.name}</p>
                  <p className="text-slate-600 dark:text-slate-300 mt-0.5">{invoice.sender.address}</p>
                  <p className="text-slate-500 dark:text-slate-400 mt-0.5">{invoice.sender.phone}</p>
                </div>
                <div>
                  <h4 className="font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Consignee / Recipient:</h4>
                  <p className="font-bold text-slate-900 dark:text-slate-100 text-sm">{invoice.recipient.name}</p>
                  <p className="text-slate-600 dark:text-slate-300 mt-0.5">{invoice.recipient.address}</p>
                  <p className="text-slate-500 dark:text-slate-400 mt-0.5">{invoice.recipient.phone}</p>
                </div>
              </div>

              {/* Consignment Specs */}
              <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800 text-xs flex justify-between items-center">
                <div>
                  <span className="text-slate-500 dark:text-slate-400">Tracking Reference: </span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">{invoice.parcelDetails.trackingNumber}</span>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400">Category: </span>
                  <span className="font-semibold text-slate-900 dark:text-white uppercase">{invoice.parcelDetails.type}</span>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400">Weight: </span>
                  <span className="font-semibold text-slate-900 dark:text-white">{invoice.parcelDetails.weight}</span>
                </div>
              </div>

              {/* Line Items Table */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="py-3 px-4">Service Description</th>
                      <th className="py-3 px-4 text-right">Amount (INR)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                    {invoice.charges.map((c: any, i: number) => (
                      <tr key={i}>
                        <td className="py-2.5 px-4 text-slate-700 dark:text-slate-300">{c.description}</td>
                        <td className="py-2.5 px-4 text-right font-mono text-slate-900 dark:text-slate-100 font-semibold">
                          {formatCurrency(c.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-slate-50 dark:bg-slate-800/50 font-semibold text-xs border-t border-slate-200 dark:border-slate-800">
                    <tr>
                      <td className="py-2 px-4 text-slate-500 dark:text-slate-400">Subtotal</td>
                      <td className="py-2 px-4 text-right font-mono text-slate-800 dark:text-slate-200">{formatCurrency(invoice.subtotal)}</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-4 text-slate-500 dark:text-slate-400">Tax / Regulatory Handling Fee</td>
                      <td className="py-2 px-4 text-right font-mono text-slate-800 dark:text-slate-200">{formatCurrency(invoice.tax)}</td>
                    </tr>
                    <tr className="border-t-2 border-slate-300 dark:border-slate-700 text-sm">
                      <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">Total Settled Amount</td>
                      <td className="py-3 px-4 text-right font-mono font-black text-blue-600 dark:text-blue-400 text-base">
                        {formatCurrency(invoice.total)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Settlement Reference */}
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl text-xs text-slate-600 dark:text-slate-300 flex justify-between items-center border border-slate-200 dark:border-slate-800">
                <div>
                  <span className="text-slate-400 dark:text-slate-500">Payment Reference: </span>
                  <span className="font-mono font-medium text-slate-800 dark:text-slate-200">{invoice.transactionId}</span>
                </div>
                <div>
                  <span className="text-slate-400 dark:text-slate-500">Method: </span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 uppercase">{invoice.paymentMethod}</span>
                </div>
              </div>

              <div className="text-[11px] text-center text-slate-400 dark:text-slate-500 pt-2">
                Thank you for choosing SwiftRoute Logistics. All consignments are insured under standard freight carriage terms.
              </div>
            </div>
          ) : null}
        </div>
      </motion.div>
    </div>
  );
};
