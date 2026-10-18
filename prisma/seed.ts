import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const passwordHash = await bcrypt.hash('password123', 10)

  // 1. Admin
  const admin = await prisma.user.upsert({
    where: { email: 'admin@sthm.ac.id' },
    update: {},
    create: {
      email: 'admin@sthm.ac.id',
      name: 'Super Admin',
      passwordHash: passwordHash,
      role: 'ADMIN',
      isVerified: true,
      provider: 'CREDENTIALS'
    },
  })

  // 2. Consultant
  const consultant = await prisma.user.upsert({
    where: { email: 'konsultan@sthm.ac.id' },
    update: {},
    create: {
      email: 'konsultan@sthm.ac.id',
      name: 'Konsultan Hukum',
      passwordHash: passwordHash,
      role: 'CONSULTANT',
      isVerified: true,
      provider: 'CREDENTIALS',
      consultantProfile: {
        create: {
          type: 'PENGACARA_PUBLIK',
          specialization: ['Pidana', 'Perdata'],
          isAvailable: true,
        }
      }
    },
  })

  // 3. Customer
  const customer = await prisma.user.upsert({
    where: { email: 'customer@gmail.com' },
    update: {},
    create: {
      email: 'customer@gmail.com',
      name: 'Klien Umum',
      passwordHash: passwordHash,
      role: 'CUSTOMER',
      isVerified: true,
      provider: 'CREDENTIALS'
    },
  })

  console.log('Seed berhasil dijalankan! Akun yang dibuat:')
  console.log({ admin, consultant, customer })
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
