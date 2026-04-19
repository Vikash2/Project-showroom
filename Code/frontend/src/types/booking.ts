export type AccessoryCategory = 'Safety' | 'Convenience' | 'Protection' | 'Aesthetics';

export interface Accessory {
  id: string;
  name: string;
  description: string;
  category: AccessoryCategory;
  price: number; // Includes GST
  image?: string;
  compatibleModels: string[]; // Array of model IDs, or 'all'
  inStock: boolean;
  installationCharges: number;
}

export type BookingStatus = 
  | 'Pending' 
  | 'Confirmed' 
  | 'Documentation In-Progress' 
  | 'Stock Allocated' 
  | 'Pending Approval'
  | 'Payment Pending' 
  | 'Payment Complete' 
  | 'RTO Processing' 
  | 'PDI Scheduled' 
  | 'Ready for Delivery' 
  | 'Delivered' 
  | 'Cancelled'
  | 'Sales Finalized';

export type PaymentMethod = 'UPI' | 'Credit Card' | 'Debit Card' | 'Net Banking' | 'Cash' | 'Financed';

export interface PaymentRecord {
  id: string;
  date: string;
  amount: number;
  method: PaymentMethod;
  referenceNumber: string;
  type: 'Booking Amount' | 'Balance Payment' | 'Accessory Addition';
}

export interface DocumentFile {
  name: string;
  type: string;
  data: string; // base64
  uploadedAt: string;
}

export interface DocumentStatus {
  aadharCard: { file?: DocumentFile };
  panCard: { file?: DocumentFile };
  drivingLicense: { file?: DocumentFile };
  addressProof: { file?: DocumentFile };
  passportPhotos: { file?: DocumentFile };
}

export interface BookingCustomer {
  fullName: string;
  mobile: string;
  email: string;
  address: string;
  emergencyContact: string;
}

export interface SelectedVehicleConfig {
  modelId: string;
  variantId: string;
  colorName: string;
}

// New interface for final sale details
export interface FinalSale {
  soldThrough: 'CASH' | 'FINANCE';
  financer?: string;
  financeBy?: string;
  hypothecationSelected: 'Yes' | 'No';
  hypothecationCharge: number; // 500 if Yes else 0
  registration: 'Yes' | 'No';
  otherState: {
    selected: string;   // state name
    amount: number;     // 500 if other state else 0
  };
  insurance: 'YES' | 'NO';
  insuranceType?: string;
  insuranceNominee: {
    name: string;
    age: number;
    relation: string;
  };
  selectedAccessoriesFinal: Record<string, number>; // accessory id -> final amount
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
  documents: {
    aadhaarFront: string | null;   // base64 or file URL
    aadhaarBack: string | null;
    pan: string | null;
    localAadhaarFront: string | null;
    localAadhaarBack: string | null;
  };
}

export interface PricingBreakdown {
  exShowroom: number;
  rtoTotal: number;
  insuranceTotal: number;
  accessoriesTotal: number;
  otherChargesTotal: number;
  onRoadPrice: number;
}

export interface Booking {
  id: string;
  date: string;
  customer: BookingCustomer;
  vehicleConfig: SelectedVehicleConfig;
  selectedAccessories: string[]; // Array of Accessory IDs
  pricing: PricingBreakdown;
  payments: PaymentRecord[];
  
  // Computed values:
  bookingAmountPaid: number;
  balanceDue: number;
  
  preferredDeliveryDate?: string;
  specialInstructions?: string;
  
  status: BookingStatus;
  documents: DocumentStatus;
  
  assignedTo?: string; // Sales Executive
  chassisNumber?: string; // Allocated later
  cancellationReason?: string;
  
  // Final sale details
  sale?: FinalSale;
  
  // Payment confirmation flag
  paymentConfirmed?: boolean;
  
  // Delivery confirmation flags
  deliveryConfirmed?: boolean;
  deliveryDate?: string;
}
