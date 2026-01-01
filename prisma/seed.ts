import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import { hashPassword } from '../lib/auth-server'

// Check if DATABASE_URL is set
if (!process.env.DATABASE_URL) {
  console.error('❌ Error: DATABASE_URL environment variable is not set')
  console.error('   Please set DATABASE_URL in your .env file')
  process.exit(1)
}

// Initialize PostgreSQL connection pool
const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)

// Initialize Prisma Client with adapter (required for Prisma 7)
const prisma = new PrismaClient({
  adapter,
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
})

async function main() {
  console.log('🌱 Starting database seed...')

  // Get admin credentials from environment variables
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@fabnest3d.com'
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123'
  const adminName = process.env.ADMIN_NAME || 'Admin User'

  // Check if admin already exists
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail }
  })

  if (existingAdmin) {
    console.log(`✅ Admin user already exists: ${adminEmail}`)
    
    // Update password if it's the default (for development)
    if (adminPassword === 'admin123' && process.env.NODE_ENV !== 'production') {
      const hashedPassword = await hashPassword(adminPassword)
      await prisma.user.update({
        where: { email: adminEmail },
        data: { password: hashedPassword }
      })
      console.log('🔑 Updated admin password')
    }
  } else {
    // Create admin user
    const hashedPassword = await hashPassword(adminPassword)
    
    const admin = await prisma.user.create({
      data: {
        email: adminEmail,
        password: hashedPassword,
        name: adminName,
        role: 'admin',
      }
    })

    console.log(`✅ Created admin user: ${admin.email}`)
    console.log(`   Name: ${admin.name}`)
    console.log(`   ID: ${admin.id}`)
  }

  // Seed some sample products if needed
  const productCount = await prisma.product.count()
  if (productCount === 0) {
    console.log('📦 No products found, skipping product seeding...')
    console.log('   (You can add products through the admin panel)')
  }

  console.log('✨ Seed completed!')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
    await pool.end()
  })

