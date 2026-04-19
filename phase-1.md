# **Phase 1 Implementation Prompt: Multi-Showroom Vehicle Management System**

## **Project: Sandhya Honda Showroom Management - Phase 1**

---

## **Objective**
Build a configurable multi-showroom vehicle management system starting with "Sandhya Honda" showroom. The system should handle vehicle catalog, inquiry management, and basic booking functionality with complete Indian taxation compliance. The architecture must support easy addition of new showrooms with their own branding, inventory, and staff.

---

## **Phase 1 Scope - Core Features**

### **1. Multi-Showroom Configuration System**

#### **Showroom Entity Structure**
Each showroom should have:
- **Basic Information**:
  - Showroom ID (unique identifier)
  - Showroom Name (e.g., "Sandhya Honda")
  - Brand Association (Honda)
  - Logo and branding colors
  - Contact details (phone, email, WhatsApp)
  - Address with Google Maps integration
  - GST Number
  - State (for RTO calculations)
  
- **Operational Details**:
  - Working hours
  - Available services (Sales, Service, Spare Parts)
  - Payment methods accepted
  - Staff members assigned to this showroom
  
- **Pricing Configuration**:
  - Showroom-specific margins/discounts
  - RTO charges (state-specific)
  - Documentation charges
  - Accessory pricing
  - Offer/promotion settings

#### **Initial Configuration for Sandhya Honda**
```javascript
{
  showroomId: "SH001",
  name: "Sandhya Honda",
  brand: "Honda",
  tagline: "Your Trusted Honda Partner",
  state: "Bihar", // For RTO calculations
  gstNumber: "10XXXXX1234X1XX",
  contact: {
    phone: "+91-XXXXXXXXXX",
    email: "info@sandhyahonda.com",
    whatsapp: "+91-XXXXXXXXXX"
  },
  address: {
    street: "Exhibition Road",
    city: "Patna",
    state: "Bihar",
    pincode: "800001",
    mapLink: "..."
  },
  branding: {
    primaryColor: "#CC0000", // Honda Red
    secondaryColor: "#000000",
    logoUrl: "/assets/sandhya-honda-logo.png"
  },
  workingHours: {
    weekdays: "9:00 AM - 7:00 PM",
    sunday: "9:00 AM - 6:00 PM"
  }
}
```

---

### **2. Vehicle Catalog Module**

#### **Honda 2-Wheeler Inventory**
Start with current popular Honda models:

**Scooters:**
1. Honda Activa 6G
2. Honda Dio
3. Honda Activa 125

**Motorcycles:**
1. Honda Shine 100
2. Honda SP 125
3. Honda CB Shine
4. Honda Unicorn
5. Honda Hornet 2.0
6. Honda CB350

**For Each Vehicle, Include:**

**A. Basic Details**
- Model name
- Category (Scooter/Motorcycle)
- Engine capacity (CC)
- Fuel type (Petrol/Electric)
- Launch year

**B. Variants**
- Standard/Deluxe/Sports variants
- Drum brake/Disc brake options
- Alloy/Spoke wheel options
- Connected features (Bluetooth/Non-Bluetooth)

**C. Available Colors per Variant**
Example for Activa 6G:
- Pearl Precious White
- Matte Axis Grey Metallic
- Black
- Rebel Red Metallic
- Dazzle Yellow Metallic
- Imperial Red Metallic

Each color should have:
- Color name
- Color code/hex value (for visual display)
- Availability status (In Stock/Out of Stock/Coming Soon)
- Expected delivery time
- Stock quantity

**D. Detailed Specifications**
- Engine: Type, displacement, max power, max torque
- Mileage (ARAI certified)
- Transmission type
- Fuel tank capacity
- Dimensions (length, width, height, wheelbase)
- Weight (kerb weight)
- Brakes (front/rear)
- Suspension (front/rear)
- Tyres (front/rear)
- Features list (LED lights, digital console, USB charging, etc.)
- Warranty (standard + extended options)

