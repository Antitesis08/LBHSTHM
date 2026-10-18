'use client';

import { useState } from 'react';

export default function DocumentUploader({ caseId, role, onUploaded, onNotify }) {
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!caseId) {
      onNotify('Pilih kasus terlebih dahulu.');
      return;
    }
    const form = new FormData(e.currentTarget);
    const file = form.get('file');
    if (!file || !file.name) {
      onNotify('Pilih file untuk diunggah.');
      return;
    }
    const uploadData = new FormData();
    uploadData.append('file', file);
    const source = form.get('source');
    if (source) uploadData.append('source', source);

    setUploading(true);
    try {
      const res = await fetch(`/api/cases/${caseId}/documents`, { method: 'POST', body: uploadData });
      const data = await res.json();
      if (res.ok) {
        onUploaded(data.document);
        onNotify(`Dokumen "${data.document.fileName}" berhasil diunggah.`);
        e.currentTarget.reset();
      } else {
        onNotify(`Gagal: ${data.error}`);
      }
    } catch {
      onNotify('Terjadi kesalahan koneksi.');
    }
    setUploading(false);
  };

  return (
    <form
      onSubmit={handleUpload}
      className="upload-form"
      style={{ display: 'flex', gap: 10, alignItems: 'flex-end', marginBottom: 20, flexWrap: 'wrap' }}
    >
      <label style={{ flex: 1, minWidth: 200, fontSize: 11, color: '#657068' }}>
        Unggah dokumen
        <input type="file" name="file" required style={{ display: 'block', marginTop: 6, fontSize: 12 }} id="doc-file-input" />
      </label>
      {(role === 'CONSULTANT' || role === 'ADMIN') && (
        <label style={{ minWidth: 180, fontSize: 11, color: '#657068' }}>
          Sumber
          <select
            name="source"
            style={{ display: 'block', width: '100%', border: '1px solid var(--line)', borderRadius: 6, padding: '8px 10px', marginTop: 6, fontSize: 12 }}
            id="doc-source-select"
          >
            {role === 'CONSULTANT' && <option value="CONSULTANT_GENERATED">Dibuat Konsultan</option>}
            {role === 'CONSULTANT' && <option value="EXTERNAL_OFFICIAL">Dokumen Resmi Eksternal</option>}
            {role === 'ADMIN' && <option value="CLIENT">Klien</option>}
            {role === 'ADMIN' && <option value="CONSULTANT_GENERATED">Dibuat Konsultan</option>}
            {role === 'ADMIN' && <option value="EXTERNAL_OFFICIAL">Dokumen Resmi Eksternal</option>}
          </select>
        </label>
      )}
      <button className="button primary" type="submit" disabled={uploading} id="btn-upload-doc">
        {uploading ? 'Mengunggah...' : 'Unggah'}
      </button>
    </form>
  );
}
