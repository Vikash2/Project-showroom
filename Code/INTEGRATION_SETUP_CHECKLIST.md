# Frontend-Backend Integration Setup Checklist

## 📋 Complete Setup Guide

Follow these steps in order to integrate the frontend with the backend.

---

## ✅ Step 1: Backend Setup

### 1.1 Install Dependencies
```bash
cd Code/backend
npm install
```

### 1.2 Get Firebase Service Account Key

**CRITICAL:** You need this file for the backend to work.

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select project: **vehiclezo-6eca7**
3. Click ⚙️ (Settings) → **Project Settings**
4. Go to **Service Accounts** tab
5. Click **Generate New Private Key**
6. Save the file as `serviceAccountKey.json` in `Code/backend/` folder

```
Code/backend/
├── serviceAccountKey.json  ← Save here
├── index.js
└── package.json
```

### 1.3 Verify Environment Variables

Check `Code/backend/.env` file exists with:
```env
FIREBASE_DB_URL=https://vehiclezo-6eca7-default-rtdb.firebaseio.com/
FIREBASE_STORAGE_BUCKET=vehiclezo-6eca7.appspot.com
FIREBASE_PROJECT_ID=vehiclezo-6eca7
PORT=3001
NODE_ENV=development
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
FIREBASE_EMULATOR=false
```

### 1.4 Create First Super Admin
```bash
cd Code/backend
npm run create-admin
```

Expected output:
```
🎉 Super Admin created successfully!
==================================================
Email:    admin@sandhyahonda.com
Password: Admin@123
UID:      abc123xyz...
==================================================
```

**Save these credentials!**

### 1.5 Start Backend Server
```bash
npm run dev
```

Expected output:
```
🚀 Server running on port 3001
📝 Environment: development
🔥 Firebase DB: https://vehiclezo-6eca7-default-rtdb.firebaseio.com/
✅ Firebase Admin SDK initialized successfully
```

### 1.6 Test Backend
```bash
curl http://localhost:3001/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2026-03-29T...",
  "environment": "development",
  "phase": "Phase 2 - Showroom & Vehicle Catalog"
}
```

✅ **Backend is ready!**

---

## ✅ Step 2: Frontend Setup

### 2.1 Install Firebase SDK
```bash
cd Code/frontend
npm install firebase
```

### 2.2 Get Firebase Web Credentials

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select project: **vehiclezo-6eca7**
3. Click ⚙️ → **Project Settings**
4. Scroll to **Your apps** section
5. If no web app exists:
   - Click **</>** (Web) icon
   - Register app with nickname: "Vehicle Showroom Web"
   - Copy the `firebaseConfig` object
6. If web app exists:
   - Click on the existing app
   - Scroll to **SDK setup and configuration**
   - Select **Config** radio button
   - Copy the config values

You'll see something like:
```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "vehiclezo-6eca7.firebaseapp.com",
  databaseURL: "https://vehiclezo-6eca7-default-rtdb.firebaseio.com",
  projectId: "vehiclezo-6eca7",
  storageBucket: "vehiclezo-6eca7.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456"
};
```

### 2.3 Create .env File

Create `Code/frontend/.env` with your Firebase credentials:

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

**Important:** Replace the XXX values with your actual Firebase credentials!

### 2.4 Enable Firebase Authentication

1. Go to Firebase Console → **Authentication**
2. Click **Get Started**
3. Click **Sign-in method** tab
4. Enable **Email/Password** provider
5. Click **Save**

### 2.5 Update Firebase Database Rules (Optional for Development)

1. Go to Firebase Console → **Realtime Database**
2. Click **Rules** tab
3. For development, use:
```json
{
  "rules": {
    ".read": "auth != null",
    ".write": "auth != null"
  }
}
```
4. Click **Publish**

**Note:** In production, use more restrictive rules.

### 2.6 Start Frontend
```bash
cd Code/frontend
npm run dev
```

Expected output:
```
VITE v7.3.1  ready in 500 ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

✅ **Frontend is ready!**

---

## ✅ Step 3: Test Integration

### 3.1 Test Login

1. Open browser: `http://localhost:5173/login`
2. Enter credentials:
   - Email: `admin@sandhyahonda.com`
   - Password: `Admin@123`
3. Click "Sign In to Dashboard"
4. You should be redirected to `/admin`

✅ **Login works!**

### 3.2 Access User Management

1. Navigate to User Management page
   - Add route in your router if not already added
   - Or directly go to the page component

2. You should see:
   - "Create User" button
   - List of users (at least the Super Admin)

✅ **User Management accessible!**

### 3.3 Create Test User

1. Click "Create User" button
2. Fill in the form:
   - **Full Name:** Test Manager
   - **Email:** test@sandhyahonda.com
   - **Password:** Test@123
   - **Mobile:** 9876543210
   - **Role:** Showroom Manager
   - **Showroom:** Select any showroom
