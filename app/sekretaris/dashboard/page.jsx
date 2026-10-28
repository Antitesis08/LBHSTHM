import { prisma } from '../../../lib/prisma';
import Link from 'next/link';
import { BookOpen, FileCheck, Clock, CheckCircle2, AlertCircle, ArrowUpRight } from 'lucide-react';

export default async function SekretarisDashboardPage() {
  const cases = await prisma.case.findMany({
    include: {
      client: { select: { id: true, name: true, email: true, phone: true } },
      documents: { select: { id: true, fileName: true, source: true } },
      consultant: { include: { user: { select: { name: true } } } },
    },
    orderBy: { createdAt: 'desc' },
  });

  const totalRegistered = cases.length;
  const pendingScreening = cases.filter((c) => c.status === 'DIAJUKAN').length;
  const verifiedScreening = cases.filter((c) => c.status === 'DIVERIFIKASI').length;
  const activeCases = cases.filter((c) => ['DITUGASKAN', 'PROSES', 'MENUNGGU_DOKUMEN'].includes(c.status)).length;
  const pendingVerification = cases.filter((c) => c.status === 'MENUNGGU_VERIFIKASI_SEKRETARIS').length;
  const archivedCount = cases.filter((c) => c.isArchived).length;

  return (
    <div>
      {/* Title */}
      <div style={{ marginBottom: 24 }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: '#16a34a', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          SOP-01: Prosedur Pendaftaran Perkara & Tata Kelola Administrasi
        </span>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#0f172a', margin: '4px 0 8px' }}>
          Buku Induk Registrasi Perkara LKBH STHM
        </h1>
        <p style={{ margin: 0, fontSize: 14, color: '#64748b' }}>
          Pencatatan resmi nomor agenda permohonan bantuan hukum masuk, verifikasi syarat administratif, dan disposisi gelar kasus.
        </p>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, marginBottom: 28 }}>
        <div style={{ background: '#fff', padding: '16px 20px', borderRadius: 10, border: '1px solid #e2e8f0' }}>
          <span style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>Total Buku Registrasi</span>
          <div style={{ fontSize: 26, fontWeight: 800, color: '#0f172a', marginTop: 4 }}>{totalRegistered}</div>
        </div>
        <div style={{ background: '#fff', padding: '16px 20px', borderRadius: 10, border: '1px solid #e2e8f0' }}>
          <span style={{ fontSize: 12, color: '#f59e0b', fontWeight: 600 }}>Menunggu Gelar Kasus</span>
          <div style={{ fontSize: 26, fontWeight: 800, color: '#f59e0b', marginTop: 4 }}>{pendingScreening}</div>
        </div>
        <div style={{ background: '#fff', padding: '16px 20px', borderRadius: 10, border: '1px solid #e2e8f0' }}>
          <span style={{ fontSize: 12, color: '#3b82f6', fontWeight: 600 }}>Dalam Penanganan</span>
          <div style={{ fontSize: 26, fontWeight: 800, color: '#3b82f6', marginTop: 4 }}>{activeCases}</div>
        </div>
        <div style={{ background: '#fff', padding: '16px 20px', borderRadius: 10, border: '1px solid #fed7aa' }}>
          <span style={{ fontSize: 12, color: '#c2410c', fontWeight: 700 }}>Verifikasi Berkas Hasil</span>
          <div style={{ fontSize: 26, fontWeight: 800, color: '#c2410c', marginTop: 4 }}>{pendingVerification}</div>
        </div>
        <div style={{ background: '#fff', padding: '16px 20px', borderRadius: 10, border: '1px solid #e2e8f0' }}>
          <span style={{ fontSize: 12, color: '#16a34a', fontWeight: 600 }}>Telah Diarsipkan (Dossier)</span>
          <div style={{ fontSize: 26, fontWeight: 800, color: '#16a34a', marginTop: 4 }}>{archivedCount}</div>
        </div>
      </div>

      {/* Table Buku Induk */}
      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <div style={{ padding: '18px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#0f172a' }}>
              Daftar Nomor Registrasi Perkara Masuk
            </h3>
            <span style={{ fontSize: 12, color: '#64748b' }}>Urutan kronologis pendaftaran pemohon bantuan hukum</span>
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <Link
              href="/sekretaris/verifikasi"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                background: '#c2410c', color: '#fff', padding: '8px 14px',
                borderRadius: 6, fontSize: 13, fontWeight: 600, textDecoration: 'none'
              }}
            >
              Verifikasi Berkas ({pendingVerification}) <ArrowUpRight size={15} />
            </Link>
            <Link
              href="/sekretaris/gelar-kasus"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                background: '#16a34a', color: '#fff', padding: '8px 14px',
                borderRadius: 6, fontSize: 13, fontWeight: 600, textDecoration: 'none'
              }}
            >
              Agenda Gelar Kasus (BAGK) <ArrowUpRight size={15} />
            </Link>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: 600 }}>
                <th style={{ padding: '12px 18px' }}>No. Registrasi / Kode</th>
                <th style={{ padding: '12px 18px' }}>Pemohon (Klien)</th>
                <th style={{ padding: '12px 18px' }}>Uraian Perkara</th>
                <th style={{ padding: '12px 18px' }}>Bukti Formil</th>
                <th style={{ padding: '12px 18px' }}>Status SOP</th>
                <th style={{ padding: '12px 18px', textAlign: 'right' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {cases.map((c, idx) => (
                <tr key={c.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '14px 18px', verticalAlign: 'top' }}>
                    <strong style={{ color: '#0f172a', display: 'block' }}>{c.code}</strong>
                    <span style={{ fontSize: 11, color: '#64748b' }}>
                      Reg: {c.registrationNumber || `REG-${100 + idx}/LKBH`}
                    </span>
                    <span style={{ fontSize: 11, color: '#94a3b8', display: 'block' }}>
                      {new Intl.DateTimeFormat('id-ID', { dateStyle: 'short' }).format(new Date(c.createdAt))}
                    </span>
                  </td>

                  <td style={{ padding: '14px 18px', verticalAlign: 'top' }}>
                    <strong style={{ color: '#1e293b' }}>{c.client?.name || '-'}</strong>
                    <span style={{ fontSize: 11, color: '#64748b', display: 'block' }}>{c.client?.email}</span>
                    <span style={{ fontSize: 11, color: '#64748b' }}>{c.client?.phone || '-'}</span>
                  </td>

                  <td style={{ padding: '14px 18px', verticalAlign: 'top', maxWidth: 300 }}>
                    <div style={{ fontWeight: 600, color: '#0f172a', marginBottom: 2 }}>{c.title}</div>
                    <p style={{ margin: 0, fontSize: 12, color: '#475569', lineHeight: 1.4, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                      {c.description}
                    </p>
                  </td>

                  <td style={{ padding: '14px 18px', verticalAlign: 'top' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: '#f0fdf4', color: '#16a34a', padding: '3px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600 }}>
                      <FileCheck size={13} /> {c.documents.length} Berkas
                    </span>
                  </td>

                  <td style={{ padding: '14px 18px', verticalAlign: 'top' }}>
                    <span style={{
                      display: 'inline-block', padding: '3px 8px', borderRadius: 6, fontSize: 11, fontWeight: 700,
                      background:
                        c.status === 'DIAJUKAN' ? '#fef3c7' :
                        c.status === 'DIVERIFIKASI' ? '#eff6ff' :
                        c.status === 'MENUNGGU_VERIFIKASI_SEKRETARIS' ? '#fff7ed' :
                        c.status === 'SELESAI' ? '#f0fdf4' : '#f1f5f9',
                      color:
                        c.status === 'DIAJUKAN' ? '#b45309' :
                        c.status === 'DIVERIFIKASI' ? '#1d4ed8' :
                        c.status === 'MENUNGGU_VERIFIKASI_SEKRETARIS' ? '#c2410c' :
                        c.status === 'SELESAI' ? '#15803d' : '#475569'
                    }}>
                      {c.status === 'MENUNGGU_VERIFIKASI_SEKRETARIS' ? 'VERIFIKASI BERKAS' : c.status}
                    </span>
                  </td>

                  <td style={{ padding: '14px 18px', verticalAlign: 'top', textAlign: 'right' }}>
                    <Link
                      href={
                        c.status === 'MENUNGGU_VERIFIKASI_SEKRETARIS'
                          ? '/sekretaris/verifikasi'
                          : c.status === 'SELESAI'
                          ? '/sekretaris/dossier'
                          : '/sekretaris/gelar-kasus'
                      }
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: 4,
                        padding: '6px 12px', background: '#f8fafc', border: '1px solid #cbd5e1',
                        borderRadius: 6, fontSize: 12, fontWeight: 600, color: '#334155', textDecoration: 'none'
                      }}
                    >
                      {c.status === 'MENUNGGU_VERIFIKASI_SEKRETARIS' ? 'Telaah Berkas' : 'Buka Detail'}
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
