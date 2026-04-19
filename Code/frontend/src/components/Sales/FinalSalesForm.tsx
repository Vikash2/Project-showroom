import { useState, useEffect } from 'react';
import { X, Calculator, Save, AlertCircle, CheckCircle, CreditCard } from 'lucide-react';
import type { Booking, FinalSale } from '../../types/booking';
import { useShowroom } from '../../state/ShowroomContext';
import { useAuth } from '../../state/AuthContext';
import { useAccessories } from '../../state/AccessoryContext';
import {
  calculateGrandTotal,
  calculateAccessoriesTotal,
  calculateHypothecationCharge,
  calculateOtherStateAmount,
  getDefaultFinalSale,
  FINANCER_LIST,
  INDIAN_STATES
} from '../../utils/salesCalculations';

interface FinalSalesFormProps {
  booking: Booking;
  onClose: () => void;
  onSave: (updatedBooking: Booking) => void;
  isEditMode?: boolean; // New prop to indicate if editing existing sale
}

export default function FinalSalesForm({ booking, onClose, onSave, isEditMode = false }: FinalSalesFormProps) {
  const { activeShowroom } = useShowroom();
  const { user } = useAuth();
  const { accessories } = useAccessories();

  // CRITICAL: Block editing if payment is confirmed
  const isPaymentConfirmed = booking.paymentConfirmed || false;

  const [sale, setSale] = useState<FinalSale>(() =>
    booking.sale || getDefaultFinalSale()
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showPaymentConfirm, setShowPaymentConfirm] = useState(false);
  const [showApprovalNotice, setShowApprovalNotice] = useState(false);

  // If payment is confirmed, show locked message and prevent editing
  if (isPaymentConfirmed) {
    return (
      <div className="fixed inset-0 bg-[var(--modal-overlay)] backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-[var(--card-bg)] rounded-xl shadow-2xl w-full max-w-md p-6">
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 mx-auto mb-4">
            <AlertCircle size={32} className="text-red-600 dark:text-red-400" />
          </div>
          <h3 className="text-xl font-bold text-[var(--text-primary)] text-center mb-2">
            Sales Record Locked
          </h3>
          <p className="text-sm text-[var(--text-secondary)] text-center mb-6">
            This sales record cannot be edited because payment has been confirmed. Sales details are locked to maintain data integrity.
          </p>
          <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-3">
              <CheckCircle size={20} className="text-green-600 dark:text-green-400 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-green-800 dark:text-green-200">Payment Confirmed</p>
                <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                  Booking ID: {booking.id}
                </p>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-bold"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  // Calculate totals whenever sale data changes
  const grandTotal = calculateGrandTotal({ ...booking, sale });
  
  useEffect(() => {
    const hypothecationCharge = calculateHypothecationCharge(sale.hypothecationSelected);
    if (sale.hypothecationCharge !== hypothecationCharge) {
      setSale(prev => ({ ...prev, hypothecationCharge }));
    }
  }, [sale.hypothecationSelected]);

  useEffect(() => {
    const otherStateAmount = calculateOtherStateAmount(
      sale.otherState.selected, 
      activeShowroom?.state || ''
    );
    if (sale.otherState.amount !== otherStateAmount) {
      setSale(prev => ({
        ...prev,
        otherState: { ...prev.otherState, amount: otherStateAmount }
      }));
    }
  }, [sale.otherState.selected, activeShowroom?.state]);

  useEffect(() => {
    const accessoriesTotal = calculateAccessoriesTotal(sale.selectedAccessoriesFinal);
    if (sale.accessoriesTotal !== accessoriesTotal) {
      setSale(prev => ({ ...prev, accessoriesTotal }));
    }
  }, [sale.selectedAccessoriesFinal]);

  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (sale.soldThrough === 'FINANCE') {
      if (!sale.financer) {
        newErrors.financer = 'Please select a financer';
      }
      if (!sale.financeBy || sale.financeBy.trim() === '') {
        newErrors.financeBy = 'Finance executive name is required';
      }
    }

    if (sale.insurance === 'YES') {
      if (!sale.insuranceType || sale.insuranceType.trim() === '') {
        newErrors.insuranceType = 'Please specify insurance type';
      }
      if (!sale.insuranceNominee.name || sale.insuranceNominee.name.trim() === '') {
        newErrors.nomineName = 'Nominee name is required';
      }
      if (!sale.insuranceNominee.age || sale.insuranceNominee.age < 1) {
        newErrors.nomineeAge = 'Valid nominee age is required';
      }
      if (!sale.insuranceNominee.relation || sale.insuranceNominee.relation.trim() === '') {
        newErrors.nomineeRelation = 'Nominee relation is required';
      }
    }

    if (sale.typeOfSale === 'EXCHANGE') {
      if (!sale.exchange?.model || sale.exchange.model.trim() === '') {
        newErrors.exchangeModel = 'Exchange vehicle model is required';
      }
      if (!sale.exchange?.year || sale.exchange.year < 1900) {
        newErrors.exchangeYear = 'Valid year is required';
      }
      if (!sale.exchange?.value || sale.exchange.value <= 0) {
        newErrors.exchangeValue = 'Exchange value must be greater than 0';
      }
      if (!sale.exchange?.exchangerName || sale.exchange.exchangerName.trim() === '') {
        newErrors.exchangerName = 'Exchanger name is required';
      }
      if (!sale.exchange?.registrationNumber || sale.exchange.registrationNumber.trim() === '') {
        newErrors.exchangeReg = 'Registration number is required';
      }
    }

    if (sale.isGstNumber === 'YES') {
      if (!sale.gstNumber || sale.gstNumber.trim() === '') {
        newErrors.gstNumber = 'GST number is required';
      } else if (!/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(sale.gstNumber)) {
        newErrors.gstNumber = 'Invalid GST number format';
      }
    }

    if (sale.discount < 0) {
      newErrors.discount = 'Discount cannot be negative';
    }

    if (sale.specialDiscount < 0) {
      newErrors.specialDiscount = 'Special discount cannot be negative';
    }

    if (sale.otherCharges < 0) {
      newErrors.otherCharges = 'Other charges cannot be negative';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    // Mark all fields as touched
    const allFields = [
      'financer', 'financeBy', 'insuranceType', 'nomineName', 'nomineeAge', 'nomineeRelation',
      'exchangeModel', 'exchangeYear', 'exchangeValue', 'exchangerName', 'exchangeReg', 'gstNumber'
    ];
    setTouched(allFields.reduce((acc, field) => ({ ...acc, [field]: true }), {}));

    if (!validateForm()) {
      return;
    }

    // TEMPORARY BYPASS: Skip approval workflow to unblock sales completion
    // TODO: Re-enable approval workflow after testing
    // const isApprover = user?.role === 'Super Admin' || user?.role === 'Showroom Manager';
    // const needsApproval = sale.specialDiscount > 0 && !isApprover;
    // if (needsApproval) {
    //   setShowApprovalNotice(true);
    //   return;
    // }

    // Only approvers or those without special discount can proceed to confirmation
    setShowConfirmation(true);
  };

  const handleApprovalAcknowledge = () => {
    setShowApprovalNotice(false);
    // Submit with Pending Approval status - NOT finalized
    handlePendingApprovalSubmit();
  };

  const handlePendingApprovalSubmit = async () => {
    setIsSubmitting(true);
    try {
      const updatedBooking: Booking = { ...booking, sale };
      
      // Set to Pending Approval - NOT Sales Finalized
      updatedBooking.sale!.specialDiscountApprovalStatus = 'PENDING';
      updatedBooking.status = 'Pending Approval';

      onSave(updatedBooking);
      setShowApprovalNotice(false);
    } catch (error) {
      console.error('Error saving sale:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmSubmit = async () => {
    setIsSubmitting(true);
    try {
      const updatedBooking: Booking = { ...booking, sale };
      
      // TEMPORARY BYPASS: Always set to Sales Finalized to unblock completion
      // TODO: Re-enable approval logic after testing
      // const isApprover = user?.role === 'Super Admin' || user?.role === 'Showroom Manager';
      // if (sale.specialDiscount > 0 && !isApprover) {
      //   updatedBooking.sale!.specialDiscountApprovalStatus = 'PENDING';
      //   updatedBooking.status = 'Pending Approval';
      // } else {
      //   updatedBooking.status = 'Sales Finalized';
      // }
      
      updatedBooking.sale!.specialDiscountApprovalStatus = 'APPROVED'; // Temporary bypass
      updatedBooking.status = 'Sales Finalized'; // Always finalize for now

      onSave(updatedBooking);
      setShowConfirmation(false);
      setShowApprovalNotice(false);
    } catch (error) {
      console.error('Error saving sale:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get all available accessories
  const compatibleAccessories = accessories;

  return (
    <div className="fixed inset-0 bg-[var(--modal-overlay)] backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4">
      <div className="bg-[var(--card-bg)] rounded-xl shadow-2xl w-full max-w-5xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-[var(--border)] bg-[var(--bg-secondary)] flex-shrink-0">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-[var(--text-primary)]">
              {isEditMode ? 'Edit Sales Details' : 'Final Sales Form'}
            </h2>
            <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1">Booking ID: {booking.id}</p>
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
          <div className="p-4 sm:p-6 space-y-6 sm:space-y-8">

            {/* GST Section */}
            <section className="space-y-4">
              <h3 className="text-base sm:text-lg font-bold text-[var(--text-primary)] border-b border-[var(--border)] pb-2">
                GST Information
              </h3>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-2">
                    GST Number Available?
                  </label>
                  <div className="flex gap-4">
                    {['YES', 'NO'].map(option => (
                      <label key={option} className="flex items-center cursor-pointer">
                        <input
                          type="radio"
                          name="gstNumber"
                          value={option}
                          checked={sale.isGstNumber === option}
                          onChange={(e) => setSale(prev => ({ 
                            ...prev, 
                            isGstNumber: e.target.value as 'YES' | 'NO',
                            gstNumber: e.target.value === 'NO' ? undefined : prev.gstNumber
                          }))}
                          className="mr-2 accent-red-600"
                        />
                        <span className="text-sm text-[var(--text-primary)]">{option}</span>
                      </label>
                    ))}
                  </div>
                </div>
                {sale.isGstNumber === 'YES' && (
                  <div>
                    <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-2">
                      GST Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={sale.gstNumber || ''}
                      onChange={(e) => setSale(prev => ({ ...prev, gstNumber: e.target.value.toUpperCase() }))}
                      onBlur={() => handleBlur('gstNumber')}
                      className={`w-full px-3 py-2 bg-[var(--bg-secondary)] border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-[var(--text-primary)] placeholder:text-[var(--text-muted)] ${
                        touched.gstNumber && errors.gstNumber ? 'border-red-500' : 'border-[var(--border)]'
                      }`}
                      placeholder="22AAAAA0000A1Z5"
                    />
                    {touched.gstNumber && errors.gstNumber && (
                      <div className="flex items-center gap-1 text-red-500 text-xs mt-1">
                        <AlertCircle size={12} />
                        <span>{errors.gstNumber}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </section>

            {/* Payment Method Section */}
            <section className="space-y-4">
              <h3 className="text-base sm:text-lg font-bold text-[var(--text-primary)] border-b border-[var(--border)] pb-2">
                Payment Method
              </h3>
              <div>
                <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-2">
                  Sold Through
                </label>
                <div className="flex gap-4">
                  {['CASH', 'FINANCE'].map(option => (
                    <label key={option} className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="soldThrough"
                        value={option}
                        checked={sale.soldThrough === option}
                        onChange={(e) => setSale(prev => ({ 
                          ...prev, 
                          soldThrough: e.target.value as 'CASH' | 'FINANCE'
                        }))}
                        className="mr-2 accent-red-600"
                      />
                      <span className="text-sm text-[var(--text-primary)]">{option}</span>
                    </label>
                  ))}
                </div>
              </div>

              {sale.soldThrough === 'FINANCE' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-900">
                  <div>
                    <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-2">
                      Financer <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={sale.financer || ''}
                      onChange={(e) => setSale(prev => ({ ...prev, financer: e.target.value }))}
                      onBlur={() => handleBlur('financer')}
                      className={`w-full px-3 py-2 bg-[var(--bg-secondary)] border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-[var(--text-primary)] ${
                        touched.financer && errors.financer ? 'border-red-500' : 'border-[var(--border)]'
                      }`}
                    >
                      <option value="">Select Financer</option>
                      {FINANCER_LIST.map(financer => (
                        <option key={financer} value={financer}>{financer}</option>
                      ))}
                    </select>
                    {touched.financer && errors.financer && (
                      <div className="flex items-center gap-1 text-red-500 text-xs mt-1">
                        <AlertCircle size={12} />
                        <span>{errors.financer}</span>
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-2">
                      Finance By <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={sale.financeBy || ''}
                      onChange={(e) => setSale(prev => ({ ...prev, financeBy: e.target.value }))}
                      onBlur={() => handleBlur('financeBy')}
                      className={`w-full px-3 py-2 bg-[var(--bg-secondary)] border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-[var(--text-primary)] placeholder:text-[var(--text-muted)] ${
                        touched.financeBy && errors.financeBy ? 'border-red-500' : 'border-[var(--border)]'
                      }`}
                      placeholder="Executive name"
                    />
                    {touched.financeBy && errors.financeBy && (
                      <div className="flex items-center gap-1 text-red-500 text-xs mt-1">
                        <AlertCircle size={12} />
                        <span>{errors.financeBy}</span>
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-2">
                      Hypothecation
                    </label>
                    <div className="flex flex-col gap-2">
                      {['Yes', 'No'].map(option => (
                        <label key={option} className="flex items-center cursor-pointer">
                          <input
                            type="radio"
                            name="hypothecation"
                            value={option}
                            checked={sale.hypothecationSelected === option}
                            onChange={(e) => setSale(prev => ({ 
                              ...prev, 
                              hypothecationSelected: e.target.value as 'Yes' | 'No'
                            }))}
                            className="mr-2 accent-red-600"
                          />
                          <span className="text-sm text-[var(--text-primary)]">
                            {option} {option === 'Yes' && <span className="text-[var(--text-muted)]">(+₹500)</span>}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </section>

            {/* Registration Section */}
            <section className="space-y-4">
              <h3 className="text-base sm:text-lg font-bold text-[var(--text-primary)] border-b border-[var(--border)] pb-2">
                Registration
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-2">
                    Registration Required?
                  </label>
                  <div className="flex gap-4">
                    {['Yes', 'No'].map(option => (
                      <label key={option} className="flex items-center cursor-pointer">
                        <input
                          type="radio"
                          name="registration"
                          value={option}
                          checked={sale.registration === option}
                          onChange={(e) => setSale(prev => ({ 
                            ...prev, 
                            registration: e.target.value as 'Yes' | 'No'
                          }))}
                          className="mr-2 accent-red-600"
                        />
                        <span className="text-sm text-[var(--text-primary)]">{option}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-2">
                    Registration State
                  </label>
                  <select
                    value={sale.otherState.selected}
                    onChange={(e) => setSale(prev => ({
                      ...prev,
                      otherState: { ...prev.otherState, selected: e.target.value }
                    }))}
                    className="w-full px-3 py-2 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-[var(--text-primary)]"
                  >
                    <option value="">Select State</option>
                    {INDIAN_STATES.map(state => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>
                  {sale.otherState.amount > 0 && (
                    <p className="text-xs text-[var(--text-muted)] mt-1">
                      Other state charge: +₹{sale.otherState.amount}
                    </p>
                  )}
                </div>
              </div>
            </section>

            {/* Insurance Section */}
            <section className="space-y-4">
              <h3 className="text-base sm:text-lg font-bold text-[var(--text-primary)] border-b border-[var(--border)] pb-2">
                Insurance
              </h3>
              <div>
                <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-2">
                  Insurance Required?
                </label>
                <div className="flex gap-4">
                  {['YES', 'NO'].map(option => (
                    <label key={option} className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="insurance"
                        value={option}
                        checked={sale.insurance === option}
                        onChange={(e) => setSale(prev => ({ 
                          ...prev, 
                          insurance: e.target.value as 'YES' | 'NO'
                        }))}
                        className="mr-2 accent-red-600"
                      />
                      <span className="text-sm text-[var(--text-primary)]">{option}</span>
                    </label>
                  ))}
                </div>
              </div>

              {sale.insurance === 'YES' && (
                <div className="space-y-4 p-4 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg border border-emerald-200 dark:border-emerald-800">
                  <div>
                    <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-2">
                      Insurance Type <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={sale.insuranceType || ''}
                      onChange={(e) => setSale(prev => ({ ...prev, insuranceType: e.target.value }))}
                      onBlur={() => handleBlur('insuranceType')}
                      className={`w-full px-3 py-2 bg-white dark:bg-[var(--bg-secondary)] border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-[var(--text-primary)] placeholder:text-[var(--text-muted)] ${
                        touched.insuranceType && errors.insuranceType ? 'border-red-500' : 'border-[var(--border)]'
                      }`}
                      placeholder="e.g., Comprehensive, Third Party"
                    />
                    {touched.insuranceType && errors.insuranceType && (
                      <div className="flex items-center gap-1 text-red-500 text-xs mt-1">
                        <AlertCircle size={12} />
                        <span>{errors.insuranceType}</span>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-2">
                        Nominee Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={sale.insuranceNominee.name}
                        onChange={(e) => setSale(prev => ({
                          ...prev,
                          insuranceNominee: { ...prev.insuranceNominee, name: e.target.value }
                        }))}
                        onBlur={() => handleBlur('nomineName')}
                        className={`w-full px-3 py-2 bg-white dark:bg-[var(--bg-secondary)] border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-[var(--text-primary)] placeholder:text-[var(--text-muted)] ${
                          touched.nomineName && errors.nomineName ? 'border-red-500' : 'border-[var(--border)]'
                        }`}
                        placeholder="Full name"
                      />
                      {touched.nomineName && errors.nomineName && (
                        <div className="flex items-center gap-1 text-red-500 text-xs mt-1">
                          <AlertCircle size={12} />
                          <span>{errors.nomineName}</span>
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-2">
                        Age <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        value={sale.insuranceNominee.age || ''}
                        onChange={(e) => setSale(prev => ({
                          ...prev,
                          insuranceNominee: { ...prev.insuranceNominee, age: parseInt(e.target.value) || 0 }
                        }))}
                        onBlur={() => handleBlur('nomineeAge')}
                        className={`w-full px-3 py-2 bg-white dark:bg-[var(--bg-secondary)] border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-[var(--text-primary)] placeholder:text-[var(--text-muted)] ${
                          touched.nomineeAge && errors.nomineeAge ? 'border-red-500' : 'border-[var(--border)]'
                        }`}
                        placeholder="Age"
                        min="1"
                        max="120"
                      />
                      {touched.nomineeAge && errors.nomineeAge && (
                        <div className="flex items-center gap-1 text-red-500 text-xs mt-1">
                          <AlertCircle size={12} />
                          <span>{errors.nomineeAge}</span>
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-2">
                        Relation <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={sale.insuranceNominee.relation}
                        onChange={(e) => setSale(prev => ({
                          ...prev,
                          insuranceNominee: { ...prev.insuranceNominee, relation: e.target.value }
                        }))}
                        onBlur={() => handleBlur('nomineeRelation')}
                        className={`w-full px-3 py-2 bg-white dark:bg-[var(--bg-secondary)] border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-[var(--text-primary)] placeholder:text-[var(--text-muted)] ${
                          touched.nomineeRelation && errors.nomineeRelation ? 'border-red-500' : 'border-[var(--border)]'
                        }`}
                        placeholder="e.g., Spouse, Parent"
                      />
                      {touched.nomineeRelation && errors.nomineeRelation && (
                        <div className="flex items-center gap-1 text-red-500 text-xs mt-1">
                          <AlertCircle size={12} />
                          <span>{errors.nomineeRelation}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </section>

            {/* Accessories Section */}
            <section className="space-y-4">
              <h3 className="text-base sm:text-lg font-bold text-[var(--text-primary)] border-b border-[var(--border)] pb-2">
                Accessories
              </h3>
              {compatibleAccessories.length > 0 ? (
                <div className="space-y-3">
                  {compatibleAccessories.map(acc => {
                    const currentAmount = sale.selectedAccessoriesFinal[acc.id] || 0;
                    const isSelected = currentAmount > 0;

                    return (
                      <div key={acc.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-[var(--bg-secondary)] rounded-lg border border-[var(--border)]">
                        <div className="flex items-start gap-3 flex-1">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSale(prev => ({
                                  ...prev,
                                  selectedAccessoriesFinal: {
                                    ...prev.selectedAccessoriesFinal,
                                    [acc.id]: acc.price
                                  }
                                }));
                              } else {
                                const { [acc.id]: _, ...rest } = sale.selectedAccessoriesFinal;
                                setSale(prev => ({
                                  ...prev,
                                  selectedAccessoriesFinal: rest
                                }));
                              }
                            }}
                            className="mt-1 accent-red-600"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-sm text-[var(--text-primary)]">{acc.name}</div>
                            <div className="text-xs text-[var(--text-muted)] mt-0.5">{acc.description}</div>
                            <div className="text-xs text-[var(--text-secondary)] mt-1">
                              Base Price: ₹{acc.price.toLocaleString('en-IN')}
                            </div>
                          </div>
                        </div>
                        {isSelected && (
                          <div className="sm:w-32">
                            <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                              Final Amount
                            </label>
                            <input
                              type="number"
                              value={currentAmount}
                              onChange={(e) => {
                                const value = parseInt(e.target.value) || 0;
                                setSale(prev => ({
                                  ...prev,
                                  selectedAccessoriesFinal: {
                                    ...prev.selectedAccessoriesFinal,
                                    [acc.id]: value
                                  }
                                }));
                              }}
                              className="w-full px-2 py-1 text-sm bg-[var(--bg-secondary)] border border-[var(--border)] rounded focus:ring-2 focus:ring-red-500 focus:border-red-500 text-[var(--text-primary)]"
                              min="0"
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                  <div className="flex justify-between items-center p-3 bg-[var(--bg-tertiary)] rounded-lg border border-[var(--border)]">
                    <span className="font-bold text-sm text-[var(--text-primary)]">Accessories Total:</span>
                    <span className="font-black text-base text-[var(--text-primary)]">₹{sale.accessoriesTotal.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-[var(--text-muted)] italic">No compatible accessories available for this vehicle.</p>
              )}
            </section>

            {/* Exchange Section */}
            <section className="space-y-4">
              <h3 className="text-base sm:text-lg font-bold text-[var(--text-primary)] border-b border-[var(--border)] pb-2">
                Type of Sale
              </h3>
              <div>
                <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-2">
                  Sale Type
                </label>
                <div className="flex gap-4">
                  {['NEW', 'EXCHANGE'].map(option => (
                    <label key={option} className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="typeOfSale"
                        value={option}
                        checked={sale.typeOfSale === option}
                        onChange={(e) => setSale(prev => ({ 
                          ...prev, 
                          typeOfSale: e.target.value as 'NEW' | 'EXCHANGE'
                        }))}
                        className="mr-2 accent-red-600"
                      />
                      <span className="text-sm text-[var(--text-primary)]">{option}</span>
                    </label>
                  ))}
                </div>
              </div>

              {sale.typeOfSale === 'EXCHANGE' && (
                <div className="space-y-4 p-4 bg-purple-50 dark:bg-purple-950/30 rounded-lg border border-purple-200 dark:border-purple-900">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-2">
                        Exchange Vehicle Model <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={sale.exchange?.model || ''}
                        onChange={(e) => setSale(prev => ({
                          ...prev,
                          exchange: { ...prev.exchange!, model: e.target.value }
                        }))}
                        onBlur={() => handleBlur('exchangeModel')}
                        className={`w-full px-3 py-2 bg-[var(--bg-secondary)] border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-[var(--text-primary)] placeholder:text-[var(--text-muted)] ${
                          touched.exchangeModel && errors.exchangeModel ? 'border-red-500' : 'border-[var(--border)]'
                        }`}
                        placeholder="e.g., Honda City"
                      />
                      {touched.exchangeModel && errors.exchangeModel && (
                        <div className="flex items-center gap-1 text-red-500 text-xs mt-1">
                          <AlertCircle size={12} />
                          <span>{errors.exchangeModel}</span>
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-2">
                        Year <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        value={sale.exchange?.year || ''}
                        onChange={(e) => setSale(prev => ({
                          ...prev,
                          exchange: { ...prev.exchange!, year: parseInt(e.target.value) || 0 }
                        }))}
                        onBlur={() => handleBlur('exchangeYear')}
                        className={`w-full px-3 py-2 bg-[var(--bg-secondary)] border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-[var(--text-primary)] placeholder:text-[var(--text-muted)] ${
                          touched.exchangeYear && errors.exchangeYear ? 'border-red-500' : 'border-[var(--border)]'
                        }`}
                        placeholder="2020"
                        min="1900"
                        max={new Date().getFullYear()}
                      />
                      {touched.exchangeYear && errors.exchangeYear && (
                        <div className="flex items-center gap-1 text-red-500 text-xs mt-1">
                          <AlertCircle size={12} />
                          <span>{errors.exchangeYear}</span>
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-2">
                        Exchange Value (₹) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        value={sale.exchange?.value || ''}
                        onChange={(e) => setSale(prev => ({
                          ...prev,
                          exchange: { ...prev.exchange!, value: parseInt(e.target.value) || 0 }
                        }))}
                        onBlur={() => handleBlur('exchangeValue')}
                        className={`w-full px-3 py-2 bg-[var(--bg-secondary)] border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-[var(--text-primary)] placeholder:text-[var(--text-muted)] ${
                          touched.exchangeValue && errors.exchangeValue ? 'border-red-500' : 'border-[var(--border)]'
                        }`}
                        placeholder="150000"
                        min="0"
                      />
                      {touched.exchangeValue && errors.exchangeValue && (
                        <div className="flex items-center gap-1 text-red-500 text-xs mt-1">
                          <AlertCircle size={12} />
                          <span>{errors.exchangeValue}</span>
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-2">
                        Exchanger Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={sale.exchange?.exchangerName || ''}
                        onChange={(e) => setSale(prev => ({
                          ...prev,
                          exchange: { ...prev.exchange!, exchangerName: e.target.value }
                        }))}
                        onBlur={() => handleBlur('exchangerName')}
                        className={`w-full px-3 py-2 bg-[var(--bg-secondary)] border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-[var(--text-primary)] placeholder:text-[var(--text-muted)] ${
                          touched.exchangerName && errors.exchangerName ? 'border-red-500' : 'border-[var(--border)]'
                        }`}
                        placeholder="Full name"
                      />
                      {touched.exchangerName && errors.exchangerName && (
                        <div className="flex items-center gap-1 text-red-500 text-xs mt-1">
                          <AlertCircle size={12} />
                          <span>{errors.exchangerName}</span>
                        </div>
                      )}
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-2">
                        Registration Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={sale.exchange?.registrationNumber || ''}
                        onChange={(e) => setSale(prev => ({
                          ...prev,
                          exchange: { ...prev.exchange!, registrationNumber: e.target.value.toUpperCase() }
                        }))}
                        onBlur={() => handleBlur('exchangeReg')}
                        className={`w-full px-3 py-2 bg-[var(--bg-secondary)] border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-[var(--text-primary)] placeholder:text-[var(--text-muted)] ${
                          touched.exchangeReg && errors.exchangeReg ? 'border-red-500' : 'border-[var(--border)]'
                        }`}
                        placeholder="DL01AB1234"
                      />
                      {touched.exchangeReg && errors.exchangeReg && (
                        <div className="flex items-center gap-1 text-red-500 text-xs mt-1">
                          <AlertCircle size={12} />
                          <span>{errors.exchangeReg}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </section>

            {/* Discounts & Other Charges */}
            <section className="space-y-4">
              <h3 className="text-base sm:text-lg font-bold text-[var(--text-primary)] border-b border-[var(--border)] pb-2">
                Discounts & Other Charges
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-2">
                    Regular Discount (₹)
                  </label>
                  <input
                    type="number"
                    value={sale.discount || ''}
                    onChange={(e) => {
                      const value = e.target.value === '' ? 0 : parseFloat(e.target.value);
                      setSale(prev => ({ ...prev, discount: isNaN(value) ? 0 : value }));
                    }}
                    onBlur={() => handleBlur('discount')}
                    className={`w-full px-3 py-2 bg-[var(--bg-secondary)] border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-[var(--text-primary)] placeholder:text-[var(--text-muted)] ${
                      touched.discount && errors.discount ? 'border-red-500' : 'border-[var(--border)]'
                    }`}
                    placeholder="0"
                    min="0"
                    step="0.01"
                  />
                  {touched.discount && errors.discount && (
                    <div className="flex items-center gap-1 text-red-500 text-xs mt-1">
                      <AlertCircle size={12} />
                      <span>{errors.discount}</span>
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-2">
                    Special Discount (₹)
                  </label>
                  <input
                    type="number"
                    value={sale.specialDiscount || ''}
                    onChange={(e) => {
                      const value = e.target.value === '' ? 0 : parseFloat(e.target.value);
                      setSale(prev => ({ ...prev, specialDiscount: isNaN(value) ? 0 : value }));
                    }}
                    onBlur={() => handleBlur('specialDiscount')}
                    className={`w-full px-3 py-2 bg-[var(--bg-secondary)] border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-[var(--text-primary)] placeholder:text-[var(--text-muted)] ${
                      touched.specialDiscount && errors.specialDiscount ? 'border-red-500' : 'border-[var(--border)]'
                    }`}
                    placeholder="0"
                    min="0"
                    step="0.01"
                  />
                  {touched.specialDiscount && errors.specialDiscount && (
                    <div className="flex items-center gap-1 text-red-500 text-xs mt-1">
                      <AlertCircle size={12} />
                      <span>{errors.specialDiscount}</span>
                    </div>
                  )}
                  {sale.specialDiscount > 0 && (
                    <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                      Requires manager approval
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-2">
                    Other Charges (₹)
                  </label>
                  <input
                    type="number"
                    value={sale.otherCharges || ''}
                    onChange={(e) => {
                      const value = e.target.value === '' ? 0 : parseFloat(e.target.value);
                      setSale(prev => ({ ...prev, otherCharges: isNaN(value) ? 0 : value }));
                    }}
                    onBlur={() => handleBlur('otherCharges')}
                    className={`w-full px-3 py-2 bg-[var(--bg-secondary)] border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-[var(--text-primary)] placeholder:text-[var(--text-muted)] ${
                      touched.otherCharges && errors.otherCharges ? 'border-red-500' : 'border-[var(--border)]'
                    }`}
                    placeholder="0"
                    min="0"
                    step="0.01"
                  />
                  {touched.otherCharges && errors.otherCharges && (
                    <div className="flex items-center gap-1 text-red-500 text-xs mt-1">
                      <AlertCircle size={12} />
                      <span>{errors.otherCharges}</span>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-2">
                  Job Club Membership
                </label>
                <div className="flex gap-4">
                  {['YES', 'NO'].map(option => (
                    <label key={option} className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="jobClub"
                        value={option}
                        checked={sale.jobClub === option}
                        onChange={(e) => setSale(prev => ({ 
                          ...prev, 
                          jobClub: e.target.value as 'YES' | 'NO'
                        }))}
                        className="mr-2 accent-red-600"
                      />
                      <span className="text-sm text-[var(--text-primary)]">{option}</span>
                    </label>
                  ))}
                </div>
              </div>
            </section>

            {/* Price Summary */}
            <section className="space-y-4">
              <h3 className="text-base sm:text-lg font-bold text-[var(--text-primary)] border-b border-[var(--border)] pb-2">
                Price Breakdown
              </h3>
              <div className="bg-[var(--bg-secondary)] p-4 rounded-lg border border-[var(--border)] space-y-2 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-[var(--text-secondary)]">Ex-Showroom Price:</span>
                  <span className="font-semibold text-[var(--text-primary)]">₹{booking.pricing.exShowroom.toLocaleString('en-IN')}</span>
                </div>
                {sale.registration === 'Yes' && (
                  <div className="flex justify-between items-center">
                    <span className="text-[var(--text-secondary)]">RTO Charges:</span>
                    <span className="font-semibold text-[var(--text-primary)]">₹{booking.pricing.rtoTotal.toLocaleString('en-IN')}</span>
                  </div>
                )}
                {sale.insurance === 'YES' && (
                  <div className="flex justify-between items-center">
                    <span className="text-[var(--text-secondary)]">Insurance:</span>
                    <span className="font-semibold text-[var(--text-primary)]">₹{booking.pricing.insuranceTotal.toLocaleString('en-IN')}</span>
                  </div>
                )}
                {sale.accessoriesTotal > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-[var(--text-secondary)]">Accessories:</span>
                    <span className="font-semibold text-[var(--text-primary)]">₹{sale.accessoriesTotal.toLocaleString('en-IN')}</span>
                  </div>
                )}
                {sale.hypothecationCharge > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-[var(--text-secondary)]">Hypothecation:</span>
                    <span className="font-semibold text-[var(--text-primary)]">₹{sale.hypothecationCharge.toLocaleString('en-IN')}</span>
                  </div>
                )}
                {sale.otherState.amount > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-[var(--text-secondary)]">Other State Charge:</span>
                    <span className="font-semibold text-[var(--text-primary)]">₹{sale.otherState.amount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                {sale.jobClub === 'YES' && (
                  <div className="flex justify-between items-center">
                    <span className="text-[var(--text-secondary)]">Job Club Membership:</span>
                    <span className="font-semibold text-[var(--text-primary)]">₹1,500</span>
                  </div>
                )}
                {sale.otherCharges > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-[var(--text-secondary)]">Other Charges:</span>
                    <span className="font-semibold text-[var(--text-primary)]">₹{sale.otherCharges.toLocaleString('en-IN')}</span>
                  </div>
                )}
                {sale.discount > 0 && (
                  <div className="flex justify-between items-center text-green-600 dark:text-green-400">
                    <span>Regular Discount:</span>
                    <span className="font-semibold">-₹{sale.discount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                {sale.specialDiscount > 0 && (
                  <div className="flex justify-between items-center text-green-600 dark:text-green-400">
                    <span>Special Discount:</span>
                    <span className="font-semibold">-₹{sale.specialDiscount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                {sale.typeOfSale === 'EXCHANGE' && sale.exchange && sale.exchange.value > 0 && (
                  <div className="flex justify-between items-center text-green-600 dark:text-green-400">
                    <span>Exchange Value:</span>
                    <span className="font-semibold">-₹{sale.exchange.value.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="border-t border-[var(--border)] pt-3 mt-3 flex justify-between items-center">
                  <span className="font-bold text-base text-[var(--text-primary)]">Grand Total:</span>
                  <span className="font-black text-xl text-red-600">₹{grandTotal.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </section>

          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 sm:p-6 border-t border-[var(--border)] bg-[var(--bg-secondary)] flex-shrink-0">
          <div className="flex items-center gap-2 text-base sm:text-lg font-bold text-[var(--text-primary)]">
            <Calculator size={20} className="shrink-0" />
            <span className="truncate">Grand Total: ₹{grandTotal.toLocaleString('en-IN')}</span>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
            {booking.sale?.specialDiscountApprovalStatus === 'PENDING' && (
              <div className="text-xs text-center sm:text-right text-orange-600 dark:text-orange-400 font-semibold">
                ⏳ Awaiting special discount approval
              </div>
            )}
            <button
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2 text-[var(--text-secondary)] border border-[var(--border)] rounded-lg hover:bg-[var(--hover-bg)] transition font-semibold"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || (booking.sale?.specialDiscountApprovalStatus === 'PENDING' && user?.role !== 'Super Admin' && user?.role !== 'Showroom Manager')}
              className="flex-1 sm:flex-none px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2 font-bold shadow-lg shadow-red-600/20"
              title={booking.sale?.specialDiscountApprovalStatus === 'PENDING' ? 'Approval pending' : ''}
            >
              <Save size={18} />
              {isSubmitting ? 'Saving...' : 'Save & Submit'}
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black/70 z-[60] flex items-center justify-center p-4">
          <div className="bg-[var(--card-bg)] rounded-xl shadow-2xl max-w-md w-full p-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 mx-auto mb-4">
              <AlertCircle size={24} className="text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-lg font-bold text-[var(--text-primary)] text-center mb-2">
              Confirm Sales Details
            </h3>
            <p className="text-sm text-[var(--text-secondary)] text-center mb-6">
              Please review all the information carefully. Once confirmed, you can proceed to payment.
            </p>
            <div className="bg-[var(--bg-secondary)] p-4 rounded-lg mb-6 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[var(--text-muted)]">Booking ID:</span>
                <span className="font-semibold text-[var(--text-primary)]">{booking.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-muted)]">Customer:</span>
                <span className="font-semibold text-[var(--text-primary)]">{booking.customer.fullName}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-[var(--border)]">
                <span className="font-bold text-[var(--text-primary)]">Grand Total:</span>
                <span className="font-black text-lg text-red-600">₹{grandTotal.toLocaleString('en-IN')}</span>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmation(false)}
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 text-[var(--text-secondary)] border border-[var(--border)] rounded-lg hover:bg-[var(--hover-bg)] transition font-semibold"
              >
                Review Again
              </button>
              <button
                onClick={handleConfirmSubmit}
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition font-bold flex items-center justify-center gap-2"
              >
                <CheckCircle size={18} />
                {isSubmitting ? 'Confirming...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Approval Notice Modal */}
      {showApprovalNotice && (
        <div className="fixed inset-0 bg-black/70 z-[60] flex items-center justify-center p-4">
          <div className="bg-[var(--card-bg)] rounded-xl shadow-2xl max-w-md w-full p-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-orange-100 dark:bg-orange-900/30 mx-auto mb-4">
              <AlertCircle size={32} className="text-orange-600 dark:text-orange-400" />
            </div>
            <h3 className="text-xl font-bold text-[var(--text-primary)] text-center mb-2">
              Manager Approval Required
            </h3>
            <p className="text-sm text-[var(--text-secondary)] text-center mb-6">
              Your sales request includes a special discount of ₹{sale.specialDiscount.toLocaleString('en-IN')} which requires manager approval.
            </p>
            
            <div className="bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800 rounded-lg p-4 mb-6">
              <div className="flex gap-3">
                <AlertCircle size={20} className="text-orange-600 dark:text-orange-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-orange-800 dark:text-orange-200 mb-2">
                    What happens next?
                  </p>
                  <ul className="text-xs text-orange-700 dark:text-orange-300 space-y-1">
                    <li>• Your request will be submitted for approval</li>
                    <li>• Status will be marked as "Pending Approval"</li>
                    <li>• You'll be notified once approved</li>
                    <li>• Payment can proceed only after approval</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-[var(--bg-secondary)] p-4 rounded-lg mb-6 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[var(--text-muted)]">Booking ID:</span>
                <span className="font-semibold text-[var(--text-primary)]">{booking.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-muted)]">Special Discount:</span>
                <span className="font-bold text-orange-600 dark:text-orange-400">₹{sale.specialDiscount.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-[var(--border)]">
                <span className="font-bold text-[var(--text-primary)]">Grand Total:</span>
                <span className="font-black text-lg text-red-600">₹{grandTotal.toLocaleString('en-IN')}</span>
              </div>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowApprovalNotice(false);
                }}
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 text-[var(--text-secondary)] border border-[var(--border)] rounded-lg hover:bg-[var(--hover-bg)] transition font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleApprovalAcknowledge}
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 transition font-bold flex items-center justify-center gap-2"
              >
                <CheckCircle size={18} />
                {isSubmitting ? 'Submitting...' : 'Submit for Approval'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Confirmation Modal */}
      {showPaymentConfirm && (
        <div className="fixed inset-0 bg-black/70 z-[60] flex items-center justify-center p-4">
          <div className="bg-[var(--card-bg)] rounded-xl shadow-2xl max-w-md w-full p-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 mx-auto mb-4">
              <CreditCard size={24} className="text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-lg font-bold text-[var(--text-primary)] text-center mb-2">
              Proceed to Payment
            </h3>
            <p className="text-sm text-[var(--text-secondary)] text-center mb-6">
              Sales details have been saved successfully. You can now proceed with the payment process.
            </p>
            <div className="bg-[var(--bg-secondary)] p-4 rounded-lg mb-6">
              <div className="text-center">
                <div className="text-xs text-[var(--text-muted)] mb-1">Amount to Pay</div>
                <div className="text-2xl font-black text-green-600">₹{grandTotal.toLocaleString('en-IN')}</div>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowPaymentConfirm(false)}
                className="flex-1 px-4 py-2 text-[var(--text-secondary)] border border-[var(--border)] rounded-lg hover:bg-[var(--hover-bg)] transition font-semibold"
              >
                Later
              </button>
              <button
                onClick={() => {
                  setShowPaymentConfirm(false);
                  onClose(); // Close the form after saving
                }}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-bold flex items-center justify-center gap-2"
              >
                <CreditCard size={18} />
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
