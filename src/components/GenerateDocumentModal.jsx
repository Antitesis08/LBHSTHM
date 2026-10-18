'use client';

import { useState } from 'react';
import { X, FileText, ArrowUpRight } from 'lucide-react';

export default function GenerateDocumentModal({ caseId, onClose, onGenerated, onNotify }) {
  const [templateType, setTemplateType] = useState('RINGKASAN_KONSULTASI');
  const [loading, setLoading] = useState(false);

  const templates = [
    { value: 'RINGKASAN_KONSULTASI', label: 'Ringkasan Konsultasi', active: true },
    { value: 'LEGAL_OPINION', label: 'Legal Opinion', active: true },
    { value: 'SURAT_KUASA', label: 'Surat Kuasa (Segera Hadir)', active: false },
    { value: 'SOMASI', label: 'Somasi (Segera Hadir)', active: false },
  ];

  const handleGenerate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`/api/cases/${caseId}/generate-doc`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ templateType }),
      });
      const data = await res.json();
      if (res.ok) {
        onGenerated(data.document);
      } else {
        onNotify(`Gagal: ${data.error}`);
      }
    } catch {
      onNotify('Terjadi kesalahan koneksi.');
    }
    setLoading(false);
  };

  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <form className="modal auth-card" onSubmit={handleGenerate} onMouseDown={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div>
            <p className="eyebrow">GENERATE DOKUMEN</p>
            <h2>Buat Dokumen Otomatis</h2>
          </div>
          <button type="button" className="icon-button" onClick={onClose} aria-label="Tutup">
            <X size={19} />
          </button>
        </div>
        <label>
          Jenis template
          <select
            name="templateType"
            value={templateType}
            onChange={(e) => setTemplateType(e.target.value)}
            id="generate-template-select"
          >
            {templates.map((t) => (
              <option key={t.value} value={t.value} disabled={!t.active}>
                {t.label}
              </option>
            ))}
          </select>
        </label>
        <div className="upload-note" style={{ marginTop: 14 }}>
          <FileText size={18} />
          <span>
            {templateType === 'RINGKASAN_KONSULTASI'
              ? 'Ringkasan konsultasi berisi data kasus, klien, dan catatan konsultasi awal.'
              : templateType === 'LEGAL_OPINION'
              ? 'Legal Opinion berisi latar belakang, duduk perkara, dasar hukum, analisis, dan rekomendasi.'
              : 'Template ini masih menunggu review advokat STHM dan belum dapat digunakan.'}
          </span>
        </div>
        <button
          className="button primary full"
          type="submit"
          disabled={loading || !['RINGKASAN_KONSULTASI', 'LEGAL_OPINION'].includes(templateType)}
          id="btn-submit-generate"
        >
          {loading ? 'Membuat dokumen...' : 'Buat Dokumen PDF'}
          <ArrowUpRight size={16} />
        </button>
      </form>
    </div>
  );
}
