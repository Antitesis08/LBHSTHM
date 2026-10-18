import { redirect } from 'next/navigation';
import Link from 'next/link';
import { requireRole } from '../../../lib/auth';
import { prisma } from '../../../lib/prisma';

function statusBadge(status) {
  const map = {
    DIAJUKAN: { label: 'Diajukan', bg: '#fef3c7', color: '#92400e' },
    DIVERIFIKASI: { label: 'Diverifikasi', bg: '#dbeafe', color: '#1e40af' },
    DITUGASKAN: { label: 'Ditugaskan', bg: '#dcfce7', color: '#166534' },
    PROSES: { label: 'Proses', bg: '#dbeafe', color: '#1e40af' },
    MENUNGGU_DOKUMEN: { label: 'Menunggu Dokumen', bg: '#fef3c7', color: '#92400e' },
    SELESAI: { label: 'Selesai', bg: '#dcfce7', color: '#166534' },
    DITOLAK: { label: 'Ditolak', bg: '#fee2e2', color: '#991b1b' },
  };
  return map[status] || { label: status, bg: '#f3f4f6', color: '#374151' };
}

export default async function AdminDashboardPage() {
  const { user, error } = await requireRole(['ADMIN']);
  if (error) redirect('/unauthorized');

  const [cases, users, consultants] = await Promise.all([
    prisma.case.findMany({
      include: {
        client: { select: { name: true } },
        consultant: { include: { user: { select: { name: true } } } },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    }),
    prisma.user.count(),
    prisma.consultantProfile.count(),
  ]);

  const pendingCount = await prisma.case.count({ where: { status: 'DIAJUKAN' } });
  const totalCases = await prisma.case.count();

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>Dashboard Admin</h1>
        <p style={{ color: '#657068', fontSize: 14 }}>Ringkasan sistem LBH STHM.</p>
      </div>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 28 }}>
        {[
          { label: 'Total Kasus', value: totalCases, accent: '#3b4a2e', href: '/admin/kasus' },
          { label: 'Menunggu Verifikasi', value: pendingCount, accent: '#92400e', href: '/admin/kasus?status=DIAJUKAN' },
          { label: 'Total Pengguna', value: users, accent: '#1e40af', href: null },
          { label: 'Konsultan Terdaftar', value: consultants, accent: '#166534', href: '/admin/konsultan' },
        ].map((card) => (
          <div key={card.label} style={{ background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', padding: '20px 24px' }}>
            <p style={{ fontSize: 13, color: '#657068', marginBottom: 4 }}>{card.label}</p>
            <p style={{ fontSize: 28, fontWeight: 700, color: card.accent }}>{card.value}</p>
            {card.href && (
              <Link href={card.href} style={{ fontSize: 12, color: 'var(--primary, #3b4a2e)', fontWeight: 500 }}>
                Lihat semua →
              </Link>
            )}
          </div>
        ))}
      </div>

      {/* Recent cases */}
      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: 16, fontWeight: 600 }}>Kasus Terbaru</h2>
          <Link href="/admin/kasus" style={{ fontSize: 13, color: 'var(--primary, #3b4a2e)', fontWeight: 600, textDecoration: 'none' }}>
            Lihat semua →
          </Link>
        </div>
        {cases.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#657068' }}>
            <p>Belum ada kasus terdaftar di sistem.</p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ background: '#f9fafb' }}>
              <tr>
                <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: 13, fontWeight: 600, color: '#657068' }}>Kasus</th>
                <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: 13, fontWeight: 600, color: '#657068' }}>Klien</th>
                <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: 13, fontWeight: 600, color: '#657068' }}>Status</th>
                <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: 13, fontWeight: 600, color: '#657068' }}>Konsultan</th>
                <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: 13, fontWeight: 600, color: '#657068' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {cases.map((item) => {
                const badge = statusBadge(item.status);
                const stale = item.status === 'DIAJUKAN' && new Date(item.createdAt).getTime() < Date.now() - 24 * 60 * 60 * 1000;
                return (
                  <tr key={item.id} style={{ borderTop: '1px solid #f0f0f0' }}>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ fontWeight: 600 }}>{item.title}</div>
                      <div style={{ fontSize: 12, color: '#657068' }}>{item.code}</div>
                      {stale && <div style={{ fontSize: 11, color: '#b45309', marginTop: 4 }}>⚠ Belum diproses &gt; 24 jam</div>}
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: 14 }}>{item.client?.name || '-'}</td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ padding: '4px 10px', borderRadius: 999, background: badge.bg, color: badge.color, fontSize: 12, fontWeight: 500 }}>
                        {badge.label}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: 14 }}>{item.consultant?.user?.name || '-'}</td>
                    <td style={{ padding: '14px 16px' }}>
                      <Link href={`/admin/kasus/${item.id}`} style={{ color: 'var(--primary, #3b4a2e)', fontWeight: 600, textDecoration: 'none' }}>
                        Buka
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
