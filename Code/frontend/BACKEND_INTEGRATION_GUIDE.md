# Backend Integration Guide

## Overview

This guide explains how to integrate the frontend with the Node.js + Firebase backend for user authentication and management.

## What's Been Implemented

### 1. Firebase Configuration (`src/config/firebase.ts`)
- Initializes Firebase app with your project credentials
- Exports `auth`, `database`, and `storage` instances

### 2. API Service Layer (`src/services/api.ts`)
- Axios instance configured for backend API calls
- Automatic token attachment to requests
- Error handling and formatting
- Base URL: `http://localhost:3001`

### 3. Auth Service (`src/services/authService.ts`)
- `loginWithEmail()` - Login with Firebase Auth + backend profile
- `logout()` - Sign out from Firebase
- `getCurrentUser()` - Get user profile from backend

### 4. User Service (`src/services/userService.ts`)
- `createUser()` - Create new user (Super Admin only)
- `listUsers()` - Get all users
- `getUser()` - Get single user
- `updateUser()` - Update user profile
- `updateUserRole()` - Change user role
- `deleteUser()` - Delete user

### 5. Updated AuthContext (`src/state/AuthContext.tsx`)
- Now uses Firebase Auth instead of localStorage
- Listens to Firebase auth state changes
- Fetches user profile from backend API
- Blocks customer role from accessing admin portal

### 6. User Management Page (`src/pages/admin/UserManagement.tsx`)
- Create new users with role assignment
- List all users
- Delete users
- Super Admin only access

## Setup Instructions

### Step 1: Install Firebase SDK

```bash
cd Code/frontend
npm install firebase
```

### Step 2: Get Firebase Web Credentials

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select project: `vehiclezo-6eca7`
3. Click ⚙️ → Project Settings
4. Scroll to "Your apps" section
5. Click "Web app" icon (</>) or add a new web app
6. Copy the `firebaseConfig` object

### Step 3: Configure Environment Variables

Create `.env` file in `Code/frontend/`:

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:3001

# Firebase Configuration (replace with your actual values)
VITE_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
VITE_FIREBASE_AUTH_DOMAIN=vehiclezo-6eca7.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://vehiclezo-6eca7-default-rtdb.firebaseio.com
VITE_FIREBASE_PROJECT_ID=vehiclezo-6eca7
VITE_FIREBASE_STORAGE_BUCKET=vehiclezo-6eca7.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef123456
```

### Step 4: Enable Firebase Authentication

1. Go to Firebase Console → Authentication
2. Click "Get Started"
3. Enable "Email/Password" sign-in method
4. Save

### Step 5: Update App Routing

Add the User Management route to your app:

```typescript
// In your router configuration (App.tsx or routes file)
import UserManagement from './pages/admin/UserManagement';

// Add this route
<Route path="/admin/users" element={<UserManagement />} />
```

### Step 6: Start Backend Server

```bash
cd Code/backend
npm run dev
```

Server should be running on `http://localhost:3001`

### Step 7: Start Frontend

```bash
cd Code/frontend
npm run dev
```

## Testing the Integration

### 1. Create First Super Admin

Use the backend script to create the first admin:

```bash
cd Code/backend
npm run create-admin
```

This creates:
- Email: `admin@sandhyahonda.com`
- Password: `Admin@123`

### 2. Login to Frontend

1. Go to `http://localhost:5173/login`
2. Enter the admin credentials
3. You should be logged in and redirected to `/admin`

### 3. Create Additional Users

1. Navigate to User Management page
2. Click "Create User"
3. Fill in the form with these example payloads:

#### Example 1: Showroom Manager
```json
{
  "email": "manager@sandhyahonda.com",
  "password": "Manager@123",
  "name": "Ramesh Singh",
  "mobile": "9876543210",
  "role": "Showroom Manager",
  "showroomId": "SH001"
}
```

#### Example 2: Sales Executive
```json
{
  "email": "sales@sandhyahonda.com",
  "password": "Sales@123",
  "name": "Vikash Kumar",
  "mobile": "8765432109",
  "role": "Sales Executive",
  "showroomId": "SH001"
}
```

