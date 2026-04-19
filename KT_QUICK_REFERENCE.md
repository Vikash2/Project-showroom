# Vehicle Showroom Management System - Quick Reference Guide

## 🚀 Quick Start

### Technology Stack
- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS 4
- **State**: Redux Toolkit + Context API
- **Storage**: localStorage (temporary)
- **Testing**: Vitest + React Testing Library

### Run the Application
```bash
cd Code/frontend
npm install
npm run dev
```

### Build for Production
```bash
npm run build
npm run preview
```

---

## 📁 Project Structure

```
Code/frontend/src/
├── components/       # Reusable UI components
│   ├── admin/       # Admin components
│   ├── auth/        # Auth components
│   └── Sales/       # Sales workflow components
├── pages/           # Page components
│   ├── admin/       # Admin pages
│   ├── auth/        # Login page
│   └── customer/    # Customer pages
├── state/           # Context providers
├── types/           # TypeScript types
├── utils/           # Utility functions
└── App.tsx          # Main app component
```

---

## 🔐 User Roles

| Role | Access Level | Key Permissions |
|------|-------------|-----------------|
| Super Admin | System-wide | All permissions, manage showrooms |
| Showroom Manager | Showroom-specific | Approve discounts, manage users |
| Sales Executive | Assigned leads | Create bookings, sales forms |
| Accountant | Financial data | View bookings, manage payments |
| Documentation Officer | Documents | Verify documents, update status |
| Customer | Public + own data | Browse, inquire, book |

---

## 🛣️ Key Routes

### Public
- `/` - Homepage
- `/vehicles` - Vehicle catalog
- `/login` - Staff login

### Admin (Protected)
- `/admin` - Dashboard
- `/admin/leads` - Inquiry management
- `/admin/bookings` - Booking management
- `/admin/sales-processing` - Sales workflow
- `/admin/vehicles` - Vehicle management
- `/admin/accessories` - Accessory management
- `/admin/reports` - Reports & analytics

---

## 📊 Sales Workflow (6 Steps)

```
1. Booking Confirmed
   ↓
2. Documents Upload
   ↓
3. Sales Form Completion
   ↓ (if special discount → Manager Approval)
4. Sales Finalized
   ↓
5. Payment Complete
   ↓
6. Vehicle Delivered
```

---

## 💰 Price Calculation

```
Ex-Showroom Price
+ RTO Charges (Registration, Road Tax, etc.)
+ Insurance (Third Party + Comprehensive)
+ Accessories Total
+ Other Charges (FastTag, Job Club, etc.)
- Exchange Value (if applicable)
- Discount
- Special Discount
= Grand Total
```

**Key Functions**: `utils/salesCalculations.ts`

---

## 📝 Booking Statuses

1. Pending
2. Confirmed
3. Documentation In-Progress
4. Pending Approval (special discount)
5. Sales Finalized
6. Payment Complete
7. Delivered
8. Cancelled

---

## 📄 Required Documents

- Aadhaar Card (Front & Back)
- Address Proof
- Passport Photos
- PAN Card
- Local Aadhaar (if other state)

**Statuses**: Pending → Uploaded → Verified / Rejected

---

## 🔧 State Management

### Context Providers

| Context | Purpose | Storage Key |
|---------|---------|-------------|
| ShowroomContext | Showroom data | `showrooms` |
| VehicleContext | Vehicle catalog | `vehicles` |
| InquiryContext | Customer inquiries | `inquiries` |
| BookingContext | Bookings & sales | `bookings` |
| AccessoryContext | Accessories | `accessories` |
| AuthContext | User session | `currentUser` |

### Key Methods

**BookingContext**:
- `addBooking(booking)`
- `updateBookingStatus(id, status)`
- `updateBookingSale(id, sale)`
- `updateDocumentStatus(id, docType, status)`
- `confirmPayment(id)`
- `confirmDelivery(id)`

---

## 🎨 Key Components

### Sales Processing
**File**: `pages/admin/SalesProcessing.tsx`
- Main sales workflow page
- Document verification
- Payment confirmation
- Delivery confirmation

### Final Sales Form
**File**: `components/Sales/FinalSalesForm.tsx`
- Comprehensive sales details
- Real-time price calculation
- Manager approval workflow

### Sales Details Viewer
**File**: `components/Sales/SalesDetailsViewer.tsx`
- Read-only sales view
- Download sales document
- Manager approval interface

