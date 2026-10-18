import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, FileText, Download, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import { requireRole } from '../../../../lib/auth';
import { prisma } from '../../../../lib/prisma';
import AdminCaseActions from './AdminCaseActions';

async function getConsultants() {
  return prisma.consultantProfile.findMany({
    select: { id: true, type: true, specialization: true, user: { select: { id: true, name: true } } },
    orderBy: { user: { name: 'asc' } },
  });
}

async function getParalegals() {
  return prisma.user.findMany({
    where: { role: 'PARALEGAL' },
    select: { id: true, name: true, email: true },
    orderBy: { name: 'asc' },
  });
}

export default async function AdminCaseDetailPage({ params }) {
  const { user, error } = await requireRole(['ADMIN']);
  if (error) redirect('/unauthorized');

  const { id } = await params;
  const caseData = await prisma.case.findUnique({
    where: { id },
    include: {
      client: { select: { id: true, name: true, email: true, phone: true } },
      consultant: { select: { id: true, type: true, user: { select: { id: true, name: true } } } },
      paralegal: { select: { id: true, name: true, email: true } },
      documents: {
        include: { uploader: { select: { name: true } } },
        orderBy: { createdAt: 'desc' },
      },
      hearings: {
        orderBy: { date: 'asc' },
      },
    },
  });

  if (!caseData) redirect('/unauthorized');
  const consultants = await getConsultants();
  const paralegals = await getParalegals();

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '24px 20px 80px' }}>
      <Link
        href="/admin/kasus"
        style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#6b7280', textDecoration: 'none', fontSize: 13, marginBottom: 16 }}
      >
        <ArrowLeft size={16} /> Kembali ke Manajemen Kasus
      </Link>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
        <div>
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--olive, #3b4a2e)', background: '#f5f7f2', padding: '4px 10px', borderRadius: 6 }}>
            {caseData.code}
          </span>
          <h1 style={{ fontSize: 24, fontWeight: 700, margin: '8px 0 4px', fontFamily: 'Space Grotesk' }}>{caseData.title}</h1>
          <span style={{ fontSize: 13, color: '#6b7280' }}>
            Diajukan oleh: <strong>{caseData.client?.name || '-'}</strong> ({caseData.client?.email || '-'} · {caseData.client?.phone || 'No HP -'})
          </span>
        </div>
        <div>
          <span
            style={{
              display: 'inline-block',
              padding: '6px 14px',
              borderRadius: 20,
              fontSize: 12,
              fontWeight: 700,
              background:
                caseData.status === 'DIAJUKAN'
                  ? '#fef3c7'
                  : caseData.status === 'DIVERIFIKASI'
                  ? '#dbeafe'
                  : caseData.status === 'DITUGASKAN'
                  ? '#e0e7ff'
                  : caseData.status === 'PROSES'
                  ? '#dcfce7'
                  : caseData.status === 'SELESAI'
                  ? '#f3f4f6'
                  : '#fee2e2',
              color:
                caseData.status === 'DIAJUKAN'
                  ? '#92400e'
                  : caseData.status === 'DIVERIFIKASI'
                  ? '#1e40af'
                  : caseData.status === 'DITUGASKAN'
                  ? '#3730a3'
                  : caseData.status === 'PROSES'
                  ? '#166534'
                  : caseData.status === 'SELESAI'
                  ? '#374151'
                  : '#991b1b',
            }}
          >
            STATUS: {caseData.status}
          </span>
        </div>
      </div>

      {/* Case Overview Card */}
      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', padding: 24, marginBottom: 20 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 16px', borderBottom: '1px solid #f3f4f6', paddingBottom: 10 }}>
          Informasi Kasus & Kronologi
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 16 }}>
          <div>
            <span style={{ fontSize: 11, color: '#6b7280', textTransform: 'uppercase', display: 'block' }}>Bentuk Layanan</span>
            <strong style={{ fontSize: 14 }}>
              {caseData.serviceType ? caseData.serviceType.replaceAll('_', ' ') : 'Menunggu Penetapan Rapat LBH'}
            </strong>
          </div>
          <div>
            <span style={{ fontSize: 11, color: '#6b7280', textTransform: 'uppercase', display: 'block' }}>Kategori Bantuan</span>
            <strong style={{ fontSize: 14, color: caseData.isProBono ? '#dc2626' : '#111827' }}>
              {caseData.isProBono ? 'PRO BONO (Cuma-cuma)' : 'Reguler'}
            </strong>
          </div>
          <div>
            <span style={{ fontSize: 11, color: '#6b7280', textTransform: 'uppercase', display: 'block' }}>Konsultan Bertugas</span>
            <strong style={{ fontSize: 14, color: caseData.consultant ? '#16a34a' : '#d97706' }}>
              {caseData.consultant
                ? `${caseData.consultant.user.name} (${caseData.consultant.type.replaceAll('_', ' ')})`
                : 'Belum ditugaskan'}
            </strong>
          </div>
        </div>

        <div>
          <span style={{ fontSize: 11, color: '#6b7280', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>
            Uraian Kronologi Pemohon
          </span>
          <div style={{ background: '#f9fafb', padding: 14, borderRadius: 8, fontSize: 14, lineHeight: 1.6, color: '#1f2937', whiteSpace: 'pre-wrap' }}>
            {caseData.description}
          </div>
        </div>

        {caseData.rejectionReason && (
          <div style={{ marginTop: 16, background: '#fef2f2', border: '1px solid #fecaca', padding: 14, borderRadius: 8, color: '#991b1b', fontSize: 13 }}>
            <strong>Alasan Penolakan Rapat: </strong> {caseData.rejectionReason}
          </div>
        )}
      </div>

      {/* Admin Action Panel (Rapat evaluasi, ACC, Legal Opinion, Penugasan Konsultan) */}
      <AdminCaseActions caseData={caseData} consultants={consultants} paralegals={paralegals} />

      {/* Supervisi Progres Penanganan Konsultan Hukum */}
      {(caseData.consultationNotes || (caseData.hearings && caseData.hearings.length > 0)) && (
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', padding: 24, marginBottom: 20 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 16px', color: '#0f172a' }}>
            Supervisi Progres Penanganan Konsultan Hukum
          </h2>

          {caseData.consultationNotes && (
            <div style={{ marginBottom: 18 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                Catatan & Arahan Yuridis Konsultan
              </span>
              <div style={{ background: '#f8fafc', padding: 12, borderRadius: 8, fontSize: 13, lineHeight: 1.6, color: '#334155', marginTop: 4, whiteSpace: 'pre-wrap' }}>
                {caseData.consultationNotes}
              </div>
            </div>
          )}

          {caseData.hearings && caseData.hearings.length > 0 && (
            <div>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                Agenda Sidang & Pemeriksaan yang Dicatat Konsultan ({caseData.hearings.length})
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 8 }}>
                {caseData.hearings.map((h) => (
                  <div key={h.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: '10px 14px', borderRadius: 6, border: '1px solid #e2e8f0', fontSize: 13 }}>
                    <div>
                      <strong>{h.title}</strong>
                      <span style={{ display: 'block', fontSize: 11, color: '#64748b' }}>
                        {new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium' }).format(new Date(h.date))} · {h.location || 'Pengadilan'} {h.stage ? `· (${h.stage})` : ''}
                      </span>
                    </div>
                    {h.notes && <span style={{ fontSize: 12, color: '#475569', fontStyle: 'italic', maxWidth: '40%' }}>{h.notes}</span>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Documents Section */}
      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>
            Berkas & Dokumen Perkara ({caseData.documents.length})
          </h2>
          <span style={{ fontSize: 12, color: '#6b7280' }}>Bukti Kelayakan Klien & Legal Opinion</span>
        </div>

        {caseData.documents.length === 0 ? (
          <p style={{ color: '#9ca3af', fontSize: 13, margin: 0, fontStyle: 'italic' }}>
            Belum ada dokumen yang dilampirkan.
          </p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 12 }}>
            {caseData.documents.map((doc) => {
              const isLO = doc.fileName.toLowerCase().includes('legal_opinion') || doc.source === 'CONSULTANT_GENERATED';
              const downloadUrl = doc.fileUrl.startsWith('/uploads/') ? doc.fileUrl : `/api/documents/${doc.id}/download`;

              return (
                <div
                  key={doc.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 14px',
                    borderRadius: 8,
                    border: `1px solid ${isLO ? '#bfdbfe' : '#e5e7eb'}`,
                    background: isLO ? '#f0f9ff' : '#fff',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                    <div
                      style={{
                        width: 34,
                        height: 34,
                        borderRadius: 6,
                        background: isLO ? '#dbeafe' : '#f3f4f6',
                        color: isLO ? '#1e40af' : '#4b5563',
                        display: 'grid',
                        placeItems: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <FileText size={18} />
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <strong style={{ display: 'block', fontSize: 13, color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {doc.fileName}
                      </strong>
                      <span style={{ fontSize: 11, color: isLO ? '#0284c7' : '#6b7280' }}>
                        {isLO ? 'Dokumen Legal Opinion' : `Bukti Klien · ${doc.uploader?.name || 'Klien'}`}
                      </span>
                    </div>
                  </div>

                  <a
                    href={downloadUrl}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      background: 'none',
                      border: '1px solid #d1d5db',
                      borderRadius: 6,
                      padding: '6px 10px',
                      color: '#374151',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                      fontSize: 12,
                      textDecoration: 'none',
                      flexShrink: 0,
                      marginLeft: 8,
                    }}
                  >
                    <Download size={14} /> Unduh
                  </a>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
