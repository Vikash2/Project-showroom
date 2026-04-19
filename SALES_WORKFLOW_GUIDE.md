# Sales Processing Workflow Guide

## Overview
The sales processing workflow has been restructured to follow a logical progression:
1. **Booking Confirmation** → 2. **Sales Processing** (Document Verification) → 3. **Final Sales** (Sale Details & Finalization)

---

## Workflow Steps

### Step 1: Booking Confirmation
**Location**: `/admin/bookings`

- Customer books a vehicle and makes initial payment
- Booking status becomes **"Confirmed"**
- A purple **"Process to Sales"** button appears in the booking detail panel

### Step 2: Sales Processing (Document Verification)
**Location**: `/admin/sales-processing`

**Access**: 
- Click "Process to Sales" button from booking detail, OR
- Navigate to "Sales Processing" in the admin sidebar

**What happens here**:
- View all confirmed bookings awaiting document verification
- Filter by document status:
  - **Pending Documents**: Bookings with incomplete document uploads
  - **Ready for Sales**: Bookings with all documents verified
- Update document status for each booking:
  - `Pending` → `Uploaded` → `Verified` ✓
  - Or mark as `Rejected` if needed
- Progress bar shows document completion percentage
- Once all documents are verified, "Proceed to Sales" button becomes enabled

### Step 3: Final Sales (Sale Details & Finalization)
**Location**: Accessible from Sales Processing page after document verification

**What happens here**:
- Capture comprehensive sale details:
  - GST Information
  - Payment Method (Cash/Finance)
  - Registration & State Details
  - Insurance Information
  - Accessories Selection
  - Type of Sale (New/Exchange)
  - Discounts & Additional Charges
  - Document Uploads (Aadhaar, PAN, etc.)
- Real-time price calculations
- Special discount approval workflow
- Booking status transitions to **"Sales Finalized"**

---

## User Roles & Access

| Role | Can Access |
|------|-----------|
| Super Admin | All features |
| Showroom Manager | All features |
| Sales Executive | Bookings, Sales Processing, Final Sales |
| Documentation Officer | Bookings, Sales Processing |
| Accountant | Bookings, Reports |

---

## Document Checklist

The following documents are tracked during sales processing:
- Aadhaar Card (Front)
- Aadhaar Card (Back)
- Address Proof
- Passport Photos
- Local Aadhaar (if other state registration)

**Status Options**:
- `Pending` - Not yet uploaded
- `Uploaded` - File received, awaiting verification
- `Verified` ✓ - Document verified and approved
- `Rejected` - Document rejected, needs resubmission

---

## Key Features

### 1. Document Verification
- Track document status for each booking
- Visual progress indicator (percentage complete)
- Color-coded status badges
- Bulk status updates

### 2. Sales Processing Dashboard
- Search bookings by ID, customer name, or phone
- Filter by document status
- Pagination support
- Mobile-responsive design
- Real-time document count display

### 3. Workflow Progression
- "Process to Sales" button (Confirmed → Sales Processing)
- "Proceed to Sales" button (Documents Verified → Final Sales)
- Status-based button visibility
- Automatic status transitions

### 4. Data Persistence
- All document statuses saved to localStorage
- Booking details maintained throughout workflow
- Sale information stored with booking record

---

## JSON Data Structure

### Booking with Sale Details
```json
{
  "id": "SH-BK-2025-001",
  "status": "Sales Finalized",
  "documents": {
    "aadharCard": "Verified",
    "addressProof": "Verified",
    "passportPhotos": "Verified"
  },
  "sale": {
    "soldThrough": "CASH",
    "hypothecationSelected": "No",
    "registration": "Yes",
    "insurance": "YES",
    "insuranceType": "Comprehensive",
    "selectedAccessoriesFinal": {
      "acc1": 4000,
      "acc4": 1200
    },
    "typeOfSale": "NEW",
    "discount": 5000,
    "specialDiscount": 0,
    "specialDiscountApprovalStatus": "NONE",
    "isGstNumber": "NO",
    "jobClub": "NO",
    "otherCharges": 0,
    "documents": {
      "aadhaarFront": "base64_string",
      "aadhaarBack": "base64_string",
      "pan": "base64_string",
      "localAadhaarFront": null,
      "localAadhaarBack": null
    }
  }
}
```

