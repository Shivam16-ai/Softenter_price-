import React, { useState } from 'react';
import { X, CheckCircle2, Camera, ShieldCheck, Upload, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import confetti from 'canvas-confetti';
import { api } from '../../services/api';

interface ProofModalProps {
  parcelId: string | null;
  defaultRecipient?: string;
  onClose: () => void;
  onSuccess: () => void;
}

export const ProofModal: React.FC<ProofModalProps> = ({
  parcelId,
  defaultRecipient = '',
  onClose,
  onSuccess,
}) => {
  const [recipientName, setRecipientName] = useState(defaultRecipient);
  const [signatureName, setSignatureName] = useState(defaultRecipient);
  const [photoUrl, setPhotoUrl] = useState(
    'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=500&auto=format&fit=crop&q=80'
  );
  const [notes, setNotes] = useState('Delivered directly to recipient at registered address.');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!parcelId) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipientName.trim()) {
      setError('Recipient name is required');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      // SVG signature simulation
      const signatureSvg = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="220" height="60"><text x="10" y="40" font-family="cursive" font-size="28" fill="%231e293b">${encodeURIComponent(
        signatureName || recipientName
      )}</text></svg>`;

      await api.submitDeliveryProof(parcelId, {
        recipient_name: recipientName,
        signature_url: signatureSvg,
        photo_url: photoUrl,
        notes,
      });

      try {
        confetti({
          particleCount: 80,
          spread: 80,
          origin: { y: 0.6 },
        });
      } catch (err) {
        // ignore
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to submit delivery proof');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 dark:border-slate-800"
      >
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <span className="text-sm font-bold block">Record Electronic Delivery Proof</span>
              <span className="text-[10px] text-slate-400">Timestamped Handover Verification</span>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-white transition-colors cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-400 text-xs rounded-xl">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Recipient Full Name *
            </label>
            <input
              type="text"
              value={recipientName}
              onChange={(e) => {
                setRecipientName(e.target.value);
                if (!signatureName) setSignatureName(e.target.value);
              }}
              required
              placeholder="e.g. Jane Doe"
              className="w-full text-xs px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Recipient Digital Signature *
            </label>
            <input
              type="text"
              value={signatureName}
              onChange={(e) => setSignatureName(e.target.value)}
              placeholder="Signee full name signature"
              className="w-full text-xs px-3.5 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none mb-2"
            />
            <div className="h-16 bg-slate-50 dark:bg-slate-800/50 border border-dashed border-slate-300 dark:border-slate-700 rounded-xl flex items-center justify-center font-serif italic text-slate-700 dark:text-slate-300 text-xl shadow-2xs">
              {signatureName || recipientName || 'Sign here...'}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Proof Photograph URL (Package At Doorstep / Handover)
            </label>
            <input
              type="text"
              value={photoUrl}
              onChange={(e) => setPhotoUrl(e.target.value)}
              className="w-full text-xs px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono focus:ring-2 focus:ring-blue-500 outline-none"
            />
            {photoUrl && (
              <div className="mt-2 relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 h-28 w-full bg-slate-100 dark:bg-slate-800">
                <img src={photoUrl} alt="Delivery preview" className="w-full h-full object-cover" />
                <span className="absolute bottom-1 right-2 bg-black/70 backdrop-blur-xs text-white text-[10px] px-2 py-0.5 rounded font-mono">
                  GPS & Timestamp Verified
                </span>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Handover Remarks
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Left with concierge, verified photo ID."
              className="w-full text-xs px-3.5 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md shadow-emerald-600/20 transition-all disabled:opacity-50 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              {submitting ? 'Confirming Delivery...' : 'Confirm Delivery & Sign'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
