import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import toast from 'react-hot-toast';
import type { Accessory } from '../types/accessory';
import * as accessoryService from '../services/accessoryService';

interface AccessoryContextType {
  accessories: Accessory[];
  isLoading: boolean;
  error: string | null;
  addAccessory: (accessory: Omit<Accessory, 'id'>) => void;
  updateAccessory: (id: string, accessory: Partial<Accessory>) => void;
  deleteAccessory: (id: string) => void;
  refreshAccessories: () => Promise<void>;
}

const AccessoryContext = createContext<AccessoryContextType | undefined>(undefined);

export function AccessoryProvider({ children }: { children: ReactNode }) {
  const [accessories, setAccessories] = useState<Accessory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load accessories from backend API on mount
  const loadAccessories = useCallback(async () => {
    console.log('🔧 [AccessoryContext] Loading accessories from backend...');
    setIsLoading(true);
    setError(null);

    try {
      const result = await accessoryService.listAccessories({ isActive: true });
      
      if (result.success && result.accessories) {
        console.log('🔧 [AccessoryContext] Accessories loaded from backend:', result.accessories.length);
        
        // Map backend accessory format to frontend format
        const mappedAccessories: Accessory[] = result.accessories.map((backendAccessory: any) => ({
          id: backendAccessory.accessoryId,
          name: backendAccessory.name,
          description: backendAccessory.description || 'No description available',
          price: backendAccessory.price,
          installationCharges: 0, // Backend doesn't have this field yet
          category: backendAccessory.category,
          inStock: backendAccessory.stockQty > 0,
          stockQuantity: backendAccessory.stockQty,
          compatibleVehicles: backendAccessory.compatibleVehicles || []
        }));
        
        setAccessories(mappedAccessories);
        console.log('🔧 [AccessoryContext] Accessories mapped and set in state');
      } else {
        console.warn('🔧 [AccessoryContext] Failed to load accessories:', result.error?.message);
        setError(result.error?.message || 'Failed to load accessories');
        setAccessories([]); // Empty array instead of fallback data
        // Don't show toast on initial load - only set error state
      }
    } catch (err: any) {
      console.error('🔧 [AccessoryContext] Error loading accessories:', err);
      setError(err.message || 'Failed to load accessories');
      setAccessories([]); // Empty array instead of fallback data
      // Don't show toast on initial load - only set error state
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load accessories on mount
  useEffect(() => {
    loadAccessories();
  }, [loadAccessories]);

  const refreshAccessories = useCallback(async () => {
    await loadAccessories();
  }, [loadAccessories]);

  const addAccessory = (accessory: Omit<Accessory, 'id'>) => {
    // TODO: Implement backend API call to create accessory
    const newAccessory = {
      ...accessory,
      id: `acc${Date.now()}`
    };
    setAccessories(prev => [...prev, newAccessory]);
    toast.success('Accessory added (local only - backend integration needed)');
  };

  const updateAccessory = (id: string, updatedFields: Partial<Accessory>) => {
    // TODO: Implement backend API call to update accessory
    setAccessories(prev => prev.map(a => a.id === id ? { ...a, ...updatedFields } : a));
    toast.success('Accessory updated (local only - backend integration needed)');
  };

  const deleteAccessory = (id: string) => {
    // TODO: Implement backend API call to delete accessory
    setAccessories(prev => prev.filter(a => a.id !== id));
    toast.success('Accessory deleted (local only - backend integration needed)');
  };

  return (
    <AccessoryContext.Provider value={{ 
      accessories, 
      isLoading, 
      error, 
      addAccessory, 
      updateAccessory, 
      deleteAccessory, 
      refreshAccessories 
    }}>
      {children}
    </AccessoryContext.Provider>
  );
}

export function useAccessories() {
  const context = useContext(AccessoryContext);
  if (context === undefined) {
    throw new Error('useAccessories must be used within an AccessoryProvider');
  }
  return context;
}
