import { X, Download, FileText, CheckCircle, Clock, User, CreditCard, Package, FileCheck, AlertCircle } from 'lucide-react';
import type { Booking } from '../../types/booking';
import { useVehicles } from '../../state/VehicleContext';
import { useAccessories } from '../../state/AccessoryContext';
import { calculateGrandTotal } from '../../utils/salesCalculations';
import { useAuth } from '../../state/AuthContext';

interface SalesDetailsViewerProps {
  booking: Booking;
  onClose: () => void;
  onDownload: () => void;
  onApprove?: () => void;
  onReject?: () => void;
}

export default function SalesDetailsViewer({ booking, onClose, onDownload, onApprove, onReject }: SalesDetailsViewerProps) {
  const { vehicles } = useVehicles();
  const { accessories } = useAccessories();
  const { user } = useAuth();

  const vehicle = vehicles.find(v => v.id === booking.vehicleConfig.modelId);
  const variant = vehicle?.variants.find(v => v.id === booking.vehicleConfig.variantId);
  const sale = booking.sale;

  if (!sale) return null;

  const grandTotal = calculateGrandTotal(booking);
  const isApprover = user?.role === 'Super Admin' || user?.role === 'Showroom Manager';
  const needsApproval = sale.specialDiscountApprovalStatus === 'PENDING';
  const isApproved = sale.specialDiscountApprovalStatus === 'APPROVED';
  const isRejected = sale.specialDiscountApprovalStatus === 'REJECTED';

  return (
    <div className="fixed inset-0 bg-[var(--modal-overlay)] backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4">
      <div className="bg-[var(--card-bg)] rounded-xl shadow-2xl w-full max-w-5xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-[var(--border)] bg-[var(--bg-secondary)] flex-shrink-0">
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <FileCheck size={20} className="text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-[var(--text-primary)]">
                  Sales Details
                </h2>
                <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-0.5">
                  Booking ID: {booking.id} • {booking.status}
                </p>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[var(--text-muted)] hover:bg-[var(--hover-bg)] rounded-lg transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6 space-y-6">

            {/* Approval Status Banner */}
            {needsApproval && isApprover && (
              <div className="bg-orange-50 dark:bg-orange-950/30 border-2 border-orange-300 dark:border-orange-700 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Clock size={24} className="text-orange-600 dark:text-orange-400 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="text-base font-bold text-orange-800 dark:text-orange-200 mb-1">
                      Manager Approval Required
                    </h3>
                    <p className="text-sm text-orange-700 dark:text-orange-300 mb-3">
                      This sale includes a special discount of ₹{sale.specialDiscount.toLocaleString('en-IN')} that requires your approval.
                    </p>
                    <div className="flex gap-3">
                      <button
                        onClick={onApprove}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-bold flex items-center gap-2 shadow-lg"
                      >
                        <CheckCircle size={18} />
                        Approve Sale
                      </button>
                      <button
                        onClick={onReject}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-bold flex items-center gap-2 shadow-lg"
                      >
                        <X size={18} />
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {needsApproval && !isApprover && (
              <div className="bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <Clock size={20} className="text-orange-600 dark:text-orange-400 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-orange-800 dark:text-orange-200">
                      Awaiting Manager Approval
                    </p>
                    <p className="text-xs text-orange-700 dark:text-orange-300 mt-1">
                      Special discount of ₹{sale.specialDiscount.toLocaleString('en-IN')} requires manager approval
                    </p>
                  </div>
                </div>
              </div>
            )}

            {isApproved && (
              <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <CheckCircle size={20} className="text-green-600 dark:text-green-400 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-green-800 dark:text-green-200">
                      Special Discount Approved
                    </p>
                    <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                      Discount of ₹{sale.specialDiscount.toLocaleString('en-IN')} has been approved
                    </p>
                  </div>
                </div>
              </div>
            )}

            {isRejected && (
              <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <AlertCircle size={20} className="text-red-600 dark:text-red-400 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-red-800 dark:text-red-200">
                      Special Discount Rejected
                    </p>
                    <p className="text-xs text-red-700 dark:text-red-300 mt-1">
                      The special discount request has been rejected
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Customer Information */}
            <section className="bg-[var(--bg-secondary)] rounded-lg p-4 border border-[var(--border)]">
              <div className="flex items-center gap-2 mb-4">
                <User size={18} className="text-[var(--text-secondary)]" />
                <h3 className="text-base font-bold text-[var(--text-primary)]">Customer Information</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-[var(--text-muted)] block mb-1">Full Name</span>
                  <span className="font-semibold text-[var(--text-primary)]">{booking.customer.fullName}</span>
                </div>
                <div>
                  <span className="text-[var(--text-muted)] block mb-1">Mobile</span>
                  <span className="font-semibold text-[var(--text-primary)]">{booking.customer.mobile}</span>
                </div>
                <div>
                  <span className="text-[var(--text-muted)] block mb-1">Email</span>
                  <span className="font-semibold text-[var(--text-primary)]">{booking.customer.email}</span>
                </div>
                <div>
                  <span className="text-[var(--text-muted)] block mb-1">Emergency Contact</span>
                  <span className="font-semibold text-[var(--text-primary)]">{booking.customer.emergencyContact}</span>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-[var(--text-muted)] block mb-1">Address</span>
                  <span className="font-semibold text-[var(--text-primary)]">{booking.customer.address}</span>
                </div>
              </div>
            </section>

            {/* Vehicle Information */}
            <section className="bg-[var(--bg-secondary)] rounded-lg p-4 border border-[var(--border)]">
              <div className="flex items-center gap-2 mb-4">
                <Package size={18} className="text-[var(--text-secondary)]" />
                <h3 className="text-base font-bold text-[var(--text-primary)]">Vehicle Details</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-[var(--text-muted)] block mb-1">Model</span>
                  <span className="font-semibold text-[var(--text-primary)]">{vehicle?.brand} {vehicle?.model}</span>
                </div>
                <div>
                  <span className="text-[var(--text-muted)] block mb-1">Variant</span>
                  <span className="font-semibold text-[var(--text-primary)]">{variant?.name}</span>
                </div>
                <div>
                  <span className="text-[var(--text-muted)] block mb-1">Color</span>
                  <span className="font-semibold text-[var(--text-primary)]">{booking.vehicleConfig.colorName}</span>
                </div>
                <div>
                  <span className="text-[var(--text-muted)] block mb-1">Ex-Showroom Price</span>
                  <span className="font-semibold text-[var(--text-primary)]">₹{booking.pricing.exShowroom.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </section>

            {/* Sales Details */}
            <section className="bg-[var(--bg-secondary)] rounded-lg p-4 border border-[var(--border)]">
              <div className="flex items-center gap-2 mb-4">
                <FileText size={18} className="text-[var(--text-secondary)]" />
                <h3 className="text-base font-bold text-[var(--text-primary)]">Sales Information</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-[var(--text-muted)] block mb-1">Payment Method</span>
                  <span className="font-semibold text-[var(--text-primary)]">{sale.soldThrough}</span>
                </div>
                {sale.soldThrough === 'FINANCE' && (
                  <>
                    <div>
                      <span className="text-[var(--text-muted)] block mb-1">Financer</span>
                      <span className="font-semibold text-[var(--text-primary)]">{sale.financer}</span>
                    </div>
                    <div>
                      <span className="text-[var(--text-muted)] block mb-1">Finance Executive</span>
                      <span className="font-semibold text-[var(--text-primary)]">{sale.financeBy}</span>
                    </div>
                    <div>
                      <span className="text-[var(--text-muted)] block mb-1">Hypothecation</span>
                      <span className="font-semibold text-[var(--text-primary)]">
                        {sale.hypothecationSelected} {sale.hypothecationCharge > 0 && `(₹${sale.hypothecationCharge})`}
                      </span>
                    </div>
                  </>
                )}
                <div>
                  <span className="text-[var(--text-muted)] block mb-1">Registration</span>
                  <span className="font-semibold text-[var(--text-primary)]">{sale.registration}</span>
                </div>
                {sale.otherState.selected && (
                  <div>
                    <span className="text-[var(--text-muted)] block mb-1">Registration State</span>
                    <span className="font-semibold text-[var(--text-primary)]">
                      {sale.otherState.selected} {sale.otherState.amount > 0 && `(+₹${sale.otherState.amount})`}
                    </span>
                  </div>
                )}
                <div>
                  <span className="text-[var(--text-muted)] block mb-1">Insurance</span>
                  <span className="font-semibold text-[var(--text-primary)]">{sale.insurance}</span>
                </div>
                {sale.insurance === 'YES' && (
                  <>
                    <div>
                      <span className="text-[var(--text-muted)] block mb-1">Insurance Type</span>
                      <span className="font-semibold text-[var(--text-primary)]">{sale.insuranceType}</span>
                    </div>
                    <div>
                      <span className="text-[var(--text-muted)] block mb-1">Nominee</span>
                      <span className="font-semibold text-[var(--text-primary)]">
                        {sale.insuranceNominee.name} ({sale.insuranceNominee.age} yrs, {sale.insuranceNominee.relation})
                      </span>
                    </div>
                  </>
                )}
                <div>
                  <span className="text-[var(--text-muted)] block mb-1">Sale Type</span>
                  <span className="font-semibold text-[var(--text-primary)]">{sale.typeOfSale}</span>
                </div>
                {sale.typeOfSale === 'EXCHANGE' && sale.exchange && (
                  <>
                    <div>
                      <span className="text-[var(--text-muted)] block mb-1">Exchange Vehicle</span>
                      <span className="font-semibold text-[var(--text-primary)]">
                        {sale.exchange.model} ({sale.exchange.year})
                      </span>
                    </div>
                    <div>
                      <span className="text-[var(--text-muted)] block mb-1">Exchange Value</span>
                      <span className="font-semibold text-green-600 dark:text-green-400">
                        ₹{sale.exchange.value.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div>
                      <span className="text-[var(--text-muted)] block mb-1">Exchanger Name</span>
                      <span className="font-semibold text-[var(--text-primary)]">{sale.exchange.exchangerName}</span>
                    </div>
                    <div>
                      <span className="text-[var(--text-muted)] block mb-1">Registration Number</span>
                      <span className="font-semibold text-[var(--text-primary)]">{sale.exchange.registrationNumber}</span>
                    </div>
                  </>
                )}
                {sale.isGstNumber === 'YES' && (
                  <div>
                    <span className="text-[var(--text-muted)] block mb-1">GST Number</span>
                    <span className="font-semibold text-[var(--text-primary)]">{sale.gstNumber}</span>
                  </div>
                )}
              </div>
            </section>

            {/* Accessories */}
            {Object.keys(sale.selectedAccessoriesFinal).length > 0 && (
              <section className="bg-[var(--bg-secondary)] rounded-lg p-4 border border-[var(--border)]">
                <h3 className="text-base font-bold text-[var(--text-primary)] mb-4">Selected Accessories</h3>
                <div className="space-y-2">
                  {Object.entries(sale.selectedAccessoriesFinal).map(([accId, amount]) => {
                    const acc = accessories.find(a => a.id === accId);
                    if (!acc) return null;
                    return (
                      <div key={accId} className="flex justify-between items-center text-sm py-2 border-b border-[var(--border)] last:border-0">
                        <span className="text-[var(--text-primary)]">{acc.name}</span>
                        <span className="font-semibold text-[var(--text-primary)]">₹{amount.toLocaleString('en-IN')}</span>
                      </div>
                    );
                  })}
                  <div className="flex justify-between items-center text-sm pt-2 font-bold">
                    <span className="text-[var(--text-primary)]">Accessories Total:</span>
                    <span className="text-[var(--text-primary)]">₹{sale.accessoriesTotal.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </section>
            )}

            {/* Price Breakdown */}
            <section className="bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950/30 dark:to-orange-950/30 rounded-lg p-4 border-2 border-red-200 dark:border-red-800">
              <div className="flex items-center gap-2 mb-4">
                <CreditCard size={18} className="text-red-600 dark:text-red-400" />
                <h3 className="text-base font-bold text-[var(--text-primary)]">Price Breakdown</h3>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-[var(--text-secondary)]">Ex-Showroom Price</span>
                  <span className="font-semibold text-[var(--text-primary)]">₹{booking.pricing.exShowroom.toLocaleString('en-IN')}</span>
                </div>
                {sale.registration === 'Yes' && (
                  <div className="flex justify-between items-center">
                    <span className="text-[var(--text-secondary)]">RTO Charges</span>
                    <span className="font-semibold text-[var(--text-primary)]">₹{booking.pricing.rtoTotal.toLocaleString('en-IN')}</span>
                  </div>
                )}
                {sale.insurance === 'YES' && (
                  <div className="flex justify-between items-center">
                    <span className="text-[var(--text-secondary)]">Insurance</span>
                    <span className="font-semibold text-[var(--text-primary)]">₹{booking.pricing.insuranceTotal.toLocaleString('en-IN')}</span>
                  </div>
                )}
                {sale.accessoriesTotal > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-[var(--text-secondary)]">Accessories</span>
                    <span className="font-semibold text-[var(--text-primary)]">₹{sale.accessoriesTotal.toLocaleString('en-IN')}</span>
                  </div>
                )}
                {sale.hypothecationCharge > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-[var(--text-secondary)]">Hypothecation</span>
                    <span className="font-semibold text-[var(--text-primary)]">₹{sale.hypothecationCharge.toLocaleString('en-IN')}</span>
                  </div>
                )}
                {sale.otherState.amount > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-[var(--text-secondary)]">Other State Charge</span>
                    <span className="font-semibold text-[var(--text-primary)]">₹{sale.otherState.amount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                {sale.jobClub === 'YES' && (
                  <div className="flex justify-between items-center">
                    <span className="text-[var(--text-secondary)]">Job Club Membership</span>
                    <span className="font-semibold text-[var(--text-primary)]">₹1,500</span>
                  </div>
                )}
                {sale.otherCharges > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-[var(--text-secondary)]">Other Charges</span>
                    <span className="font-semibold text-[var(--text-primary)]">₹{sale.otherCharges.toLocaleString('en-IN')}</span>
                  </div>
                )}
                {sale.discount > 0 && (
                  <div className="flex justify-between items-center text-green-600 dark:text-green-400">
                    <span>Regular Discount</span>
                    <span className="font-semibold">-₹{sale.discount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                {sale.specialDiscount > 0 && (
                  <div className="flex justify-between items-center text-green-600 dark:text-green-400">
                    <span>Special Discount {needsApproval && '(Pending Approval)'}</span>
                    <span className="font-semibold">-₹{sale.specialDiscount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                {sale.typeOfSale === 'EXCHANGE' && sale.exchange && sale.exchange.value > 0 && (
                  <div className="flex justify-between items-center text-green-600 dark:text-green-400">
                    <span>Exchange Value</span>
                    <span className="font-semibold">-₹{sale.exchange.value.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="border-t-2 border-red-300 dark:border-red-700 pt-3 mt-3 flex justify-between items-center">
                  <span className="font-bold text-lg text-[var(--text-primary)]">Grand Total</span>
                  <span className="font-black text-2xl text-red-600 dark:text-red-400">₹{grandTotal.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </section>

            {/* Payment Status */}
            <section className="bg-[var(--bg-secondary)] rounded-lg p-4 border border-[var(--border)]">
              <h3 className="text-base font-bold text-[var(--text-primary)] mb-4">Payment Status</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                <div className="text-center p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                  <div className="text-xs text-blue-600 dark:text-blue-400 mb-1">Total Amount</div>
                  <div className="text-lg font-bold text-blue-700 dark:text-blue-300">
                    ₹{booking.pricing.onRoadPrice.toLocaleString('en-IN')}
                  </div>
                </div>
                <div className="text-center p-3 bg-green-50 dark:bg-green-950/30 rounded-lg">
                  <div className="text-xs text-green-600 dark:text-green-400 mb-1">Amount Paid</div>
                  <div className="text-lg font-bold text-green-700 dark:text-green-300">
                    ₹{booking.bookingAmountPaid.toLocaleString('en-IN')}
                  </div>
                </div>
                <div className="text-center p-3 bg-orange-50 dark:bg-orange-950/30 rounded-lg">
                  <div className="text-xs text-orange-600 dark:text-orange-400 mb-1">Balance Due</div>
                  <div className="text-lg font-bold text-orange-700 dark:text-orange-300">
                    ₹{booking.balanceDue.toLocaleString('en-IN')}
                  </div>
                </div>
              </div>
              {booking.paymentConfirmed && (
                <div className="mt-4 p-3 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle size={18} className="text-green-600 dark:text-green-400" />
                    <span className="text-sm font-semibold text-green-700 dark:text-green-300">
                      Payment Confirmed - Sales Record Locked
                    </span>
                  </div>
                </div>
              )}
            </section>

          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 sm:p-6 border-t border-[var(--border)] bg-[var(--bg-secondary)] flex-shrink-0">
          <div className="text-xs text-[var(--text-muted)]">
            Booking Date: {new Date(booking.date).toLocaleDateString('en-IN', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-[var(--text-secondary)] border border-[var(--border)] rounded-lg hover:bg-[var(--hover-bg)] transition font-semibold"
            >
              Close
            </button>
            <button
              onClick={onDownload}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center justify-center gap-2 font-bold shadow-lg shadow-red-600/20"
            >
              <Download size={18} />
              Download Sales Document
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
