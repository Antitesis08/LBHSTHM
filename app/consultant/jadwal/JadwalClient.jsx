'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Calendar, Play, Eye, AlertCircle } from 'lucide-react';

const SERVICE_LABELS = {
  KONSULTASI_HUKUM: 'Konsultasi Hukum',
  PENDAMPINGAN_HUKUM: 'Pendampingan Hukum',
  LEGAL_OPINION: 'Legal Opinion',
  MEDIASI: 'Mediasi',
  PENDAFTARAN_HKI: 'Pendaftaran HKI',
  PRO_BONO: 'Pro Bono',
};

function statusBadge(status) {
  const map = {
    DIAJUKAN: { label: 'Diajukan', bg: '#fef3c7', color: '#92400e' },
    DIVERIFIKASI: { label: 'Diverifikasi', bg: '#dbeafe', color: '#1e40af' },
    DITUGASKAN: { label: 'Ditugaskan', bg: '#dcfce7', color: '#166534' },
    PROSES: { label: 'Proses', bg: '#dbeafe', color: '#1e40af' },
    MENUNGGU_DOKUMEN: { label: 'Menunggu Dokumen', bg: '#fef3c7', color: '#92400e' },
    SELESAI: { label: 'Selesai', bg: '#dcfce7', color: '#166534' },
    DITOLAK: { label: 'Ditolak', bg: '#fee2e2', color: '#991b1b' },
  };
  return map[status] || { label: status, bg: '#f3f4f6', color: '#374151' };
}

