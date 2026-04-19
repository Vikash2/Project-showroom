import type { Booking } from '../types/booking';

/**
 * Check if a sale is locked and cannot be edited
 */
export function isSaleLocked(booking: Booking): boolean {
  // Locked if payment is confirmed
  if (booking.paymentConfirmed) {
    return true;
  }

  // Locked if in final stages
  const lockedStatuses = ['Payment Complete', 'Delivered', 'Ready for Payment'];
  if (lockedStatuses.includes(booking.status)) {
    return true;
  }

  return false;
}

/**
 * Check if sale can be transferred to cashier
 */
export function canTransferToCashier(booking: Booking): boolean {
  // Must be finalized
  if (booking.status !== 'Sales Finalized') {
    return false;
  }

  // Must not be already transferred
  if (booking.status === 'Ready for Payment' || booking.status === 'Payment Complete') {
    return false;
  }

  // Must have sale data
  if (!booking.sale) {
    return false;
  }

  // If special discount, must be approved
  if (booking.sale.specialDiscount > 0 && booking.sale.specialDiscountApprovalStatus !== 'Approved') {
    return false;
  }

  return true;
}

/**
 * Get user-friendly status message
 */
export function getSalesStatusMessage(booking: Booking): string {
  if (booking.paymentConfirmed) {
    return 'Payment confirmed - Sale is locked';
  }

  switch (booking.status) {
    case 'Pending':
      return 'Awaiting booking confirmation';
    case 'Confirmed':
      return 'Ready for sales processing';
    case 'Sales Finalized':
      return 'Sales finalized - Ready to transfer to cashier';
    case 'Ready for Payment':
      return 'Transferred to cashier - Awaiting payment';
    case 'Payment Complete':
      return 'Payment completed - Ready for delivery';
    case 'Delivered':
      return 'Vehicle delivered';
    case 'Pending Approval':
      return 'Awaiting special discount approval';
    default:
      return booking.status;
  }
}

/**
 * Get status color class
 */
export function getStatusColorClass(status: string): string {
  switch (status) {
    case 'Pending':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
    case 'Confirmed':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
    case 'Sales Finalized':
      return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
    case 'Ready for Payment':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
    case 'Payment Complete':
      return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300';
    case 'Delivered':
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
    case 'Pending Approval':
      return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300';
    case 'Cancelled':
      return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
  }
}
