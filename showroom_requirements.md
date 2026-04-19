# Multi-Showroom Vehicle Management System
## Complete Requirements & Technical Specifications

---

## Table of Contents
1. [Project Overview](#project-overview)
2. [Business Requirements](#business-requirements)
3. [System Architecture](#system-architecture)
4. [Technical Stack](#technical-stack)
5. [Functional Requirements](#functional-requirements)
6. [Non-Functional Requirements](#non-functional-requirements)
7. [Data Models](#data-models)
8. [API Specifications](#api-specifications)
9. [Security Requirements](#security-requirements)
10. [Deployment Requirements](#deployment-requirements)

---

## 1. Project Overview

### 1.1 Purpose
Build a comprehensive, configurable multi-showroom vehicle management system that handles the complete customer journey from inquiry to delivery for 2-wheeler showrooms (extensible to 4-wheelers).

### 1.2 Scope
- Multi-showroom support with independent branding and configuration
- Complete vehicle catalog with variants and colors
- Inquiry and lead management system
- Booking and reservation system
- Indian taxation compliance (GST, RTO, Insurance)
- Document management
- Payment processing
- Sales workflow automation
- Analytics and reporting

### 1.3 Initial Showroom
**Sandhya Honda** - Honda 2-wheeler dealership in Patna, Bihar

### 1.4 Target Users
- Customers (vehicle buyers)
- Sales Executives
- Showroom Managers
- Accountants
- Documentation Officers
- Super Admins

---

## 2. Business Requirements

### 2.1 Core Business Processes

#### 2.1.1 Customer Journey
```
Inquiry → Follow-up → Test Ride → Quotation → Booking → 
Documentation → Payment → Registration → Delivery → Post-Sales
```

#### 2.1.2 Sales Pipeline Stages
1. New Inquiry
2. Contacted
3. Follow-up Required
4. Test Ride Scheduled
5. Hot Lead
6. Quotation Sent
7. Booking Confirmed
8. Documentation In-Progress
9. Payment Complete
10. Ready for Delivery
11. Delivered
12. Lost/Cancelled

### 2.2 Key Business Rules

#### 2.2.1 Pricing Rules
- Ex-showroom price varies by variant
- RTO charges are state-specific
- Insurance is mandatory (Third-party minimum)
- GST: 28% on vehicles, 18% on accessories
- Booking amount: ₹5,000 - ₹20,000 (configurable)
- Maximum discount requires manager approval

#### 2.2.2 Stock Management Rules
- Stock allocated on booking confirmation
- Out-of-stock colors can be booked with extended delivery timeline
- Low stock alert at 2 units
- Stock reservation valid for 7 days after booking

#### 2.2.3 Cancellation Policy
- Within 7 days: 100% refund
- Within 15 days: 75% refund
- After 15 days: 50% refund
- After dispatch: No refund

### 2.3 Compliance Requirements

#### 2.3.1 Indian Taxation
- GST compliance with HSN codes
- State-wise RTO charge calculation
- IRDAI insurance rates
- TDS deduction where applicable
- Proper invoice format with all statutory details

#### 2.3.2 RTO Requirements
- Form 20 (Application for registration)
- Form 21 (Sale certificate)
- Form 22 (Road worthiness certificate)
- Insurance certificate
- PUC certificate
- Proper documentation as per Motor Vehicles Act

#### 2.3.3 Data Privacy
- GDPR/Data Protection compliance
- Customer data encryption
- Secure document storage
- Right to data deletion
- Consent management

---

## 3. System Architecture

### 3.1 Architecture Pattern
**Client-Server Architecture** with RESTful API

```
┌─────────────────────────────────────┐
│         Frontend (React)            │
│  - Customer Portal                  │
│  - Admin Dashboard                  │
│  - Sales Executive Interface        │
└──────────────┬──────────────────────┘
               │ HTTPS/REST API
┌──────────────▼──────────────────────┐
│      Backend API (Node.js)          │
│  - Authentication Service           │
│  - Showroom Service                 │
│  - Vehicle Service                  │
│  - Inquiry Service                  │
│  - Booking Service                  │
│  - Payment Service                  │
│  - Notification Service             │
└──────────────┬──────────────────────┘
               │
    ┌──────────┼──────────┐
    │          │          │
┌───▼──┐  ┌───▼───┐  ┌──▼────┐
│ DB   │  │ File  │  │ Cache │
│(SQL) │  │Storage│  │(Redis)│
└──────┘  └───────┘  └───────┘
```

### 3.2 Microservices Breakdown (Future)
- Authentication Service
- Showroom Management Service
- Vehicle Catalog Service
- Inquiry Management Service
- Booking Service
- Payment Service
- Notification Service
- Document Service
- Reporting Service

### 3.3 Database Design
**Primary Database:** PostgreSQL or MySQL

**Schema Overview:**
- Showrooms
- Users & Roles
- Vehicles (Brands, Models, Variants, Colors)
- Accessories
- Inquiries
- Bookings
- Payments
- Documents
- Notifications
- Audit Logs

---

## 4. Technical Stack

### 4.1 Frontend Stack

#### 4.1.1 Core Technologies
- **Framework:** React 18+
- **Language:** JavaScript/TypeScript
- **Styling:** Tailwind CSS 3+
- **Build Tool:** Vite or Create React App

#### 4.1.2 State Management
- **Global State:** Redux Toolkit or Zustand
- **Server State:** React Query / TanStack Query
- **Form State:** React Hook Form

#### 4.1.3 Routing
- React Router v6

#### 4.1.4 UI Component Libraries
- Headless UI (for accessible components)
- Radix UI (alternative)
- Custom components with Tailwind

#### 4.1.5 Additional Libraries
```json
{
  "lucide-react": "^0.263.1",      // Icons
  "recharts": "^2.5.0",            // Charts
  "date-fns": "^2.30.0",           // Date manipulation
  "react-datepicker": "^4.16.0",   // Date picker
  "react-dropzone": "^14.2.3",     // File upload
  "jspdf": "^2.5.1",               // PDF generation
  "react-to-print": "^2.14.13",    // Print functionality
  "axios": "^1.4.0",               // HTTP client
  "react-hot-toast": "^2.4.1",     // Notifications
  "framer-motion": "^10.12.16",    // Animations
  "zod": "^3.21.4",                // Schema validation
  "clsx": "^1.2.1",                // Class names utility
  "tailwind-merge": "^1.13.2"      // Tailwind class merging
}
```

### 4.2 Backend Stack (Recommended)

#### 4.2.1 Core Technologies
- **Runtime:** Node.js 18+ LTS
- **Framework:** Express.js or NestJS
- **Language:** TypeScript
- **API Style:** RESTful

#### 4.2.2 Database
- **Primary:** PostgreSQL 14+ or MySQL 8+
- **ORM:** Prisma or TypeORM
- **Caching:** Redis
- **Search:** Elasticsearch (optional, for advanced search)

#### 4.2.3 Authentication & Security
- **Authentication:** JWT (JSON Web Tokens)
- **Password Hashing:** bcrypt
- **Rate Limiting:** express-rate-limit
- **Security:** helmet, cors
- **Validation:** Joi or Zod

#### 4.2.4 File Storage
- **Cloud Storage:** AWS S3 or Google Cloud Storage
- **Local Storage:** Multer (for development)

#### 4.2.5 Communication
- **Email:** Nodemailer with SMTP or SendGrid
- **SMS:** Twilio or MSG91
- **WhatsApp:** Twilio API or WhatsApp Business API

#### 4.2.6 Payment Gateway
- Razorpay
- PayU
- Paytm
- Stripe (international)

#### 4.2.7 Additional Backend Libraries
```json
{
  "express": "^4.18.2",
  "prisma": "^4.15.0",
  "jsonwebtoken": "^9.0.0",
  "bcrypt": "^5.1.0",
  "multer": "^1.4.5-lts.1",
  "pdfkit": "^0.13.0",
  "nodemailer": "^6.9.3",
  "winston": "^3.9.0",            // Logging
  "joi": "^17.9.2",
  "dotenv": "^16.1.4",
  "cors": "^2.8.5",
  "helmet": "^7.0.0"
}
```

### 4.3 DevOps & Deployment

#### 4.3.1 Version Control
- Git
- GitHub/GitLab/Bitbucket

#### 4.3.2 CI/CD
- GitHub Actions
- GitLab CI
- Jenkins

#### 4.3.3 Containerization
- Docker
- Docker Compose

#### 4.3.4 Hosting Options
- **Frontend:** Vercel, Netlify, AWS Amplify
- **Backend:** AWS EC2, DigitalOcean, Heroku, Railway
- **Database:** AWS RDS, DigitalOcean Managed Database
- **File Storage:** AWS S3, Cloudinary

#### 4.3.5 Monitoring
- Sentry (error tracking)
- Google Analytics
- LogRocket (session replay)
- PM2 (process management)

---

## 5. Functional Requirements

### 5.1 Multi-Showroom Configuration

#### 5.1.1 Showroom Entity
Each showroom must have:
- Unique identifier
- Name and branding (logo, colors)
- Contact information
- Address with location mapping
- GST number
- State (for RTO calculations)
- Working hours
- Assigned staff
- Pricing configurations
- Terms and conditions

#### 5.1.2 Showroom-Specific Features
- Independent inventory management
- Separate user management
- Custom pricing and discounts
- Showroom-specific reports
- Branded invoices and documents

### 5.2 User Management

#### 5.2.1 User Roles
1. **Super Admin**
   - Full system access
   - Manage multiple showrooms
   - Add/remove showrooms
   - Global configuration
   - System-wide reports

2. **Showroom Manager**
   - Manage specific showroom
   - User management within showroom
   - Approve discounts
   - View all inquiries/bookings
   - Generate reports

3. **Sales Executive**
   - View assigned leads
   - Update lead status
   - Create quotations
   - Create bookings
   - View personal performance

4. **Accountant**
   - View bookings
   - Manage payments
   - Generate invoices
   - Financial reports

5. **Documentation Officer**
   - View bookings
   - Manage documents
   - Track RTO status

6. **Customer**
   - View catalog
   - Submit inquiries
   - Track bookings
   - Upload documents
   - Make payments

#### 5.2.2 Authentication Features
- Mobile OTP login
- Email/password login
- Role-based access control
- Session management
- Password reset
- Multi-factor authentication (optional)

### 5.3 Vehicle Catalog Management

#### 5.3.1 Vehicle Hierarchy
```
Brand (Honda)
  └── Model (Activa 6G)
       └── Variant (Standard, Deluxe)
            └── Color (White, Red, Black)
                 └── Stock Quantity
```

#### 5.3.2 Vehicle Information
- Model name and description
- Category (Scooter/Motorcycle)
- Multiple variants per model
- Specifications (engine, dimensions, features)
- Multiple images per variant
- 360° view (optional)
- Brochure PDF
- Video links
- Warranty information

#### 5.3.3 Pricing Components
- Ex-showroom price (variant-specific)
- RTO charges (state-specific)
  - Registration fee
  - Road tax
  - Smart card/number plate
  - Hypothecation charges
- Insurance
  - Third-party (mandatory)
  - Comprehensive (optional)
  - Personal accident cover
  - Add-ons (zero depreciation, etc.)
- Accessories
- Other charges
  - FastTag
  - Extended warranty
  - AMC
  - Documentation charges

#### 5.3.4 Stock Management
- Real-time stock tracking
- Color-wise availability
- Stock reservation on booking
- Low stock alerts
- Stock replenishment tracking

### 5.4 Accessories Management

#### 5.4.1 Accessory Categories
- Safety (helmets, protective gear)
- Convenience (mobile holders, USB chargers)
- Protection (body covers, crash guards)
- Aesthetics (seat covers, stickers)
- Performance (upgrades)

#### 5.4.2 Accessory Features
- Vehicle compatibility mapping
- Individual pricing with GST
- Bundle offers
- Installation charges
- Stock availability
- Images and descriptions

### 5.5 Inquiry Management

#### 5.5.1 Inquiry Capture
- Customer information
- Vehicle interest (model, variant, color)
- Budget range
- Purchase timeline
- Exchange requirement
- Finance requirement
- Test ride request
- Source tracking

#### 5.5.2 Lead Management
- Lead assignment to sales executives
- Status pipeline management
- Priority/lead scoring
- Follow-up scheduling
- Communication log
- Task management
- Notes and attachments

#### 5.5.3 Lead Statuses
- New
- Contacted
- Follow-up
- Test Ride Scheduled
- Hot Lead
- Quotation Sent
- Booking Done
- Lost
- Closed

#### 5.5.4 Communication Tools
- Email templates
- SMS templates
- WhatsApp integration
- Call logging
- Quotation generation

### 5.6 Test Ride Management

#### 5.6.1 Features
- Test ride scheduling
- Calendar availability
- Vehicle availability
- Customer verification (license check)
- Digital waiver/consent
- Feedback collection
- Follow-up automation

### 5.7 Booking System

#### 5.7.1 Booking Flow
1. Vehicle selection (model, variant, color)
2. Accessory selection
3. Price calculation
4. Customer information
5. Payment of booking amount
6. Booking confirmation

#### 5.7.2 Booking Management
- Booking ID generation
- Status tracking
- Payment tracking
- Document collection
- Delivery scheduling
- Cancellation handling
- Refund processing

#### 5.7.3 Booking Statuses
- Pending
- Confirmed
- Documentation In-Progress
- Stock Allocated
- Payment Pending
- Payment Complete
- RTO Processing
- PDI Scheduled
- Ready for Delivery
- Delivered
- Cancelled

### 5.8 Documentation Management

#### 5.8.1 Required Documents
- Customer documents
  - Aadhar card
  - Address proof
  - PAN card
  - Passport photos
- RTO forms
  - Form 20, 21, 22
- Insurance documents
- Loan documents (if applicable)

#### 5.8.2 Features
- Secure upload
- Document verification
- Status tracking
- Digital signatures
- Document templates
- Auto-filling forms

### 5.9 Payment Management

#### 5.9.1 Payment Types
- Booking amount
- Installment payments
- Full payment
- Down payment (for finance)

#### 5.9.2 Payment Methods
- UPI
- Credit/Debit cards
- Net banking
- Wallets
- Cash (at showroom)
- Cheque

#### 5.9.3 Features
- Payment gateway integration
- Receipt generation
- Payment tracking
- Refund processing
- Payment reminders
- Payment history

### 5.10 Invoice Generation

#### 5.10.1 Invoice Details
- Invoice number and date
- Showroom GST details
- Customer details
- Vehicle details with HSN code
- Price breakdown
- GST calculation
- Total amount
- Payment details
- Terms and conditions
- Digital signature

### 5.11 Reporting & Analytics

#### 5.11.1 Sales Reports
- Daily/weekly/monthly sales
- Revenue analysis
- Model-wise sales
- Color preference analysis
- Accessory sales
- Sales executive performance

#### 5.11.2 Inquiry Reports
- Inquiry source analysis
- Conversion ratio
- Lead funnel analysis
- Lost lead reasons
- Average conversion time

#### 5.11.3 Financial Reports
- Payment collection
- Pending payments
- Refunds processed
- GST reports
- Profit analysis

#### 5.11.4 Inventory Reports
- Stock levels
- Aging inventory
- Fast-moving models
- Stock turnover ratio

### 5.12 Notification System

#### 5.12.1 Customer Notifications
- Inquiry confirmation
- Quotation sent
- Booking confirmation
- Payment confirmation
- Document reminder
- Status updates
- Delivery reminder

#### 5.12.2 Staff Notifications
- New inquiry
- New booking
- Payment received
- Document uploaded
- Task reminders
- Low stock alerts

#### 5.12.3 Channels
- Email
- SMS
- WhatsApp
- In-app notifications
- Push notifications (mobile app)

---

## 6. Non-Functional Requirements

### 6.1 Performance

#### 6.1.1 Response Time
- Page load: < 2 seconds
- API response: < 500ms for 95% of requests
- Search results: < 1 second
- Image loading: Progressive/lazy loading

#### 6.1.2 Scalability
- Support 1000+ concurrent users
- Handle 10,000+ inquiries per month
- Process 1000+ bookings per month
- Store 100,000+ customer records

#### 6.1.3 Optimization
- Code splitting
- Image optimization (WebP, lazy loading)
- Database query optimization
- Caching strategy (Redis)
- CDN for static assets

### 6.2 Reliability

#### 6.2.1 Availability
- 99.9% uptime
- Automated backups (daily)
- Disaster recovery plan
- Failover mechanisms

#### 6.2.2 Data Integrity
- Transaction management
- Data validation
- Referential integrity
- Audit logging

### 6.3 Security

#### 6.3.1 Authentication & Authorization
- Secure password storage (bcrypt)
- JWT token-based authentication
- Role-based access control
- Session timeout (30 minutes)
- Password complexity requirements

#### 6.3.2 Data Protection
- HTTPS/SSL encryption
- Database encryption at rest
- Sensitive data masking
- PCI DSS compliance (for payments)
- Regular security audits

#### 6.3.3 Input Validation
- Server-side validation
- SQL injection prevention
- XSS protection
- CSRF protection
- File upload validation

### 6.4 Usability

#### 6.4.1 User Interface
- Intuitive navigation
- Consistent design language
- Responsive design (mobile-first)
- Fast loading indicators
- Helpful error messages

#### 6.4.2 Accessibility
- WCAG 2.1 Level AA compliance
- Keyboard navigation
- Screen reader support
- Sufficient color contrast
- Alt text for images

#### 6.4.3 Browser Support
- Chrome (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Edge (latest 2 versions)
- Mobile browsers (iOS Safari, Chrome Mobile)

### 6.5 Maintainability

#### 6.5.1 Code Quality
- Clean code principles
- Component reusability
- Comprehensive documentation
- Code comments
- Consistent naming conventions

#### 6.5.2 Testing
- Unit tests (80%+ coverage)
- Integration tests
- E2E tests (critical flows)
- Performance testing
- Security testing

#### 6.5.3 Monitoring
- Error tracking (Sentry)
- Performance monitoring
- Usage analytics
- Server monitoring
- Automated alerts

---

## 7. Data Models

### 7.1 Showroom Model
```typescript
interface Showroom {
  id: string;
  name: string;
  brand: string;
  tagline?: string;
  state: string;
  gstNumber: string;
  contact: {
    phone: string;
    email: string;
    whatsapp?: string;
  };
  address: {
    street: string;
    city: string;
    state: string;
    pincode: string;
    mapLink?: string;
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
  settings: {
    bookingAmount: number;
    documentationCharges: number;
    fastagCharges: number;
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### 7.2 User Model
```typescript
interface User {
  id: string;
  showroomId?: string;
  name: string;
  email: string;
  mobile: string;
  password: string; // hashed
  role: 'SUPER_ADMIN' | 'SHOWROOM_MANAGER' | 'SALES_EXECUTIVE' | 
        'ACCOUNTANT' | 'DOCUMENTATION_OFFICER' | 'CUSTOMER';
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

### 7.3 Vehicle Model
```typescript
interface Vehicle {
  id: string;
  showroomId: string;
  brand: string;
  modelName: string;
  category: 'SCOOTER' | 'MOTORCYCLE' | 'ELECTRIC';
  engineCC: number;
  fuelType: 'PETROL' | 'ELECTRIC' | 'HYBRID';
  launchYear: number;
  variants: Variant[];
  specifications: VehicleSpecifications;
  media: VehicleMedia;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface Variant {
  id: string;
  variantName: string;
  brakeType: 'DRUM' | 'DISC' | 'ABS' | 'CBS';
  wheelType: 'ALLOY' | 'SPOKE';
  hasBluetoothConnectivity: boolean;
  exShowroomPrice: number;
  availableColors: Color[];
}

interface Color {
  id: string;
  colorName: string;
  colorHex: string;
  stockQuantity: number;
  availabilityStatus: 'IN_STOCK' | 'OUT_OF_STOCK' | 'COMING_SOON';
  expectedDeliveryDays: number;
}
```

### 7.4 Inquiry Model
```typescript
interface Inquiry {
  id: string;
  showroomId: string;
  customer: {
    name: string;
    mobile: string;
    email?: string;
    alternateContact?: string;
    city: string;
  };
  vehicleInterest: {
    vehicleId: string;
    variantId: string;
    preferredColors: string[];
    budgetRange: string;
  };
  purchaseTimeline: string;
  requiresExchange: boolean;
  exchangeVehicleDetails?: ExchangeVehicle;
  requiresFinance: boolean;
  interestedInTestRide: boolean;
  preferredTestRideDate?: Date;
  additionalComments?: string;
  source: string;
  status: InquiryStatus;
  assignedTo?: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  leadScore: number;
  activities: Activity[];
  tasks: Task[];
  communications: Communication[];
  createdAt: Date;
  updatedAt: Date;
}
```

### 7.5 Booking Model
```typescript
interface Booking {
  id: string;
  showroomId: string;
  inquiryId?: string;
  customer: CustomerDetails;
  vehicle: BookedVehicle;
  accessories: BookedAccessory[];
  pricing: PricingBreakdown;
  payment: PaymentDetails;
  documents: DocumentStatus;
  status: BookingStatus;
  assignedTo: string;
  preferredDeliveryDate: Date;
  expectedDeliveryDate: Date;
  actualDeliveryDate?: Date;
  specialInstructions?: string;
  statusHistory: StatusHistory[];
  activityLog: Activity[];
  createdAt: Date;
  updatedAt: Date;
}
```

### 7.6 Payment Model
```typescript
interface Payment {
  id: string;
  bookingId: string;
  type: 'BOOKING' | 'INSTALLMENT' | 'FULL' | 'DOWN_PAYMENT';
  amount: number;
  method: 'UPI' | 'CARD' | 'NET_BANKING' | 'WALLET' | 'CASH' | 'CHEQUE';
  status: 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED';
  transactionId?: string;
  gatewayResponse?: any;
  receiptUrl?: string;
  processedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

---

## 8. API Specifications

### 8.1 Authentication APIs
```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout
POST   /api/auth/refresh-token
POST   /api/auth/forgot-password
POST   /api/auth/reset-password
POST   /api/auth/send-otp
POST   /api/auth/verify-otp
```

### 8.2 Showroom APIs
```
GET    /api/showrooms
GET    /api/showrooms/:id
POST   /api/showrooms
PUT    /api/showrooms/:id
DELETE /api/showrooms/:id
GET    /api/showrooms/:id/settings
PUT    /api/showrooms/:id/settings
```

### 8.3 Vehicle APIs
```
GET    /api/vehicles
GET    /api/vehicles/:id
POST   /api/vehicles
PUT    /api/vehicles/:id
DELETE /api/vehicles/:id
GET    /api/vehicles/search
GET    /api/vehicles/:id/variants
GET    /api/vehicles/:id/variants/:variantId/colors
PUT    /api/vehicles/:id/stock
```

### 8.4 Inquiry APIs
```
GET    /api/inquiries
GET    /api/inquiries/:id
POST   /api/inquiries
PUT    /api/inquiries/:id
DELETE /api/inquiries/:id
PUT    /api/inquiries/:id/status
PUT    /api/inquiries/:id/assign
POST   /api/inquiries/:id/activities
POST   /api/inquiries/:id/tasks
GET    /api/inquiries/stats
```

### 8.5 Booking APIs
```
GET    /api/bookings
GET    /api/bookings/:id
POST   /api/bookings
PUT    /api/bookings/:id
DELETE /api/bookings/:id
PUT    /api/bookings/:id/status
POST   /api/bookings/:id/documents
GET    /api/bookings/:id/invoice
POST   /api/bookings/:id/cancel
```

### 8.6 Payment APIs
```
GET    /api/payments
GET    /api/payments/:id
POST   /api/payments/initiate
POST   /api/payments/verify
POST   /api/payments/:id/refund
GET    /api/payments/:id/receipt
```

### 8.7 Accessory APIs
```
GET    /api/accessories
GET    /api/accessories/:id
POST   /api/accessories
PUT    /api/accessories/:id
DELETE /api/accessories/:id
GET    /api/accessories/compatible/:vehicleId
```

### 8.8 Report APIs
```
GET    /api/reports/sales
GET    /api/reports/inquiries
GET    /api/reports/payments
GET    /api/reports/inventory
POST   /api/reports/export
```

---

## 9. Security Requirements

### 9.1 Authentication Security
- Passwords must be at least 8 characters
- Include uppercase, lowercase, number, special character
- Bcrypt hashing with salt rounds ≥ 10
- JWT token expiry: 1 hour (access), 7 days (refresh)
- Account lockout after 5 failed attempts

### 9.2 Authorization
- Role-based access control (RBAC)
- Resource-level permissions
- API endpoint protection
- Frontend route guards

### 9.3 Data Security
- HTTPS only (TLS 1.2+)
- Encrypted database connections
- Sensitive data encryption at rest
- PII data masking in logs
- Secure file storage

### 9.4 API Security
- Rate limiting (100 requests/minute per IP)
- CORS configuration
- Input sanitization
- SQL injection prevention
- XSS protection headers
- CSRF tokens for state-changing operations

### 9.5 Payment Security
- PCI DSS compliance
- Tokenized card storage
- No card details stored locally
- Secure payment gateway integration
- Transaction encryption

### 9.6 File Upload Security
- File type validation
- File size limits (5MB per file)
- Virus scanning
- Secure file naming
- Separate storage domain

---

## 10. Deployment Requirements

### 10.1 Development Environment
- Node.js 18+ LTS
- npm or yarn
- Git
- Docker (optional)
- Local database instance

### 10.2 Production Environment

#### 10.2.1 Server Requirements
- CPU: 2+ cores
- RAM: 4GB minimum, 8GB recommended
- Storage: 50GB SSD
- Bandwidth: Unmetered
- OS: Ubuntu 22.04 LTS or similar

#### 10.2.2 Database
- PostgreSQL 14+ or MySQL 8+
- Automated backups (daily)
- Point-in-time recovery
- Replication (for high availability)

#### 10.2.3 File Storage
- AWS S3 or equivalent
- CDN integration
- Backup strategy

#### 10.2.4 SSL/TLS
- Valid SSL certificate
- HTTPS enforcement
- HSTS headers

### 10.3 CI/CD Pipeline
```
Code Commit → Build → Test → Deploy to Staging → 
Manual Approval → Deploy to Production
```

### 10.4 Monitoring
- Application monitoring (PM2, New Relic)
- Error tracking (Sentry)
- Performance monitoring
- Uptime monitoring
- Log aggregation

### 10.5 Backup Strategy
- Database: Daily automated backups, retained for 30 days
- Files: Daily incremental, weekly full backup
- Configuration: Version controlled
- Disaster recovery: 4-hour RTO, 1-hour RPO

---

## 11. Future Enhancements (Post Phase 1)

### 11.1 Phase 2
- Finance integration
- Exchange vehicle evaluation
- Advanced CRM features
- Customer loyalty program
- Service appointment booking

### 11.2 Phase 3
- Mobile application (React Native/Flutter)
- ERP integration
- Inventory optimization AI
- Chatbot integration
- Virtual showroom (3D/VR)

### 11.3 Phase 4
- Multi-language support
- Voice search