import { requireRole } from '../../lib/auth';
import { redirect } from 'next/navigation';
import TopNavbar from '../../src/components/TopNavbar';

export default async function SekretarisLayout({ children }) {
  const { user, error } = await requireRole(['SEKRETARIS', 'ADMIN']);
  if (error) redirect('/unauthorized');

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg, #f4f6f4)' }}>
      <TopNavbar role={user.role} userName={user.name} />
      <main style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 20px 80px' }}>
        {children}
      </main>
    </div>
  );
}