#### Example 3: Documentation Officer
```json
{
  "email": "docs@sandhyahonda.com",
  "password": "Docs@123",
  "name": "Priya Patel",
  "mobile": "7654321098",
  "role": "Documentation Officer",
  "showroomId": "SH001"
}
```

#### Example 4: Accountant
```json
{
  "email": "accounts@sandhyahonda.com",
  "password": "Accounts@123",
  "name": "Ankit Sharma",
  "mobile": "6543210987",
  "role": "Accountant",
  "showroomId": "SH001"
}
```

### 4. Test Login with New Users

1. Logout from Super Admin
2. Login with one of the newly created users
3. Verify role-based access works

## API Payload Reference

### Create User Payload

```typescript
{
  email: string;          // Valid email format
  password: string;       // Minimum 6 characters
  name: string;           // Full name (min 2 chars)
  mobile: string;         // Exactly 10 digits
  role: Role;             // One of the allowed roles
  showroomId?: string;    // Required for non-Super Admin roles
}
```

### Allowed Roles

- `Super Admin` - Full system access (no showroom required)
- `Showroom Manager` - Manage specific showroom (showroom required)
- `Sales Executive` - Handle sales (showroom required)
- `Accountant` - Financial operations (showroom required)
- `Documentation Officer` - Document verification (showroom required)

### Validation Rules

- **Email**: Must be valid email format
- **Password**: Minimum 6 characters
- **Name**: Minimum 2 characters
- **Mobile**: Exactly 10 digits (numbers only)
- **Role**: Must be one of the allowed roles
- **ShowroomId**: Required for all roles except Super Admin

## Common Issues & Solutions

### ❌ "Firebase: Error (auth/invalid-api-key)"
→ Check your Firebase API key in `.env` file

### ❌ "Network Error" when calling API
→ Make sure backend server is running on port 3001

### ❌ "CORS Error"
→ Backend CORS is configured for `http://localhost:5173`. If using different port, update backend `.env`

### ❌ "User not found" after login
→ User exists in Firebase Auth but not in backend database. Use the create user API to add them.

### ❌ "Access denied" for Customer role
→ This is intentional. Only staff roles can access the admin portal.

### ❌ Token expired errors
→ Firebase tokens expire after 1 hour. The SDK auto-refreshes them. If issues persist, logout and login again.

## How It Works

### Login Flow

1. User enters email/password on login page
2. Frontend calls `authService.loginWithEmail()`
3. Firebase Auth validates credentials
4. If valid, Firebase returns ID token
5. Frontend calls backend `/api/auth/me` with token
6. Backend verifies token and returns user profile
7. Frontend stores user in AuthContext
8. User is redirected to admin dashboard

### API Request Flow

1. User performs action (e.g., create user)
2. Frontend calls service function (e.g., `userService.createUser()`)
3. API interceptor gets current Firebase user
4. Interceptor gets fresh ID token
5. Token attached to request as `Authorization: Bearer <token>`
6. Backend verifies token and processes request
7. Response returned to frontend

### Token Management

- Firebase SDK automatically refreshes tokens
- Tokens are valid for 1 hour
- No manual token management needed
- Logout clears Firebase session

## Next Steps

After user management is working:

1. **Integrate Showroom Management**
   - Create `src/services/showroomService.ts`
   - Update ShowroomContext to use API

2. **Integrate Vehicle Management**
   - Create `src/services/vehicleService.ts`
   - Update VehicleContext to use API

3. **Integrate Accessory Management**
   - Create `src/services/accessoryService.ts`
   - Update AccessoryContext to use API

4. **Add Image Upload**
   - Use `/api/uploads/direct` endpoint
   - Update vehicle/accessory forms

## Security Notes

- Never commit `.env` file to version control
- Firebase credentials are public (client-side) but protected by Firebase Security Rules
- Backend validates all requests with Firebase Admin SDK
- Role-based access control enforced on backend
- Tokens are short-lived and auto-refreshed

## Support

If you encounter issues:
1. Check browser console for errors
2. Check backend logs for API errors
3. Verify Firebase configuration
4. Ensure backend is running
5. Check network tab for failed requests

---

Last Updated: March 29, 2026
