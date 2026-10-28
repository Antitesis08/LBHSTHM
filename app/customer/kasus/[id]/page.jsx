import { redirect } from 'next/navigation';
import { getSessionUser, requireRole } from '../../../../lib/auth';
import { prisma } from '../../../../lib/prisma';
import CaseDetailClient from './CaseDetailClient';

export default async function CustomerCaseDetailPage({ params }) {
  // Defense in depth: check role even though middleware already checked
  const { user, error } = await requireRole(['CUSTOMER']);
  if (error) redirect('/unauthorized');

  const { id } = await params;

  // Fetch case with ownership check — customer can only see their own case
  const caseData = await prisma.case.findUnique({
    where: { id },
    include: {
      client: { select: { id: true, name: true, email: true } },
      consultant: {
        include: {
          user: { select: { name: true, email: true } },
        },
      },
      documents: {
        include: { uploader: { select: { name: true } } },
        orderBy: { createdAt: 'desc' },
      },
      hearings: {
        orderBy: { date: 'asc' },
      },
    },
  });

  // Case not found
  if (!caseData) redirect('/unauthorized');

  // Ownership check: customer can only access their own cases
  if (caseData.clientId !== user.id) {
    redirect('/unauthorized');
  }

  // Serialize for client component
  const serializedCase = {
    ...caseData,
    createdAt: caseData.createdAt.toISOString(),
    updatedAt: caseData.updatedAt.toISOString(),
    closingSubmittedAt: caseData.closingSubmittedAt ? caseData.closingSubmittedAt.toISOString() : null,
    closingApprovedAt: caseData.closingApprovedAt ? caseData.closingApprovedAt.toISOString() : null,
    consultant: caseData.consultant
      ? {
          name: caseData.consultant.user.name,
          type: caseData.consultant.type,
        }
      : null,
    documents: caseData.documents.map((doc) => ({
      ...doc,
      createdAt: doc.createdAt.toISOString(),
    })),
    hearings: (caseData.hearings || []).map((h) => ({
      ...h,
      date: h.date.toISOString(),
      createdAt: h.createdAt.toISOString(),
    })),
  };

  return <CaseDetailClient caseData={serializedCase} user={user} role="CUSTOMER" />;
}
