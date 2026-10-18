import { redirect } from 'next/navigation';
import { requireRole } from '../../../../lib/auth';
import AdminConsultantCreateForm from '../../../../src/components/AdminConsultantCreateForm';

export default async function AddConsultantPage() {
  const { user, error } = await requireRole(['ADMIN']);
  if (error) redirect('/unauthorized');
  return <AdminConsultantCreateForm />;
}
