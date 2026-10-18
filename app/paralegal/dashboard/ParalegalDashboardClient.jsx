'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  GraduationCap,
  Scale,
  FileText,
  Calendar,
  Eye,
  CheckCircle2,
  Clock,
  UserCheck,
  Download,
  AlertCircle,
  ExternalLink
} from 'lucide-react';

export default function ParalegalDashboardClient({ cases, user }) {
  const [selectedCase, setSelectedCase] = useState(null);

  const statusBadge = (st) => {
    switch (st) {
      case 'DIPROSES':
        return { label: 'Dalam Pendampingan', bg: '#eff6ff', color: '#1d4ed8' };
      case 'SELESAI':
        return { label: 'Perkara Selesai', bg: '#f0fdf4', color: '#15803d' };
      case 'DITUGASKAN':
        return { label: 'Advokat Ditugaskan', bg: '#fefce8', color: '#a16207' };
      case 'DIVERIFIKASI':
        return { label: 'Terverifikasi (LO Siap)', bg: '#faf5ff', color: '#7e22ce' };
      default:
        return { label: st, bg: '#f1f5f9', color: '#475569' };
    }
  };

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 20px 80px' }}>
      {/* Header Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)',
          color: '#fff',
          borderRadius: 12,
          padding: '24px 28px',
          marginBottom: 24,
          boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <GraduationCap size={22} color="#93c5fd" />
          <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#93c5fd' }}>
            Klinik Hukum & Laboratorium Kemahiran Hukum STHM
          </span>
        </div>
        <h1 style={{ fontSize: 24, fontWeight: 800, margin: '0 0 6px', fontFamily: 'Space Grotesk' }}>
          Selamat Datang, {user?.name || 'Mahasiswa Praktikan'}
        </h1>
        <p style={{ margin: 0, fontSize: 13, color: '#e0e7ff', maxWidth: 650, lineHeight: 1.5 }}>
          Ruang kerja asistensi advokasi, penelaahan alat bukti, dan pendampingan sidang pengadilan sesuai SOP Klinik Hukum Edukasi (Lampiran C & D).
        </p>
      </div>

      {/* Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 24 }}>
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, padding: 16 }}>
          <span style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>Perkara Asistensi Aktif</span>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#1e3a8a', marginTop: 6 }}>
            {cases.length} Perkara
          </div>
        </div>

        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, padding: 16 }}>
          <span style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>Jadwal Sidang & Agenda</span>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#d97706', marginTop: 6 }}>
            {cases.reduce((sum, c) => sum + (c.hearings?.length || 0), 0)} Agenda
          </div>
        </div>

        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, padding: 16 }}>
          <span style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>Status Magang Klinik</span>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#15803d', marginTop: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
            <CheckCircle2 size={18} /> Aktif Terverifikasi
          </div>
        </div>
      </div>

      {/* Case List */}
      <h2 style={{ fontSize: 18, fontWeight: 800, margin: '0 0 16px', fontFamily: 'Space Grotesk' }}>
        Daftar Perkara yang Ditugaskan
      </h2>

      {cases.length === 0 ? (
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, padding: 36, textAlign: 'center' }}>
          <Scale size={36} color="#94a3b8" style={{ margin: '0 auto 12px' }} />
          <h3 style={{ margin: '0 0 6px', fontSize: 16, fontWeight: 700 }}>Belum Ada Perkara yang Ditugaskan</h3>
          <p style={{ margin: 0, fontSize: 13, color: '#64748b' }}>
            Kepala LKBH atau Advokat Publik akan menugaskan Anda ke perkara baru melalui Surat Perintah Asistensi.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {cases.map((c) => {
            const badge = statusBadge(c.status);
            return (
              <div
                key={c.id}
                style={{
                  background: '#fff',
                  border: '1px solid #e2e8f0',
                  borderRadius: 10,
                  padding: 20,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  flexWrap: 'wrap',
                  gap: 16
                }}
              >
                <div style={{ flex: '1 1 500px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--olive, #3b4a2e)', background: '#f5f7f2', padding: '2px 8px', borderRadius: 4 }}>
                      {c.code}
                    </span>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        backgroundColor: badge.bg,
                        color: badge.color,
                        padding: '2px 8px',
                        borderRadius: 4
                      }}
                    >
                      {badge.label}
                    </span>
                    <span style={{ fontSize: 12, color: '#64748b' }}>
                      Kategori: <strong>{c.category}</strong>
                    </span>
                  </div>

                  <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 8px' }}>{c.title}</h3>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, fontSize: 12, color: '#475569' }}>
                    <div>
                      Klien: <strong>{c.client?.name}</strong> ({c.client?.phone || '-'})
                    </div>
                    {c.consultant && (
                      <div>
                        Advokat Pembimbing: <strong>{c.consultant.user.name}</strong>
                      </div>
                    )}
                    <div>
                      Dokumen Terlampir: <strong>{c.documents?.length || 0} Berkas</strong>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <button
                    onClick={() => setSelectedCase(c)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      background: '#f8fafc',
                      border: '1px solid #cbd5e1',
                      padding: '8px 14px',
                      borderRadius: 6,
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    <Eye size={15} /> Telaah Berkas ({c.documents?.length || 0})
                  </button>

                  <Link
                    href="/paralegal/observasi"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      background: 'var(--olive, #3b4a2e)',
                      color: '#fff',
                      textDecoration: 'none',
                      padding: '8px 14px',
                      borderRadius: 6,
                      fontSize: 13,
                      fontWeight: 600
                    }}
                  >
                    <Calendar size={15} /> Catatan Sidang
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Telaah Berkas */}
      {selectedCase && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20,
            zIndex: 1000
          }}
        >
          <div
            style={{
              background: '#fff',
              borderRadius: 12,
              padding: 24,
              maxWidth: 650,
              width: '100%',
              maxHeight: '85vh',
              overflowY: 'auto',
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div>
                <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--olive, #3b4a2e)' }}>
                  {selectedCase.code}
                </span>
                <h3 style={{ margin: '2px 0 0', fontSize: 18, fontWeight: 700 }}>
                  Telaah Berkas & Alat Bukti Perkara
                </h3>
              </div>
              <button
                onClick={() => setSelectedCase(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#657068', fontSize: 18, fontWeight: 700 }}
              >
                ✕
              </button>
            </div>

            <div style={{ background: '#f8fafc', padding: 14, borderRadius: 8, marginBottom: 16, fontSize: 13 }}>
              <strong>Uraian / Kronologi Kasus:</strong>
              <p style={{ margin: '4px 0 0', color: '#475569', lineHeight: 1.5 }}>
                {selectedCase.description || 'Tidak ada deskripsi tambahan.'}
              </p>
            </div>

            <h4 style={{ margin: '0 0 10px', fontSize: 14, fontWeight: 700 }}>
              Daftar Dokumen Resmi & Bukti Klien
            </h4>

            {selectedCase.documents?.length === 0 ? (
              <div style={{ padding: 14, background: '#f9fafb', borderRadius: 6, fontSize: 12, color: '#6b7280', textAlign: 'center' }}>
                Belum ada dokumen yang diunggah.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {selectedCase.documents.map((doc) => (
                  <div
                    key={doc.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '10px 14px',
                      background: '#fff',
                      border: '1px solid #e2e8f0',
                      borderRadius: 6
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <FileText size={18} color="#2563eb" />
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>{doc.fileName}</div>
                        <div style={{ fontSize: 11, color: '#64748b' }}>
                          Kategori: {doc.fileType || 'Dokumen Kasus'} · {doc.fileSize ? `${Math.round(doc.fileSize / 1024)} KB` : ''}
                        </div>
                      </div>
                    </div>

                    <a
                      href={doc.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                        fontSize: 12,
                        fontWeight: 600,
                        color: 'var(--olive, #3b4a2e)',
                        textDecoration: 'none'
                      }}
                    >
                      <Download size={14} /> Unduh
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
