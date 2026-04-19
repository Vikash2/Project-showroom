## Overview

The current VMS captures leads, manages bookings, and handles payment simulation. This prompt adds a **final sales capture** process, including finance, exchange, special discount approval, document uploads, and delivery form printing. The goal is to convert a booking into a delivered sale with all required details.

**Key additions:**
- Extend `Booking` data model with a `sale` object (see Phase 1).
- Build a comprehensive **Final Sales Form** (Phase 2) for sales executives.
- Implement **special discount approval workflow** (Phase 3).
- Enhance the **Reports** dashboard with sales metrics (Phase 4).
- Add a **Delivery Form** for printing/downloading (Phase 5).

All changes must integrate with the existing React 19 + TypeScript, React Router v7, Tailwind CSS v4, Framer Motion, and React Context (with localStorage persistence) stack.

---

## Phase 1: Extend Data Models & Context

### 1.1 Update Booking Interface

**File:** `src/types/index.ts` (or wherever `Booking` is defined)

Add a `sale` property to `Booking` using the interface below. Also add the new booking status `'Sales Finalized'` to the existing status union.

```typescript
// Existing Booking statuses: add 'Sales Finalized'
export type BookingStatus = 
  | 'Pending' | 'Confirmed' | 'Documentation In-Progress' | 'Stock Allocated'
  | 'Payment Pending' | 'Payment Complete' | 'RTO Processing' | 'PDI Scheduled'
  | 'Ready for Delivery' | 'Delivered' | 'Cancelled'
  | 'Sales Finalized'; // New status

// New interface for sale details
export interface FinalSale {
  soldThrough: 'CASH' | 'FINANCE';
  financer?: string;
  financeBy?: string;
  hypothecationSelected: 'Yes' | 'No';
  hypothecationCharge: number; // 500 if Yes else 0
  registration: 'Yes' | 'No';
  otherState: {
    selected: string;   // state name
    amount: number;     // 500 if other state else 0
  };
  insurance: 'YES' | 'NO';
  insuranceType?: string;
  insuranceNominee: {
    name: string;
    age: number;
    relation: string;
  };
  selectedAccessoriesFinal: Record<string, number>; // accessory id -> final amount
  accessoriesTotal: number;
  typeOfSale: 'NEW' | 'EXCHANGE';
  exchange?: {
    model: string;
    year: number;
    value: number;
    exchangerName: string;
    registrationNumber: string;
  };
  discount: number;
  specialDiscount: number;
  specialDiscountApprovalStatus: 'NONE' | 'PENDING' | 'APPROVED' | 'REJECTED';
  specialDiscountMessage?: string;
  isGstNumber: 'YES' | 'NO';
  gstNumber?: string;
  jobClub: 'YES' | 'NO';
  otherCharges: number;
  documents: {
    aadhaarFront: string | null;   // base64 or file URL
    aadhaarBack: string | null;
    pan: string | null;
    localAadhaarFront: string | null;
    localAadhaarBack: string | null;
  };
}

// Extend Booking
export interface Booking {
  // ... existing fields
  sale?: FinalSale;
}
1.2 Update Booking Context
File: src/context/BookingContext.tsx

Modify the Booking state type to include the new sale field.

Ensure that when creating a new booking, an empty sale object is added (or omitted – handle gracefully).

Add a method updateBookingSale(bookingId: string, saleData: FinalSale): Promise<void> that updates the booking and persists to localStorage.

Adjust the booking status update logic to allow transitioning to 'Sales Finalized' when appropriate.

Implementation notes:

Keep existing methods unchanged; add new ones.

Use useCallback and ensure state updates are immutable.

1.3 Add Helper Functions for Calculations
Create a utility file src/utils/salesCalculations.ts with functions that will be reused:

calculateGrandTotal(booking: Booking): number – computes total based on base pricing + sale adjustments (exchange, discounts, accessories, etc.)

calculateAccessoriesTotal(selectedAccessoriesFinal: Record<string, number>): number

calculateHypothecationCharge(hypothecationSelected: 'Yes' | 'No'): number

calculateOtherStateAmount(selectedState: string, showroomState: string): number

These will be used in the Final Sales Form and for displaying totals.

Phase 2: Build Final Sales Form Component
2.1 Create Component
File: src/components/Sales/FinalSalesForm.tsx

A modal or page that captures all sale details. Reuse the layout from FinalSales.txt but convert to Tailwind CSS.

Props:

booking: Booking – the booking being finalized.

onClose: () => void – close the modal.

onSave: (updatedBooking: Booking) => void – save and close.

State:

sale – local copy of booking.sale or default.

accessoriesListing – computed from the selected vehicle variant (look up in VehicleContext).

insuranceOptions – from the vehicle variant.

showroomState – from ShowroomContext.

UI Sections (collapsible or in order):

GST Type – radio buttons YES/NO; if YES show GST number input.

Sold Through – CASH / FINANCE.

If FINANCE: show Financer (dropdown from financerList fetched via API or dummy), Finance By (text), Hypothecation (Yes/No radio).

Registration – Yes/No (Yes auto‑populates RTO charges from vehicle pricing).

Other State – dropdown of Indian states; if selected state ≠ showroom state, show warning and add ₹500 to total; also show local Aadhaar upload fields.

Accessories – table with checkboxes and custom amount input. Data sourced from accessoriesListing. Update selectedAccessoriesFinal and accessoriesTotal on change.

Insurance – Yes/No.

If Yes: show radio buttons for insurance options (from vehicle variant). On selection, update insuranceType and adjust total.

After insurance type selected, show nominee fields (name, age, relation).

Other (Job Club) – Yes/No; if Yes, show input for amount (updates otherCharges).

Type of Sale – NEW / EXCHANGE.

If EXCHANGE: show form for exchange model, year, value, exchanger name, registration number.

Discount – discount and specialDiscount number inputs.

Document Uploads – file inputs for Aadhaar front/back, PAN, local Aadhaar front/back (if other state). Convert files to base64 using FileReader.

Grand Total – read‑only field updated live using calculateGrandTotal.

Actions – Save & Submit, Cancel.

Calculations: Use useEffect to recalc totals whenever relevant fields change. Store sale state and compute derived values.

Styling: Use Tailwind CSS classes. For the accessories table, make it responsive (overflow-x auto). For file uploads, use simple <input type="file" accept="image/*" /> and handle file reading.

Integration:

Open the form from the Booking Detail Modal (admin) via a button “Final Sales” that appears when booking status is Payment Complete or higher.

Pass the booking object and refresh on save.

2.2 Add to Booking Detail Modal
File: src/components/admin/BookingManagement/BookingDetailModal.tsx (or wherever the modal is defined)

Add a new button next to “Update Status” or similar:

tsx
{booking.status === 'Payment Complete' && (
  <Button onClick={() => setShowFinalSales(true)}>
    Final Sales
  </Button>
)}
Render FinalSalesForm as a modal overlay.

2.3 Update Booking on Save
When onSave is called, update the booking in BookingContext:

tsx
const handleSave = async (updatedBooking: Booking) => {
  // If specialDiscount > 0 and user role is not approver, set status to PENDING
  const user = useAuth().user;
  const isApprover = user?.role === 'Super Admin' || user?.role === 'Showroom Manager';
  if (updatedBooking.sale?.specialDiscount > 0 && !isApprover) {
    updatedBooking.sale.specialDiscountApprovalStatus = 'PENDING';
    // Do not advance booking status
  } else {
    // Optionally advance booking status to 'Sales Finalized'
    updatedBooking.status = 'Sales Finalized';
  }
  await updateBookingSale(updatedBooking.id, updatedBooking.sale);
  onClose();
};
Also update balanceDue if necessary (after discounts etc.).

Phase 3: Approval Workflow
3.1 Add Pending Approvals View
File: src/components/admin/AdminDashboard.tsx or a new route /admin/approvals

Create a component that lists bookings where sale.specialDiscountApprovalStatus === 'PENDING'. Each item shows booking ID, customer name, requested discount amount, and buttons to Approve/Reject.

Data source: Filter BookingContext.bookings.

Approval action:

For approval: update booking’s sale.specialDiscountApprovalStatus = 'APPROVED' and booking.status = 'Sales Finalized'.

For rejection: update status to 'REJECTED' and optionally add a message. Keep booking status unchanged.

3.2 Add Notifications (optional)
Use react-hot-toast to show success/error messages.

3.3 Update Role‑Based Access
Only users with roles Super Admin or Showroom Manager can see the approvals list.

Ensure that when a sales executive tries to submit a special discount, they see a message that it’s pending approval and cannot finalize the sale until approved.

Phase 4: Enhance Reports
4.1 Add Sales Metrics to Reports Dashboard
File: src/components/admin/ShowroomReports.tsx (or extend existing)

Add a new tab or section with:

Units Sold per Model – bar chart using data from BookingContext (status Delivered or Sales Finalized).

Revenue by Finance vs Cash – pie chart.

Average Transaction Value – total revenue / number of delivered bookings.

Discount Analysis – average discount and special discount amounts.

Use the same charting library as before (e.g., Recharts). Data can be derived from BookingContext using useMemo.

4.2 Export Data (CSV)
Extend the existing “Export Data” button to include sales data. Provide options to export bookings with sale details as CSV.

Phase 5: Delivery Form & Print
5.1 Create Delivery Form Component
File: src/components/Sales/DeliveryForm.tsx

A printable component that displays all sale details in a structured format. Use the same design as the “Download Delivery Form” from FinalSales.txt.

Props: booking: Booking

Render:

Showroom details (from active showroom)

Customer information

Vehicle details (model, variant, color)

Pricing breakdown (ex‑showroom, RTO, insurance, accessories, discounts, exchange, grand total)

Finance details (if applicable)

Exchange details (if applicable)

Document checklist

Terms and conditions

Signature lines

Add print styles using Tailwind’s print: variant.

5.2 Add Print Button
In the Booking Detail Modal, after sale is finalized (status Sales Finalized or Delivered), add a button “Print Delivery Form” that opens a new window with the delivery form and triggers print.

tsx
const handlePrint = () => {
  const printWindow = window.open('', '_blank');
  printWindow.document.write('<html><head><title>Delivery Form</title></head><body>');
  printWindow.document.write(ReactDOMServer.renderToString(<DeliveryForm booking={booking} />));
  printWindow.document.write('</body></html>');
  printWindow.document.close();
  printWindow.print();
};
Make sure to include Tailwind CSS in the print window (either inline or by referencing the same styles).

Additional Considerations
File Uploads
Convert uploaded files to base64 using FileReader.

Store base64 strings in sale.documents. For large files, consider using URL.createObjectURL but remember to revoke URLs to avoid memory leaks.

Provide a preview of uploaded images.

LocalStorage Limits
Base64 strings can grow large. In a real application, a backend with file storage is required. For demo purposes, accept that localStorage may become full if many images are stored.

Role Permissions
Add checks in FinalSalesForm to disable fields for non‑sales roles (e.g., Accountant should not edit discounts).

Use useAuth to get current user and conditionally render or disable inputs.

Testing
Write unit tests for calculation functions.

Test form submission and approval flow manually.

Error Handling
Show toast messages for validation errors (e.g., missing required fields, file type not allowed).

Ensure that saving a form with invalid data does not corrupt the booking.