**E. Pricing Structure**
```javascript
{
  modelName: "Honda Activa 6G",
  variant: "Deluxe",
  exShowroomPrice: 74216,
  
  rtoCharges: {
    registrationFee: 300,
    roadTax: 4200, // Based on Bihar RTO
    smartCard: 200,
    numberPlate: 400,
    hypothecation: 0, // If financed
    total: 5100
  },
  
  insurance: {
    thirdParty: 1500, // IRDAI mandated
    comprehensive: 2800,
    personalAccident: 750,
    zeroDepreciation: 1200, // Optional
    total: 6250
  },
  
  otherCharges: {
    fastag: 200,
    extendedWarranty: 2500, // Optional
    amc: 3000, // Optional, 2 years
    documentationCharges: 500,
    accessoriesFitting: 0, // Based on selection
    total: 1200
  },
  
  onRoadPrice: 86766 // Auto-calculated
}
```

**F. Media Assets**
- Multiple high-resolution images (front, side, rear, 3/4 view)
- 360° view (if available)
- Color variant images
- Specification sheet PDF
- Brochure PDF
- Video reviews (YouTube embeds)

---

### **3. Inquiry Management System**

#### **A. Customer Inquiry Form**
Create a comprehensive inquiry capture form:

**Fields:**
- **Personal Information**:
  - Full Name *
  - Mobile Number * (with OTP verification)
  - Email Address
  - Alternate Contact Number
  - City/Location *
  
- **Vehicle Interest**:
  - Interested Model * (dropdown)
  - Preferred Variant (auto-populated based on model)
  - Preferred Color (show available colors)
  - Budget Range (dropdown: Under 60k, 60-80k, 80k-1L, 1L-1.5L, Above 1.5L) [this should be optional]
  
- **Purchase Timeline**:
  - When planning to buy? (Immediate, Within 1 month, 1-3 months, 3-6 months, Just exploring)
  
- **Additional Information**:
  - Exchange vehicle? (Yes/No)
  - If yes: Current vehicle details (make, model, year)
  - Finance required? (Yes/No)
  - Test ride interested? (Yes/No)
  - Preferred test ride date/time
  - Additional comments/queries

- **Source Tracking**:
  - How did you hear about us? (Website, Facebook, Instagram, Google, Walk-in, Reference, Others)

#### **B. Lead Management Dashboard**

**Lead Listing View** (for Sales Team):
- Table/Card view of all inquiries
- Columns: ID, Name, Mobile, Model, Color, Date, Status, Assigned To, Actions
- Filters:
  - Date range
  - Status (New, Contacted, Follow-up, Test Ride Scheduled, Hot Lead, Quotation Sent, Booking Done, Lost, Closed)
  - Model interested
  - Assigned sales executive
  - Source
- Search by name, mobile, email
- Sort by date, status, priority
- Bulk actions (assign, export)

**Lead Detail View**:
- Complete customer information
- Vehicle interest details
- Timeline of all interactions
- Communication log with date/time stamps
- Task scheduler (call back, send quotation, schedule test ride)
- Status change history
- Notes section (private internal notes)
- File attachments
- Quick actions:
  - Call customer (click to call)
  - WhatsApp message
  - Send email
  - Generate quotation
  - Convert to booking
  - Mark as lost (with reason)

#### **C. Lead Status Pipeline**
Visual pipeline with drag-and-drop:
1. **New** - Just received inquiry
2. **Contacted** - First contact made
3. **Follow-up** - Requires further follow-up
4. **Test Ride Scheduled** - Test ride booked
5. **Hot Lead** - Serious buyer, negotiation stage
6. **Quotation Sent** - Price quotation shared
7. **Booking Done** - Converted to booking
8. **Lost** - Lost to competitor or not interested
9. **Closed** - Purchased or no longer valid

Each status should have:
- Count of leads
- Visual progress indicator
- Auto-actions (e.g., auto-email when moved to quotation sent)

#### **D. Follow-up & Task Management**
- **Task Types**: Call, Meeting, Test Ride, Send Quotation, Document Collection
- **Task Scheduling**: Date, time, reminder
- **Task Assignment**: Assign to sales executive
- **Task Status**: Pending, Completed, Overdue
- **Calendar View**: See all scheduled tasks
- **Reminders**: Email/SMS/In-app notifications
- **Recurring Tasks**: Set follow-up frequency

