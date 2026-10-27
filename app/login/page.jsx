'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowUpRight, ShieldCheck, Zap } from 'lucide-react';
import { getSupabaseBrowserClient } from '../../lib/supabase/browserClient';

const DEMO_ROLES = [
  { label: 'Klien Pemohon', email: 'customer@gmail.com', role: 'CUSTOMER', color: '#16a34a' },
  { label: 'Kepala LKBH', email: 'admin@sthm.ac.id', role: 'ADMIN', color: '#b45309' },
  { label: 'Sekretariat (SOP-01 & 06)', email: 'sekretaris@sthm.ac.id', role: 'SEKRETARIS', color: '#0369a1' },
  { label: 'Bendahara (Lampiran F)', email: 'bendahara@sthm.ac.id', role: 'BENDAHARA', color: '#b91c1c' },
  { label: 'Advokat / Konsultan', email: 'konsultan@sthm.ac.id', role: 'CONSULTANT', color: '#4338ca' },
  { label: 'Mahasiswa Paralegal', email: 'paralegal@sthm.ac.id', role: 'PARALEGAL', color: '#047857' },
  { label: 'Dewan Pengawas', email: 'pengawas@sthm.ac.id', role: 'PENGAWAS', color: '#334155' },
];

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState('login');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('customer@gmail.com');
  const [password, setPassword] = useState('password123');

  const roleDestinations = {
    CUSTOMER: '/customer/dashboard',
    CONSULTANT: '/consultant/dashboard',
    ADMIN: '/admin/dashboard',
    SEKRETARIS: '/sekretaris/dashboard',
    BENDAHARA: '/bendahara/dashboard',
    PARALEGAL: '/paralegal/dashboard',
    PENGAWAS: '/pengawas/dashboard',
  };

  async function performLogin(targetEmail, targetPassword) {
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: targetEmail, password: targetPassword }),
      });

      const result = await response.json();
      if (!response.ok) {
        setError(result.error || 'Permintaan tidak dapat diproses.');
        setLoading(false);
        return;
      }

      const role = result.user?.role;
      const dest = roleDestinations[role] || '/';
      window.location.assign(dest);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan jaringan.');
      setLoading(false);
    }
  }

  async function submit(event) {
    event.preventDefault();
    if (mode === 'login') {
      await performLogin(email, password);
      return;
    }

    setError('');
    setLoading(true);
    const data = Object.fromEntries(new FormData(event.currentTarget));
    data.confirmPassword = data.confirmPassword || '';

    try {
      const response = await fetch('/api/auth/register', {
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
      const dest = roleDestinations[role] || '/';
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

  const handleQuickLogin = (demoRole) => {
    setEmail(demoRole.email);
    setPassword('password123');
    performLogin(demoRole.email, 'password123');
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 16px',
        background: 'var(--olive-deep, #22352b)',
      }}
    >
      <div
        className="modal"
        style={{
          width: '100%',
          maxWidth: '460px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <img
            src="/img/logo_LKBH-removebg-preview.png"
            alt="Logo LKBH STHM"
            style={{
              width: '78px',
              height: '78px',
              objectFit: 'contain',
              margin: '0 auto 12px',
              display: 'block',
            }}
          />
          <p className="eyebrow" style={{ margin: 0 }}>
            LKBH STHM
          </p>
          <h2 style={{ margin: '4px 0 0', fontFamily: 'Space Grotesk, sans-serif' }}>
            {mode === 'register' ? 'Daftar Akun Baru' : 'Masuk ke Portal'}
          </h2>
          <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#657068' }}>
            Sistem Informasi Pelayanan Bantuan Hukum Terintegrasi AD/ART
          </p>
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
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
              margin: '18px 0',
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
              marginTop: '18px',
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

          <p style={{ textAlign: 'center', marginTop: '12px', fontSize: '12px' }}>
            <Link href="/" style={{ color: '#9ca3af', textDecoration: 'none' }}>
              &larr; Kembali ke Beranda
            </Link>
          </p>
        </form>
      </div>

      {/* 1-Click Role Switcher Demo Cards */}
      <div
        style={{
          width: '100%',
          maxWidth: '460px',
          marginTop: '16px',
          background: 'rgba(255, 255, 255, 0.08)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          backdropFilter: 'blur(10px)',
          borderRadius: '12px',
          padding: '16px',
          color: '#fff',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
          <Zap size={16} color="#fbbf24" />
          <span style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', color: '#fbbf24' }}>
            Akses Cepat Pengujian 7 Role AD/ART (1-Click)
          </span>
        </div>
        <p style={{ margin: '0 0 12px', fontSize: '11px', color: '#cbd5e1' }}>
          Pilih salah satu role di bawah untuk langsung login dan mencoba alur kerja SOP masing-masing:
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
          {DEMO_ROLES.map((r) => (
            <button
              key={r.role}
              type="button"
              disabled={loading}
              onClick={() => handleQuickLogin(r)}
              style={{
                background: 'rgba(255, 255, 255, 0.95)',
                color: '#1e293b',
                border: 'none',
                borderRadius: '6px',
                padding: '8px 10px',
                textAlign: 'left',
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
                transition: 'all 0.15s ease',
              }}
            >
              <span style={{ fontSize: '11px', fontWeight: 700, color: r.color }}>{r.label}</span>
              <span style={{ fontSize: '10px', color: '#64748b' }}>{r.email}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
