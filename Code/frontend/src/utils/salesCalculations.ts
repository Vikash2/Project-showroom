import type { Booking, FinalSale } from '../types/booking';

/**
 * Calculate the total amount for accessories based on final selected amounts
 */
export function calculateAccessoriesTotal(selectedAccessoriesFinal: Record<string, number>): number {
  return Object.values(selectedAccessoriesFinal).reduce((total, amount) => total + amount, 0);
}

/**
 * Calculate hypothecation charge based on selection
 */
export function calculateHypothecationCharge(hypothecationSelected: 'Yes' | 'No'): number {
  return hypothecationSelected === 'Yes' ? 500 : 0;
}

/**
 * Calculate other state amount based on selected state vs showroom state
 */
export function calculateOtherStateAmount(selectedState: string, showroomState: string): number {
  return selectedState !== showroomState && selectedState !== '' ? 500 : 0;
}

/**
 * Calculate Job Club membership charge
 */
export function calculateJobClubCharge(jobClub: 'YES' | 'NO'): number {
  return jobClub === 'YES' ? 1500 : 0; // Assuming ₹1500 for Job Club membership
}

/**
 * Calculate the grand total for a booking including all sale adjustments
 */
export function calculateGrandTotal(booking: Booking): number {
  if (!booking.sale) {
    return booking.pricing.onRoadPrice;
  }

  const sale = booking.sale;
  let total = booking.pricing.exShowroom;

  // Add RTO charges if registration is selected
  if (sale.registration === 'Yes') {
    total += booking.pricing.rtoTotal;
  }

  // Add insurance if selected
  if (sale.insurance === 'YES') {
    total += booking.pricing.insuranceTotal;
  }

  // Add accessories total from final selection
  total += sale.accessoriesTotal;

  // Add hypothecation charge
  total += sale.hypothecationCharge;

  // Add other state charge
  total += sale.otherState.amount;

  // Add Job Club membership charge
  total += calculateJobClubCharge(sale.jobClub);

  // Add other charges
  total += sale.otherCharges;

  // Subtract exchange value if applicable
  if (sale.typeOfSale === 'EXCHANGE' && sale.exchange) {
    total -= sale.exchange.value;
  }

  // Subtract discounts
  total -= sale.discount;
  total -= sale.specialDiscount;

  return Math.max(0, total); // Ensure total is not negative
}

/**
 * Get default FinalSale object with initial values
 */
export function getDefaultFinalSale(): FinalSale {
  return {
    soldThrough: 'CASH',
    hypothecationSelected: 'No',
    hypothecationCharge: 0,
    registration: 'Yes',
    otherState: {
      selected: '',
      amount: 0
    },
    insurance: 'YES',
    insuranceNominee: {
      name: '',
      age: 0,
      relation: ''
    },
    selectedAccessoriesFinal: {},
    accessoriesTotal: 0,
    typeOfSale: 'NEW',
    discount: 0,
    specialDiscount: 0,
    specialDiscountApprovalStatus: 'NONE',
    isGstNumber: 'NO',
    jobClub: 'NO',
    otherCharges: 0,
    documents: {
      aadhaarFront: null,
      aadhaarBack: null,
      pan: null,
      localAadhaarFront: null,
      localAadhaarBack: null
    }
  };
}

/**
 * List of Indian states for dropdown
 */
export const INDIAN_STATES = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
  'Delhi',
  'Jammu and Kashmir',
  'Ladakh',
  'Puducherry',
  'Chandigarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Lakshadweep',
  'Andaman and Nicobar Islands'
];

/**
 * Sample financer list for dropdown
 */
export const FINANCER_LIST = [
  'HDFC Bank',
  'ICICI Bank',
  'Axis Bank',
  'Kotak Mahindra Bank',
  'Bajaj Finserv',
  'Mahindra Finance',
  'Tata Capital',
  'L&T Finance',
  'Cholamandalam Finance',
  'Sundaram Finance'
];