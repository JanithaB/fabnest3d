# Authentication System Setup

The authentication system has been fully implemented with database integration.

## What's Implemented

### 1. Database Integration
- ✅ User authentication now uses PostgreSQL database
- ✅ Passwords are hashed with bcrypt (10 rounds)
- ✅ JWT tokens generated on login/register
- ✅ Token expiration: 7 days

### 2. API Endpoints

#### POST `/api/auth/login`
Authenticates a user and returns a JWT token.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (Success):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "user",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Response (Error):**
```json
{
  "error": "Invalid email or password"
}
```

#### POST `/api/auth/register`
Creates a new user account.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}
```

**Response (Success):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "user",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Response (Error):**
```json
{
  "error": "Email already registered"
}
```

### 3. Client-Side Updates
- ✅ `lib/auth.ts` now calls API endpoints
- ✅ JWT tokens stored in Zustand store
- ✅ Tokens automatically included in API requests
- ✅ File upload component uses tokens from auth store

### 4. Security Features
- ✅ Password hashing with bcrypt
- ✅ JWT token authentication
- ✅ Email validation
- ✅ Password length validation (min 6 characters)
- ✅ Case-insensitive email matching
- ✅ Email trimming

## Installation Steps

1. **Install dependencies:**
   ```bash
   pnpm install
   ```

2. **Set JWT_SECRET in `.env`:**
   ```env
   JWT_SECRET=your-super-secret-key-min-32-chars-change-this-in-production
   ```

3. **Run database migrations:**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

4. **Create an admin user (optional):**
   You can create an admin user through the registration endpoint, then manually update the role in the database:
   ```sql
   UPDATE users SET role = 'admin' WHERE email = 'admin@fabnest3d.com';
   ```

## Usage

### Login
```typescript
import { useAuth } from '@/lib/auth'

const { login } = useAuth()

const result = await login('user@example.com', 'password123')
if (result.success) {
  // User is logged in, token is stored
} else {
  console.error(result.error)
}
```

### Register
```typescript
const { signup } = useAuth()

const result = await signup('user@example.com', 'password123', 'John Doe')
if (result.success) {
  // User is registered and logged in
} else {
  console.error(result.error)
}
```

### Access Token
```typescript
const { token } = useAuth.getState()

// Use token in API requests
fetch('/api/protected', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
```

### Logout
```typescript
const { logout } = useAuth()
logout() // Clears user and token
```

## Migration from Mock Auth

The system has been migrated from mock data to database:
- ❌ Old: Mock users array in `lib/auth.ts`
- ✅ New: Database queries with Prisma
- ❌ Old: Plain text password comparison
- ✅ New: bcrypt password hashing
- ❌ Old: No tokens
- ✅ New: JWT tokens with 7-day expiration

## Testing

1. **Register a new user:**
   ```bash
   curl -X POST http://localhost:3000/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"test123","name":"Test User"}'
   ```

2. **Login:**
   ```bash
   curl -X POST http://localhost:3000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"test123"}'
   ```

3. **Use token in protected route:**
   ```bash
   curl -X GET http://localhost:3000/api/upload \
     -H "Authorization: Bearer YOUR_TOKEN_HERE"
   ```

## Next Steps

1. ✅ Authentication API routes - **COMPLETE**
2. ⏳ Products API routes
3. ⏳ Orders API routes
4. ⏳ Gallery API routes
5. ⏳ User profile API routes
6. ⏳ Password reset functionality
7. ⏳ Email verification

## Security Notes

- **JWT_SECRET**: Must be at least 32 characters in production
- **Password hashing**: Uses bcrypt with 10 rounds (configurable)
- **Token expiration**: 7 days (configurable in `lib/auth-server.ts`)
- **Email normalization**: Emails are lowercased and trimmed before storage
- **Error messages**: Generic error messages to prevent user enumeration

