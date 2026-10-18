'use client';

import Link from 'next/link';
import {
  ArrowLeft,
  GraduationCap,
  Download,
  Printer,
  Building,
  CheckCircle2,
  FileSpreadsheet,
  Users
} from 'lucide-react';

export default function LppmClient({ cases }) {
  const totalCases = cases.length;
  const closedCases = cases.filter((c) => c.isArchived || c.status === 'SELESAI').length;
  const paralegalAssisted = cases.filter((c) => c.assignedParalegalId).length;

  // Breakdown per Category
  const categoriesMap = {};
  cases.forEach((c) => {
    const cat = c.category || 'LAINNYA';
    categoriesMap[cat] = (categoriesMap[cat] || 0) + 1;
  });

  return (
    <div style={{ maxWidth: 1050, margin: '0 auto', padding: '24px 20px 80px' }}>
      <Link
        href="/pengawas/dashboard"
        style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#64748b', textDecoration: 'none', fontSize: 13, marginBottom: 16 }}
      >
        <ArrowLeft size={16} /> Kembali ke Dashboard Pengawas
      </Link>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#1e40af', background: '#eff6ff', padding: '4px 10px', borderRadius: 6 }}>
            Tri Dharma Perguruan Tinggi STHM
          </span>
          <h1 style={{ fontSize: 24, fontWeight: 800, margin: '6px 0 2px', fontFamily: 'Space Grotesk' }}>
            Sinkronisasi Laporan Pengabdian Masyarakat (LPPM)
          </h1>
          <p style={{ margin: 0, color: '#657068', fontSize: 13 }}>
            Rekapitulasi berkas perkara terarsip & jam terbang asistensi klinik hukum untuk akreditasi institusi STHM.
          </p>
        </div>

        <button
          onClick={() => window.print()}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            backgroundColor: '#f8fafc',
            border: '1px solid #cbd5e1',
            padding: '8px 16px',
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          <Printer size={16} /> Cetak Lembar LPPM
        </button>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16, marginBottom: 24 }}>
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, padding: 18 }}>
          <span style={{ fontSize: 13, color: '#64748b', fontWeight: 600 }}>Total Pengabdian Bantuan Hukum</span>
          <div style={{ fontSize: 28, fontWeight: 800, color: '#0f172a', marginTop: 8 }}>
            {totalCases} Perkara
          </div>
          <div style={{ fontSize: 12, color: '#16a34a', marginTop: 4 }}>
            Pro Bono bagi masyarakat kurang mampu
          </div>
        </div>

        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, padding: 18 }}>
          <span style={{ fontSize: 13, color: '#64748b', fontWeight: 600 }}>Penyelesaian Perkara & Inkracht</span>
          <div style={{ fontSize: 28, fontWeight: 800, color: '#15803d', marginTop: 8 }}>
            {closedCases} Perkara
          </div>
          <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>
            Telah tuntas & diterbitkan Berita Acara
          </div>
        </div>

        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, padding: 18 }}>
          <span style={{ fontSize: 13, color: '#64748b', fontWeight: 600 }}>Keterlibatan Praktik Mahasiswa</span>
          <div style={{ fontSize: 28, fontWeight: 800, color: '#2563eb', marginTop: 8 }}>
            {paralegalAssisted} Perkara
          </div>
          <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>
            Pemenuhan jam terbang Kemahiran Hukum
          </div>
        </div>
      </div>

      {/* Table of Disseminated Cases */}
      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Daftar Rekapitulasi Perkara untuk Lembar Pengabdian LPPM</h3>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#fafafa', borderBottom: '1px solid #e2e8f0', textAlign: 'left', color: '#475569' }}>
                <th style={{ padding: '10px 14px', fontWeight: 600 }}>No. Registrasi</th>
                <th style={{ padding: '10px 14px', fontWeight: 600 }}>Judul Perkara & Bidang</th>
                <th style={{ padding: '10px 14px', fontWeight: 600 }}>Advokat Pembimbing</th>
                <th style={{ padding: '10px 14px', fontWeight: 600 }}>Mahasiswa Asisten</th>
                <th style={{ padding: '10px 14px', fontWeight: 600, textAlign: 'center' }}>No. Dossier</th>
              </tr>
            </thead>
            <tbody>
              {cases.map((c) => (
                <tr key={c.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '10px 14px', fontWeight: 700, color: 'var(--olive, #3b4a2e)' }}>
                    {c.registrationNumber || c.code}
                  </td>
                  <td style={{ padding: '10px 14px' }}>
                    <div style={{ fontWeight: 600, color: '#0f172a' }}>{c.title}</div>
                    <div style={{ fontSize: 11, color: '#64748b' }}>Kategori: {c.category}</div>
                  </td>
                  <td style={{ padding: '10px 14px', color: '#334155' }}>
                    {c.consultant ? c.consultant.user.name : '-'}
                  </td>
                  <td style={{ padding: '10px 14px', color: '#334155' }}>
                    {c.paralegal ? c.paralegal.name : '-'}
                  </td>
                  <td style={{ padding: '10px 14px', textAlign: 'center', fontWeight: 600, color: '#7c3aed' }}>
                    {c.dossierNumber || (c.isArchived ? 'DOSSIER-READY' : '-')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