### Document Upload
**File**: `components/Sales/DocumentUploadSection.tsx`
- File upload with validation
- Status tracking
- Preview documents

---

## 🔒 Access Control

### Route Protection
```typescript
<ProtectedRoute allowedRoles={['Super Admin', 'Showroom Manager']}>
  <Component />
</ProtectedRoute>
```

### Role Checks
```typescript
const isApprover = user?.role === 'Super Admin' || 
                   user?.role === 'Showroom Manager';
```

---

## 🧪 Testing

### Run Tests
```bash
npm run test          # Run once
npm run test:watch    # Watch mode
npm run test:ui       # UI mode
```

### Test Files
- `__tests__/LoginPage.test.tsx`
- `__tests__/infrastructure.test.ts`
- `__tests__/properties/*.test.tsx`

---

## 📦 Data Models

### Booking
```typescript
{
  id: string;
  customer: BookingCustomer;
  vehicleConfig: SelectedVehicleConfig;
  pricing: PricingBreakdown;
  status: BookingStatus;
  sale?: FinalSale;
  paymentConfirmed?: boolean;
  deliveryConfirmed?: boolean;
}
```

### FinalSale
```typescript
{
  soldThrough: 'CASH' | 'FINANCE';
  registration: 'Yes' | 'No';
  insurance: 'YES' | 'NO';
  selectedAccessoriesFinal: Record<string, number>;
  discount: number;
  specialDiscount: number;
  specialDiscountApprovalStatus: 'NONE' | 'PENDING' | 'APPROVED' | 'REJECTED';
  // ... more fields
}
```

---

## 🛠️ Utility Functions

### Sales Calculations
**File**: `utils/salesCalculations.ts`

```typescript
calculateGrandTotal(booking)
calculateAccessoriesTotal(accessories)
calculateHypothecationCharge(selected)
calculateOtherStateAmount(state, showroomState)
calculateJobClubCharge(jobClub)
```

### Document Generator
**File**: `utils/salesDocumentGenerator.ts`

```typescript
downloadSalesDocument(booking, vehicleName, variantName)
```

---

## 🚨 Important Business Rules

### Manager Approval
- Required when special discount > 0
- Only Super Admin and Showroom Manager can approve
- Sales cannot proceed to payment without approval

### Payment Lock
- After payment confirmed, sales details become read-only
- No edits allowed to sales form

### Delivery Lock
- After delivery confirmed, complete record lock
- Status: "Delivered" (final state)
- Sales lifecycle closed

### Document Verification
- All documents must be "Verified" before proceeding to sales
- Progress tracked as percentage

---

## 📚 Additional Documentation

- `KNOWLEDGE_TRANSFER_DOCUMENT.md` - Complete KT document
- `SALES_WORKFLOW_GUIDE.md` - Detailed workflow guide
- `SALES_WORKFLOW_FIXES.md` - Recent fixes
- `POST_SALES_ENHANCEMENTS.md` - Post-sales features
- `DELIVERY_CONFIRMATION_FEATURE.md` - Delivery process
- `showroom_requirements.md` - Original requirements
- `phase-1.md` - Phase 1 implementation details

---

## 🔄 Common Workflows

### Create a Booking
1. Navigate to `/admin/bookings`
2. Click "New Booking"
3. Select vehicle, variant, color
4. Add accessories
5. Fill customer details
6. Submit booking

### Process a Sale
1. Navigate to `/admin/sales-processing`
2. Select booking
3. Verify documents (mark as "Verified")
4. Click "Proceed to Sales"
5. Fill sales form
6. Submit (approval if special discount)
7. Confirm payment
8. Confirm delivery

### Approve Special Discount
1. Open booking with "Pending Approval" status
2. Click "View Sales Details"
3. Review discount amount
4. Click "Approve Sale" or "Reject"

---

## 🐛 Troubleshooting

### Data Not Persisting
- Check browser localStorage
- Clear cache and reload
- Verify context provider wrapping

### Route Access Denied
- Check user role
- Verify ProtectedRoute configuration
- Ensure user is authenticated

### Price Calculation Issues
- Check `salesCalculations.ts`
- Verify all fields are filled
- Check console for errors

---

## 📞 Support

For questions or issues:
1. Check existing documentation
2. Review test files for examples
3. Inspect component implementation
4. Check browser console for errors

---

**Quick Reference Version**: 1.0  
**Last Updated**: March 27, 2026  
**For**: Development Team
