'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  FileText,
  CheckCircle2,
  AlertCircle,
  UploadCloud,
  FileCheck,
  Trash2,
  ArrowRight,
  ArrowLeft,
  Clock,
  Info,
  Scale,
  ShieldCheck
} from 'lucide-react';

const MAX_FILES = 5;
const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25 MB per file (mendukung di atas 10MB)

export default function WizardClient({ user }) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState({ text: '', type: 'info' });

  // Form State — Hanya 2 data utama dari customer: Kronologi Perkara + Dokumen Bukti Kelayakan
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [files, setFiles] = useState([]); // Array of File objects (max 5)
  const [uploadProgress, setUploadProgress] = useState([]); // [{ name, status }]

  const notify = (text, type = 'info') => {
    setNotice({ text, type });
    setTimeout(() => setNotice({ text: '', type: 'info' }), 5000);
  };

  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files || []);
    if (!selected.length) return;

    if (files.length + selected.length > MAX_FILES) {
      notify(`Maksimal ${MAX_FILES} berkas dokumen bukti kelayakan.`, 'error');
      return;
    }

    const valid = [];
    for (const f of selected) {
      if (f.size > MAX_FILE_SIZE) {
        notify(`Berkas "${f.name}" melebihi batas 25MB.`, 'error');
        continue;
      }
      if (!files.some((existing) => existing.name === f.name && existing.size === f.size)) {
        valid.push(f);
      }
    }

    setFiles((prev) => [...prev, ...valid]);
    e.target.value = '';
  };

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const canProceed = () => {
    if (step === 1) return title.trim().length >= 5 && description.trim().length >= 20;
    if (step === 2) return files.length >= 1; // Minimal 1 dokumen bukti kelayakan
    return true;
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setNotice({ text: 'Sedang mendaftarkan permohonan bantuan hukum...', type: 'info' });

    try {
      // 1. Create Case (Customer tidak memilih layanan, layanan ditentukan saat rapat LBH)
      const caseRes = await fetch('/api/cases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
        }),
      });

      const caseData = await caseRes.json();
      if (!caseRes.ok) {
        throw new Error(caseData.error || 'Gagal mengirimkan permohonan kasus.');
      }

      const caseId = caseData.case.id;

      // 2. Upload Dokumen Bukti Kelayakan
      if (files.length > 0) {
        setNotice({ text: `Mengunggah ${files.length} dokumen bukti kelayakan...`, type: 'info' });
        const progress = files.map((f) => ({ name: f.name, status: 'uploading' }));
        setUploadProgress(progress);

        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          const formData = new FormData();
          formData.append('file', file);
          formData.append('source', 'CLIENT');

          try {
            const uploadRes = await fetch(`/api/cases/${caseId}/documents`, {
              method: 'POST',
              body: formData,
            });

            if (!uploadRes.ok) {
              progress[i].status = 'error';
            } else {
              progress[i].status = 'done';
            }
          } catch {
            progress[i].status = 'error';
          }
          setUploadProgress([...progress]);
        }
      }

      notify('Permohonan berhasil dikirim! Menunggu rapat evaluasi kelayakan LBH STHM.', 'success');
      setTimeout(() => {
        router.push(`/customer/kasus/${caseId}`);
      }, 1500);
    } catch (err) {
      notify(err.message || 'Terjadi kesalahan saat pengajuan.', 'error');
      setSubmitting(false);
    }
  };

  const STEPS = [
    { num: 1, label: 'Uraian Kasus' },
    { num: 2, label: 'Bukti Kelayakan' },
    { num: 3, label: 'Konfirmasi' },
  ];

  return (
    <div style={{ maxWidth: 840, margin: '0 auto', padding: '32px 20px 80px' }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <p className="eyebrow" style={{ color: 'var(--olive, #3b4a2e)', margin: 0, fontWeight: 700 }}>
          PENGAJUAN BANTUAN HUKUM LBH STHM
        </p>
        <h1 style={{ fontSize: 26, fontWeight: 700, margin: '6px 0', fontFamily: 'Space Grotesk, sans-serif' }}>
          Formulir Permohonan & Uji Kelayakan Perkara
        </h1>
        <p style={{ color: '#657068', fontSize: 14, margin: 0 }}>
          Sampaikan pokok permasalahan hukum Anda dan lampirkan dokumen bukti kelayakan. Seluruh berkas akan dirapatkan oleh tim LBH STHM untuk penerbitan dokumen Legal Opinion.
        </p>
      </div>

      {/* Info Banner Alur Bisnis */}
      <div
        style={{
          background: '#f0fdf4',
          border: '1px solid #bbf7d0',
          borderRadius: 10,
          padding: '14px 18px',
          marginBottom: 28,
          display: 'flex',
          gap: 12,
          alignItems: 'flex-start',
        }}
      >
        <ShieldCheck size={22} color="#16a34a" style={{ flexShrink: 0, marginTop: 2 }} />
        <div style={{ fontSize: 13, color: '#166534', lineHeight: 1.5 }}>
          <strong>Mekanisme Penetapan Layanan:</strong>
          <span style={{ display: 'block', marginTop: 2, color: '#14532d' }}>
            Pemohon tidak perlu memilih jenis layanan. Berdasarkan <strong>uraian kasus</strong> dan <strong>dokumen kelayakan</strong> yang Anda kirimkan, tim LBH STHM akan mengadakan rapat untuk menerbitkan <strong>Legal Opinion</strong> serta menentukan tindak lanjut yang tepat (seperti Pendampingan Hukum atau Konsultasi Hukum).
          </span>
        </div>
      </div>

      {/* Stepper Indicator */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 32,
          background: '#fff',
          padding: '16px 24px',
          borderRadius: 12,
          border: '1px solid var(--line, #e4e7df)',
        }}
      >
        {STEPS.map((s, idx) => {
          const isActive = step === s.num;
          const isDone = step > s.num;
          return (
            <div
              key={s.num}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                opacity: isDone || isActive ? 1 : 0.5,
              }}
            >
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  display: 'grid',
                  placeItems: 'center',
                  background: isDone ? '#16a34a' : isActive ? 'var(--olive-deep, #22352b)' : '#f3f4f6',
                  color: isDone || isActive ? '#fff' : '#6b7280',
                  fontWeight: 700,
                  fontSize: 13,
                }}
              >
                {isDone ? <CheckCircle2 size={18} /> : s.num}
              </div>
              <span style={{ fontSize: 13, fontWeight: isActive ? 700 : 500, color: '#1f2937' }}>
                {s.label}
              </span>
              {idx < STEPS.length - 1 && (
                <div style={{ width: 60, height: 2, background: isDone ? '#16a34a' : '#e5e7eb', margin: '0 8px' }} />
              )}
            </div>
          );
        })}
      </div>

      {/* Notice Alert */}
      {notice.text && (
        <div
          style={{
            padding: '12px 16px',
            borderRadius: 8,
            marginBottom: 24,
            fontSize: 14,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            background: notice.type === 'error' ? '#fee2e2' : notice.type === 'success' ? '#dcfce7' : '#e0f2fe',
            color: notice.type === 'error' ? '#991b1b' : notice.type === 'success' ? '#166534' : '#0369a1',
            border: `1px solid ${
              notice.type === 'error' ? '#fca5a5' : notice.type === 'success' ? '#86efac' : '#7dd3fc'
            }`,
          }}
        >
          {notice.type === 'error' ? <AlertCircle size={18} /> : <Info size={18} />}
          <span>{notice.text}</span>
        </div>
      )}

      {/* STEP 1: Uraian Kasus & Kronologi */}
      {step === 1 && (
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', padding: 28 }}>
          <h2 style={{ fontSize: 19, fontWeight: 700, margin: '0 0 6px', fontFamily: 'Space Grotesk' }}>
            Langkah 1: Kronologi & Uraian Permasalahan Hukum
          </h2>
          <p style={{ color: '#657068', fontSize: 14, marginBottom: 24 }}>
            Jelaskan permasalahan hukum Anda secara jelas agar dapat ditelaah dalam rapat kelayakan tim LBH STHM.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                Pokok Masalah / Judul Perkara <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Contoh: Sengketa Batas Tanah Waris Keluarga di Jakarta Timur"
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: 8,
                  border: '1px solid #d1d5db',
                  fontSize: 14,
                  outline: 'none',
                }}
              />
              <span style={{ fontSize: 12, color: '#9ca3af', marginTop: 4, display: 'block' }}>
                Minimal 5 karakter.
              </span>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                Kronologi Terperinci Perkara <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={8}
                placeholder="Ceritakan secara runtut: awal mula permasalahan, pihak-pihak terkait, dokumen yang dimiliki, dan bantuan hukum apa yang Anda harapkan dari LBH STHM..."
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: 8,
                  border: '1px solid #d1d5db',
                  fontSize: 14,
                  lineHeight: 1.6,
                  outline: 'none',
                  resize: 'vertical',
                }}
              />
              <span style={{ fontSize: 12, color: '#9ca3af', marginTop: 4, display: 'block' }}>
                Minimal 20 karakter ({description.trim().length} karakter dimasukkan).
              </span>
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: Dokumen Bukti Kelayakan */}
      {step === 2 && (
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', padding: 28 }}>
          <h2 style={{ fontSize: 19, fontWeight: 700, margin: '0 0 6px', fontFamily: 'Space Grotesk' }}>
            Langkah 2: Unggah Dokumen Bukti Kelayakan
          </h2>
          <p style={{ color: '#657068', fontSize: 14, marginBottom: 20 }}>
            Lampirkan bukti dokumen bahwa Anda layak mendapatkan bantuan LBH (Wajib minimal 1 file, maksimal {MAX_FILES} file, mendukung ukuran hingga 25MB per file).
          </p>

          <div
            style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: 8,
              padding: '14px 18px',
              marginBottom: 24,
              fontSize: 13,
              color: '#475569',
              lineHeight: 1.5,
            }}
          >
            <strong>Dokumen bukti kelayakan yang dapat dilampirkan untuk rapat LBH:</strong>
            <ul style={{ margin: '6px 0 0', paddingLeft: 20 }}>
              <li>Kartu Tanda Penduduk (KTP / Identitas diri pemohon)</li>
              <li>Surat Keterangan Tidak Mampu (SKTM dari Kelurahan) jika memohon bantuan cuma-cuma</li>
              <li>Kronologi tertulis atau surat pengaduan resmi</li>
              <li>Bukti surat, kwitansi, akta, sertifikat, atau dokumen pendukung perkara terkait</li>
            </ul>
          </div>

          {/* Upload Dropzone */}
          {files.length < MAX_FILES && (
            <div
              style={{
                border: '2px dashed #cbd5e1',
                borderRadius: 12,
                padding: '32px 20px',
                textAlign: 'center',
                background: '#fafafa',
                cursor: 'pointer',
                marginBottom: 20,
              }}
              onClick={() => document.getElementById('file-input-upload')?.click()}
            >
              <UploadCloud size={40} color="#64748b" style={{ margin: '0 auto 10px' }} />
              <strong style={{ display: 'block', fontSize: 15, color: '#1e293b' }}>
                Klik untuk memilih berkas dokumen bukti
              </strong>
              <span style={{ fontSize: 13, color: '#64748b', display: 'block', marginTop: 4 }}>
                Mendukung PDF, DOCX, JPG, PNG hingga 25MB per file (Sisa slot: {MAX_FILES - files.length})
              </span>
              <input
                id="file-input-upload"
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.zip"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
            </div>
          )}

          {/* List Uploaded Files */}
          {files.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <strong style={{ fontSize: 14, color: '#374151' }}>
                Berkas Terlampir ({files.length} dari {MAX_FILES}):
              </strong>
              {files.map((f, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    borderRadius: 8,
                    border: '1px solid #e5e7eb',
                    background: '#fff',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 6,
                        background: '#e0f2fe',
                        color: '#0369a1',
                        display: 'grid',
                        placeItems: 'center',
                      }}
                    >
                      <FileCheck size={20} />
                    </div>
                    <div>
                      <strong style={{ display: 'block', fontSize: 14, color: '#111827' }}>{f.name}</strong>
                      <span style={{ fontSize: 12, color: '#6b7280' }}>{formatFileSize(f.size)}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFile(i)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#dc2626',
                      cursor: 'pointer',
                      padding: 6,
                    }}
                    title="Hapus berkas"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: '#dc2626', fontSize: 13, marginTop: 8 }}>
              * Mohon lampirkan minimal 1 dokumen bukti kelayakan (misal KTP atau berkas perkara).
            </p>
          )}
        </div>
      )}

      {/* STEP 3: Konfirmasi */}
      {step === 3 && (
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', padding: 28 }}>
          <h2 style={{ fontSize: 19, fontWeight: 700, margin: '0 0 6px', fontFamily: 'Space Grotesk' }}>
            Langkah 3: Konfirmasi & Kirim Permohonan
          </h2>
          <p style={{ color: '#657068', fontSize: 14, marginBottom: 24 }}>
            Pastikan uraian kasus dan berkas bukti kelayakan Anda sudah lengkap sebelum dikirim ke tim LBH STHM.
          </p>

          <div style={{ background: '#f8fafc', borderRadius: 10, padding: 20, marginBottom: 24, border: '1px solid #e2e8f0' }}>
            <div style={{ marginBottom: 14 }}>
              <span style={{ fontSize: 11, color: '#64748b', display: 'block', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Pokok Permasalahan
              </span>
              <strong style={{ fontSize: 16, color: '#0f172a' }}>{title}</strong>
            </div>

            <div style={{ marginBottom: 14 }}>
              <span style={{ fontSize: 11, color: '#64748b', display: 'block', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Uraian Kronologi Kasus
              </span>
              <p style={{ fontSize: 14, color: '#334155', margin: '4px 0 0', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                {description}
              </p>
            </div>

            <div>
              <span style={{ fontSize: 11, color: '#64748b', display: 'block', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>
                Dokumen Bukti Kelayakan ({files.length} berkas)
              </span>
              <ul style={{ margin: 0, paddingLeft: 20, fontSize: 13, color: '#334155' }}>
                {files.map((f, i) => (
                  <li key={i}>
                    {f.name} ({formatFileSize(f.size)})
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Alur Selanjutnya */}
          <div
            style={{
              display: 'flex',
              gap: 12,
              background: '#eff6ff',
              border: '1px solid #bfdbfe',
              borderRadius: 8,
              padding: 16,
              color: '#1e40af',
              fontSize: 13,
              lineHeight: 1.5,
            }}
          >
            <Clock size={22} style={{ flexShrink: 0, marginTop: 2 }} />
            <div>
              <strong>Alur evaluasi setelah permohonan dikirim:</strong>
              <ol style={{ margin: '4px 0 0', paddingLeft: 18 }}>
                <li>Status awal adalah <strong>DIAJUKAN</strong> (menunggu hasil rapat evaluasi kelayakan oleh LBH STHM).</li>
                <li>Setelah rapat LBH menyatakan perkara Anda layak, Admin akan meng-ACC permohonan dan menerbitkan dokumen <strong>Legal Opinion</strong> resmi yang dapat Anda unduh langsung di portal.</li>
                <li>Admin menunjuk <strong>Konsultan Hukum / Advokat</strong> yang relevan untuk mendampingi atau memberikan konsultasi atas perkara Anda.</li>
              </ol>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 24 }}>
        {step > 1 ? (
          <button
            type="button"
            className="button secondary"
            onClick={() => setStep((s) => s - 1)}
            disabled={submitting}
          >
            <ArrowLeft size={16} /> Kembali
          </button>
        ) : (
          <div />
        )}

        {step < 3 ? (
          <button
            type="button"
            className="button primary"
            onClick={() => setStep((s) => s + 1)}
            disabled={!canProceed()}
          >
            Lanjut <ArrowRight size={16} />
          </button>
        ) : (
          <button
            type="button"
            className="button primary"
            onClick={handleSubmit}
            disabled={submitting || files.length === 0}
            style={{ background: '#16a34a', borderColor: '#16a34a' }}
          >
            {submitting ? 'Mengirimkan Permohonan...' : 'Kirim Permohonan Kasus'} <CheckCircle2 size={16} />
          </button>
        )}
      </div>
    </div>
  );
}