---

## Navigation Routes

| Page | Route | Purpose |
|------|-------|---------|
| Booking Management | `/admin/bookings` | View & manage bookings |
| Sales Processing | `/admin/sales-processing` | Document verification |
| Final Sales Form | Modal from Sales Processing | Sale details capture |

---

## Workflow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    BOOKING CONFIRMED                         │
│                   (Status: Confirmed)                        │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ↓ "Process to Sales" button
┌─────────────────────────────────────────────────────────────┐
│              SALES PROCESSING PAGE                           │
│         (Document Verification & Checklist)                 │
│                                                              │
│  • View all confirmed bookings                              │
│  • Update document status                                   │
│  • Track verification progress                              │
│  • Filter by document status                                │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ↓ All documents verified
┌─────────────────────────────────────────────────────────────┐
│              FINAL SALES FORM                                │
│         (Sale Details & Finalization)                       │
│                                                              │
│  • GST Information                                           │
│  • Payment Method                                            │
│  • Registration Details                                      │
│  • Insurance Information                                     │
│  • Accessories Selection                                     │
│  • Discounts & Charges                                       │
│  • Document Uploads                                          │
│  • Price Calculations                                        │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ↓ Submit
┌─────────────────────────────────────────────────────────────┐
│                  SALES FINALIZED                             │
│              (Status: Sales Finalized)                       │
│                                                              │
│  Ready for delivery & reporting                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Implementation Details

### Files Created/Modified

**New Files**:
- `src/pages/admin/SalesProcessing.tsx` - Sales processing dashboard
- `src/components/Sales/FinalSalesForm.tsx` - Final sales form modal
- `src/utils/salesCalculations.ts` - Price calculation utilities

**Modified Files**:
- `src/App.tsx` - Added route for sales processing
- `src/pages/admin/BookingManagement.tsx` - Added "Process to Sales" button
- `src/components/admin/AdminLayout.tsx` - Added sidebar link
- `src/types/booking.ts` - Extended with FinalSale interface
- `src/state/BookingContext.tsx` - Added updateBookingSale method

### Key Functions

**Sales Calculations**:
- `calculateGrandTotal()` - Computes total with all adjustments
- `calculateAccessoriesTotal()` - Sums accessory amounts
- `calculateHypothecationCharge()` - Returns hypothecation fee
- `calculateOtherStateAmount()` - Returns state registration charge

**Context Methods**:
- `updateBookingSale()` - Saves sale details to booking
- `updateDocumentStatus()` - Updates document verification status
- `updateBookingStatus()` - Transitions booking status

---

## Testing the Workflow

1. **Create a Booking**:
   - Go to `/admin/bookings`
   - Create a new booking or use existing confirmed booking
   - Ensure status is "Confirmed"

2. **Process to Sales**:
   - Click "Process to Sales" button
   - Redirects to `/admin/sales-processing`

3. **Verify Documents**:
   - Update document statuses to "Verified"
   - Watch progress bar update
   - "Proceed to Sales" button becomes enabled

4. **Finalize Sale**:
   - Click "Proceed to Sales"
   - Fill in sale details
   - Submit form
   - Booking status changes to "Sales Finalized"

---

## Future Enhancements

- [ ] Backend API integration for document uploads
- [ ] Email notifications for document verification
- [ ] Approval workflow for special discounts
- [ ] Sales metrics dashboard
- [ ] Delivery form generation & printing
- [ ] Payment gateway integration
- [ ] Customer portal for document uploads
- [ ] Automated document verification (OCR)