export default function JadwalClient({ initialSchedules, initialIsAvailable }) {
  const router = useRouter();
  const [schedules, setSchedules] = useState(initialSchedules);
  const [isAvailable, setIsAvailable] = useState(initialIsAvailable);
  const [loadingToggle, setLoadingToggle] = useState(false);
  const [processingId, setProcessingId] = useState(null);
  const [error, setError] = useState('');

  const handleToggleAvailability = async () => {
    if (loadingToggle) return;
    
    // Optimistic UI update
    const previousState = isAvailable;
    const newState = !previousState;
    setIsAvailable(newState);
    setLoadingToggle(true);
    setError('');

    try {
      const res = await fetch('/api/consultant/availability-status', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isAvailable: newState }),
      });

      if (!res.ok) {
        throw new Error('Gagal memperbarui status');
      }
    } catch (err) {
      // Rollback
      setIsAvailable(previousState);
      setError('Gagal memperbarui status ketersediaan.');
    } finally {
      setLoadingToggle(false);
    }
  };

  const handleMulaiProses = async (scheduleId, caseId) => {
    setProcessingId(scheduleId);
    try {
      const res = await fetch(`/api/cases/${caseId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'PROSES' }),
      });

      if (!res.ok) {
        throw new Error('Gagal memulai proses');
      }

      // Update schedule status locally
      setSchedules(prev => prev.map(s => {
        if (s.id === scheduleId) {
          return { ...s, case: { ...s.case, status: 'PROSES' } };
        }
        return s;
      }));

      router.refresh();
    } catch (err) {
      alert('Terjadi kesalahan: ' + err.message);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>Jadwal & Ketersediaan</h1>
          <p style={{ color: '#657068', fontSize: 14 }}>Kelola status ketersediaan dan jadwal konsultasi Anda.</p>
        </div>

        {/* Availability Toggle UI */}
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16, boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#4b5563', marginBottom: 4 }}>Status Ketersediaan</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: isAvailable ? '#16a34a' : '#dc2626' }}>
              {isAvailable ? 'Tersedia (Menerima Kasus Baru)' : 'Tidak Tersedia'}
            </div>
          </div>
          
          <button 
            type="button"
            onClick={handleToggleAvailability}
            disabled={loadingToggle}
            style={{
              position: 'relative',
              width: 52,
              height: 28,
              borderRadius: 999,
              background: isAvailable ? '#16a34a' : '#dc2626',
              border: 'none',
              cursor: loadingToggle ? 'wait' : 'pointer',
              transition: 'background 0.3s',
              opacity: loadingToggle ? 0.7 : 1
            }}
          >
            <div style={{
              position: 'absolute',
              top: 2,
              left: isAvailable ? 26 : 2,
              width: 24,
              height: 24,
              background: '#fff',
              borderRadius: '50%',
              transition: 'left 0.3s',
              boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
            }} />
          </button>
        </div>
      </div>

      {error && (
        <div style={{ background: '#fee2e2', color: '#991b1b', padding: '12px 16px', borderRadius: 8, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8, fontSize: 14 }}>
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {/* Schedules Table */}
      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #f0f0f0', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Calendar size={18} color="#4b5563" />
          <h2 style={{ fontSize: 16, fontWeight: 600 }}>Daftar Jadwal Konsultasi</h2>
        </div>
        
        {schedules.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#6b7280' }}>
            <p>Belum ada jadwal konsultasi saat ini.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 800 }}>
              <thead style={{ background: '#f9fafb' }}>
                <tr>
                  <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: 13, fontWeight: 600, color: '#657068' }}>Tanggal & Waktu</th>
                  <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: 13, fontWeight: 600, color: '#657068' }}>Nama Klien</th>
                  <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: 13, fontWeight: 600, color: '#657068' }}>Kode Kasus</th>
                  <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: 13, fontWeight: 600, color: '#657068' }}>Jenis Layanan</th>
                  <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: 13, fontWeight: 600, color: '#657068' }}>Mode</th>
                  <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: 13, fontWeight: 600, color: '#657068' }}>Status</th>
                  <th style={{ textAlign: 'right', padding: '12px 16px', fontSize: 13, fontWeight: 600, color: '#657068' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {schedules.map((schedule) => {
                  const item = schedule.case;
                  const badge = statusBadge(item.status);
                  const dt = new Date(schedule.scheduledAt);
                  
                  return (
                    <tr key={schedule.id} style={{ borderTop: '1px solid #f0f0f0' }}>
                      <td style={{ padding: '14px 16px', fontSize: 14 }}>
                        <div style={{ fontWeight: 600, color: '#1f2937' }}>
                          {new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium' }).format(dt)}
                        </div>
                        <div style={{ color: '#6b7280', fontSize: 13, marginTop: 2 }}>
                          {dt.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                        </div>
                      </td>
                      <td style={{ padding: '14px 16px', fontSize: 14, fontWeight: 500 }}>{item.client?.name || '-'}</td>
                      <td style={{ padding: '14px 16px', fontSize: 14 }}>
                        <Link href={`/consultant/kasus/${item.id}`} style={{ color: 'var(--primary, #3b4a2e)', fontWeight: 600, textDecoration: 'none' }}>
                          {item.code}
                        </Link>
                      </td>
                      <td style={{ padding: '14px 16px', fontSize: 13 }}>{SERVICE_LABELS[item.serviceType] || item.serviceType}</td>
                      <td style={{ padding: '14px 16px', fontSize: 13 }}>
                        <span style={{ display: 'inline-flex', padding: '4px 8px', borderRadius: 4, background: schedule.mode === 'online' ? '#e0f2fe' : '#f3f4f6', color: schedule.mode === 'online' ? '#0369a1' : '#4b5563', fontWeight: 500 }}>
                          {schedule.mode === 'online' ? 'Online' : 'Tatap Muka'}
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{ padding: '4px 10px', borderRadius: 999, background: badge.bg, color: badge.color, fontSize: 12, fontWeight: 500 }}>
                          {badge.label}
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                        {item.status === 'DITUGASKAN' ? (
                          <button
                            onClick={() => handleMulaiProses(schedule.id, item.id)}
                            disabled={processingId === schedule.id}
                            style={{
                              display: 'inline-flex', alignItems: 'center', gap: 6,
                              padding: '6px 12px', borderRadius: 6, border: 'none',
                              background: 'var(--primary, #3b4a2e)', color: '#fff', fontSize: 13, fontWeight: 600,
                              cursor: processingId === schedule.id ? 'wait' : 'pointer', opacity: processingId === schedule.id ? 0.7 : 1
                            }}
                          >
                            <Play size={14} /> {processingId === schedule.id ? 'Memproses...' : 'Mulai Proses'}
                          </button>
                        ) : (
                          <Link 
                            href={`/consultant/kasus/${item.id}`}
                            style={{
                              display: 'inline-flex', alignItems: 'center', gap: 6,
                              padding: '6px 12px', borderRadius: 6, border: '1px solid #d1d5db',
                              background: '#fff', color: '#374151', fontSize: 13, fontWeight: 500,
                              textDecoration: 'none', transition: 'all 0.2s', cursor: 'pointer'
                            }}
                          >
                            <Eye size={14} /> Lihat Detail
                          </Link>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
