'use client';

import { useState } from 'react';
import { FileText, MoreHorizontal } from 'lucide-react';

export default function DocumentList({ docs, onNotify }) {
  const [loadingDoc, setLoadingDoc] = useState('');

  const handleDownload = async (doc) => {
    setLoadingDoc(doc.id);
    try {
      const res = await fetch(`/api/documents/${doc.id}/download`);
      const data = await res.json();
      if (res.ok) {
        window.open(data.url, '_blank');
      } else {
        onNotify(`Gagal: ${data.error}`);
      }
    } catch {
      onNotify('Gagal mengunduh dokumen.');
    }
    setLoadingDoc('');
  };

  if (!docs || docs.length === 0) {
    return (
      <div style={{ textAlign: 'center', color: '#9aa39b', padding: '40px 0', fontSize: 13 }}>
        <FileText size={28} style={{ marginBottom: 8, opacity: 0.5 }} />
        <p>Belum ada dokumen untuk kasus ini.</p>
      </div>
    );
  }

  return (
    <div className="document-grid">
      {docs.map((doc) => (
        <button
          className="document-card"
          key={doc.id}
          onClick={() => handleDownload(doc)}
          disabled={loadingDoc === doc.id}
          id={`doc-${doc.id}`}
        >
          <div className={`file-icon ${doc.isGenerated ? '' : 'warm'}`}>
            <FileText size={20} />
          </div>
          <div>
            <strong>{doc.fileName}</strong>
            <span>
              {doc.fileType?.split('/').pop()?.toUpperCase() || 'FILE'}
              {doc.isGenerated ? ' · Otomatis' : ''}
              {doc.source === 'EXTERNAL_OFFICIAL' ? ' · Resmi' : ''}
              {doc.uploader ? ` · ${doc.uploader.name}` : ''}
            </span>
            <span>{new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(doc.createdAt))}</span>
          </div>
          <MoreHorizontal size={17} />
        </button>
      ))}
    </div>
  );
}
