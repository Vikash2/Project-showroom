# Authentication System Guide

## Overview

This application uses a robust authentication system built with **React**, **TypeScript**, **Supabase Auth**, and a **Node.js backend**. The system provides secure login, role-based access control (RBAC), and protected routes.

## Architecture

```
┌─────────────────┐
│  React Frontend │
│   (TypeScript)  │
└────────┬────────┘
         │
         ├─ AuthContext (State Management)
         ├─ LoginPage (UI)
         ├─ ProtectedRoute (Route Guards)
         └─ authService (API Calls)
         │
         ▼
┌─────────────────┐
│ Supabase Auth   │ ◄─── JWT Token Generation
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Node.js API    │
│   (Backend)     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Supabase DB     │ ◄─── User Profiles & Roles
└─────────────────┘
```

## Key Components

### 1. AuthContext (`src/state/AuthContext.tsx`)

The central authentication state manager that:
- Manages user session and authentication state
- Handles login/logout operations
- Listens to Supabase auth state changes
- Provides authentication status to the entire app
- Prevents infinite loops with proper memoization

**Key Features:**
- ✅ No infinite loops (uses `useCallback` for memoization)
- ✅ Proper initialization state handling
- ✅ Automatic token refresh
- ✅ Role-based access control
- ✅ Customer role blocking (staff-only access)

### 2. LoginPage (`src/pages/auth/LoginPage.tsx`)

The login UI component that:
- Provides email/password input fields
- Shows/hides password toggle
- Displays error messages
- Handles form validation
- Redirects after successful login

**Features:**
- Modern, responsive design
- Dark mode support
- Loading states
- Error handling with user-friendly messages
- Auto-redirect if already authenticated

### 3. ProtectedRoute (`src/components/auth/ProtectedRoute.tsx`)

Route guard component that:
- Protects routes from unauthenticated access
- Enforces role-based permissions
- Shows loading spinner during auth check
- Redirects unauthorized users

**Usage:**
```tsx
<Route path="/admin" element={
  <ProtectedRoute allowedRoles={['Super Admin', 'Showroom Manager']}>
    <AdminDashboard />
  </ProtectedRoute>
} />
```

### 4. Auth Service (`src/services/authService.ts`)

Service layer for authentication operations:
- `loginWithEmail()` - Authenticate user
- `logout()` - Sign out user
- `fetchUserProfile()` - Get user data from backend
- `getCurrentSession()` - Get current session
- `refreshSession()` - Refresh expired tokens

### 5. Auth Utilities (`src/utils/auth.ts`)

Helper functions for:
- Role checking and validation
- Role hierarchy management
- Email/password validation
- Role display names and colors
- Route access control

### 6. Custom Hooks (`src/hooks/useAuthGuard.ts`)

Reusable hooks for authentication:
- `useAuthGuard()` - Guard pages with role requirements
- `useGuestOnly()` - Redirect authenticated users from public pages

## User Roles

The system supports the following roles (in order of hierarchy):

1. **Super Admin** - Full system access
2. **Showroom Manager** - Manage showroom operations
3. **Accountant** - Financial operations
4. **Documentation Officer** - Document management
5. **Sales Executive** - Sales and leads
6. **Cashier** - Payment processing
7. **Customer** - Public access (blocked from staff portal)

## Authentication Flow

### Login Flow

```
1. User enters email/password
   ↓
2. LoginPage calls AuthContext.loginWithEmail()
   ↓
3. AuthContext authenticates with Supabase
   ↓
4. Supabase returns JWT token
   ↓
5. AuthContext fetches user profile from backend
   ↓
6. Backend validates token and returns user data
   ↓
7. AuthContext checks if user is staff (not customer)
   ↓
8. If valid staff: Set user state and redirect
   If customer: Sign out and show error
   If error: Display error message
```

### Session Management

- **Automatic Token Refresh**: Supabase automatically refreshes tokens
- **Session Persistence**: Sessions persist across page refreshes
- **Token Expiry Handling**: API interceptor handles 401 errors
- **Logout**: Clears session and redirects to login

### Protected Routes

```tsx
// Example: Protect admin routes
<Route path="/admin" element={
  <ProtectedRoute allowedRoles={['Super Admin', 'Showroom Manager']}>
    <AdminLayout />
  </ProtectedRoute>
}>
  <Route index element={<AdminDashboard />} />
  <Route path="vehicles" element={<VehicleManagement />} />
</Route>
```

