import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Vehicle, PricingStructure } from '../types/vehicle';
import * as vehicleService from '../services/vehicleService';

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

interface VehicleContextType {
  vehicles: Vehicle[];
  isLoading: boolean;
  error: string | null;
  addVehicle: (vehicle: Omit<Vehicle, 'id'>) => void;
  updateVehicle: (id: string, vehicle: Partial<Vehicle>) => void;
  deleteVehicle: (id: string) => void;
  decrementStock: (vehicleId: string, variantId: string, colorName: string) => void;
  refreshVehicles: () => Promise<void>;
}

const VehicleContext = createContext<VehicleContextType | undefined>(undefined);

export function VehicleProvider({ children }: { children: ReactNode }) {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]); // Start with empty array - load from backend
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch vehicles from backend on mount
  useEffect(() => {
    let isMounted = true;
    
    const initializeVehicles = async () => {
      // Wait for auth to be ready before loading vehicles
      let authReady = false;
      let attempts = 0;
      
      while (!authReady && attempts < 10 && isMounted) {
        try {
          const { supabase } = await import('../config/supabase');
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.access_token) {
            authReady = true;
            console.log('🚗 [VehicleContext] Auth is ready, proceeding with vehicles load');
          } else {
            attempts++;
            console.log(`🚗 [VehicleContext] Waiting for auth... attempt ${attempts}/10`);
            await new Promise(resolve => setTimeout(resolve, 500));
          }
        } catch (error) {
          console.error('🚗 [VehicleContext] Error checking auth:', error);
          break;
        }
      }
      
      if (authReady && isMounted) {
        await loadVehicles();
      } else if (isMounted) {
        console.warn('🚗 [VehicleContext] Auth not ready, setting fallback vehicles');
        setVehicles([]);
        setError('Authentication not ready. Please refresh the page.');
        setIsLoading(false);
      }
    };

    initializeVehicles();

    return () => {
      isMounted = false;
    };
  }, []);

  const loadVehicles = async () => {
    console.log('🚗 [VehicleContext] Loading vehicles from backend...');
    setIsLoading(true);
    setError(null);

    try {
      const result = await vehicleService.listVehicles({ isActive: true });
      
      if (result.success && result.vehicles) {
        console.log('🚗 [VehicleContext] Vehicles loaded from backend:', result.vehicles.length);
        
        if (result.vehicles.length > 0) {
          // Simplified mapping - avoid additional API calls for now
          const mappedVehicles: Vehicle[] = result.vehicles.map((backendVehicle: any) => ({
            id: backendVehicle.vehicleId,
            brand: backendVehicle.brand,
            model: backendVehicle.name,
            category: backendVehicle.category,
            launchYear: new Date(backendVehicle.createdAt).getFullYear().toString(),
            description: backendVehicle.description || 'No description available',
            image: backendVehicle.imageUrl || 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&q=80&w=600',
            mediaAssets: {
              images: backendVehicle.imageUrl ? [backendVehicle.imageUrl] : []
            },
            specs: {
              engine: 'N/A',
              maxPower: 'N/A',
              maxTorque: 'N/A',
              transmission: 'N/A',
              mileage: 'N/A',
              fuelCapacity: 'N/A',
              length: 'N/A',
              width: 'N/A',
              height: 'N/A',
              wheelbase: 'N/A',
              weight: 'N/A',
              frontBrake: 'N/A',
              rearBrake: 'N/A',
              frontTyre: 'N/A',
              rearTyre: 'N/A',
              frontSuspension: 'N/A',
              rearSuspension: 'N/A',
              features: [],
              warranty: 'N/A'
            },
            variants: [{
              id: 'default',
              name: 'Standard',
              brakeType: 'N/A',
              wheelType: 'N/A',
              connectedFeatures: false,
              pricing: {
                ...defaultPricing,
                exShowroomPrice: backendVehicle.basePrice || 74216,
                onRoadPrice: (backendVehicle.basePrice || 74216) + 12000
              },
              colors: [{ 
                name: 'Default', 
                hexCode: '#FFFFFF', 
                status: 'In Stock' as const, 
                stockQuantity: 10 
              }]
            }]
          }));
          
          console.log('🚗 [VehicleContext] Vehicles mapped successfully:', mappedVehicles.length);
          setVehicles(mappedVehicles);
        } else {
          console.log('🚗 [VehicleContext] No vehicles found in backend');
          setVehicles([]);
          setError('No vehicles found');
        }
      } else {
        console.warn('🚗 [VehicleContext] Failed to load vehicles:', result.error?.message);
        setError(result.error?.message || 'Failed to load vehicles from backend');
        setVehicles([]);
      }
    } catch (err: any) {
      console.error('🚗 [VehicleContext] Error loading vehicles:', err);
      setError(err.message || 'Failed to load vehicles');
      setVehicles([]);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshVehicles = async () => {
    await loadVehicles();
  };

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
    <VehicleContext.Provider value={{ vehicles, isLoading, error, addVehicle, updateVehicle, deleteVehicle, decrementStock, refreshVehicles }}>
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
