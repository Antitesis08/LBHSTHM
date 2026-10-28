'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ClipboardList,
  Search,
  Filter,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  User,
  Scale,
  Calendar,
  ArrowRight,
  ShieldCheck,
  FileCheck
} from 'lucide-react';

const SERVICE_LABELS = {
  KONSULTASI_HUKUM: 'Konsultasi Hukum',
  PENDAMPINGAN_HUKUM: 'Pendampingan Hukum',
  LEGAL_OPINION: 'Legal Opinion',
  MEDIASI: 'Mediasi Perkara',
  PENDAFTARAN_HKI: 'Pendaftaran HKI',
  PRO_BONO: 'Bantuan Hukum Cuma-Cuma (Pro Bono)',
};

function statusBadge(status) {
  const map = {
    DIAJUKAN: { label: 'Diajukan', bg: '#fef3c7', color: '#92400e', border: '#fde68a' },
    DIVERIFIKASI: { label: 'Diverifikasi', bg: '#dbeafe', color: '#1e40af', border: '#bfdbfe' },
    DITUGASKAN: { label: 'Ditugaskan Kepala', bg: '#e0e7ff', color: '#3730a3', border: '#c7d2fe' },
    PROSES: { label: 'Dalam Penanganan', bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe' },
    MENUNGGU_DOKUMEN: { label: 'Menunggu Dokumen', bg: '#fef3c7', color: '#92400e', border: '#fde68a' },
    MENUNGGU_VERIFIKASI_SEKRETARIS: { label: 'Verifikasi Sekretariat', bg: '#fff7ed', color: '#c2410c', border: '#fed7aa' },
    SELESAI: { label: 'Selesai / Tuntas', bg: '#dcfce7', color: '#15803d', border: '#bbf7d0' },
    DITOLAK: { label: 'Ditolak', bg: '#fee2e2', color: '#991b1b', border: '#fecaca' },
  };
  return map[status] || { label: status, bg: '#f3f4f6', color: '#374151', border: '#e5e7eb' };
}

export default function ConsultantCasesClient({ cases = [], user }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const filterTabs = [
    { key: 'ALL', label: 'Semua Kasus', count: cases.length },
    {
      key: 'ACTIVE',
      label: 'Aktif / Dalam Penanganan',
      count: cases.filter((c) => ['DITUGASKAN', 'PROSES', 'MENUNGGU_DOKUMEN'].includes(c.status)).length,
    },
    {
      key: 'WAITING_REVIEW',
      label: 'Menunggu Verifikasi Sekretariat',
      count: cases.filter((c) => c.status === 'MENUNGGU_VERIFIKASI_SEKRETARIS').length,
    },
    {
      key: 'COMPLETED',
      label: 'Selesai',
      count: cases.filter((c) => c.status === 'SELESAI').length,
    },
  ];

  const filteredCases = cases.filter((item) => {
    // Tab filtering
    if (activeTab === 'ACTIVE' && !['DITUGASKAN', 'PROSES', 'MENUNGGU_DOKUMEN'].includes(item.status)) {
      return false;
    }
    if (activeTab === 'WAITING_REVIEW' && item.status !== 'MENUNGGU_VERIFIKASI_SEKRETARIS') {
      return false;
    }
    if (activeTab === 'COMPLETED' && item.status !== 'SELESAI') {
      return false;
    }

    // Search query filtering
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return (
      item.code.toLowerCase().includes(q) ||
      (item.title && item.title.toLowerCase().includes(q)) ||
      (item.client?.name && item.client.name.toLowerCase().includes(q)) ||
      (item.sprinNumber && item.sprinNumber.toLowerCase().includes(q)) ||
      (item.serviceType && item.serviceType.toLowerCase().includes(q))
    );
  });

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', paddingBottom: 60 }}>
      {/* Page Header */}
      <div style={{ marginBottom: 24 }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: '#16a34a', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          SOP-02: Manajemen Penugasan Advokat & Pelayanan Hukum
        </span>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#0f172a', margin: '4px 0 8px' }}>
          Daftar Kasus Ditugaskan oleh Kepala LKBH
        </h1>
        <p style={{ margin: 0, fontSize: 14, color: '#64748b' }}>
          Daftar perkara resmi yang telah didisposisikan oleh Kepala LKBH STHM melalui Surat Perintah (SPRIN). Klik perkara untuk membuka workspace penanganan, menyusun arahan, dan mengunggah dokumen hasil penyelesaian perkara.
        </p>
      </div>

      {/* Control Bar: Search & Filter Tabs */}
      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', padding: '16px 20px', marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          {/* Tabs */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {filterTabs.map((tab) => {
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '8px 14px',
                    borderRadius: 8,
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer',
                    border: '1px solid',
                    borderColor: isActive ? 'var(--primary, #3b4a2e)' : '#e2e8f0',
                    background: isActive ? 'var(--primary, #3b4a2e)' : '#f8fafc',
                    color: isActive ? '#fff' : '#475569',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {tab.label}
                  <span
                    style={{
                      background: isActive ? 'rgba(255,255,255,0.25)' : '#e2e8f0',
                      color: isActive ? '#fff' : '#334155',
                      fontSize: 11,
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: 999,
                    }}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search box */}
          <div style={{ position: 'relative', minWidth: 260 }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari kode, klien, sprin..."
              style={{
                width: '100%',
                padding: '8px 12px 8px 36px',
                borderRadius: 8,
                border: '1px solid #cbd5e1',
                fontSize: 13,
                boxSizing: 'border-box',
              }}
            />
          </div>
        </div>
      </div>

      {/* Cases List */}
      {filteredCases.length === 0 ? (
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', padding: '60px 20px', textAlign: 'center' }}>
          <ClipboardList size={40} style={{ margin: '0 auto 12px', color: '#94a3b8' }} />
          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1e293b', marginBottom: 4 }}>
            Tidak ada perkara pada kategori ini
          </h3>
          <p style={{ fontSize: 13, color: '#64748b', maxWidth: 460, margin: '0 auto' }}>
            {searchTerm
              ? 'Tidak ditemukan perkara yang sesuai dengan kata kunci pencarian Anda.'
              : 'Belum ada kasus yang masuk dalam kriteria filter status yang dipilih.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {filteredCases.map((item) => {
            const badge = statusBadge(item.status);
            return (
              <div
                key={item.id}
                onClick={() => router.push(`/consultant/kasus/${item.id}`)}
                style={{
                  background: '#fff',
                  borderRadius: 12,
                  border: '1px solid #e2e8f0',
                  padding: '20px 24px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 16,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--primary, #3b4a2e)';
                  e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.06)';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#e2e8f0';
                  e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.02)';
                  e.currentTarget.style.transform = 'none';
                }}
              >
                {/* Left side info */}
                <div style={{ flex: '1 1 500px', minWidth: 280 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 8 }}>
                    <span style={{
                      fontWeight: 800,
                      fontSize: 13,
                      color: 'var(--primary, #3b4a2e)',
                      background: '#f0fdf4',
                      padding: '4px 10px',
                      borderRadius: 6,
                      border: '1px solid #bbf7d0',
                    }}>
                      {item.code}
                    </span>

                    {item.sprinNumber && (
                      <span style={{
                        fontSize: 12,
                        background: '#f8fafc',
                        color: '#475569',
                        padding: '4px 10px',
                        borderRadius: 6,
                        border: '1px solid #cbd5e1',
                        fontWeight: 600,
                      }}>
                        Dasar: {item.sprinNumber}
                      </span>
                    )}

                    <span style={{
                      fontSize: 12,
                      fontWeight: 600,
                      padding: '4px 10px',
                      borderRadius: 999,
                      background: badge.bg,
                      color: badge.color,
                      border: `1px solid ${badge.border}`,
                    }}>
                      {badge.label}
                    </span>
                  </div>

                  <h3 style={{ fontSize: 17, fontWeight: 700, color: '#0f172a', margin: '0 0 6px' }}>
                    {item.title}
                  </h3>

                  <p style={{
                    margin: '0 0 12px',
                    fontSize: 13,
                    color: '#64748b',
                    lineHeight: 1.5,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                  }}>
                    {item.description}
                  </p>

                  <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', fontSize: 12, color: '#475569' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <User size={14} color="#64748b" />
                      <span>Klien: <strong>{item.client?.name || '-'}</strong> {item.client?.phone ? `(${item.client.phone})` : ''}</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Scale size={14} color="#64748b" />
                      <span>Layanan: <strong>{SERVICE_LABELS[item.serviceType] || item.serviceType || 'Pendampingan'}</strong></span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Calendar size={14} color="#64748b" />
                      <span>Diajukan: {new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium' }).format(new Date(item.createdAt))}</span>
                    </div>

                    {item.documents?.length > 0 && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <FileText size={14} color="#64748b" />
                        <span>{item.documents.length} Dokumen Berkas</span>
                      </div>
                    )}
                  </div>

                  {/* Rejection notice if previously rejected by Sekretariat */}
                  {item.closingRejectionReason && item.status === 'PROSES' && (
                    <div style={{
                      marginTop: 12,
                      padding: '8px 12px',
                      background: '#fef2f2',
                      border: '1px solid #fecaca',
                      borderRadius: 6,
                      fontSize: 12,
                      color: '#991b1b',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                    }}>
                      <AlertCircle size={15} style={{ flexShrink: 0 }} />
                      <span>
                        <strong>Catatan Revisi dari Sekretaris:</strong> "{item.closingRejectionReason}"
                      </span>
                    </div>
                  )}

                  {/* Waiting review banner */}
                  {item.status === 'MENUNGGU_VERIFIKASI_SEKRETARIS' && (
                    <div style={{
                      marginTop: 12,
                      padding: '8px 12px',
                      background: '#fff7ed',
                      border: '1px solid #fed7aa',
                      borderRadius: 6,
                      fontSize: 12,
                      color: '#9a3412',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                    }}>
                      <FileCheck size={15} style={{ flexShrink: 0 }} />
                      <span>
                        Dokumen hasil <strong>"{item.closingDocName || 'Dokumen Hasil'}"</strong> sedang ditelaah oleh Sekretariat LKBH.
                      </span>
                    </div>
                  )}
                </div>

                {/* Right side action button */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '8px 16px',
                    borderRadius: 8,
                    background: 'var(--primary, #3b4a2e)',
                    color: '#fff',
                    fontSize: 13,
                    fontWeight: 600,
                  }}>
                    Buka Kasus <ArrowRight size={15} />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
