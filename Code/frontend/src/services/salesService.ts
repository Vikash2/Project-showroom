import api from './api';

/**
 * Create a direct sale (without booking)
 */
export async function createDirectSale(saleData: any) {
  try {
    console.log('🔥 [salesService] Creating direct sale:', saleData);
    const response = await api.post('/api/sales', saleData);
    console.log('🔥 [salesService] Direct sale created:', response.data);
    return {
      success: true,
      sale: response.data.sale,
      message: response.data.message,
    };
  } catch (error: any) {
    console.error('🔥 [salesService] Create direct sale error:', error);
    return {
      success: false,
      error: {
        code: error.code || 'CREATE_DIRECT_SALE_ERROR',
        message: error.message || 'Failed to create direct sale',
      },
    };
  }
}

/**
 * Create or update sale from booking
 */
export async function createSaleFromBooking(bookingId: string, saleData: any) {
  try {
    const response = await api.post(`/api/sales/bookings/${bookingId}`, saleData);
    return {
      success: true,
      sale: response.data.sale,
      message: response.data.message,
    };
  } catch (error: any) {
    console.error('[salesService] Create sale error:', error);
    return {
      success: false,
      error: {
        code: error.code || 'CREATE_SALE_ERROR',
        message: error.message || 'Failed to create sale',
      },
    };
  }
}

/**
 * Update existing sale
 */
export async function updateSale(saleId: string, saleData: any) {
  try {
    const response = await api.patch(`/api/sales/${saleId}`, saleData);
    return {
      success: true,
      sale: response.data.sale,
      message: response.data.message,
    };
  } catch (error: any) {
    console.error('[salesService] Update sale error:', error);
    return {
      success: false,
      error: {
        code: error.code || 'UPDATE_SALE_ERROR',
        message: error.message || 'Failed to update sale',
      },
    };
  }
}

/**
 * Approve special discount (Manager/Super Admin only)
 */
export async function approveSpecialDiscount(saleId: string) {
  try {
    const response = await api.post(`/api/sales/${saleId}/approve-discount`);
    return {
      success: true,
      sale: response.data.sale,
      message: response.data.message,
    };
  } catch (error: any) {
    console.error('[salesService] Approve discount error:', error);
    return {
      success: false,
      error: {
        code: error.code || 'APPROVE_ERROR',
        message: error.message || 'Failed to approve discount',
      },
    };
  }
}

/**
 * Reject special discount
 */
export async function rejectSpecialDiscount(saleId: string, reason: string) {
  try {
    const response = await api.post(`/api/sales/${saleId}/reject-discount`, { reason });
    return {
      success: true,
      sale: response.data.sale,
      message: response.data.message,
    };
  } catch (error: any) {
    console.error('[salesService] Reject discount error:', error);
    return {
      success: false,
      error: {
        code: error.code || 'REJECT_ERROR',
        message: error.message || 'Failed to reject discount',
      },
    };
  }
}

/**
 * Transfer sale to cashier
 */
export async function transferToCashier(saleId: string) {
  try {
    const response = await api.post(`/api/sales/${saleId}/transfer-to-cashier`);
    return {
      success: true,
      sale: response.data.sale,
      message: response.data.message,
    };
  } catch (error: any) {
    console.error('[salesService] Transfer to cashier error:', error);
    return {
      success: false,
      error: {
        code: error.code || 'TRANSFER_ERROR',
        message: error.message || 'Failed to transfer to cashier',
      },
    };
  }
}

/**
 * Get sale by ID
 */
export async function getSale(saleId: string) {
  try {
    console.log('🔥 [salesService] Getting sale by ID:', saleId);
    const response = await api.get(`/api/sales/${saleId}`);
    console.log('🔥 [salesService] Sale retrieved:', response.data);
    return {
      success: true,
      sale: response.data.sale,
    };
  } catch (error: any) {
    console.error('🔥 [salesService] Get sale error:', error);
    return {
      success: false,
      error: {
        code: error.code || 'GET_SALE_ERROR',
        message: error.message || 'Failed to get sale',
      },
    };
  }
}

/**
 * Get sale by booking ID
 */
export async function getSaleByBookingId(bookingId: string) {
  try {
    const response = await api.get(`/api/sales/bookings/${bookingId}`);
    return {
      success: true,
      sale: response.data.sale,
    };
  } catch (error: any) {
    console.error('[salesService] Get sale by booking error:', error);
    return {
      success: false,
      error: {
        code: error.code || 'GET_SALE_ERROR',
        message: error.message || 'Failed to get sale',
      },
    };
  }
}

/**
 * List all sales with filters
 */
export async function listSales(filters?: {
  status?: string;
  paymentStatus?: string;
  saleType?: string;
  dateFrom?: string;
  dateTo?: string;
}) {
  try {
    console.log('🔥 [salesService] Listing sales with filters:', filters);
    const params = new URLSearchParams();
    
    if (filters?.status) params.append('status', filters.status);
    if (filters?.paymentStatus) params.append('paymentStatus', filters.paymentStatus);
    if (filters?.saleType) params.append('saleType', filters.saleType);
    if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom);
    if (filters?.dateTo) params.append('dateTo', filters.dateTo);
    
    const queryString = params.toString();
    const url = queryString ? `/api/sales?${queryString}` : '/api/sales';
    
    console.log('🔥 [salesService] Making API call to:', url);
    const response = await api.get(url);
    console.log('🔥 [salesService] Sales retrieved:', response.data);
    
    return {
      success: true,
      sales: response.data.sales || [],
      count: response.data.count || 0,
    };
  } catch (error: any) {
    console.error('🔥 [salesService] List sales error:', error);
    return {
      success: false,
      error: {
        code: error.code || 'LIST_SALES_ERROR',
        message: error.message || 'Failed to list sales',
      },
    };
  }
}

