import { redirect } from 'next/navigation';
import { requireRole } from '../../../lib/auth';
import WizardClient from './WizardClient';

export const metadata = {
  title: 'Pengajuan Baru — LBH STHM',
  description: 'Ajukan permintaan layanan bantuan hukum melalui wizard pengajuan.',
};

export default async function PengajuanPage() {
  const { user, error } = await requireRole(['CUSTOMER']);
  if (error) redirect('/unauthorized');

  return <WizardClient user={user} />;
}
