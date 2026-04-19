# Phase 1 Setup Guide

## Quick Start

### 1. Install Dependencies
```bash
cd Code/backend
npm install
```

### 2. Get Firebase Service Account Key

**CRITICAL STEP:** You need to download your Firebase service account key:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `vehiclezo-6eca7`
3. Click the gear icon ⚙️ → Project Settings
4. Go to "Service Accounts" tab
5. Click "Generate New Private Key"
6. Save the downloaded JSON file as `serviceAccountKey.json` in the `Code/backend/` directory

**Security:** This file is already in `.gitignore` and will NOT be committed.

### 3. Verify Configuration

Your `.env` file is already configured with:
- Firebase Database URL: `https://vehiclezo-6eca7-default-rtdb.firebaseio.com/`
- Storage Bucket: `vehiclezo-6eca7.appspot.com`
- Port: 3001

### 4. Start the Server

```bash
npm run dev
```

You should see:
```
🚀 Server running on port 3001
📝 Environment: development
🔥 Firebase DB: https://vehiclezo-6eca7-default-rtdb.firebaseio.com/
✅ Firebase Admin SDK initialized successfully
```

### 5. Test the API

```bash
# Health check
curl http://localhost:3001/health
```

## Creating the First Super Admin

Since user registration requires Super Admin authentication, you need to create the first admin manually:

### Option A: Using Firebase Console (Easiest)

1. Go to Firebase Console → Authentication
2. Click "Add User"
3. Enter email and password
4. Copy the User UID
5. Go to Realtime Database
6. Create this structure:
```json
{
  "users": {
    "<paste-uid-here>": {
      "uid": "<paste-uid-here>",
      "email": "admin@sandhyahonda.com",
      "name": "Super Admin",
      "mobile": "9999999999",
      "role": "Super Admin",
      "showroomId": null,
      "createdAt": 1711670400000,
      "isActive": true
    }
  }
}
```
7. Set custom claims using Firebase CLI:
```bash
firebase auth:set-custom-claims <uid> '{"role":"Super Admin","showroomId":null}' --project vehiclezo-6eca7
```

### Option B: Using Node.js Script

Create a file `scripts/createSuperAdmin.js`:

```javascript
require("dotenv").config();
const { auth, db } = require("./src/config/firebase");

async function createSuperAdmin() {
  const email = "admin@sandhyahonda.com";
  const password = "Admin@123";
  const name = "Super Admin";
  const mobile = "9999999999";

  try {
    // Create auth user
    const userRecord = await auth.createUser({
      email,
      password,
      displayName: name,
    });

    // Set custom claims
    await auth.setCustomUserClaims(userRecord.uid, {
      role: "Super Admin",
      showroomId: null,
    });

    // Save to RTDB
    await db.ref(`users/${userRecord.uid}`).set({
      uid: userRecord.uid,
      email,
      name,
      mobile,
      role: "Super Admin",
      showroomId: null,
      createdAt: Date.now(),
      isActive: true,
    });

    console.log("✅ Super Admin created successfully!");
    console.log("Email:", email);
    console.log("Password:", password);
    console.log("UID:", userRecord.uid);
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

createSuperAdmin();
```

Run it:
```bash
node scripts/createSuperAdmin.js
```

## Testing the API

### 1. Login (Frontend)

Use Firebase Auth SDK in your frontend:
```javascript
import { signInWithEmailAndPassword } from "firebase/auth";

const userCredential = await signInWithEmailAndPassword(
  auth, 
  "admin@sandhyahonda.com", 
  "Admin@123"
);
const idToken = await userCredential.user.getIdToken();
```

### 2. Test Endpoints

```bash
# Get current user
curl -H "Authorization: Bearer <your-token>" \
  http://localhost:3001/api/auth/me

# Create a new user
curl -X POST http://localhost:3001/api/auth/register \
  -H "Authorization: Bearer <your-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "manager@sandhyahonda.com",
    "password": "Manager@123",
    "name": "Showroom Manager",
    "mobile": "9876543210",
    "role": "Showroom Manager",
    "showroomId": "SH001"
  }'

# List all users
curl -H "Authorization: Bearer <your-token>" \
  http://localhost:3001/api/users
```

## Troubleshooting

### Error: "Cannot find module './serviceAccountKey.json'"
- You haven't downloaded the Firebase service account key
- Follow step 2 above

### Error: "Invalid token"
- Token expired (Firebase tokens expire after 1 hour)
- Get a fresh token from Firebase Auth

### Error: "CORS error"
- Check `ALLOWED_ORIGINS` in `.env`
- Make sure your frontend URL is included

### Error: "Permission denied"
- Check Firebase Realtime Database Rules
- For development, you can use:
```json
{
  "rules": {
    ".read": "auth != null",
    ".write": "auth != null"
  }
}
```

## Next Steps

Once Phase 1 is working:
1. Test all user management endpoints
2. Integrate with frontend AuthContext
3. Move to Phase 2: Showroom & Vehicle Catalog

## Phase 1 Checklist

- [ ] Dependencies installed
- [ ] Firebase service account key downloaded
- [ ] `.env` configured
- [ ] Server starts without errors
- [ ] Health check responds
- [ ] Super Admin created
- [ ] Can login and get token
- [ ] User registration works
- [ ] User listing works
- [ ] Role-based access control works