## API Integration

### Backend Authentication Middleware

The backend validates JWT tokens on protected routes:

```javascript
// Code/backend/src/middleware/authenticate.js
async function authenticate(req, res, next) {
  const token = req.headers.authorization?.split('Bearer ')[1];
  const { data: { user } } = await supabase.auth.getUser(token);
  
  // Fetch user profile from database
  const userProfile = await getUserProfile(user.id);
  
  req.user = userProfile;
  next();
}
```

### API Interceptor

The frontend API client automatically adds auth tokens:

```typescript
// Code/frontend/src/services/api.ts
api.interceptors.request.use(async (config) => {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
  }
  
  return config;
});
```

## Environment Variables

### Frontend (`.env`)

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_API_BASE_URL=http://localhost:3001
```

### Backend (`.env`)

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
PORT=3001
```

## Usage Examples

### Using Auth in Components

```tsx
import { useAuth } from '../state/AuthContext';

function MyComponent() {
  const { user, isAuthenticated, logout } = useAuth();
  
  if (!isAuthenticated) {
    return <div>Please login</div>;
  }
  
  return (
    <div>
      <p>Welcome, {user.fullName}!</p>
      <p>Role: {user.role}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

### Role-Based UI

```tsx
import { useAuth } from '../state/AuthContext';

function AdminPanel() {
  const { user, hasRole } = useAuth();
  
  return (
    <div>
      {hasRole(['Super Admin', 'Showroom Manager']) && (
        <button>Manage Showrooms</button>
      )}
      
      {hasRole(['Super Admin', 'Accountant']) && (
        <button>View Reports</button>
      )}
    </div>
  );
}
```

### Using Auth Guard Hook

```tsx
import { useAuthGuard } from '../hooks/useAuthGuard';

function AdminPage() {
  const { user } = useAuthGuard(['Super Admin', 'Showroom Manager']);
  
  // This component only renders if user has required role
  return <div>Admin Content</div>;
}
```

## Security Best Practices

✅ **Implemented:**
- JWT token-based authentication
- Secure token storage (Supabase handles this)
- Automatic token refresh
- Role-based access control
- Customer role blocking from staff portal
- API request/response interceptors
- Timeout handling for API calls
- Proper error handling and user feedback

✅ **Backend Security:**
- Service role key never exposed to frontend
- Token validation on every protected route
- User profile verification
- Role enforcement at API level

## Troubleshooting

### Issue: Infinite Loop

**Solution:** The new AuthContext uses `useCallback` to memoize functions and prevent infinite re-renders.

### Issue: Login Redirects Immediately

**Solution:** The new LoginPage waits for AuthContext to complete login before redirecting.

### Issue: Backend Not Responding

**Solution:** 
1. Ensure backend is running: `cd Code/backend && npm start`
2. Check backend is on port 3001
3. Verify environment variables are set

### Issue: Token Expired

**Solution:** Supabase automatically refreshes tokens. If refresh fails, user is redirected to login.

### Issue: Customer Can't Access

**Solution:** This is intentional. Only staff roles can access the admin portal.

## Testing

### Test User Creation

```bash
# Create a test user (Super Admin only)
cd Code/backend
node scripts/createSuperAdmin.js
```

### Test Login

1. Start backend: `cd Code/backend && npm start`
2. Start frontend: `cd Code/frontend && npm run dev`
3. Navigate to `http://localhost:5173/login`
4. Enter test credentials
5. Verify redirect to `/admin`

## Migration from Old System

If migrating from the old authentication system:

1. ✅ Remove old AuthContext implementation
2. ✅ Update LoginPage to use new AuthContext
3. ✅ Update ProtectedRoute with new props
4. ✅ Replace direct Supabase calls with authService
5. ✅ Update components using `useAuth()` hook

## Future Enhancements

- [ ] Multi-factor authentication (MFA)
- [ ] Password reset flow
- [ ] Email verification
- [ ] Session management dashboard
- [ ] Logout from all devices
- [ ] Login history tracking
- [ ] Biometric authentication (mobile)

## Support

For issues or questions:
1. Check console logs for detailed error messages
2. Verify environment variables are correct
3. Ensure backend is running and accessible
4. Check Supabase dashboard for auth logs
5. Review this guide for common solutions

---

**Last Updated:** 2025
**Version:** 2.0.0
