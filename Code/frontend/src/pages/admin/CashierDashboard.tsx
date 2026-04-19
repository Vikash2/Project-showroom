import { useState, useEffect } from 'react';
import { DollarSign, FileText, CheckCircle, Clock, AlertCircle, Eye } from 'lucide-react';
import { useAuth } from '../../state/AuthContext';
import toast from 'react-hot-toast';
import PaymentCollectionModal from '../../components/Cashier/PaymentCollectionModal';
import * as cashierService from '../../services/cashierService';
import { supabase } from '../../config/supabase';

interface Booking {
  id: string;
  customer_name: string;
  mobile: string;
  email: string | null;
  booking_amount: number;
  status: string;
  payment_confirmed: boolean;
  money_receipt_number: string | null;
  tax_invoice_number: string | null;
  created_at: string;
  sales: Array<{
    id: string;
    final_price: number;
    payment_status: string;
  }>;
}

export default function CashierDashboard() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('pending');

  useEffect(() => {
    loadBookings();
  }, [user]);

  const loadBookings = async () => {
    setIsLoading(true);
    try {
      // Fetch bookings that are ready for payment (Sales Finalized status)
      let query = supabase
        .from('bookings')
        .select(`
          *,
          sales (
            id,
            final_price,
            payment_status
          )
        `)
        .order('created_at', { ascending: false });

      // Apply role-based filtering
      if (user?.role === 'Cashier' && user?.showroomId) {
        query = query.eq('showroom_id', user.showroomId);
      }

      const { data, error } = await query;

      if (error) throw error;

      setBookings(data || []);
    } catch (error: any) {
      console.error('Error loading bookings:', error);
      toast.error('Failed to load bookings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCollectPayment = (booking: Booking) => {
    setSelectedBooking(booking);
    setShowPaymentModal(true);
  };

  const handleConfirmPayment = async (bookingId: string) => {
    if (!confirm('Are you sure you want to confirm this payment? This action cannot be undone.')) {
      return;
    }

    try {
      await cashierService.confirmPayment(bookingId);
      toast.success('Payment confirmed successfully!');
      loadBookings();
    } catch (error: any) {
      console.error('Error confirming payment:', error);
      toast.error(error.message || 'Failed to confirm payment');
    }
  };

  const handleApproveInvoice = async (bookingId: string) => {
    if (!confirm('Are you sure you want to approve and generate the tax invoice?')) {
      return;
    }

    try {
      const result = await cashierService.approveTaxInvoice(bookingId);
      toast.success(
        <div>
          <p className="font-bold">Tax Invoice Approved!</p>
          <p className="text-sm">Invoice: {result.invoice?.invoiceNumber}</p>
        </div>
      );
      loadBookings();
    } catch (error: any) {
      console.error('Error approving invoice:', error);
      toast.error(error.message || 'Failed to approve invoice');
    }
  };

  const getStatusBadge = (booking: Booking) => {
    if (booking.tax_invoice_number) {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">
          <CheckCircle size={14} />
          Invoice Approved
        </span>
      );
    }
    if (booking.payment_confirmed) {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
          <CheckCircle size={14} />
          Payment Confirmed
        </span>
      );
    }
    if (booking.money_receipt_number) {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300">
          <Clock size={14} />
          Receipt Issued
        </span>
      );
    }
    if (booking.status === 'Sales Finalized') {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300">
          <AlertCircle size={14} />
          Pending Payment
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300">
        {booking.status}
      </span>
    );
  };

  const filteredBookings = bookings.filter((booking) => {
    if (filter === 'pending') {
      return !booking.payment_confirmed && booking.status === 'Sales Finalized';
    }
    if (filter === 'completed') {
      return booking.payment_confirmed;
    }
    return true;
  });

  const pendingCount = bookings.filter(
    (b) => !b.payment_confirmed && b.status === 'Sales Finalized'
  ).length;
  const completedCount = bookings.filter((b) => b.payment_confirmed).length;

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-black text-[var(--text-primary)] mb-2">
          Cashier Dashboard
        </h1>
        <p className="text-[var(--text-secondary)]">
          Manage payments, receipts, and invoices
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <Clock size={24} />
            <span className="text-3xl font-black">{pendingCount}</span>
          </div>
          <p className="text-sm opacity-90">Pending Payments</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <CheckCircle size={24} />
            <span className="text-3xl font-black">{completedCount}</span>
          </div>
          <p className="text-sm opacity-90">Completed Today</p>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <FileText size={24} />
            <span className="text-3xl font-black">{bookings.length}</span>
          </div>
          <p className="text-sm opacity-90">Total Bookings</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg font-bold transition-colors ${
            filter === 'all'
              ? 'bg-red-600 text-white'
              : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-[var(--hover-bg)]'
          }`}
        >
          All ({bookings.length})
        </button>
        <button
          onClick={() => setFilter('pending')}
          className={`px-4 py-2 rounded-lg font-bold transition-colors ${
            filter === 'pending'
              ? 'bg-red-600 text-white'
              : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-[var(--hover-bg)]'
          }`}
        >
          Pending ({pendingCount})
        </button>
        <button
          onClick={() => setFilter('completed')}
          className={`px-4 py-2 rounded-lg font-bold transition-colors ${
            filter === 'completed'
              ? 'bg-red-600 text-white'
              : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-[var(--hover-bg)]'
          }`}
        >
          Completed ({completedCount})
        </button>
      </div>

      {/* Bookings List */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="inline-block w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-[var(--text-secondary)]">Loading bookings...</p>
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="text-center py-12 bg-[var(--card-bg)] rounded-xl border border-[var(--border)]">
          <DollarSign className="mx-auto mb-4 text-[var(--text-muted)]" size={48} />
          <p className="text-[var(--text-secondary)]">
            {filter === 'pending' ? 'No pending payments' : 'No bookings found'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((booking) => (
            <div
              key={booking.id}
              className="bg-[var(--card-bg)] border border-[var(--border)] rounded-xl p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                {/* Customer Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-bold text-[var(--text-primary)] text-lg">
                      {booking.customer_name}
                    </h3>
                    {getStatusBadge(booking)}
                  </div>
                  <div className="space-y-1 text-sm text-[var(--text-secondary)]">
                    <p>📱 {booking.mobile}</p>
                    {booking.email && <p>📧 {booking.email}</p>}
                    {booking.money_receipt_number && (
                      <p className="font-mono text-green-600 dark:text-green-400">
                        Receipt: {booking.money_receipt_number}
                      </p>
                    )}
                    {booking.tax_invoice_number && (
                      <p className="font-mono text-blue-600 dark:text-blue-400">
                        Invoice: {booking.tax_invoice_number}
                      </p>
                    )}
                  </div>
                </div>

                {/* Amount */}
                <div className="text-right">
                  <p className="text-sm text-[var(--text-muted)] mb-1">Amount</p>
                  <p className="text-2xl font-black text-[var(--text-primary)]">
                    ₹{(booking.sales?.[0]?.final_price || booking.booking_amount).toLocaleString('en-IN')}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2 min-w-[200px]">
                  {!booking.money_receipt_number && booking.status === 'Sales Finalized' && (
                    <button
                      onClick={() => handleCollectPayment(booking)}
                      className="btn-primary flex items-center justify-center gap-2"
                    >
                      <DollarSign size={18} />
                      Collect Payment
                    </button>
                  )}

                  {booking.money_receipt_number && !booking.payment_confirmed && (
                    <button
                      onClick={() => handleConfirmPayment(booking.id)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-bold flex items-center justify-center gap-2"
                    >
                      <CheckCircle size={18} />
                      Confirm Payment
                    </button>
                  )}

                  {booking.payment_confirmed && !booking.tax_invoice_number && (
                    <button
                      onClick={() => handleApproveInvoice(booking.id)}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-bold flex items-center justify-center gap-2"
                    >
                      <FileText size={18} />
                      Approve Invoice
                    </button>
                  )}

                  {booking.tax_invoice_number && (
                    <button
                      className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition font-bold flex items-center justify-center gap-2"
                    >
                      <Eye size={18} />
                      View Invoice
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Payment Collection Modal */}
      {showPaymentModal && selectedBooking && (
        <PaymentCollectionModal
          bookingId={selectedBooking.id}
          customerName={selectedBooking.customer_name}
          totalAmount={selectedBooking.sales?.[0]?.final_price || selectedBooking.booking_amount}
          onClose={() => {
            setShowPaymentModal(false);
            setSelectedBooking(null);
          }}
          onSuccess={() => {
            setShowPaymentModal(false);
            setSelectedBooking(null);
            loadBookings();
          }}
        />
      )}
    </div>
  );
}
