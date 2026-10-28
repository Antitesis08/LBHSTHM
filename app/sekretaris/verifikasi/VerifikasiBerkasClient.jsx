'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  FileCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Download,
  AlertCircle,
  FileText,
  User,
  Scale,
  Calendar,
  Eye,
  X,
  Send,
  ShieldCheck,
  Building2
} from 'lucide-react';

const SERVICE_LABELS = {
  KONSULTASI_HUKUM: 'Konsultasi Hukum',
  PENDAMPINGAN_HUKUM: 'Pendampingan Hukum',
  LEGAL_OPINION: 'Legal Opinion',
  MEDIASI: 'Mediasi Perkara',
  PENDAFTARAN_HKI: 'Pendaftaran HKI',
  PRO_BONO: 'Bantuan Hukum Cuma-Cuma (Pro Bono)',
};

export default function VerifikasiBerkasClient({ pendingCases = [], historyCases = [] }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('PENDING'); // 'PENDING' | 'HISTORY'
  const [loadingId, setLoadingId] = useState(null);
  const [notice, setNotice] = useState({ text: '', type: 'info' });
  const [downloadingId, setDownloadingId] = useState(null);

  // Modal ACC State
  const [accCase, setAccCase] = useState(null);
  const [submittingAcc, setSubmittingAcc] = useState(false);

  // Modal Reject State
  const [rejectCase, setRejectCase] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [submittingReject, setSubmittingReject] = useState(false);

  const notify = (text, type = 'info') => {
    setNotice({ text, type });
    setTimeout(() => setNotice({ text: '', type: 'info' }), 5000);
  };

  const handleDownloadDoc = async (docId, fileName) => {
    setDownloadingId(docId);
    try {
      const res = await fetch(`/api/documents/${docId}/download`);
      const data = await res.json();
      if (res.ok) {
        window.open(data.url, '_blank');
      } else {
        notify(`Gagal mengunduh: ${data.error}`, 'error');
      }
    } catch {
      notify('Gagal mengunduh berkas dokumen.', 'error');
    } finally {
      setDownloadingId(null);
    }
  };

  // Submit ACC
  const handleConfirmAcc = async () => {
    if (!accCase) return;
    setSubmittingAcc(true);
    try {
      const res = await fetch(`/api/cases/${accCase.id}/review-completion`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'ACC' }),
      });
      const data = await res.json();
      if (res.ok) {
        notify(`Perkara [${accCase.code}] berhasil di-ACC! Status resmi menjadi SELESAI dan masuk ke Buku Induk Dossier.`, 'success');
        setAccCase(null);
        router.refresh();
      } else {
        notify(`Gagal: ${data.error}`, 'error');
      }
    } catch {
      notify('Terjadi kesalahan jaringan saat memproses ACC.', 'error');
    } finally {
      setSubmittingAcc(false);
    }
  };

  // Submit Reject
  const handleConfirmReject = async (e) => {
    e?.preventDefault();
    if (!rejectCase) return;
    if (!rejectionReason.trim()) {
      notify('Catatan alasan penolakan / revisi berkas wajib diisi.', 'error');
      return;
    }

    setSubmittingReject(true);
    try {
      const res = await fetch(`/api/cases/${rejectCase.id}/review-completion`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'REJECT',
          rejectionReason: rejectionReason.trim(),
        }),
      });
      const data = await res.json();
      if (res.ok) {
        notify(`Berkas perkara [${rejectCase.code}] telah ditolak dan dikembalikan ke konsultan untuk direvisi.`, 'info');
        setRejectCase(null);
        setRejectionReason('');
        router.refresh();
      } else {
        notify(`Gagal: ${data.error}`, 'error');
      }
    } catch {
      notify('Terjadi kesalahan jaringan saat memproses penolakan berkas.', 'error');
    } finally {
      setSubmittingReject(false);
    }
  };

  const casesToDisplay = activeTab === 'PENDING' ? pendingCases : historyCases;

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', paddingBottom: 60 }}>
      {/* Page Header */}
      <div style={{ marginBottom: 24 }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: '#16a34a', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          SOP-06: Verifikasi Hasil Penanganan Perkara & Administrasi Dossier
        </span>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#0f172a', margin: '4px 0 8px' }}>
          Verifikasi Berkas Hasil Penanganan Perkara
        </h1>
        <p style={{ margin: 0, fontSize: 14, color: '#64748b' }}>
          Penelaahan berkas bukti penyelesaian kasus (Berita Acara, Salinan Putusan, atau Laporan Akhir) yang diajukan oleh Advokat/Konsultan LKBH STHM. Berkas yang disetujui (ACC) akan resmi berstatus SELESAI dan diteruskan ke pengarsipan Dossier.
        </p>
      </div>

      {/* Toast Notice */}
      {notice.text && (
        <div style={{
          marginBottom: 20, padding: '12px 18px', borderRadius: 8, fontSize: 13,
          background: notice.type === 'error' ? '#fee2e2' : notice.type === 'success' ? '#dcfce7' : '#eff6ff',
          color: notice.type === 'error' ? '#991b1b' : notice.type === 'success' ? '#166534' : '#1e40af',
          border: `1px solid ${notice.type === 'error' ? '#fca5a5' : notice.type === 'success' ? '#86efac' : '#bfdbfe'}`,
          display: 'flex', alignItems: 'center', gap: 8
        }}>
          {notice.type === 'error' ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
          <span>{notice.text}</span>
        </div>
      )}

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14, marginBottom: 24 }}>
        <div style={{ background: '#fff', padding: '16px 20px', borderRadius: 10, border: '1px solid #fed7aa' }}>
          <span style={{ fontSize: 12, color: '#c2410c', fontWeight: 700, textTransform: 'uppercase' }}>
            Menunggu Verifikasi Sekretaris
          </span>
          <div style={{ fontSize: 28, fontWeight: 800, color: '#c2410c', marginTop: 4 }}>
            {pendingCases.length}
          </div>
          <span style={{ fontSize: 11, color: '#9a3412' }}>Berkas butuh ditelaah & diputuskan</span>
        </div>

        <div style={{ background: '#fff', padding: '16px 20px', borderRadius: 10, border: '1px solid #bbf7d0' }}>
          <span style={{ fontSize: 12, color: '#16a34a', fontWeight: 700, textTransform: 'uppercase' }}>
            Perkara Telah di-ACC (Selesai)
          </span>
          <div style={{ fontSize: 28, fontWeight: 800, color: '#15803d', marginTop: 4 }}>
            {historyCases.length}
          </div>
          <span style={{ fontSize: 11, color: '#166534' }}>Telah diarsipkan ke Buku Induk Dossier</span>
        </div>
      </div>

      {/* Tabs Control */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
        <button
          onClick={() => setActiveTab('PENDING')}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '10px 18px', borderRadius: 8, fontSize: 13, fontWeight: 600,
            cursor: 'pointer', border: '1px solid',
            borderColor: activeTab === 'PENDING' ? '#c2410c' : '#cbd5e1',
            background: activeTab === 'PENDING' ? '#fff7ed' : '#fff',
            color: activeTab === 'PENDING' ? '#c2410c' : '#475569',
          }}
        >
          <Clock size={16} /> Berkas Menunggu Verifikasi ({pendingCases.length})
        </button>

        <button
          onClick={() => setActiveTab('HISTORY')}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '10px 18px', borderRadius: 8, fontSize: 13, fontWeight: 600,
            cursor: 'pointer', border: '1px solid',
            borderColor: activeTab === 'HISTORY' ? '#16a34a' : '#cbd5e1',
            background: activeTab === 'HISTORY' ? '#f0fdf4' : '#fff',
            color: activeTab === 'HISTORY' ? '#16a34a' : '#475569',
          }}
        >
          <CheckCircle2 size={16} /> Riwayat Telah di-ACC ({historyCases.length})
        </button>
      </div>

      {/* Cases List */}
      {casesToDisplay.length === 0 ? (
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', padding: '60px 20px', textAlign: 'center' }}>
          <FileCheck size={40} style={{ margin: '0 auto 12px', color: '#94a3b8' }} />
          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1e293b', marginBottom: 4 }}>
            {activeTab === 'PENDING'
              ? 'Tidak ada pengajuan berkas yang menunggu verifikasi'
              : 'Belum ada riwayat berkas yang disetujui'}
          </h3>
          <p style={{ fontSize: 13, color: '#64748b', maxWidth: 460, margin: '0 auto' }}>
            {activeTab === 'PENDING'
              ? 'Semua pengajuan penyelesaian perkara dari konsultan telah diproses tuntas oleh Sekretariat LKBH.'
              : 'Perkara yang telah di-ACC akan tercatat otomatis pada riwayat ini dan diteruskan ke Buku Induk Dossier.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {casesToDisplay.map((item) => {
            // Find closing document
            const closingDoc = item.documents?.find(
              (d) => d.fileName === item.closingDocName || d.fileUrl === item.closingDocUrl
            );

            return (
              <div
                key={item.id}
                style={{
                  background: '#fff',
                  borderRadius: 12,
                  border: '1px solid #e2e8f0',
                  padding: '24px 28px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                }}
              >
                {/* Header row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 14 }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 8 }}>
                      <span style={{
                        fontWeight: 800, fontSize: 13, color: '#0f172a',
                        background: '#f1f5f9', padding: '4px 10px', borderRadius: 6,
                        border: '1px solid #cbd5e1'
                      }}>
                        {item.code}
                      </span>

                      {item.sprinNumber && (
                        <span style={{ fontSize: 12, color: '#475569', background: '#f8fafc', padding: '4px 10px', borderRadius: 6, border: '1px solid #e2e8f0', fontWeight: 600 }}>
                          SPRIN: {item.sprinNumber}
                        </span>
                      )}

                      <span style={{
                        fontSize: 12, fontWeight: 700, padding: '4px 10px', borderRadius: 999,
                        background: item.status === 'SELESAI' ? '#dcfce7' : '#fff7ed',
                        color: item.status === 'SELESAI' ? '#15803d' : '#c2410c',
                        border: `1px solid ${item.status === 'SELESAI' ? '#bbf7d0' : '#fed7aa'}`,
                      }}>
                        {item.status === 'SELESAI' ? 'SELESAI (ACC TUNTAS)' : 'MENUNGGU VERIFIKASI SEKRETARIAT'}
                      </span>
                    </div>

                    <h3 style={{ margin: '0 0 6px', fontSize: 18, fontWeight: 700, color: '#0f172a' }}>
                      {item.title}
                    </h3>
                  </div>

                  {item.closingSubmittedAt && (
                    <div style={{ fontSize: 12, color: '#64748b', textAlign: 'right' }}>
                      Diajukan Konsultan: {new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(item.closingSubmittedAt))}
                    </div>
                  )}
                </div>

                {/* Info Grid */}
                <div style={{
                  display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                  gap: 12, padding: '14px 18px', background: '#f8fafc',
                  borderRadius: 8, border: '1px solid #e2e8f0', marginBottom: 16, fontSize: 13
                }}>
                  <div>
                    <span style={{ fontSize: 11, color: '#64748b', display: 'block', fontWeight: 600 }}>KONSULTAN / ADVOKAT BERTUGAS:</span>
                    <strong style={{ color: '#0f172a' }}>{item.consultant?.user?.name || '-'}</strong>
                    <span style={{ fontSize: 11, color: '#64748b', display: 'block' }}>{item.consultant?.type?.replaceAll('_', ' ')}</span>
                  </div>

                  <div>
                    <span style={{ fontSize: 11, color: '#64748b', display: 'block', fontWeight: 600 }}>KLIEN PEMOHON:</span>
                    <strong style={{ color: '#0f172a' }}>{item.client?.name || '-'}</strong>
                    <span style={{ fontSize: 11, color: '#64748b', display: 'block' }}>{item.client?.phone || item.client?.email}</span>
                  </div>

                  <div>
                    <span style={{ fontSize: 11, color: '#64748b', display: 'block', fontWeight: 600 }}>BENTUK LAYANAN:</span>
                    <strong style={{ color: '#0f172a' }}>{SERVICE_LABELS[item.serviceType] || item.serviceType || '-'}</strong>
                  </div>
                </div>

                {/* Section Dokumen Bukti & Catatan Konsultan */}
                <div style={{
                  background: '#fefce8', borderRadius: 8, padding: '16px 18px',
                  border: '1px solid #fef08a', marginBottom: 18
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10, marginBottom: 10 }}>
                    <div>
                      <span style={{ fontSize: 11, fontWeight: 700, color: '#854d0e', textTransform: 'uppercase' }}>
                        DOKUMEN HASIL PENYELESAIAN PERKARA (BUKTI TUNTAS):
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                        <FileText size={18} color="#854d0e" />
                        <strong style={{ fontSize: 14, color: '#713f12' }}>
                          {item.closingDocName || 'Dokumen Bukti Hasil'}
                        </strong>
                      </div>
                    </div>

                    {/* Download Button */}
                    {closingDoc ? (
                      <button
                        onClick={() => handleDownloadDoc(closingDoc.id, item.closingDocName)}
                        disabled={downloadingId === closingDoc.id}
                        style={{
                          display: 'inline-flex', alignItems: 'center', gap: 6,
                          padding: '8px 14px', background: '#854d0e', color: '#fff',
                          border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 600,
                          cursor: 'pointer'
                        }}
                      >
                        <Download size={14} />
                        {downloadingId === closingDoc.id ? 'Mengunduh...' : 'Unduh & Telaah Dokumen'}
                      </button>
                    ) : item.closingDocUrl ? (
                      <a
                        href={item.closingDocUrl}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          display: 'inline-flex', alignItems: 'center', gap: 6,
                          padding: '8px 14px', background: '#854d0e', color: '#fff',
                          borderRadius: 6, fontSize: 12, fontWeight: 600,
                          textDecoration: 'none'
                        }}
                      >
                        <Download size={14} /> Buka Berkas Hasil
                      </a>
                    ) : null}
                  </div>

                  {item.closingNotes && (
                    <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid #fef08a', fontSize: 13, color: '#713f12', lineHeight: 1.6 }}>
                      <strong>Ringkasan Penanganan oleh Konsultan:</strong>
                      <p style={{ margin: '4px 0 0', whiteSpace: 'pre-wrap' }}>{item.closingNotes}</p>
                    </div>
                  )}
                </div>

                {/* Actions row for pending items */}
                {item.status === 'MENUNGGU_VERIFIKASI_SEKRETARIS' ? (
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, borderTop: '1px solid #f1f5f9', paddingTop: 16 }}>
                    <button
                      onClick={() => {
                        setRejectCase(item);
                        setRejectionReason('');
                      }}
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: 6,
                        padding: '9px 18px', background: '#fee2e2', color: '#991b1b',
                        border: '1px solid #fca5a5', borderRadius: 8, fontSize: 13,
                        fontWeight: 600, cursor: 'pointer'
                      }}
                    >
                      <XCircle size={16} /> Tolak / Minta Perbaikan Berkas
                    </button>

                    <button
                      onClick={() => setAccCase(item)}
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: 6,
                        padding: '9px 20px', background: '#16a34a', color: '#fff',
                        border: 'none', borderRadius: 8, fontSize: 13,
                        fontWeight: 700, cursor: 'pointer',
                        boxShadow: '0 2px 8px rgba(22, 163, 74, 0.25)'
                      }}
                    >
                      <CheckCircle2 size={16} /> Setujui (ACC) Penyelesaian Perkara
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: 14 }}>
                    <div style={{ fontSize: 12, color: '#16a34a', display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600 }}>
                      <CheckCircle2 size={16} /> Telah di-ACC pada: {item.closingApprovedAt ? new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(item.closingApprovedAt)) : '-'}
                    </div>
                    <button
                      onClick={() => router.push(`/sekretaris/dossier`)}
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: 6,
                        padding: '6px 14px', background: '#f8fafc', color: '#334155',
                        border: '1px solid #cbd5e1', borderRadius: 6, fontSize: 12,
                        fontWeight: 600, cursor: 'pointer'
                      }}
                    >
                      <Building2 size={14} /> Lihat di Buku Induk Dossier
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Konfirmasi ACC */}
      {accCase && (
        <div
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
            display: 'grid', placeItems: 'center', padding: 20, zIndex: 1000,
          }}
          onClick={() => setAccCase(null)}
        >
          <div
            style={{
              background: '#fff', borderRadius: 14, padding: '26px 28px',
              width: '100%', maxWidth: 500, boxShadow: '0 20px 40px rgba(0,0,0,0.25)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
              <div style={{ width: 42, height: 42, borderRadius: 10, background: '#dcfce7', color: '#16a34a', display: 'grid', placeItems: 'center' }}>
                <CheckCircle2 size={24} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: '#0f172a' }}>
                  Konfirmasi ACC Penyelesaian Perkara
                </h3>
                <span style={{ fontSize: 12, color: '#64748b' }}>Kode Perkara: {accCase.code}</span>
              </div>
            </div>

            <p style={{ fontSize: 13, color: '#475569', lineHeight: 1.6, marginBottom: 18 }}>
              Apakah Anda yakin telah menelaah dan menyetujui dokumen hasil <strong>"{accCase.closingDocName || 'Dokumen Hasil'}"</strong> untuk perkara ini? Status perkara akan resmi berubah menjadi <strong>SELESAI</strong> dan berkas akan siap untuk diarsipkan ke Buku Induk Dossier.
            </p>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button
                type="button"
                onClick={() => setAccCase(null)}
                disabled={submittingAcc}
                style={{
                  background: 'none', border: '1px solid #cbd5e1',
                  padding: '8px 16px', borderRadius: 8, fontSize: 13,
                  color: '#64748b', cursor: 'pointer', fontWeight: 600
                }}
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmAcc}
                disabled={submittingAcc}
                style={{
                  background: '#16a34a', color: '#fff',
                  border: 'none', padding: '9px 18px', borderRadius: 8,
                  fontSize: 13, fontWeight: 700, cursor: 'pointer',
                  display: 'inline-flex', alignItems: 'center', gap: 6
                }}
              >
                <CheckCircle2 size={16} />
                {submittingAcc ? 'Memproses ACC...' : 'Ya, Setujui (ACC) Perkara'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Penolakan / Permintaan Revisi */}
      {rejectCase && (
        <div
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
            display: 'grid', placeItems: 'center', padding: 20, zIndex: 1000,
          }}
          onClick={() => setRejectCase(null)}
        >
          <div
            style={{
              background: '#fff', borderRadius: 14, padding: '26px 28px',
              width: '100%', maxWidth: 520, boxShadow: '0 20px 40px rgba(0,0,0,0.25)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
              <div style={{ width: 42, height: 42, borderRadius: 10, background: '#fee2e2', color: '#dc2626', display: 'grid', placeItems: 'center' }}>
                <XCircle size={24} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: '#991b1b' }}>
                  Tolak & Minta Perbaikan Berkas
                </h3>
                <span style={{ fontSize: 12, color: '#64748b' }}>Kode Perkara: {rejectCase.code}</span>
              </div>
            </div>

            <p style={{ fontSize: 13, color: '#475569', lineHeight: 1.5, marginBottom: 16 }}>
              Status perkara akan dikembalikan ke <strong>PROSES</strong> pada workspace konsultan ({rejectCase.consultant?.user?.name || 'Konsultan'}). Konsultan akan menerima notifikasi beserta catatan alasan perbaikan yang Anda masukkan di bawah ini.
            </p>

            <form onSubmit={handleConfirmReject}>
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                  Catatan Alasan Penolakan / Poin Revisi: <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Misal: Berkas dokumen Berita Acara Mediasi belum memuat tanda tangan pihak termohon, atau format laporan akhir belum sesuai pedoman SOP..."
                  style={{
                    width: '100%', padding: '10px 14px', borderRadius: 8,
                    border: '1px solid #cbd5e1', fontSize: 13, lineHeight: 1.5,
                    fontFamily: 'inherit', boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button
                  type="button"
                  onClick={() => setRejectCase(null)}
                  disabled={submittingReject}
                  style={{
                    background: 'none', border: '1px solid #cbd5e1',
                    padding: '8px 16px', borderRadius: 8, fontSize: 13,
                    color: '#64748b', cursor: 'pointer', fontWeight: 600
                  }}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submittingReject || !rejectionReason.trim()}
                  style={{
                    background: '#dc2626', color: '#fff',
                    border: 'none', padding: '9px 18px', borderRadius: 8,
                    fontSize: 13, fontWeight: 700, cursor: 'pointer',
                    display: 'inline-flex', alignItems: 'center', gap: 6
                  }}
                >
                  <XCircle size={16} />
                  {submittingReject ? 'Mengirimkan...' : 'Konfirmasi Tolak & Minta Revisi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
