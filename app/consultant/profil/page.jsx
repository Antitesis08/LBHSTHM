import { redirect } from 'next/navigation';
import { prisma } from '../../../lib/prisma';
import { requireRole } from '../../../lib/auth';
import ConsultantProfileForm from '../../../src/components/ConsultantProfileForm';
import AccountSecurityForm from '../../../src/components/AccountSecurityForm';

export default async function ConsultantProfilePage() {
  const { user, error } = await requireRole(['CONSULTANT']);
  if (error) redirect('/unauthorized');

  const profile = await prisma.consultantProfile.findUnique({
    where: { userId: user.id },
    include: { user: { select: { id: true, name: true, email: true, provider: true, hasManualPassword: true } } },
  });

  if (!profile) {
    redirect('/consultant/dashboard');
  }

  return (
    <div>
      <ConsultantProfileForm profile={profile} />
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 24px 24px' }}>
        <AccountSecurityForm user={profile.user} />
      </div>
    </div>
  );
}
