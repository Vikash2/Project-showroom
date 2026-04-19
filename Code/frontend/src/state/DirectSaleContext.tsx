import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { DirectSaleRecord } from '../types/directSale';
import * as salesService from '../services/salesService';
import toast from 'react-hot-toast';

interface DirectSaleContextType {
  directSales: DirectSaleRecord[];
  isLoading: boolean;
  error: string | null;
  addDirectSale: (sale: Omit<DirectSaleRecord, 'id' | 'date' | 'source'>) => Promise<string>;
  updateDirectSale: (id: string, updates: Partial<DirectSaleRecord>) => Promise<void>;
  getDirectSaleById: (id: string) => DirectSaleRecord | undefined;
  confirmPayment: (id: string) => Promise<void>;
  confirmDelivery: (id: string) => Promise<void>;
  refreshSales: () => Promise<void>;
}

const DirectSaleContext = createContext<DirectSaleContextType | undefined>(undefined);

export function DirectSaleProvider({ children }: { children: ReactNode }) {
  const [directSales, setDirectSales] = useState<DirectSaleRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load sales from backend API on mount
  const loadSales = useCallback(async () => {
    console.log('💰 [DirectSaleContext] Loading sales from backend...');
    setIsLoading(true);
    setError(null);

    try {
      console.log('💰 [DirectSaleContext] Making API call to list sales...');
      const result = await salesService.listSales();
      
      console.log('💰 [DirectSaleContext] API call completed:', {
        success: result.success,
        hasSales: !!result.sales,
        salesCount: result.sales?.length || 0,
        error: result.error
      });
      
      if (result.success && result.sales) {
        console.log('💰 [DirectSaleContext] Sales loaded from backend:', result.sales.length);
        
        // Map backend sales format to frontend format
        const mappedSales: DirectSaleRecord[] = result.sales.map((backendSale: any) => {
          console.log('💰 [DirectSaleContext] Mapping sale:', backendSale.saleId || backendSale.id);
          return {
            id: backendSale.saleId || backendSale.id,
            date: backendSale.createdAt,
            source: 'DIRECT',
            status: backendSale.status,
            customer: {
              fullName: backendSale.customerName,
              mobile: backendSale.customerMobile,
              email: backendSale.customerEmail || '',
              address: backendSale.customerAddress || '',
              emergencyContact: backendSale.customerEmergencyContact || ''
            },
            vehicleConfig: {
              modelId: backendSale.vehicleId,
              variantId: backendSale.variantId,
              colorName: backendSale.colorName
            },
            pricing: {
              exShowroom: backendSale.exShowroomPrice || 0,
              rtoTotal: backendSale.rtoCharges || 0,
              insuranceTotal: backendSale.insuranceCharges || 0,
              accessoriesTotal: backendSale.accessoriesCharges || 0,
              otherChargesTotal: backendSale.otherCharges || 0,
              onRoadPrice: backendSale.onRoadPrice || 0
            },
            saleDetails: {
              typeOfSale: backendSale.saleType || 'Cash',
              soldThrough: backendSale.paymentMode || 'Cash',
              financer: backendSale.financer,
              financeBy: backendSale.financeBy,
              hypothecationSelected: backendSale.hypothecation ? 'Yes' : 'No',
              hypothecationCharge: backendSale.hypothecationCharge || 0,
              registration: backendSale.registration ? 'Yes' : 'No',
              otherState: {
                selected: backendSale.registrationState,
                amount: backendSale.otherStateCharge || 0
              },
              insurance: backendSale.insurance ? 'YES' : 'NO',
              insuranceType: backendSale.insuranceType,
              insuranceNominee: backendSale.insuranceNominee || { name: '', age: 0, relation: '' },
              discount: backendSale.discount || 0,
              specialDiscount: backendSale.specialDiscount || 0,
              gstNumber: backendSale.gstNumber,
              jobClub: backendSale.jobClub ? 'YES' : 'NO',
              exchange: backendSale.exchangeDetails
            },
            documents: backendSale.documents || {
              aadharCard: {},
              panCard: {},
              drivingLicense: {},
              addressProof: {},
              passportPhotos: {}
            },
            showroomId: backendSale.showroomId,
            paymentConfirmed: backendSale.paymentConfirmed || false,
            paymentDate: backendSale.paymentDate,
            deliveryConfirmed: backendSale.deliveryConfirmed || false,
            deliveryDate: backendSale.deliveryDate
          };
        });
        
        setDirectSales(mappedSales);
        console.log('💰 [DirectSaleContext] Sales mapped and set in state:', mappedSales.length);
      } else {
        console.warn('💰 [DirectSaleContext] Failed to load sales:', result.error);
        const errorMessage = result.error?.message || result.error?.code || 'Failed to load sales';
        setError(errorMessage);
        setDirectSales([]); // Empty array instead of fallback data
      }
    } catch (err: any) {
      console.error('💰 [DirectSaleContext] Error loading sales:', err);
      let errorMessage = 'Failed to load sales';
      
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
      setDirectSales([]); // Empty array instead of fallback data
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load sales on mount
  useEffect(() => {
    loadSales();
  }, [loadSales]);

  const refreshSales = useCallback(async () => {
    await loadSales();
  }, [loadSales]);

  const addDirectSale = async (sale: Omit<DirectSaleRecord, 'id' | 'date' | 'source'>): Promise<string> => {
    console.log('🔥 [DirectSaleContext] Creating direct sale via API:', sale);
    
    try {
      // Call backend API to create direct sale
      const result = await salesService.createDirectSale({
        customerName: sale.customer.fullName,
        customerMobile: sale.customer.mobile,
        customerEmail: sale.customer.email || null,
        customerAddress: sale.customer.address,
        customerEmergencyContact: sale.customer.emergencyContact || null,
        
        // Vehicle details - these should be IDs from backend
        vehicleId: sale.vehicleConfig.modelId, // This needs to be actual backend vehicle ID
        variantId: sale.vehicleConfig.variantId,
        colorName: sale.vehicleConfig.colorName,
        
        // Pricing
        exShowroomPrice: sale.pricing.exShowroom,
        rtoCharges: sale.pricing.rtoTotal,
        insuranceCharges: sale.pricing.insuranceTotal,
        accessoriesCharges: sale.pricing.accessoriesTotal,
        otherCharges: sale.pricing.otherChargesTotal,
        onRoadPrice: sale.pricing.onRoadPrice,
        
        // Sale details
        saleType: sale.saleDetails.typeOfSale,
        paymentMode: sale.saleDetails.soldThrough,
        financer: sale.saleDetails.financer || null,
        financeBy: sale.saleDetails.financeBy || null,
        hypothecation: sale.saleDetails.hypothecationSelected === 'Yes',
        hypothecationCharge: sale.saleDetails.hypothecationCharge,
        registration: sale.saleDetails.registration === 'Yes',
        registrationState: sale.saleDetails.otherState.selected || null,
        otherStateCharge: sale.saleDetails.otherState.amount,
        insurance: sale.saleDetails.insurance === 'YES',
        insuranceType: sale.saleDetails.insuranceType || null,
        insuranceNominee: sale.saleDetails.insuranceNominee.name ? {
          name: sale.saleDetails.insuranceNominee.name,
          age: sale.saleDetails.insuranceNominee.age,
          relation: sale.saleDetails.insuranceNominee.relation,
        } : null,
        discount: sale.saleDetails.discount,
        specialDiscount: sale.saleDetails.specialDiscount,
        gstNumber: sale.saleDetails.gstNumber || null,
        jobClub: sale.saleDetails.jobClub === 'YES',
        
        // Exchange details if applicable
        exchangeDetails: sale.saleDetails.exchange ? {
          model: sale.saleDetails.exchange.model,
          year: sale.saleDetails.exchange.year,
          registrationNumber: sale.saleDetails.exchange.registrationNumber,
          value: sale.saleDetails.exchange.value,
          exchangerName: sale.saleDetails.exchange.exchangerName,
        } : null,
        
        // Status
        status: sale.status || 'Draft',
        showroomId: sale.showroomId,
      });
      
      if (result.success && result.sale) {
        console.log('🔥 [DirectSaleContext] Direct sale created successfully:', result.sale);
        
        // Add to local state for immediate UI update
        const newSale: DirectSaleRecord = {
          ...sale,
          id: result.sale.saleId || result.sale.id,
          date: result.sale.createdAt || new Date().toISOString(),
          source: 'DIRECT',
          status: result.sale.status || 'Draft',
        };
        
        setDirectSales(prev => [...prev, newSale]);
        toast.success('Direct sale created successfully');
        
        return newSale.id;
      } else {
        console.error('🔥 [DirectSaleContext] Failed to create direct sale:', result.error);
        const errorMessage = result.error?.message || 'Failed to create direct sale';
        toast.error(errorMessage);
        throw new Error(errorMessage);
      }
    } catch (error: any) {
      console.error('🔥 [DirectSaleContext] Error creating direct sale:', error);
      const errorMessage = error.message || 'Failed to create direct sale';
      toast.error(errorMessage);
      throw error; // Re-throw to let caller handle the error
    }
  };

  const updateDirectSale = async (id: string, updates: Partial<DirectSaleRecord>) => {
    console.log('💰 [DirectSaleContext] Updating direct sale via API:', id, updates);
    
    try {
      // Call backend API to update sale
      const result = await salesService.updateSale(id, {
        // Map updates to backend format
        status: updates.status,
        // Add other fields as needed
      });
      
      if (result.success) {
        console.log('💰 [DirectSaleContext] Direct sale updated successfully');
        toast.success('Sale updated successfully');
        
        // Update local state for immediate UI feedback
        setDirectSales(prev =>
          prev.map(sale => (sale.id === id ? { ...sale, ...updates } : sale))
        );
        
        // Refresh to ensure consistency
        await refreshSales();
      } else {
        console.error('💰 [DirectSaleContext] Failed to update sale:', result.error);
        toast.error(result.error?.message || 'Failed to update sale');
        throw new Error(result.error?.message || 'Failed to update sale');
      }
    } catch (error: any) {
      console.error('💰 [DirectSaleContext] Error updating sale:', error);
      toast.error('Failed to update sale');
      throw error;
    }
  };

  const getDirectSaleById = (id: string): DirectSaleRecord | undefined => {
    return directSales.find(sale => sale.id === id);
  };

  const confirmPayment = async (id: string): Promise<void> => {
    console.log('💰 [DirectSaleContext] Confirming payment via API:', id);
    
    try {
      // TODO: Add specific confirmPayment API call when available
      const result = await salesService.updateSale(id, { status: 'Payment Complete' });
      
      if (result.success) {
        console.log('💰 [DirectSaleContext] Payment confirmed successfully');
        toast.success('Payment confirmed');
        
        // Update local state
        setDirectSales(prev =>
          prev.map(sale =>
            sale.id === id
              ? {
                  ...sale,
                  paymentConfirmed: true,
                  paymentDate: new Date().toISOString(),
                  status: 'Payment Complete',
                }
              : sale
          )
        );
        
        // Refresh to ensure consistency
        await refreshSales();
      } else {
        console.error('💰 [DirectSaleContext] Failed to confirm payment:', result.error);
        toast.error(result.error?.message || 'Failed to confirm payment');
        throw new Error(result.error?.message || 'Failed to confirm payment');
      }
    } catch (error: any) {
      console.error('💰 [DirectSaleContext] Error confirming payment:', error);
      toast.error('Failed to confirm payment');
      throw error;
    }
  };

  const confirmDelivery = async (id: string): Promise<void> => {
    console.log('💰 [DirectSaleContext] Confirming delivery via API:', id);
    
    try {
      // TODO: Add specific confirmDelivery API call when available
      const result = await salesService.updateSale(id, { status: 'Delivered' });
      
      if (result.success) {
        console.log('💰 [DirectSaleContext] Delivery confirmed successfully');
        toast.success('Delivery confirmed');
        
        // Update local state
        setDirectSales(prev =>
          prev.map(sale =>
            sale.id === id
              ? {
                  ...sale,
                  deliveryConfirmed: true,
                  deliveryDate: new Date().toISOString(),
                  status: 'Delivered',
                }
              : sale
          )
        );
        
        // Refresh to ensure consistency
        await refreshSales();
      } else {
        console.error('💰 [DirectSaleContext] Failed to confirm delivery:', result.error);
        toast.error(result.error?.message || 'Failed to confirm delivery');
        throw new Error(result.error?.message || 'Failed to confirm delivery');
      }
    } catch (error: any) {
      console.error('💰 [DirectSaleContext] Error confirming delivery:', error);
      toast.error('Failed to confirm delivery');
      throw error;
    }
  };

  return (
    <DirectSaleContext.Provider
      value={{
        directSales,
        isLoading,
        error,
        addDirectSale,
        updateDirectSale,
        getDirectSaleById,
        confirmPayment,
        confirmDelivery,
        refreshSales,
      }}
    >
      {children}
    </DirectSaleContext.Provider>
  );
}

export function useDirectSales() {
  const context = useContext(DirectSaleContext);
  if (!context) {
    throw new Error('useDirectSales must be used within DirectSaleProvider');
  }
  return context;
}
