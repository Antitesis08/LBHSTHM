'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowUpRight, Gavel } from 'lucide-react';
import { getSupabaseBrowserClient } from '../../lib/supabase/browserClient';

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState('login');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setError('');
    setLoading(true);

    const data = Object.fromEntries(new FormData(event.currentTarget));
    const endpoint = mode === 'register' ? '/api/auth/register' : '/api/auth/login';

    if (mode === 'register') {
      data.confirmPassword = data.confirmPassword || '';
    }

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      if (!response.ok) {
        setError(result.error || 'Permintaan tidak dapat diproses.');
        setLoading(false);
        return;
      }

      const role = result.user?.role;
      const dest =
        role === 'CUSTOMER'
          ? '/customer/dashboard'
          : role === 'CONSULTANT'
          ? '/consultant/dashboard'
          : role === 'ADMIN'
          ? '/admin/dashboard'
          : '/';

      window.location.assign(dest);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan jaringan.');
      setLoading(false);
    }
  }

  async function handleGoogleLogin() {
    setError('');
    try {
      const supabase = getSupabaseBrowserClient();
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}/auth/callback` },
      });
      if (oauthError) setError(oauthError.message);
    } catch (oauthError) {
      setError(oauthError instanceof Error ? oauthError.message : 'Google OAuth tidak dapat dimulai.');
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        background: 'var(--olive-deep, #22352b)',
      }}
    >
      <div
        className="modal"
        style={{
          width: '100%',
          maxWidth: '440px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              background: '#d8b541',
              color: '#22352b',
              borderRadius: '12px',
              display: 'grid',
              placeItems: 'center',
              margin: '0 auto 12px',
            }}
          >
            <Gavel size={26} />
          </div>
          <p className="eyebrow" style={{ margin: 0 }}>
            LBH STHM
          </p>
          <h2 style={{ margin: '4px 0 0', fontFamily: 'Space Grotesk, sans-serif' }}>
            {mode === 'register' ? 'Daftar Akun Baru' : 'Masuk ke Portal'}
          </h2>
        </div>

        <form onSubmit={submit}>
          {mode === 'register' && (
            <>
              <label>
                Nama Lengkap
                <input name="name" required placeholder="Nama sesuai identitas" />
              </label>
              <label>
                No. HP / WhatsApp
                <input name="phone" required placeholder="08xxxxxxxxxx" />
              </label>
            </>
          )}

          <label>
            Email
            <input
              name="email"
              type="email"
              required
              placeholder="nama@email.com"
              defaultValue={mode === 'login' ? 'customer@gmail.com' : ''}
            />
          </label>

          <label>
            Kata Sandi
            <input
              name="password"
              type="password"
              minLength={8}
              required
              placeholder="Minimal 8 karakter"
              defaultValue={mode === 'login' ? 'password123' : ''}
            />
          </label>

          {mode === 'register' && (
            <label>
              Konfirmasi Kata Sandi
              <input
                name="confirmPassword"
                type="password"
                minLength={8}
                required
                placeholder="Ulangi kata sandi"
              />
            </label>
          )}

          {error && (
            <p
              style={{
                color: '#dc2626',
                fontSize: '13px',
                background: '#fee2e2',
                padding: '10px',
                borderRadius: '6px',
                marginTop: '12px',
              }}
            >
              {error}
            </p>
          )}

          <button
            className="button primary full"
            type="submit"
            disabled={loading}
            style={{ marginTop: '16px' }}
          >
            {loading ? 'Memproses...' : mode === 'register' ? 'Buat Akun' : 'Masuk'} <ArrowUpRight size={16} />
          </button>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              margin: '20px 0',
              color: '#9ca3af',
              fontSize: '12px',
            }}
          >
            <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }} />
            <span style={{ padding: '0 10px' }}>atau</span>
            <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }} />
          </div>

          <button
            type="button"
            className="button secondary full"
            onClick={handleGoogleLogin}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
          >
            <span
              style={{
                fontWeight: 'bold',
                fontFamily: 'serif',
                color: '#4285F4',
              }}
            >
              G
            </span>
            {mode === 'register' ? 'Daftar dengan Google' : 'Masuk dengan Google'}
          </button>

          <p
            style={{
              textAlign: 'center',
              fontSize: '13px',
              marginTop: '20px',
              color: '#6b7280',
            }}
          >
            {mode === 'register' ? 'Sudah punya akun?' : 'Belum punya akun?'}{' '}
            <button
              type="button"
              onClick={() => {
                setMode(mode === 'register' ? 'login' : 'register');
                setError('');
              }}
              style={{
                background: 'none',
                color: 'var(--olive, #3b4a2e)',
                fontWeight: 700,
                textDecoration: 'underline',
                padding: 0,
              }}
            >
              {mode === 'register' ? 'Masuk di sini' : 'Daftar di sini'}
            </button>
          </p>

          <p style={{ textAlign: 'center', marginTop: '14px', fontSize: '12px' }}>
            <Link href="/" style={{ color: '#9ca3af', textDecoration: 'none' }}>
              &larr; Kembali ke Beranda
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
