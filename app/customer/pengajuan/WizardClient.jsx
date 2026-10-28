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
  ShieldCheck,
  HeartHandshake,
  Briefcase,
  Check,
  FileSpreadsheet
} from 'lucide-react';

const MAX_SUPPORTING_FILES = 5;
const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25 MB per file

export default function WizardClient({ user }) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState({ text: '', type: 'info' });

  // 1. Kategori Permohonan: 'PRO_BONO' (Tidak Mampu) atau 'UMUM' (Mampu)
  const [category, setCategory] = useState('PRO_BONO');

  // 2. Kronologi & Pokok Masalah
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  // 3. Berkas Persyaratan Terpisah
  const [ktpFile, setKtpFile] = useState(null);
  const [sktmFile, setSktmFile] = useState(null);
  const [supportingFiles, setSupportingFiles] = useState([]); // Max 5 supporting files

  const notify = (text, type = 'info') => {
    setNotice({ text, type });
    setTimeout(() => setNotice({ text: '', type: 'info' }), 5000);
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const handleKtpChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_FILE_SIZE) {
      notify('Berkas KTP melebihi batas 25MB.', 'error');
      return;
    }
    setKtpFile(file);
    e.target.value = '';
  };

  const handleSktmChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_FILE_SIZE) {
      notify('Berkas SKTM melebihi batas 25MB.', 'error');
      return;
    }
    setSktmFile(file);
    e.target.value = '';
  };

  const handleSupportingChange = (e) => {
    const selected = Array.from(e.target.files || []);
    if (!selected.length) return;

    if (supportingFiles.length + selected.length > MAX_SUPPORTING_FILES) {
      notify(`Maksimal ${MAX_SUPPORTING_FILES} berkas dokumen pendukung perkara.`, 'error');
      return;
    }

    const valid = [];
    for (const f of selected) {
      if (f.size > MAX_FILE_SIZE) {
        notify(`Berkas "${f.name}" melebihi batas 25MB.`, 'error');
        continue;
      }
      if (!supportingFiles.some((ex) => ex.name === f.name && ex.size === f.size)) {
        valid.push(f);
      }
    }

    setSupportingFiles((prev) => [...prev, ...valid]);
    e.target.value = '';
  };

  const removeSupportingFile = (index) => {
    setSupportingFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const canProceed = () => {
    if (step === 1) return category === 'PRO_BONO' || category === 'UMUM';
    if (step === 2) return title.trim().length >= 5 && description.trim().length >= 20;
    if (step === 3) {
      if (!ktpFile) return false;
      if (category === 'PRO_BONO' && !sktmFile) return false;
      return true;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!ktpFile) {
      notify('Kartu Tanda Penduduk (KTP) wajib diunggah.', 'error');
      return;
    }
    if (category === 'PRO_BONO' && !sktmFile) {
      notify('Surat Keterangan Tidak Mampu (SKTM) wajib diunggah untuk permohonan Pro Bono.', 'error');
      return;
    }

    setSubmitting(true);
    setNotice({ text: 'Sedang mendaftarkan permohonan bantuan hukum...', type: 'info' });

    try {
      // 1. Buat Kasus Baru dengan status isProBono
      const isProBono = category === 'PRO_BONO';
      const caseRes = await fetch('/api/cases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          isProBono,
        }),
      });

      const caseData = await caseRes.json();
      if (!caseRes.ok) {
        throw new Error(caseData.error || 'Gagal mengirimkan permohonan kasus.');
      }

      const caseId = caseData.case.id;

      // 2. Siapkan Berkas-berkas untuk Diunggah
      const filesToUpload = [];

      // A. KTP
      filesToUpload.push({
        file: new File([ktpFile], `[KTP] ${ktpFile.name}`, { type: ktpFile.type }),
        label: 'KTP',
      });

      // B. SKTM (khusus Pro Bono)
      if (isProBono && sktmFile) {
        filesToUpload.push({
          file: new File([sktmFile], `[SKTM] ${sktmFile.name}`, { type: sktmFile.type }),
          label: 'SKTM',
        });
      }

      // C. Dokumen Pendukung Lainnya
      for (const sup of supportingFiles) {
        filesToUpload.push({
          file: new File([sup], `[Pendukung] ${sup.name}`, { type: sup.type }),
          label: 'Dokumen Pendukung',
        });
      }

      // 3. Unggah Seluruh Berkas
      setNotice({ text: `Mengunggah ${filesToUpload.length} berkas kelayakan & pendukung...`, type: 'info' });

      for (let i = 0; i < filesToUpload.length; i++) {
        const item = filesToUpload[i];
        const formData = new FormData();
        formData.append('file', item.file);
        formData.append('source', 'CLIENT');

        try {
          await fetch(`/api/cases/${caseId}/documents`, {
            method: 'POST',
            body: formData,
          });
        } catch (uploadErr) {
          console.error(`Upload failed for ${item.label}:`, uploadErr);
        }
      }

      notify('Permohonan bantuan hukum berhasil dikirimkan ke LBH STHM!', 'success');
      setTimeout(() => {
        router.push(`/customer/kasus/${caseId}`);
      }, 1500);
    } catch (err) {
      notify(err.message || 'Terjadi kesalahan saat pengajuan permohonan.', 'error');
      setSubmitting(false);
    }
  };

  const STEPS = [
    { num: 1, label: 'Kategori Pemohon' },
    { num: 2, label: 'Kronologi Kasus' },
    { num: 3, label: 'Unggah Berkas' },
    { num: 4, label: 'Konfirmasi' },
  ];

  return (
    <div style={{ maxWidth: 880, margin: '0 auto', padding: '32px 20px 80px' }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <p className="eyebrow" style={{ color: 'var(--olive, #3b4a2e)', margin: 0, fontWeight: 700 }}>
          PENGAJUAN BANTUAN HUKUM LBH STHM
        </p>
        <h1 style={{ fontSize: 26, fontWeight: 700, margin: '6px 0', fontFamily: 'Space Grotesk, sans-serif' }}>
          Formulir Permohonan & Kelayakan Perkara
        </h1>
        <p style={{ color: '#657068', fontSize: 14, margin: 0 }}>
          Pilih kategori pemohon bantuan hukum, sampaikan pokok permasalahan kronologi, serta lampirkan berkas kelayakan sesuai standar operasional prosedur LBH STHM.
        </p>
      </div>

      {/* Stepper Indicator */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 30,
          background: '#fff',
          padding: '16px 24px',
          borderRadius: 12,
          border: '1px solid var(--line, #e4e7df)',
          flexWrap: 'wrap',
          gap: 12
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
                {isDone ? <Check size={18} /> : s.num}
              </div>
              <span style={{ fontSize: 13, fontWeight: isActive ? 700 : 500, color: '#1f2937' }}>
                {s.label}
              </span>
              {idx < STEPS.length - 1 && (
                <div style={{ width: 40, height: 2, background: isDone ? '#16a34a' : '#e5e7eb', margin: '0 4px' }} />
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

      {/* STEP 1: Pilih Kategori Pemohon (Pro Bono vs Umum) */}
      {step === 1 && (
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', padding: 28 }}>
          <div style={{ marginBottom: 20 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#16a34a', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Langkah 1 dari 4
            </span>
            <h2 style={{ fontSize: 20, fontWeight: 700, margin: '4px 0 6px', fontFamily: 'Space Grotesk' }}>
              Pilih Kategori Permohonan Bantuan Hukum
            </h2>
            <p style={{ color: '#657068', fontSize: 14, margin: 0 }}>
              Sesuai amanat Undang-Undang Bantuan Hukum dan Pedoman LKBH STHM, tentukan kategori permohonan yang sesuai dengan kondisi Anda. Pilihan ini menentukan berkas administrasi yang wajib disertakan.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16 }}>
            {/* CARD 1: PRO BONO */}
            <div
              onClick={() => setCategory('PRO_BONO')}
              style={{
                border: '2px solid',
                borderColor: category === 'PRO_BONO' ? '#16a34a' : '#e2e8f0',
                background: category === 'PRO_BONO' ? '#f0fdf4' : '#fff',
                borderRadius: 12,
                padding: '24px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                position: 'relative',
                boxShadow: category === 'PRO_BONO' ? '0 4px 14px rgba(22, 163, 74, 0.12)' : 'none',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 10,
                  background: category === 'PRO_BONO' ? '#16a34a' : '#f1f5f9',
                  color: category === 'PRO_BONO' ? '#fff' : '#475569',
                  display: 'grid', placeItems: 'center'
                }}>
                  <HeartHandshake size={24} />
                </div>

                <span style={{
                  fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 999,
                  background: '#dcfce7', color: '#15803d', border: '1px solid #bbf7d0'
                }}>
                  Cuma-Cuma / Bebas Biaya
                </span>
              </div>

              <h3 style={{ fontSize: 17, fontWeight: 700, color: '#0f172a', margin: '0 0 6px' }}>
                Bantuan Hukum Pro Bono (Tidak Mampu)
              </h3>

              <p style={{ fontSize: 13, color: '#475569', lineHeight: 1.5, margin: '0 0 16px' }}>
                Layanan konsultasi dan pendampingan hukum cuma-cuma khusus bagi masyarakat sipil atau keluarga militer yang <strong>kurang mampu secara ekonomi</strong>.
              </p>

              <div style={{
                background: '#fff', borderRadius: 8, padding: '12px 14px',
                border: '1px solid #cbd5e1', fontSize: 12, color: '#334155'
              }}>
                <strong style={{ color: '#0f172a', display: 'block', marginBottom: 6 }}>
                  Persyaratan Berkas Wajib:
                </strong>
                <ul style={{ margin: 0, paddingLeft: 18, lineHeight: 1.6 }}>
                  <li><strong>KTP / Identitas Diri Pemohon</strong> (Wajib)</li>
                  <li><strong style={{ color: '#dc2626' }}>Surat Keterangan Tidak Mampu (SKTM)</strong> dari Kelurahan/Desa atau kartu bansos (Wajib)</li>
                  <li>Dokumen Pendukung Perkara (Jika ada)</li>
                  <li>Penjelasan Uraian Kronologi Kasus</li>
                </ul>
              </div>

              <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 8, color: category === 'PRO_BONO' ? '#16a34a' : '#64748b', fontSize: 13, fontWeight: 600 }}>
                <div style={{
                  width: 18, height: 18, borderRadius: '50%', border: '2px solid',
                  borderColor: category === 'PRO_BONO' ? '#16a34a' : '#cbd5e1',
                  display: 'grid', placeItems: 'center', background: category === 'PRO_BONO' ? '#16a34a' : 'transparent'
                }}>
                  {category === 'PRO_BONO' && <Check size={12} color="#fff" strokeWidth={3} />}
                </div>
                <span>{category === 'PRO_BONO' ? 'Kategori Dipilih' : 'Pilih Kategori Ini'}</span>
              </div>
            </div>

            {/* CARD 2: UMUM / REGULER */}
            <div
              onClick={() => setCategory('UMUM')}
              style={{
                border: '2px solid',
                borderColor: category === 'UMUM' ? '#1e40af' : '#e2e8f0',
                background: category === 'UMUM' ? '#eff6ff' : '#fff',
                borderRadius: 12,
                padding: '24px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                position: 'relative',
                boxShadow: category === 'UMUM' ? '0 4px 14px rgba(30, 64, 175, 0.12)' : 'none',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 10,
                  background: category === 'UMUM' ? '#1e40af' : '#f1f5f9',
                  color: category === 'UMUM' ? '#fff' : '#475569',
                  display: 'grid', placeItems: 'center'
                }}>
                  <Briefcase size={24} />
                </div>

                <span style={{
                  fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 999,
                  background: '#dbeafe', color: '#1e40af', border: '1px solid #bfdbfe'
                }}>
                  Layanan Reguler / Mampu
                </span>
              </div>

              <h3 style={{ fontSize: 17, fontWeight: 700, color: '#0f172a', margin: '0 0 6px' }}>
                Layanan Hukum Umum / Mampu
              </h3>

              <p style={{ fontSize: 13, color: '#475569', lineHeight: 1.5, margin: '0 0 16px' }}>
                Layanan bantuan hukum profesional bagi masyarakat umum atau keluarga yang <strong>tergolong mampu secara finansial</strong> tanpa pembebasan syarat ekonomi.
              </p>

              <div style={{
                background: '#fff', borderRadius: 8, padding: '12px 14px',
                border: '1px solid #cbd5e1', fontSize: 12, color: '#334155'
              }}>
                <strong style={{ color: '#0f172a', display: 'block', marginBottom: 6 }}>
                  Persyaratan Berkas Wajib:
                </strong>
                <ul style={{ margin: 0, paddingLeft: 18, lineHeight: 1.6 }}>
                  <li><strong>KTP / Identitas Diri Pemohon</strong> (Wajib)</li>
                  <li>Dokumen Bukti Pendukung Perkara (Jika ada)</li>
                  <li>Penjelasan Uraian Kronologi Kasus</li>
                  <li style={{ color: '#16a34a' }}><em>Tidak memerlukan SKTM</em></li>
                </ul>
              </div>

              <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 8, color: category === 'UMUM' ? '#1e40af' : '#64748b', fontSize: 13, fontWeight: 600 }}>
                <div style={{
                  width: 18, height: 18, borderRadius: '50%', border: '2px solid',
                  borderColor: category === 'UMUM' ? '#1e40af' : '#cbd5e1',
                  display: 'grid', placeItems: 'center', background: category === 'UMUM' ? '#1e40af' : 'transparent'
                }}>
                  {category === 'UMUM' && <Check size={12} color="#fff" strokeWidth={3} />}
                </div>
                <span>{category === 'UMUM' ? 'Kategori Dipilih' : 'Pilih Kategori Ini'}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: Kronologi Kasus */}
      {step === 2 && (
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', padding: 28 }}>
          <div style={{ marginBottom: 20 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#16a34a', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Langkah 2 dari 4 · Kategori: {category === 'PRO_BONO' ? 'Pro Bono (Tidak Mampu)' : 'Umum (Mampu)'}
            </span>
            <h2 style={{ fontSize: 20, fontWeight: 700, margin: '4px 0 6px', fontFamily: 'Space Grotesk' }}>
              Kronologi & Uraian Permasalahan Hukum
            </h2>
            <p style={{ color: '#657068', fontSize: 14, margin: 0 }}>
              Jelaskan pokok permasalahan perkara Anda secara runtut agar dapat ditelaah dalam rapat kelayakan tim LBH STHM.
            </p>
          </div>

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
                  border: '1px solid #cbd5e1',
                  fontSize: 14,
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
              <span style={{ fontSize: 12, color: '#9ca3af', marginTop: 4, display: 'block' }}>
                Minimal 5 karakter ({title.trim().length} karakter).
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
                placeholder="Ceritakan secara runtut: awal mula permasalahan, pihak-pihak terkait, dokumen yang Anda miliki, dan bentuk bantuan hukum apa yang Anda harapkan dari LBH STHM..."
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: 8,
                  border: '1px solid #cbd5e1',
                  fontSize: 14,
                  lineHeight: 1.6,
                  outline: 'none',
                  resize: 'vertical',
                  boxSizing: 'border-box'
                }}
              />
              <span style={{ fontSize: 12, color: '#9ca3af', marginTop: 4, display: 'block' }}>
                Minimal 20 karakter ({description.trim().length} karakter dimasukkan).
              </span>
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: Unggah Berkas Persyaratan Terpisah */}
      {step === 3 && (
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', padding: 28 }}>
          <div style={{ marginBottom: 24 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#16a34a', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Langkah 3 dari 4 · Kategori: {category === 'PRO_BONO' ? 'Pro Bono (Tidak Mampu)' : 'Umum (Mampu)'}
            </span>
            <h2 style={{ fontSize: 20, fontWeight: 700, margin: '4px 0 6px', fontFamily: 'Space Grotesk' }}>
              Unggah Berkas Persyaratan Permohonan
            </h2>
            <p style={{ color: '#657068', fontSize: 14, margin: 0 }}>
              Lampirkan dokumen bukti identitas dan kelayakan sesuai kategori permohonan Anda. Format yang didukung: PDF, DOCX, JPG, PNG (maksimal 25MB per berkas).
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* SLOT 1: KTP (Wajib untuk semua pemohon) */}
            <div style={{
              background: '#f8fafc', borderRadius: 10, padding: '18px 20px',
              border: ktpFile ? '1px solid #bbf7d0' : '1px dashed #cbd5e1'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <FileText size={18} color="#0f172a" />
                  <strong style={{ fontSize: 14, color: '#0f172a' }}>
                    1. Kartu Tanda Penduduk (KTP / Identitas Diri Pemohon)
                  </strong>
                </div>
                <span style={{
                  fontSize: 11, fontWeight: 700, background: '#fee2e2', color: '#991b1b',
                  padding: '2px 8px', borderRadius: 4
                }}>
                  Wajib Diunggah
                </span>
              </div>
              <p style={{ margin: '0 0 12px', fontSize: 12, color: '#64748b' }}>
                KTP asli atau scan foto identitas pemohon bantuan hukum yang sah dan masih berlaku.
              </p>

              {ktpFile ? (
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  background: '#f0fdf4', padding: '10px 14px', borderRadius: 6, border: '1px solid #86efac'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <CheckCircle2 size={18} color="#16a34a" />
                    <div>
                      <strong style={{ fontSize: 13, color: '#166534' }}>{ktpFile.name}</strong>
                      <span style={{ fontSize: 11, color: '#64748b', display: 'block' }}>{formatFileSize(ktpFile.size)}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setKtpFile(null)}
                    style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer' }}
                    title="Hapus KTP"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ) : (
                <div>
                  <button
                    type="button"
                    onClick={() => document.getElementById('ktp-input-file')?.click()}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: 6,
                      background: '#fff', border: '1px solid #cbd5e1', padding: '8px 14px',
                      borderRadius: 6, fontSize: 13, fontWeight: 600, color: '#334155', cursor: 'pointer'
                    }}
                  >
                    <UploadCloud size={16} /> Pilih Berkas KTP
                  </button>
                  <input
                    id="ktp-input-file"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    onChange={handleKtpChange}
                    style={{ display: 'none' }}
                  />
                </div>
              )}
            </div>

            {/* SLOT 2: SKTM (HANYA MUNCUL JIKA PRO BONO) */}
            {category === 'PRO_BONO' && (
              <div style={{
                background: '#fefce8', borderRadius: 10, padding: '18px 20px',
                border: sktmFile ? '1px solid #bbf7d0' : '1px dashed #facc15'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Scale size={18} color="#854d0e" />
                    <strong style={{ fontSize: 14, color: '#713f12' }}>
                      2. Surat Keterangan Tidak Mampu (SKTM) dari Kelurahan / Desa
                    </strong>
                  </div>
                  <span style={{
                    fontSize: 11, fontWeight: 700, background: '#fee2e2', color: '#991b1b',
                    padding: '2px 8px', borderRadius: 4
                  }}>
                    Wajib Pro Bono
                  </span>
                </div>
                <p style={{ margin: '0 0 12px', fontSize: 12, color: '#854d0e' }}>
                  Surat keterangan resmi dari Kelurahan/Desa domisili pemohon yang menyatakan kurang mampu, atau kartu jaminan perlindungan sosial (PKH, KPS, KIS/Jamkesmas).
                </p>

                {sktmFile ? (
                  <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    background: '#f0fdf4', padding: '10px 14px', borderRadius: 6, border: '1px solid #86efac'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <CheckCircle2 size={18} color="#16a34a" />
                      <div>
                        <strong style={{ fontSize: 13, color: '#166534' }}>{sktmFile.name}</strong>
                        <span style={{ fontSize: 11, color: '#64748b', display: 'block' }}>{formatFileSize(sktmFile.size)}</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSktmFile(null)}
                      style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer' }}
                      title="Hapus SKTM"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ) : (
                  <div>
                    <button
                      type="button"
                      onClick={() => document.getElementById('sktm-input-file')?.click()}
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: 6,
                        background: '#fff', border: '1px solid #facc15', padding: '8px 14px',
                        borderRadius: 6, fontSize: 13, fontWeight: 600, color: '#854d0e', cursor: 'pointer'
                      }}
                    >
                      <UploadCloud size={16} /> Pilih Berkas SKTM (Surat Keterangan Tidak Mampu)
                    </button>
                    <input
                      id="sktm-input-file"
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                      onChange={handleSktmChange}
                      style={{ display: 'none' }}
                    />
                  </div>
                )}
              </div>
            )}

            {/* SLOT 3: DOKUMEN PENDUKUNG (OPSIONAL / MULTI-FILE) */}
            <div style={{
              background: '#f8fafc', borderRadius: 10, padding: '18px 20px',
              border: '1px solid #e2e8f0'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <FileSpreadsheet size={18} color="#0f172a" />
                  <strong style={{ fontSize: 14, color: '#0f172a' }}>
                    {category === 'PRO_BONO' ? '3' : '2'}. Dokumen Pendukung Perkara (Opsional)
                  </strong>
                </div>
                <span style={{
                  fontSize: 11, fontWeight: 600, background: '#f1f5f9', color: '#475569',
                  padding: '2px 8px', borderRadius: 4
                }}>
                  Maksimal {MAX_SUPPORTING_FILES} Berkas
                </span>
              </div>
              <p style={{ margin: '0 0 12px', fontSize: 12, color: '#64748b' }}>
                Lampirkan bukti surat, akta, sertifikat tanah, kwitansi, surat perjanjian, surat somasi, atau bukti relevan lainnya untuk memperkuat perkara Anda saat rapat LBH STHM.
              </p>

              {supportingFiles.length < MAX_SUPPORTING_FILES && (
                <div style={{ marginBottom: 12 }}>
                  <button
                    type="button"
                    onClick={() => document.getElementById('supporting-input-file')?.click()}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: 6,
                      background: '#fff', border: '1px solid #cbd5e1', padding: '8px 14px',
                      borderRadius: 6, fontSize: 13, fontWeight: 600, color: '#334155', cursor: 'pointer'
                    }}
                  >
                    <UploadCloud size={16} /> Tambah Dokumen Pendukung
                  </button>
                  <input
                    id="supporting-input-file"
                    type="file"
                    multiple
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.zip"
                    onChange={handleSupportingChange}
                    style={{ display: 'none' }}
                  />
                </div>
              )}

              {supportingFiles.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {supportingFiles.map((f, i) => (
                    <div
                      key={i}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        background: '#fff', padding: '8px 12px', borderRadius: 6, border: '1px solid #e2e8f0'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <FileCheck size={16} color="#0284c7" />
                        <div>
                          <strong style={{ fontSize: 13, color: '#1e293b' }}>{f.name}</strong>
                          <span style={{ fontSize: 11, color: '#64748b', display: 'block' }}>{formatFileSize(f.size)}</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeSupportingFile(i)}
                        style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer' }}
                        title="Hapus berkas"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* STEP 4: Konfirmasi */}
      {step === 4 && (
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', padding: 28 }}>
          <div style={{ marginBottom: 20 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#16a34a', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Langkah 4 dari 4
            </span>
            <h2 style={{ fontSize: 20, fontWeight: 700, margin: '4px 0 6px', fontFamily: 'Space Grotesk' }}>
              Konfirmasi & Pengiriman Permohonan
            </h2>
            <p style={{ color: '#657068', fontSize: 14, margin: 0 }}>
              Periksa kembali kelengkapan kategori, kronologi kasus, dan berkas yang akan dikirim ke tim LBH STHM.
            </p>
          </div>

          <div style={{ background: '#f8fafc', borderRadius: 10, padding: 20, marginBottom: 24, border: '1px solid #e2e8f0' }}>
            <div style={{ marginBottom: 16 }}>
              <span style={{ fontSize: 11, color: '#64748b', display: 'block', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Kategori Permohonan
              </span>
              <strong style={{
                fontSize: 15,
                color: category === 'PRO_BONO' ? '#16a34a' : '#1e40af',
                background: category === 'PRO_BONO' ? '#f0fdf4' : '#eff6ff',
                padding: '4px 10px', borderRadius: 6, display: 'inline-block', marginTop: 4,
                border: `1px solid ${category === 'PRO_BONO' ? '#bbf7d0' : '#bfdbfe'}`
              }}>
                {category === 'PRO_BONO' ? 'Bantuan Hukum Pro Bono (Cuma-Cuma / Tidak Mampu)' : 'Layanan Hukum Umum / Mampu'}
              </strong>
            </div>

            <div style={{ marginBottom: 16 }}>
              <span style={{ fontSize: 11, color: '#64748b', display: 'block', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Pokok Permasalahan
              </span>
              <strong style={{ fontSize: 16, color: '#0f172a' }}>{title}</strong>
            </div>

            <div style={{ marginBottom: 16 }}>
              <span style={{ fontSize: 11, color: '#64748b', display: 'block', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Uraian Kronologi Kasus
              </span>
              <p style={{ fontSize: 13, color: '#334155', margin: '4px 0 0', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                {description}
              </p>
            </div>

            <div>
              <span style={{ fontSize: 11, color: '#64748b', display: 'block', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>
                Berkas Kelayakan yang Akan Diunggah:
              </span>
              <ul style={{ margin: 0, paddingLeft: 20, fontSize: 13, color: '#334155', lineHeight: 1.6 }}>
                <li><strong>KTP:</strong> {ktpFile?.name} ({formatFileSize(ktpFile?.size)})</li>
                {category === 'PRO_BONO' && (
                  <li><strong>SKTM:</strong> {sktmFile?.name} ({formatFileSize(sktmFile?.size)})</li>
                )}
                {supportingFiles.map((f, i) => (
                  <li key={i}><strong>Dokumen Pendukung:</strong> {f.name} ({formatFileSize(f.size)})</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Alur Informasi Rapat */}
          <div
            style={{
              display: 'flex', gap: 12, background: '#eff6ff', border: '1px solid #bfdbfe',
              borderRadius: 8, padding: 16, color: '#1e40af', fontSize: 13, lineHeight: 1.5,
            }}
          >
            <Clock size={22} style={{ flexShrink: 0, marginTop: 2 }} />
            <div>
              <strong>Alur evaluasi setelah permohonan dikirim:</strong>
              <ol style={{ margin: '4px 0 0', paddingLeft: 18 }}>
                <li>Status awal adalah <strong>DIAJUKAN</strong> (menunggu rapat evaluasi kelayakan oleh tim LBH STHM).</li>
                <li>Setelah rapat LBH menyatakan perkara Anda layak, Admin akan meng-ACC permohonan dan menerbitkan dokumen <strong>Legal Opinion</strong> resmi.</li>
                <li>Kepala LKBH menunjuk <strong>Konsultan Hukum / Advokat</strong> melalui Surat Perintah (SPRIN) untuk menangani perkara Anda.</li>
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

        {step < 4 ? (
          <button
            type="button"
            className="button primary"
            onClick={() => setStep((s) => s + 1)}
            disabled={!canProceed()}
            style={{ background: 'var(--primary, #3b4a2e)' }}
          >
            Lanjut <ArrowRight size={16} />
          </button>
        ) : (
          <button
            type="button"
            className="button primary"
            onClick={handleSubmit}
            disabled={submitting || !ktpFile || (category === 'PRO_BONO' && !sktmFile)}
            style={{ background: '#16a34a', borderColor: '#16a34a' }}
          >
            {submitting ? 'Mengirimkan Permohonan...' : 'Kirim Permohonan Kasus'} <CheckCircle2 size={16} />
          </button>
        )}
      </div>
    </div>
  );
}
