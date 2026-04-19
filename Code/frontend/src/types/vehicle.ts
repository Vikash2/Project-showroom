export type VehicleCategory = 'Scooter' | 'Motorcycle' | 'Electric';

export interface VehicleColor {
  name: string;
  hexCode: string; // e.g., "#FF0000"
  status: 'In Stock' | 'Out of Stock' | 'Coming Soon';
  stockQuantity: number;
  expectedDelivery?: string; // e.g., "1 week", "15 days"
}

export interface VehicleSpecs {
  // Engine
  engine: string; // e.g., "109.51 cc, 4 Stroke, SI Engine"
  maxPower?: string; // e.g., "5.73 kW @ 8000 rpm"
  maxTorque?: string; // e.g., "8.90 Nm @ 5500 rpm"
  transmission?: string; // e.g., "CVT" or "5 Speed Manual"

  // Fuel & Efficiency
  mileage: string; // e.g., "60 kmpl"
  fuelCapacity?: string; // e.g., "5.3 Liters"

  // Dimensions & Weight
  length?: string; // mm
  width?: string; // mm
  height?: string; // mm
  wheelbase?: string; // mm
  weight: string; // kerb weight e.g., "107 kg"

  // Tyres & Brakes
  frontBrake?: string; // e.g., "Drum 130mm"
  rearBrake?: string; // e.g., "Drum 130mm"
  frontTyre?: string; // e.g., "90/90-12 54J"
  rearTyre?: string; // e.g., "90/100-10 53J"

  // Suspension
  frontSuspension?: string; // e.g., "Telescopic"
  rearSuspension?: string; // e.g., "3-Step Adjustable Spring Loaded Hydraulic"

  // Other Features
  features?: string[]; // e.g., ["LED Headlamp", "Digital Console", "USB Charging"]
  warranty?: string; // e.g., "3 Years Standard Warranty"
}

export interface RTOCharges {
  registrationFee: number;
  roadTax: number;
  smartCard: number;
  numberPlate: number;
  hypothecation: number;
  total: number;
}

export interface InsuranceCharges {
  thirdParty: number; // IRDAI mandated
  comprehensive: number; // Optional
  personalAccident: number; // Mandatory for owner
  zeroDepreciation: number; // Optional
  total: number;
}

export interface OtherCharges {
  fastag: number;
  extendedWarranty: number;
  amc: number;
  documentationCharges: number;
  accessoriesFitting: number;
  total: number;
}

export interface PricingStructure {
  exShowroomPrice: number;
  rtoCharges: RTOCharges;
  insurance: InsuranceCharges;
  otherCharges: OtherCharges;
  onRoadPrice: number; // Sum of all
}

export interface VehicleVariant {
  id: string;
  name: string; // e.g., "Standard", "Deluxe", "Sports"
  brakeType?: 'Drum' | 'Disc';
  wheelType?: 'Alloy' | 'Spoke' | 'Steel';
  connectedFeatures?: boolean;
  colors: VehicleColor[];
  pricing: PricingStructure;
}

export interface MediaAssets {
  images: string[]; // Primary images array, index 0 is main image
  view360Url?: string;
  brochurePdfUrl?: string;
  videoUrls?: string[];
}

export interface Vehicle {
  id: string;
  brand: string;
  model: string;
  category: VehicleCategory;
  launchYear?: string;
  description?: string;
  image: string; // Main image, kept for backward compatibility with older components
  mediaAssets?: MediaAssets;
  specs: VehicleSpecs;
  variants: VehicleVariant[];
}
