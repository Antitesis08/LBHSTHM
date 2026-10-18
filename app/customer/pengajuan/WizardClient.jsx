'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Scale, Shield, FileText, Users, Award, Heart,
  ArrowLeft, ArrowRight, Check, Upload, Calendar,
  Clock, MapPin, Monitor, Building, AlertCircle, Loader2, User, Copy
} from 'lucide-react';

// ─── Service type definitions ────────────────────────
const SERVICES = [
  { key: 'KONSULTASI_HUKUM', label: 'Konsultasi Hukum', desc: 'Dapatkan panduan dan nasihat hukum dari konsultan berpengalaman.', icon: Scale, color: '#16a34a' },
  { key: 'PENDAMPINGAN_HUKUM', label: 'Pendampingan Hukum', desc: 'Pendampingan penuh selama proses hukum berlangsung.', icon: Shield, color: '#2563eb' },
  { key: 'LEGAL_OPINION', label: 'Legal Opinion', desc: 'Analisis dan pendapat hukum tertulis atas permasalahan Anda.', icon: FileText, color: '#9333ea' },
  { key: 'MEDIASI', label: 'Mediasi', desc: 'Penyelesaian sengketa secara damai melalui mediator netral.', icon: Users, color: '#ea580c' },
  { key: 'PENDAFTARAN_HKI', label: 'Pendaftaran HKI', desc: 'Pendaftaran Hak Kekayaan Intelektual (merek, paten, hak cipta).', icon: Award, color: '#0891b2' },
  { key: 'PRO_BONO', label: 'Pro Bono', desc: 'Layanan bantuan hukum gratis untuk masyarakat tidak mampu.', icon: Heart, color: '#dc2626' },
];

const STEP_TITLES = [
  'Pilih Jenis Layanan',
  'Detail Kasus',
  'Pilih Konsultan',
  'Pilih Jadwal',
  'Upload Dokumen',
  'Kirim Pengajuan',
];

// Map service key to specialization keyword for consultant filter
const SPEC_MAP = {
  KONSULTASI_HUKUM: 'Konsultasi',
  PENDAMPINGAN_HUKUM: 'Pendampingan',
  LEGAL_OPINION: 'Legal Opinion',
  MEDIASI: 'Mediasi',
  PENDAFTARAN_HKI: 'HKI',
  PRO_BONO: 'Pro Bono',
};

