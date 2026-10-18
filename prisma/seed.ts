import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const passwordHash = await bcrypt.hash('password123', 10)

  // 1. Kepala LKBH STHM (ADMIN)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@sthm.ac.id' },
    update: { role: 'ADMIN', name: 'Kolonel Chk R. Deltanto, S.H., M.H. (Kepala LKBH)' },
    create: {
      email: 'admin@sthm.ac.id',
      name: 'Kolonel Chk R. Deltanto, S.H., M.H. (Kepala LKBH)',
      passwordHash: passwordHash,
      role: 'ADMIN',
      isVerified: true,
      provider: 'CREDENTIALS'
    },
  })

  // 2. Sekretaris LKBH STHM
  const sekretaris = await prisma.user.upsert({
    where: { email: 'sekretaris@sthm.ac.id' },
    update: { role: 'SEKRETARIS', name: 'Letkol Chk Hendra Wijaya, S.H. (Sekretaris LKBH)' },
    create: {
      email: 'sekretaris@sthm.ac.id',
      name: 'Letkol Chk Hendra Wijaya, S.H. (Sekretaris LKBH)',
      passwordHash: passwordHash,
      role: 'SEKRETARIS',
      isVerified: true,
      provider: 'CREDENTIALS'
    },
  })

  // 3. Bendahara LKBH STHM
  const bendahara = await prisma.user.upsert({
    where: { email: 'bendahara@sthm.ac.id' },
    update: { role: 'BENDAHARA', name: 'Mayor Chk (K) Siti Rahmawati, S.H. (Bendahara LKBH)' },
    create: {
      email: 'bendahara@sthm.ac.id',
      name: 'Mayor Chk (K) Siti Rahmawati, S.H. (Bendahara LKBH)',
      passwordHash: passwordHash,
      role: 'BENDAHARA',
      isVerified: true,
      provider: 'CREDENTIALS'
    },
  })

  // 4. Advokat Publik / Konsultan Hukum
  const consultant = await prisma.user.upsert({
    where: { email: 'konsultan@sthm.ac.id' },
    update: { role: 'CONSULTANT', name: 'Mayor Chk Dian Pratama, S.H., M.H. (Advokat Publik)' },
    create: {
      email: 'konsultan@sthm.ac.id',
      name: 'Mayor Chk Dian Pratama, S.H., M.H. (Advokat Publik)',
      passwordHash: passwordHash,
      role: 'CONSULTANT',
      isVerified: true,
      provider: 'CREDENTIALS',
      consultantProfile: {
        create: {
          type: 'ADVOKAT',
          specialization: ['Pidana', 'Perdata', 'Hukum Militer', 'TUN'],
          isAvailable: true,
          barNumber: 'ADV/LKBH-STHM/2026/042'
        }
      }
    },
  })

  // 5. Paralegal / Mahasiswa Praktikan Klinik Hukum
  const paralegal = await prisma.user.upsert({
    where: { email: 'paralegal@sthm.ac.id' },
    update: { role: 'PARALEGAL', name: 'Ahmad Fauzi (Mahasiswa Praktikan STHM)' },
    create: {
      email: 'paralegal@sthm.ac.id',
      name: 'Ahmad Fauzi (Mahasiswa Praktikan STHM)',
      passwordHash: passwordHash,
      role: 'PARALEGAL',
      isVerified: true,
      provider: 'CREDENTIALS'
    },
  })

  // 6. Dewan Pengawas & Pembina LKBH STHM
  const pengawas = await prisma.user.upsert({
    where: { email: 'pengawas@sthm.ac.id' },
    update: { role: 'PENGAWAS', name: 'Brigjen TNI (Purn) Soedirman, S.H. (Dewan Pengawas)' },
    create: {
      email: 'pengawas@sthm.ac.id',
      name: 'Brigjen TNI (Purn) Soedirman, S.H. (Dewan Pengawas)',
      passwordHash: passwordHash,
      role: 'PENGAWAS',
      isVerified: true,
      provider: 'CREDENTIALS'
    },
  })

  // 7. Customer / Klien Pemohon
  const customer = await prisma.user.upsert({
    where: { email: 'customer@gmail.com' },
    update: { role: 'CUSTOMER', name: 'Budi Santoso (Klien Pemohon)' },
    create: {
      email: 'customer@gmail.com',
      name: 'Budi Santoso (Klien Pemohon)',
      passwordHash: passwordHash,
      role: 'CUSTOMER',
      isVerified: true,
      provider: 'CREDENTIALS'
    },
  })

  // Sample initial financial records (Lampiran F)
  const initialFinancesCount = await prisma.financialRecord.count()
  if (initialFinancesCount === 0) {
    await prisma.financialRecord.createMany({
      data: [
        {
          type: 'INCOME',
          category: 'Dukungan/Hibah Institusi STHM',
          amount: 50000000,
          description: 'Alokasi DIPA Anggaran Operasional LKBH STHM Tahun 2026',
          recordedBy: 'Mayor Chk (K) Siti Rahmawati, S.H.'
        },
        {
          type: 'INCOME',
          category: 'Kerjasama Bantuan Hukum Kemenkumham',
          amount: 25000000,
          description: 'Dana Verifikasi Penyaluran Bantuan Hukum Pro Bono',
          recordedBy: 'Mayor Chk (K) Siti Rahmawati, S.H.'
        },
        {
          type: 'EXPENSE',
          category: 'Operasional Litigasi dan Non-Litigasi',
          amount: 4500000,
          description: 'Biaya transportasi pendampingan sidang dan akomodasi perkara perdata',
          recordedBy: 'Mayor Chk (K) Siti Rahmawati, S.H.'
        },
        {
          type: 'EXPENSE',
          category: 'Administrasi dan Kesekretariatan',
          amount: 1750000,
          description: 'Pengadaan ATK, materai berkas perkara, dan penggandaan berkas dossier',
          recordedBy: 'Mayor Chk (K) Siti Rahmawati, S.H.'
        }
      ]
    })
  }

  console.log('Seed 7 Role & Keuangan LKBH STHM berhasil:')
  console.log({
    Admin: admin.email,
    Sekretaris: sekretaris.email,
    Bendahara: bendahara.email,
    Konsultan: consultant.email,
    Paralegal: paralegal.email,
    Pengawas: pengawas.email,
    Customer: customer.email
  })
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
