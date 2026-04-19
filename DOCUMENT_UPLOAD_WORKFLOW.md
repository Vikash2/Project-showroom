# Document Upload & Verification Workflow

## Overview

The document upload and verification process has been restructured to provide a dedicated workflow in the Sales Processing page. Documents are now uploaded and verified by staff before proceeding to final sales.

---

## Workflow Steps

### Step 1: Booking Confirmation
**Location**: `/admin/bookings`

- Customer books a vehicle and makes initial payment
- Booking status becomes **"Confirmed"**
- A purple **"Process to Sales"** button appears

### Step 2: Sales Processing - Document Upload & Verification
**Location**: `/admin/sales-processing`

**Access**:
- Click "Process to Sales" button from booking detail, OR
- Navigate to "Sales Processing" in the admin sidebar

**What happens here**:

#### Document Upload Section
Each document has the following workflow:

1. **Pending State** (Initial)
   - Document not yet uploaded
   - Upload button available
   - Click to select file from device

2. **Upload File**
   - Supported formats: Images (JPG, PNG, etc.) and PDF
   - Maximum file size: 10MB
   - File is converted to base64 and stored
   - Status changes to "Uploaded"

3. **View Uploaded Document**
   - Click the eye icon to preview
   - Images display inline
   - PDFs show download option
   - Modal preview with full details

4. **Staff Verification**
   - Staff reviews the uploaded document
   - Two options:
     - **Verify**: Document is approved → Status becomes "Verified" ✓
     - **Reject**: Document is rejected → Status becomes "Rejected"

5. **Rejected Documents**
   - If rejected, customer must reupload
   - Status returns to "Pending"
   - Upload button becomes available again

#### Document Types Tracked

| Document | Purpose |
|----------|---------|
| Aadhaar Card | Primary ID verification |
| Address Proof | Residential address verification |
| Passport Photos | Customer identification |

#### Progress Tracking

- Progress bar shows completion percentage
- Example: 2/3 documents verified = 66% complete
- Filter by status:
  - **Pending Documents**: Bookings with incomplete uploads
  - **Ready for Sales**: All documents verified

#### Proceed to Sales

- "Proceed to Sales" button becomes enabled only when:
  - All documents are verified ✓
  - No pending or rejected documents
- Clicking it opens the Final Sales Form

---

## Document Upload Component

### Features

**File Upload**:
- Drag-and-drop support
- Click to browse files
- Automatic base64 conversion
- File size validation (10MB limit)

**Document Preview**:
- Modal preview window
- Image display with zoom capability
- PDF download option
- File metadata display (name, upload time)

**Status Management**:
- Color-coded status badges
- Real-time status updates
- Visual progress indicators
- Status-specific action buttons

**Staff Actions**:
- Verify button (green) - Approve document
- Reject button (red) - Request reupload
- Preview button (eye icon) - View document

---

## Data Structure

### Document Status Object

```typescript
interface DocumentStatus {
  aadharCard: {
    status: 'Pending' | 'Uploaded' | 'Verified' | 'Rejected';
    file?: DocumentFile;
  };
  addressProof: {
    status: 'Pending' | 'Uploaded' | 'Verified' | 'Rejected';
    file?: DocumentFile;
  };
  passportPhotos: {
    status: 'Pending' | 'Uploaded' | 'Verified' | 'Rejected';
    file?: DocumentFile;
  };
}

interface DocumentFile {
  name: string;           // Original filename
  type: string;           // MIME type (image/jpeg, application/pdf, etc.)
  data: string;           // Base64 encoded file content
  uploadedAt: string;     // ISO timestamp
}
```

### Booking with Documents

```json
{
  "id": "SH-BK-2025-001",
  "status": "Confirmed",
  "documents": {
    "aadharCard": {
      "status": "Verified",
      "file": {
        "name": "aadhaar.jpg",
        "type": "image/jpeg",
        "data": "data:image/jpeg;base64,/9j/4AAQSkZJRgABA...",
        "uploadedAt": "2025-03-23T10:30:00Z"
      }
    },
    "addressProof": {
      "status": "Uploaded",
      "file": {
        "name": "address_proof.pdf",
        "type": "application/pdf",
        "data": "data:application/pdf;base64,JVBERi0xLjQK...",
        "uploadedAt": "2025-03-23T10:35:00Z"
      }
    },
    "passportPhotos": {
      "status": "Pending"
    }
  }
}
```

---

## User Interface

### Sales Processing Page

**Document Upload Section**:
```
┌─────────────────────────────────────────────────────────┐
│ Document Upload & Verification                          │
├─────────────────────────────────────────────────────────┤
│                                                          │
│ ✓ Aadhaar Card                          [Verified]      │
│   ✓ aadhaar.jpg                                         │
│   Uploaded: 2025-03-23 10:30 AM                         │
│   [Preview] [Verify] [Reject]                           │
│                                                          │
│ 📄 Address Proof                        [Uploaded]      │
│   📄 address_proof.pdf                                  │
│   Uploaded: 2025-03-23 10:35 AM                         │
│   [Preview] [Verify] [Reject]                           │
│                                                          │
│ ⚠ Passport Photos                       [Pending]       │
│   [Click to upload]                                     │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### Document Preview Modal

```
┌─────────────────────────────────────────────────────────┐
│ Aadhaar Card                                        [X]  │
├─────────────────────────────────────────────────────────┤
│                                                          │
│                    [Document Image]                     │
│                                                          │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## Context Methods

