// Direct Sales Types - for walk-in customers without prior booking

export type SaleSource = 'BOOKING' | 'DIRECT';

export interface DirectSaleCustomer {
  fullName: string;
  mobile: string;
  email?: string;
  address: string;
  emergencyContact?: string;
}

export interface DirectSaleVehicleConfig {
  modelId: string;
  variantId: string;
  colorName: string;
  chassisNumber?: string; // Can be assigned immediately for direct sales
}

// Direct Sale inherits most properties from FinalSale but adds source tracking
export interface DirectSaleRecord {
  id: string; // Generated sale ID (e.g., DS-2024-001)
  source: 'DIRECT'; // Always DIRECT for this flow
  date: string;
  customer: DirectSaleCustomer;
  vehicleConfig: DirectSaleVehicleConfig;
  
  // Pricing (calculated from vehicle variant)
  pricing: {
    exShowroom: number;
    rtoTotal: number;
    insuranceTotal: number;
    accessoriesTotal: number;
    otherChargesTotal: number;
    onRoadPrice: number;
  };
  
  // Sales details (same structure as FinalSale)
  saleDetails: {
    soldThrough: 'CASH' | 'FINANCE';
    financer?: string;
    financeBy?: string;
    hypothecationSelected: 'Yes' | 'No';
    hypothecationCharge: number;
    registration: 'Yes' | 'No';
    otherState: {
      selected: string;
      amount: number;
    };
    insurance: 'YES' | 'NO';
    insuranceType?: string;
    insuranceNominee: {
      name: string;
      age: number;
      relation: string;
    };
    selectedAccessoriesFinal: Record<string, number>;
    accessoriesTotal: number;
    typeOfSale: 'NEW' | 'EXCHANGE';
    exchange?: {
      model: string;
      year: number;
      value: number;
      exchangerName: string;
      registrationNumber: string;
    };
    discount: number;
    specialDiscount: number;
    specialDiscountApprovalStatus: 'NONE' | 'PENDING' | 'APPROVED' | 'REJECTED';
    specialDiscountMessage?: string;
    isGstNumber: 'YES' | 'NO';
    gstNumber?: string;
    jobClub: 'YES' | 'NO';
    otherCharges: number;
  };
  
  // Documents (same as booking)
  documents: {
    aadharCard: { file?: any };
    panCard: { file?: any };
    drivingLicense: { file?: any };
    addressProof: { file?: any };
    passportPhotos: { file?: any };
  };
  
  // Status tracking (converges with booking-based flow after initiation)
  status: 'Draft' | 'Sales Finalized' | 'Pending Approval' | 'Payment Complete' | 'Delivered';
  
  // Payment tracking
  paymentConfirmed?: boolean;
  paymentDate?: string;
  
  // Delivery tracking
  deliveryConfirmed?: boolean;
  deliveryDate?: string;
  
  // Metadata
  createdBy?: string; // User who created the direct sale
  assignedTo?: string; // Sales executive
  showroomId?: string;
  
  // Special notes
  specialInstructions?: string;
}

// Helper type to unify both sale types for processing
export type UnifiedSale = {
  id: string;
  source: SaleSource;
  customer: {
    fullName: string;
    mobile: string;
    email?: string;
    address: string;
  };
  vehicleConfig: {
    modelId: string;
    variantId: string;
    colorName: string;
  };
  pricing: {
    exShowroom: number;
    rtoTotal: number;
    insuranceTotal: number;
    accessoriesTotal: number;
    otherChargesTotal: number;
    onRoadPrice: number;
  };
  saleDetails?: any; // FinalSale structure
  documents: any;
  status: string;
  paymentConfirmed?: boolean;
  deliveryConfirmed?: boolean;
  date: string;
};
