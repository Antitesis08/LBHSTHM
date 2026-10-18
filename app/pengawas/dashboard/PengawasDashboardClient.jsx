'use client';

import Link from 'next/link';
import {
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Scale,
  FileText,
  DollarSign,
  GraduationCap,
  Users,
  Archive,
  ArrowRight
} from 'lucide-react';

export default function PengawasDashboardClient({ metrics, cases }) {
  const formatRupiah = (val) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(val || 0);

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 20px 80px' }}>
      {/* Header Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #1c1917 0%, #292524 100%)',
          color: '#fff',
          borderRadius: 12,
          padding: '24px 28px',
          marginBottom: 24,
          boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <ShieldCheck size={22} color="#fbbf24" />
          <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#fbbf24' }}>
            Dewan Pengawas & Pembina LKBH STHM
          </span>
        </div>
        <h1 style={{ fontSize: 24, fontWeight: 800, margin: '0 0 6px', fontFamily: 'Space Grotesk' }}>
          Portal Pengawasan & Audit Integritas
        </h1>
        <p style={{ margin: 0, fontSize: 13, color: '#d6d3d1', maxWidth: 700, lineHeight: 1.5 }}>
          Supervisi kepatuhan SOP AD/ART LKBH STHM, jaminan bantuan hukum cuma-cuma (zero fee), dan monitoring tri dharma perguruan tinggi bersama LPPM STHM.
        </p>
      </div>

      {/* Zero Fee Integrity Guarantee Alert */}
      <div
        style={{
          background: '#f0fdf4',
          border: '1px solid #86efac',
          borderRadius: 10,
          padding: '16px 20px',
          marginBottom: 24,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 12
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <ShieldCheck size={28} color="#16a34a" />
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#166534' }}>
              Zero-Fee Guarantee: 100% Terverifikasi Patuh
            </div>
            <div style={{ fontSize: 12, color: '#15803d', marginTop: 2 }}>
              Tidak ditemukan pemungutan biaya jasa hukum (success fee/lawyer fee) kepada para pencari keadilan kurang mampu. Sesuai Pasal 18 Bab VII AD/ART.
            </div>
          </div>
        </div>
        <span style={{ background: '#16a34a', color: '#fff', fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 20 }}>
          INTEGRITAS TERJAGA
        </span>
      </div>

      {/* Key Audit KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16, marginBottom: 24 }}>
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, padding: 18 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 13, color: '#64748b', fontWeight: 600 }}>Skor Kepatuhan SOP AD/ART</span>
            <CheckCircle2 size={20} color="#16a34a" />
          </div>
          <div style={{ fontSize: 28, fontWeight: 800, color: '#0f172a', marginTop: 8 }}>
            {metrics.sopCompliancePct}%
          </div>
          <div style={{ fontSize: 12, color: '#16a34a', marginTop: 4 }}>
            Memenuhi standar baku SOP-01 s/d SOP-06
          </div>
        </div>

        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, padding: 18 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 13, color: '#64748b', fontWeight: 600 }}>Gelar Perkara (SOP-02)</span>
            <Scale size={20} color="#2563eb" />
          </div>
          <div style={{ fontSize: 28, fontWeight: 800, color: '#0f172a', marginTop: 8 }}>
            {metrics.bagkCases} / {metrics.totalCases}
          </div>
          <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>
            Berita Acara Gelar Kasus (BAGK) terbit
          </div>
        </div>

        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, padding: 18 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 13, color: '#64748b', fontWeight: 600 }}>Keterlibatan Praktikan Mahasiswa</span>
            <GraduationCap size={20} color="#d97706" />
          </div>
          <div style={{ fontSize: 28, fontWeight: 800, color: '#0f172a', marginTop: 8 }}>
            {metrics.paralegalAssistedCases} Perkara
          </div>
          <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>
            Asistensi klinik hukum edukasi
          </div>
        </div>

        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, padding: 18 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 13, color: '#64748b', fontWeight: 600 }}>Dossier Arsip Permanen (SOP-06)</span>
            <Archive size={20} color="#7c3aed" />
          </div>
          <div style={{ fontSize: 28, fontWeight: 800, color: '#0f172a', marginTop: 8 }}>
            {metrics.archivedCases} Selesai
          </div>
          <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>
            Disinkronkan dengan data LPPM
          </div>
        </div>
      </div>

      {/* Compliance Detailed Checklist */}
      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, padding: 22, marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 style={{ fontSize: 17, fontWeight: 800, margin: 0, fontFamily: 'Space Grotesk' }}>
            Matriks Supervisi Kepatuhan SOP Terintegrasi
          </h2>
          <Link
            href="/pengawas/kepatuhan"
            style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, color: 'var(--olive, #3b4a2e)', fontWeight: 600, textDecoration: 'none' }}
          >
            Lihat Audit Per Perkara <ArrowRight size={14} />
          </Link>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14 }}>
          <div style={{ border: '1px solid #f1f5f9', background: '#fafafa', borderRadius: 8, padding: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#334155' }}>SOP-01 Registrasi Buku Induk</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#16a34a' }}>
                {metrics.registeredCases} Terdaftar
              </span>
            </div>
            <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>
              Verifikasi identitas pemohon dan kelayakan dokumen SKTM / rekomendasi resmi.
            </div>
          </div>

          <div style={{ border: '1px solid #f1f5f9', background: '#fafafa', borderRadius: 8, padding: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#334155' }}>SOP-02 Gelar Perkara & Konflik</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#16a34a' }}>
                {metrics.conflictCheckedCases} Lolos Uji
              </span>
            </div>
            <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>
              Pemeriksaan benturan kepentingan & notulensi rapat BAGK sebelum terbit Legal Opinion.
            </div>
          </div>

          <div style={{ border: '1px solid #f1f5f9', background: '#fafafa', borderRadius: 8, padding: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#334155' }}>SOP-04 & Lampiran F Keuangan</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#16a34a' }}>
                {formatRupiah(metrics.totalExpense)}
              </span>
            </div>
            <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>
              Realisasi biaya operasional perkara pro bono dari anggaran DIPA/hibah resmi.
            </div>
          </div>

          <div style={{ border: '1px solid #f1f5f9', background: '#fafafa', borderRadius: 8, padding: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#334155' }}>SOP-06 Pengarsipan & LPPM</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#16a34a' }}>
                {metrics.archivedCases} Terarsip
              </span>
            </div>
            <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>
              Penomoran lemari arsip (dossier box) dan sinkronisasi Tri Dharma Perguruan Tinggi.
            </div>
          </div>
        </div>
      </div>

      {/* Quick Access to LPPM & Kepatuhan */}
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        <Link
          href="/pengawas/kepatuhan"
          style={{
            flex: 1,
            minWidth: 260,
            background: '#fff',
            border: '1px solid #e2e8f0',
            borderRadius: 10,
            padding: 18,
            textDecoration: 'none',
            color: 'inherit',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#0f172a' }}>Laporan Kepatuhan SOP</div>
            <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>Audit detail tiap berkas perkara per SOP 01-06</div>
          </div>
          <ArrowRight size={18} color="#94a3b8" />
        </Link>

        <Link
          href="/pengawas/lppm"
          style={{
            flex: 1,
            minWidth: 260,
            background: '#fff',
            border: '1px solid #e2e8f0',
            borderRadius: 10,
            padding: 18,
            textDecoration: 'none',
            color: 'inherit',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#0f172a' }}>Sinkronisasi Data LPPM STHM</div>
            <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>Ekspor laporan pengabdian masyarakat Tri Dharma</div>
          </div>
          <ArrowRight size={18} color="#94a3b8" />
        </Link>
      </div>
    </div>
  );
}
