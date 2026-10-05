import React, { useState } from 'react';
import { X, Package, ShoppingBag, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { api } from '../../services/api';
import { ExternalPlatform } from '../../../shared/types';

interface AddOrderModalProps {
  show: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const platformOptions: { value: ExternalPlatform; label: string; logo: string }[] = [
  { value: 'amazon', label: 'Amazon', logo: '📦' },
  { value: 'flipkart', label: 'Flipkart', logo: '🛒' },
  { value: 'myntra', label: 'Myntra', logo: '👔' },
  { value: 'meesho', label: 'Meesho', logo: '🛍️' },
  { value: 'ebay', label: 'eBay', logo: '🏪' },
  { value: 'etsy', label: 'Etsy', logo: '🎨' },
  { value: 'other', label: 'Other Platform', logo: '📋' },
  { value: 'manual', label: 'Manual Entry', logo: '✏️' },
];

export const AddOrderModal: React.FC<AddOrderModalProps> = ({ show, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    platform: 'amazon' as ExternalPlatform,
    platform_order_id: '',
    platform_tracking_number: '',
    product_name: '',
    product_category: '',
    quantity: 1,
    order_amount: '',
    currency_code: 'INR',
    order_date: new Date().toISOString().split('T')[0],
    expected_delivery_date: '',
    courier_name: '',
    delivery_address: '',
    delivery_city: '',
    delivery_postal_code: '',
    recipient_name: '',
    recipient_phone: '',
    special_instructions: '',
    notes: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await api.createExternalOrder({
        ...formData,
        order_amount: formData.order_amount ? parseFloat(formData.order_amount) : undefined,
      });

      // Reset form
      setFormData({
        platform: 'amazon',
        platform_order_id: '',
        platform_tracking_number: '',
        product_name: '',
        product_category: '',
        quantity: 1,
        order_amount: '',
        currency_code: 'INR',
        order_date: new Date().toISOString().split('T')[0],
        expected_delivery_date: '',
        courier_name: '',
        delivery_address: '',
        delivery_city: '',
        delivery_postal_code: '',
        recipient_name: '',
        recipient_phone: '',
        special_instructions: '',
        notes: '',
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to add order');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  if (!show) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 relative">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-5 h-5 text-white" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Package className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-white">Add External Order</h2>
                <p className="text-sm text-blue-100">Import an order from any shopping platform</p>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
            {error && (
              <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-red-800 dark:text-red-200">Error</p>
                  <p className="text-xs text-red-600 dark:text-red-400 mt-1">{error}</p>
                </div>
              </div>
            )}

            <div className="space-y-6">
              {/* Platform Selection */}
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Shopping Platform *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {platformOptions.map((platform) => (
                    <button
                      key={platform.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, platform: platform.value })}
                      className={`p-3 rounded-xl border-2 transition-all cursor-pointer ${
                        formData.platform === platform.value
                          ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/40'
                          : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                      }`}
                    >
                      <div className="text-2xl mb-1">{platform.logo}</div>
                      <div className="text-xs font-bold text-slate-700 dark:text-slate-300">{platform.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Order Information */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                    Order ID / Order Number *
                  </label>
                  <input
                    type="text"
                    name="platform_order_id"
                    value={formData.platform_order_id}
                    onChange={handleChange}
                    required
                    placeholder="e.g., 123-4567890-1234567"
                    className="w-full px-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                    Tracking Number (Optional)
                  </label>
                  <input
                    type="text"
                    name="platform_tracking_number"
                    value={formData.platform_tracking_number}
                    onChange={handleChange}
                    placeholder="e.g., 1Z999AA10123456784"
                    className="w-full px-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              {/* Product Information */}
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Product Name *
                </label>
                <input
                  type="text"
                  name="product_name"
                  value={formData.product_name}
                  onChange={handleChange}
                  required
                  placeholder="e.g., Wireless Bluetooth Headphones"
                  className="w-full px-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                    Category
                  </label>
                  <input
                    type="text"
                    name="product_category"
                    value={formData.product_category}
                    onChange={handleChange}
                    placeholder="e.g., Electronics"
                    className="w-full px-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                    Quantity
                  </label>
                  <input
                    type="number"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleChange}
                    min="1"
                    className="w-full px-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                    Order Amount
                  </label>
                  <input
                    type="number"
                    name="order_amount"
                    value={formData.order_amount}
                    onChange={handleChange}
                    step="0.01"
                    placeholder="0.00"
                    className="w-full px-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                    Order Date *
                  </label>
                  <input
                    type="date"
                    name="order_date"
                    value={formData.order_date}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                    Expected Delivery Date
                  </label>
                  <input
                    type="date"
                    name="expected_delivery_date"
                    value={formData.expected_delivery_date}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              {/* Courier */}
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Courier / Carrier Name
                </label>
                <input
                  type="text"
                  name="courier_name"
                  value={formData.courier_name}
                  onChange={handleChange}
                  placeholder="e.g., FedEx, UPS, DHL"
                  className="w-full px-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              {/* Delivery Address */}
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Delivery Address *
                </label>
                <textarea
                  name="delivery_address"
                  value={formData.delivery_address}
                  onChange={handleChange}
                  required
                  rows={2}
                  placeholder="e.g., 123 Main Street, Apartment 4B"
                  className="w-full px-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                    City
                  </label>
                  <input
                    type="text"
                    name="delivery_city"
                    value={formData.delivery_city}
                    onChange={handleChange}
                    placeholder="e.g., San Francisco"
                    className="w-full px-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                    Postal Code
                  </label>
                  <input
                    type="text"
                    name="delivery_postal_code"
                    value={formData.delivery_postal_code}
                    onChange={handleChange}
                    placeholder="e.g., 94102"
                    className="w-full px-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              {/* Recipient Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                    Recipient Name
                  </label>
                  <input
                    type="text"
                    name="recipient_name"
                    value={formData.recipient_name}
                    onChange={handleChange}
                    placeholder="e.g., John Doe"
                    className="w-full px-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                    Recipient Phone
                  </label>
                  <input
                    type="tel"
                    name="recipient_phone"
                    value={formData.recipient_phone}
                    onChange={handleChange}
                    placeholder="e.g., +1 (555) 123-4567"
                    className="w-full px-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Additional Notes
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows={2}
                  placeholder="Any additional information about this order..."
                  className="w-full px-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 mt-6 pt-6 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-5 py-2.5 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-colors shadow-lg shadow-blue-600/20 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Adding Order...' : 'Add Order to Hub'}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
