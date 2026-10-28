'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FileCheck, UserPlus, XCircle, Clock, CheckCircle2, AlertTriangle, FileText, Upload, GraduationCap } from 'lucide-react';

export default function AdminCaseActions({ caseData, consultants, paralegals = [] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState({ text: '', type: 'info' });

  // Rejection State
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  // Assignment State
  const [selectedConsultantId, setSelectedConsultantId] = useState(caseData.consultant?.id || '');
  const [showReassign, setShowReassign] = useState(false);

  // Paralegal Assignment State
  const [selectedParalegalId, setSelectedParalegalId] = useState(caseData.paralegal?.id || '');
  const [assignedParalegal, setAssignedParalegal] = useState(caseData.paralegal || null);

  // ACC + Legal Opinion State
  const [showAccModal, setShowAccModal] = useState(false);
  const [selectedServiceType, setSelectedServiceType] = useState(caseData.serviceType || 'PENDAMPINGAN_HUKUM');
  const [loNotes, setLoNotes] = useState('');
  const [customLoFile, setCustomLoFile] = useState(null);

  const notify = (text, type = 'info') => {
    setFeedback({ text, type });
    setTimeout(() => setFeedback({ text: '', type: 'info' }), 6000);
  };

  // 1. Action: ACC Kasus & Terbitkan Legal Opinion
  const handleAccAndGenerateLO = async () => {
    setLoading(true);
    notify('Memproses persetujuan rapat & penerbitan Legal Opinion...', 'info');

    try {
      // Step A: Upload custom LO file if provided, otherwise auto-generate from PDF template
      if (customLoFile) {
        const formData = new FormData();
        formData.append('file', customLoFile);
        formData.append('source', 'CONSULTANT_GENERATED');

        const uploadRes = await fetch(`/api/cases/${caseData.id}/documents`, {
          method: 'POST',
          body: formData,
        });
        if (!uploadRes.ok) {
          throw new Error('Gagal mengunggah file Legal Opinion.');
        }
      } else {
        // Auto-generate official Legal Opinion PDF
        const genRes = await fetch(`/api/cases/${caseData.id}/generate-doc`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            templateType: 'LEGAL_OPINION',
            notes: loNotes,
          }),
        });
        const genData = await genRes.json();
        if (!genRes.ok) {
          throw new Error(genData.error || 'Gagal membuat dokumen Legal Opinion.');
        }
      }

      // Step B: Update Case Status to DIVERIFIKASI (Approved/ACC) with decided serviceType
      const statusRes = await fetch(`/api/cases/${caseData.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'DIVERIFIKASI',
          serviceType: selectedServiceType,
        }),
      });
      const statusData = await statusRes.json();
      if (!statusRes.ok) {
        throw new Error(statusData.error || 'Gagal memperbarui status kasus.');
      }

      notify('Permohonan berhasil di-ACC dan Dokumen Legal Opinion telah diterbitkan!', 'success');
      setShowAccModal(false);
      router.refresh();
    } catch (err) {
      notify(err.message || 'Terjadi kesalahan.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // 2. Action: Tolak Kasus
  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      notify('Alasan penolakan rapat wajib diisi.', 'error');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/cases/${caseData.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'DITOLAK', reason: rejectionReason.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Gagal menolak kasus.');
      }

      notify('Kasus telah ditolak sesuai hasil rapat evaluasi.', 'info');
      setShowRejectForm(false);
      router.refresh();
    } catch (err) {
      notify(err.message || 'Terjadi kesalahan.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // 3. Action: Penugasan Konsultan (setelah DIVERIFIKASI atau Reassign)
  const handleAssignConsultant = async (e) => {
    e?.preventDefault();
    if (!selectedConsultantId) {
      notify('Pilih konsultan yang akan ditugaskan terlebih dahulu.', 'error');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/cases/${caseData.id}/assign`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ consultantId: selectedConsultantId }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Gagal menugaskan konsultan.');
      }

      notify('Konsultan berhasil ditugaskan. Kasus beralih ke status DITUGASKAN.', 'success');
      setShowReassign(false);
      router.refresh();
    } catch (err) {
      notify(err.message || 'Terjadi kesalahan.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // 4. Action: Tugaskan Mahasiswa Praktikan (Paralegal)
  const handleAssignParalegal = async (e) => {
    e?.preventDefault();
    if (!selectedParalegalId) {
      notify('Pilih mahasiswa praktikan (paralegal) terlebih dahulu.', 'error');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/paralegal/cases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ caseId: caseData.id, paralegalId: selectedParalegalId }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Gagal menugaskan paralegal.');
      }

      const assigned = paralegals.find((p) => p.id === selectedParalegalId);
      setAssignedParalegal(assigned || { name: 'Mahasiswa Praktikan' });
      notify('Mahasiswa praktikan berhasil ditugaskan untuk asistensi perkara (SOP Edukasi)!', 'success');
      router.refresh();
    } catch (err) {
      notify(err.message || 'Terjadi kesalahan.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {feedback.text && (
        <div
          style={{
            marginBottom: 20,
            padding: '12px 16px',
            borderRadius: 8,
            fontSize: 14,
            background: feedback.type === 'error' ? '#fee2e2' : feedback.type === 'success' ? '#dcfce7' : '#f3f4f6',
            color: feedback.type === 'error' ? '#991b1b' : feedback.type === 'success' ? '#166534' : '#374151',
            border: `1px solid ${feedback.type === 'error' ? '#fca5a5' : feedback.type === 'success' ? '#86efac' : '#e5e7eb'}`,
          }}
        >
          {feedback.text}
        </div>
      )}

      {/* TAHAP 1: Kasus DIAJUKAN (Menunggu Rapat LBH STHM) */}
      {caseData.status === 'DIAJUKAN' && (
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', padding: 24, marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: '#fef3c7', color: '#92400e', display: 'grid', placeItems: 'center' }}>
              <Clock size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: 17, fontWeight: 700, margin: 0 }}>Evaluasi Rapat Internal & Uji Kelayakan Perkara</h2>
              <span style={{ fontSize: 12, color: '#657068' }}>Status Kasus: DIAJUKAN (Menunggu Keputusan LBH)</span>
            </div>
          </div>

          <p style={{ fontSize: 13, color: '#4b5563', lineHeight: 1.5, marginBottom: 20 }}>
            Periksa berkas bukti yang dilampirkan klien di bawah. Berdasarkan hasil rapat tim LBH STHM, tentukan apakah permohonan ini <strong>layak</strong> mendapatkan bantuan hukum (di-ACC dengan menerbitkan dokumen Legal Opinion) atau <strong>ditolak</strong>.
          </p>

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => setShowAccModal(true)}
              disabled={loading}
              style={{
                background: '#16a34a',
                color: '#fff',
                border: 'none',
                padding: '10px 20px',
                borderRadius: 8,
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: 13,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <FileCheck size={16} /> ACC Permohonan & Terbitkan Legal Opinion
            </button>

            <button
              type="button"
              onClick={() => setShowRejectForm(!showRejectForm)}
              disabled={loading}
              style={{
                background: '#dc2626',
                color: '#fff',
                border: 'none',
                padding: '10px 20px',
                borderRadius: 8,
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: 13,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <XCircle size={16} /> {showRejectForm ? 'Batal Tolak' : 'Tolak Permohonan'}
            </button>
          </div>

          {/* Form Penolakan */}
          {showRejectForm && (
            <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid #f3f4f6' }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: '#374151' }}>
                Alasan Penolakan Hasil Rapat <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Tuliskan alasan penolakan hasil rapat evaluasi (misal: perkara di luar kompetensi LBH, berkas bukti tidak mencukupi, dsb)..."
                rows={4}
                style={{
                  width: '100%',
                  padding: 12,
                  borderRadius: 8,
                  border: '1px solid #d1d5db',
                  fontSize: 13,
                  marginBottom: 12,
                }}
              />
              <button
                type="button"
                onClick={handleReject}
                disabled={loading || !rejectionReason.trim()}
                style={{
                  background: '#991b1b',
                  color: '#fff',
                  border: 'none',
                  padding: '9px 16px',
                  borderRadius: 8,
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: 13,
                }}
              >
                {loading ? 'Menyimpan...' : 'Konfirmasi Penolakan'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* TAHAP 2: Kasus DIVERIFIKASI (Sudah di-ACC & Legal Opinion Terbit, Siap Penugasan Konsultan) */}
      {caseData.status === 'DIVERIFIKASI' && (
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #bfdbfe', padding: 24, marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: '#dbeafe', color: '#1e40af', display: 'grid', placeItems: 'center' }}>
              <UserPlus size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: 17, fontWeight: 700, margin: 0 }}>Penugasan Konsultan / Advokat Pendamping</h2>
              <span style={{ fontSize: 12, color: '#16a34a', fontWeight: 600 }}>
                Status: Kasus Telah di-ACC & Dokumen Legal Opinion Tersedia
              </span>
            </div>
          </div>

          <p style={{ fontSize: 13, color: '#4b5563', lineHeight: 1.5, marginBottom: 20 }}>
            Pilih konsultan hukum (Advokat / Pengacara Publik) dari LBH STHM untuk menangani dan mendampingi perkara ini.
          </p>

          <form onSubmit={handleAssignConsultant} style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
            <select
              value={selectedConsultantId}
              onChange={(e) => setSelectedConsultantId(e.target.value)}
              required
              style={{
                padding: '10px 14px',
                borderRadius: 8,
                border: '1px solid #cbd5e1',
                fontSize: 14,
                minWidth: 280,
                background: '#fff',
              }}
            >
              <option value="">-- Pilih Konsultan Pendamping --</option>
              {consultants.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.user.name} ({c.type.replaceAll('_', ' ')}) {c.specialization?.length ? `— [${c.specialization.join(', ')}]` : ''}
                </option>
              ))}
            </select>

            <button
              type="submit"
              disabled={loading || !selectedConsultantId}
              style={{
                background: 'var(--olive, #3b4a2e)',
                color: '#fff',
                border: 'none',
                padding: '10px 20px',
                borderRadius: 8,
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: 13,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <UserPlus size={16} /> {loading ? 'Menugaskan...' : 'Tugaskan Konsultan & Lanjutkan'}
            </button>
          </form>
        </div>
      )}

      {/* TAHAP 3: Kasus Telah DITUGASKAN / PROSES — Info Konsultan & Reassign */}
      {['DITUGASKAN', 'PROSES', 'MENUNGGU_DOKUMEN', 'MENUNGGU_VERIFIKASI_SEKRETARIS'].includes(caseData.status) && (
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', padding: 20, marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <strong style={{ fontSize: 14, color: '#111827' }}>Konsultan Bertugas: </strong>
              <span style={{ fontSize: 14, color: '#16a34a', fontWeight: 600 }}>
                {caseData.consultant?.user?.name || '-'} ({caseData.consultant?.type?.replaceAll('_', ' ') || ''})
              </span>
            </div>
            <button
              type="button"
              onClick={() => setShowReassign(!showReassign)}
              style={{
                background: 'none',
                border: '1px solid #d1d5db',
                padding: '6px 12px',
                borderRadius: 6,
                cursor: 'pointer',
                fontSize: 12,
                color: '#4b5563',
              }}
            >
              {showReassign ? 'Batal' : 'Ganti Konsultan'}
            </button>
          </div>

          {showReassign && (
            <form onSubmit={handleAssignConsultant} style={{ marginTop: 14, display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
              <select
                value={selectedConsultantId}
                onChange={(e) => setSelectedConsultantId(e.target.value)}
                style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #d1d5db', minWidth: 260 }}
              >
                <option value="">Pilih konsultan pengganti</option>
                {consultants
                  .filter((c) => c.id !== caseData.consultant?.id)
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.user.name} ({c.type.replaceAll('_', ' ')})
                    </option>
                  ))}
              </select>
              <button
                type="submit"
                disabled={loading || !selectedConsultantId || selectedConsultantId === caseData.consultant?.id}
                style={{
                  background: '#374151',
                  color: '#fff',
                  border: 'none',
                  padding: '8px 14px',
                  borderRadius: 6,
                  cursor: 'pointer',
                  fontSize: 12,
                  fontWeight: 600,
                }}
              >
                Konfirmasi Ganti
              </button>
            </form>
          )}
        </div>
      )}

      {/* TAHAP PENUGASAN PARALEGAL (Klinik Hukum Edukasi STHM Lampiran C & D) */}
      {!['DIAJUKAN', 'DITOLAK'].includes(caseData.status) && (
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e0e7ff', padding: 20, marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: '#eff6ff', color: '#1d4ed8', display: 'grid', placeItems: 'center' }}>
              <GraduationCap size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>Penugasan Mahasiswa Paralegal (Klinik Hukum)</h3>
              <span style={{ fontSize: 11, color: '#64748b' }}>Asistensi telaah berkas & observasi persidangan per SOP Edukasi (Lampiran C & D)</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <span style={{ fontSize: 12, color: '#475569' }}>
                Paralegal Bertugas: <strong>{assignedParalegal?.name || 'Belum ditugaskan'}</strong> {assignedParalegal?.email ? `(${assignedParalegal.email})` : ''}
              </span>
            </div>

            <form onSubmit={handleAssignParalegal} style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
              <select
                value={selectedParalegalId}
                onChange={(e) => setSelectedParalegalId(e.target.value)}
                style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 13, background: '#fff' }}
              >
                <option value="">-- Pilih Mahasiswa Praktikan --</option>
                {paralegals.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.email})
                  </option>
                ))}
              </select>

              <button
                type="submit"
                disabled={loading || !selectedParalegalId}
                style={{
                  background: '#1e40af',
                  color: '#fff',
                  border: 'none',
                  padding: '6px 12px',
                  borderRadius: 6,
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: loading ? 'not-allowed' : 'pointer'
                }}
              >
                Tugaskan Asisten
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal ACC & Penerbitan Legal Opinion */}
      {showAccModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'grid',
            placeItems: 'center',
            padding: 20,
            zIndex: 1000,
          }}
          onClick={() => setShowAccModal(false)}
        >
          <div
            style={{
              background: '#fff',
              borderRadius: 14,
              padding: 28,
              width: '100%',
              maxWidth: 540,
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: '#dcfce7', color: '#16a34a', display: 'grid', placeItems: 'center' }}>
                <FileCheck size={22} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>ACC Kasus & Penerbitan Legal Opinion</h3>
                <span style={{ fontSize: 12, color: '#657068' }}>Hasil Rapat Evaluasi Kelayakan LBH STHM</span>
              </div>
            </div>

            <p style={{ fontSize: 13, color: '#4b5563', lineHeight: 1.5, marginBottom: 16 }}>
              Dengan menyetujui (ACC) kasus ini, sistem akan menghasilkan dokumen resmi <strong>Legal Opinion</strong> yang menyatakan perkara ini layak mendapatkan bantuan hukum dari LBH STHM.
            </p>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                Bentuk Layanan yang Diputuskan Hasil Rapat LBH: <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <select
                value={selectedServiceType}
                onChange={(e) => setSelectedServiceType(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: 8,
                  border: '1px solid #d1d5db',
                  fontSize: 13,
                  background: '#fff',
                  fontWeight: 600,
                  color: '#111827',
                }}
              >
                <option value="PENDAMPINGAN_HUKUM">Pendampingan Hukum (Litigasi / Non-Litigasi)</option>
                <option value="KONSULTASI_HUKUM">Konsultasi Hukum Terarah</option>
                <option value="LEGAL_OPINION">Legal Opinion Khusus</option>
                <option value="MEDIASI">Mediasi Perkara</option>
                <option value="PENDAFTARAN_HKI">Pendaftaran HKI</option>
                <option value="PRO_BONO">Bantuan Hukum Cuma-Cuma (Pro Bono)</option>
              </select>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                Catatan Rapat / Dasar Analisis Kelayakan (Opsional):
              </label>
              <textarea
                value={loNotes}
                onChange={(e) => setLoNotes(e.target.value)}
                placeholder="Misal: Berdasarkan hasil rapat pleno LBH STHM, pemohon memenuhi syarat kriteria bantuan hukum dan kronologi perkara memiliki dasar hukum kuat..."
                rows={3}
                style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #d1d5db', fontSize: 13 }}
              />
            </div>

            <div style={{ marginBottom: 24, padding: '12px 14px', background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0' }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                Atau Unggah Berkas PDF Legal Opinion Mandiri (Opsional):
              </label>
              <input
                type="file"
                accept=".pdf"
                onChange={(e) => setCustomLoFile(e.target.files?.[0] || null)}
                style={{ fontSize: 12 }}
              />
              {customLoFile && (
                <span style={{ display: 'block', fontSize: 11, color: '#16a34a', marginTop: 4 }}>
                  File dipilih: {customLoFile.name}
                </span>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button
                type="button"
                onClick={() => setShowAccModal(false)}
                disabled={loading}
                style={{
                  background: 'none',
                  border: '1px solid #d1d5db',
                  padding: '9px 16px',
                  borderRadius: 8,
                  cursor: 'pointer',
                  fontSize: 13,
                  color: '#4b5563',
                }}
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleAccAndGenerateLO}
                disabled={loading}
                style={{
                  background: '#16a34a',
                  color: '#fff',
                  border: 'none',
                  padding: '9px 18px',
                  borderRadius: 8,
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: 13,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                {loading ? 'Menerbitkan...' : 'Konfirmasi ACC & Terbitkan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
