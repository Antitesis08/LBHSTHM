'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FileCheck, ShieldCheck, CheckCircle2, XCircle, FileText, AlertCircle, Clock } from 'lucide-react';

const SERVICE_OPTIONS = [
  { value: 'PENDAMPINGAN_HUKUM', label: 'Pendampingan Hukum (Litigasi)' },
  { value: 'KONSULTASI_HUKUM', label: 'Konsultasi Hukum (Non-Litigasi)' },
  { value: 'MEDIASI', label: 'Mediasi / Penyelesaian Sengketa Alternatif' },
  { value: 'PRO_BONO', label: 'Bantuan Hukum Khusus Pro Bono' },
];

export default function GelarKasusClient({ cases }) {
  const router = useRouter();
  const [selectedCase, setSelectedCase] = useState(cases[0] || null);
  const [bagkNumber, setBagkNumber] = useState('');
  const [bagkNotes, setBagkNotes] = useState('');
  const [conflictChecked, setConflictChecked] = useState(true);
  const [serviceType, setServiceType] = useState('PENDAMPINGAN_HUKUM');
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState('');

  const notify = (msg) => {
    setNotice(msg);
    setTimeout(() => setNotice(''), 4500);
  };

  const handleSelectCase = (c) => {
    setSelectedCase(c);
    setBagkNumber(c.bagkNumber || `BAGK/${Math.floor(100 + Math.random() * 900)}/LKBH-STHM/${new Date().getFullYear()}`);
    setBagkNotes(c.bagkNotes || '');
    setConflictChecked(c.conflictOfInterestCheck ?? true);
    if (c.serviceType) setServiceType(c.serviceType);
  };

  const handleSubmitDecision = async (status) => {
    if (!selectedCase) return;
    if (!conflictChecked) {
      notify('Perhatian: Pemeriksaan benturan kepentingan (Conflict of Interest) wajib dilakukan.');
      return;
    }

    setLoading(true);
    try {
      // 1. If ACC (DIVERIFIKASI), generate Legal Opinion first if not present
      const hasLO = selectedCase.documents?.some(d => d.fileName?.toLowerCase().includes('legal_opinion'));
      if (status === 'DIVERIFIKASI' && !hasLO) {
        await fetch(`/api/cases/${selectedCase.id}/generate-doc`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ templateType: 'LEGAL_OPINION' }),
        });
      }

      // 2. Submit BAGK & decision
      const res = await fetch(`/api/cases/${selectedCase.id}/bagk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bagkNumber: bagkNumber || `BAGK/${Math.floor(100 + Math.random() * 900)}/LKBH-STHM/${new Date().getFullYear()}`,
          bagkNotes,
          conflictOfInterestCheck: conflictChecked,
          status,
          serviceType: status === 'DIVERIFIKASI' ? serviceType : undefined,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        notify(`Keputusan Rapat Gelar Kasus berhasil disimpan (${status}).`);
        router.refresh();
      } else {
        notify(`Gagal: ${data.error}`);
      }
    } catch {
      notify('Terjadi kesalahan koneksi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: '#16a34a', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          SOP-02: Verifikasi & Rapat Gelar Kasus (Case Screening)
        </span>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#0f172a', margin: '4px 0 8px' }}>
          Berita Acara Gelar Kasus (BAGK) LKBH STHM
        </h1>
        <p style={{ margin: 0, fontSize: 14, color: '#64748b' }}>
          Pemeriksaan syarat formil-materiil, bebas benturan kepentingan (conflict of interest), dan penetapan kelayakan bantuan hukum bersama pimpinan LKBH.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: 20 }}>
        {/* Left: Cases waiting for screening */}
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', padding: 20 }}>
          <h3 style={{ margin: '0 0 14px', fontSize: 15, fontWeight: 700, color: '#0f172a' }}>
            Permohonan Masuk ({cases.length})
          </h3>

          {cases.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px 0', color: '#94a3b8' }}>
              <Clock size={28} style={{ margin: '0 auto 8px' }} />
              <p style={{ margin: 0, fontSize: 13 }}>Tidak ada permohonan yang menunggu gelar kasus.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {cases.map((c) => {
                const isSelected = selectedCase?.id === c.id;
                return (
                  <div
                    key={c.id}
                    onClick={() => handleSelectCase(c)}
                    style={{
                      padding: '12px 16px', borderRadius: 8, cursor: 'pointer',
                      border: `1px solid ${isSelected ? '#16a34a' : '#e2e8f0'}`,
                      background: isSelected ? '#f0fdf4' : '#f8fafc',
                      transition: 'all 0.2s',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <strong style={{ fontSize: 13, color: '#0f172a' }}>{c.code}</strong>
                      <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 6px', borderRadius: 4, background: c.status === 'DIAJUKAN' ? '#fef3c7' : '#dbeafe', color: c.status === 'DIAJUKAN' ? '#b45309' : '#1e40af' }}>
                        {c.status}
                      </span>
                    </div>
                    <div style={{ fontWeight: 600, fontSize: 13, color: '#1e293b', marginTop: 4 }}>{c.title}</div>
                    <span style={{ fontSize: 11, color: '#64748b' }}>Klien: {c.client?.name} · {c.documents?.length || 0} Berkas</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: BAGK Form */}
        {selectedCase ? (
          <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <div>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#2563eb', textTransform: 'uppercase' }}>
                  Formulir Keputusan Rapat Pleno Gelar Kasus
                </span>
                <h3 style={{ margin: '2px 0 0', fontSize: 18, fontWeight: 700, color: '#0f172a' }}>
                  {selectedCase.code} - {selectedCase.title}
                </h3>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: '#334155' }}>
                Nomor Berita Acara Gelar Kasus (BAGK)
                <input
                  type="text"
                  value={bagkNumber}
                  onChange={(e) => setBagkNumber(e.target.value)}
                  placeholder="BAGK/001/LKBH-STHM/2026"
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 6, border: '1px solid #cbd5e1', marginTop: 4, fontSize: 13 }}
                />
              </label>

              {/* Conflict of Interest Checkbox */}
              <div style={{
                background: '#f0fdf4', padding: '12px 16px', borderRadius: 8,
                border: '1px solid #bbf7d0', display: 'flex', alignItems: 'center', gap: 10
              }}>
                <ShieldCheck size={20} color="#16a34a" />
                <label style={{ fontSize: 13, color: '#14532d', display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', margin: 0 }}>
                  <input
                    type="checkbox"
                    checked={conflictChecked}
                    onChange={(e) => setConflictChecked(e.target.checked)}
                  />
                  <span>Telah diverifikasi: <strong>Bebas Benturan Kepentingan (Conflict of Interest)</strong> sesuai Kode Etik AD/ART LKBH.</span>
                </label>
              </div>

              <label style={{ fontSize: 13, fontWeight: 600, color: '#334155' }}>
                Bentuk Layanan Bantuan Hukum yang Diputuskan
                <select
                  value={serviceType}
                  onChange={(e) => setServiceType(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 6, border: '1px solid #cbd5e1', marginTop: 4, fontSize: 13 }}
                >
                  {SERVICE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </label>

              <label style={{ fontSize: 13, fontWeight: 600, color: '#334155' }}>
                Notulensi Rapat & Pertimbangan Yuridis (BAGK)
                <textarea
                  rows={4}
                  value={bagkNotes}
                  onChange={(e) => setBagkNotes(e.target.value)}
                  placeholder="Catatan hasil musyawarah rapat gelar kasus, pertimbangan fakta hukum permulaan, kelayakan ekonomi pemohon, dan disposisi tindak lanjut..."
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 6, border: '1px solid #cbd5e1', marginTop: 4, fontSize: 13, lineHeight: 1.5, resize: 'vertical' }}
                />
              </label>

              {/* Actions */}
              <div style={{ display: 'flex', gap: 12, marginTop: 10 }}>
                <button
                  type="button"
                  onClick={() => handleSubmitDecision('DIVERIFIKASI')}
                  disabled={loading}
                  style={{
                    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    padding: '12px 18px', background: '#16a34a', color: '#fff', border: 'none',
                    borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer'
                  }}
                >
                  <CheckCircle2 size={16} /> {loading ? 'Memproses...' : 'Setujui (ACC) & Terbitkan Legal Opinion'}
                </button>

                <button
                  type="button"
                  onClick={() => handleSubmitDecision('DITOLAK')}
                  disabled={loading}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    padding: '12px 18px', background: '#fee2e2', color: '#991b1b', border: 'none',
                    borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer'
                  }}
                >
                  <XCircle size={16} /> Tolak Permohonan
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {notice && (
        <div style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 1000,
          background: '#0f172a', color: '#fff', padding: '12px 20px',
          borderRadius: 10, fontSize: 13, fontWeight: 500, boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
        }}>
          {notice}
        </div>
      )}
    </div>
  );
}