### BookingContext API

```typescript
// Upload a document file
uploadDocument(
  bookingId: string,
  docType: keyof DocumentStatus,
  file: DocumentFile
): void

// Verify a document (staff action)
verifyDocument(
  bookingId: string,
  docType: keyof DocumentStatus
): void

// Reject a document (staff action)
rejectDocument(
  bookingId: string,
  docType: keyof DocumentStatus
): void

// Update document status
updateDocumentStatus(
  bookingId: string,
  docType: keyof DocumentStatus,
  status: string
): void
```

---

## Status Flow Diagram

```
                    ┌─────────────┐
                    │   PENDING   │
                    │ (No upload) │
                    └──────┬──────┘
                           │
                    [User uploads file]
                           │
                           ↓
                    ┌─────────────────┐
                    │    UPLOADED     │
                    │ (Awaiting staff │
                    │  verification)  │
                    └────┬────────┬───┘
                         │        │
              [Staff Verify]  [Staff Reject]
                         │        │
                         ↓        ↓
                    ┌─────────┐  ┌─────────┐
                    │VERIFIED │  │REJECTED │
                    │   ✓     │  │ (Retry) │
                    └─────────┘  └────┬────┘
                                      │
                            [User re-uploads]
                                      │
                                      ↓
                                 [UPLOADED]
```

---

## Workflow Progression

```
┌──────────────────────────────────────────────────────────┐
│ BOOKING CONFIRMED                                        │
│ (Status: Confirmed)                                      │
└────────────────────┬─────────────────────────────────────┘
                     │
                     ↓ "Process to Sales"
┌──────────────────────────────────────────────────────────┐
│ SALES PROCESSING                                         │
│ Document Upload & Verification                           │
│                                                          │
│ 1. Upload Documents                                      │
│    - Aadhaar Card                                        │
│    - Address Proof                                       │
│    - Passport Photos                                     │
│                                                          │
│ 2. Staff Verification                                    │
│    - Review each document                                │
│    - Click Verify or Reject                              │
│                                                          │
│ 3. Progress Tracking                                     │
│    - Progress bar updates                                │
│    - Status badges show current state                    │
│                                                          │
│ 4. Proceed to Sales                                      │
│    - Button enabled when all verified                    │
└────────────────────┬─────────────────────────────────────┘
                     │
                     ↓ All documents verified
┌──────────────────────────────────────────────────────────┐
│ FINAL SALES FORM                                         │
│ (Sale Details & Finalization)                            │
└──────────────────────────────────────────────────────────┘
```

---

## Key Features

### 1. File Upload
- Supports images and PDFs
- 10MB file size limit
- Base64 encoding for storage
- Automatic file type detection

### 2. Document Preview
- Modal preview window
- Image display with proper scaling
- PDF download option
- File metadata display

### 3. Staff Verification
- Two-step verification (Verify/Reject)
- Clear visual feedback
- Status tracking
- Audit trail (upload timestamp)

### 4. Progress Tracking
- Real-time progress bar
- Percentage completion
- Status badges
- Filter by document status

### 5. Error Handling
- File size validation
- File type validation
- User-friendly error messages
- Retry capability for rejected documents

---

## Implementation Files

**New Files**:
- `src/components/Sales/DocumentUploadSection.tsx` - Document upload UI component

**Modified Files**:
- `src/types/booking.ts` - Updated DocumentStatus interface
- `src/state/BookingContext.tsx` - Added upload/verify/reject methods
- `src/pages/admin/SalesProcessing.tsx` - Integrated document upload component
- `src/pages/admin/BookingManagement.tsx` - Removed document checklist

---

## Testing the Workflow

1. **Navigate to Sales Processing**:
   - Go to `/admin/sales-processing`
   - Or click "Process to Sales" from a confirmed booking

2. **Upload Documents**:
   - Click upload area for each document
   - Select a file from your device
   - File is converted and stored

3. **Preview Document**:
   - Click the eye icon
   - View document in modal
   - Close modal to return

4. **Verify Document**:
   - Click "Verify" button
   - Status changes to "Verified" ✓
   - Progress bar updates

5. **Reject Document**:
   - Click "Reject" button
   - Status changes to "Rejected"
   - Upload button becomes available again

6. **Proceed to Sales**:
   - Once all documents verified
   - "Proceed to Sales" button becomes enabled
   - Click to open Final Sales Form

---

## Future Enhancements

- [ ] Drag-and-drop file upload
- [ ] Multiple file upload per document type
- [ ] Document expiry tracking
- [ ] OCR for automatic data extraction
- [ ] Document verification history/audit log
- [ ] Email notifications for rejected documents
- [ ] Bulk document upload
- [ ] Document templates/guidelines
- [ ] Integration with document storage service (AWS S3, etc.)
- [ ] Automatic document validation
