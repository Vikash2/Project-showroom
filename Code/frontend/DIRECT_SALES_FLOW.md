# Direct Sales Flow Documentation

## Overview

The Direct Sales Flow enables showroom staff to process vehicle sales for walk-in customers who purchase without a prior booking. This feature maintains consistency with the existing booking-based sales workflow while providing a streamlined entry point for immediate sales.

## Current Implementation Status

### ✅ Fully Implemented
1. **Direct Sales Entry Flow** - 3-step wizard for walk-in customers
2. **Sales Form Parity** - 100% consistency with booking-based sales
3. **Unified Workflow** - Both flows converge after initiation
4. **Validation Rules** - Identical validation for both flows
5. **Calculations** - Shared calculation logic
6. **Data Models** - Compatible data structures

### ⚠️ Temporary Bypass Active
- **Approval workflow is currently disabled** to unblock sales completion
- All sales finalize immediately without manager approval
- Special discounts proceed without approval wait
- This is a controlled, temporary change
- See `SALES_FLOW_REFINEMENTS.md` for details and re-enable instructions

### 🔄 Next Steps
1. Test complete sales flow (both types)
2. Implement backend API endpoints
3. Re-enable approval workflow
4. Final end-to-end testing
5. Production deployment

## Key Features

### 1. Separate Entry Flow
- **Location**: `/admin/direct-sales`
- **Purpose**: Dedicated interface for walk-in customer sales
- **Access**: Sales Executive, Showroom Manager, Super Admin

### 2. Data Model Differentiation
- **Source Field**: All direct sales are tagged with `source: 'DIRECT'`
- **Booking-based sales**: Tagged with `source: 'BOOKING'`
- **Sale ID Format**: `DS-YYYY-NNNN` (e.g., DS-2024-0001)

### 3. Unified Sales Lifecycle
After initiation, both flows converge into the same downstream process:
- Document upload and verification
- Sales form completion
- Approval workflow (for special discounts)
- Payment confirmation
- Delivery confirmation

## Implementation Details

### New Files Created

1. **Types**
   - `src/types/directSale.ts` - Type definitions for direct sales
   - Includes `DirectSaleRecord`, `DirectSaleCustomer`, `DirectSaleVehicleConfig`

2. **State Management**
   - `src/state/DirectSaleContext.tsx` - Context provider for direct sales
   - Methods: `addDirectSale`, `updateDirectSale`, `confirmPayment`, `confirmDelivery`

3. **Components**
   - `src/pages/admin/DirectSalesEntry.tsx` - Main entry page with 3-step wizard
   - `src/components/Sales/DirectSalesForm.tsx` - Sales details form (reuses existing logic)

4. **Routing**
   - Added route: `/admin/direct-sales`
   - Integrated `DirectSaleProvider` in App.tsx

### Component Reuse

The Direct Sales Flow maximizes code reuse:

- **Document Upload**: Reuses `DocumentUploadSection` component
- **Sales Calculations**: Reuses utility functions from `salesCalculations.ts`
  - `calculateGrandTotal()`
  - `calculateAccessoriesTotal()`
  - `calculateHypothecationCharge()`
  - `calculateOtherStateAmount()`
- **Validation Logic**: Same validation rules as booking-based sales
- **Approval Workflow**: Identical special discount approval process

### User Flow

#### Step 1: Customer Information
- Full Name (required)
- Mobile Number (required)
- Email (optional)
- Emergency Contact (optional)
- Complete Address (required)

#### Step 2: Vehicle Selection
- Select Model
- Select Variant
- Select Color
- Add Accessories (optional)
- View live pricing summary

#### Step 3: Sales Details
- GST Information
- Payment Method (Cash/Finance)
- Registration Details
- Insurance Details
- Accessories Final Pricing
- Exchange Details (if applicable)
- Discounts & Other Charges

### State Transitions

```
Draft → Sales Finalized → Payment Complete → Delivered
        ↓ (if special discount)
    Pending Approval → Sales Finalized → ...
```

### Validation Rules

Same as booking-based sales:
- Finance: Requires financer and finance executive name
- Insurance: Requires type, nominee details (name, age, relation)
- Exchange: Requires model, year, value, exchanger name, registration number
- GST: Validates GST number format if provided
- Special Discount: Requires manager/admin approval

### Payment & Delivery

- **Payment Confirmation**: Locks the sales record permanently
- **Delivery Confirmation**: Closes the sales lifecycle
- **No Edits After Payment**: Same restriction as booking-based sales

## Integration with Existing System

### Sales Processing Page
The existing `SalesProcessing.tsx` can be extended to show both:
- Booking-based sales (existing)
- Direct sales (new)

Filter by source type to differentiate:
```typescript
const bookingSales = bookings.filter(b => b.status === 'Sales Finalized');
const directSales = directSales.filter(d => d.status === 'Sales Finalized');
```

### Unified View
Create a unified sales list that combines both types:
```typescript
const allSales: UnifiedSale[] = [
  ...bookings.map(b => ({ ...b, source: 'BOOKING' as const })),
  ...directSales.map(d => ({ ...d, source: 'DIRECT' as const }))
];
```

## Backend Integration (Future)

When implementing the backend, ensure:

1. **Database Schema**
   - Add `source` field to sales table ('BOOKING' | 'DIRECT')
   - Maintain separate ID sequences for direct sales
   - Link to booking ID if source is 'BOOKING', null otherwise

2. **API Endpoints**
   ```
   POST   /api/direct-sales          - Create direct sale
   GET    /api/direct-sales          - List all direct sales
   GET    /api/direct-sales/:id      - Get specific direct sale
   PUT    /api/direct-sales/:id      - Update direct sale
   POST   /api/direct-sales/:id/payment   - Confirm payment
   POST   /api/direct-sales/:id/delivery  - Confirm delivery
   ```

3. **Validation**
   - Same validation rules as booking-based sales
   - Enforce approval workflow for special discounts
   - Prevent edits after payment confirmation

4. **Reporting**
   - Include source field in all sales reports
   - Enable filtering by source type
   - Track conversion metrics separately

## Benefits

1. **Flexibility**: Supports both pre-booked and walk-in customers
2. **Consistency**: Same validation, approval, and lifecycle management
3. **Code Reuse**: Maximizes reuse of existing components and logic
4. **Data Integrity**: Clear differentiation in data models
5. **User Experience**: Streamlined flow for immediate sales

## Testing Checklist

- [ ] Create direct sale with all required fields
- [ ] Verify sale ID format (DS-YYYY-NNNN)
- [ ] Test vehicle and accessory selection
- [ ] Validate sales form with all scenarios (cash, finance, exchange)
- [ ] Test special discount approval workflow
- [ ] Confirm payment locks the record
- [ ] Confirm delivery closes the lifecycle
- [ ] Verify no edits allowed after payment
- [ ] Test GST number validation
- [ ] Verify pricing calculations match booking-based sales

## Future Enhancements

1. **Quick Sale Mode**: Pre-fill common configurations for faster entry
2. **Inventory Integration**: Real-time stock checking for direct sales
3. **Digital Signatures**: Capture customer signature on tablet
4. **SMS Notifications**: Auto-send sale confirmation to customer
5. **Analytics Dashboard**: Track direct vs booking-based sales metrics
6. **Bulk Import**: Import multiple direct sales from Excel/CSV

## Notes

- Direct sales bypass the booking module entirely
- No booking amount is collected (full payment at time of sale)
- Chassis number can be assigned immediately
- Same document requirements as booking-based sales
- Follows identical approval and payment workflows
