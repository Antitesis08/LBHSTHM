'use client';

import { useState } from 'react';
import { ArrowLeft, FileText, ClipboardList, Copy } from 'lucide-react';
import { useRouter } from 'next/navigation';
import CaseStepper from '../../../../src/components/CaseStepper';
import DocumentList from '../../../../src/components/DocumentList';
import DocumentUploader from '../../../../src/components/DocumentUploader';
import GenerateDocumentModal from '../../../../src/components/GenerateDocumentModal';
import ChatThread from '../../../../src/components/ChatThread';

export default function CaseDetailClient({ caseData, user, role }) {
  const router = useRouter();
  const [docs, setDocs] = useState(caseData.documents || []);
  const [activeTab, setActiveTab] = useState('detail');
  const [showGenerate, setShowGenerate] = useState(false);
  const [notice, setNotice] = useState('');

  const notify = (msg) => {
    setNotice(msg);
    setTimeout(() => setNotice(''), 3200);
  };

  const statusLabel = (s) => s?.replaceAll('_', ' ') || '';
  const serviceLabel = (s) => s?.replaceAll('_', ' ') || '';

  const handleUploaded = (doc) => {
    setDocs((prev) => [doc, ...prev]);
  };

  const handleGenerated = (doc) => {
    setDocs((prev) => [doc, ...prev]);
    setShowGenerate(false);
    notify(`Dokumen "${doc.fileName}" berhasil dibuat.`);
  };

  return (
    <div style={{ maxWidth: 960, margin: '0 auto' }}>
      {/* Back button */}
      <button
        onClick={() => router.back()}
        style={{
          display: 'flex', alignItems: 'center', gap: 6, background: 'none',
          border: 'none', cursor: 'pointer', fontSize: 13, color: '#657068',
          marginBottom: 20, padding: 0,
        }}
      >
        <ArrowLeft size={16} /> Kembali
      </button>

      {/* Case header */}
      <div style={{
        background: '#fff', borderRadius: 12, padding: '24px 28px',
        border: '1px solid var(--line, #e2e6e3)', marginBottom: 20,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <p style={{ fontSize: 18, color: 'var(--primary, #3b4a2e)', fontWeight: 800, letterSpacing: '0.04em', background: '#f0fdf4', padding: '6px 14px', borderRadius: 8, border: '1px solid #bbf7d0', margin: 0 }}>
                {caseData.code}
              </p>
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(caseData.code);
                  notify('Kode disalin!');
                }}
                style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32, borderRadius: 6, border: 'none', background: '#f3f4f6', color: '#6b7280', cursor: 'pointer', transition: 'background 0.2s' }}
                title="Salin Kode"
                onMouseOver={(e) => e.currentTarget.style.background = '#e5e7eb'}
                onMouseOut={(e) => e.currentTarget.style.background = '#f3f4f6'}
              >
                <Copy size={16} />
              </button>
            </div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1a1f1b', marginBottom: 8, lineHeight: 1.3 }}>
              {caseData.title}
            </h1>
            <span style={{
              display: 'inline-block', fontSize: 12, padding: '4px 10px',
              borderRadius: 6, background: '#f0fdf4', color: '#16a34a',
              fontWeight: 500,
            }}>
              {serviceLabel(caseData.serviceType)}
            </span>
          </div>
          <div style={{ textAlign: 'right', fontSize: 12, color: '#657068' }}>
            <div>Diajukan: {new Intl.DateTimeFormat('id-ID', { dateStyle: 'long' }).format(new Date(caseData.createdAt))}</div>
            {caseData.isProBono && (
              <span style={{
                display: 'inline-block', marginTop: 4, fontSize: 11,
                padding: '3px 8px', borderRadius: 4,
                background: '#fef3c7', color: '#92400e', fontWeight: 600,
              }}>
                PRO BONO
              </span>
            )}
          </div>
        </div>

        {/* Client info for consultant view */}
        {role === 'CONSULTANT' && caseData.client && (
          <div style={{
            display: 'flex', gap: 10, alignItems: 'center', marginTop: 16,
            padding: '10px 14px', background: '#f9fafb', borderRadius: 8, fontSize: 13,
          }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%',
              background: '#e2e6e3', display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontWeight: 600, fontSize: 12, color: '#1a1f1b',
            }}>
              {caseData.client.name?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
            </div>
            <div>
              <strong>{caseData.client.name}</strong>
              <span style={{ display: 'block', fontSize: 11, color: '#9aa39b' }}>{caseData.client.email}</span>
            </div>
          </div>
        )}
      </div>

      {/* Case Stepper */}
      <div style={{ background: '#fff', borderRadius: 12, padding: '24px 28px', border: '1px solid var(--line, #e2e6e3)', marginBottom: 20 }}>
        <CaseStepper status={caseData.status} consultant={caseData.consultant} />
      </div>

      {/* Tab navigation */}
      <div style={{ display: 'flex', gap: 0, marginBottom: 20, borderBottom: '1px solid var(--line, #e2e6e3)' }}>
        {[
          { key: 'detail', label: 'Detail Kasus', icon: ClipboardList },
          { key: 'dokumen', label: 'Dokumen', icon: FileText },
          { key: 'pesan', label: 'Pesan', icon: ClipboardList },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '12px 20px', fontSize: 13, fontWeight: 500,
              background: 'none', border: 'none', cursor: 'pointer',
              color: activeTab === tab.key ? 'var(--primary, #16a34a)' : '#657068',
              borderBottom: activeTab === tab.key ? '2px solid var(--primary, #16a34a)' : '2px solid transparent',
              transition: 'all 0.2s',
            }}
          >
            <tab.icon size={15} /> {tab.label}
          </button>
        ))}
      </div>

      {/* Tab: Detail */}
      {activeTab === 'detail' && (
        <div style={{ background: '#fff', borderRadius: 12, padding: '24px 28px', border: '1px solid var(--line, #e2e6e3)' }}>
          <h2 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12, color: '#1a1f1b' }}>Deskripsi Perkara</h2>
          <p style={{ fontSize: 14, color: '#3a4a3d', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
            {caseData.description || 'Tidak ada deskripsi.'}
          </p>
        </div>
      )}

      {/* Tab: Documents */}
      {activeTab === 'dokumen' && (
        <div style={{ background: '#fff', borderRadius: 12, padding: '24px 28px', border: '1px solid var(--line, #e2e6e3)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 style={{ fontSize: 15, fontWeight: 600, color: '#1a1f1b' }}>Dokumen Kasus</h2>
            {(role === 'CONSULTANT' || role === 'ADMIN') && (
              <button
                onClick={() => setShowGenerate(true)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '8px 16px', fontSize: 13, fontWeight: 500,
                  background: 'var(--primary, #16a34a)', color: '#fff',
                  border: 'none', borderRadius: 8, cursor: 'pointer',
                }}
              >
                <FileText size={14} /> Buat Dokumen
              </button>
            )}
          </div>

          {/* Upload form */}
          <DocumentUploader
            caseId={caseData.id}
            role={role}
            onUploaded={handleUploaded}
            onNotify={notify}
          />

          {/* Document list */}
          <DocumentList docs={docs} onNotify={notify} />
        </div>
      )}

      {activeTab === 'pesan' && (
        <div style={{ background: '#fff', borderRadius: 12, padding: '24px 28px', border: '1px solid var(--line, #e2e6e3)' }}>
          <ChatThread caseId={caseData.id} user={user} role={role} />
        </div>
      )}

      {/* Generate Document Modal */}
      {showGenerate && (
        <GenerateDocumentModal
          caseId={caseData.id}
          onClose={() => setShowGenerate(false)}
          onGenerated={handleGenerated}
          onNotify={notify}
        />
      )}

      {/* Toast notification */}
      {notice && (
        <div style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 1000,
          background: '#1a1f1b', color: '#fff', padding: '12px 20px',
          borderRadius: 10, fontSize: 13, fontWeight: 500,
          boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
          animation: 'fadeIn 0.3s ease-out',
        }}>
          {notice}
        </div>
      )}
    </div>
  );
}