#### **E. Communication Templates**
Pre-built templates for:
- Welcome SMS/Email (on inquiry submission)
- Follow-up messages
- Quotation email format
- Test ride confirmation
- Thank you message
- Booking confirmation
- Offer/festival messages

#### **F. Lead Scoring & Prioritization**
Auto-score leads based on:
- Purchase timeline (Immediate = High priority)
- Budget alignment with vehicle price
- Response rate to follow-ups
- Test ride completed
- Multiple inquiries from same customer
- Assigned priority tags: Hot, Warm, Cold

---

### **4. Booking Management System**

#### **A. Booking Process (Staff-facing)**

**Step 1: Vehicle Selection**
- Browse catalog or select from inquiry
- Choose model, variant, and color
- View vehicle details and specifications

**Step 2: Accessories Selection**
Build an accessory catalog:

**Safety Accessories:**
- Helmets (ISI certified, various brands and colors)
- Riding jackets
- Knee/elbow guards
- Gloves

**Convenience Accessories:**
- Mobile holder (magnetic/clamp)
- USB charger (single/dual port)
- Backrest (passenger comfort)
- Luggage carrier/box
- Leg guard
- Footrest

**Protection Accessories:**
- Body cover (fabric/plastic)
- Crash guard (front/side)
- Tank pad
- Saree guard
- Wheel cover
- Handlebar grip

**Aesthetics:**
- Seat cover (custom colors)
- Sticker kits
- LED indicator lights
- Chrome accessories

Each accessory should have:
- Name and description
- Compatible models
- Price (with GST)
- Image
- Installation charges (if applicable)
- In stock/Out of stock status

**Step 3: Price Calculation Widget**
Interactive calculator showing live price updates:

```
Base Vehicle Configuration:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Model: Honda Activa 6G Deluxe
Color: Pearl Precious White
Ex-Showroom Price:              ₹74,216

RTO & Registration Charges:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Registration Fee:                  ₹300
Road Tax (Bihar):                ₹4,200
Smart Card & Number Plate:         ₹600
Subtotal:                        ₹5,100

Insurance:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
☑ Third Party (Mandatory):       ₹1,500
☑ Comprehensive:                 ₹2,800
☑ Personal Accident Cover:         ₹750
☐ Zero Depreciation:             ₹1,200
Subtotal:                        ₹5,050

Accessories:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Body Cover:                        ₹450
Mobile Holder:                     ₹350
Crash Guard:                     ₹1,200
Subtotal (with GST):             ₹2,360

Additional Services:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
☐ Extended Warranty (2 yrs):     ₹2,500
☐ AMC Package (2 yrs):           ₹3,000
FastTag:                           ₹200
Documentation Charges:             ₹500
Subtotal:                          ₹700

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TOTAL ON-ROAD PRICE:            ₹87,426
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Booking Amount Required:         ₹5,000
Balance Payment:                ₹82,426

[Download Detailed Quotation PDF] [Proceed to Book]
```

Features:
- Toggle checkboxes for optional items
- Real-time price updates
- GST breakdown display
- Save/share quotation
- Print quotation
- Compare different configurations

**Step 4: Customer Information**
Form to collect:
- Full Name
- Mobile Number
- Email
- Complete Address
- Emergency Contact
- Preferred Delivery Date
- Special Requests/Instructions

**Step 5: Booking Confirmation**
- Review all details
- Terms & Conditions checkbox
- Booking amount: ₹5,000 (configurable)
- Payment options:
  - Online (UPI, Cards, Net Banking)
  - Pay at Showroom (generates payment link)
- Submit booking

**Step 6: Booking Success**
- Booking ID generated (e.g., SH-BK-2025-0001)
- Booking confirmation email/SMS
- Payment receipt
- Expected delivery timeline
- Next steps information
- Download booking summary PDF

#### **B. Booking Management Dashboard (Admin/Sales)**

**Booking List View:**
Columns:
- Booking ID
- Booking Date
- Customer Name & Contact
- Vehicle (Model + Variant + Color)
- On-Road Price
- Booking Amount Paid
- Balance Due
- Expected Delivery
- Status
- Assigned To
- Actions

