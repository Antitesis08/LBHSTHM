import { redirect } from 'next/navigation';
import { requireRole } from '../../lib/auth';
import TopNavbar from '../../src/components/TopNavbar';

export default async function PengawasLayout({ children }) {
  const { user, error } = await requireRole(['PENGAWAS', 'ADMIN']);
  if (error) {
    redirect('/unauthorized');
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#f8fafc' }}>
      <TopNavbar role={user.role} userName={user.name} />
      <main style={{ flex: 1 }}>{children}</main>
    </div>
  );
}
