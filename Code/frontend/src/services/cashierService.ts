import { supabase } from '../config/supabase';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

// Helper to get auth token
async function getAuthToken(): Promise<string> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) {
    throw new Error('No authentication token found');
  }
  return session.access_token;
}

// Helper for API calls
async function apiCall(endpoint: string, options: RequestInit = {}) {
  const token = await getAuthToken();
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || data.message || 'API request failed');
  }

  return data;
}

// Payment Collection
export interface CollectPaymentData {
  amount: number;
  paymentMethod: 'Cash' | 'Card' | 'UPI' | 'Bank Transfer' | 'Cheque';
  transactionReference?: string;
  notes?: string;
}

export async function collectPayment(bookingId: string, data: CollectPaymentData) {
  return apiCall(`/api/cashier/bookings/${bookingId}/collect-payment`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// Payment Confirmation
export async function confirmPayment(bookingId: string) {
  return apiCall(`/api/cashier/bookings/${bookingId}/confirm-payment`, {
    method: 'POST',
  });
}

// Tax Invoice Approval
export async function approveTaxInvoice(bookingId: string) {
  return apiCall(`/api/cashier/bookings/${bookingId}/approve-invoice`, {
    method: 'POST',
  });
}

// Hold Service
export interface HoldServiceData {
  serviceType: 'insurance' | 'registration';
  reason: string;
}

export async function holdService(bookingId: string, data: HoldServiceData) {
  return apiCall(`/api/cashier/bookings/${bookingId}/hold`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// Release Hold
export async function releaseHold(bookingId: string, serviceType: 'insurance' | 'registration') {
  return apiCall(`/api/cashier/bookings/${bookingId}/release-hold`, {
    method: 'POST',
    body: JSON.stringify({ serviceType }),
  });
}

// Get Receipts
export interface ReceiptFilters {
  bookingId?: string;
  dateFrom?: string;
  dateTo?: string;
}

export async function listReceipts(filters?: ReceiptFilters) {
  const params = new URLSearchParams();
  if (filters?.bookingId) params.append('bookingId', filters.bookingId);
  if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom);
  if (filters?.dateTo) params.append('dateTo', filters.dateTo);

  const queryString = params.toString();
  return apiCall(`/api/cashier/receipts${queryString ? `?${queryString}` : ''}`);
}

// Get Single Receipt
export async function getReceipt(identifier: string) {
  return apiCall(`/api/cashier/receipts/${identifier}`);
}

// Get Single Invoice
export async function getInvoice(identifier: string) {
  return apiCall(`/api/cashier/invoices/${identifier}`);
}

// Types
export interface MoneyReceipt {
  id: string;
  receiptNumber: string;
  bookingId: string;
  saleId: string | null;
  customerName: string;
  amount: number;
  paymentMethod: string;
  transactionReference: string | null;
  issuedBy: string;
  issuedAt: string;
  notes: string | null;
  createdAt: string;
}

export interface TaxInvoice {
  id: string;
  invoiceNumber: string;
  bookingId: string;
  saleId: string;
  customerName: string;
  customerAddress: string;
  customerMobile: string;
  customerEmail: string | null;
  gstNumber: string | null;
  vehicleDetails: any;
  pricingBreakdown: any;
  totalAmount: number;
  approvedBy: string;
  approvedAt: string;
  generatedAt: string;
  createdAt: string;
}
