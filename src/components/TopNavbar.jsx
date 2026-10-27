'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Bell,
  Menu,
  X,
  LayoutDashboard,
  ClipboardList,
  CalendarDays,
  MessageCircle,
  Users,
  FileText,
  ChevronDown
} from 'lucide-react';

export default function TopNavbar({ role, userName }) {
  const [mobileNav, setMobileNav] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  };

  const roleTitles = {
    CUSTOMER: 'Klien Pemohon',
    ADMIN: 'Kepala LKBH STHM',
    SEKRETARIS: 'Sekretariat LKBH',
    BENDAHARA: 'Bendahara LKBH',
    CONSULTANT: 'Advokat / Konsultan',
    PARALEGAL: 'Mahasiswa Praktikan',
    PENGAWAS: 'Dewan Pengawas'
  };

  let navItems = [];
  if (role === 'CUSTOMER') {
    navItems.push({ label: 'Kasus Saya', href: '/customer/dashboard', icon: ClipboardList });
    navItems.push({ label: 'Ajukan Bantuan', href: '/customer/pengajuan', icon: FileText });
  } else if (role === 'CONSULTANT') {
    navItems.push({ label: 'Kasus Ditugaskan', href: '/consultant/dashboard', icon: ClipboardList });
  } else if (role === 'SEKRETARIS') {
    navItems.push({ label: 'Buku Induk Registrasi', href: '/sekretaris/dashboard', icon: ClipboardList });
    navItems.push({ label: 'Gelar Kasus (BAGK)', href: '/sekretaris/gelar-kasus', icon: FileText });
    navItems.push({ label: 'Arsip Dossier', href: '/sekretaris/dossier', icon: LayoutDashboard });
  } else if (role === 'BENDAHARA') {
    navItems.push({ label: 'Ikhtisar Keuangan', href: '/bendahara/dashboard', icon: LayoutDashboard });
    navItems.push({ label: 'Anggaran Kasus', href: '/bendahara/anggaran', icon: ClipboardList });
    navItems.push({ label: 'Buku Kas & Neraca', href: '/bendahara/neraca', icon: FileText });
  } else if (role === 'PARALEGAL') {
    navItems.push({ label: 'Kasus Asistensi', href: '/paralegal/dashboard', icon: ClipboardList });
    navItems.push({ label: 'Observasi Sidang', href: '/paralegal/observasi', icon: FileText });
  } else if (role === 'PENGAWAS') {
    navItems.push({ label: 'Audit Pengawasan', href: '/pengawas/dashboard', icon: LayoutDashboard });
    navItems.push({ label: 'Kepatuhan SOP', href: '/pengawas/kepatuhan', icon: ClipboardList });
    navItems.push({ label: 'Data LPPM STHM', href: '/pengawas/lppm', icon: Users });
  } else if (role === 'ADMIN') {
    navItems.push({ label: 'Dashboard Kepala', href: '/admin/dashboard', icon: LayoutDashboard });
    navItems.push({ label: 'Manajemen Perkara', href: '/admin/kasus', icon: ClipboardList });
    navItems.push({ label: 'Buku Registrasi', href: '/sekretaris/dashboard', icon: FileText });
    navItems.push({ label: 'Keuangan LKBH', href: '/bendahara/dashboard', icon: LayoutDashboard });
    navItems.push({ label: 'Arsip Dossier', href: '/sekretaris/dossier', icon: FileText });
    navItems.push({ label: 'Manajemen User', href: '/admin/users', icon: Users });
  }

  const initials = userName
    ? userName.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase()
    : role.substring(0, 2).toUpperCase();


  return (
    <header className="topbar horizontal-navbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 24px', height: '64px', backgroundColor: '#fff', borderBottom: '1px solid var(--line)', position: 'sticky', top: 0, zIndex: 100 }}>
      {/* Brand */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button className="icon-button mobile-menu-btn" onClick={() => setMobileNav(true)} aria-label="Buka navigasi" style={{ display: 'none' }}>
          <Menu size={20} />
        </button>
        <Link
          href={role === 'CUSTOMER' ? '/customer/dashboard' : `/${role.toLowerCase()}/dashboard`}
          style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', color: 'inherit' }}
        >
          <img
            src="/img/logo_LKBH-removebg-preview.png"
            alt="Logo LKBH STHM"
            style={{ width: 48, height: 48, objectFit: 'contain', flexShrink: 0 }}
          />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <strong style={{ fontSize: 14, fontWeight: 700, lineHeight: 1.2 }}>LBH STHM</strong>
            <span style={{ fontSize: 10, color: '#657068', fontWeight: 600, letterSpacing: '0.05em' }}>RUANG KERJA HUKUM</span>
          </div>
        </Link>
      </div>

      {/* Desktop Navigation */}
      <nav className="desktop-nav" style={{ display: 'flex', gap: 20 }}>
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== `/${role.toLowerCase()}` && pathname.startsWith(item.href));
          return (
            <Link
              key={item.label}
              href={item.href}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                fontSize: 14,
                fontWeight: 500,
                color: isActive ? 'var(--primary)' : '#657068',
                textDecoration: 'none',
                padding: '8px 12px',
                borderRadius: 6,
                background: isActive ? 'var(--bg-muted)' : 'transparent'
              }}
            >
              <item.icon size={16} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User Actions */}
      <div className="top-actions" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <button className="icon-button notification" aria-label="Notifikasi" style={{ position: 'relative' }}>
          <Bell size={18} />
          <i style={{ position: 'absolute', top: 4, right: 4, width: 6, height: 6, background: 'var(--red)', borderRadius: '50%' }} />
        </button>
        <div className="profile-dropdown" style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', position: 'relative' }} ref={dropdownRef} onClick={() => setDropdownOpen(!dropdownOpen)}>
          <div className="avatar" style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: 13 }}>
            {initials}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#0f172a', lineHeight: 1.2 }}>{userName}</span>
            <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--primary, #16a34a)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {roleTitles[role] || role}
            </span>
          </div>
          <ChevronDown size={14} color="#657068" />

          {dropdownOpen && (
            <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: 8, width: 200, background: '#fff', borderRadius: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.1)', border: '1px solid #e5e7eb', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              {role === 'CUSTOMER' && (
                <Link href="/customer/profil" style={{ padding: '12px 16px', fontSize: 14, color: '#374151', textDecoration: 'none', borderBottom: '1px solid #f3f4f6' }}>
                  Profil & Keamanan Akun
                </Link>
              )}
              {/* Optional: Add profile links for other roles if needed later */}
              <button onClick={handleLogout} style={{ padding: '12px 16px', fontSize: 14, color: '#dc2626', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', borderTop: role !== 'CUSTOMER' ? 'none' : '1px solid #f3f4f6' }}>
                Keluar
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileNav && (
        <div className="mobile-drawer-overlay" style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 200 }} onClick={() => setMobileNav(false)}>
          <div className="mobile-drawer" style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: 260, backgroundColor: '#fff', padding: 24, display: 'flex', flexDirection: 'column' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <img
                  src="/img/logo_LKBH-removebg-preview.png"
                  alt="Logo LKBH STHM"
                  style={{ width: 42, height: 42, objectFit: 'contain', flexShrink: 0 }}
                />
                <strong>LBH STHM</strong>
              </div>
              <button className="icon-button" onClick={() => setMobileNav(false)}>
                <X size={20} />
              </button>
            </div>
            <nav style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setMobileNav(false)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    fontSize: 15,
                    color: '#1a1f1b',
                    textDecoration: 'none',
                    padding: '12px',
                    borderRadius: 8,
                    background: pathname === item.href ? 'var(--bg-muted)' : 'transparent'
                  }}
                >
                  <item.icon size={18} />
                  <span>{item.label}</span>
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}
