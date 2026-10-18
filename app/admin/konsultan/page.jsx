import { redirect } from 'next/navigation';
import { requireRole } from '../../../lib/auth';
import { prisma } from '../../../lib/prisma';

export default async function AdminConsultantsPage() {
  const { user, error } = await requireRole(['ADMIN']);
  if (error) redirect('/unauthorized');

  const consultants = await prisma.consultantProfile.findMany({
    include: {
      user: { select: { id: true, name: true, email: true } },
    },
    orderBy: { user: { name: 'asc' } },
  });

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>Daftar Konsultan</h1>
          <p style={{ color: '#657068' }}>Kelola akun konsultan yang bisa dipilih customer saat mengajukan kasus.</p>
        </div>
        <a href="/admin/konsultan/tambah" style={{ background: '#3b4a2e', color: '#fff', padding: '10px 14px', borderRadius: 10, textDecoration: 'none' }}>Tambah Konsultan</a>
      </div>
      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ background: '#f9fafb' }}>
            <tr>
              <th style={{ textAlign: 'left', padding: 12 }}>Konsultan</th>
              <th style={{ textAlign: 'left', padding: 12 }}>Tipe</th>
              <th style={{ textAlign: 'left', padding: 12 }}>Spesialisasi</th>
              <th style={{ textAlign: 'left', padding: 12 }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {consultants.map((consultant) => (
              <tr key={consultant.id} style={{ borderTop: '1px solid #f0f0f0' }}>
                <td style={{ padding: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                      {consultant.photoUrl ? <img src={consultant.photoUrl} alt={consultant.user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span>{consultant.user.name.split(' ').slice(0,2).map((part) => part[0]).join('').slice(0,2)}</span>}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600 }}>{consultant.user.name}</div>
                      <div style={{ fontSize: 12, color: '#657068' }}>{consultant.user.email}</div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: 12 }}>{consultant.type}</td>
                <td style={{ padding: 12 }}>{(consultant.specialization || []).join(', ')}</td>
                <td style={{ padding: 12 }}><span style={{ padding: '4px 8px', borderRadius: 999, background: consultant.isAvailable ? '#dcfce7' : '#f3f4f6', color: consultant.isAvailable ? '#166534' : '#374151', fontSize: 12 }}>{consultant.isAvailable ? 'Aktif' : 'Nonaktif'}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
