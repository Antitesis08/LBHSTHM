'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminCaseActions({ caseData, consultants }) {
  const router = useRouter();
  const [statusLoading, setStatusLoading] = useState(false);
  const [assignLoading, setAssignLoading] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [showReassign, setShowReassign] = useState(false);
  const [newConsultantId, setNewConsultantId] = useState('');

  const handleStatus = async (status) => {
    if (status === 'DITOLAK' && !rejectionReason.trim()) {
      setFeedback('Alasan penolakan wajib diisi.');
      return;
    }

    setStatusLoading(true);
    setFeedback('');

    try {
      const res = await fetch(`/api/cases/${caseData.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, reason: rejectionReason.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Gagal memperbarui status.');
      }
      setFeedback(`Status kasus berhasil diperbarui ke ${status}.`);
      router.refresh();
    } catch (error) {
      setFeedback(error.message || 'Terjadi kesalahan.');
    } finally {
      setStatusLoading(false);
    }
  };

  const handleReassign = async (event) => {
    event.preventDefault();
    if (!newConsultantId) {
      setFeedback('Pilih konsultan pengganti terlebih dahulu.');
      return;
    }
    if (newConsultantId === caseData.consultant?.id) {
      setFeedback('Konsultan yang dipilih sama dengan konsultan saat ini.');
      return;
    }

    setAssignLoading(true);
    setFeedback('');

    try {
      const res = await fetch(`/api/cases/${caseData.id}/assign`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ consultantId: newConsultantId }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Gagal mengganti konsultan.');
      }
      setFeedback('Konsultan berhasil diganti.');
      setShowReassign(false);
      router.refresh();
    } catch (error) {
      setFeedback(error.message || 'Terjadi kesalahan.');
    } finally {
      setAssignLoading(false);
    }
  };

  return (
    <>
      {feedback && (
        <div style={{ marginBottom: 16, padding: '10px 12px', borderRadius: 8, background: '#f3f4f6', color: '#374151' }}>
          {feedback}
        </div>
      )}

      {/* Info konsultan yang dipilih klien */}
      <div style={{ background: '#f0fdf4', borderRadius: 12, border: '1px solid #bbf7d0', padding: '12px 16px', marginBottom: 20 }}>
        <span style={{ fontSize: 13, color: '#166534' }}>
          <strong>Konsultan dipilih klien:</strong> {caseData.consultant?.user?.name || '-'}
          {caseData.consultant?.type && ` (${caseData.consultant.type.replaceAll('_', ' ')})`}
        </span>
      </div>

      {/* Aksi untuk kasus DIAJUKAN */}
      {caseData.status === 'DIAJUKAN' && (
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', padding: 20, marginBottom: 20 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>Verifikasi Kasus</h2>
          <p style={{ marginBottom: 12, color: '#657068' }}>
            Periksa dokumen dan kelayakan kasus. Konsultan sudah dipilih oleh klien saat pengajuan.
          </p>
          <textarea
            value={rejectionReason}
            onChange={(event) => setRejectionReason(event.target.value)}
            placeholder="Isi alasan penolakan jika kasus ditolak"
            style={{ width: '100%', minHeight: 96, padding: 12, borderRadius: 8, border: '1px solid #d1d5db', marginBottom: 12 }}
          />
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => handleStatus('DITUGASKAN')}
              disabled={statusLoading}
              style={{ background: '#3b4a2e', color: '#fff', border: 'none', padding: '10px 16px', borderRadius: 8, cursor: 'pointer' }}
            >
              {statusLoading ? 'Memproses...' : 'Verifikasi & Aktifkan'}
            </button>
            <button
              type="button"
              onClick={() => handleStatus('DITOLAK')}
              disabled={statusLoading}
              style={{ background: '#8c3b2e', color: '#fff', border: 'none', padding: '10px 16px', borderRadius: 8, cursor: 'pointer' }}
            >
              {statusLoading ? 'Memproses...' : 'Tolak'}
            </button>
          </div>
        </div>
      )}

      {/* Ganti Konsultan — tersedia untuk semua status aktif */}
      {['DIAJUKAN', 'DIVERIFIKASI', 'DITUGASKAN', 'PROSES', 'MENUNGGU_DOKUMEN'].includes(caseData.status) && (
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', padding: 20, marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: showReassign ? 12 : 0 }}>
            <h2 style={{ fontSize: 16, fontWeight: 600 }}>Ganti Konsultan</h2>
            <button
              type="button"
              onClick={() => setShowReassign(!showReassign)}
              style={{ background: 'none', border: '1px solid #d1d5db', padding: '6px 12px', borderRadius: 8, cursor: 'pointer', fontSize: 13, color: '#374151' }}
            >
              {showReassign ? 'Batal' : 'Ubah'}
            </button>
          </div>
          {showReassign && (
            <form onSubmit={handleReassign} style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
              <select
                value={newConsultantId}
                onChange={(event) => setNewConsultantId(event.target.value)}
                style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid #d1d5db', minWidth: 220 }}
              >
                <option value="">Pilih konsultan pengganti</option>
                {consultants
                  .filter((c) => c.id !== caseData.consultant?.id)
                  .map((consultant) => (
                    <option key={consultant.id} value={consultant.id}>
                      {consultant.user.name} ({consultant.type.replaceAll('_', ' ')})
                    </option>
                  ))}
              </select>
              <button
                type="submit"
                disabled={assignLoading}
                style={{ background: '#4a5d6b', color: '#fff', border: 'none', padding: '10px 16px', borderRadius: 8, cursor: 'pointer' }}
              >
                {assignLoading ? 'Memproses...' : 'Konfirmasi Ganti'}
              </button>
            </form>
          )}
        </div>
      )}
    </>
  );
}
