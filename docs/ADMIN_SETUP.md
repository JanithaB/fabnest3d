# Admin User Setup Guide

This guide explains how to seed an admin user to the database and manage admin users.

## Seeding Admin User

### Method 1: Using Environment Variables (Recommended)

1. **Add to your `.env` file:**
   ```env
   ADMIN_EMAIL=admin@fabnest3d.com
   ADMIN_PASSWORD=your-secure-password-here
   ADMIN_NAME=Admin User
   ```

2. **Run the seed script:**
   ```bash
   pnpm db:seed
   ```

   Or if you haven't installed tsx yet:
   ```bash
   pnpm install
   pnpm db:seed
   ```

### Method 2: Using Default Values (Development Only)

If you don't set environment variables, the seed script will use:
- Email: `admin@fabnest3d.com`
- Password: `admin123` (⚠️ Change this in production!)
- Name: `Admin User`

**⚠️ WARNING:** Never use default credentials in production!

## Adding More Admins

### Option 1: Using the Admin API (Recommended)

Once you have one admin user, you can create more admins through the API:

**Create Admin User:**
```bash
POST /api/admin/users
Authorization: Bearer <admin_jwt_token>
Content-Type: application/json

{
  "email": "newadmin@fabnest3d.com",
  "password": "secure-password",
  "name": "New Admin",
  "role": "admin"
}
```

**Update User to Admin:**
```bash
PUT /api/admin/users/{user_id}
Authorization: Bearer <admin_jwt_token>
Content-Type: application/json

{
  "role": "admin"
}
```

### Option 2: Using Prisma Studio

1. Run Prisma Studio:
   ```bash
   pnpm db:studio
   ```

2. Navigate to the `User` model
3. Find the user you want to make admin
4. Edit the `role` field to `admin`
5. Save

### Option 3: Using SQL

```sql
UPDATE users 
SET role = 'admin' 
WHERE email = 'user@example.com';
```

## Admin API Endpoints

### GET `/api/admin/users`
List all users (admin only)

**Query Parameters:**
- `limit` - Number of results (1-100, default: 50)
- `offset` - Pagination offset (default: 0)
- `role` - Filter by role (`user` or `admin`)

**Response:**
```json
{
  "users": [
    {
      "id": "...",
      "email": "user@example.com",
      "name": "User Name",
      "role": "admin",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "total": 10,
  "limit": 50,
  "offset": 0
}
```

### POST `/api/admin/users`
Create a new user (admin only)

**Request:**
```json
{
  "email": "newuser@example.com",
  "password": "password123",
  "name": "New User",
  "role": "user"  // or "admin"
}
```

### PUT `/api/admin/users/[id]`
Update a user (admin only)

**Request:**
```json
{
  "email": "updated@example.com",  // optional
  "name": "Updated Name",          // optional
  "password": "newpassword",        // optional
  "role": "admin"                   // optional
}
```

**Note:** Admins cannot remove their own admin role or delete themselves.

### DELETE `/api/admin/users/[id]`
Delete a user (admin only)

**Note:** 
- Cannot delete yourself
- Cannot delete the last admin user

## Security Features

✅ **Password Hashing:** All passwords are hashed with bcrypt
✅ **Input Validation:** Email, password, and name are validated
✅ **Role Protection:** Admins cannot remove their own admin role
✅ **Last Admin Protection:** Cannot delete the last admin user
✅ **Self-Delete Protection:** Admins cannot delete themselves

## Example: Creating Admin via API

```bash
# 1. Login as existing admin
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@fabnest3d.com","password":"admin123"}'

# Response contains token:
# {"success":true,"token":"eyJhbGc...","user":{...}}

# 2. Create new admin using the token
curl -X POST http://localhost:3000/api/admin/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGc..." \
  -d '{
    "email": "newadmin@fabnest3d.com",
    "password": "secure-password-123",
    "name": "New Admin User",
    "role": "admin"
  }'
```

## Troubleshooting

### Seed script fails
- Make sure database is running and connected
- Check `DATABASE_URL` in `.env` is correct
- Run `pnpm db:push` first to ensure schema is synced

### Cannot create admin via API
- Verify you're logged in as an admin
- Check the JWT token is valid
- Ensure the token is in the `Authorization: Bearer <token>` header

### Admin user not working
- Verify password was hashed correctly
- Check user role in database is `admin` (not `Admin` or `ADMIN`)
- Try logging in again after seeding

## Production Checklist

- [ ] Set `ADMIN_EMAIL` in environment variables
- [ ] Set `ADMIN_PASSWORD` to a strong password (min 12 characters)
- [ ] Change default admin password if using defaults
- [ ] Create at least 2 admin users (for redundancy)
- [ ] Document admin credentials securely
- [ ] Enable 2FA if possible (future enhancement)