**Filters & Search:**
- Date range
- Status (Pending, Confirmed, In-Process, Ready for Delivery, Delivered, Cancelled)
- Model
- Payment status
- Assigned sales executive
- Search by name, mobile, booking ID

**Booking Statuses:**
1. **Pending** - Booking amount not paid yet
2. **Confirmed** - Booking amount received
3. **Documentation In-Progress** - Collecting customer documents
4. **Stock Allocated** - Vehicle assigned from inventory
5. **Payment Pending** - Awaiting balance payment
6. **Payment Complete** - Full payment received
7. **RTO Processing** - Registration in progress
8. **PDI Scheduled** - Pre-delivery inspection scheduled
9. **Ready for Delivery** - Vehicle ready, waiting for customer
10. **Delivered** - Vehicle handed over
11. **Cancelled** - Booking cancelled

**Booking Detail View:**
- Complete customer information
- Vehicle details with configuration
- Price breakdown
- Payment timeline:
  - Booking amount: Date, amount, method, receipt
  - Balance payments: Track installments
  - Pending amount highlighted
- Document checklist:
  - Aadhar Card (Uploaded/Pending/Verified)
  - Address Proof (Uploaded/Pending/Verified)
  - Passport Photos (Uploaded/Pending/Verified)
  - Form 20, 21 status
- Status timeline with date stamps
- Activity log (all updates)
- Internal notes
- Document attachments
- Communication history

**Quick Actions:**
- Send payment reminder
- Update status
- Generate invoice
- Schedule delivery
- Print booking summary
- Cancel booking (with refund process)
- Convert to sales order

#### **C. Booking Cancellation & Refund**
- Cancellation reasons (dropdown)
- Refund policy display
- Refund calculation (based on policy)
- Admin approval workflow
- Refund processing
- Email confirmation

**Sample Refund Policy:**
- Cancelled within 7 days: 100% refund
- Cancelled within 15 days: 75% refund
- Cancelled after 15 days: 50% refund
- After vehicle dispatched: No refund

#### **D. Stock Allocation**
When booking is confirmed:
- Reduce available stock count
- Allocate specific chassis number (if available)
- Update color availability
- Generate stock alert if low
- Reserve vehicle for customer

---

### **5. User Roles & Authentication**

#### **User Roles:**

**1. Admin (Global)**
- Full system access across all showrooms.
- Onboard new showrooms and manage showroom configurations.
- Grant and manage "Super User" access for showroom staff.
- Configure global pricing, taxes, and RTO parameters.
- View consolidated reports for all showrooms.
- High-level user management and system maintenance.

**2. Super User (Showroom-specific)**
- One per showroom.
- Manage showroom-specific data and inventory.
- View and manage all inquiries and bookings for their showroom.
- Assign leads to showroom staff.
- Approve showroom-level quotations and discounts.
- Manage showroom-specific users (Normal Users).
- View showroom-specific performance reports.

**3. Normal User**
- General operational access within a specific showroom.
- Manage assigned inquiries and follow-ups.
- Create and update bookings.
- Handle document collection and verification.
- Manage customer communications (WhatsApp, Email).
- No access to configuration or high-level setting changes.

#### **Authentication Features:**
- Email and password-based login for all staff.
- Role-based dashboard redirection and permission enforcement.
- Session management and secure logout.
- Password reset and account recovery functionality.
- Two-factor authentication (optional/future) for Admin/Super User.

---

### **7. Admin Dashboard for Sandhya Honda**

#### **Overview/Home:**
- **Key Metrics Cards:**
  - Today's Inquiries: Count with trend
  - Pending Bookings: Count
  - Deliveries This Month: Count
  - Revenue This Month: Amount
  
- **Quick Stats:**
  - Total Active Leads: Number
  - Hot Leads: Number
  - Test Rides This Week: Number
  - Pending Payments: Amount
  
- **Charts & Graphs:**
  - Monthly sales trend (line chart)
  - Inquiry sources (pie chart)
  - Top selling models (bar chart)
  - Lead conversion funnel
  
- **Recent Activities:**
  - Latest inquiries
  - Recent bookings
  - Pending tasks
  - Low stock alerts

