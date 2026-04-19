# Vehicle Showroom Management System - Knowledge Transfer Document

## Table of Contents
1. [System Overview](#system-overview)
2. [Technology Stack](#technology-stack)
3. [Application Architecture](#application-architecture)
4. [User Roles & Permissions](#user-roles--permissions)
5. [Core Features](#core-features)
6. [Routing Structure](#routing-structure)
7. [Business Logic & Workflows](#business-logic--workflows)
8. [Data Models](#data-models)
9. [State Management](#state-management)
10. [Key Components](#key-components)
11. [Utilities & Helpers](#utilities--helpers)
12. [Testing](#testing)

---

## 1. System Overview

### Purpose
A comprehensive multi-showroom vehicle management system for 2-wheeler dealerships (Honda) that handles the complete customer journey from inquiry to delivery.

### Key Capabilities
- Multi-showroom configuration with independent branding
- Vehicle catalog management with variants and colors
- Lead/inquiry management system
- Complete booking and sales workflow
- Document management and verification
- Payment processing and tracking
- Manager approval workflows
- Delivery confirmation
- Reporting and analytics

### Current Implementation
- **Primary Showroom**: Sandhya Honda (Patna, Bihar)
- **Vehicle Type**: 2-wheelers (Scooters & Motorcycles)
- **Brand**: Honda
- **Deployment**: Frontend-only (React SPA with localStorage)

---

## 2. Technology Stack

### Frontend Framework
- **React 18+** with TypeScript
- **Vite** as build tool
- **React Router v7** for routing

### State Management
- **Redux Toolkit** (@reduxjs/toolkit)
- **React Context API** for feature-specific state
- **localStorage** for data persistence (temporary, backend pending)

### UI & Styling
- **Tailwind CSS 4+** for styling
- **Framer Motion** for animations
- **Lucide React** for icons
- **React Hook Form** for form management
- **Zod** for schema validation
- **React Hot Toast** for notifications

### Additional Libraries
- **jsPDF** - PDF generation
- **react-to-print** - Print functionality
- **react-datepicker** - Date selection
- **react-dropzone** - File uploads
- **date-fns** - Date manipulation
- **recharts** - Charts and graphs
- **axios** - HTTP client (for future API integration)

### Testing
- **Vitest** - Unit testing framework
- **@testing-library/react** - Component testing
- **jsdom** - DOM simulation
- **fast-check** - Property-based testing

---

## 3. Application Architecture

### Architecture Pattern
**Client-Side SPA** with Context-based state management

```
┌─────────────────────────────────────────────────┐
│           React Application (SPA)               │
│                                                 │
│  ┌──────────────────────────────────────────┐  │
│  │         Routing Layer                    │  │
│  │      (React Router v7)                   │  │
│  └──────────────────────────────────────────┘  │
│                                                 │
│  ┌──────────────────────────────────────────┐  │
│  │      State Management Layer              │  │
│  │  - Redux Store (global)                  │  │
│  │  - Context Providers (feature-specific)  │  │
│  └──────────────────────────────────────────┘  │
│                                                 │
│  ┌──────────────────────────────────────────┐  │
│  │         Component Layer                  │  │
│  │  - Pages                                 │  │
│  │  - Components                            │  │
│  │  - Layouts                               │  │
│  └──────────────────────────────────────────┘  │
│                                                 │
│  ┌──────────────────────────────────────────┐  │
│  │      Data Persistence Layer              │  │
│  │      (localStorage - temporary)          │  │
│  └──────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
```

### Folder Structure
```
Code/frontend/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── admin/          # Admin-specific components
│   │   ├── auth/           # Authentication components
│   │   ├── customer/       # Customer-facing components
│   │   └── Sales/          # Sales workflow components
│   ├── pages/              # Page components
│   │   ├── admin/          # Admin dashboard pages
│   │   ├── auth/           # Login/auth pages
│   │   └── customer/       # Customer pages
│   ├── state/              # Context providers & Redux
│   ├── types/              # TypeScript type definitions
│   ├── utils/              # Utility functions
│   ├── constants/          # Constants & configuration
│   ├── hooks/              # Custom React hooks
│   ├── styles/             # Global styles
│   ├── App.tsx             # Main app component
│   ├── main.tsx            # Entry point
│   └── index.css           # Global CSS
├── public/                 # Static assets
└── __tests__/             # Test files
```

---

## 4. User Roles & Permissions

### Role Hierarchy

#### 1. Super Admin
**Access Level**: System-wide

**Capabilities**:
- Full system access across all showrooms
- Manage showroom configurations
- Add/remove showrooms
- Global user management
- System-wide reports and analytics
- Approve special discounts
- All lower-level permissions

**Routes Access**: All routes

#### 2. Showroom Manager
**Access Level**: Showroom-specific

**Capabilities**:
- Manage specific showroom data
- View and manage all inquiries/bookings for their showroom
- Assign leads to sales executives
- Approve special discounts
- Manage showroom users
- Generate showroom reports
- All sales and documentation permissions

**Routes Access**: All admin routes except global showroom management

#### 3. Sales Executive
**Access Level**: Limited to assigned leads

**Capabilities**:
- View assigned leads
- Update lead status
- Create quotations
- Create and manage bookings
- Complete sales forms
- View personal performance metrics

**Routes Access**: Dashboard, Leads (assigned), Bookings, Sales Processing

#### 4. Accountant
**Access Level**: Financial data

**Capabilities**:
- View all bookings
- Manage payments
- Generate invoices
- Financial reports
- Payment tracking

**Routes Access**: Dashboard, Bookings, Reports (financial)

#### 5. Documentation Officer
**Access Level**: Document management

**Capabilities**:
- View bookings
- Manage document uploads
- Verify documents
- Track RTO status
- Update document status

**Routes Access**: Dashboard, Bookings, Sales Processing (documents)

#### 6. Customer
**Access Level**: Public + personal data

**Capabilities**:
- Browse vehicle catalog
- Submit inquiries
- Track own bookings
- Upload documents
- View quotations

**Routes Access**: Public pages, Booking Flow (own bookings)

---

## 5. Core Features

### 5.1 Multi-Showroom Configuration

**Purpose**: Support multiple showrooms with independent branding and configuration

**Key Elements**:
- Unique showroom ID
- Branding (logo, colors, tagline)
- Contact information
- Address with coordinates
- GST number
- State (for RTO calculations)
- Working hours
- Pricing configurations

**Implementation**: `ShowroomContext.tsx`

**Data Storage**: `localStorage` key: `showrooms`

### 5.2 Vehicle Catalog Management

**Purpose**: Comprehensive vehicle inventory with variants, colors, and pricing

**Hierarchy**:
```
Brand (Honda)
  └── Model (Activa 6G, Shine, etc.)
       └── Variant (Standard, Deluxe)
            └── Color (White, Red, Black, etc.)
                 └── Stock Quantity
```

**Features**:
- Multiple variants per model
- Color-wise stock tracking
- Detailed specifications
- Multiple images per vehicle
- Pricing breakdown (Ex-showroom, RTO, Insurance)
- Real-time stock updates

**Implementation**: `VehicleContext.tsx`

**Data Storage**: `localStorage` key: `vehicles`

### 5.3 Inquiry Management System

**Purpose**: Capture and manage customer inquiries through the sales pipeline

**Lead Pipeline Stages**:
1. New
2. Contacted
3. Follow-up
4. Test Ride Scheduled
5. Hot Lead
6. Quotation Sent
7. Booking Done
8. Lost
9. Closed

**Features**:
- Customer information capture
- Vehicle interest tracking
- Lead assignment to sales executives
- Status pipeline management
- Communication logging
- Task management
- Priority/lead scoring
- Source tracking

**Implementation**: `InquiryContext.tsx`

**Data Storage**: `localStorage` key: `inquiries`

### 5.4 Booking Management

**Purpose**: Handle vehicle bookings from confirmation to delivery

**Booking Statuses**:

1. Pending
2. Confirmed
3. Documentation In-Progress
4. Stock Allocated
5. Pending Approval (for special discounts)
6. Payment Pending
7. Payment Complete
8. RTO Processing
9. PDI Scheduled
10. Ready for Delivery
11. Delivered
12. Cancelled
13. Sales Finalized

**Features**:
- Vehicle configuration selection
- Accessory selection
- Price calculation with all charges
- Payment tracking
- Document management
- Status tracking
- Delivery scheduling

**Implementation**: `BookingContext.tsx`

**Data Storage**: `localStorage` key: `bookings`

### 5.5 Sales Processing Workflow

**Purpose**: Complete sales lifecycle from booking to delivery

**6-Step Sales Journey**:

```
Step 1: Booking Confirmed
  ↓
Step 2: Documents Upload
  ↓
Step 3: Sales Form Completion
  ↓
Step 4: Sales Finalized
  ↓
Step 5: Payment Complete
  ↓
Step 6: Vehicle Delivered
```

**Key Components**:
- Document verification checklist
- Final sales form with comprehensive details
- Manager approval workflow (for special discounts)
- Payment confirmation
- Delivery confirmation
- Sales document generation

**Implementation**: 
- `SalesProcessing.tsx` (main page)
- `FinalSalesForm.tsx` (sales details)
- `DocumentUploadSection.tsx` (document management)
- `SalesDetailsViewer.tsx` (read-only view)

### 5.6 Accessories Management

**Purpose**: Manage vehicle accessories and add-ons

**Categories**:
- Safety (helmets, protective gear)
- Convenience (mobile holders, USB chargers)
- Protection (body covers, crash guards)
- Aesthetics (seat covers, stickers)

**Features**:
- Vehicle compatibility mapping
- Individual pricing with GST
- Installation charges
- Stock availability
- Bundle offers

**Implementation**: `AccessoryContext.tsx`

**Data Storage**: `localStorage` key: `accessories`

### 5.7 Document Management

**Required Documents**:
- Aadhaar Card (Front & Back)
- Address Proof
- Passport Photos
- PAN Card
- Local Aadhaar (for other state registration)

**Document Statuses**:
- `Pending` - Not uploaded
- `Uploaded` - File received
- `Verified` - Approved
- `Rejected` - Needs resubmission

**Features**:
- Secure file upload (base64 encoding)
- File type validation (JPG, PNG, GIF, PDF)
- File size validation (max 10MB)
- Status tracking
- Progress indicators

**Implementation**: `DocumentUploadSection.tsx`

### 5.8 Payment Processing

**Payment Types**:
- Booking Amount
- Balance Payment
- Installment Payments

**Payment Methods**:
- UPI
- Credit/Debit Cards
- Net Banking
- Cash
- Financed

**Features**:
- Payment tracking
- Receipt generation
- Payment history
- Balance calculation
- Payment reminders

**Implementation**: Integrated in `SalesProcessing.tsx` and `FinalSalesForm.tsx`

### 5.9 Manager Approval Workflow

**Purpose**: Require manager approval for special discounts

**Approval States**:
- `NONE` - No special discount
- `PENDING` - Awaiting approval
- `APPROVED` - Discount approved
- `REJECTED` - Discount rejected

**Workflow**:
```
Sales Executive adds special discount
  ↓
Status: "Pending Approval"
  ↓
Manager reviews in Sales Details Viewer
  ↓
  ├─→ APPROVE → Status: "Sales Finalized"
  └─→ REJECT → Status: "Pending Approval"
```

**Access Control**:
- Only Super Admin and Showroom Manager can approve
- Sales cannot proceed to payment without approval

**Implementation**: `SalesDetailsViewer.tsx`

---

## 6. Routing Structure

### Public Routes

| Route | Component | Description |
|-------|-----------|-------------|
| `/` | `LandingPage` | Homepage with hero, vehicles, inquiry form |
| `/vehicles` | `VehicleCatalog` | Full vehicle catalog with filters |
| `/login` | `LoginPage` | Staff login page |

### Protected Routes (Admin)

Base path: `/admin`

| Route | Component | Allowed Roles | Description |
|-------|-----------|---------------|-------------|
| `/admin` | `AdminDashboard` | All staff | Dashboard with metrics |
| `/admin/showrooms` | `ShowroomManagement` | Super Admin, Manager | Manage showrooms |
| `/admin/vehicles` | `VehicleManagement` | Super Admin, Manager | Manage vehicles |
| `/admin/leads` | `LeadsManagement` | All staff | Inquiry management |
| `/admin/bookings` | `BookingManagement` | All staff | Booking management |
| `/admin/bookings/new` | `BookingFlow` | Sales, Manager | Create new booking |
| `/admin/sales-processing` | `SalesProcessing` | All staff | Sales workflow |
| `/admin/accessories` | `AccessoriesManagement` | Super Admin, Manager | Manage accessories |
| `/admin/reports` | `ShowroomReports` | All staff | Reports & analytics |
| `/admin/settings` | Coming Soon | Super Admin, Manager | System settings |

### Customer Routes

| Route | Component | Allowed Roles | Description |
|-------|-----------|---------------|-------------|
| `/book` | `BookingFlow` | Customer | Customer booking flow |

### Route Protection

**Implementation**: `ProtectedRoute.tsx`

```typescript
<ProtectedRoute allowedRoles={['Super Admin', 'Showroom Manager']}>
  <Component />
</ProtectedRoute>
```

**Behavior**:
- Checks if user is authenticated
- Verifies user role against allowed roles
- Redirects to `/login` if not authenticated
- Shows "Access Denied" if wrong role

---

## 7. Business Logic & Workflows

### 7.1 Inquiry to Booking Conversion

**Flow**:
```
1. Customer submits inquiry form
   ↓
2. Inquiry created with status "New"
   ↓
3. Sales executive assigned
   ↓
4. Status progresses through pipeline
   ↓
5. When ready, convert to booking
   ↓
6. Booking created with "Confirmed" status
```

**Implementation**:
- Inquiry form: `InquiryForm.tsx`
- Lead management: `LeadsManagement.tsx`
- Conversion: Manual process (future: direct conversion button)

### 7.2 Sales Processing Workflow

**Complete Flow**:

```
┌─────────────────────────────────────────────────┐
│ STEP 1: Booking Confirmed                      │
│ - Customer books vehicle                        │
│ - Initial payment made                          │
│ - Status: "Confirmed"                           │
└────────────────┬────────────────────────────────┘
                 ↓
┌─────────────────────────────────────────────────┐
│ STEP 2: Document Upload                        │
│ - Upload required documents                     │
│ - Status: "Documentation In-Progress"           │
└────────────────┬────────────────────────────────┘
                 ↓
┌─────────────────────────────────────────────────┐
│ STEP 3: Document Verification                  │
│ - Documentation officer verifies                │
│ - All documents must be "Verified"              │
│ - Progress tracked (percentage)                 │
└────────────────┬────────────────────────────────┘
                 ↓
┌─────────────────────────────────────────────────┐
│ STEP 4: Sales Form Completion                  │
│ - Fill comprehensive sale details               │
│ - Select payment method (Cash/Finance)          │
│ - Choose insurance type                         │
│ - Select accessories                            │
│ - Add discounts                                 │
│ - Upload additional documents                   │
└────────────────┬────────────────────────────────┘
                 ↓
         ┌───────┴────────┐
         │ Special        │
         │ Discount?      │
         └───┬────────┬───┘
             │ No     │ Yes
             ↓        ↓
             │   ┌────────────────────────────┐
             │   │ Manager Approval Required  │
             │   │ Status: "Pending Approval" │
             │   └────────┬───────────────────┘
             │            ↓
             │   ┌────────┴────────┐
             │   │ Manager Reviews │
             │   └────┬────────┬───┘
             │        │        │
             │   Approved  Rejected
             │        │        │
             │        ↓        ↓
             │        │   (Back to Step 4)
             │        │
             └────────┴────────┘
                      ↓
┌─────────────────────────────────────────────────┐
│ STEP 5: Sales Finalized                        │
│ - Status: "Sales Finalized"                     │
│ - Sales details locked                          │
│ - Ready for payment                             │
└────────────────┬────────────────────────────────┘
                 ↓
┌─────────────────────────────────────────────────┐
│ STEP 6: Payment Processing                     │
│ - Process payment                               │
│ - Generate receipt                              │
│ - Status: "Payment Complete"                    │
│ - Complete record lock                          │
└────────────────┬────────────────────────────────┘
                 ↓
┌─────────────────────────────────────────────────┐
│ STEP 7: Delivery Confirmation                  │
│ - Confirm vehicle delivery                      │
│ - Record delivery date                          │
│ - Status: "Delivered"                           │
│ - Sales lifecycle closed                        │
└─────────────────────────────────────────────────┘
```

**Key Decision Points**:

1. **Document Verification Gate**
   - Cannot proceed to sales form until all documents verified
   - Progress bar shows completion percentage

2. **Special Discount Approval Gate**
   - If special discount > 0 AND user is not manager
   - Must get manager approval before proceeding
   - Cannot finalize sales without approval

3. **Payment Lock**
   - After payment confirmed, sales details become read-only
   - No edits allowed to sales form
   - Only view and download actions available

4. **Delivery Lock**
   - After delivery confirmed, complete record lock
   - Status: "Delivered" (final state)
   - Sales lifecycle closed

### 7.3 Price Calculation Logic

**Components of On-Road Price**:

```
Ex-Showroom Price
+ RTO Charges
  - Registration Fee
  - Road Tax (state-specific)
  - Smart Card
  - Number Plate
  - Hypothecation (if financed)
+ Insurance
  - Third Party (mandatory)
  - Comprehensive (optional)
  - Personal Accident Cover
  - Zero Depreciation (optional)
+ Accessories
  - Selected accessories total
  - Installation charges
+ Other Charges
  - FastTag
  - Extended Warranty
  - AMC
  - Documentation Charges
  - Job Club Membership (₹1,500 if selected)
  - Other State Registration (₹500 if applicable)
- Exchange Value (if exchange sale)
- Discount
- Special Discount
= Grand Total (On-Road Price)
```

**Implementation**: `salesCalculations.ts`

**Key Functions**:
- `calculateGrandTotal(booking)` - Main calculation
- `calculateAccessoriesTotal(selectedAccessories)` - Accessories sum
- `calculateHypothecationCharge(selected)` - ₹500 if Yes
- `calculateOtherStateAmount(state, showroomState)` - ₹500 if different
- `calculateJobClubCharge(jobClub)` - ₹1,500 if YES

**Real-time Updates**:
- Price recalculates on any field change
- Displayed in sales form
- Breakdown shown in sections

### 7.4 Stock Management

**Stock Tracking**:
- Color-wise stock quantity
- Real-time updates on booking
- Low stock alerts (threshold: 2 units)

**Stock Allocation**:
```
Booking Confirmed
  ↓
Reduce stock quantity by 1
  ↓
If stock < 2, show low stock alert
  ↓
If stock = 0, mark as "Out of Stock"
```

**Implementation**: `VehicleContext.tsx`

**Method**: `updateStock(modelId, variantId, colorName, quantity)`

### 7.5 Document Verification Workflow

**Document Checklist**:
- Aadhaar Card (Front)
- Aadhaar Card (Back)
- Address Proof
- Passport Photos
- Local Aadhaar (if other state)

**Status Progression**:
```
Pending → Uploaded → Verified
                  ↓
                Rejected (back to Pending)
```

**Verification Process**:
1. Customer/staff uploads document
2. Status changes to "Uploaded"
3. Documentation officer reviews
4. Officer marks as "Verified" or "Rejected"
5. Progress bar updates
6. When all verified, can proceed to sales

**Implementation**: `DocumentUploadSection.tsx`

**Progress Calculation**:
```typescript
const totalDocs = 5;
const verifiedDocs = Object.values(documents).filter(
  status => status === 'Verified'
).length;
const progress = (verifiedDocs / totalDocs) * 100;
```

---

## 8. Data Models

### 8.1 Showroom Model

```typescript
interface Showroom {
  showroomId: string;
  name: string;
  brand: string;
  tagline: string;
  state: string;
  gstNumber: string;
  contact: {
    phone: string;
    email: string;
    whatsapp: string;
  };
  address: {
    street: string;
    city: string;
    state: string;
    pincode: string;
    mapLink: string;
    coordinates: { lat: number; lng: number; };
  };
  branding: {
    primaryColor: string;
    secondaryColor: string;
    logoUrl: string;
  };
  workingHours: {
    weekdays: string;
    sunday: string;
  };
  pricingConfig?: {
    margins: number;
    documentationCharges: number;
    rtoCharges: Record<string, number>;
  };
}
```

**Example**:
```json
{
  "showroomId": "SH001",
  "name": "Sandhya Honda",
  "brand": "Honda",
  "state": "Bihar",
  "gstNumber": "10XXXXX1234X1XX",
  "branding": {
    "primaryColor": "#CC0000",
    "secondaryColor": "#000000"
  }
}
```

### 8.2 Vehicle Model

```typescript
interface Vehicle {
  id: string;
  brand: string;
  model: string;
  category: 'Scooter' | 'Motorcycle' | 'Electric';
  launchYear?: string;
  description?: string;
  image: string;
  mediaAssets?: MediaAssets;
  specs: VehicleSpecs;
  variants: VehicleVariant[];
}

interface VehicleVariant {
  id: string;
  name: string;
  brakeType?: 'Drum' | 'Disc';
  wheelType?: 'Alloy' | 'Spoke' | 'Steel';
  connectedFeatures?: boolean;
  colors: VehicleColor[];
  pricing: PricingStructure;
}

interface VehicleColor {
  name: string;
  hexCode: string;
  status: 'In Stock' | 'Out of Stock' | 'Coming Soon';
  stockQuantity: number;
  expectedDelivery?: string;
}
```

### 8.3 Inquiry Model

```typescript
interface Inquiry {
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
```

### 8.4 Booking Model

```typescript
interface Booking {
  id: string;
  date: string;
  customer: BookingCustomer;
  vehicleConfig: SelectedVehicleConfig;
  selectedAccessories: string[];
  pricing: PricingBreakdown;
  payments: PaymentRecord[];
  bookingAmountPaid: number;
  balanceDue: number;
  preferredDeliveryDate?: string;
  specialInstructions?: string;
  status: BookingStatus;
  documents: DocumentStatus;
  assignedTo?: string;
  chassisNumber?: string;
  cancellationReason?: string;
  sale?: FinalSale;
  paymentConfirmed?: boolean;
  deliveryConfirmed?: boolean;
  deliveryDate?: string;
}
```

### 8.5 FinalSale Model

```typescript
interface FinalSale {
  soldThrough: 'CASH' | 'FINANCE';
  financer?: string;
  financeBy?: string;
  hypothecationSelected: 'Yes' | 'No';
  hypothecationCharge: number;
  registration: 'Yes' | 'No';
  otherState: {
    selected: string;
    amount: number;
  };
  insurance: 'YES' | 'NO';
  insuranceType?: string;
  insuranceNominee: {
    name: string;
    age: number;
    relation: string;
  };
  selectedAccessoriesFinal: Record<string, number>;
  accessoriesTotal: number;
  typeOfSale: 'NEW' | 'EXCHANGE';
  exchange?: ExchangeDetails;
  discount: number;
  specialDiscount: number;
  specialDiscountApprovalStatus: 'NONE' | 'PENDING' | 'APPROVED' | 'REJECTED';
  isGstNumber: 'YES' | 'NO';
  gstNumber?: string;
  jobClub: 'YES' | 'NO';
  otherCharges: number;
  documents: {
    aadhaarFront: string | null;
    aadhaarBack: string | null;
    pan: string | null;
    localAadhaarFront: string | null;
    localAadhaarBack: string | null;
  };
}
```

### 8.6 User Model

```typescript
interface User {
  id: string;
  fullName: string;
  email?: string;
  mobile: string;
  role: Role;
  showroomId?: string;
  profileImage?: string;
}

type Role = 
  | 'Super Admin'
  | 'Showroom Manager'
  | 'Sales Executive'
  | 'Accountant'
  | 'Documentation Officer'
  | 'Customer';
```

---

## 9. State Management

### 9.1 Context Providers

The application uses React Context API for feature-specific state management:

#### ShowroomContext
**Purpose**: Manage showroom data and active showroom selection

**State**:
- `showrooms: Showroom[]`
- `activeShowroom: Showroom`

**Methods**:
- `setActiveShowroom(id: string)`
- `addShowroom(showroom: Showroom)`
- `updateShowroom(id: string, updates: Partial<Showroom>)`
- `deleteShowroom(id: string)`

**Storage**: `localStorage` key: `showrooms`, `activeShowroomId`

#### VehicleContext
**Purpose**: Manage vehicle catalog

**State**:
- `vehicles: Vehicle[]`

**Methods**:
- `addVehicle(vehicle: Vehicle)`
- `updateVehicle(id: string, updates: Partial<Vehicle>)`
- `deleteVehicle(id: string)`
- `updateStock(modelId, variantId, colorName, quantity)`

**Storage**: `localStorage` key: `vehicles`

#### InquiryContext
**Purpose**: Manage customer inquiries

**State**:
- `inquiries: Inquiry[]`

**Methods**:
- `addInquiry(inquiry: Inquiry)`
- `updateInquiry(id: string, updates: Partial<Inquiry>)`
- `deleteInquiry(id: string)`
- `assignInquiry(id: string, userId: string)`

**Storage**: `localStorage` key: `inquiries`

#### BookingContext
**Purpose**: Manage bookings and sales

**State**:
- `bookings: Booking[]`

**Methods**:
- `addBooking(booking: Booking)`
- `updateBooking(id: string, updates: Partial<Booking>)`
- `deleteBooking(id: string)`
- `updateBookingStatus(id: string, status: BookingStatus)`
- `updateBookingSale(id: string, sale: FinalSale)`
- `updateDocumentStatus(id: string, docType: string, status: string)`
- `confirmPayment(id: string)`
- `confirmDelivery(id: string)`

**Storage**: `localStorage` key: `bookings`

#### AccessoryContext
**Purpose**: Manage accessories catalog

**State**:
- `accessories: Accessory[]`

**Methods**:
- `addAccessory(accessory: Accessory)`
- `updateAccessory(id: string, updates: Partial<Accessory>)`
- `deleteAccessory(id: string)`

**Storage**: `localStorage` key: `accessories`

#### AuthContext
**Purpose**: Manage authentication and user session

**State**:
- `user: User | null`
- `isAuthenticated: boolean`
- `isLoading: boolean`
- `error: AuthError | null`

**Methods**:
- `login(mobile: string, password: string)`
- `logout()`
- `updateProfile(updates: Partial<User>)`

**Storage**: `localStorage` key: `currentUser`

### 9.2 Redux Store

**Purpose**: Global application state (currently minimal usage)

**File**: `state/store.ts`

**Slices**: (Future expansion for complex state)

---

## 10. Key Components

### 10.1 Layout Components

#### Navbar
**File**: `components/Navbar.tsx`

**Purpose**: Main navigation for public pages

**Features**:
- Showroom branding
- Navigation links (Home, Vehicles, Contact)
- Theme toggle (light/dark)
- Responsive mobile menu

#### AdminLayout
**File**: `components/admin/AdminLayout.tsx`

**Purpose**: Admin dashboard layout with sidebar

**Features**:
- Sidebar navigation
- User profile display
- Role-based menu items
- Logout functionality
- Responsive design

### 10.2 Page Components

#### SalesProcessing
**File**: `pages/admin/SalesProcessing.tsx`

**Purpose**: Main sales workflow management page

**Features**:
- Booking list with filters
- Document verification interface
- Sales form modal
- Payment confirmation
- Delivery confirmation
- Sales journey visualization
- Status-based actions

**Key Sections**:
1. Search and filters
2. Booking cards with status
3. Selected booking detail panel
4. Document checklist
5. Sales journey progress
6. Action buttons (context-sensitive)

#### FinalSalesForm
**File**: `components/Sales/FinalSalesForm.tsx`

**Purpose**: Comprehensive sales details form

**Sections**:
1. GST Information
2. Payment Method (Cash/Finance)
3. Registration & State
4. Insurance Details
5. Accessories Selection
6. Type of Sale (New/Exchange)
7. Discounts
8. Additional Charges
9. Document Uploads
10. Price Breakdown

**Features**:
- Real-time price calculation
- Conditional field display
- Form validation
- Special discount approval workflow
- Progress indicator (6 steps)
- Edit/View modes

#### SalesDetailsViewer
**File**: `components/Sales/SalesDetailsViewer.tsx`

**Purpose**: Read-only view of completed sales

**Features**:
- Complete sales information display
- Manager approval interface
- Download sales document
- Professional formatting
- Responsive design

#### DocumentUploadSection
**File**: `components/Sales/DocumentUploadSection.tsx`

**Purpose**: Document upload and management

**Features**:
- File upload with drag-and-drop
- File type validation
- File size validation (max 10MB)
- Preview uploaded documents
- Status indicators
- Inline error messages

### 10.3 Utility Components

#### VehicleCard
**File**: `components/VehicleCard.tsx`

**Purpose**: Display vehicle in catalog

**Features**:
- Vehicle image
- Model name and category
- Price display
- Key specs (mileage, engine, weight)
- Hover effects
- Click to view details

#### InquiryForm
**File**: `components/InquiryForm.tsx`

**Purpose**: Customer inquiry submission

**Features**:
- Multi-step form
- Field validation
- Vehicle selection
- Timeline selection
- Source tracking
- Success feedback

#### ProtectedRoute
**File**: `components/auth/ProtectedRoute.tsx`

**Purpose**: Route access control

**Features**:
- Authentication check
- Role-based authorization
- Redirect to login
- Access denied message

---

## 11. Utilities & Helpers

### 11.1 Sales Calculations

**File**: `utils/salesCalculations.ts`

**Functions**:

```typescript
// Calculate grand total with all adjustments
calculateGrandTotal(booking: Booking): number

// Calculate accessories total
calculateAccessoriesTotal(selectedAccessories: Record<string, number>): number

// Calculate hypothecation charge (₹500 if Yes)
calculateHypothecationCharge(selected: 'Yes' | 'No'): number

// Calculate other state charge (₹500 if different state)
calculateOtherStateAmount(selectedState: string, showroomState: string): number

// Calculate Job Club charge (₹1,500 if YES)
calculateJobClubCharge(jobClub: 'YES' | 'NO'): number

// Get default FinalSale object
getDefaultFinalSale(): FinalSale
```

**Constants**:
- `INDIAN_STATES` - List of all Indian states
- `FINANCER_LIST` - List of finance companies

### 11.2 Sales Document Generator

**File**: `utils/salesDocumentGenerator.ts`

**Function**:
```typescript
downloadSalesDocument(
  booking: Booking,
  vehicleName: string,
  variantName: string
): void
```

**Purpose**: Generate and download HTML sales document

**Features**:
- Professional HTML template
- Complete sales information
- Print-optimized layout
- Automatic filename generation
- Browser-compatible

**Output**: `Sales_Document_[BookingID]_[Date].html`

---

## 12. Testing

### 12.1 Test Setup

**Framework**: Vitest + React Testing Library

**Configuration**: `vite.config.ts`

**Setup File**: `src/__tests__/setup.ts`

**Environment**: jsdom

### 12.2 Test Categories

#### Unit Tests
- Component rendering
- Function logic
- State updates
- Calculations

#### Integration Tests
- User workflows
- Form submissions
- State management
- Context interactions

#### Property-Based Tests
- Using fast-check library
- Test data generators
- Edge case coverage

**Example Test Files**:
- `__tests__/LoginPage.test.tsx`
- `__tests__/infrastructure.test.ts`
- `__tests__/theme-system.test.tsx`
- `__tests__/properties/login-terminology.test.tsx`
- `__tests__/properties/password-visibility.test.tsx`

### 12.3 Test Utilities

**File**: `__tests__/utils/`

**Utilities**:
- `generators.ts` - Test data generators
- `mockUser.ts` - Mock user data
- `viewport.ts` - Viewport testing helpers
- `index.ts` - Common test utilities

### 12.4 Running Tests

```bash
# Run all tests once
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with UI
npm run test:ui
```

---

## Additional Documentation

For detailed workflow guides, refer to:
- `SALES_WORKFLOW_GUIDE.md` - Complete sales workflow
- `SALES_WORKFLOW_FIXES.md` - Recent fixes and improvements
- `POST_SALES_ENHANCEMENTS.md` - Post-sales features
- `DELIVERY_CONFIRMATION_FEATURE.md` - Delivery process
- `DOCUMENT_UPLOAD_WORKFLOW.md` - Document management
- `PAYMENT_STATE_LOCK_FIXES.md` - Payment locking mechanism

---

## Future Enhancements

### Backend Integration
- RESTful API development
- Database (PostgreSQL/MySQL)
- Authentication (JWT)
- File storage (AWS S3)
- Payment gateway integration

### Features
- Mobile application
- WhatsApp integration
- Email notifications
- SMS alerts
- Advanced analytics
- CRM features
- Service booking
- Spare parts management

### Technical Improvements
- Performance optimization
- SEO optimization
- PWA capabilities
- Offline support
- Real-time updates (WebSocket)

---

**Document Version**: 1.0  
**Last Updated**: March 27, 2026  
**Prepared For**: Knowledge Transfer  
**System Status**: Production-ready (Frontend), Backend pending
