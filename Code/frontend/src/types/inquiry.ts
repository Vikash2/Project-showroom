export type LeadStatus = 'New' | 'Contacted' | 'Follow-up' | 'Test Ride Scheduled' | 'Hot Lead' | 'Quotation Sent' | 'Booking Done' | 'Lost' | 'Closed';
export type PurchaseTimeline = 'Immediate' | 'Within 1 month' | '1-3 months' | '3-6 months' | 'Just exploring';
export type LeadSource = 'Website' | 'Facebook' | 'Instagram' | 'Google' | 'Walk-in' | 'Reference' | 'Phone' | 'Others';
export type PriorityLevel = 'High' | 'Medium' | 'Low';
export type TaskType = 'Call' | 'Meeting' | 'Test Ride' | 'Send Quotation' | 'Document Collection';
export type TaskStatus = 'Pending' | 'Completed' | 'Overdue';

export interface CustomerDetails {
  fullName: string;
  mobileNumber: string;
  email?: string;
  city: string;
}

export interface VehicleInterest {
  modelId?: string;
  modelName: string;
  variantName?: string;
  colorName?: string;
}

export interface InquiryTask {
  id: string;
  inquiryId: string;
  type: TaskType;
  dueDate: string;
  notes?: string;
  status: TaskStatus;
}

export interface CommunicationLog {
  id: string;
  inquiryId: string;
  timestamp: string;
  type: 'Call' | 'Email' | 'WhatsApp' | 'SMS' | 'Meeting' | 'Note';
  summary: string;
  author: string;
}

export interface Inquiry {
  id: string;
  date: string;
  customer: CustomerDetails;
  interest: VehicleInterest;
  timeline?: PurchaseTimeline;
  exchangeRequired: boolean;
  financeRequired: boolean;
  testRideRequested: boolean;
  source: LeadSource;
  status: LeadStatus;
  priority: PriorityLevel;
  assignedTo?: string;
  tasks: InquiryTask[];
  history: CommunicationLog[];
}