#### **Navigation Menu:**
- Dashboard
- Inquiries
  - All Leads
  - My Leads (for sales executive)
  - New Leads
  - Hot Leads
  - Lost Leads
- Bookings
  - All Bookings
  - Pending Delivery
  - Delivered
  - Cancelled
- Vehicle Catalog
  - All Vehicles
  - Add Vehicle
  - Manage Stock
- Accessories
  - All Accessories
  - Add Accessory
- Customers
  - All Customers
  - Customer Details
- Reports
  - Sales Report
  - Inquiry Report
  - Payment Report
  - Inventory Report
- Settings
  - Showroom Settings
  - Pricing Configuration
  - RTO Charges Setup
  - User Management
  - Role Management

#### **Alerts & Notifications:**
- New inquiry received
- Booking confirmed
- Payment received
- Low stock alert
- Task reminders
- Document pending

---

### **8. Search & Filter System**

#### **Vehicle Catalog Filters:**
- Category (Scooter/Motorcycle)
- Price Range (slider)
- Engine Capacity (100cc, 110cc, 125cc, etc.)
- Mileage (40-50, 50-60, 60+ kmpl)
- Features (LED lights, Bluetooth, USB, ABS, CBS)
- Sort by: Price (Low to High, High to Low), Mileage, Popularity, Newest

#### **Inquiry Filters:**
- Date range
- Status
- Model interested
- Budget range
- Purchase timeline
- Assigned to
- Source

#### **Booking Filters:**
- Date range
- Status
- Payment status
- Model
- Delivery date
- Assigned to

#### **Search Functionality:**
- Global search in header
- Search by: Customer name, mobile, email, booking ID, vehicle model
- Autocomplete suggestions
- Recent searches

---

### **9. Responsive Design Requirements**

#### **Desktop (1920px, 1440px, 1024px):**
- Full sidebar navigation
- Multi-column layouts
- Expanded data tables
- Dashboard with 4-column metrics

#### **Tablet (768px):**
- Collapsible sidebar
- 2-column layouts
- Responsive tables with horizontal scroll
- Touch-friendly buttons

#### **Mobile (375px, 414px):**
- Bottom navigation or hamburger menu
- Single column layouts
- Card-based designs
- Swipeable image galleries
- Sticky header with key actions
- Floating action button for primary actions

---

### **10. UI Components to Build**

#### **Reusable Components:**
1. **Navbar/Header**
   - Showroom logo
   - Navigation links
   - User profile dropdown
   - Notifications bell
   - Search bar

2. **Sidebar**
   - Collapsible menu
   - Active state indicators
   - Icons for each menu item
   - Role-based menu items

3. **Cards**
   - Vehicle card (with image, name, price, CTA)
   - Metrics card (with icon, number, trend)
   - Inquiry card
   - Booking card

4. **Forms**
   - Input fields (text, number, email, tel)
   - Select dropdowns
   - Radio buttons
   - Checkboxes
   - Date/time picker
   - File upload with drag-and-drop
   - Form validation messages
   - Multi-step form wizard

5. **Tables**
   - Sortable columns
   - Pagination
   - Row selection
   - Expandable rows
   - Action buttons
   - Export to CSV/Excel

6. **Modals/Dialogs**
   - Confirmation dialogs
   - Form modals
   - Image lightbox
   - Alert/success messages

7. **Status Badges**
   - Color-coded status pills
   - Priority indicators

8. **Price Calculator Widget**
   - Interactive checkboxes
   - Real-time calculations
   - Breakdown sections

9. **Timeline Component**
   - Vertical timeline for booking status
   - Activity logs

10. **Image Gallery**
    - Thumbnail grid
    - Lightbox view
    - Zoom functionality
    - 360° viewer

11. **Loading States**
    - Skeleton screens
    - Spinners
    - Progress bars

12. **Empty States**
    - No data illustrations
    - Helpful messaging
    - Action suggestions

---

### **11. Color Scheme & Branding for Sandhya Honda**

