'use client';

import { useState } from 'react';
import { X, FileText, ArrowUpRight } from 'lucide-react';

export default function GenerateDocumentModal({ caseId, onClose, onGenerated, onNotify }) {
  const [templateType, setTemplateType] = useState('RINGKASAN_KONSULTASI');
  const [loading, setLoading] = useState(false);

  const templates = [
    { value: 'RINGKASAN_KONSULTASI', label: 'Ringkasan / Berita Acara Konsultasi', active: true },
    { value: 'LEGAL_OPINION', label: 'Legal Opinion (Pendapat Hukum)', active: true },
    { value: 'SURAT_KUASA', label: 'Surat Kuasa Khusus (Format Resmi)', active: true },
    { value: 'SOMASI', label: 'Surat Peringatan / Somasi I', active: true },
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
            <p className="eyebrow">GENERATE DOKUMEN HUKUM</p>
            <h2>Buat Dokumen Resmi LKBH STHM</h2>
          </div>
          <button type="button" className="icon-button" onClick={onClose} aria-label="Tutup">
            <X size={19} />
          </button>
        </div>
        <label>
          Jenis template dokumen resmi
          <select
            name="templateType"
            value={templateType}
            onChange={(e) => setTemplateType(e.target.value)}
            id="generate-template-select"
          >
            {templates.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </label>
        <div className="upload-note" style={{ marginTop: 14 }}>
          <FileText size={18} />
          <span>
            {templateType === 'RINGKASAN_KONSULTASI'
              ? 'Berita Acara & Ringkasan Konsultasi berisi duduk perkara, data klien, dan catatan rekomendasi hukum.'
              : templateType === 'LEGAL_OPINION'
              ? 'Legal Opinion resmi dengan analisis yuridis mendalam dan rekomendasi penanganan perkara.'
              : templateType === 'SURAT_KUASA'
              ? 'Surat Kuasa Khusus standar LKBH STHM (Format Lampiran E) untuk dasar beracara di pengadilan/instansi.'
              : 'Surat Somasi / Teguran Hukum resmi LKBH STHM (Format Lampiran E No. 26) kepada pihak lawan.'}
          </span>
        </div>
        <button
          className="button primary full"
          type="submit"
          disabled={loading}
          id="btn-submit-generate"
          style={{ background: '#16a34a', color: '#fff' }}
        >
          {loading ? 'Membuat dokumen...' : 'Buat Dokumen PDF'}
          <ArrowUpRight size={16} />
        </button>
      </form>
    </div>
  );
}
