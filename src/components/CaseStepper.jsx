'use client';

import { CheckCircle2, CircleDashed, Clock3, AlertCircle, UserRound } from 'lucide-react';

const STEPS = [
  { key: 'DIAJUKAN', label: 'Diajukan' },
  { key: 'DIVERIFIKASI', label: 'Diverifikasi' },
  { key: 'DITUGASKAN', label: 'Ditugaskan' },
  { key: 'PROSES', label: 'Dalam Proses' },
  { key: 'SELESAI', label: 'Selesai' },
];

const statusIndex = {
  DIAJUKAN: 0,
  DIVERIFIKASI: 1,
  DITUGASKAN: 2,
  PROSES: 3,
  MENUNGGU_DOKUMEN: 3,
  SELESAI: 4,
  DITOLAK: -1,
};

/**
 * CaseStepper — visual step indicator for case progress.
 *
 * Props:
 *  - status: CaseStatus enum string
 *  - consultant: { name, type } or null
 */
export default function CaseStepper({ status, consultant }) {
  const currentIdx = statusIndex[status] ?? 0;
  const isDitolak = status === 'DITOLAK';

  return (
    <div style={{ marginBottom: 24 }}>
      {/* Stepper bar */}
      <div style={{ display: 'flex', gap: 0, alignItems: 'flex-start' }}>
        {STEPS.map((step, i) => {
          const isCompleted = !isDitolak && i < currentIdx;
          const isCurrent = !isDitolak && i === currentIdx;
          const isFuture = isDitolak || i > currentIdx;

          return (
            <div key={step.key} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
              {/* Connector line */}
              {i > 0 && (
                <div style={{
                  position: 'absolute', top: 14, right: '50%', width: '100%', height: 3,
                  background: isCompleted || isCurrent ? 'var(--primary, #16a34a)' : '#e2e6e3',
                  zIndex: 0,
                }} />
              )}
              {/* Circle */}
              <div style={{
                width: 28, height: 28, borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: isCompleted ? 'var(--primary, #16a34a)' : isCurrent ? '#fff' : '#f5f7f5',
                border: isCurrent ? '2px solid var(--primary, #16a34a)' : isCompleted ? 'none' : '2px solid #e2e6e3',
                color: isCompleted ? '#fff' : isCurrent ? 'var(--primary, #16a34a)' : '#9aa39b',
                zIndex: 1,
                position: 'relative',
                transition: 'all 0.3s',
              }}>
                {isCompleted ? <CheckCircle2 size={16} /> : isCurrent ? <Clock3 size={14} /> : <CircleDashed size={14} />}
              </div>
              {/* Label */}
              <span style={{
                fontSize: 11, marginTop: 6, textAlign: 'center',
                color: isCompleted || isCurrent ? '#1a1f1b' : '#9aa39b',
                fontWeight: isCurrent ? 600 : 400,
              }}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Ditolak special notice */}
      {isDitolak && (
        <div style={{
          display: 'flex', gap: 10, alignItems: 'center', marginTop: 16,
          background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8,
          padding: '12px 16px', color: '#b91c1c', fontSize: 13,
        }}>
          <AlertCircle size={18} />
          <span>Pengajuan ini telah <strong>ditolak</strong>. Silakan hubungi admin untuk informasi lebih lanjut.</span>
        </div>
      )}

      {/* Status description messages */}
      {status === 'DIAJUKAN' && (
        <div style={{
          display: 'flex', gap: 10, alignItems: 'center', marginTop: 16,
          background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 8,
          padding: '12px 16px', color: '#92400e', fontSize: 13,
        }}>
          <Clock3 size={18} />
          <span>Permohonan Anda sedang dalam antrean rapat internal tim LBH STHM untuk uji kelayakan berkas bantuan hukum.</span>
        </div>
      )}

      {status === 'DIVERIFIKASI' && (
        <div style={{
          display: 'flex', gap: 10, alignItems: 'center', marginTop: 16,
          background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 8,
          padding: '12px 16px', color: '#1e40af', fontSize: 13,
        }}>
          <CheckCircle2 size={18} />
          <span>Permohonan telah disetujui (ACC) melalui rapat LBH STHM. Dokumen Legal Opinion telah diterbitkan dan sedang menunggu penunjukan konsultan pendamping.</span>
        </div>
      )}

      {/* Consultant info card (only show when status is DITUGASKAN or PROSES and consultant exists) */}
      {(status === 'DITUGASKAN' || status === 'PROSES' || status === 'MENUNGGU_DOKUMEN') && consultant && (
        <div style={{
          display: 'flex', gap: 14, alignItems: 'center', marginTop: 16,
          background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10,
          padding: '14px 18px',
        }}>
          <div style={{
            width: 40, height: 40, borderRadius: '50%',
            background: 'var(--primary, #16a34a)', color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 700, fontSize: 15,
          }}>
            {consultant.name?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || <UserRound size={18} />}
          </div>
          <div>
            <strong style={{ fontSize: 14, color: '#1a1f1b' }}>{consultant.name}</strong>
            <span style={{ display: 'block', fontSize: 12, color: '#657068' }}>
              {consultant.type === 'PENGACARA_PUBLIK' ? 'Pengacara Publik' : consultant.type === 'ADVOKAT' ? 'Advokat' : consultant.type || 'Konsultan'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
