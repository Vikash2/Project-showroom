import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { Booking, BookingStatus, DocumentStatus, PaymentRecord, FinalSale, DocumentFile } from '../types/booking';
import { useVehicles } from './VehicleContext';

const STORAGE_KEY = 'showroom-bookings';

const initialBookings: Booking[] = [
  {
    id: 'SH-BK-2025-001',
    date: new Date(Date.now() - 3 * 86400000).toISOString(),
    customer: { fullName: 'Suresh Raina', mobile: '9876501234', email: 'suresh@example.com', address: 'Boring Road, Patna', emergencyContact: '9876543210' },
    vehicleConfig: { modelId: 'v1', variantId: 'v1-deluxe', colorName: 'Pearl Precious White' },
    selectedAccessories: ['acc1', 'acc4'],
    pricing: {
      exShowroom: 74216,
      rtoTotal: 5100,
      insuranceTotal: 6250,
      accessoriesTotal: 4700, // (3500 full body + 1200 gear)
      otherChargesTotal: 1200,
      onRoadPrice: 91466
    },
    payments: [
      { id: 'p1', date: new Date(Date.now() - 3 * 86400000).toISOString(), amount: 5000, method: 'UPI', referenceNumber: 'UPI987654321', type: 'Booking Amount' }
    ],
    bookingAmountPaid: 5000,
    balanceDue: 86466,
    status: 'Confirmed',
    documents: { 
      aadharCard: {},
      panCard: {},
      drivingLicense: {},
      addressProof: {},
      passportPhotos: {}
    }
  }
];

// Load bookings from localStorage or use initial data
const loadBookings = (): Booking[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Failed to load bookings from localStorage:', error);
  }
  return initialBookings;
};

