import { createContext, useContext, useState, type ReactNode } from 'react';
import type { Accessory } from '../types/accessory';

const initialAccessories: Accessory[] = [
  {
    id: 'acc1',
    name: 'Full Body Guard (Stainless Steel)',
    description: 'Complete protection against scratches and minor impacts.',
    price: 3500,
    installationCharges: 500,
    category: 'Protection',
    inStock: true
  },
  {
    id: 'acc2',
    name: 'Designer Seat Cover',
    description: 'Premium water-resistant fabric with extra cushioning.',
    price: 850,
    installationCharges: 100,
    category: 'Aesthetics',
    inStock: true
  },
  {
    id: 'acc3',
    name: 'Smart Helmet Bluetooth Kit',
    description: 'Hands-free calling and music navigation while riding.',
    price: 2200,
    installationCharges: 200,
    category: 'Convenience',
    inStock: true
  },
  {
    id: 'acc4',
    name: 'Anti-Theft Disc Lock',
    description: 'Heavy-duty steel lock with alarm sensor.',
    price: 1200,
    installationCharges: 0,
    category: 'Safety',
    inStock: true
  },
  {
    id: 'acc5',
    name: 'LED Fog Lights (Pair)',
    description: 'High-intensity white light for better visibility in fog.',
    price: 1800,
    installationCharges: 300,
    category: 'Safety',
    inStock: true
  }
];

interface AccessoryContextType {
  accessories: Accessory[];
  addAccessory: (accessory: Omit<Accessory, 'id'>) => void;
  updateAccessory: (id: string, accessory: Partial<Accessory>) => void;
  deleteAccessory: (id: string) => void;
}

const AccessoryContext = createContext<AccessoryContextType | undefined>(undefined);

export function AccessoryProvider({ children }: { children: ReactNode }) {
  const [accessories, setAccessories] = useState<Accessory[]>(initialAccessories);

  const addAccessory = (accessory: Omit<Accessory, 'id'>) => {
    const newAccessory = {
      ...accessory,
      id: `acc${Date.now()}`
    };
    setAccessories(prev => [...prev, newAccessory]);
  };

  const updateAccessory = (id: string, updatedFields: Partial<Accessory>) => {
    setAccessories(prev => prev.map(a => a.id === id ? { ...a, ...updatedFields } : a));
  };

  const deleteAccessory = (id: string) => {
    setAccessories(prev => prev.filter(a => a.id !== id));
  };

  return (
    <AccessoryContext.Provider value={{ accessories, addAccessory, updateAccessory, deleteAccessory }}>
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
