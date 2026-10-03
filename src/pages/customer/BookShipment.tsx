import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { ParcelType } from '../../../shared/types';

export const BookShipment: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [bookingSubmitting, setBookingSubmitting] = useState(false);
  const [bookingSuccessMsg, setBookingSuccessMsg] = useState<string | null>(null);

  const [bookData, setBookData] = useState({
    recipient_name: '',
    recipient_phone: '',
    recipient_email: '',
    pickup_address: user?.address || '582 Market St, Floor 14, San Francisco, CA 94104',
    delivery_address: '',
    weight_kg: 2.5,
    dimensions: '30x20x15 cm',
    parcel_type: 'standard' as ParcelType,
    special_instructions: '',
  });

  const handleBookSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBookingSubmitting(true);
    setBookingSuccessMsg(null);
    try {
      const res = await api.bookParcel(bookData);
      setBookingSuccessMsg(`Consignment created! Tracking Number: ${res.data?.tracking_number}`);
      try {
        confetti({
          particleCount: 75,
          spread: 80,
          origin: { y: 0.6 },
        });
      } catch (err) {}

      setBookData({
        recipient_name: '',
        recipient_phone: '',
        recipient_email: '',
        pickup_address: user?.address || '',
        delivery_address: '',
        weight_kg: 2.5,
        dimensions: '30x20x15 cm',
        parcel_type: 'standard',
        special_instructions: '',
      });

      setTimeout(() => {
        navigate('/customer/parcels');
      }, 2400);
    } catch (err: any) {
      alert(err.message || 'Booking failed');
    } finally {
      setBookingSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Book New Shipment
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Enter consignee details and dispatch your next consignment.
        </p>
      </div>

      <div className="max-w-3xl mx-auto">
        <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl transition-colors">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
            Dispatch Freight Consignment
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
            Complete the dispatch manifest. Shipping rates will be computed according to freight tier and weight.
          </p>

          {bookingSuccessMsg && (
            <div className="mb-6 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-400 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span className="font-semibold">{bookingSuccessMsg}</span>
            </div>
          )}

          <form onSubmit={handleBookSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Consignee / Recipient Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={bookData.recipient_name}
                  onChange={(e) => setBookData({ ...bookData, recipient_name: e.target.value })}
                  placeholder="e.g. David Sterling"
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800/70 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Recipient Contact Phone *
                </label>
                <input
                  type="tel"
                  required
                  value={bookData.recipient_phone}
                  onChange={(e) => setBookData({ ...bookData, recipient_phone: e.target.value })}
                  placeholder="+1 (555) 492-1084"
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800/70 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Recipient Email (For Delivery Notifications)
              </label>
              <input
                type="email"
                value={bookData.recipient_email}
                onChange={(e) => setBookData({ ...bookData, recipient_email: e.target.value })}
                placeholder="david@company.com"
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800/70 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Origin Pickup Address *
                </label>
                <textarea
                  rows={2}
                  required
                  value={bookData.pickup_address}
                  onChange={(e) => setBookData({ ...bookData, pickup_address: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800/70 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Destination Delivery Address *
                </label>
                <textarea
                  rows={2}
                  required
                  value={bookData.delivery_address}
                  onChange={(e) => setBookData({ ...bookData, delivery_address: e.target.value })}
                  placeholder="e.g. 742 Evergreen Terrace, Springfield, OR"
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800/70 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Freight Category
                </label>
                <select
                  value={bookData.parcel_type}
                  onChange={(e) => setBookData({ ...bookData, parcel_type: e.target.value as ParcelType })}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800/70 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="standard">Standard Ground</option>
                  <option value="express">Express Priority Air</option>
                  <option value="fragile">Fragile Handling</option>
                  <option value="heavy">Heavy Freight</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Weight (kg) *
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  max="100"
                  required
                  value={bookData.weight_kg}
                  onChange={(e) => setBookData({ ...bookData, weight_kg: parseFloat(e.target.value) || 0.1 })}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800/70 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Package Dimensions
                </label>
                <input
                  type="text"
                  value={bookData.dimensions}
                  onChange={(e) => setBookData({ ...bookData, dimensions: e.target.value })}
                  placeholder="30x20x15 cm"
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800/70 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Courier Special Instructions
              </label>
              <input
                type="text"
                value={bookData.special_instructions}
                onChange={(e) => setBookData({ ...bookData, special_instructions: e.target.value })}
                placeholder="e.g. Ring doorbell, security gate code #4921"
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800/70 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => navigate('/customer/parcels')}
                className="px-4 py-2.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={bookingSubmitting}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-600/20 transition-all disabled:opacity-50 cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                {bookingSubmitting ? 'Registering Consignment...' : 'Book & Generate Waybill'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
