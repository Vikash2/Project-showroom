import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Inquiry, LeadStatus, InquiryTask, CommunicationLog } from '../types/inquiry';

const initialInquiries: Inquiry[] = [
  {
    id: 'INQ-2025-001',
    date: new Date(Date.now() - 86400000 * 2).toISOString(),
    customer: { fullName: 'Rahul Sharma', mobileNumber: '9876543210', city: 'Patna' },
    interest: { modelId: 'v1', modelName: 'Activa 6G' },
    timeline: 'Immediate',
    exchangeRequired: false,
    financeRequired: true,
    testRideRequested: true,
    source: 'Website',
    status: 'Test Ride Scheduled',
    priority: 'High',
    assignedTo: 'VK',
    tasks: [
      { id: 't1', inquiryId: 'INQ-2025-001', type: 'Test Ride', dueDate: new Date(Date.now() + 86400000).toISOString(), status: 'Pending' }
    ],
    history: [
      { id: 'h1', inquiryId: 'INQ-2025-001', timestamp: new Date(Date.now() - 86400000).toISOString(), type: 'Call', summary: 'Customer interested in financing options.', author: 'VK' }
    ]
  },
  {
    id: 'INQ-2025-002',
    date: new Date().toISOString(),
    customer: { fullName: 'Anjali Verma', mobileNumber: '9123456780', city: 'Danapur' },
    interest: { modelId: 'v2', modelName: 'SP 125' },
    timeline: '1-3 months',
    exchangeRequired: true,
    financeRequired: false,
    testRideRequested: false,
    source: 'Instagram',
    status: 'New',
    priority: 'Medium',
    tasks: [],
    history: []
  }
];

interface InquiryContextType {
  inquiries: Inquiry[];
  addInquiry: (inquiry: Omit<Inquiry, 'id' | 'date' | 'status' | 'priority' | 'tasks' | 'history'>) => string;
  updateInquiryStatus: (id: string, status: LeadStatus) => void;
  updateInquiryPriority: (id: string, priority: Inquiry['priority']) => void;
  assignInquiry: (id: string, assignedTo: string) => void;
  addTask: (inquiryId: string, task: Omit<InquiryTask, 'id' | 'inquiryId'>) => void;
  addHistory: (inquiryId: string, log: Omit<CommunicationLog, 'id' | 'inquiryId' | 'timestamp'>) => void;
}

const InquiryContext = createContext<InquiryContextType | undefined>(undefined);

export function InquiryProvider({ children }: { children: ReactNode }) {
  const [inquiries, setInquiries] = useState<Inquiry[]>(() => {
    try {
      const stored = localStorage.getItem('showroom-inquiries');
      if (stored) return JSON.parse(stored) as Inquiry[];
    } catch {}
    return initialInquiries;
  });

  useEffect(() => {
    localStorage.setItem('showroom-inquiries', JSON.stringify(inquiries));
  }, [inquiries]);

  const addInquiry = (data: Omit<Inquiry, 'id' | 'date' | 'status' | 'priority' | 'tasks' | 'history'>) => {
    const newId = `INQ-${new Date().getFullYear()}-${String(inquiries.length + 1).padStart(3, '0')}`;
    
    // Auto score priority based on timeline
    let priority: Inquiry['priority'] = 'Medium';
    if (data.timeline === 'Immediate') priority = 'High';
    if (data.timeline === 'Just exploring') priority = 'Low';

    const newInquiry: Inquiry = {
      ...data,
      id: newId,
      date: new Date().toISOString(),
      status: 'New',
      priority,
      tasks: [],
      history: []
    };
    
    setInquiries(prev => [newInquiry, ...prev]);
    return newId;
  };

  const updateInquiryStatus = (id: string, status: LeadStatus) => {
    setInquiries(prev => prev.map(inv => inv.id === id ? { ...inv, status } : inv));
  };
  
  const updateInquiryPriority = (id: string, priority: Inquiry['priority']) => {
    setInquiries(prev => prev.map(inv => inv.id === id ? { ...inv, priority } : inv));
  };

  const assignInquiry = (id: string, assignedTo: string) => {
    setInquiries(prev => prev.map(inv => inv.id === id ? { ...inv, assignedTo } : inv));
  };

  const addTask = (inquiryId: string, task: Omit<InquiryTask, 'id' | 'inquiryId'>) => {
    setInquiries(prev => prev.map(inv => {
      if (inv.id === inquiryId) {
        return {
          ...inv,
          tasks: [...inv.tasks, { ...task, id: `t${Date.now()}`, inquiryId }]
        };
      }
      return inv;
    }));
  };

  const addHistory = (inquiryId: string, log: Omit<CommunicationLog, 'id' | 'inquiryId' | 'timestamp'>) => {
    setInquiries(prev => prev.map(inv => {
      if (inv.id === inquiryId) {
        return {
          ...inv,
          history: [{ ...log, id: `h${Date.now()}`, inquiryId, timestamp: new Date().toISOString() }, ...inv.history]
        };
      }
      return inv;
    }));
  };

  return (
    <InquiryContext.Provider value={{ 
      inquiries, addInquiry, updateInquiryStatus, updateInquiryPriority, assignInquiry, addTask, addHistory 
    }}>
      {children}
    </InquiryContext.Provider>
  );
}

export function useInquiries() {
  const context = useContext(InquiryContext);
  if (context === undefined) {
    throw new Error('useInquiries must be used within an InquiryProvider');
  }
  return context;
}
