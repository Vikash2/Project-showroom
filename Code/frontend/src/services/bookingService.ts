import api from './api';

/**
 * Create a new booking
 */
export async function createBooking(bookingData: {
  customerName: string;
  email?: string;
  mobile: string;
  vehicleId: string;
  variantId: string;
  colorId: string;
  showroomId: string;
  bookingAmount: number;
  notes?: string;
}) {
  try {
    console.log('[bookingService] Creating booking:', bookingData);
    const response = await api.post('/api/bookings', bookingData);
    console.log('[bookingService] Booking created:', response.data);
    return {
      success: true,
      booking: response.data.booking,
      message: response.data.message,
    };
  } catch (error: any) {
    console.error('[bookingService] Create booking error:', error);
    return {
      success: false,
      error: {
        code: error.code || 'CREATE_BOOKING_ERROR',
        message: error.message || 'Failed to create booking',
      },
    };
  }
}

/**
 * List all bookings
 */
export async function listBookings(filters?: {
  status?: string;
  showroomId?: string;
}) {
  try {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.showroomId) params.append('showroomId', filters.showroomId);

    const response = await api.get(`/api/bookings?${params.toString()}`);
    return {
      success: true,
      bookings: response.data.bookings,
      count: response.data.count,
    };
  } catch (error: any) {
    console.error('[bookingService] List bookings error:', error);
    return {
      success: false,
      error: {
        code: error.code || 'LIST_BOOKINGS_ERROR',
        message: error.message || 'Failed to list bookings',
      },
    };
  }
}

/**
 * Update booking status
 */
export async function updateBookingStatus(bookingId: string, status: string) {
  try {
    console.log('[bookingService] Updating booking status:', bookingId, status);
    const response = await api.patch(`/api/bookings/${bookingId}/status`, { status });
    console.log('[bookingService] Status updated:', response.data);
    return {
      success: true,
      booking: response.data.booking,
      message: response.data.message,
    };
  } catch (error: any) {
    console.error('[bookingService] Update status error:', error);
    return {
      success: false,
      error: {
        code: error.code || 'UPDATE_STATUS_ERROR',
        message: error.message || 'Failed to update status',
      },
    };
  }
}

/**
 * Assign chassis and engine number
 */
export async function assignChassis(bookingId: string, chassisNumber: string, engineNumber: string) {
  try {
    const response = await api.patch(`/api/bookings/${bookingId}/chassis`, {
      chassisNumber,
      engineNumber,
    });
    return {
      success: true,
      booking: response.data.booking,
      message: response.data.message,
    };
  } catch (error: any) {
    console.error('[bookingService] Assign chassis error:', error);
    return {
      success: false,
      error: {
        code: error.code || 'ASSIGN_CHASSIS_ERROR',
        message: error.message || 'Failed to assign chassis',
      },
    };
  }
}

/**
 * Request approval for special discount
 */
export async function requestApproval(bookingId: string, discountAmount: number) {
  try {
    const response = await api.post(`/api/bookings/${bookingId}/sale/request-approval`, {
      discountAmount,
    });
    return {
      success: true,
      sale: response.data.sale,
      message: response.data.message,
    };
  } catch (error: any) {
    console.error('[bookingService] Request approval error:', error);
    return {
      success: false,
      error: {
        code: error.code || 'REQUEST_APPROVAL_ERROR',
        message: error.message || 'Failed to request approval',
      },
    };
  }
}

/**
 * Approve or reject special discount
 */
export async function handleApproval(bookingId: string, isApproved: boolean, reason?: string) {
  try {
    const response = await api.post(`/api/bookings/${bookingId}/sale/approve`, {
      isApproved,
      reason,
    });
    return {
      success: true,
      sale: response.data.sale,
      message: response.data.message,
    };
  } catch (error: any) {
    console.error('[bookingService] Handle approval error:', error);
    return {
      success: false,
      error: {
        code: error.code || 'HANDLE_APPROVAL_ERROR',
        message: error.message || 'Failed to handle approval',
      },
    };
  }
}

/**
 * Add payment to booking
 */
export async function addPayment(bookingId: string, paymentData: {
  amount: number;
  paymentMethod: string;
  reference?: string;
}) {
  try {
    console.log('[bookingService] Adding payment:', bookingId, paymentData);
    const response = await api.post(`/api/bookings/${bookingId}/payments`, paymentData);
    console.log('[bookingService] Payment added:', response.data);
    return {
      success: true,
      payment: response.data.payment,
      message: response.data.message,
    };
  } catch (error: any) {
    console.error('[bookingService] Add payment error:', error);
    return {
      success: false,
      error: {
        code: error.code || 'ADD_PAYMENT_ERROR',
        message: error.message || 'Failed to add payment',
      },
    };
  }
}

/**
 * Confirm payment (locks the booking)
 */
export async function confirmPayment(bookingId: string) {
  try {
    console.log('[bookingService] Confirming payment:', bookingId);
    const response = await api.post(`/api/bookings/${bookingId}/confirm-payment`);
    console.log('[bookingService] Payment confirmed:', response.data);
    return {
      success: true,
      booking: response.data.booking,
      sale: response.data.sale,
      message: response.data.message,
    };
  } catch (error: any) {
    console.error('[bookingService] Confirm payment error:', error);
    return {
      success: false,
      error: {
        code: error.code || 'CONFIRM_PAYMENT_ERROR',
        message: error.message || 'Failed to confirm payment',
      },
    };
  }
}

/**
 * Confirm delivery
 */
export async function confirmDelivery(bookingId: string, notes?: string) {
  try {
    console.log('[bookingService] Confirming delivery:', bookingId, notes);
    const response = await api.post(`/api/bookings/${bookingId}/confirm-delivery`, {
      notes
    });
    console.log('[bookingService] Delivery confirmed:', response.data);
    return {
      success: true,
      booking: response.data.booking,
      sale: response.data.sale,
      message: response.data.message,
    };
  } catch (error: any) {
    console.error('[bookingService] Confirm delivery error:', error);
    return {
      success: false,
      error: {
        code: error.code || 'CONFIRM_DELIVERY_ERROR',
        message: error.response?.data?.error || error.message || 'Failed to confirm delivery',
      },
    };
  }
}
