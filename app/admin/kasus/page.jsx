import { redirect } from 'next/navigation';
import { requireRole } from '../../../lib/auth';
import { prisma } from '../../../lib/prisma';

function statusBadge(status) {
  const map = {
    DIAJUKAN: { label: 'Diajukan', tone: 'warning' },
    DIVERIFIKASI: { label: 'Diverifikasi', tone: 'info' },
    DITUGASKAN: { label: 'Ditugaskan', tone: 'success' },
    PROSES: { label: 'Proses', tone: 'info' },
    MENUNGGU_DOKUMEN: { label: 'Menunggu Dokumen', tone: 'warning' },
    MENUNGGU_VERIFIKASI_SEKRETARIS: { label: 'Verifikasi Berkas', tone: 'warning' },
    SELESAI: { label: 'Selesai', tone: 'success' },
    DITOLAK: { label: 'Ditolak', tone: 'danger' },
  };
  return map[status] || { label: status, tone: 'default' };
}

export default async function AdminCasesPage({ searchParams }) {
  const { user, error } = await requireRole(['ADMIN']);
  if (error) redirect('/unauthorized');

  const statusFilter = (await searchParams)?.status || '';
  const cases = await prisma.case.findMany({
    where: statusFilter ? { status: statusFilter } : undefined,
    include: {
      client: { select: { name: true, email: true } },
      consultant: { select: { id: true, user: { select: { name: true } } } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: 24 }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Manajemen Kasus</h1>
      <p style={{ color: '#657068', marginBottom: 20 }}>Verifikasi pengajuan, tugaskan konsultan, dan pantau status kasus.</p>
      <div style={{ marginBottom: 16 }}>
        <a href="/admin/kasus" style={{ marginRight: 8, color: '#3b4a2e' }}>Semua</a>
        {['DIAJUKAN', 'DIVERIFIKASI', 'DITUGASKAN', 'PROSES', 'MENUNGGU_DOKUMEN', 'MENUNGGU_VERIFIKASI_SEKRETARIS', 'SELESAI', 'DITOLAK'].map((item) => (
          <a key={item} href={`/admin/kasus?status=${item}`} style={{ marginRight: 8, color: '#3b4a2e' }}>{item}</a>
        ))}
      </div>
      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ background: '#f9fafb' }}>
            <tr>
              <th style={{ textAlign: 'left', padding: 12 }}>Kasus</th>
              <th style={{ textAlign: 'left', padding: 12 }}>Klien</th>
              <th style={{ textAlign: 'left', padding: 12 }}>Status</th>
              <th style={{ textAlign: 'left', padding: 12 }}>Konsultan</th>
              <th style={{ textAlign: 'left', padding: 12 }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {cases.map((item) => {
              const badge = statusBadge(item.status);
              const stale = item.status === 'DIAJUKAN' && new Date(item.createdAt).getTime() < Date.now() - 24 * 60 * 60 * 1000;
              return (
                <tr key={item.id} style={{ borderTop: '1px solid #f0f0f0' }}>
                  <td style={{ padding: 12 }}>
                    <div style={{ fontWeight: 600 }}>{item.title}</div>
                    <div style={{ fontSize: 12, color: '#657068' }}>{item.code}</div>
                    {stale && <div style={{ fontSize: 11, color: '#b45309', marginTop: 4 }}>⚠ Belum diproses &gt; 24 jam</div>}
                  </td>
                  <td style={{ padding: 12 }}>{item.client?.name || '-'}</td>
                  <td style={{ padding: 12 }}><span style={{ padding: '4px 8px', borderRadius: 999, background: badge.tone === 'warning' ? '#fef3c7' : badge.tone === 'success' ? '#dcfce7' : badge.tone === 'danger' ? '#fee2e2' : '#f3f4f6', color: badge.tone === 'warning' ? '#92400e' : badge.tone === 'success' ? '#166534' : badge.tone === 'danger' ? '#991b1b' : '#374151', fontSize: 12 }}>{badge.label}</span></td>
                  <td style={{ padding: 12 }}>{item.consultant?.user?.name || '-'}</td>
                  <td style={{ padding: 12 }}><a href={`/admin/kasus/${item.id}`} style={{ color: '#3b4a2e', fontWeight: 600 }}>Buka</a></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