interface BookingContextType {
  bookings: Booking[];
  addBooking: (bookingData: Omit<Booking, 'id' | 'date' | 'status' | 'documents' | 'payments' | 'bookingAmountPaid' | 'balanceDue'>) => string;
  updateBookingStatus: (id: string, status: BookingStatus) => void;
  uploadDocument: (id: string, docType: keyof DocumentStatus, file: DocumentFile) => void;
  removeDocument: (id: string, docType: keyof DocumentStatus) => void;
  addPayment: (bookingId: string, payment: Omit<PaymentRecord, 'id' | 'date'>) => void;
  cancelBooking: (id: string, reason: string) => void;
  updateBookingSale: (bookingId: string, saleData: FinalSale) => Promise<void>;
  confirmPayment: (bookingId: string) => void;
  confirmDelivery: (bookingId: string) => void;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export function BookingProvider({ children }: { children: ReactNode }) {
  const { decrementStock } = useVehicles();
  const [bookings, setBookings] = useState<Booking[]>(loadBookings);

  // Persist bookings to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(bookings));
    } catch (error) {
      console.error('Failed to save bookings to localStorage:', error);
    }
  }, [bookings]);

  const addBooking = (bookingData: Omit<Booking, 'id' | 'date' | 'status' | 'documents' | 'payments' | 'bookingAmountPaid' | 'balanceDue'>) => {
    const newId = `SH-BK-${new Date().getFullYear()}-${String(bookings.length + 1).padStart(3, '0')}`;
    
    const newBooking: Booking = {
      ...bookingData,
      id: newId,
      date: new Date().toISOString(),
      status: 'Pending',
      documents: { 
        aadharCard: {},
        panCard: {},
        drivingLicense: {},
        addressProof: {},
        passportPhotos: {}
      },
      payments: [],
      bookingAmountPaid: 0,
      balanceDue: bookingData.pricing.onRoadPrice
    };
    
    setBookings(prev => [newBooking, ...prev]);
    return newId;
  };

  const handleStockUpdate = (booking: Booking, newStatus: BookingStatus) => {
    // If the status is changing to Confirmed or Stock Allocated from a lower status, decrement stock
    const triggerStatuses: BookingStatus[] = ['Confirmed', 'Stock Allocated'];
    if (triggerStatuses.includes(newStatus) && !triggerStatuses.includes(booking.status)) {
      decrementStock(
        booking.vehicleConfig.modelId,
        booking.vehicleConfig.variantId,
        booking.vehicleConfig.colorName
      );
    }
  };

  const updateBookingStatus = (id: string, status: BookingStatus) => {
    setBookings(prev => prev.map(bk => {
      if (bk.id === id) {
        handleStockUpdate(bk, status);
        return { ...bk, status };
      }
      return bk;
    }));
  };


  const uploadDocument = useCallback((id: string, docType: keyof DocumentStatus, file: DocumentFile) => {
    setBookings(prev => prev.map(bk => {
      if (bk.id !== id) return bk;
      return { ...bk, documents: { ...bk.documents, [docType]: { file } } };
    }));
  }, []);

  const removeDocument = useCallback((id: string, docType: keyof DocumentStatus) => {
    setBookings(prev => prev.map(bk => {
      if (bk.id !== id) return bk;
      return { ...bk, documents: { ...bk.documents, [docType]: {} } };
    }));
  }, []);

  const addPayment = (bookingId: string, paymentData: Omit<PaymentRecord, 'id' | 'date'>) => {
    setBookings(prev => prev.map(bk => {
      if (bk.id === bookingId) {
        const newPayment: PaymentRecord = {
          ...paymentData,
          id: `pay-${Date.now()}`,
          date: new Date().toISOString()
        };
        
        const newTotalPaid = bk.bookingAmountPaid + newPayment.amount;
        const newBalance = bk.pricing.onRoadPrice - newTotalPaid;
        
        // Auto update status if fully paid or booking amount paid
        let newStatus = bk.status;
        if (newStatus === 'Pending' && newTotalPaid >= 5000) {
          newStatus = 'Confirmed';
          handleStockUpdate(bk, 'Confirmed');
        }
        
        if (newBalance <= 0 && (newStatus === 'Payment Pending' || newStatus === 'Confirmed' || newStatus === 'Documentation In-Progress')) {
          newStatus = 'Payment Complete';
        }

        return {
          ...bk,
          payments: [...bk.payments, newPayment],
          bookingAmountPaid: newTotalPaid,
          balanceDue: newBalance,
          status: newStatus
        };
      }
      return bk;
    }));
  };

  const cancelBooking = (id: string, reason: string) => {
    setBookings(prev => prev.map(bk => bk.id === id ? { ...bk, status: 'Cancelled', cancellationReason: reason } : bk));
  };

  const updateBookingSale = useCallback(async (bookingId: string, saleData: FinalSale): Promise<void> => {
    setBookings(prev => prev.map(bk => {
      if (bk.id === bookingId) {
        return {
          ...bk,
          sale: saleData
        };
      }
      return bk;
    }));
  }, []);

  const confirmPayment = useCallback((bookingId: string) => {
    setBookings(prev => prev.map(bk => {
      if (bk.id === bookingId) {
        // CRITICAL FIX: Lock the sales record and update status correctly
        return {
          ...bk,
          paymentConfirmed: true,
          status: 'Payment Complete' // Correct status after payment
        };
      }
      return bk;
    }));
  }, []);

  const confirmDelivery = useCallback((bookingId: string) => {
    setBookings(prev => prev.map(bk => {
      if (bk.id === bookingId) {
        // FINAL STEP: Mark delivery as complete and close the sales lifecycle
        return {
          ...bk,
          deliveryConfirmed: true,
          deliveryDate: new Date().toISOString(),
          status: 'Delivered' // Final status - sales lifecycle complete
        };
      }
      return bk;
    }));
  }, []);

  return (
    <BookingContext.Provider value={{
      bookings, addBooking, updateBookingStatus, uploadDocument, removeDocument, addPayment, cancelBooking, updateBookingSale, confirmPayment, confirmDelivery
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
