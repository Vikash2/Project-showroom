# User Creation Payloads - Quick Reference

## API Endpoint

```
POST http://localhost:3001/api/auth/register
Authorization: Bearer <super-admin-token>
Content-Type: application/json
```

## Required Headers

```
Authorization: Bearer <firebase-id-token>
Content-Type: application/json
```

## Payload Structure

```typescript
{
  "email": string,        // Valid email format
  "password": string,     // Minimum 6 characters
  "name": string,         // Full name
  "mobile": string,       // 10 digits
  "role": string,         // See roles below
  "showroomId": string    // Optional for Super Admin, required for others
}
```

## Example Payloads

### 1. Super Admin (No Showroom)

```json
{
  "email": "admin@sandhyahonda.com",
  "password": "Admin@123",
  "name": "Super Admin",
  "mobile": "9999999999",
  "role": "Super Admin"
}
```

### 2. Showroom Manager

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

### 3. Sales Executive

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

### 4. Documentation Officer

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

### 5. Accountant

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

## Valid Roles

- `Super Admin`
- `Showroom Manager`
- `Sales Executive`
- `Documentation Officer`
- `Accountant`

**Note:** `Customer` role exists but cannot access admin portal.

## Validation Rules

| Field | Rule | Example |
|-------|------|---------|
| email | Valid email format | `user@example.com` |
| password | Min 6 characters | `Pass@123` |
| name | Min 2 characters | `John Doe` |
| mobile | Exactly 10 digits | `9876543210` |
| role | Must be valid role | `Sales Executive` |
| showroomId | Required for non-Super Admin | `SH001` |

## Using cURL

### Create Super Admin
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@sandhyahonda.com",
    "password": "Admin@123",
    "name": "Super Admin",
    "mobile": "9999999999",
    "role": "Super Admin"
  }'
```

### Create Showroom Manager
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
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

## Using Frontend UI

1. Login as Super Admin
2. Navigate to User Management page
3. Click "Create User" button
4. Fill in the form:
   - **Full Name**: Enter user's full name
   - **Email**: Enter work email
   - **Password**: Min 6 characters
   - **Mobile**: 10-digit number
   - **Role**: Select from dropdown
   - **Showroom**: Select if not Super Admin
5. Click "Create User"

## Success Response

```json
{
  "message": "User created successfully",
  "user": {
    "id": "firebase-uid-here",
    "uid": "firebase-uid-here",
    "email": "user@example.com",
    "name": "User Name",
    "mobile": "9876543210",
    "role": "Sales Executive",
    "showroomId": "SH001",
    "createdAt": 1711670400000,
    "isActive": true
  }
}
```

## Error Responses

### Email Already Exists
```json
{
  "error": "Email already exists",
  "code": "EMAIL_EXISTS"
}
```

### Validation Error
```json
{
  "error": "Validation failed",
  "code": "VALIDATION_ERROR",
  "details": {
    "fieldErrors": {
      "mobile": ["Mobile must be 10 digits"]
    }
  }
}
```

### Unauthorized
```json
{
  "error": "Access denied. Required roles: Super Admin",
  "code": "ACCESS_DENIED"
}
```

## Testing Checklist

- [ ] Super Admin can be created via backend script
- [ ] Super Admin can login to frontend
- [ ] Super Admin can access User Management page
- [ ] Create user form validates all fields
- [ ] Showroom dropdown shows available showrooms
- [ ] Super Admin role doesn't require showroom
- [ ] Other roles require showroom selection
- [ ] Created users appear in the list
- [ ] Created users can login
- [ ] Role-based access control works
- [ ] Mobile number accepts only digits
- [ ] Email validation works
- [ ] Password minimum length enforced

## Common Mistakes

❌ **Wrong:** Showroom ID for Super Admin
```json
{
  "role": "Super Admin",
  "showroomId": "SH001"  // ← Remove this
}
```

✅ **Correct:** No showroom for Super Admin
```json
{
  "role": "Super Admin"
  // No showroomId field
}
```

❌ **Wrong:** Missing showroom for staff
```json
{
  "role": "Sales Executive"
  // Missing showroomId
}
```

✅ **Correct:** Showroom required for staff
```json
{
  "role": "Sales Executive",
  "showroomId": "SH001"
}
```

❌ **Wrong:** Short password
```json
{
  "password": "123"  // ← Too short
}
```

✅ **Correct:** Min 6 characters
```json
{
  "password": "Pass@123"
}
```

## Quick Start

1. **Backend:** Create first admin
   ```bash
   cd Code/backend
   npm run create-admin
   ```

2. **Frontend:** Login with admin credentials
   - Email: `admin@sandhyahonda.com`
   - Password: `Admin@123`

3. **Create users** via UI or API

4. **Test login** with new users

---

For detailed integration guide, see `BACKEND_INTEGRATION_GUIDE.md`
