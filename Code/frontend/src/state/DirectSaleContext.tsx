import { createContext, useContext, useState, ReactNode } from 'react';
import type { DirectSaleRecord } from '../types/directSale';

interface DirectSaleContextType {
  directSales: DirectSaleRecord[];
  addDirectSale: (sale: Omit<DirectSaleRecord, 'id' | 'date' | 'source'>) => string;
  updateDirectSale: (id: string, updates: Partial<DirectSaleRecord>) => void;
  getDirectSaleById: (id: string) => DirectSaleRecord | undefined;
  confirmPayment: (id: string) => void;
  confirmDelivery: (id: string) => void;
}

const DirectSaleContext = createContext<DirectSaleContextType | undefined>(undefined);

export function DirectSaleProvider({ children }: { children: ReactNode }) {
  const [directSales, setDirectSales] = useState<DirectSaleRecord[]>([]);

  const generateDirectSaleId = (): string => {
    const year = new Date().getFullYear();
    const count = directSales.length + 1;
    return `DS-${year}-${String(count).padStart(4, '0')}`;
  };

  const addDirectSale = (sale: Omit<DirectSaleRecord, 'id' | 'date' | 'source'>): string => {
    const newSale: DirectSaleRecord = {
      ...sale,
      id: generateDirectSaleId(),
      date: new Date().toISOString(),
      source: 'DIRECT',
      status: sale.status || 'Draft',
    };
    
    setDirectSales(prev => [...prev, newSale]);
    return newSale.id;
  };

  const updateDirectSale = (id: string, updates: Partial<DirectSaleRecord>) => {
    setDirectSales(prev =>
      prev.map(sale => (sale.id === id ? { ...sale, ...updates } : sale))
    );
  };

  const getDirectSaleById = (id: string): DirectSaleRecord | undefined => {
    return directSales.find(sale => sale.id === id);
  };

  const confirmPayment = (id: string) => {
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
  };

  const confirmDelivery = (id: string) => {
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
  };

  return (
    <DirectSaleContext.Provider
      value={{
        directSales,
        addDirectSale,
        updateDirectSale,
        getDirectSaleById,
        confirmPayment,
        confirmDelivery,
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
