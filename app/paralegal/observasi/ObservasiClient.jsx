'use client';

import { useState } from 'react';
import {
  Calendar,
  MapPin,
  FileEdit,
  CheckCircle2,
  AlertCircle,
  GraduationCap,
  Clock,
  Save,
  X
} from 'lucide-react';

export default function ObservasiClient({ initialHearings, user }) {
  const [hearings, setHearings] = useState(initialHearings);
  const [activeHearing, setActiveHearing] = useState(null);
  const [notesInput, setNotesInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState({ text: '', type: '' });

  const notify = (text, type = 'info') => {
    setFeedback({ text, type });
    setTimeout(() => setFeedback({ text: '', type: '' }), 5000);
  };

  const openNoteModal = (h) => {
    setActiveHearing(h);
    setNotesInput(h.notes || '');
  };

  const handleSaveNotes = async () => {
    if (!activeHearing) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/hearings/${activeHearing.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: notesInput })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal menyimpan catatan observasi.');

      setHearings((prev) =>
        prev.map((h) => (h.id === activeHearing.id ? { ...h, notes: notesInput } : h))
      );
      setActiveHearing(null);
      notify('Catatan observasi klinik hukum sidang berhasil disimpan!', 'success');
    } catch (err) {
      notify(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '24px 20px 80px' }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: '#1e40af', background: '#eff6ff', padding: '4px 10px', borderRadius: 6 }}>
          SOP Klinik Hukum Edukasi · Lampiran C & D
        </span>
        <h1 style={{ fontSize: 24, fontWeight: 800, margin: '6px 0 2px', fontFamily: 'Space Grotesk' }}>
          Jurnal Observasi Persidangan Mahasiswa
        </h1>
        <p style={{ margin: 0, color: '#657068', fontSize: 13 }}>
          Pencatatan jalannya sidang pengadilan, dinamika acara, pembuktian, dan telaah yuridis untuk portofolio praktik kemahiran hukum STHM.
        </p>
      </div>

      {feedback.text && (
        <div
          style={{
            padding: '12px 16px',
            borderRadius: 8,
            marginBottom: 20,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            backgroundColor: feedback.type === 'error' ? '#fef2f2' : '#f0fdf4',
            color: feedback.type === 'error' ? '#991b1b' : '#166534',
            border: `1px solid ${feedback.type === 'error' ? '#fecaca' : '#bbf7d0'}`
          }}
        >
          {feedback.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
          <span style={{ fontSize: 13 }}>{feedback.text}</span>
        </div>
      )}

      {/* Hearing List */}
      {hearings.length === 0 ? (
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, padding: 36, textAlign: 'center' }}>
          <Calendar size={36} color="#94a3b8" style={{ margin: '0 auto 12px' }} />
          <h3 style={{ margin: '0 0 6px', fontSize: 16, fontWeight: 700 }}>Belum Ada Agenda Sidang Terjadwal</h3>
          <p style={{ margin: 0, fontSize: 13, color: '#64748b' }}>
            Advokat publik pembimbing perkara akan menginputkan jadwal sidang pada portal penanganan perkara.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {hearings.map((h) => (
            <div
              key={h.id}
              style={{
                background: '#fff',
                border: '1px solid #e2e8f0',
                borderRadius: 10,
                padding: 20,
                boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 12 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--olive, #3b4a2e)', background: '#f5f7f2', padding: '2px 8px', borderRadius: 4 }}>
                      {h.case?.code}
                    </span>
                    <span style={{ fontSize: 12, color: '#64748b' }}>
                      Perkara: <strong>{h.case?.title}</strong>
                    </span>
                  </div>
                  <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 6px' }}>{h.title}</h3>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, fontSize: 12, color: '#475569' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Calendar size={14} color="#64748b" />
                      {new Date(h.date).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </div>
                    {h.location && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <MapPin size={14} color="#64748b" />
                        {h.location}
                      </div>
                    )}
                    {h.stage && (
                      <div style={{ background: '#f1f5f9', padding: '1px 8px', borderRadius: 4, fontWeight: 600, color: '#334155' }}>
                        Tahap: {h.stage}
                      </div>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => openNoteModal(h)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    background: h.notes ? '#f0fdf4' : 'var(--olive, #3b4a2e)',
                    color: h.notes ? '#166534' : '#fff',
                    border: h.notes ? '1px solid #bbf7d0' : 'none',
                    padding: '8px 14px',
                    borderRadius: 6,
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  <FileEdit size={14} />
                  {h.notes ? 'Perbarui Observasi' : 'Tulis Observasi'}
                </button>
              </div>

              {/* Display existing notes */}
              {h.notes && (
                <div style={{ background: '#f8fafc', borderLeft: '3px solid #1e40af', padding: '12px 16px', borderRadius: 4, marginTop: 10 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#1e40af', textTransform: 'uppercase', marginBottom: 4 }}>
                    Catatan & Analisis Praktik Mahasiswa:
                  </div>
                  <p style={{ margin: 0, fontSize: 13, color: '#334155', whiteSpace: 'pre-line', lineHeight: 1.5 }}>
                    {h.notes}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal Tulis Observasi */}
      {activeHearing && (
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
              maxWidth: 600,
              width: '100%',
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div>
                <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--olive, #3b4a2e)' }}>
                  {activeHearing.case?.code} · {activeHearing.title}
                </span>
                <h3 style={{ margin: '2px 0 0', fontSize: 18, fontWeight: 700 }}>
                  Lembar Observasi Praktik Sidang (SOP Edukasi)
                </h3>
              </div>
              <button
                onClick={() => setActiveHearing(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#657068' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6, color: '#374151' }}>
                Catatan Pengamatan, Sikap Para Pihak, dan Pembelajaran Yuridis
              </label>
              <textarea
                rows={8}
                value={notesInput}
                onChange={(e) => setNotesInput(e.target.value)}
                placeholder="Tuliskan:&#10;1. Susunan Majelis Hakim & Kehadiran Para Pihak&#10;2. Pokok Eksepsi / Bantahan / Keterangan Saksi&#10;3. Sikap Advokat Pendamping LKBH STHM&#10;4. Kesimpulan dan Agenda Sidang Berikutnya"
                style={{
                  width: '100%',
                  padding: 12,
                  borderRadius: 8,
                  border: '1px solid #d1d5db',
                  fontSize: 13,
                  lineHeight: 1.5
                }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button
                type="button"
                onClick={() => setActiveHearing(null)}
                style={{ padding: '8px 14px', borderRadius: 6, border: '1px solid #d1d5db', background: '#fff', fontSize: 13, cursor: 'pointer' }}
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSaveNotes}
                disabled={saving}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '8px 16px',
                  borderRadius: 6,
                  border: 'none',
                  background: 'var(--olive, #3b4a2e)',
                  color: '#fff',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: saving ? 'not-allowed' : 'pointer'
                }}
              >
                <Save size={15} />
                {saving ? 'Menyimpan...' : 'Simpan Catatan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
