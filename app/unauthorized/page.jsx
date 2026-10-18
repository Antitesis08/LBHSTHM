export default function UnauthorizedPage() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      background: 'var(--bg, #f5f7f5)',
      padding: 32,
      textAlign: 'center',
    }}>
      <div style={{
        background: '#fff',
        borderRadius: 16,
        padding: '48px 40px',
        maxWidth: 420,
        boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
      }}>
        <div style={{
          width: 64, height: 64, borderRadius: '50%',
          background: '#fef2f2', color: '#dc2626',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 20px', fontSize: 28,
        }}>
          🚫
        </div>
        <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8, color: '#1a1f1b' }}>
          Akses Ditolak
        </h1>
        <p style={{ fontSize: 14, color: '#657068', lineHeight: 1.6, marginBottom: 24 }}>
          Anda tidak memiliki izin untuk mengakses halaman ini.
          Silakan kembali ke halaman utama atau hubungi admin jika ini adalah kesalahan.
        </p>
        <a
          href="/"
          style={{
            display: 'inline-block',
            padding: '10px 24px',
            background: 'var(--primary, #16a34a)',
            color: '#fff',
            borderRadius: 8,
            fontWeight: 600,
            fontSize: 14,
            textDecoration: 'none',
          }}
        >
          Kembali ke Beranda
        </a>
      </div>
    </div>
  );
}
