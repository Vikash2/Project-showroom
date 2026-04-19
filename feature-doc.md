# Vehicle Showroom Management System — Feature Documentation

**Product:** Multi-Showroom Vehicle Management System (VMS)  
**Stack:** React 19 + TypeScript, React Router v7, Tailwind CSS v4, Framer Motion  
**State:** React Context API + localStorage persistence  
**Status:** Frontend-only (no backend; all data is in-memory / localStorage)

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [Showroom Network](#2-showroom-network)
3. [Route Map](#3-route-map)
4. [Authentication & Authorization](#4-authentication--authorization)
5. [Public Features](#5-public-features)
6. [Admin Features](#6-admin-features)
7. [Data Models](#7-data-models)
8. [State Management](#8-state-management)
9. [UI/UX System](#9-uiux-system)
10. [Known Limitations](#10-known-limitations)

---

## 1. System Overview

A web-based Vehicle Management System built for a network of Honda 2-wheeler dealerships. It serves two audiences:

- **Public / Customers** — browse vehicles, submit inquiries, and book vehicles online
- **Showroom Staff / Admin** — manage leads, bookings, vehicles, accessories, and reports

The system supports multiple showroom branches under a single deployment, with each branch having its own branding, contact details, and configuration.

---

## 2. Showroom Network

Four showrooms are configured as constants:

| ID     | Name                    | City   | State     | Brand |
|--------|-------------------------|--------|-----------|-------|
| SH001  | Sandhya Honda           | Patna  | Bihar     | Honda |
| SH002  | Monka Honda             | —      | —         | Honda |
| SH003  | Dua Honda               | —      | —         | Honda |
| SH004  | Sandhya Honda Bokaro    | Bokaro | Jharkhand | Honda |

**Active Showroom Selection:**
- On first visit, the system attempts geolocation-based auto-detection to select the nearest showroom
- Users can manually switch showrooms via the `ShowroomSelector` dropdown in the Navbar
- The active showroom drives all branding (colors, name, tagline), contact info, and working hours displayed across the entire UI

---

## 3. Route Map

### Public Routes (no auth required)

| Route       | Component         | Description                                      |
|-------------|-------------------|--------------------------------------------------|
| `/`         | `LandingPage`     | Hero section, vehicle showcase, inquiry form, footer |
| `/vehicles` | `VehicleCatalog`  | Full vehicle catalog with filters and sorting    |
| `/login`    | `LoginPage`       | Staff login portal (email + password)            |
| `*`         | `NotFound`        | 404 catch-all page                               |

### Protected Routes (login required)

| Route                  | Component              | Allowed Roles                                                                 |
|------------------------|------------------------|-------------------------------------------------------------------------------|
| `/book`                | `BookingFlow`          | Super Admin, Showroom Manager, Sales Executive, Accountant, Documentation Officer, Customer |
| `/admin`               | `AdminLayout`          | Super Admin, Showroom Manager, Sales Executive, Accountant, Documentation Officer |
| `/admin` (index)       | `AdminDashboard`       | (inherits from `/admin`)                                                      |
| `/admin/showrooms`     | `ShowroomManagement`   | (inherits from `/admin`)                                                      |
| `/admin/vehicles`      | `VehicleManagement`    | (inherits from `/admin`)                                                      |
| `/admin/leads`         | `LeadsManagement`      | (inherits from `/admin`)                                                      |
| `/admin/bookings`      | `BookingManagement`    | (inherits from `/admin`)                                                      |
| `/admin/bookings/new`  | `BookingFlow`          | (inherits from `/admin`)                                                      |
| `/admin/accessories`   | `AccessoriesManagement`| (inherits from `/admin`)                                                      |
| `/admin/reports`       | `ShowroomReports`      | (inherits from `/admin`)                                                      |
| `/admin/settings`      | Placeholder            | (inherits from `/admin`) — Coming Soon                                        |
| `/admin/*`             | `NotFound`             | 404 within admin                                                              |

**Route behavior:**
- Unauthenticated users hitting any protected route are redirected to `/login`, with the original destination saved in `location.state.from` for post-login redirect
- Authenticated users without the required role are redirected to `/admin` (root dashboard)
- The Navbar and Footer are hidden on all `/admin/*` routes

---

## 4. Authentication & Authorization

### Login Flow

1. User submits email + password on `/login`
2. `AuthContext.loginWithEmail()` validates against a hardcoded dummy user list
3. On success, `userId` and a 4-hour expiry timestamp are saved to `localStorage` under `auth_data`
4. On subsequent page loads, the session is restored from localStorage; expired sessions are cleared automatically with a toast notification
5. Logout clears `auth_data` from localStorage and resets auth state

### Demo Credentials

| Role                  | Email                          | Password (any ≥3 chars) |
|-----------------------|--------------------------------|--------------------------|
| Super Admin           | admin@system.com               | any                      |
| Showroom Manager      | manager@sandhyahonda.com       | any                      |
| Sales Executive       | sales1@sandhyahonda.com        | any                      |
| Accountant            | accounts@sandhyahonda.com      | any                      |
| Documentation Officer | docs@sandhyahonda.com          | any                      |

> Note: Password validation only checks length (≥3 chars). Any password works for demo users.

### Role Definitions

| Role                  | Context        | Description                                              |
|-----------------------|----------------|----------------------------------------------------------|
| Super Admin           | System         | Full access across all showrooms                         |
| Showroom Manager      | Showroom Staff | Manages local branch operations                          |
| Sales Executive       | Showroom Staff | Handles inquiries, test rides, bookings                  |
| Accountant            | Showroom Staff | Tracks payments and financial records                    |
| Documentation Officer | Showroom Staff | Manages document verification and RTO processing         |
| Customer              | Public         | Can access the booking flow only                         |

### ProtectedRoute Component

`ProtectedRoute` wraps any route that requires authentication. It:
- Shows a branded loading spinner while `isLoading` is true
- Redirects to `/login` if not authenticated
- Redirects to `/admin` if authenticated but role is not in `allowedRoles`
- Renders children if all checks pass

---

## 5. Public Features

### 5.1 Landing Page (`/`)

The landing page is composed of three sections:

**Hero Section**
- Full-screen animated hero with showroom branding
- CTA buttons linking to `/vehicles` and `#inquiry`
- Animated entrance via Framer Motion

**Vehicle Showcase**
- Displays all vehicles from `VehicleContext` in a 4-column grid
- Each card shows model image, category, starting ex-showroom price, and key specs (mileage, engine, weight)
- "View Full Catalog" CTA links to `/vehicles`

**Inquiry Form Section**
- Split layout: value propositions on the left, `InquiryForm` component on the right
- Value props: Instant Quotation, Priority Test Ride, Maximum Exchange Value

**Footer**
- Dynamically populated from `activeShowroom` data
- Shows address, phone, email, working hours, quick links, and social icons

### 5.2 Vehicle Catalog (`/vehicles`)

A filterable, sortable catalog of all vehicles.

**Filters (sidebar):**
- Category: All / Scooter / Motorcycle
- Max Price: range slider from ₹50K to ₹3L+
- Must-Have Features: ABS, CBS, LED Lights, Bluetooth, USB Charging, Digital Console (checkbox multi-select)

**Sort options:**
- Price: Low to High
- Price: High to Low
- Mileage: High to Low
- Newest

**Behavior:**
- Filters are applied in real-time via `useMemo`
- On mobile, filters open as a right-side overlay panel
- Empty state shown when no vehicles match filters, with a "Clear all filters" link

### 5.3 Inquiry Form (Component — used on landing page and in Leads Management)

A reusable form for capturing customer inquiries. Fields:
- Full Name, Mobile Number, City
- Vehicle of Interest (model name, variant, color)
- Purchase Timeline (Immediate / Within 1 month / 1–3 months / 3–6 months / Just exploring)
- Exchange Required (toggle)
- Finance Required (toggle)
- Test Ride Requested (toggle)
- Lead Source (Website, Facebook, Instagram, Google, Walk-in, Reference, Phone, Others)

On submission, a new `Inquiry` record is added to `InquiryContext`.

### 5.4 Booking Flow (`/book`)

A 4-step guided booking process. Requires login (any role including Customer).

**Step 1 — Vehicle Selection**
- Choose Model: card grid of all available vehicles with images
- Choose Variant: cards showing variant name and ex-showroom price
- Choose Color: color swatches with stock status; out-of-stock colors are visually indicated

**Step 2 — Accessories**
- Lists all in-stock accessories from `AccessoryContext`
- Each item shows category icon, name, description, price, and installation charges
- Toggle selection; selected items are highlighted

**Step 3 — Customer Information**
- Fields: Full Name (required), Mobile Number (required), Email, Complete Address (required)
- "Create Booking & Pay ₹5,000" button is disabled until required fields are filled

**Step 4 — Confirmation**
- Displays generated Booking ID, selected vehicle, and variant
- Options to view/download the booking receipt (print template) or navigate to `/admin/bookings`

**Live Pricing Widget (sticky sidebar, steps 1–3)**
- Updates in real-time as selections are made
- Shows: Ex-Showroom, RTO & Registration (with hover tooltip breakdown), Insurance (with hover tooltip), Other Charges, Accessories total
- Displays Total On-Road Price and Booking Amount (₹5,000)

**On booking creation:**
- A `Booking` record is added to `BookingContext` with status `Pending`
- A payment record of ₹5,000 (UPI) is automatically added
- Stock quantity for the selected color is decremented in `VehicleContext`

---

## 6. Admin Features

All admin pages are nested under `/admin` and require staff-level authentication.

### 6.1 Admin Layout

- Fixed sidebar navigation on desktop; overlay drawer on mobile
- Sidebar links: Dashboard, Showrooms, Vehicles, Leads, Bookings, Accessories, Reports, Settings
- Header: global search bar, theme toggle, user info, logout button
- Active route is highlighted in the sidebar

### 6.2 Dashboard (`/admin`)

Real-time KPI overview derived from live context data.

**Metric Cards:**
- Active Leads (inquiries not in Closed status)
- Hot Leads (status: Hot Lead or Test Ride Scheduled)
- Active Bookings (not Delivered or Cancelled)
- Pending Payments (bookings with `balanceDue > 0`)
- Total Revenue (sum of `bookingAmountPaid` across all bookings)

**Low Stock Alerts:**
- Lists vehicle color variants with stock ≤ 3 units
- Shows model, variant, color, and current stock count

**Recent Activity Feed:**
- Merged and time-sorted list of recent inquiries and booking updates (latest 6 items)

**Lead Source Breakdown:**
- Visual breakdown of inquiry sources (Website, Walk-in, Social, etc.)

### 6.3 Leads Management (`/admin/leads`)

Full CRM-style lead management.

**Filtering:**
- Search by name, inquiry ID, or mobile number
- Filter by Status, Source, Purchase Timeline, Date range

**Lead Statuses (pipeline):**
New → Contacted → Follow-up → Test Ride Scheduled → Hot Lead → Quotation Sent → Booking Done → Lost → Closed

**Lead Detail Modal:**
- Full customer and vehicle interest details
- Priority badge (High / Medium / Low) with color coding
- Communication log: timestamped entries for Call, Email, WhatsApp, SMS, Meeting, Note
- Add new log entry inline
- Update lead status via dropdown
- Generate and print Quotation document

**New Lead:**
- Opens the `InquiryForm` component in a modal overlay

**Quotation Template:**
- Printable quotation document generated from lead data and vehicle pricing

### 6.4 Booking Management (`/admin/bookings`)

End-to-end booking lifecycle management.

**Filtering:**
- Search by customer name, booking ID, or mobile
- Filter by Status, Payment status (Fully Paid / Pending), Vehicle model, Date range

**Booking Statuses (workflow):**
Pending → Confirmed → Documentation In-Progress → Stock Allocated → Payment Pending → Payment Complete → RTO Processing → PDI Scheduled → Ready for Delivery → Delivered → Cancelled

**Booking Detail Modal:**
- Customer info, vehicle config (model, variant, color)
- Pricing breakdown (ex-showroom, RTO, insurance, accessories, on-road total)
- Payment records table (date, amount, method, reference, type)
- Document verification checklist:
  - Aadhar Card: Pending / Uploaded / Verified / Rejected
  - Address Proof: Pending / Uploaded / Verified / Rejected
  - Passport Photos: Pending / Uploaded / Verified / Rejected
- Update booking status
- Update individual document statuses
- Print booking receipt (Booking Summary Template)

**New Booking:**
- "New Booking" button navigates to `/admin/bookings/new` (BookingFlow)

### 6.5 Vehicle Management (`/admin/vehicles`)

Catalog management for all vehicles.

**List View:**
- Table with vehicle image, brand + model, engine spec, category badge, variant count, starting price
- Search by model name or category
- Delete vehicle (with confirmation)
- Edit button (UI present, full edit modal not yet implemented)

**Add Vehicle Modal:**
A comprehensive form with three sections:

1. Basic Information: Brand, Model, Category (Scooter / Motorcycle / Electric), Image URL, Description, Launch Year
2. Specifications: Engine, Mileage, Weight, Max Power, Max Torque, Transmission, Fuel Capacity, Dimensions, Brakes, Tyres, Suspension, Key Features (comma-separated), Warranty
3. Base Variant & Pricing: Variant Name, Brake Type, Wheel Type, Connected Features toggle, Ex-Showroom Price, RTO Charges (Road Tax, Reg Fee, Smart Card, Number Plate), Insurance (Third Party, Comprehensive, PA Cover, Zero Dep), Other Charges (FASTag, Extended Warranty, AMC, Documentation)

On save, on-road price is auto-calculated as the sum of all charge components.

### 6.6 Accessories Management (`/admin/accessories`)

Catalog management for genuine accessories.

**List View:**
- Card grid with category icon, name, category badge, description, price + installation charges, stock status badge
- Filter by category: All / Safety / Protection / Convenience / Aesthetics / Style
- Search by name or description

**Add / Edit Modal:**
- Fields: Name, Price (₹), Fitting Fee (₹), Category, Stock Status (In Stock / Out of Stock toggle), Description
- Same modal used for both add and edit operations

**Delete:**
- Confirmation dialog before deletion

### 6.7 Showroom Management (`/admin/showrooms`)

Branch configuration management.

**List View:**
- Card for each showroom showing: logo initial, name, Authorized badge, phone, email, city/state, working hours, primary brand color, showroom ID
- "Currently Active View" badge on the active showroom

**Edit Slide-over Panel:**
- Identity: Showroom Name, Tagline
- Aesthetic Settings: Primary Brand Color (color picker + hex input)
- Communication: Phone, Email
- Save / Discard actions

> Note: Changes are currently toast-only (no persistence to context or backend).

### 6.8 Reports (`/admin/reports`)

Business intelligence dashboard.

**Tabs:** Sales Performance | Lead ROI | Stock Health

**KPI Cards:**
- Gross Revenue (₹ in Lakhs)
- Total Conversions (booking count + conversion rate %)
- Average Transaction Value (₹K)

**Model-wise Sales Chart:**
- Horizontal bar chart showing units sold per vehicle model
- Dropdown to switch between Quantity Sold and Revenue Share views

**Goal Completion Gauge:**
- SVG circular progress chart showing % of ₹25L monthly revenue target achieved

**Export:**
- "Export Data" button generates and downloads a CSV file of bookings or leads data

---

## 7. Data Models

### Vehicle

```
Vehicle
├── id, brand, model, category (Scooter | Motorcycle | Electric)
├── launchYear, description, image
├── mediaAssets: { images[], view360Url, brochurePdfUrl, videoUrls[] }
├── specs: { engine, mileage, weight, maxPower, maxTorque, transmission,
│            fuelCapacity, dimensions, brakes, tyres, suspension,
│            features[], warranty }
└── variants[]: {
      id, name, brakeType, wheelType, connectedFeatures,
      colors[]: { name, hexCode, status, stockQuantity, expectedDelivery },
      pricing: { exShowroomPrice, rtoCharges, insurance, otherCharges, onRoadPrice }
    }
```

### Booking

```
Booking
├── id (format: SH-BK-YYYY-NNN), date
├── customer: { fullName, mobile, email, address, emergencyContact }
├── vehicleConfig: { modelId, variantId, colorName }
├── selectedAccessories: string[] (Accessory IDs)
├── pricing: { exShowroom, rtoTotal, insuranceTotal, accessoriesTotal, otherChargesTotal, onRoadPrice }
├── payments[]: { id, date, amount, method, referenceNumber, type }
├── bookingAmountPaid, balanceDue
├── status: Pending | Confirmed | Documentation In-Progress | Stock Allocated |
│           Payment Pending | Payment Complete | RTO Processing |
│           PDI Scheduled | Ready for Delivery | Delivered | Cancelled
├── documents: { aadharCard, addressProof, passportPhotos }
│              each: Pending | Uploaded | Verified | Rejected
├── assignedTo, chassisNumber, cancellationReason
└── preferredDeliveryDate, specialInstructions
```

### Inquiry (Lead)

```
Inquiry
├── id, date
├── customer: { fullName, mobileNumber, email, city }
├── interest: { modelId, modelName, variantName, colorName }
├── timeline: Immediate | Within 1 month | 1-3 months | 3-6 months | Just exploring
├── exchangeRequired, financeRequired, testRideRequested
├── source: Website | Facebook | Instagram | Google | Walk-in | Reference | Phone | Others
├── status: New | Contacted | Follow-up | Test Ride Scheduled | Hot Lead |
│           Quotation Sent | Booking Done | Lost | Closed
├── priority: High | Medium | Low
├── assignedTo
├── tasks[]: { id, type, dueDate, notes, status }
└── history[]: { id, timestamp, type, summary, author }
```

### Accessory

```
Accessory
├── id, name, description
├── category: Safety | Protection | Convenience | Aesthetics
├── price, installationCharges
├── inStock, compatibleModels[]
```

### User

```
User
├── id, fullName, email, mobile
├── role: Super Admin | Showroom Manager | Sales Executive | Accountant | Documentation Officer | Customer
└── showroomId (null for Super Admin and Customer)
```

---

## 8. State Management

All state is managed via React Context API. Each context persists to `localStorage` where applicable.

| Context           | Persists | Responsibilities                                                    |
|-------------------|----------|---------------------------------------------------------------------|
| `AuthContext`     | Yes      | User session, login/logout, role checking, 4-hour session expiry   |
| `ShowroomContext` | No       | Active showroom selection, all showrooms list, geolocation detect  |
| `VehicleContext`  | No       | Vehicle catalog, add/delete vehicles, stock decrement on booking   |
| `BookingContext`  | Yes      | Booking CRUD, status updates, payment records, document status     |
| `InquiryContext`  | No       | Lead CRUD, status updates, communication log, task management      |
| `AccessoryContext`| No       | Accessory CRUD                                                      |
| `ThemeContext`    | Yes      | Dark / Light / System theme, CSS variable injection                |

A Redux store (`@reduxjs/toolkit`) is configured but currently empty — intended for future API integration.

---

## 9. UI/UX System

**Theme System:**
- Three modes: Light, Dark, System (follows OS preference)
- Implemented via CSS custom properties (`--bg-primary`, `--text-primary`, etc.) set on `<html data-theme="...">` 
- FOUC prevention: a blocking inline script in `index.html` applies the theme before React hydrates

**Design Tokens (CSS variables):**
- Background layers: `--bg-primary`, `--bg-secondary`, `--bg-tertiary`
- Text: `--text-primary`, `--text-secondary`, `--text-muted`
- Borders, cards, hover states, selection states, modal overlays

**Animations:**
- Page transitions and section reveals via Framer Motion (`whileInView`, `initial/animate`)
- Modal entrances: `animate-in slide-in-from-right`, `zoom-in`, `fade-in`
- Micro-interactions: hover scale on cards, rotate on logo, translate on arrows

**Responsive Breakpoints:**
- Mobile-first with Tailwind breakpoints (`md:`, `lg:`)
- Admin sidebar: fixed on desktop, overlay drawer on mobile
- Vehicle catalog filters: sidebar on desktop, bottom sheet on mobile
- Booking flow: stacked on mobile, side-by-side with pricing widget on desktop

**Notifications:**
- `react-hot-toast` for success/error feedback (bottom-right position)

**Print Templates (`DocumentTemplates.tsx`):**
- `QuotationTemplate`: formatted quotation for leads, triggered from Leads Management
- `BookingSummaryTemplate`: booking receipt with full pricing breakdown, triggered from Booking Flow and Booking Management

---

## 10. Known Limitations

| Area                  | Status / Note                                                        |
|-----------------------|----------------------------------------------------------------------|
| Backend / API         | None — all data is in-memory or localStorage                         |
| Authentication        | Dummy only — no real password validation, no JWT, no refresh tokens  |
| Image Upload          | Not implemented — image URLs must be entered manually                |
| Reports               | Data is real-time from context; no historical data or date filtering |
| Settings Page         | Placeholder only — "Coming Soon"                                     |
| Showroom Edit Save    | Toast feedback only — changes do not persist to context              |
| Vehicle Edit          | Edit button present in UI but full edit modal not implemented        |
| Geolocation           | Mock implementation — may not accurately detect nearest showroom     |
| Notifications         | No email, SMS, or push notification integration                      |
| Payment Gateway       | No real payment processing — ₹5,000 booking amount is simulated      |
| Document Upload       | Status can be updated but no actual file upload UI exists            |
| Redux Store           | Configured but unused — placeholder for future API layer             |
| Multi-tenancy         | Showroom filtering in admin not enforced — all staff see all data    |