```css
:root {
  /* Primary Colors - Honda Red */
  --primary-50: #fef2f2;
  --primary-100: #fee2e2;
  --primary-200: #fecaca;
  --primary-300: #fca5a5;
  --primary-400: #f87171;
  --primary-500: #ef4444;
  --primary-600: #dc2626; /* Main Honda Red */
  --primary-700: #b91c1c;
  --primary-800: #991b1b;
  --primary-900: #7f1d1d;

  /* Neutral Colors */
  --neutral-50: #fafafa;
  --neutral-100: #f5f5f5;
  --neutral-200: #e5e5e5;
  --neutral-300: #d4d4d4;
  --neutral-400: #a3a3a3;
  --neutral-500: #737373;
  --neutral-600: #525252;
  --neutral-700: #404040;
  --neutral-800: #262626;
  --neutral-900: #171717;

  /* Semantic Colors */
  --success: #10b981;
  --warning: #f59e0b;
  --error: #ef4444;
  --info: #3b82f6;

  /* Background */
  --bg-primary: #ffffff;
  --bg-secondary: #f9fafb;
  --bg-tertiary: #f3f4f6;
}
```

**Typography:**
- Headings: Inter or Poppins (Bold)
- Body: Inter or Open Sans (Regular, Medium)
- Numbers/Prices: Tabular nums for alignment

---

### **12. Sample Data Structure**

#### **Vehicle Model Schema:**
```javascript
{
  id: "HON-ACT6G-001",
  showroomId: "SH001",
  brand: "Honda",
  modelName: "Activa 6G",
  category: "Scooter",
  engineCC: 109.51,
  fuelType: "Petrol",
  launchYear: 2020,
  
  variants: [
    {
      variantId: "V1",
      variantName: "Standard",
      brakeType: "Drum",
      wheelType: "Alloy",
      hasBluetoothConnectivity: false,
      exShowroomPrice: 74216,
      
      availableColors: [
        {
          colorId: "C1",
          colorName: "Pearl Precious White",
          colorHex: "#F5F5F5",
          stockQuantity: 5,
          availabilityStatus: "In Stock",
          expectedDeliveryDays: 2
        },
        {
          colorId: "C2",
          colorName: "Matte Axis Grey Metallic",
          colorHex: "#5A5A5A",
          stockQuantity: 0,
          availabilityStatus: "Out of Stock",
          expectedDeliveryDays: 15
        }
      ]
    },
    {
      variantId: "V2",
      variantName: "Deluxe",
      brakeType: "Disc",
      wheelType: "Alloy",
      hasBluetoothConnectivity: true,
      exShowroomPrice: 78216,
      availableColors: [...]
    }
  ],
  
  specifications: {
    engine: {
      type: "4-Stroke, SI Engine",
      displacement: "109.51 cc",
      maxPower: "7.73 bhp @ 8000 rpm",
      maxTorque: "8.90 Nm @ 5250 rpm",
      cooling: "Fan Cooled"
    },
    transmission: "Automatic",
    mileage: "60 kmpl",
    fuelCapacity: "5.3 Liters",
    dimensions: {
      length: "1833 mm",
      width: "740 mm",
      height: "1156 mm",
      wheelbase: "1287 mm",
      groundClearance: "171 mm",
      kerbWeight: "107 kg"
    },
    brakes: {
      front: "Drum / 130mm Disc",
      rear: "130mm Drum"
    },
    suspension: {
      front: "Telescopic",
      rear: "Spring Loaded Hydraulic"
    },
    tyres: {
      front: "90/90-12",
      rear: "90/100-10"
    },
    features: [
      "LED Headlamp",
      "Digital Instrument Cluster",
      "Mobile Charging Port",
      "External Fuel Filler",
      "18-Liter Under Seat Storage"
    ],
    warranty: "3 Years / 30,000 km"
  },
  
  media: {
    primaryImage: "/images/activa6g-main.jpg",
    images: [
      "/images/activa6g-front.jpg",
      "/images/activa6g-side.jpg",
      "/images/activa6g-rear.jpg",
      "/images/activa6g-dashboard.jpg"
    ],
    brochureUrl: "/brochures/activa6g.pdf",
    videoUrl: "https://youtube.com/..."
  },
  
  isActive: true,
  createdAt: "2025-01-10",
  updatedAt: "2025-01-13"
}
```

