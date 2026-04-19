import { createContext, useContext, useState, type ReactNode } from 'react';
import type { Vehicle, PricingStructure } from '../types/vehicle';

const defaultPricing: PricingStructure = {
  exShowroomPrice: 74216,
  rtoCharges: {
    registrationFee: 300,
    roadTax: 4200,
    smartCard: 200,
    numberPlate: 400,
    hypothecation: 0,
    total: 5100,
  },
  insurance: {
    thirdParty: 1500,
    comprehensive: 2800,
    personalAccident: 750,
    zeroDepreciation: 1200,
    total: 6250,
  },
  otherCharges: {
    fastag: 200,
    extendedWarranty: 2500,
    amc: 3000,
    documentationCharges: 500,
    accessoriesFitting: 0,
    total: 1200,
  },
  onRoadPrice: 86766,
};

// Initial dummy data based on App.tsx hardcoded values and phase-1.md
const initialVehicles: Vehicle[] = [
  {
    id: 'v1',
    brand: 'Honda',
    model: 'Activa 6G',
    category: 'Scooter',
    launchYear: '2023',
    description: 'The reliable family scooter.',
    image: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&q=80&w=600',
    mediaAssets: {
      images: ['https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&q=80&w=600']
    },
    specs: {
      engine: '109.51 cc',
      maxPower: '5.73 kW @ 8000 rpm',
      maxTorque: '8.90 Nm @ 5500 rpm',
      transmission: 'CVT',
      mileage: '60 kmpl',
      fuelCapacity: '5.3 Liters',
      length: '1833',
      width: '697',
      height: '1156',
      wheelbase: '1260',
      weight: '107 kg',
      frontBrake: 'Drum 130mm',
      rearBrake: 'Drum 130mm',
      frontTyre: '90/90-12 54J',
      rearTyre: '90/100-10 53J',
      frontSuspension: 'Telescopic',
      rearSuspension: '3-Step Adjustable',
      features: ['LED Headlamp', 'Smart Key'],
      warranty: '3 Years Standard',
    },
    variants: [
      {
        id: 'v1-deluxe',
        name: 'Deluxe',
        brakeType: 'Drum',
        wheelType: 'Steel',
        connectedFeatures: false,
        pricing: defaultPricing,
        colors: [
          { name: 'Pearl Precious White', hexCode: '#FFFFFF', status: 'In Stock', stockQuantity: 5 },
          { name: 'Matte Axis Grey', hexCode: '#555555', status: 'In Stock', stockQuantity: 2 },
        ],
      },
    ],
  },
  {
    id: 'v2',
    brand: 'Honda',
    model: 'SP 125',
    category: 'Motorcycle',
    image: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&q=80&w=600',
    specs: { mileage: '65 kmpl', engine: '124 cc', weight: '116 kg', features: ['LED Lights', 'CBS', 'Digital Console'] },
    variants: [
      {
        id: 'v2-disc',
        name: 'Disc',
        brakeType: 'Disc',
        wheelType: 'Alloy',
        pricing: { ...defaultPricing, exShowroomPrice: 86017, onRoadPrice: 98017 },
        colors: [
          { name: 'Striking Green', hexCode: '#00FF00', status: 'Coming Soon', stockQuantity: 0 },
        ],
      },
    ],
  },
  {
    id: 'v3',
    brand: 'Honda',
    model: 'Shine 100',
    category: 'Motorcycle',
    image: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&q=80&w=600',
    specs: { mileage: '70 kmpl', engine: '100 cc', weight: '99 kg', features: ['CBS'] },
    variants: [
      {
        id: 'v3-std',
        name: 'Standard',
        pricing: { ...defaultPricing, exShowroomPrice: 64900, onRoadPrice: 76900 },
        colors: [
           { name: 'Red', hexCode: '#FF0000', status: 'In Stock', stockQuantity: 10 },
        ],
      },
    ],
  },
  {
    id: 'v4',
    brand: 'Honda',
    model: 'Unicorn',
    category: 'Motorcycle',
    image: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&q=80&w=600',
    specs: { mileage: '55 kmpl', engine: '162 cc', weight: '140 kg', features: ['ABS', 'LED Lights'] },
    variants: [
      {
        id: 'v4-std',
        name: 'Standard',
        pricing: { ...defaultPricing, exShowroomPrice: 109126, onRoadPrice: 121126 },
        colors: [
           { name: 'Black', hexCode: '#000000', status: 'In Stock', stockQuantity: 3 },
        ],
      },
    ],
  },
];

interface VehicleContextType {
  vehicles: Vehicle[];
  addVehicle: (vehicle: Omit<Vehicle, 'id'>) => void;
  updateVehicle: (id: string, vehicle: Partial<Vehicle>) => void;
  deleteVehicle: (id: string) => void;
  decrementStock: (vehicleId: string, variantId: string, colorName: string) => void;
}

const VehicleContext = createContext<VehicleContextType | undefined>(undefined);

export function VehicleProvider({ children }: { children: ReactNode }) {
  const [vehicles, setVehicles] = useState<Vehicle[]>(initialVehicles);

  const addVehicle = (vehicle: Omit<Vehicle, 'id'>) => {
    const newVehicle = {
      ...vehicle,
      id: `v${Date.now()}`
    };
    setVehicles(prev => [...prev, newVehicle]);
  };

  const updateVehicle = (id: string, updatedFields: Partial<Vehicle>) => {
    setVehicles(prev => prev.map(v => v.id === id ? { ...v, ...updatedFields } : v));
  };

  const deleteVehicle = (id: string) => {
    setVehicles(prev => prev.filter(v => v.id !== id));
  };

  const decrementStock = (vehicleId: string, variantId: string, colorName: string) => {
    setVehicles(prev => prev.map(v => {
      if (v.id !== vehicleId) return v;
      return {
        ...v,
        variants: v.variants.map(varnt => {
          if (varnt.id !== variantId) return varnt;
          return {
            ...varnt,
            colors: varnt.colors.map(color => {
              if (color.name !== colorName) return color;
              return {
                ...color,
                stockQuantity: Math.max(0, color.stockQuantity - 1),
                status: color.stockQuantity - 1 <= 0 ? 'Out of Stock' : color.status
              };
            })
          };
        })
      };
    }));
  };

  return (
    <VehicleContext.Provider value={{ vehicles, addVehicle, updateVehicle, deleteVehicle, decrementStock }}>
      {children}
    </VehicleContext.Provider>
  );
}

export function useVehicles() {
  const context = useContext(VehicleContext);
  if (context === undefined) {
    throw new Error('useVehicles must be used within a VehicleProvider');
  }
  return context;
}
