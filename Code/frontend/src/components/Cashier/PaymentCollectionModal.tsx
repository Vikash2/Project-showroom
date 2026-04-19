import { useState } from 'react';
import { X, DollarSign, CreditCard, Smartphone, Building2, FileText, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import * as cashierService from '../../services/cashierService';

interface PaymentCollectionModalProps {
  bookingId: string;
  customerName: string;
  totalAmount: number;
  onClose: () => void;
  onSuccess: () => void;
}

const PAYMENT_METHODS = [
  { value: 'Cash', label: 'Cash', icon: DollarSign },
  { value: 'Card', label: 'Card', icon: CreditCard },
  { value: 'UPI', label: 'UPI', icon: Smartphone },
  { value: 'Bank Transfer', label: 'Bank Transfer', icon: Building2 },
  { value: 'Cheque', label: 'Cheque', icon: FileText },
] as const;

export default function PaymentCollectionModal({
  bookingId,
  customerName,
  totalAmount,
  onClose,
  onSuccess,
}: PaymentCollectionModalProps) {
  const [formData, setFormData] = useState({
    amount: totalAmount,
    paymentMethod: 'Cash' as cashierService.CollectPaymentData['paymentMethod'],
    transactionReference: '',
    notes: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.amount || formData.amount <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    }

    if (formData.amount > totalAmount) {
      newErrors.amount = `Amount cannot exceed ₹${totalAmount.toLocaleString('en-IN')}`;
    }

    if (!formData.paymentMethod) {
      newErrors.paymentMethod = 'Please select a payment method';
    }

    if (['Card', 'UPI', 'Bank Transfer', 'Cheque'].includes(formData.paymentMethod) && !formData.transactionReference) {
      newErrors.transactionReference = 'Transaction reference is required for this payment method';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await cashierService.collectPayment(bookingId, {
        amount: formData.amount,
        paymentMethod: formData.paymentMethod,
        transactionReference: formData.transactionReference || undefined,
        notes: formData.notes || undefined,
      });

      toast.success(
        <div>
          <p className="font-bold">Payment Collected Successfully!</p>
          <p className="text-sm">Receipt: {result.receipt?.receiptNumber}</p>
        </div>
      );

      onSuccess();
    } catch (error: any) {
      console.error('Payment collection error:', error);
      toast.error(error.message || 'Failed to collect payment');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[var(--card-bg)] rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-[var(--card-bg)] border-b border-[var(--border)] p-6 flex justify-between items-center z-10">
          <div>
            <h2 className="text-2xl font-black text-[var(--text-primary)]">Collect Payment</h2>
            <p className="text-sm text-[var(--text-secondary)] mt-1">
              Customer: {customerName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[var(--bg-secondary)] rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Amount */}
          <div>
            <label className="block text-sm font-bold text-[var(--text-primary)] mb-2">
              Amount to Collect <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] font-bold">
                ₹
              </span>
              <input
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                className={`w-full pl-8 pr-4 py-3 bg-[var(--bg-primary)] border rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 text-[var(--text-primary)] font-bold text-lg ${
                  errors.amount ? 'border-red-500' : 'border-[var(--border)]'
                }`}
                placeholder="0.00"
                step="0.01"
                min="0"
              />
            </div>
            {errors.amount && (
              <div className="flex items-center gap-1 text-red-500 text-xs mt-1">
                <AlertCircle size={12} />
                <span>{errors.amount}</span>
              </div>
            )}
            <p className="text-xs text-[var(--text-muted)] mt-1">
              Total Amount: ₹{totalAmount.toLocaleString('en-IN')}
            </p>
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-sm font-bold text-[var(--text-primary)] mb-3">
              Payment Method <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {PAYMENT_METHODS.map((method) => {
                const Icon = method.icon;
                const isSelected = formData.paymentMethod === method.value;
                return (
                  <button
                    key={method.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, paymentMethod: method.value })}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      isSelected
                        ? 'border-red-500 bg-red-50 dark:bg-red-950/30'
                        : 'border-[var(--border)] hover:border-red-300'
                    }`}
                  >
                    <Icon
                      size={24}
                      className={`mx-auto mb-2 ${
                        isSelected ? 'text-red-600' : 'text-[var(--text-muted)]'
                      }`}
                    />
                    <p
                      className={`text-sm font-bold ${
                        isSelected ? 'text-red-600' : 'text-[var(--text-primary)]'
                      }`}
                    >
                      {method.label}
                    </p>
                  </button>
                );
              })}
            </div>
            {errors.paymentMethod && (
              <div className="flex items-center gap-1 text-red-500 text-xs mt-2">
                <AlertCircle size={12} />
                <span>{errors.paymentMethod}</span>
              </div>
            )}
          </div>

          {/* Transaction Reference */}
          {['Card', 'UPI', 'Bank Transfer', 'Cheque'].includes(formData.paymentMethod) && (
            <div>
              <label className="block text-sm font-bold text-[var(--text-primary)] mb-2">
                Transaction Reference <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.transactionReference}
                onChange={(e) => setFormData({ ...formData, transactionReference: e.target.value })}
                className={`w-full px-4 py-3 bg-[var(--bg-primary)] border rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 text-[var(--text-primary)] ${
                  errors.transactionReference ? 'border-red-500' : 'border-[var(--border)]'
                }`}
                placeholder={
                  formData.paymentMethod === 'Cheque'
                    ? 'Cheque Number'
                    : formData.paymentMethod === 'UPI'
                    ? 'UPI Transaction ID'
                    : 'Transaction Reference'
                }
              />
              {errors.transactionReference && (
                <div className="flex items-center gap-1 text-red-500 text-xs mt-1">
                  <AlertCircle size={12} />
                  <span>{errors.transactionReference}</span>
                </div>
              )}
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-sm font-bold text-[var(--text-primary)] mb-2">
              Notes (Optional)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-4 py-3 bg-[var(--bg-primary)] border border-[var(--border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 text-[var(--text-primary)] resize-none"
              placeholder="Add any additional notes..."
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-[var(--border)] rounded-xl font-bold hover:bg-[var(--bg-secondary)] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 btn-primary flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Processing...
                </>
              ) : (
                <>
                  <DollarSign size={18} />
                  Collect Payment
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
