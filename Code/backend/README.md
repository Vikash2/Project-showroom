# Vehicle Showroom Management System - Backend

Node.js + Express + Firebase Realtime Database backend for Sandhya Honda.

## Phase 1: Foundation & Authentication ✅

This is the initial phase implementing:
- Firebase Admin SDK setup
- User authentication & authorization
- Role-based access control (RBAC)
- User management APIs

## Setup Instructions

### 1. Install Dependencies

```bash
cd Code/backend
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env` and update values:

```bash
cp .env.example .env
```

Required environment variables:
- `FIREBASE_DB_URL` - Your Firebase Realtime Database URL
- `FIREBASE_STORAGE_BUCKET` - Your Firebase Storage bucket
- `FIREBASE_PROJECT_ID` - Your Firebase project ID
- `PORT` - Server port (default: 3001)
- `ALLOWED_ORIGINS` - CORS allowed origins

### 3. Firebase Service Account Key

**IMPORTANT:** You need to download your Firebase service account key:

1. Go to Firebase Console → Project Settings → Service Accounts
2. Click "Generate New Private Key"
3. Save the file as `serviceAccountKey.json` in the `backend/` directory
4. **Never commit this file to version control!**

### 4. Start the Server

Development mode (with auto-reload):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

## API Endpoints

### Authentication

#### Register User
```http
POST /api/auth/register
Authorization: Bearer <super-admin-token>
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe",
  "mobile": "9876543210",
  "role": "Sales Executive",
  "showroomId": "SH001"
}
```

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <token>
```

### User Management

#### List Users
```http
GET /api/users
Authorization: Bearer <token>
```

#### Get User by ID
```http
GET /api/users/:uid
Authorization: Bearer <token>
```

#### Update User Profile
```http
PATCH /api/users/:uid
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Name",
  "mobile": "9876543210"
}
```

#### Update User Role (Super Admin only)
```http
PATCH /api/users/:uid/role
Authorization: Bearer <super-admin-token>
Content-Type: application/json

{
  "role": "Showroom Manager",
  "showroomId": "SH001"
}
```

#### Delete User (Super Admin only)
```http
DELETE /api/users/:uid
Authorization: Bearer <super-admin-token>
```

## User Roles

- **Super Admin** - Full system access
- **Showroom Manager** - Manage their showroom
- **Sales Executive** - Handle inquiries and bookings
- **Documentation Officer** - Verify documents

## RTDB Structure (Phase 1)

```json
{
  "users": {
    "<uid>": {
      "uid": "string",
      "email": "string",
      "name": "string",
      "mobile": "string",
      "role": "string",
      "showroomId": "string | null",
      "createdAt": "timestamp",
      "isActive": "boolean"
    }
  }
}
```

## Testing

### Health Check
```bash
curl http://localhost:3001/health
```

### Create First Super Admin

You'll need to manually create the first Super Admin user using Firebase Console or Firebase CLI:

```bash
# Using Firebase CLI
firebase auth:import users.json --project vehiclezo-6eca7
```

Or use the Firebase Console to create a user, then set custom claims using Firebase Functions or Admin SDK.

## Next Steps

After Phase 1 is complete and tested:
- **Phase 2**: Showroom & Vehicle Catalog APIs
- **Phase 3**: Inquiry & Lead Management
- **Phase 4**: Bookings & Sales Processing
- **Phase 5**: Document Management
- **Phase 6**: Reports & Analytics

## Security Notes

- All routes (except health check) require authentication
- Role-based access control enforced via middleware
- Firebase ID tokens verified on every request
- Custom claims store user role and showroom assignment
- Service account key must never be committed to git

## Development Tips

- Use Firebase Local Emulator Suite for local development
- Set `FIREBASE_EMULATOR=true` in `.env` to use emulators
- Check logs for detailed error messages
- Use Postman or similar tool to test API endpoints
