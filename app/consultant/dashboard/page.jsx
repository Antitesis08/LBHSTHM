import { redirect } from 'next/navigation';
import Link from 'next/link';
import { requireRole } from '../../../lib/auth';
import { prisma } from '../../../lib/prisma';

const SERVICE_LABELS = {
  KONSULTASI_HUKUM: 'Konsultasi Hukum',
  PENDAMPINGAN_HUKUM: 'Pendampingan Hukum',
  LEGAL_OPINION: 'Legal Opinion',
  MEDIASI: 'Mediasi',
  PENDAFTARAN_HKI: 'Pendaftaran HKI',
  PRO_BONO: 'Pro Bono',
};

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

export default async function ConsultantDashboardPage() {
  const { user, error } = await requireRole(['CONSULTANT']);
  if (error) redirect('/unauthorized');

  // Find this user's consultant profile
  const consultantProfile = await prisma.consultantProfile.findUnique({
    where: { userId: user.id },
    select: { id: true },
  });

  if (!consultantProfile) redirect('/unauthorized');

  const cases = await prisma.case.findMany({
    where: { consultantId: consultantProfile.id },
    include: {
      client: { select: { name: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  const countByStatus = {
    active: cases.filter((c) => !['SELESAI', 'DITOLAK'].includes(c.status)).length,
    completed: cases.filter((c) => c.status === 'SELESAI').length,
    total: cases.length,
  };

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>Dashboard Konsultan</h1>
          <p style={{ color: '#657068', fontSize: 14 }}>Selamat datang, {user.name}. Berikut kasus yang ditugaskan kepada Anda.</p>
        </div>
        <Link
          href="/consultant/profil"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '10px 20px', borderRadius: 8, fontWeight: 600, fontSize: 14,
            background: 'var(--primary, #3b4a2e)', color: '#fff', textDecoration: 'none',
          }}
        >
          Edit Profil
        </Link>
      </div>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 28 }}>
        {[
          { label: 'Total Kasus', value: countByStatus.total, accent: '#3b4a2e' },
          { label: 'Kasus Aktif', value: countByStatus.active, accent: '#1e40af' },
          { label: 'Selesai', value: countByStatus.completed, accent: '#166534' },
        ].map((card) => (
          <div key={card.label} style={{ background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', padding: '20px 24px' }}>
            <p style={{ fontSize: 13, color: '#657068', marginBottom: 4 }}>{card.label}</p>
            <p style={{ fontSize: 28, fontWeight: 700, color: card.accent }}>{card.value}</p>
          </div>
        ))}
      </div>

      {/* Cases table */}
      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #f0f0f0' }}>
          <h2 style={{ fontSize: 16, fontWeight: 600 }}>Kasus Ditugaskan</h2>
        </div>
        {cases.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#657068' }}>
            <p>Belum ada kasus yang ditugaskan kepada Anda.</p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ background: '#f9fafb' }}>
              <tr>
                <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: 13, fontWeight: 600, color: '#657068' }}>Kode Kasus</th>
                <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: 13, fontWeight: 600, color: '#657068' }}>Jenis Layanan</th>
                <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: 13, fontWeight: 600, color: '#657068' }}>Status</th>
                <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: 13, fontWeight: 600, color: '#657068' }}>Nama Klien</th>
                <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: 13, fontWeight: 600, color: '#657068' }}>Tanggal</th>
              </tr>
            </thead>
            <tbody>
              {cases.map((item) => {
                const badge = statusBadge(item.status);
                return (
                  <tr key={item.id} style={{ borderTop: '1px solid #f0f0f0' }}>
                    <td style={{ padding: '14px 16px' }}>
                      <Link href={`/consultant/kasus/${item.id}`} style={{ color: 'var(--primary, #3b4a2e)', fontWeight: 600, textDecoration: 'none' }}>
                        {item.code}
                      </Link>
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: 14 }}>
                      {item.serviceType ? (SERVICE_LABELS[item.serviceType] || item.serviceType) : 'Pendampingan Hukum'}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ padding: '4px 10px', borderRadius: 999, background: badge.bg, color: badge.color, fontSize: 12, fontWeight: 500 }}>
                        {badge.label}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: 14 }}>{item.client?.name || '-'}</td>
                    <td style={{ padding: '14px 16px', fontSize: 14, color: '#657068' }}>
                      {new Date(item.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
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
