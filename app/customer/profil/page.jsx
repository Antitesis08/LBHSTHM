import { redirect } from 'next/navigation';
import { requireRole } from '../../../lib/auth';
import { prisma } from '../../../lib/prisma';
import AccountSecurityForm from '../../../src/components/AccountSecurityForm';

export default async function CustomerProfilePage() {
  const { user, error } = await requireRole(['CUSTOMER']);
  if (error) redirect('/unauthorized');

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id }
  });

  if (!dbUser) redirect('/login');

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Profil Akun</h1>
      <p style={{ color: '#657068', marginBottom: 24 }}>Kelola informasi pribadi dan keamanan akun Anda.</p>
      
      <div style={{ background: '#fff', borderRadius: 12, padding: 20, border: '1px solid #e5e7eb' }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>Informasi Pribadi</h2>
        <div style={{ display: 'grid', gap: 16 }}>
          <div>
            <div style={{ fontSize: 13, color: '#657068', marginBottom: 4 }}>Nama Lengkap</div>
            <div style={{ fontWeight: 500 }}>{dbUser.name}</div>
          </div>
          <div>
            <div style={{ fontSize: 13, color: '#657068', marginBottom: 4 }}>Alamat Email</div>
            <div style={{ fontWeight: 500 }}>{dbUser.email}</div>
          </div>
          <div>
            <div style={{ fontSize: 13, color: '#657068', marginBottom: 4 }}>Nomor Telepon</div>
            <div style={{ fontWeight: 500 }}>{dbUser.phone || '-'}</div>
          </div>
        </div>
      </div>

      <AccountSecurityForm user={dbUser} />
    </div>
  );
}