export default function WizardClient({ user }) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState({ text: '', type: 'info' });

  // ─── Wizard state ───────────────────────
  const [wizardData, setWizardData] = useState({
    serviceType: null,
    title: '',
    description: '',
    consultantId: null,
    consultantName: '',
    scheduledAt: null,
    selectedDate: '',
    selectedSlot: '',
    mode: 'online',
    location: '',
    documents: [],          // File objects
    proBonoFile: null,      // File object for SKTM
    proBonoProofUrl: '',    // Set after upload
  });

  // ─── Data fetched from API ───────────────
  const [consultants, setConsultants] = useState([]);
  const [loadingConsultants, setLoadingConsultants] = useState(false);
  const [slots, setSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // ─── Upload state for Step 6 ─────────────
  const [uploadState, setUploadState] = useState({
    phase: 'idle', // idle | submitting | uploading | done | partial_fail
    createdCase: null,
    createdSchedule: null,
    uploadProgress: [],   // [{name, status: 'pending'|'uploading'|'done'|'error'}]
    failedCount: 0,
  });

  const notify = (text, type = 'info') => {
    setNotice({ text, type });
    setTimeout(() => setNotice({ text: '', type: 'info' }), 4000);
  };

  const updateWizard = (updates) => {
    setWizardData((prev) => ({ ...prev, ...updates }));
  };

  // ─── Step validation ────────────────────
  const canProceed = () => {
    switch (step) {
      case 1: return !!wizardData.serviceType;
      case 2: return wizardData.title.trim().length >= 5 && wizardData.description.trim().length >= 20;
      case 3: return !!wizardData.consultantId;
      case 4: return !!wizardData.scheduledAt && !!wizardData.selectedSlot;
      case 5: {
        if (wizardData.documents.length === 0) return false;
        if (wizardData.serviceType === 'PRO_BONO' && !wizardData.proBonoFile) return false;
        return true;
      }
      default: return true;
    }
  };

  // ─── Fetch consultants (Step 3) ──────────
  useEffect(() => {
    if (step !== 3) return;
    const fetchConsultants = async () => {
      setLoadingConsultants(true);
      try {
        const spec = SPEC_MAP[wizardData.serviceType] || '';
        const res = await fetch(`/api/consultants?specialization=${encodeURIComponent(spec)}`);
        const data = await res.json();
        let list = data.consultants || [];

        // If filtered returns empty, fetch all as fallback
        if (list.length === 0 && spec) {
          const resFallback = await fetch('/api/consultants');
          const dataFallback = await resFallback.json();
          list = dataFallback.consultants || [];
        }
        setConsultants(list);
      } catch {
        notify('Gagal memuat daftar konsultan.', 'error');
      }
      setLoadingConsultants(false);
    };
    fetchConsultants();
  }, [step, wizardData.serviceType]);

  // ─── Fetch available slots (Step 4) ─────
  const fetchSlots = useCallback(async (date) => {
    if (!wizardData.consultantId || !date) return;
    setLoadingSlots(true);
    setSlots([]);
    try {
      const res = await fetch(`/api/consultants/${wizardData.consultantId}/available-slots?date=${date}`);
      const data = await res.json();
      if (res.ok) {
        setSlots(data.slots || []);
      } else {
        notify(data.error || 'Gagal memuat slot.', 'error');
      }
    } catch {
      notify('Gagal memuat jadwal.', 'error');
    }
    setLoadingSlots(false);
  }, [wizardData.consultantId]);

  useEffect(() => {
    if (step === 4 && wizardData.selectedDate) {
      fetchSlots(wizardData.selectedDate);
    }
  }, [step, wizardData.selectedDate, fetchSlots]);

  // ─── Date range for date picker ──────────
  const getDateMin = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  };
  const getDateMax = () => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().split('T')[0];
  };

  // ─── SUBMIT (Step 6) ────────────────────
  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);
    setUploadState((prev) => ({ ...prev, phase: 'submitting' }));

    try {
      // 1. Create Case + Schedule
      const scheduledAt = new Date(`${wizardData.selectedDate}T${wizardData.selectedSlot}:00`).toISOString();

      const casePayload = {
        serviceType: wizardData.serviceType,
        title: wizardData.title.trim(),
        description: wizardData.description.trim(),
        consultantId: wizardData.consultantId,
        scheduledAt,
        mode: wizardData.mode,
        location: wizardData.mode === 'offline' ? wizardData.location.trim() : '',
        proBonoProof: wizardData.proBonoProofUrl || '',
      };

      const caseRes = await fetch('/api/cases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(casePayload),
      });
      const caseData = await caseRes.json();

      if (!caseRes.ok) {
        notify(caseData.error || 'Gagal membuat pengajuan.', 'error');
        setSubmitting(false);
        setUploadState((prev) => ({ ...prev, phase: 'idle' }));
        return;
      }

      const createdCase = caseData.case;
      const createdSchedule = caseData.schedule;

      // 2. Upload documents
      const allFiles = [...wizardData.documents];
      if (wizardData.proBonoFile) {
        allFiles.push(wizardData.proBonoFile);
      }

      const progress = allFiles.map((f) => ({ name: f.name, status: 'pending' }));
      setUploadState({
        phase: 'uploading',
        createdCase,
        createdSchedule,
        uploadProgress: progress,
        failedCount: 0,
      });

      let failCount = 0;

      for (let i = 0; i < allFiles.length; i++) {
        // Update to uploading
        setUploadState((prev) => {
          const updated = [...prev.uploadProgress];
          updated[i] = { ...updated[i], status: 'uploading' };
          return { ...prev, uploadProgress: updated };
        });

        try {
          const formData = new FormData();
          formData.append('file', allFiles[i]);
          const uploadRes = await fetch(`/api/cases/${createdCase.id}/documents`, {
            method: 'POST',
            body: formData,
          });

          if (uploadRes.ok) {
            const uploadData = await uploadRes.json();

            // If this is the pro bono file and we need to update proBonoProof on the case
            if (wizardData.proBonoFile && i === allFiles.length - 1 && wizardData.serviceType === 'PRO_BONO') {
              // proBonoProof was already set from the pre-uploaded URL or we save the doc URL
              // The URL was already stored when creating the case if it was pre-uploaded
            }

            setUploadState((prev) => {
              const updated = [...prev.uploadProgress];
              updated[i] = { ...updated[i], status: 'done' };
              return { ...prev, uploadProgress: updated };
            });
          } else {
            failCount++;
            setUploadState((prev) => {
              const updated = [...prev.uploadProgress];
              updated[i] = { ...updated[i], status: 'error' };
              return { ...prev, uploadProgress: updated, failedCount: prev.failedCount + 1 };
            });
          }
        } catch {
          failCount++;
          setUploadState((prev) => {
            const updated = [...prev.uploadProgress];
            updated[i] = { ...updated[i], status: 'error' };
            return { ...prev, uploadProgress: updated, failedCount: prev.failedCount + 1 };
          });
        }
      }

      if (failCount === 0) {
        setUploadState((prev) => ({ ...prev, phase: 'done' }));
        notify('Pengajuan berhasil dikirim!', 'success');
      } else {
        setUploadState((prev) => ({ ...prev, phase: 'partial_fail' }));
      }
    } catch (err) {
      console.error('Submit error:', err);
      notify('Terjadi kesalahan. Silakan coba lagi.', 'error');
      setUploadState((prev) => ({ ...prev, phase: 'idle' }));
    }
    setSubmitting(false);
  };

  // ─── Retry failed uploads ───────────────
  const handleRetryUploads = async () => {
    if (!uploadState.createdCase) return;
    setSubmitting(true);

    const allFiles = [...wizardData.documents];
    if (wizardData.proBonoFile) allFiles.push(wizardData.proBonoFile);

    let failCount = 0;
    const updatedProgress = [...uploadState.uploadProgress];

    for (let i = 0; i < allFiles.length; i++) {
      if (updatedProgress[i].status !== 'error') continue;

      updatedProgress[i] = { ...updatedProgress[i], status: 'uploading' };
      setUploadState((prev) => ({ ...prev, uploadProgress: [...updatedProgress] }));

      try {
        const formData = new FormData();
        formData.append('file', allFiles[i]);
        const res = await fetch(`/api/cases/${uploadState.createdCase.id}/documents`, {
          method: 'POST',
          body: formData,
        });
        if (res.ok) {
          updatedProgress[i] = { ...updatedProgress[i], status: 'done' };
        } else {
          updatedProgress[i] = { ...updatedProgress[i], status: 'error' };
          failCount++;
        }
      } catch {
        updatedProgress[i] = { ...updatedProgress[i], status: 'error' };
        failCount++;
      }
      setUploadState((prev) => ({ ...prev, uploadProgress: [...updatedProgress] }));
    }

    if (failCount === 0) {
      setUploadState((prev) => ({ ...prev, phase: 'done', failedCount: 0 }));
      notify('Semua dokumen berhasil diunggah!', 'success');
    } else {
      setUploadState((prev) => ({ ...prev, failedCount: failCount }));
    }
    setSubmitting(false);
  };

  // ─── File handlers ──────────────────────
  const handleFileAdd = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    updateWizard({ documents: [...wizardData.documents, ...files] });
    e.target.value = '';
  };

  const handleFileRemove = (index) => {
    updateWizard({ documents: wizardData.documents.filter((_, i) => i !== index) });
  };

  const handleProBonoFile = (e) => {
    const file = e.target.files?.[0];
    if (file) updateWizard({ proBonoFile: file });
    e.target.value = '';
  };

  // ─── Navigation ─────────────────────────
  const goNext = () => { if (canProceed() && step < 6) setStep(step + 1); };
  const goBack = () => { if (step > 1) setStep(step - 1); };

  // ─── RENDER ─────────────────────────────
  return (
    <div className="wizard-container" style={{ maxWidth: 900, margin: '0 auto' }}>
      {/* Stepper Header */}
      <div className="wizard-stepper">
        {STEP_TITLES.map((title, i) => {
          const stepNum = i + 1;
          const isActive = step === stepNum;
          const isDone = step > stepNum;
          return (
            <div
              key={stepNum}
              className={`wizard-step-indicator ${isActive ? 'active' : ''} ${isDone ? 'done' : ''}`}
            >
              <div className="wizard-step-circle">
                {isDone ? <Check size={14} /> : stepNum}
              </div>
              <span className="wizard-step-label">{title}</span>
            </div>
          );
        })}
      </div>

      {/* Step Content */}
      <div className="wizard-content">

        {/* ═══════ STEP 1: Pilih Layanan ═══════ */}
        {step === 1 && (
          <div className="wizard-step-panel" id="step-service">
            <h2 className="wizard-step-title">Pilih Jenis Layanan</h2>
            <p className="wizard-step-desc">Pilih jenis layanan hukum yang Anda butuhkan.</p>
            <div className="service-pick-grid">
              {SERVICES.map((svc) => {
                const Icon = svc.icon;
                const selected = wizardData.serviceType === svc.key;
                return (
                  <button
                    key={svc.key}
                    className={`service-pick-card ${selected ? 'selected' : ''}`}
                    onClick={() => updateWizard({ serviceType: svc.key, consultantId: null, consultantName: '' })}
                    type="button"
                    id={`svc-${svc.key}`}
                  >
                    <div className="service-pick-icon" style={{ '--svc-color': svc.color }}>
                      <Icon size={22} />
                    </div>
                    <strong>{svc.label}</strong>
                    <p>{svc.desc}</p>
                    {selected && (
                      <div className="service-pick-check">
                        <Check size={16} />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ═══════ STEP 2: Detail Kasus ═══════ */}
        {step === 2 && (
          <div className="wizard-step-panel" id="step-detail">
            <h2 className="wizard-step-title">Detail Kasus</h2>
            <p className="wizard-step-desc">Isi judul singkat dan kronologi kasus Anda.</p>
            <div className="wizard-form">
              <label className="wizard-label">
                Judul Kasus
                <input
                  type="text"
                  className="wizard-input"
                  value={wizardData.title}
                  onChange={(e) => updateWizard({ title: e.target.value })}
                  placeholder="Contoh: Sengketa tanah warisan keluarga"
                  id="case-title"
                  maxLength={200}
                />
                <span className="wizard-hint">{wizardData.title.trim().length}/5 karakter minimum</span>
              </label>
              <label className="wizard-label">
                Kronologi / Deskripsi
                <textarea
                  className="wizard-textarea"
                  value={wizardData.description}
                  onChange={(e) => updateWizard({ description: e.target.value })}
                  placeholder="Jelaskan kronologi dan permasalahan hukum yang Anda alami secara detail..."
                  id="case-desc"
                  rows={6}
                />
                <span className="wizard-hint">{wizardData.description.trim().length}/20 karakter minimum</span>
              </label>
            </div>
          </div>
        )}

        {/* ═══════ STEP 3: Pilih Konsultan ═══════ */}
        {step === 3 && (
          <div className="wizard-step-panel" id="step-consultant">
            <h2 className="wizard-step-title">Pilih Konsultan</h2>
            <p className="wizard-step-desc">Pilih konsultan yang akan menangani kasus Anda.</p>
            {loadingConsultants ? (
              <div className="wizard-loading">
                <Loader2 className="spin-icon" size={28} />
                <span>Memuat daftar konsultan...</span>
              </div>
            ) : consultants.length === 0 ? (
              <div className="wizard-empty">
                <Users size={40} />
                <p>Belum ada konsultan tersedia saat ini.</p>
              </div>
            ) : (
              <div className="consultant-pick-grid">
                {consultants.map((c) => {
                  const selected = wizardData.consultantId === c.id;
                  const disabled = !c.isAvailable;
                  return (
                    <button
                      key={c.id}
                      className={`consultant-pick-card ${selected ? 'selected' : ''} ${disabled ? 'unavailable' : ''}`}
                      onClick={() => {
                        if (disabled) return;
                        updateWizard({
                          consultantId: c.id,
                          consultantName: c.name,
                          selectedDate: '',
                          selectedSlot: '',
                          scheduledAt: null,
                        });
                      }}
                      type="button"
                      disabled={disabled}
                      id={`consultant-${c.id}`}
                    >
                      {disabled && (
                        <div className="unavailable-badge">Sedang Tidak Tersedia</div>
                      )}
                      <div className="consultant-avatar-area">
                        {c.photoUrl ? (
                          <img src={c.photoUrl} alt={c.name} className="consultant-photo" />
                        ) : (
                          <div className="consultant-avatar-fallback">
                            <User size={28} />
                          </div>
                        )}
                      </div>
                      <div className="consultant-info">
                        <strong className="consultant-name">{c.name}</strong>
                        <span className={`consultant-type-badge ${c.type === 'ADVOKAT' ? 'advokat' : 'pp'}`}>
                          {c.type === 'ADVOKAT' ? 'Advokat' : 'Pengacara Publik'}
                        </span>
                        {c.specialization?.length > 0 && (
                          <div className="consultant-specs">
                            {c.specialization.slice(0, 3).map((s, i) => (
                              <span key={i} className="spec-tag">{s}</span>
                            ))}
                          </div>
                        )}
                        {c.bio && (
                          <p className="consultant-bio-snippet">
                            {c.bio.length > 100 ? c.bio.substring(0, 100) + '...' : c.bio}
                          </p>
                        )}
                      </div>
                      {selected && (
                        <div className="consultant-check">
                          <Check size={16} />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ═══════ STEP 4: Pilih Jadwal ═══════ */}
        {step === 4 && (
          <div className="wizard-step-panel" id="step-schedule">
            <h2 className="wizard-step-title">Pilih Jadwal</h2>
            <p className="wizard-step-desc">
              Pilih tanggal dan waktu konsultasi dengan {wizardData.consultantName || 'konsultan'}.
            </p>

            <div className="schedule-pick-layout">
              {/* Date Picker */}
              <div className="schedule-date-section">
                <label className="wizard-label">
                  <Calendar size={16} style={{ marginRight: 6 }} />
                  Tanggal
                  <input
                    type="date"
                    className="wizard-input"
                    value={wizardData.selectedDate}
                    min={getDateMin()}
                    max={getDateMax()}
                    onChange={(e) => {
                      updateWizard({ selectedDate: e.target.value, selectedSlot: '', scheduledAt: null });
                    }}
                    id="schedule-date"
                  />
                </label>
              </div>

              {/* Mode Picker */}
              <div className="schedule-mode-section">
                <span className="wizard-label-text">Mode Konsultasi</span>
                <div className="mode-toggle">
                  <button
                    type="button"
                    className={`mode-btn ${wizardData.mode === 'online' ? 'active' : ''}`}
                    onClick={() => updateWizard({ mode: 'online', location: '' })}
                    id="mode-online"
                  >
                    <Monitor size={16} /> Online
                  </button>
                  <button
                    type="button"
                    className={`mode-btn ${wizardData.mode === 'offline' ? 'active' : ''}`}
                    onClick={() => updateWizard({ mode: 'offline' })}
                    id="mode-offline"
                  >
                    <Building size={16} /> Tatap Muka
                  </button>
                </div>
                {wizardData.mode === 'offline' && (
                  <label className="wizard-label" style={{ marginTop: 12 }}>
                    <MapPin size={14} style={{ marginRight: 6 }} />
                    Lokasi (opsional)
                    <input
                      type="text"
                      className="wizard-input"
                      value={wizardData.location}
                      onChange={(e) => updateWizard({ location: e.target.value })}
                      placeholder="Contoh: Kantor LBH STHM, Jakarta"
                      id="schedule-location"
                    />
                  </label>
                )}
              </div>

              {/* Slot Picker */}
              {wizardData.selectedDate && (
                <div className="schedule-slots-section">
                  <span className="wizard-label-text">
                    <Clock size={16} style={{ marginRight: 6 }} />
                    Pilih Waktu
                  </span>
                  {loadingSlots ? (
                    <div className="wizard-loading small">
                      <Loader2 className="spin-icon" size={20} />
                      <span>Memuat slot...</span>
                    </div>
                  ) : slots.length === 0 ? (
                    <div className="wizard-empty small">
                      <p>Tidak ada slot tersedia pada tanggal ini.</p>
                    </div>
                  ) : (
                    <div className="slot-grid">
                      {slots.map((slot) => {
                        const selected = wizardData.selectedSlot === slot.time;
                        return (
                          <button
                            key={slot.time}
                            type="button"
                            className={`slot-btn ${selected ? 'selected' : ''} ${!slot.available ? 'booked' : ''}`}
                            disabled={!slot.available}
                            onClick={() => {
                              updateWizard({
                                selectedSlot: slot.time,
                                scheduledAt: `${wizardData.selectedDate}T${slot.time}:00`,
                              });
                            }}
                            id={`slot-${slot.time.replace(':', '')}`}
                          >
                            {slot.time}
                            {!slot.available && <span className="slot-booked-label">Terisi</span>}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ═══════ STEP 5: Upload Dokumen ═══════ */}
        {step === 5 && (
          <div className="wizard-step-panel" id="step-upload">
            <h2 className="wizard-step-title">Unggah Bukti Kesediaan & Kesungguhan</h2>
            <p className="wizard-step-desc">
              Untuk memastikan keseriusan pengajuan, mohon unggah dokumen pendukung
              (identitas diri dan/atau surat pernyataan kesediaan mengikuti proses bantuan hukum).
            </p>

            <div className="upload-zone">
              <div className="upload-area">
                <Upload size={32} />
                <p>Pilih file untuk diunggah</p>
                <span>PDF, JPG, PNG, DOC — maks 10MB per file</span>
                <input
                  type="file"
                  multiple
                  onChange={handleFileAdd}
                  className="upload-input"
                  id="doc-upload-input"
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                />
              </div>

              {wizardData.documents.length > 0 && (
                <div className="upload-file-list">
                  {wizardData.documents.map((f, i) => (
                    <div key={i} className="upload-file-item">
                      <FileText size={16} />
                      <span className="upload-file-name">{f.name}</span>
                      <span className="upload-file-size">{(f.size / 1024).toFixed(0)} KB</span>
                      <button
                        type="button"
                        className="upload-file-remove"
                        onClick={() => handleFileRemove(i)}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {wizardData.documents.length === 0 && (
                <div className="upload-warning">
                  <AlertCircle size={16} />
                  <span>Minimal 1 dokumen wajib diunggah sebelum melanjutkan.</span>
                </div>
              )}
            </div>

            {/* Pro Bono additional upload */}
            {wizardData.serviceType === 'PRO_BONO' && (
              <div className="pro-bono-upload">
                <h3>Bukti Kelayakan (SKTM/Surat Pernyataan)</h3>
                <p>
                  Khusus layanan Pro Bono, wajib melampirkan Surat Keterangan Tidak Mampu
                  (SKTM) atau surat pernyataan kelayakan.
                </p>
                <div className="upload-area pro-bono">
                  <Upload size={24} />
                  <p>Pilih file bukti kelayakan</p>
                  <input
                    type="file"
                    onChange={handleProBonoFile}
                    className="upload-input"
                    id="probono-upload-input"
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  />
                </div>
                {wizardData.proBonoFile && (
                  <div className="upload-file-item" style={{ marginTop: 8 }}>
                    <FileText size={16} />
                    <span className="upload-file-name">{wizardData.proBonoFile.name}</span>
                    <span className="upload-file-size">{(wizardData.proBonoFile.size / 1024).toFixed(0)} KB</span>
                    <button
                      type="button"
                      className="upload-file-remove"
                      onClick={() => updateWizard({ proBonoFile: null })}
                    >
                      ×
                    </button>
                  </div>
                )}
                {!wizardData.proBonoFile && (
                  <div className="upload-warning">
                    <AlertCircle size={16} />
                    <span>Bukti kelayakan wajib diunggah untuk layanan Pro Bono.</span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ═══════ STEP 6: Review & Submit ═══════ */}
        {step === 6 && (
          <div className="wizard-step-panel" id="step-submit">
            {uploadState.phase === 'idle' && (
              <>
                <h2 className="wizard-step-title">Ringkasan Pengajuan</h2>
                <p className="wizard-step-desc">Periksa kembali data pengajuan Anda sebelum mengirim.</p>
                <div className="review-grid">
                  <div className="review-card">
                    <span className="review-label">Jenis Layanan</span>
                    <strong>{SERVICES.find((s) => s.key === wizardData.serviceType)?.label || '-'}</strong>
                  </div>
                  <div className="review-card">
                    <span className="review-label">Judul Kasus</span>
                    <strong>{wizardData.title}</strong>
                  </div>
                  <div className="review-card full">
                    <span className="review-label">Deskripsi</span>
                    <p className="review-desc">{wizardData.description}</p>
                  </div>
                  <div className="review-card">
                    <span className="review-label">Konsultan</span>
                    <strong>{wizardData.consultantName || '-'}</strong>
                  </div>
                  <div className="review-card">
                    <span className="review-label">Jadwal</span>
                    <strong>
                      {wizardData.selectedDate
                        ? new Intl.DateTimeFormat('id-ID', { dateStyle: 'long' }).format(new Date(wizardData.selectedDate))
                        : '-'}
                      {' '}{wizardData.selectedSlot || ''}
                    </strong>
                  </div>
                  <div className="review-card">
                    <span className="review-label">Mode</span>
                    <strong>{wizardData.mode === 'online' ? 'Online' : 'Tatap Muka'}</strong>
                    {wizardData.mode === 'offline' && wizardData.location && (
                      <span className="review-sub">{wizardData.location}</span>
                    )}
                  </div>
                  <div className="review-card">
                    <span className="review-label">Dokumen</span>
                    <strong>{wizardData.documents.length} file</strong>
                    {wizardData.serviceType === 'PRO_BONO' && wizardData.proBonoFile && (
                      <span className="review-sub">+ 1 bukti kelayakan</span>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* Submitting state */}
            {uploadState.phase === 'submitting' && (
              <div className="wizard-submitting">
                <Loader2 className="spin-icon" size={40} />
                <h3>Membuat pengajuan...</h3>
                <p>Sedang membuat kasus dan menjadwalkan konsultasi.</p>
              </div>
            )}

            {/* Uploading state */}
            {(uploadState.phase === 'uploading' || uploadState.phase === 'partial_fail') && (
              <div className="wizard-uploading">
                {uploadState.phase === 'uploading' && <Loader2 className="spin-icon" size={32} />}
                <h3>
                  {uploadState.phase === 'partial_fail'
                    ? `Kasus berhasil dibuat (kode: ${uploadState.createdCase?.code})`
                    : 'Mengunggah dokumen...'}
                </h3>
                {uploadState.phase === 'partial_fail' && (
                  <p className="upload-fail-notice">
                    <AlertCircle size={16} />
                    {uploadState.uploadProgress.filter((p) => p.status === 'error').length} dari{' '}
                    {uploadState.uploadProgress.length} dokumen gagal diunggah.
                  </p>
                )}
                <div className="upload-progress-list">
                  {uploadState.uploadProgress.map((item, i) => (
                    <div key={i} className={`upload-progress-item ${item.status}`}>
                      {item.status === 'uploading' && <Loader2 className="spin-icon" size={14} />}
                      {item.status === 'done' && <Check size={14} />}
                      {item.status === 'error' && <AlertCircle size={14} />}
                      {item.status === 'pending' && <Clock size={14} />}
                      <span>{item.name}</span>
                      <span className="upload-progress-status">
                        {item.status === 'pending' && 'Menunggu'}
                        {item.status === 'uploading' && 'Mengunggah...'}
                        {item.status === 'done' && 'Berhasil'}
                        {item.status === 'error' && 'Gagal'}
                      </span>
                    </div>
                  ))}
                </div>
                {uploadState.phase === 'partial_fail' && (
                  <button
                    type="button"
                    className="button primary"
                    onClick={handleRetryUploads}
                    disabled={submitting}
                    id="btn-retry-upload"
                    style={{ marginTop: 16 }}
                  >
                    {submitting ? 'Mencoba ulang...' : 'Coba Upload Ulang'}
                  </button>
                )}
              </div>
            )}

            {/* Done state */}
            {uploadState.phase === 'done' && (
              <div className="wizard-done" style={{ textAlign: 'center', padding: '40px 20px' }}>
                <div className="wizard-done-icon" style={{ display: 'inline-flex', justifyContent: 'center', alignItems: 'center', width: 64, height: 64, borderRadius: '50%', background: '#dcfce7', color: '#16a34a', marginBottom: 24 }}>
                  <Check size={32} strokeWidth={3} />
                </div>
                <h3 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Pengajuan Berhasil!</h3>
                <p style={{ color: '#4b5563', marginBottom: 32 }}>
                  Simpan kode ini untuk referensi. Anda juga bisa selalu melihat kasus ini dari dashboard Anda.
                </p>

                <div style={{ background: '#f9fafb', border: '1px dashed #d1d5db', borderRadius: 12, padding: 24, marginBottom: 32, maxWidth: 400, margin: '0 auto 32px' }}>
                  <p style={{ fontSize: 13, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8, fontWeight: 600 }}>Kode Kasus Anda</p>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
                    <span style={{ fontSize: 28, fontWeight: 800, color: 'var(--primary, #3b4a2e)', letterSpacing: '0.02em' }}>
                      {uploadState.createdCase?.code}
                    </span>
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(uploadState.createdCase?.code || '');
                        notify('Kode disalin!', 'success');
                      }}
                      style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36, borderRadius: 8, border: 'none', background: '#e5e7eb', color: '#4b5563', cursor: 'pointer' }}
                      title="Salin Kode"
                    >
                      <Copy size={18} />
                    </button>
                  </div>
                </div>

                <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 20, textAlign: 'left', marginBottom: 32, maxWidth: 500, margin: '0 auto 32px' }}>
                  <h4 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16, borderBottom: '1px solid #f3f4f6', paddingBottom: 8 }}>Ringkasan Pengajuan</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: 12, fontSize: 14 }}>
                    <div style={{ color: '#6b7280' }}>Layanan</div>
                    <div style={{ fontWeight: 500 }}>{SERVICES.find((s) => s.key === uploadState.createdCase?.serviceType)?.label || wizardData.serviceType}</div>
                    
                    <div style={{ color: '#6b7280' }}>Konsultan</div>
                    <div style={{ fontWeight: 500 }}>{wizardData.consultantName}</div>
                    
                    <div style={{ color: '#6b7280' }}>Jadwal</div>
                    <div style={{ fontWeight: 500 }}>
                      {wizardData.selectedDate ? new Intl.DateTimeFormat('id-ID', { dateStyle: 'long' }).format(new Date(wizardData.selectedDate)) : ''} {wizardData.selectedSlot}
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => router.push(`/customer/kasus/${uploadState.createdCase.id}`)}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 24px', borderRadius: 8, background: 'var(--primary, #3b4a2e)', color: '#fff', fontWeight: 600, fontSize: 15, border: 'none', cursor: 'pointer' }}
                >
                  Lihat Detail Kasus <ArrowRight size={18} />
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      {uploadState.phase === 'idle' && (
        <div className="wizard-nav">
          {step > 1 && (
            <button type="button" className="button secondary" onClick={goBack} id="btn-prev">
              <ArrowLeft size={16} /> Kembali
            </button>
          )}
          <div style={{ flex: 1 }} />
          {step < 6 && (
            <button
              type="button"
              className="button primary"
              onClick={goNext}
              disabled={!canProceed()}
              id="btn-next"
            >
              Lanjut <ArrowRight size={16} />
            </button>
          )}
          {step === 6 && (
            <button
              type="button"
              className="button primary"
              onClick={handleSubmit}
              disabled={submitting}
              id="btn-submit"
            >
              {submitting ? (
                <><Loader2 className="spin-icon" size={16} /> Mengirim...</>
              ) : (
                <><Check size={16} /> Kirim Pengajuan</>
              )}
            </button>
          )}
        </div>
      )}

      {/* Toast */}
      {notice.text && (
        <div className={`wizard-toast ${notice.type}`}>
          {notice.type === 'error' && <AlertCircle size={16} />}
          {notice.type === 'success' && <Check size={16} />}
          {notice.text}
        </div>
      )}
    </div>
  );
}
