'use client';

import { useState } from 'react';
import { ArrowUpRight, CheckCircle2, Gavel, HeartHandshake, Landmark, Menu, Scale, ShieldCheck, X } from 'lucide-react';
import { getSupabaseBrowserClient } from '../lib/supabase/browserClient';

const services = [
  ['Konsultasi Hukum', 'Kejelasan langkah hukum melalui konsultasi yang terarah.', Scale],
  ['Pendampingan Hukum', 'Pendampingan profesional untuk menghadapi proses hukum.', ShieldCheck],
  ['Legal Opinion', 'Analisis tertulis yang membantu Anda mengambil keputusan.', Landmark],
  ['Mediasi', 'Ruang dialog yang aman untuk menemukan jalan penyelesaian.', HeartHandshake],
  ['Pendaftaran HKI', 'Lindungi merek, karya, dan inovasi Anda secara resmi.', Gavel],
  ['Pro Bono', 'Akses bantuan hukum bagi masyarakat yang memenuhi kriteria.', HeartHandshake]
];

export default function Home() {
  const [authOpen, setAuthOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mode, setMode] = useState('register');
  const [error, setError] = useState('');

  async function submit(event) {
    event.preventDefault(); setError('');
    const data = Object.fromEntries(new FormData(event.currentTarget));
    const endpoint = mode === 'register' ? '/api/auth/register' : '/api/auth/login';
    if (mode === 'register') data.confirmPassword = data.confirmPassword || '';
    const response = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    const result = await response.json();
    if (!response.ok) { setError(result.error || 'Permintaan tidak dapat diproses.'); return; }
    const role = result.user?.role;
    const dest = role === 'CUSTOMER' ? '/customer/dashboard' : role === 'CONSULTANT' ? '/consultant/dashboard' : role === 'ADMIN' ? '/admin/dashboard' : '/dashboard';
    window.location.assign(dest);
  }

  async function handleGoogleLogin() {
    setError('');
    try {
      const supabase = getSupabaseBrowserClient();
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}/auth/callback` }
      });
      if (oauthError) setError(oauthError.message);
    } catch (oauthError) {
      setError(oauthError instanceof Error ? oauthError.message : 'Google OAuth tidak dapat dimulai.');
    }
  }

  return <main className="public-site">
    <header className="public-nav"><a className="public-brand" href="#beranda"><img src="/img/logo_LKBH-removebg-preview.png" alt="Logo LKBH STHM" style={{ width: 52, height: 52, objectFit: 'contain', flexShrink: 0 }} /><span><strong>LBH STHM</strong><small>RUANG KERJA HUKUM</small></span></a><nav className={mobileOpen ? 'mobile-open' : ''}><a href="#beranda" onClick={() => setMobileOpen(false)}>Beranda</a><a href="#layanan" onClick={() => setMobileOpen(false)}>Layanan</a><a href="#tentang" onClick={() => setMobileOpen(false)}>Tentang Kami</a><a href="#kontak" onClick={() => setMobileOpen(false)}>Kontak</a></nav><div className="public-actions"><button className="button secondary" onClick={() => { setMode('login'); setAuthOpen(true); }}>Masuk</button><button className="button gold" onClick={() => { setMode('register'); setAuthOpen(true); }}>Ajukan Bantuan Hukum <ArrowUpRight size={15} /></button></div><button className="icon-button public-menu" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Buka menu">{mobileOpen ? <X size={21} /> : <Menu size={21} />}</button></header>
    <section className="public-hero" id="beranda"><div className="hero-copy"><p className="eyebrow">LEMBAGA BANTUAN HUKUM STHM</p><h1>Mewujudkan keadilan hukum dengan <em>keteguhan.</em></h1><p className="hero-text">Ruang aman untuk mendapatkan konsultasi, pendampingan, dan solusi hukum yang dapat dipertanggungjawabkan.</p><div className="hero-actions"><button className="button gold large" onClick={() => { setMode('register'); setAuthOpen(true); }}>Ajukan Bantuan Hukum <ArrowUpRight size={17} /></button><a className="outline-link" href="#layanan">Pelajari layanan kami <ArrowUpRight size={15} /></a></div></div><div className="hero-note"><div className="hero-seal"><Gavel size={27} /></div><div><strong>Berpihak pada keadilan</strong><span>Untuk masyarakat sipil dan keluarga besar STHM.</span></div></div></section>
    <section className="public-section intro-section" id="tentang"><div><p className="eyebrow">TENTANG LBH STHM</p><h2>Hukum yang hadir lebih dekat dengan kehidupan.</h2></div><p>Kami menghubungkan kebutuhan masyarakat dengan tenaga hukum yang berintegritas, responsif, dan memahami konteks perkara secara utuh. Setiap konsultasi dimulai dari mendengar.</p></section>
    <section className="public-section services-section" id="layanan"><div className="section-heading"><div><p className="eyebrow">LAYANAN KAMI</p><h2>Temukan bantuan yang Anda perlukan.</h2></div><span>01 — 06</span></div><div className="service-grid">{services.map(([title, description, Icon]) => <button className="service-card" key={title} onClick={() => { setMode('register'); setAuthOpen(true); }}><span className="service-icon"><Icon size={20} /></span><strong>{title}</strong><p>{description}</p><ArrowUpRight size={16} /></button>)}</div></section>
    <section className="public-section trust-section"><div className="trust-stat"><strong>01</strong><span>Mulai dari cerita Anda</span></div><div className="trust-stat"><strong>02</strong><span>Rencana hukum yang jelas</span></div><div className="trust-stat"><strong>03</strong><span>Pendampingan yang terukur</span></div></section>
    <footer className="public-footer" id="kontak"><div><a className="public-brand" href="#beranda"><img src="/img/logo_LKBH-removebg-preview.png" alt="Logo LKBH STHM" style={{ width: 52, height: 52, objectFit: 'contain', flexShrink: 0 }} /><span><strong>LBH STHM</strong><small>RUANG KERJA HUKUM</small></span></a><p>Jl. Matraman Raya No. 126, Jakarta Timur<br />Senin–Jumat, 08.00–16.00 WIB</p></div><div><p className="eyebrow">HUBUNGI KAMI</p><strong>lbh@sthm.ac.id</strong><br /><strong>+62 21 856 1234</strong></div><div><p className="eyebrow">TAUTAN</p><a href="#layanan">Layanan</a><a href="#tentang">Tentang kami</a></div></footer>
    {authOpen && <div className="modal-backdrop" onMouseDown={() => setAuthOpen(false)}><form className="modal auth-card" onSubmit={submit} onMouseDown={(event) => event.stopPropagation()}><div className="modal-head"><div><p className="eyebrow">AKSES RUANG KERJA</p><h2>{mode === 'register' ? 'Daftar akun' : 'Masuk ke portal'}</h2></div><button type="button" className="icon-button" onClick={() => setAuthOpen(false)}><X size={19} /></button></div>{mode === 'register' && <><label>Nama Lengkap<input name="name" required /></label><label>No. HP<input name="phone" required /></label></>}<label>Email<input name="email" type="email" required /></label><label>Kata Sandi<input name="password" type="password" minLength="8" required /></label>{mode === 'register' && <label>Konfirmasi Kata Sandi<input name="confirmPassword" type="password" minLength="8" required /></label>}{error && <p className="form-error">{error}</p>}<button className="button primary full" type="submit">{mode === 'register' ? 'Buat Akun' : 'Masuk'} <ArrowUpRight size={16} /></button><div className="auth-divider"><span>atau</span></div><button type="button" className="button secondary full google-button" onClick={handleGoogleLogin}><span className="google-logo" aria-hidden="true">G</span>{mode === 'register' ? 'Daftar dengan Google' : 'Masuk dengan Google'}</button><p className="auth-switch">{mode === 'register' ? 'Sudah punya akun?' : 'Belum punya akun?'} <button type="button" onClick={() => { setMode(mode === 'register' ? 'login' : 'register'); setError(''); }}>{mode === 'register' ? 'Masuk di sini' : 'Daftar di sini'}</button></p></form></div>}
  </main>;
}