#### **Inquiry Schema:**
```javascript
{
  inquiryId: "SH-INQ-2025-0001",
  showroomId: "SH001",
  
  customer: {
    name: "Amit Kumar",
    mobile: "+91-9876543210",
    email: "amit.kumar@email.com",
    alternateContact: "",
    city: "Patna",
    address: ""
  },
  
  vehicleInterest: {
    modelId: "HON-ACT6G-001",
    modelName: "Activa 6G",
    variantId: "V2",
    variantName: "Deluxe",
    preferredColors: ["C1", "C3"],
    budgetRange: "60-80k"
  },
  
  purchaseTimeline: "Within 1 month",
  requiresExchange: false,
  exchangeVehicleDetails: null,
  requiresFinance: false,
  interestedInTestRide: true,
  preferredTestRideDate: "2025-01-20",
  additionalComments: "Need urgent delivery",
  source: "Website",
  
  status: "New",
  assignedTo: null,
  priority: "Medium",
  leadScore: 75,
  
  activities: [
    {
      activityId: "A1",
      type: "Inquiry Created",
      date: "2025-01-13T10:30:00Z",
      notes: "Customer submitted inquiry via website",
      createdBy: "System"
    }
  ],
  
  tasks: [],
  communications: [],
  
  createdAt: "2025-01-13T10:30:00Z",
  updatedAt: "2025-01-13T10:30:00Z"
}
```

