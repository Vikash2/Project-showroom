# 🚀 Frontend-Backend Integration - Quick Start

## What's Been Built

✅ **Backend (Node.js + Firebase)**
- User authentication with JWT tokens
- Role-based access control
- User management APIs
- Showroom, Vehicle, Accessory APIs
- Image upload to Firebase Storage

✅ **Frontend Integration**
- Firebase SDK configuration
- API service layer
- Updated AuthContext
- User Management UI

## 🎯 Quick Start (5 Minutes)

### 1. Backend Setup
```bash
cd Code/backend
npm install
# Download serviceAccountKey.json from Firebase Console
npm run create-admin
npm run dev
```

### 2. Frontend Setup
```bash
cd Code/frontend
npm install firebase
# Create .env with Firebase credentials
npm run dev
```

### 3. Test
- Login: `http://localhost:5173/login`
- Email: `admin@sandhyahonda.com`
- Password: `Admin@123`

## 📋 User Creation Payloads

### Via Frontend UI
1. Login as Super Admin
2. Go to User Management
3. Click "Create User"
4. Fill form and submit

### Via API (cURL)

**Super Admin:**
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@sandhyahonda.com",
    "password": "Admin@123",
    "name": "Super Admin",
    "mobile": "9999999999",
    "role": "Super Admin"
  }'
```

**Showroom Manager:**
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "manager@sandhyahonda.com",
    "password": "Manager@123",
    "name": "Ramesh Singh",
    "mobile": "9876543210",
    "role": "Showroom Manager",
    "showroomId": "SH001"
  }'
```

**Sales Executive:**
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "sales@sandhyahonda.com",
    "password": "Sales@123",
    "name": "Vikash Kumar",
    "mobile": "8765432109",
    "role": "Sales Executive",
    "showroomId": "SH001"
  }'
```

**Documentation Officer:**
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "docs@sandhyahonda.com",
    "password": "Docs@123",
    "name": "Priya Patel",
    "mobile": "7654321098",
    "role": "Documentation Officer",
    "showroomId": "SH001"
  }'
```

**Accountant:**
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "accounts@sandhyahonda.com",
    "password": "Accounts@123",
    "name": "Ankit Sharma",
    "mobile": "6543210987",
    "role": "Accountant",
    "showroomId": "SH001"
  }'
```

## 📝 Payload Structure

```typescript
{
  email: string;          // Valid email format
  password: string;       // Minimum 6 characters
  name: string;           // Full name (min 2 chars)
  mobile: string;         // Exactly 10 digits
  role: Role;             // See roles below
  showroomId?: string;    // Required for non-Super Admin
}
```

## 👥 Valid Roles

- `Super Admin` - Full access (no showroom required)
- `Showroom Manager` - Manage showroom (showroom required)
- `Sales Executive` - Handle sales (showroom required)
- `Documentation Officer` - Verify docs (showroom required)
- `Accountant` - Financial ops (showroom required)

## ✅ Validation Rules

| Field | Rule | Example |
|-------|------|---------|
| email | Valid email | `user@example.com` |
| password | Min 6 chars | `Pass@123` |
| name | Min 2 chars | `John Doe` |
| mobile | 10 digits | `9876543210` |
| role | Valid role | `Sales Executive` |
| showroomId | Required for staff | `SH001` |

## 🔐 Authentication Flow

```
User Login
    ↓
Firebase Auth (validates credentials)
    ↓
Get ID Token
    ↓
Call Backend /api/auth/me (with token)
    ↓
Backend verifies token & returns profile
    ↓
Frontend stores user in AuthContext
    ↓
User authenticated ✅
```

## 📁 New Files

### Frontend
- `src/config/firebase.ts` - Firebase config
- `src/services/api.ts` - API client
- `src/services/authService.ts` - Auth functions
- `src/services/userService.ts` - User CRUD
- `src/pages/admin/UserManagement.tsx` - User UI
- `src/state/AuthContext.tsx` - Updated with Firebase

### Backend
- All Phase 1 & 2 files (see PHASE1_COMPLETE.md)

## 🔧 Environment Variables

### Backend (.env)
```env
FIREBASE_DB_URL=https://vehiclezo-6eca7-default-rtdb.firebaseio.com/
FIREBASE_STORAGE_BUCKET=vehiclezo-6eca7.appspot.com
FIREBASE_PROJECT_ID=vehiclezo-6eca7
PORT=3001
ALLOWED_ORIGINS=http://localhost:5173
```

### Frontend (.env)
```env
VITE_API_BASE_URL=http://localhost:3001
VITE_FIREBASE_API_KEY=your_key_here
VITE_FIREBASE_AUTH_DOMAIN=vehiclezo-6eca7.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://vehiclezo-6eca7-default-rtdb.firebaseio.com
VITE_FIREBASE_PROJECT_ID=vehiclezo-6eca7
VITE_FIREBASE_STORAGE_BUCKET=vehiclezo-6eca7.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

## 🐛 Common Issues

| Issue | Solution |
|-------|----------|
| "Cannot find serviceAccountKey.json" | Download from Firebase Console |
| "Firebase: invalid-api-key" | Check .env file |
| "Network Error" | Start backend server |
| "CORS Error" | Check ALLOWED_ORIGINS |
| "User not found" | User not in backend DB |

## 📚 Documentation

- `INTEGRATION_SETUP_CHECKLIST.md` - Step-by-step setup
- `BACKEND_INTEGRATION_GUIDE.md` - Detailed guide
- `USER_CREATION_PAYLOADS.md` - All payload examples
- `FRONTEND_BACKEND_INTEGRATION_SUMMARY.md` - Overview

## ✅ Testing Checklist

- [ ] Backend running on port 3001
- [ ] Frontend running on port 5173
- [ ] Can login with Super Admin
- [ ] User Management page accessible
- [ ] Can create users via UI
- [ ] Created users can login
- [ ] Role-based access works

## 🎉 Success!

When you can:
1. Login with Super Admin
2. Create new users
3. Login with new users
4. See role-based access working

You're ready to proceed with Phase 3!

---

**Need Help?** Check `INTEGRATION_SETUP_CHECKLIST.md` for detailed troubleshooting.

Last Updated: March 29, 2026
