import { redirect } from 'next/navigation';
import { requireRole } from '../../../../lib/auth';
import { prisma } from '../../../../lib/prisma';
import AdminCaseActions from './AdminCaseActions';

async function getConsultants() {
  return prisma.consultantProfile.findMany({
    select: { id: true, type: true, specialization: true, user: { select: { id: true, name: true } } },
    orderBy: { user: { name: 'asc' } },
  });
}

export default async function AdminCaseDetailPage({ params }) {
  const { user, error } = await requireRole(['ADMIN']);
  if (error) redirect('/unauthorized');

  const { id } = await params;
  const caseData = await prisma.case.findUnique({
    where: { id },
    include: {
      client: { select: { id: true, name: true, email: true } },
      consultant: { select: { id: true, type: true, user: { select: { id: true, name: true } } } },
      documents: { orderBy: { createdAt: 'desc' } },
    },
  });

  if (!caseData) redirect('/unauthorized');
  const consultants = await getConsultants();

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: 24 }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>{caseData.title}</h1>
      <p style={{ color: '#657068', marginBottom: 20 }}>{caseData.code}</p>
      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', padding: 20, marginBottom: 20 }}>
        <p><strong>Klien:</strong> {caseData.client?.name || '-'}</p>
        <p><strong>Email:</strong> {caseData.client?.email || '-'}</p>
        <p><strong>Layanan:</strong> {caseData.serviceType.replaceAll('_', ' ')}</p>
        <p><strong>Status:</strong> {caseData.status}</p>
        <p><strong>Deskripsi:</strong> {caseData.description}</p>
        <p><strong>Konsultan:</strong> {caseData.consultant?.user?.name || '-'} ({caseData.consultant?.type?.replaceAll('_', ' ') || ''})</p>
        {caseData.rejectionReason && <p><strong>Alasan Penolakan:</strong> {caseData.rejectionReason}</p>}
      </div>

      <AdminCaseActions caseData={caseData} consultants={consultants} />

      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', padding: 20 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>Dokumen Kasus</h2>
        {caseData.documents.length ? caseData.documents.map((doc) => <div key={doc.id} style={{ padding: '8px 0', borderBottom: '1px solid #f0f0f0' }}>{doc.fileName}</div>) : <p>Tidak ada dokumen.</p>}
      </div>
    </div>
  );
}
