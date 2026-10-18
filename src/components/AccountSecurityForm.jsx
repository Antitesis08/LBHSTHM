'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertTriangle } from 'lucide-react';

export default function AccountSecurityForm({ user }) {
  const router = useRouter();
  
  // Email Form State
  const [newEmail, setNewEmail] = useState(user.email || '');
  const [emailCurrentPassword, setEmailCurrentPassword] = useState('');
  const [emailNewPassword, setEmailNewPassword] = useState('');
  const [emailConfirmPassword, setEmailConfirmPassword] = useState('');
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailMessage, setEmailMessage] = useState({ type: '', text: '' });

  // Password Form State
  const [passwordCurrent, setPasswordCurrent] = useState('');
  const [passwordNew, setPasswordNew] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState({ type: '', text: '' });

  const isGoogleNoPassword = user.provider === 'GOOGLE' && !user.hasManualPassword;

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setEmailMessage({ type: '', text: '' });
    
    if (isGoogleNoPassword) {
      if (!emailNewPassword || !emailConfirmPassword) {
        setEmailMessage({ type: 'error', text: 'Password baru wajib diisi untuk keamanan akun Anda.' });
        return;
      }
      if (emailNewPassword !== emailConfirmPassword) {
        setEmailMessage({ type: 'error', text: 'Konfirmasi password tidak cocok.' });
        return;
      }
      if (emailNewPassword.length < 8) {
        setEmailMessage({ type: 'error', text: 'Password minimal 8 karakter.' });
        return;
      }
    } else {
      if (!emailCurrentPassword) {
        setEmailMessage({ type: 'error', text: 'Password saat ini wajib diisi untuk keamanan.' });
        return;
      }
    }

    setEmailLoading(true);
    try {
      const res = await fetch('/api/account/email', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          newEmail,
          currentPassword: emailCurrentPassword || undefined,
          newPassword: emailNewPassword || undefined
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal mengubah email');
      
      setEmailMessage({ type: 'success', text: 'Email berhasil diubah.' });
      setEmailCurrentPassword('');
      setEmailNewPassword('');
      setEmailConfirmPassword('');
      router.refresh();
    } catch (err) {
      setEmailMessage({ type: 'error', text: err.message });
    } finally {
      setEmailLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordMessage({ type: '', text: '' });

    if (!passwordCurrent || !passwordNew || !passwordConfirm) {
      setPasswordMessage({ type: 'error', text: 'Semua field wajib diisi.' });
      return;
    }
    if (passwordNew !== passwordConfirm) {
      setPasswordMessage({ type: 'error', text: 'Konfirmasi password baru tidak cocok.' });
      return;
    }
    if (passwordNew.length < 8) {
      setPasswordMessage({ type: 'error', text: 'Password minimal 8 karakter.' });
      return;
    }

    setPasswordLoading(true);
    try {
      const res = await fetch('/api/account/password', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passwordCurrent,
          newPassword: passwordNew
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal mengubah password');
      
      setPasswordMessage({ type: 'success', text: 'Password berhasil diubah.' });
      setPasswordCurrent('');
      setPasswordNew('');
      setPasswordConfirm('');
    } catch (err) {
      setPasswordMessage({ type: 'error', text: err.message });
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div style={{ marginTop: 32 }}>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>Keamanan Akun</h2>
      
      {/* UBAH EMAIL SECTION */}
      <div style={{ background: '#fff', borderRadius: 12, padding: 20, border: '1px solid #e5e7eb', marginBottom: 24 }}>
        <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>Ubah Email</h3>
        
        {isGoogleNoPassword && (
          <div style={{ display: 'flex', gap: 12, padding: 16, background: '#fef3c7', color: '#92400e', borderRadius: 8, marginBottom: 16 }}>
            <AlertTriangle size={24} style={{ flexShrink: 0 }} />
            <p style={{ fontSize: 14, margin: 0, lineHeight: 1.5 }}>
              <strong>PERHATIAN:</strong> Akun Anda saat ini login via Google. Mengubah email akan <strong>memutus tautan dengan akun Google Anda</strong>. Anda perlu login manual dengan email baru dan password setelah ini. Oleh karena itu, Anda <strong>WAJIB mengatur password baru</strong> sekarang.
            </p>
          </div>
        )}

        {emailMessage.text && (
          <div style={{ padding: 12, borderRadius: 8, marginBottom: 16, fontSize: 14, background: emailMessage.type === 'error' ? '#fee2e2' : '#dcfce7', color: emailMessage.type === 'error' ? '#991b1b' : '#166534' }}>
            {emailMessage.text}
          </div>
        )}

        <form onSubmit={handleEmailSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 500 }}>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 14, fontWeight: 500 }}>
            Email Baru
            <input type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} required style={{ padding: 10, borderRadius: 8, border: '1px solid #d1d5db' }} />
          </label>
          
          {!isGoogleNoPassword && (
            <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 14, fontWeight: 500 }}>
              Password Saat Ini (untuk konfirmasi)
              <input type="password" value={emailCurrentPassword} onChange={e => setEmailCurrentPassword(e.target.value)} required style={{ padding: 10, borderRadius: 8, border: '1px solid #d1d5db' }} />
            </label>
          )}

          {isGoogleNoPassword && (
            <>
              <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 14, fontWeight: 500 }}>
                Password Baru
                <input type="password" value={emailNewPassword} onChange={e => setEmailNewPassword(e.target.value)} required style={{ padding: 10, borderRadius: 8, border: '1px solid #d1d5db' }} />
              </label>
              <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 14, fontWeight: 500 }}>
                Konfirmasi Password Baru
                <input type="password" value={emailConfirmPassword} onChange={e => setEmailConfirmPassword(e.target.value)} required style={{ padding: 10, borderRadius: 8, border: '1px solid #d1d5db' }} />
              </label>
            </>
          )}

          <button type="submit" disabled={emailLoading} style={{ padding: '10px 16px', background: 'var(--primary, #3b4a2e)', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 500, cursor: emailLoading ? 'wait' : 'pointer', alignSelf: 'flex-start' }}>
            {emailLoading ? 'Menyimpan...' : 'Simpan Email'}
          </button>
        </form>
      </div>

      {/* UBAH PASSWORD SECTION */}
      <div style={{ background: '#fff', borderRadius: 12, padding: 20, border: '1px solid #e5e7eb' }}>
        <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>Ubah Password</h3>
        
        {isGoogleNoPassword ? (
          <p style={{ fontSize: 14, color: '#657068', margin: 0 }}>Akun ini login via Google, tidak memiliki password terpisah.</p>
        ) : (
          <>
            {passwordMessage.text && (
              <div style={{ padding: 12, borderRadius: 8, marginBottom: 16, fontSize: 14, background: passwordMessage.type === 'error' ? '#fee2e2' : '#dcfce7', color: passwordMessage.type === 'error' ? '#991b1b' : '#166534' }}>
                {passwordMessage.text}
              </div>
            )}

            <form onSubmit={handlePasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 500 }}>
              <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 14, fontWeight: 500 }}>
                Password Saat Ini
                <input type="password" value={passwordCurrent} onChange={e => setPasswordCurrent(e.target.value)} required style={{ padding: 10, borderRadius: 8, border: '1px solid #d1d5db' }} />
              </label>
              <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 14, fontWeight: 500 }}>
                Password Baru
                <input type="password" value={passwordNew} onChange={e => setPasswordNew(e.target.value)} required minLength={8} style={{ padding: 10, borderRadius: 8, border: '1px solid #d1d5db' }} />
              </label>
              <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 14, fontWeight: 500 }}>
                Konfirmasi Password Baru
                <input type="password" value={passwordConfirm} onChange={e => setPasswordConfirm(e.target.value)} required minLength={8} style={{ padding: 10, borderRadius: 8, border: '1px solid #d1d5db' }} />
              </label>

              <button type="submit" disabled={passwordLoading} style={{ padding: '10px 16px', background: 'var(--primary, #3b4a2e)', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 500, cursor: passwordLoading ? 'wait' : 'pointer', alignSelf: 'flex-start' }}>
                {passwordLoading ? 'Menyimpan...' : 'Simpan Password'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
