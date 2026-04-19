import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import toast from 'react-hot-toast';
import type { Booking, BookingStatus, DocumentStatus, PaymentRecord, FinalSale, DocumentFile } from '../types/booking';
import { useVehicles } from './VehicleContext';
import { supabase } from '../config/supabase';
import * as bookingService from '../services/bookingService';

interface BookingContextType {
  bookings: Booking[];
  isLoading: boolean;
  error: string | null;
  addBooking: (bookingData: Omit<Booking, 'id' | 'date' | 'status' | 'documents' | 'payments' | 'bookingAmountPaid' | 'balanceDue'>) => Promise<string | null>;
  updateBookingStatus: (id: string, status: BookingStatus) => Promise<void>;
  uploadDocument: (id: string, docType: keyof DocumentStatus, file: DocumentFile) => void;
  removeDocument: (id: string, docType: keyof DocumentStatus) => void;
  addPayment: (bookingId: string, payment: Omit<PaymentRecord, 'id' | 'date'>) => Promise<void>;
  cancelBooking: (id: string, reason: string) => Promise<void>;
  updateBookingSale: (bookingId: string, saleData: FinalSale) => Promise<void>;
  confirmPayment: (bookingId: string) => Promise<void>;
  confirmDelivery: (bookingId: string) => Promise<void>;
  refreshBookings: () => Promise<void>;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export function BookingProvider({ children }: { children: ReactNode }) {
  const { decrementStock } = useVehicles();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load bookings from backend API on mount
  const loadBookings = useCallback(async () => {
    console.log('📋 [BookingContext] Loading bookings from backend...');
    setIsLoading(true);
    setError(null);

    try {
      // Check if we have a valid session before making API calls
      console.log('📋 [BookingContext] Checking authentication session...');
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('📋 [BookingContext] Session error:', sessionError);
        setError('Authentication error. Please try logging in again.');
        setIsLoading(false);
        return;
      }
      
      if (!session?.access_token) {
        console.warn('📋 [BookingContext] No valid session found, skipping API call');
        setError('Authentication required. Please log in again.');
        setIsLoading(false);
        return;
      }

      console.log('📋 [BookingContext] Valid session found:', {
        userEmail: session.user?.email,
        hasToken: !!session.access_token,
        tokenExpiry: session.expires_at ? new Date(session.expires_at * 1000) : null
      });

      // Add timeout to prevent infinite loading
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout - API took too long to respond')), 15000)
      );
      
      console.log('📋 [BookingContext] Making API call to list bookings...');
      const result = await Promise.race([
        bookingService.listBookings(),
        timeoutPromise
      ]) as any;
      
      console.log('📋 [BookingContext] API call completed:', {
        success: result.success,
        hasBookings: !!result.bookings,
        bookingCount: result.bookings?.length || 0,
        error: result.error
      });
      
      if (result.success && result.bookings) {
        console.log('📋 [BookingContext] Bookings loaded from backend:', result.bookings.length);
        
        // Map backend booking format to frontend format
        const mappedBookings: Booking[] = result.bookings.map((backendBooking: any) => ({
          id: backendBooking.id,
          date: backendBooking.createdAt,
          customer: {
            fullName: backendBooking.customerName,
            mobile: backendBooking.mobile,
            email: backendBooking.email || '',
            address: backendBooking.address || '',
            emergencyContact: backendBooking.emergencyContact || ''
          },
          vehicleConfig: {
            modelId: backendBooking.vehicleId,
            variantId: backendBooking.variantId,
            colorName: backendBooking.colorName || backendBooking.colorId
          },
          selectedAccessories: backendBooking.accessories || [],
          pricing: {
            exShowroom: backendBooking.exShowroomPrice || 0,
            rtoTotal: backendBooking.rtoCharges || 0,
            insuranceTotal: backendBooking.insuranceCharges || 0,
            accessoriesTotal: backendBooking.accessoriesCharges || 0,
            otherChargesTotal: backendBooking.otherCharges || 0,
            onRoadPrice: backendBooking.onRoadPrice || 0
          },
          payments: backendBooking.payments || [],
          bookingAmountPaid: backendBooking.bookingAmountPaid || 0,
          balanceDue: backendBooking.balanceDue || backendBooking.onRoadPrice || 0,
          status: backendBooking.status as BookingStatus,
          documents: backendBooking.documents || {
            aadharCard: {},
            panCard: {},
            drivingLicense: {},
            addressProof: {},
            passportPhotos: {}
          },
          chassisNumber: backendBooking.chassisNumber,
          engineNumber: backendBooking.engineNumber,
          deliveryDate: backendBooking.deliveryDate,
          notes: backendBooking.notes
        }));
        
        setBookings(mappedBookings);
        console.log('📋 [BookingContext] Bookings mapped and set in state:', mappedBookings.length);
      } else {
        console.warn('📋 [BookingContext] Failed to load bookings:', result.error);
        const errorMessage = result.error?.message || result.error?.code || 'Failed to load bookings';
        
        // Show more specific error messages
        if (result.error?.code === 'AUTH_TOKEN_MISSING' || result.error?.code === 'AUTH_TOKEN_INVALID') {
          setError('Authentication expired. Please refresh the page and log in again.');
        } else if (result.error?.code === 'NETWORK_ERROR') {
          setError('Unable to connect to server. Please check your internet connection.');
        } else {
          setError(errorMessage);
        }
      }
    } catch (err: any) {
      console.error('📋 [BookingContext] Error loading bookings:', err);
      let errorMessage = 'Failed to load bookings';
      
      if (err.message?.includes('timeout')) {
        errorMessage = 'Request timeout. The server is taking too long to respond.';
      } else if (err.code === 'NETWORK_ERROR') {
        errorMessage = 'Network error. Please check your internet connection.';
      } else if (err.code === 'AUTH_TOKEN_MISSING' || err.code === 'AUTH_TOKEN_INVALID') {
        errorMessage = 'Authentication expired. Please refresh the page and log in again.';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load bookings on mount, but wait for auth to be ready
  useEffect(() => {
    let isMounted = true;
    
    const initializeBookings = async () => {
      console.log('📋 [BookingContext] Initializing bookings...');
      
      // Wait for auth to be ready
      let authReady = false;
      let attempts = 0;
      
      while (!authReady && attempts < 10 && isMounted) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.access_token) {
          authReady = true;
          console.log('📋 [BookingContext] Auth is ready, proceeding with bookings load');
        } else {
          attempts++;
          console.log(`📋 [BookingContext] Waiting for auth... attempt ${attempts}/10`);
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
      
      if (!authReady && isMounted) {
        console.warn('📋 [BookingContext] Auth not ready after waiting, setting error');
        setError('Authentication not ready. Please refresh the page.');
        setIsLoading(false);
        return;
      }
      
      if (isMounted) {
        await loadBookings();
      }
    };

    initializeBookings();

    return () => {
      isMounted = false;
    };
  }, [loadBookings]);

  const refreshBookings = useCallback(async () => {
    await loadBookings();
  }, [loadBookings]);

  const addBooking = async (bookingData: Omit<Booking, 'id' | 'date' | 'status' | 'documents' | 'payments' | 'bookingAmountPaid' | 'balanceDue'>): Promise<string | null> => {
    console.log('📋 [BookingContext] Creating booking via API:', bookingData);
    
    try {
      // Map frontend booking data to backend format
      const backendBookingData = {
        customerName: bookingData.customer.fullName,
        email: bookingData.customer.email,
        mobile: bookingData.customer.mobile,
        vehicleId: bookingData.vehicleConfig.modelId,
        variantId: bookingData.vehicleConfig.variantId,
        colorId: bookingData.vehicleConfig.colorName, // Backend expects colorId
        showroomId: 'default-showroom', // TODO: Get from context
        bookingAmount: 5000, // Default booking amount
        notes: 'Created from frontend'
      };

      const result = await bookingService.createBooking(backendBookingData);
      
      if (result.success && result.booking) {
        console.log('📋 [BookingContext] Booking created successfully:', result.booking.id);
        toast.success('Booking created successfully');
        
        // Refresh bookings to get the latest data
        await refreshBookings();
        
        return result.booking.id;
      } else {
        console.error('📋 [BookingContext] Failed to create booking:', result.error?.message);
        toast.error(result.error?.message || 'Failed to create booking');
        return null;
      }
    } catch (error: any) {
      console.error('📋 [BookingContext] Error creating booking:', error);
      toast.error('Failed to create booking');
      return null;
    }
  };

  const updateBookingStatus = async (id: string, status: BookingStatus): Promise<void> => {
    console.log('📋 [BookingContext] Updating booking status via API:', id, status);
    
    try {
      const result = await bookingService.updateBookingStatus(id, status);
      
      if (result.success) {
        console.log('📋 [BookingContext] Status updated successfully');
        toast.success('Booking status updated');
        
        // Update local state immediately for better UX
        setBookings(prev => prev.map(bk => {
          if (bk.id === id) {
            // Handle stock update for confirmed bookings
            if (status === 'Confirmed' && bk.status !== 'Confirmed') {
              decrementStock(
                bk.vehicleConfig.modelId,
                bk.vehicleConfig.variantId,
                bk.vehicleConfig.colorName
              );
            }
            return { ...bk, status };
          }
          return bk;
        }));
        
        // Refresh to ensure consistency
        await refreshBookings();
      } else {
        console.error('📋 [BookingContext] Failed to update status:', result.error?.message);
        toast.error(result.error?.message || 'Failed to update status');
      }
    } catch (error: any) {
      console.error('📋 [BookingContext] Error updating status:', error);
      toast.error('Failed to update booking status');
    }
  };

  const addPayment = async (bookingId: string, paymentData: Omit<PaymentRecord, 'id' | 'date'>): Promise<void> => {
    console.log('📋 [BookingContext] Adding payment via API:', bookingId, paymentData);
    
    try {
      const result = await bookingService.addPayment(bookingId, {
        amount: paymentData.amount,
        paymentMethod: paymentData.method,
        reference: paymentData.referenceNumber
      });
      
      if (result.success) {
        console.log('📋 [BookingContext] Payment added successfully');
        toast.success('Payment added successfully');
        
        // Refresh bookings to get updated payment info
        await refreshBookings();
      } else {
        console.error('📋 [BookingContext] Failed to add payment:', result.error?.message);
        toast.error(result.error?.message || 'Failed to add payment');
      }
    } catch (error: any) {
      console.error('📋 [BookingContext] Error adding payment:', error);
      toast.error('Failed to add payment');
    }
  };

  const confirmPayment = async (bookingId: string): Promise<void> => {
    console.log('📋 [BookingContext] Confirming payment via API:', bookingId);
    
    try {
      const result = await bookingService.confirmPayment(bookingId);
      
      if (result.success) {
        console.log('📋 [BookingContext] Payment confirmed successfully');
        toast.success('Payment confirmed');
        
        // Refresh bookings to get updated status
        await refreshBookings();
      } else {
        console.error('📋 [BookingContext] Failed to confirm payment:', result.error?.message);
        toast.error(result.error?.message || 'Failed to confirm payment');
      }
    } catch (error: any) {
      console.error('📋 [BookingContext] Error confirming payment:', error);
      toast.error('Failed to confirm payment');
    }
  };

  const confirmDelivery = async (bookingId: string): Promise<void> => {
    console.log('📋 [BookingContext] Confirming delivery via API:', bookingId);
    
    try {
      const result = await bookingService.confirmDelivery(bookingId);
      
      if (result.success) {
        console.log('📋 [BookingContext] Delivery confirmed successfully');
        toast.success('Delivery confirmed');
        
        // Refresh bookings to get updated status
        await refreshBookings();
      } else {
        console.error('📋 [BookingContext] Failed to confirm delivery:', result.error?.message);
        toast.error(result.error?.message || 'Failed to confirm delivery');
      }
    } catch (error: any) {
      console.error('📋 [BookingContext] Error confirming delivery:', error);
      toast.error('Failed to confirm delivery');
    }
  };

  const cancelBooking = async (id: string, reason: string): Promise<void> => {
    console.log('📋 [BookingContext] Cancelling booking via API:', id, reason);
    
    try {
      const result = await bookingService.updateBookingStatus(id, 'Cancelled');
      
      if (result.success) {
        console.log('📋 [BookingContext] Booking cancelled successfully');
        toast.success('Booking cancelled');
        
        // Update local state
        setBookings(prev => prev.map(bk => 
          bk.id === id ? { ...bk, status: 'Cancelled', cancellationReason: reason } : bk
        ));
        
        // Refresh to ensure consistency
        await refreshBookings();
      } else {
        console.error('📋 [BookingContext] Failed to cancel booking:', result.error?.message);
        toast.error(result.error?.message || 'Failed to cancel booking');
      }
    } catch (error: any) {
      console.error('📋 [BookingContext] Error cancelling booking:', error);
      toast.error('Failed to cancel booking');
    }
  };

  const updateBookingSale = async (bookingId: string, saleData: FinalSale): Promise<void> => {
    console.log('📋 [BookingContext] Updating booking sale data:', bookingId, saleData);
    
    // For now, update local state - this should be replaced with API call when sale endpoints are ready
    setBookings(prev => prev.map(bk => {
      if (bk.id === bookingId) {
        return { ...bk, sale: saleData };
      }
      return bk;
    }));
    
    toast.success('Sale data updated');
  };

  // Document management - these remain local for now as they're typically handled differently
  const uploadDocument = useCallback((id: string, docType: keyof DocumentStatus, file: DocumentFile) => {
    setBookings(prev => prev.map(bk => {
      if (bk.id !== id) return bk;
      return { ...bk, documents: { ...bk.documents, [docType]: { file } } };
    }));
    toast.success('Document uploaded');
  }, []);

  const removeDocument = useCallback((id: string, docType: keyof DocumentStatus) => {
    setBookings(prev => prev.map(bk => {
      if (bk.id !== id) return bk;
      return { ...bk, documents: { ...bk.documents, [docType]: {} } };
    }));
    toast.success('Document removed');
  }, []);

  return (
    <BookingContext.Provider value={{
      bookings,
      isLoading,
      error,
      addBooking,
      updateBookingStatus,
      uploadDocument,
      removeDocument,
      addPayment,
      cancelBooking,
      updateBookingSale,
      confirmPayment,
      confirmDelivery,
      refreshBookings
    }}>
      {children}
    </BookingContext.Provider>
  );
}

export function useBookings() {
  const context = useContext(BookingContext);
  if (context === undefined) {
    throw new Error('useBookings must be used within a BookingProvider');
  }
  return context;
}
