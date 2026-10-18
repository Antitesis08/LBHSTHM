import { redirect } from 'next/navigation';
import { requireRole } from '../../../lib/auth';
import { prisma } from '../../../lib/prisma';
import Link from 'next/link';
import UserActions from '../../../src/components/UserActions';

export default async function AdminUsersPage({ searchParams }) {
  const { user, error } = await requireRole(['ADMIN']);
  if (error) redirect('/unauthorized');

  const roleFilter = (await searchParams)?.role || '';

  const users = await prisma.user.findMany({
    where: roleFilter ? { role: roleFilter } : undefined,
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      isVerified: true,
      isActive: true,
      createdAt: true,
      consultantProfile: {
        select: {
          bio: true,
          specialization: true,
          isAvailable: true,
          _count: {
            select: { casesAssigned: true }
          }
        }
      },
      _count: {
        select: {
          casesAsClient: true,
        }
      },
    },
    orderBy: { createdAt: 'desc' }
  });

  const roleMap = {
    CUSTOMER: { label: 'Klien', color: '#1e40af', bg: '#dbeafe' },
    CONSULTANT: { label: 'Konsultan', color: '#92400e', bg: '#fef3c7' },
    ADMIN: { label: 'Admin', color: '#166534', bg: '#dcfce7' },
  };

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>Manajemen User</h1>
          <p style={{ color: '#657068' }}>Kelola pengguna sistem LBH STHM berdasarkan peran mereka.</p>
        </div>
      </div>

      <div style={{ marginBottom: 16 }}>
        <Link href="/admin/users" style={{ marginRight: 16, color: roleFilter === '' ? 'var(--primary, #3b4a2e)' : '#657068', fontWeight: roleFilter === '' ? 700 : 500, textDecoration: 'none' }}>Semua</Link>
        <Link href="/admin/users?role=ADMIN" style={{ marginRight: 16, color: roleFilter === 'ADMIN' ? 'var(--primary, #3b4a2e)' : '#657068', fontWeight: roleFilter === 'ADMIN' ? 700 : 500, textDecoration: 'none' }}>Admin</Link>
        <Link href="/admin/users?role=CONSULTANT" style={{ marginRight: 16, color: roleFilter === 'CONSULTANT' ? 'var(--primary, #3b4a2e)' : '#657068', fontWeight: roleFilter === 'CONSULTANT' ? 700 : 500, textDecoration: 'none' }}>Konsultan</Link>
        <Link href="/admin/users?role=CUSTOMER" style={{ color: roleFilter === 'CUSTOMER' ? 'var(--primary, #3b4a2e)' : '#657068', fontWeight: roleFilter === 'CUSTOMER' ? 700 : 500, textDecoration: 'none' }}>Customer</Link>
      </div>

      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ background: '#f9fafb' }}>
            <tr>
              <th style={{ textAlign: 'left', padding: 12 }}>Nama Pengguna</th>
              <th style={{ textAlign: 'left', padding: 12 }}>Peran (Role)</th>
              <th style={{ textAlign: 'left', padding: 12 }}>Tanggal Daftar</th>
              <th style={{ textAlign: 'left', padding: 12 }}>Status</th>
              <th style={{ textAlign: 'right', padding: 12 }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ padding: 24, textAlign: 'center', color: '#657068' }}>Tidak ada user ditemukan.</td>
              </tr>
            ) : (
              users.map((item) => {
                const roleDef = roleMap[item.role] || { label: item.role, color: '#374151', bg: '#f3f4f6' };
                return (
                  <tr key={item.id} style={{ borderTop: '1px solid #f0f0f0', opacity: item.isActive === false ? 0.6 : 1 }}>
                    <td style={{ padding: 12 }}>
                      <div style={{ fontWeight: 600 }}>
                        {item.name}
                        {item.isActive === false && (
                          <span style={{ marginLeft: 8, padding: '2px 6px', background: '#f3f4f6', color: '#4b5563', fontSize: 10, borderRadius: 4, fontWeight: 700 }}>NONAKTIF</span>
                        )}
                      </div>
                      <div style={{ fontSize: 12, color: '#657068' }}>{item.email}</div>
                    </td>
                    <td style={{ padding: 12 }}>
                      <span style={{ padding: '4px 8px', borderRadius: 999, background: roleDef.bg, color: roleDef.color, fontSize: 12 }}>
                        {roleDef.label}
                      </span>
                    </td>
                    <td style={{ padding: 12, fontSize: 14, color: '#657068' }}>
                      {new Date(item.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td style={{ padding: 12 }}>
                      <span style={{ padding: '4px 8px', borderRadius: 999, background: item.isVerified ? '#dcfce7' : '#f3f4f6', color: item.isVerified ? '#166534' : '#374151', fontSize: 12 }}>
                        {item.isVerified ? 'Terverifikasi' : 'Pending'}
                      </span>
                    </td>
                    <td style={{ padding: 12, display: 'flex', justifyContent: 'flex-end' }}>
                      <UserActions user={item} />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
