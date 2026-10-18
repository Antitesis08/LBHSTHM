import { redirect } from 'next/navigation';
import { getSessionUser, requireRole } from '../../../../lib/auth';
import { prisma } from '../../../../lib/prisma';
import CaseDetailClient from './CaseDetailClient';

export default async function ConsultantCaseDetailPage({ params }) {
  // Defense in depth: check role even though middleware already checked
  const { user, error } = await requireRole(['CONSULTANT']);
  if (error) redirect('/unauthorized');

  const { id } = await params;

  // Fetch consultant profile for this user
  const consultantProfile = await prisma.consultantProfile.findUnique({
    where: { userId: user.id },
    select: { id: true },
  });

  if (!consultantProfile) redirect('/unauthorized');

  // Fetch case data
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
    },
  });

  // Case not found
  if (!caseData) redirect('/unauthorized');

  // Ownership check: consultant can only access cases assigned to them
  if (caseData.consultantId !== consultantProfile.id) {
    redirect('/unauthorized');
  }

  // Serialize for client component
  const serializedCase = {
    ...caseData,
    createdAt: caseData.createdAt.toISOString(),
    updatedAt: caseData.updatedAt.toISOString(),
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
  };

  return <CaseDetailClient caseData={serializedCase} user={user} role="CONSULTANT" />;
}
