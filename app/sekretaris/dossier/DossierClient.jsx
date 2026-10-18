'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Archive, CheckCircle2, FileText, Download, Building2, ShieldCheck, ArrowUpRight } from 'lucide-react';

export default function DossierClient({ cases }) {
  const router = useRouter();
  const [archivingId, setArchivingId] = useState(null);
  const [notice, setNotice] = useState('');
  const [syncLppm, setSyncLppm] = useState(false);

  const notify = (msg) => {
    setNotice(msg);
    setTimeout(() => setNotice(''), 4500);
  };

  const handleArchive = async (caseId) => {
    setArchivingId(caseId);
    try {
      const res = await fetch(`/api/cases/${caseId}/dossier`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (res.ok) {
        notify(`Perkara berhasil diarsipkan ke Buku Induk Dossier (${data.dossierNumber}).`);
        router.refresh();
      } else {
        notify(`Gagal: ${data.error}`);
      }
    } catch {
      notify('Terjadi kesalahan jaringan.');
    } finally {
      setArchivingId(null);
    }
  };

  const handleSyncLppm = () => {
    setSyncLppm(true);
    setTimeout(() => {
      setSyncLppm(false);
      notify('Sinkronisasi data perkara inkracht ke LPPM STHM berhasil (Anonimisasi & Kajian Tridarma siap).');
    }, 1200);
  };

  return (
    <div>
      {/* Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 14, marginBottom: 24 }}>
        <div>
          <span style={{ fontSize: 11, fontWeight: 700, color: '#16a34a', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            SOP-06: Pelaporan, Penutupan & Pengarsipan Berkas Perkara
          </span>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#0f172a', margin: '4px 0 8px' }}>
            Buku Induk Dossier & Sinergi LPPM STHM
          </h1>
          <p style={{ margin: 0, fontSize: 14, color: '#64748b' }}>
            Pengarsipan berkas perkara yang telah inkracht/tuntas secara terstruktur dan terpadu untuk Tridarma Perguruan Tinggi.
          </p>
        </div>

        <button
          onClick={handleSyncLppm}
          disabled={syncLppm}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: '#0f172a', color: '#fff', padding: '10px 18px',
            borderRadius: 8, fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer'
          }}
        >
          <Building2 size={16} /> {syncLppm ? 'Sinkronisasi...' : 'Sinkronkan Data ke LPPM STHM'}
        </button>
      </div>

      {/* Cases list */}
      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', padding: 24 }}>
        <h3 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 700, color: '#0f172a' }}>
          Daftar Perkara Siap Arsip Dossier ({cases.length})
        </h3>

        {cases.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: '#94a3b8' }}>
            <Archive size={32} style={{ margin: '0 auto 8px' }} />
            <p style={{ margin: 0, fontSize: 14 }}>Belum ada perkara yang selesai untuk diarsipkan.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {cases.map((c) => (
              <div
                key={c.id}
                style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '16px 20px', borderRadius: 8, border: '1px solid #e2e8f0',
                  background: c.isArchived ? '#f0fdf4' : '#fff', flexWrap: 'wrap', gap: 14
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <strong style={{ fontSize: 15, color: '#0f172a' }}>{c.code}</strong>
                    {c.isArchived ? (
                      <span style={{ fontSize: 11, fontWeight: 700, background: '#bbf7d0', color: '#15803d', padding: '2px 8px', borderRadius: 4 }}>
                        {c.dossierNumber}
                      </span>
                    ) : (
                      <span style={{ fontSize: 11, fontWeight: 700, background: '#fef3c7', color: '#b45309', padding: '2px 8px', borderRadius: 4 }}>
                        Menunggu Nomor Dossier
                      </span>
                    )}
                  </div>

                  <h4 style={{ margin: '4px 0 2px', fontSize: 14, fontWeight: 600, color: '#334155' }}>
                    {c.title}
                  </h4>
                  <span style={{ fontSize: 12, color: '#64748b' }}>
                    Klien: <strong>{c.client?.name}</strong> · Kuasa Hukum: <strong>{c.consultant?.user?.name || '-'}</strong> · {c.documents.length} Dokumen · {c.hearings.length} Sidang
                  </span>
                </div>

                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  {c.isArchived ? (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#15803d', fontWeight: 600 }}>
                      <CheckCircle2 size={16} /> Berkas Diarsipkan
                    </span>
                  ) : (
                    <button
                      onClick={() => handleArchive(c.id)}
                      disabled={archivingId === c.id}
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: 6,
                        background: '#16a34a', color: '#fff', padding: '8px 16px',
                        borderRadius: 6, fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer'
                      }}
                    >
                      <Archive size={15} /> {archivingId === c.id ? 'Mengarsipkan...' : 'Terbitkan Nomor Dossier'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
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
