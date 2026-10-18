import TopNavbar from '../../src/components/TopNavbar';
import { getSessionUser } from '../../lib/auth';

export default async function AdminLayout({ children }) {
  const user = await getSessionUser();
  
  return (
    <div className="app-shell" style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: 'var(--bg)' }}>
      <TopNavbar role="ADMIN" userName={user?.name || 'Admin'} />
      <main className="main-content" style={{ flex: 1, overflowY: 'auto' }}>
        <div className="page-wrap" style={{ padding: '24px 32px' }}>
          {children}
        </div>
      </main>
    </div>
  );
}