3. Click "Create User"
4. Should see success message
5. New user appears in the list

✅ **User creation works!**

### 3.4 Test New User Login

1. Logout from Super Admin
2. Login with new user:
   - Email: `test@sandhyahonda.com`
   - Password: `Test@123`
3. Should login successfully
4. Should NOT see User Management page (not Super Admin)

✅ **Role-based access works!**

---

## 🎯 Quick Test Commands

### Test Backend Health
```bash
curl http://localhost:3001/health
```

### Test User List (requires token)
```bash
# First, get token by logging in via frontend
# Then:
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3001/api/users
```

### Create User via API
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test@123",
    "name": "Test User",
    "mobile": "9876543210",
    "role": "Sales Executive",
    "showroomId": "SH001"
  }'
```

---

## 🐛 Troubleshooting

### Backend Issues

#### ❌ "Cannot find module './serviceAccountKey.json'"
**Solution:** Download Firebase service account key (Step 1.2)

#### ❌ "EADDRINUSE: address already in use"
**Solution:** Port 3001 is busy. Kill the process or change PORT in `.env`

#### ❌ "Firebase initialization error"
**Solution:** Check `serviceAccountKey.json` is valid and in correct location

### Frontend Issues

#### ❌ "Firebase: Error (auth/invalid-api-key)"
**Solution:** Check `VITE_FIREBASE_API_KEY` in `.env` file

#### ❌ "Network Error" when calling API
**Solution:** 
- Backend not running → Start backend server
- Wrong URL → Check `VITE_API_BASE_URL` in `.env`

#### ❌ "CORS Error"
**Solution:** 
- Check backend `ALLOWED_ORIGINS` includes `http://localhost:5173`
- Restart backend after changing `.env`

#### ❌ "User not found" after login
**Solution:** 
- User exists in Firebase Auth but not in backend database
- Use backend API to create user properly

#### ❌ Module not found: firebase
**Solution:** Run `npm install firebase` in frontend directory

### Integration Issues

#### ❌ Login succeeds but user is null
**Solution:**
- Check browser console for errors
- Verify backend `/api/auth/me` endpoint works
- Check Firebase token is being sent in request headers

#### ❌ "Access denied" for all users
**Solution:**
- Check user role in Firebase custom claims
- Verify role is set correctly in backend database

---

## 📝 Verification Checklist

### Backend
- [ ] Dependencies installed
- [ ] `serviceAccountKey.json` downloaded and placed
- [ ] `.env` file configured
- [ ] Super Admin created successfully
- [ ] Server starts without errors
- [ ] Health check responds
- [ ] Can access `/api/users` with token

### Frontend
- [ ] Firebase SDK installed (`npm install firebase`)
- [ ] `.env` file created with Firebase credentials
- [ ] Firebase Authentication enabled in console
- [ ] Server starts without errors
- [ ] Can access login page
- [ ] No console errors on page load

### Integration
- [ ] Can login with Super Admin credentials
- [ ] Redirected to admin dashboard after login
- [ ] User Management page accessible
- [ ] Can see list of users
- [ ] Can create new user via UI
- [ ] New user appears in list
- [ ] Can login with newly created user
- [ ] Role-based access control works
- [ ] Logout works correctly

---

## 🎉 Success Criteria

You've successfully integrated when:

1. ✅ Backend server running on port 3001
2. ✅ Frontend running on port 5173
3. ✅ Can login with Super Admin
4. ✅ Can create users via UI
5. ✅ Created users can login
6. ✅ Role-based access works
7. ✅ No console errors
8. ✅ API calls succeed

---

## 📚 Next Steps

After successful integration:

1. **Add User Management Route** to your app router
2. **Test all user roles** (Manager, Sales, etc.)
3. **Integrate Showroom Management** (Phase 2)
4. **Integrate Vehicle Management** (Phase 2)
5. **Proceed to Phase 3** (Inquiry & Lead Management)

---

## 📖 Documentation References

- `BACKEND_INTEGRATION_GUIDE.md` - Detailed integration guide
- `USER_CREATION_PAYLOADS.md` - API payload examples
- `FRONTEND_BACKEND_INTEGRATION_SUMMARY.md` - Overview
- `PHASE1_COMPLETE.md` - Backend Phase 1 docs
- `PHASE2_COMPLETE.md` - Backend Phase 2 docs

---

## 💡 Tips

- Keep both backend and frontend terminals open to see logs
- Use browser DevTools Network tab to debug API calls
- Check browser Console for JavaScript errors
- Firebase tokens expire after 1 hour (auto-refreshed by SDK)
- Use Postman or curl to test backend APIs directly

---

Last Updated: March 29, 2026
