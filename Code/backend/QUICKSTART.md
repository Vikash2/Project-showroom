# 🚀 Quick Start Guide - Phase 1

## Step-by-Step Setup (5 minutes)

### Step 1: Install Dependencies
```bash
cd Code/backend
npm install
```

### Step 2: Download Firebase Service Account Key

**This is the most important step!**

1. Open [Firebase Console](https://console.firebase.google.com/)
2. Select project: **vehiclezo-6eca7**
3. Click ⚙️ (Settings) → **Project Settings**
4. Go to **Service Accounts** tab
5. Click **Generate New Private Key** button
6. Save the downloaded file as `serviceAccountKey.json` in the `Code/backend/` folder

Your folder should look like:
```
Code/backend/
├── serviceAccountKey.json  ← This file (DO NOT commit!)
├── index.js
├── package.json
└── ...
```

### Step 3: Create First Super Admin
```bash
npm run create-admin
```

You'll see:
```
🎉 Super Admin created successfully!
==================================================
Email:    admin@sandhyahonda.com
Password: Admin@123
UID:      abc123xyz...
==================================================
```

**Save these credentials!**

### Step 4: Start the Server
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

### Step 5: Test It
```bash
curl http://localhost:3001/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2026-03-29T...",
  "environment": "development"
}
```

## ✅ You're Done!

Phase 1 backend is now running. The API is ready at `http://localhost:3001`

## What's Next?

### Test the API

1. **Login from your frontend** using Firebase Auth:
   - Email: `admin@sandhyahonda.com`
   - Password: `Admin@123`

2. **Get the ID token** and test endpoints:
```bash
# Replace <TOKEN> with your actual Firebase ID token
curl -H "Authorization: Bearer <TOKEN>" \
  http://localhost:3001/api/auth/me
```

### Integrate with Frontend

Update your `AuthContext.tsx` to use the backend API instead of localStorage. See `PHASE1_COMPLETE.md` for detailed integration steps.

### Create More Users

Once logged in as Super Admin, you can create other users:
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "manager@sandhyahonda.com",
    "password": "Manager@123",
    "name": "Showroom Manager",
    "mobile": "9876543210",
    "role": "Showroom Manager",
    "showroomId": "SH001"
  }'
```

## Troubleshooting

### ❌ "Cannot find module './serviceAccountKey.json'"
→ You skipped Step 2. Download the Firebase service account key.

### ❌ "Email already exists"
→ The admin user already exists. You can skip Step 3 or use a different email.

### ❌ "EADDRINUSE: address already in use"
→ Port 3001 is busy. Change `PORT` in `.env` or stop the other process.

### ❌ "Permission denied" in Firebase
→ Update Firebase Realtime Database Rules:
```json
{
  "rules": {
    ".read": "auth != null",
    ".write": "auth != null"
  }
}
```

## Need Help?

- Check `SETUP.md` for detailed instructions
- Check `PHASE1_COMPLETE.md` for implementation details
- Check `README.md` for API documentation

## Ready for Phase 2?

Once Phase 1 is working and tested, you can proceed to Phase 2: Showroom & Vehicle Catalog APIs.
