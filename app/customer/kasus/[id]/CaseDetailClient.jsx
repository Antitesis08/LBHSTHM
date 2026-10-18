'use client';

import { useState } from 'react';
import {
  ArrowLeft,
  FileText,
  ClipboardList,
  Copy,
  Download,
  FileCheck,
  Clock,
  CheckCircle2,
  Calendar,
  Scale,
  Plus,
  Send,
  ShieldAlert,
  Gavel,
  UserCheck,
  X,
  MapPin,
  FileSignature
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import CaseStepper from '../../../../src/components/CaseStepper';
import DocumentList from '../../../../src/components/DocumentList';
import DocumentUploader from '../../../../src/components/DocumentUploader';
import GenerateDocumentModal from '../../../../src/components/GenerateDocumentModal';
import ChatThread from '../../../../src/components/ChatThread';

const LITIGATION_STAGES = [
  'Penyelidikan / Pemeriksaan Awal (BAP)',
  'Penyusunan Surat Gugatan / Bantahan',
  'Pendaftaran Perkara di Pengadilan',
  'Sidang I - Mediasi Pengadilan',
  'Sidang Pembacaan Gugatan / Dakwaan',
  'Sidang Jawaban / Eksepsi',
  'Sidang Replik & Duplik',
  'Sidang Pembuktian & Saksi',
  'Sidang Kesimpulan / Nota Pembelaan (Pledoi)',
  'Sidang Pembacaan Putusan (Inkracht)',
  'Pelaksanaan Putusan (Eksekusi / Damai)'
];

export default function CaseDetailClient({ caseData, user, role }) {
  const router = useRouter();
  const [currentCase, setCurrentCase] = useState(caseData);
  const [docs, setDocs] = useState(caseData.documents || []);
  const [hearings, setHearings] = useState(caseData.hearings || []);
  const [activeTab, setActiveTab] = useState('layanan');
  const [showGenerate, setShowGenerate] = useState(false);
  const [showAddHearing, setShowAddHearing] = useState(false);
  const [notice, setNotice] = useState('');
  const [downloadingId, setDownloadingId] = useState(null);

  // Consultant workspace states
  const [notesInput, setNotesInput] = useState(caseData.consultationNotes || '');
  const [savingNotes, setSavingNotes] = useState(false);
  const [finishingCase, setFinishingCase] = useState(false);
  const [currentStage, setCurrentStage] = useState(caseData.litigationStage || LITIGATION_STAGES[0]);

  // New hearing form state
  const [newHearing, setNewHearing] = useState({
    title: '',
    date: new Date().toISOString().split('T')[0],
    stage: currentStage,
    location: 'Pengadilan Negeri Jakarta Timur',
    notes: ''
  });
  const [savingHearing, setSavingHearing] = useState(false);

  const notify = (msg) => {
    setNotice(msg);
    setTimeout(() => setNotice(''), 4500);
  };

  const serviceLabel = (s) => (s ? s.replaceAll('_', ' ') : 'Menunggu Rapat LBH');

  const handleUploaded = (doc) => {
    setDocs((prev) => [doc, ...prev]);
  };

  const handleGenerated = (doc) => {
    setDocs((prev) => [doc, ...prev]);
    setShowGenerate(false);
    notify(`Dokumen resmi "${doc.fileName}" berhasil dibuat.`);
  };

  const handleDownloadDoc = async (doc) => {
    setDownloadingId(doc.id);
    try {
      const res = await fetch(`/api/documents/${doc.id}/download`);
      const data = await res.json();
      if (res.ok) {
        window.open(data.url, '_blank');
      } else {
        notify(`Gagal: ${data.error}`);
      }
    } catch {
      notify('Gagal mengunduh dokumen.');
    } finally {
      setDownloadingId(null);
    }
  };

  // Save consultation advice / notes (for consultant)
  const handleSaveNotes = async () => {
    setSavingNotes(true);
    try {
      const res = await fetch(`/api/cases/${caseData.id}/process`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          consultationNotes: notesInput,
          litigationStage: currentStage
        })
      });
      const data = await res.json();
      if (res.ok) {
        setCurrentCase((prev) => ({
          ...prev,
          consultationNotes: notesInput,
          status: prev.status === 'DITUGASKAN' ? 'PROSES' : prev.status
        }));
        notify('Catatan arahan hukum berhasil disimpan & dikirim ke klien.');
      } else {
        notify(`Gagal: ${data.error}`);
      }
    } catch {
      notify('Gagal menyimpan catatan.');
    } finally {
      setSavingNotes(false);
    }
  };

  // Add Hearing (for consultant)
  const handleAddHearing = async (e) => {
    e.preventDefault();
    if (!newHearing.title || !newHearing.date) {
      notify('Judul agenda dan tanggal wajib diisi.');
      return;
    }

    setSavingHearing(true);
    try {
      const res = await fetch(`/api/cases/${caseData.id}/hearings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newHearing)
      });
      const data = await res.json();
      if (res.ok) {
        setHearings((prev) => [...prev, data.hearing].sort((a, b) => new Date(a.date) - new Date(b.date)));
        setCurrentCase((prev) => ({
          ...prev,
          status: prev.status === 'DITUGASKAN' ? 'PROSES' : prev.status,
          litigationStage: newHearing.stage
        }));
        setShowAddHearing(false);
        setNewHearing({
          title: '',
          date: new Date().toISOString().split('T')[0],
          stage: currentStage,
          location: 'Pengadilan Negeri Jakarta Timur',
          notes: ''
        });
        notify('Agenda sidang/pendampingan berhasil ditambahkan.');
      } else {
        notify(`Gagal: ${data.error}`);
      }
    } catch {
      notify('Gagal menambahkan agenda.');
    } finally {
      setSavingHearing(false);
    }
  };

  // Finish case
  const handleFinishCase = async () => {
    if (!confirm('Apakah Anda yakin ingin menyelesaikan penanganan perkara ini? Status akan diubah menjadi SELESAI.')) return;
    setFinishingCase(true);
    try {
      const res = await fetch(`/api/cases/${caseData.id}/process`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'SELESAI' })
      });
      const data = await res.json();
      if (res.ok) {
        setCurrentCase((prev) => ({ ...prev, status: 'SELESAI' }));
        notify('Penanganan perkara resmi SELESAI.');
      } else {
        notify(`Gagal: ${data.error}`);
      }
    } catch {
      notify('Gagal menyelesaikan perkara.');
    } finally {
      setFinishingCase(false);
    }
  };

  // Find Legal Opinion document
  const legalOpinionDoc = docs.find(
    (d) =>
      d.fileName?.toLowerCase().includes('legal_opinion') ||
      (d.source === 'CONSULTANT_GENERATED' && d.isGenerated && d.fileName?.toLowerCase().includes('legal'))
  );

  // Find Surat Kuasa document
  const suratKuasaDoc = docs.find(
    (d) => d.fileName?.toLowerCase().includes('surat_kuasa') || d.fileName?.toLowerCase().includes('skk')
  );

  const isConsultationService =
    currentCase.serviceType === 'KONSULTASI_HUKUM' || currentCase.serviceType === 'LEGAL_OPINION';
  const isLitigationService =
    currentCase.serviceType === 'PENDAMPINGAN_HUKUM' ||
    currentCase.serviceType === 'MEDIASI' ||
    currentCase.serviceType === 'PRO_BONO';

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', paddingBottom: 60 }}>
      {/* Back button */}
      <button
        onClick={() => router.back()}
        style={{
          display: 'flex', alignItems: 'center', gap: 6, background: 'none',
          border: 'none', cursor: 'pointer', fontSize: 13, color: '#657068',
          marginBottom: 16, padding: 0,
        }}
      >
        <ArrowLeft size={16} /> Kembali
      </button>

      {/* Case Header Card */}
      <div style={{
        background: '#fff', borderRadius: 12, padding: '24px 28px',
        border: '1px solid var(--line, #e2e6e3)', marginBottom: 20,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <p style={{ fontSize: 18, color: 'var(--primary, #3b4a2e)', fontWeight: 800, letterSpacing: '0.04em', background: '#f0fdf4', padding: '6px 14px', borderRadius: 8, border: '1px solid #bbf7d0', margin: 0 }}>
                {currentCase.code}
              </p>
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(currentCase.code);
                  notify('Kode disalin!');
                }}
                style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32, borderRadius: 6, border: 'none', background: '#f3f4f6', color: '#6b7280', cursor: 'pointer' }}
                title="Salin Kode"
              >
                <Copy size={16} />
              </button>
            </div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1a1f1b', marginBottom: 8, lineHeight: 1.3 }}>
              {currentCase.title}
            </h1>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{
                display: 'inline-block', fontSize: 12, padding: '4px 10px',
                borderRadius: 6, background: currentCase.serviceType ? '#f0fdf4' : '#fef3c7',
                color: currentCase.serviceType ? '#16a34a' : '#92400e',
                fontWeight: 600,
              }}>
                {currentCase.serviceType ? `Layanan: ${serviceLabel(currentCase.serviceType)}` : 'Layanan: Menunggu Penetapan Rapat LBH'}
              </span>
              {currentCase.litigationStage && isLitigationService && (
                <span style={{
                  display: 'inline-block', fontSize: 12, padding: '4px 10px',
                  borderRadius: 6, background: '#eff6ff', color: '#1d4ed8', fontWeight: 600
                }}>
                  Tahapan: {currentCase.litigationStage}
                </span>
              )}
            </div>
          </div>
          <div style={{ textAlign: 'right', fontSize: 12, color: '#657068' }}>
            <div>Diajukan: {new Intl.DateTimeFormat('id-ID', { dateStyle: 'long' }).format(new Date(currentCase.createdAt))}</div>
          </div>
        </div>

        {/* Assigned Consultant & Sprin Banner */}
        {currentCase.consultant && (
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap',
            gap: 12, marginTop: 18, padding: '12px 16px', background: '#f8fafc',
            borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#3b4a2e', color: '#fff', display: 'grid', placeItems: 'center', fontWeight: 700, fontSize: 13 }}>
                <UserCheck size={18} />
              </div>
              <div>
                <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
                  Kuasa Hukum / Konsultan Ditunjuk
                </span>
                <div style={{ fontWeight: 700, color: '#0f172a' }}>
                  {currentCase.consultant.name} ({currentCase.consultant.type === 'ADVOKAT' ? 'Advokat Publik' : 'Konsultan LKBH'})
                </div>
              </div>
            </div>

            {currentCase.sprinNumber && (
              <div style={{ background: '#fff', padding: '6px 12px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 12 }}>
                <span style={{ color: '#64748b' }}>Dasar Penugasan: </span>
                <strong style={{ color: '#1e293b' }}>{currentCase.sprinNumber}</strong>
              </div>
            )}
          </div>
        )}

        {/* Client info when seen by Consultant / Admin */}
        {(role === 'CONSULTANT' || role === 'ADMIN') && currentCase.client && (
          <div style={{
            display: 'flex', gap: 10, alignItems: 'center', marginTop: 12,
            padding: '10px 14px', background: '#f9fafb', borderRadius: 8, fontSize: 13,
          }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#e2e6e3', display: 'grid', placeItems: 'center', fontWeight: 600, fontSize: 12 }}>
              {currentCase.client.name?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
            </div>
            <div>
              <strong>Klien: {currentCase.client.name}</strong>
              <span style={{ display: 'block', fontSize: 11, color: '#64748b' }}>{currentCase.client.email} {currentCase.client.phone ? `· ${currentCase.client.phone}` : ''}</span>
            </div>
          </div>
        )}
      </div>

      {/* SPOTLIGHT: Legal Opinion Document */}
      {legalOpinionDoc ? (
        <div style={{
          background: 'linear-gradient(135deg, #f0fdf4 0%, #eff6ff 100%)',
          borderRadius: 12, padding: '20px 24px', border: '1px solid #86efac',
          marginBottom: 20, display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', flexWrap: 'wrap', gap: 16,
          boxShadow: '0 4px 14px rgba(22, 163, 74, 0.08)'
        }}>
          <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
            <div style={{ width: 44, height: 44, borderRadius: 10, background: '#16a34a', color: '#fff', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
              <FileCheck size={24} />
            </div>
            <div>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#15803d', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                PERMOHONAN DISETUJUI (ACC OLEH LKBH)
              </span>
              <h3 style={{ margin: '2px 0 4px', fontSize: 16, fontWeight: 700, color: '#0f172a' }}>
                Dokumen Legal Opinion Resmi Tersedia
              </h3>
              <p style={{ margin: 0, fontSize: 13, color: '#334155' }}>
                Perkara Anda telah dinyatakan layak menerima bantuan hukum berupa: <strong>{serviceLabel(currentCase.serviceType)}</strong>.
              </p>
            </div>
          </div>
          <button
            onClick={() => handleDownloadDoc(legalOpinionDoc)}
            disabled={downloadingId === legalOpinionDoc.id}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: '#16a34a', color: '#fff', border: 'none',
              padding: '10px 18px', borderRadius: 8, fontWeight: 600,
              fontSize: 13, cursor: 'pointer', boxShadow: '0 2px 8px rgba(22, 163, 74, 0.25)'
            }}
          >
            <Download size={16} /> {downloadingId === legalOpinionDoc.id ? 'Mengunduh...' : 'Unduh Legal Opinion (PDF)'}
          </button>
        </div>
      ) : currentCase.status === 'DIAJUKAN' ? (
        <div style={{
          background: '#fffbeb', borderRadius: 12, padding: '16px 20px',
          border: '1px solid #fde68a', marginBottom: 20, display: 'flex',
          gap: 12, alignItems: 'center', color: '#92400e'
        }}>
          <Clock size={22} style={{ flexShrink: 0 }} />
          <div style={{ fontSize: 13, lineHeight: 1.5 }}>
            <strong>Status Pengajuan: DIAJUKAN (Menunggu Rapat Tim LBH STHM)</strong>
            <span style={{ display: 'block', marginTop: 2, color: '#b45309' }}>
              Uraian kronologi dan dokumen kelayakan Anda sedang dirapatkan oleh tim LBH STHM. Dokumen <strong>Legal Opinion</strong> akan otomatis muncul di sini setelah rapat selesai disetujui.
            </span>
          </div>
        </div>
      ) : null}

      {/* Case Stepper */}
      <div style={{ background: '#fff', borderRadius: 12, padding: '24px 28px', border: '1px solid var(--line, #e2e6e3)', marginBottom: 20 }}>
        <CaseStepper status={currentCase.status} consultant={currentCase.consultant} />
      </div>

      {/* Tab Navigation */}
      <div style={{ display: 'flex', gap: 0, marginBottom: 20, borderBottom: '1px solid var(--line, #e2e6e3)' }}>
        {[
          { key: 'layanan', label: 'Layanan & Pendampingan', icon: Scale },
          { key: 'detail', label: 'Kronologi Kasus', icon: ClipboardList },
          { key: 'dokumen', label: `Dokumen (${docs.length})`, icon: FileText },
          { key: 'pesan', label: 'Pesan / Diskusi', icon: Send },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '12px 20px', fontSize: 13, fontWeight: 500,
              background: 'none', border: 'none', cursor: 'pointer',
              color: activeTab === tab.key ? '#16a34a' : '#657068',
              borderBottom: activeTab === tab.key ? '2px solid #16a34a' : '2px solid transparent',
              transition: 'all 0.2s',
            }}
          >
            <tab.icon size={15} /> {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: LAYANAN & PENDAMPINGAN (The Core Legal Workflow) */}
      {activeTab === 'layanan' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Action header for Consultant */}
          {role === 'CONSULTANT' && (
            <div style={{
              background: '#f8fafc', borderRadius: 12, padding: '18px 24px',
              border: '1px solid #cbd5e1', display: 'flex', justifyContent: 'space-between',
              alignItems: 'center', flexWrap: 'wrap', gap: 12
            }}>
              <div>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>
                  Aksi Konsultan Hukum LKBH
                </span>
                <h4 style={{ margin: '2px 0 0', fontSize: 15, color: '#0f172a' }}>
                  Workspace Penanganan: {serviceLabel(currentCase.serviceType)}
                </h4>
              </div>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <button
                  onClick={() => setShowGenerate(true)}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    padding: '8px 16px', background: '#16a34a', color: '#fff',
                    border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer'
                  }}
                >
                  <FileSignature size={15} /> Buat Dokumen Resmi
                </button>
                {isLitigationService && (
                  <button
                    onClick={() => setShowAddHearing(true)}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: 6,
                      padding: '8px 16px', background: '#3b82f6', color: '#fff',
                      border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer'
                    }}
                  >
                    <Plus size={15} /> Tambah Agenda Sidang
                  </button>
                )}
                {currentCase.status !== 'SELESAI' && (
                  <button
                    onClick={handleFinishCase}
                    disabled={finishingCase}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: 6,
                      padding: '8px 16px', background: '#0f172a', color: '#fff',
                      border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer'
                    }}
                  >
                    <CheckCircle2 size={15} /> {finishingCase ? 'Menyimpan...' : 'Tandai Perkara Selesai'}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* SECTION A: KONSULTASI HUKUM / LEGAL ADVICE */}
          <div style={{ background: '#fff', borderRadius: 12, padding: '24px 28px', border: '1px solid var(--line, #e2e6e3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: '#f0fdf4', color: '#16a34a', display: 'grid', placeItems: 'center' }}>
                  <Scale size={18} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#0f172a' }}>
                    Catatan Rekomendasi & Arahan Konsultan Hukum
                  </h3>
                  <span style={{ fontSize: 12, color: '#64748b' }}>
                    Sesuai SOP-04 Pelayanan Non-Litigasi & Analisis Yuridis LKBH STHM
                  </span>
                </div>
              </div>
            </div>

            {role === 'CONSULTANT' ? (
              <div>
                <textarea
                  value={notesInput}
                  onChange={(e) => setNotesInput(e.target.value)}
                  placeholder="Tuliskan analisis pokok perkara, dasar regulasi, pertimbangan hukum, dan petunjuk langkah konkret yang harus dilakukan klien..."
                  rows={6}
                  style={{
                    width: '100%', padding: '12px 16px', borderRadius: 8,
                    border: '1px solid #cbd5e1', fontSize: 13, lineHeight: 1.6,
                    fontFamily: 'inherit', resize: 'vertical', boxSizing: 'border-box'
                  }}
                />
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 10 }}>
                  <button
                    onClick={handleSaveNotes}
                    disabled={savingNotes}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: 6,
                      padding: '8px 18px', background: '#16a34a', color: '#fff',
                      border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer'
                    }}
                  >
                    <CheckCircle2 size={15} /> {savingNotes ? 'Menyimpan...' : 'Simpan & Publikasikan ke Klien'}
                  </button>
                </div>
              </div>
            ) : (
              <div style={{
                background: currentCase.consultationNotes ? '#f8fafc' : '#f9fafb',
                padding: '16px 20px', borderRadius: 8, border: '1px solid #e2e8f0'
              }}>
                {currentCase.consultationNotes ? (
                  <div style={{ fontSize: 14, color: '#1e293b', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
                    {currentCase.consultationNotes}
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '20px 0', color: '#64748b' }}>
                    <Clock size={28} style={{ margin: '0 auto 8px', color: '#94a3b8' }} />
                    <p style={{ margin: 0, fontSize: 13 }}>
                      Konsultan hukum sedang menyusun catatan telaah yuridis dan arahan resmi untuk perkara Anda.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* SECTION B: PENDAMPINGAN HUKUM / LITIGASI (Surat Kuasa & Timeline Sidang) */}
          {isLitigationService && (
            <>
              {/* Surat Kuasa Khusus Spotlight */}
              <div style={{
                background: '#fff', borderRadius: 12, padding: '24px 28px',
                border: '1px solid var(--line, #e2e6e3)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 8, background: '#eff6ff', color: '#2563eb', display: 'grid', placeItems: 'center' }}>
                      <FileSignature size={20} />
                    </div>
                    <div>
                      <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#0f172a' }}>
                        Surat Kuasa Khusus (SKK)
                      </h3>
                      <p style={{ margin: 0, fontSize: 12, color: '#64748b' }}>
                        Dasar legalitas formil beracara di hadapan pengadilan & penyidik sesuai Lampiran E LKBH STHM.
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 8 }}>
                    {suratKuasaDoc ? (
                      <button
                        onClick={() => handleDownloadDoc(suratKuasaDoc)}
                        disabled={downloadingId === suratKuasaDoc.id}
                        style={{
                          display: 'inline-flex', alignItems: 'center', gap: 6,
                          background: '#2563eb', color: '#fff', border: 'none',
                          padding: '8px 16px', borderRadius: 8, fontWeight: 600, fontSize: 13, cursor: 'pointer'
                        }}
                      >
                        <Download size={15} /> Unduh Surat Kuasa Khusus
                      </button>
                    ) : role === 'CONSULTANT' ? (
                      <button
                        onClick={() => setShowGenerate(true)}
                        style={{
                          display: 'inline-flex', alignItems: 'center', gap: 6,
                          background: '#2563eb', color: '#fff', border: 'none',
                          padding: '8px 16px', borderRadius: 8, fontWeight: 600, fontSize: 13, cursor: 'pointer'
                        }}
                      >
                        <Plus size={15} /> Buat Surat Kuasa Khusus (PDF)
                      </button>
                    ) : (
                      <span style={{ fontSize: 12, color: '#64748b', fontStyle: 'italic' }}>
                        Belum diterbitkan oleh kuasa hukum
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Linimasa Agenda Sidang & Litigasi */}
              <div style={{ background: '#fff', borderRadius: 12, padding: '24px 28px', border: '1px solid var(--line, #e2e6e3)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#0f172a' }}>
                      Linimasa Agenda Sidang & Pendampingan ({hearings.length})
                    </h3>
                    <p style={{ margin: '2px 0 0', fontSize: 12, color: '#64748b' }}>
                      Transparansi tahapan pemeriksaan dan persidangan perkara di peradilan.
                    </p>
                  </div>

                  {role === 'CONSULTANT' && (
                    <button
                      onClick={() => setShowAddHearing(true)}
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: 6,
                        background: '#3b82f6', color: '#fff', border: 'none',
                        padding: '6px 14px', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer'
                      }}
                    >
                      <Plus size={14} /> Tambah Agenda
                    </button>
                  )}
                </div>

                {hearings.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '30px 20px', background: '#f8fafc', borderRadius: 8, border: '1px dashed #cbd5e1' }}>
                    <Calendar size={32} style={{ color: '#94a3b8', margin: '0 auto 8px' }} />
                    <p style={{ margin: 0, fontSize: 13, color: '#64748b', fontWeight: 500 }}>
                      Belum ada agenda sidang atau pemeriksaan yang dijadwalkan.
                    </p>
                    {role === 'CONSULTANT' && (
                      <p style={{ margin: '4px 0 0', fontSize: 12, color: '#94a3b8' }}>
                        Gunakan tombol di atas untuk mencatat jadwal sidang atau pendampingan BAP.
                      </p>
                    )}
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {hearings.map((h, idx) => (
                      <div
                        key={h.id || idx}
                        style={{
                          display: 'flex', gap: 16, padding: '16px 20px',
                          background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0',
                          alignItems: 'flex-start'
                        }}
                      >
                        <div style={{
                          minWidth: 90, textAlign: 'center', padding: '6px 10px',
                          background: '#fff', borderRadius: 6, border: '1px solid #cbd5e1'
                        }}>
                          <div style={{ fontSize: 11, fontWeight: 700, color: '#3b82f6' }}>
                            {new Date(h.date).toLocaleDateString('id-ID', { month: 'short' }).toUpperCase()}
                          </div>
                          <div style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', lineHeight: 1.1 }}>
                            {new Date(h.date).getDate()}
                          </div>
                          <div style={{ fontSize: 10, color: '#64748b' }}>
                            {new Date(h.date).getFullYear()}
                          </div>
                        </div>

                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <h4 style={{ margin: '0 0 4px', fontSize: 15, fontWeight: 700, color: '#0f172a' }}>
                              {h.title}
                            </h4>
                            {h.stage && (
                              <span style={{ fontSize: 11, background: '#eff6ff', color: '#1e40af', padding: '2px 8px', borderRadius: 4, fontWeight: 600 }}>
                                {h.stage}
                              </span>
                            )}
                          </div>

                          {h.location && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#64748b', marginBottom: 6 }}>
                              <MapPin size={13} /> {h.location}
                            </div>
                          )}

                          {h.notes && (
                            <p style={{ margin: 0, fontSize: 13, color: '#334155', lineHeight: 1.5, background: '#fff', padding: '8px 12px', borderRadius: 6, border: '1px solid #e2e8f0' }}>
                              {h.notes}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {/* TAB 2: KRONOLOGI KASUS */}
      {activeTab === 'detail' && (
        <div style={{ background: '#fff', borderRadius: 12, padding: '24px 28px', border: '1px solid var(--line, #e2e6e3)' }}>
          <h2 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12, color: '#1a1f1b' }}>Deskripsi Perkara & Kronologi</h2>
          <p style={{ fontSize: 14, color: '#3a4a3d', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
            {currentCase.description || 'Tidak ada deskripsi.'}
          </p>
        </div>
      )}

      {/* TAB 3: DOKUMEN */}
      {activeTab === 'dokumen' && (
        <div style={{ background: '#fff', borderRadius: 12, padding: '24px 28px', border: '1px solid var(--line, #e2e6e3)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 style={{ fontSize: 15, fontWeight: 600, color: '#1a1f1b' }}>Dokumen Bukti Kelayakan & Berkas Perkara</h2>
            {(role === 'CONSULTANT' || role === 'ADMIN') && (
              <button
                onClick={() => setShowGenerate(true)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '8px 16px', fontSize: 13, fontWeight: 500,
                  background: '#16a34a', color: '#fff',
                  border: 'none', borderRadius: 8, cursor: 'pointer',
                }}
              >
                <FileSignature size={14} /> Buat Dokumen Resmi
              </button>
            )}
          </div>

          {/* Upload form */}
          <DocumentUploader
            caseId={currentCase.id}
            role={role}
            onUploaded={handleUploaded}
            onNotify={notify}
          />

          {/* Document list */}
          <DocumentList docs={docs} onNotify={notify} />
        </div>
      )}

      {/* TAB 4: PESAN & DISKUSI */}
      {activeTab === 'pesan' && (
        <div style={{ background: '#fff', borderRadius: 12, padding: '24px 28px', border: '1px solid var(--line, #e2e6e3)' }}>
          <ChatThread caseId={currentCase.id} user={user} role={role} />
        </div>
      )}

      {/* Modal: Tambah Agenda Sidang */}
      {showAddHearing && (
        <div className="modal-backdrop" onMouseDown={() => setShowAddHearing(false)}>
          <form
            className="modal auth-card"
            onSubmit={handleAddHearing}
            onMouseDown={(e) => e.stopPropagation()}
            style={{ maxWidth: 520 }}
          >
            <div className="modal-head">
              <div>
                <p className="eyebrow">AGENDA PERSIDANGAN</p>
                <h2>Tambah Agenda Sidang / Pemeriksaan</h2>
              </div>
              <button type="button" className="icon-button" onClick={() => setShowAddHearing(false)} aria-label="Tutup">
                <X size={19} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 14 }}>
              <label>
                Judul Agenda Sidang
                <input
                  type="text"
                  required
                  placeholder="Misal: Sidang I - Mediasi atau Pemeriksaan BAP Saksi"
                  value={newHearing.title}
                  onChange={(e) => setNewHearing({ ...newHearing, title: e.target.value })}
                />
              </label>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <label>
                  Tanggal Agenda
                  <input
                    type="date"
                    required
                    value={newHearing.date}
                    onChange={(e) => setNewHearing({ ...newHearing, date: e.target.value })}
                  />
                </label>

                <label>
                  Tahapan Beracara
                  <select
                    value={newHearing.stage}
                    onChange={(e) => setNewHearing({ ...newHearing, stage: e.target.value })}
                  >
                    {LITIGATION_STAGES.map((st) => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </label>
              </div>

              <label>
                Lokasi Sidang / Kantor
                <input
                  type="text"
                  placeholder="Misal: Pengadilan Negeri Jakarta Timur"
                  value={newHearing.location}
                  onChange={(e) => setNewHearing({ ...newHearing, location: e.target.value })}
                />
              </label>

              <label>
                Catatan Hasil / Instruksi Sidang
                <textarea
                  rows={3}
                  placeholder="Misal: Klien diwajibkan hadir membawa KTP asli, berkas jawaban telah diserahkan..."
                  value={newHearing.notes}
                  onChange={(e) => setNewHearing({ ...newHearing, notes: e.target.value })}
                />
              </label>

              <button
                type="submit"
                disabled={savingHearing}
                className="button primary full"
                style={{ background: '#3b82f6', color: '#fff', marginTop: 10 }}
              >
                {savingHearing ? 'Menyimpan...' : 'Simpan Agenda Sidang'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Generate Document Modal */}
      {showGenerate && (
        <GenerateDocumentModal
          caseId={currentCase.id}
          onClose={() => setShowGenerate(false)}
          onGenerated={handleGenerated}
          onNotify={notify}
        />
      )}

      {/* Toast Notification */}
      {notice && (
        <div style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 1000,
          background: '#1a1f1b', color: '#fff', padding: '12px 20px',
          borderRadius: 10, fontSize: 13, fontWeight: 500,
          boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
        }}>
          {notice}
        </div>
      )}
    </div>
  );
}