#### **Booking Schema:**
```javascript
{
  bookingId: "SH-BK-2025-0001",
  showroomId: "SH001",
  inquiryId: "SH-INQ-2025-0001", // Reference to original inquiry
  
  customer: {
    name: "Amit Kumar",
    mobile: "+91-9876543210",
    email: "amit.kumar@email.com",
    address: {
      street: "Ashok Nagar",
      city: "Patna",
      state: "Bihar",
      pincode: "800025"
    },
    emergencyContact: "+91-9876543211"
  },
  
  vehicle: {
    modelId: "HON-ACT6G-001",
    modelName: "Activa 6G",
    variantId: "V2",
    variantName: "Deluxe",
    colorId: "C1",
    colorName: "Pearl Precious White",
    chassisNumber: null, // Assigned later
    engineNumber: null // Assigned later
  },
  
  accessories: [
    {
      accessoryId: "ACC001",
      name: "Body Cover",
      price: 400,
      gst: 18,
      totalPrice:472
},
{
accessoryId: "ACC015",
name: "Mobile Holder",
price: 300,
gst: 18,
totalPrice: 354
}
],
pricing: {
exShowroomPrice: 78216,
rtoCharges: {
  registrationFee: 300,
  roadTax: 4500,
  smartCard: 200,
  numberPlate: 400,
  hypothecation: 0,
  total: 5400
},

insurance: {
  thirdParty: 1500,
  comprehensive: 2800,
  personalAccident: 750,
  zeroDepreciation: 0,
  total: 5050
},

accessories: {
  items: 700,
  gst: 126,
  fitting: 100,
  total: 926
},

otherCharges: {
  fastag: 200,
  extendedWarranty: 0,
  amc: 0,
  documentation: 500,
  total: 700
},
onRoadPrice: 90292,
discount: 0,
finalAmount: 90292},
payment: {
bookingAmount: 5000,
balanceAmount: 85292,
transactions: [
  {
    transactionId: "TXN001",
    type: "Booking",
    amount: 5000,
    method: "UPI",
    status: "Success",
    date: "2025-01-13T14:00:00Z",
    receiptUrl: "/receipts/TXN001.pdf"
  }
],

totalPaid: 5000,
totalPending: 85292},
documents: {
aadharCard: { uploaded: false, verified: false, url: null },
addressProof: { uploaded: false, verified: false, url: null },
photos: { uploaded: false, verified: false, url: null },
form20: { uploaded: false, verified: false, url: null },
form21: { uploaded: false, verified: false, url: null }
},
status: "Confirmed",
assignedTo: "SE001",
preferredDeliveryDate: "2025-01-25",
expectedDeliveryDate: "2025-01-25",
actualDeliveryDate: null,
specialInstructions: "Customer needs home delivery",
statusHistory: [
{
status: "Pending",
date: "2025-01-13T13:45:00Z",
updatedBy: "System"
},
{
status: "Confirmed",
date: "2025-01-13T14:00:00Z",
updatedBy: "System",
notes: "Payment received"
}
],
activityLog: [],
createdAt: "2025-01-13T13:45:00Z",
updatedAt: "2025-01-13T14:00:00Z"
}
---

### **13. Key Functionalities to Implement**

#### **A. Real-time Stock Updates**
- When booking is confirmed, reduce stock count
- Show "Only X units left" on product pages
- Alert admin when stock falls below threshold (e.g., 2 units)
- Prevent booking if color is out of stock

- **Staff Notifications:**
  - New inquiry alert
  - New booking alert
  - Payment received alert
  - Document uploaded for verification
  - Task reminders
  - Low stock alerts

#### **C. PDF Generation**
- **Quotation PDF:**
  - Showroom branding
  - Vehicle details with image
  - Complete price breakdown
  - Validity period
  - Terms & conditions
  
- **Booking Confirmation PDF:**
  - Booking ID and date
  - Customer details
  - Vehicle configuration
  - Price summary
  - Payment details
  - Next steps

- **Payment Receipt:**
  - Receipt number
  - Transaction details
  - Amount breakdown
  - GST details
  - Showroom signature/seal

#### **D. Excel/CSV Export**
- Export inquiry list
- Export booking list
- Export sales report
- Export payment report
- Configurable columns

#### **E. WhatsApp Integration**
- Send booking confirmation
- Send payment reminders
- Share quotations
- Send delivery updates
- Quick customer support

---

### **14. Performance & Optimization Requirements**

- **Fast Page Load:** < 2 seconds initial load
- **Optimized Images:** Use WebP format, lazy loading
- **Code Splitting:** Split bundles for faster loading
- **Caching Strategy:** Cache vehicle data, images
- **Debounced Search:** Avoid excessive API calls
- **Pagination:** Show 10-20 items per page
- **Infinite Scroll:** For mobile product listing
- **Skeleton Loading:** Show skeleton while data loads

---

### **15. Accessibility Requirements**

- **Keyboard Navigation:** All interactive elements accessible via keyboard
- **Screen Reader Support:** Proper ARIA labels
- **Color Contrast:** WCAG AA compliance (4.5:1 ratio)
- **Focus Indicators:** Clear focus states
- **Alt Text:** All images have descriptive alt text
- **Form Labels:** All inputs properly labeled
- **Error Messages:** Clear, descriptive error messages
- **Responsive Text:** Minimum 16px body text

---

### **16. Testing Checklist**

- [ ] Vehicle catalog loads correctly
- [ ] Filters and search work properly
- [ ] Color selection updates price
- [ ] Accessory selection updates price
- [ ] Price calculator shows correct totals
- [ ] Inquiry form validation works
- [ ] Inquiry submission creates record
- [ ] Staff Email notifications sent
- [ ] Lead status updates correctly
- [ ] Booking flow completes successfully
- [ ] Payment integration works
- [ ] Stock updates after booking
- [ ] PDF generation works
- [ ] Document upload functions
- [ ] Role-based access enforced
- [ ] Mobile responsive design
- [ ] Cross-browser compatibility
- [ ] Performance benchmarks met

---

### **17. Development Priority Order**

**Week 1-2: Foundation**
1. Multi-showroom configuration system
2. Authentication & user roles
3. Database schema setup
4. Basic UI components library

**Week 3-4: Vehicle Catalog**
1. Vehicle model management
2. Variant and color system
3. Specifications display
4. Image gallery
5. Search and filters
6. Price calculator widget

**Week 5-6: Inquiry System**
1. Inquiry form
2. Lead management dashboard
3. Status pipeline
4. Communication log
5. Task management
6. Lead assignment

**Week 7-8: Booking System**
1. Booking flow
2. Accessory selection
3. Payment integration
4. Booking dashboard
5. Status management
6. Document upload

**Week 9-10: Notifications & Reports**
1. Staff Email notifications
2. WhatsApp integration
3. PDF generation
4. Basic reports
5. Admin dashboard
6. Testing & bug fixes
