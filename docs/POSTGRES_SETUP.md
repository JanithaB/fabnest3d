# PostgreSQL Setup Guide

This guide will help you set up PostgreSQL for the Fabnest3D project.

## Prerequisites

1. **Install PostgreSQL** on your system:
   - **Windows**: Download from [PostgreSQL Downloads](https://www.postgresql.org/download/windows/)
   - **macOS**: `brew install postgresql@16` or download from [PostgreSQL Downloads](https://www.postgresql.org/download/macosx/)
   - **Linux**: `sudo apt-get install postgresql postgresql-contrib` (Ubuntu/Debian) or use your distribution's package manager

2. **Verify Installation**:
   ```bash
   psql --version
   ```

## Setup Steps

### 1. Create a Database

Start PostgreSQL service (if not already running):

**Windows**:
- PostgreSQL service should start automatically, or start it from Services
- Open "SQL Shell (psql)" or "pgAdmin"

**macOS/Linux**:
```bash
# Start PostgreSQL service
brew services start postgresql@16  # macOS
# or
sudo systemctl start postgresql   # Linux
```

### 2. Connect to PostgreSQL

Open a terminal and connect to PostgreSQL:

```bash
# Default connection (as postgres user)
psql -U postgres

# Or if you have a different user
psql -U your_username -d postgres
```

### 3. Create Database and User

Once connected to PostgreSQL, run these commands:

```sql
-- Create database
CREATE DATABASE fabnest3d;

-- Create a user (optional, you can use postgres user)
CREATE USER fabnest_user WITH PASSWORD 'your_secure_password';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE fabnest3d TO fabnest_user;

-- Connect to the new database
\c fabnest3d

-- Grant schema privileges (if using a custom user)
GRANT ALL ON SCHEMA public TO fabnest_user;
```

### 4. Configure Environment Variables

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and update the `DATABASE_URL` with your credentials:
   ```
   DATABASE_URL="postgresql://postgres:your_password@localhost:5432/fabnest3d?schema=public"
   ```
   
   Or if you created a custom user:
   ```
   DATABASE_URL="postgresql://fabnest_user:your_secure_password@localhost:5432/fabnest3d?schema=public"
   ```

### 5. Install Dependencies

```bash
pnpm install
```

This will install `dotenv` and ensure all Prisma dependencies are available.

### 6. Generate Prisma Client

```bash
pnpm db:generate
```

### 7. Run Database Migrations

Push your schema to the database:

```bash
pnpm db:push
```

Or create a migration:

```bash
pnpm db:migrate
```

### 8. Verify Connection

Open Prisma Studio to verify everything is working:

```bash
pnpm db:studio
```

This will open a browser window where you can view and manage your database.

## Useful Commands

- `pnpm db:generate` - Generate Prisma Client
- `pnpm db:push` - Push schema changes to database (for development)
- `pnpm db:migrate` - Create and apply migrations (for production)
- `pnpm db:studio` - Open Prisma Studio (database GUI)
- `pnpm db:seed` - Seed the database (if seed script is configured)

## Troubleshooting

### Connection Refused
- Ensure PostgreSQL service is running
- Check that the port (default: 5432) is correct
- Verify firewall settings

### Authentication Failed
- Double-check username and password in `.env`
- Ensure the user has proper permissions

### Database Does Not Exist
- Make sure you created the database (step 3)
- Verify the database name in `DATABASE_URL` matches the created database

### Port Already in Use
- Check if another PostgreSQL instance is running
- Change the port in PostgreSQL config or use a different port in `DATABASE_URL`

## Using Docker (Alternative)

If you prefer using Docker:

```bash
# Run PostgreSQL in Docker
docker run --name fabnest3d-postgres \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=fabnest3d \
  -p 5432:5432 \
  -d postgres:16

# Then use this DATABASE_URL in .env:
# DATABASE_URL="postgresql://postgres:password@localhost:5432/fabnest3d?schema=public"
```

