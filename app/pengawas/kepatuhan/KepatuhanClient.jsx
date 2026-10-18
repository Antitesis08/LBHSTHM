'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Search,
  Filter,
  Printer,
  ShieldCheck,
  FileCheck
} from 'lucide-react';

export default function KepatuhanClient({ cases }) {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');

  const filteredCases = cases.filter((c) => {
    const matchSearch =
      c.code.toLowerCase().includes(search.toLowerCase()) ||
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.client.name.toLowerCase().includes(search.toLowerCase());

    if (filterStatus === 'ARCHIVED') return matchSearch && c.isArchived;
    if (filterStatus === 'ACTIVE') return matchSearch && !c.isArchived;
    return matchSearch;
  });

  const checkBadge = (passed, label) => {
    if (passed) {
      return (
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            fontSize: 11,
            fontWeight: 700,
            color: '#15803d',
            background: '#f0fdf4',
            padding: '2px 8px',
            borderRadius: 4
          }}
        >
          <CheckCircle2 size={13} /> {label || 'Lolos'}
        </span>
      );
    }
    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 4,
          fontSize: 11,
          fontWeight: 700,
          color: '#b91c1c',
          background: '#fef2f2',
          padding: '2px 8px',
          borderRadius: 4
        }}
      >
        <XCircle size={13} /> Belum
      </span>
    );
  };

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 20px 80px' }}>
      <Link
        href="/pengawas/dashboard"
        style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#64748b', textDecoration: 'none', fontSize: 13, marginBottom: 16 }}
      >
        <ArrowLeft size={16} /> Kembali ke Dashboard Pengawas
      </Link>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, margin: '0 0 4px', fontFamily: 'Space Grotesk' }}>
            Audit Kepatuhan SOP AD/ART Per Kasus
          </h1>
          <p style={{ margin: 0, color: '#657068', fontSize: 13 }}>
            Uji kepatuhan 6 Standar Operasional Prosedur (SOP-01 s/d SOP-06) LKBH STHM.
          </p>
        </div>

        <button
          onClick={() => window.print()}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            backgroundColor: '#f8fafc',
            border: '1px solid #cbd5e1',
            padding: '8px 16px',
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          <Printer size={16} /> Cetak Lembar Audit
        </button>
      </div>

      {/* Filter and Search */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: '1 1 300px' }}>
          <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: 12, top: 12 }} />
          <input
            type="text"
            placeholder="Cari kode, nama perkara, klien..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: '100%', padding: '10px 12px 10px 36px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 14 }}
          />
        </div>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          style={{ padding: '10px 14px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 14, background: '#fff' }}
        >
          <option value="ALL">Semua Perkara ({cases.length})</option>
          <option value="ACTIVE">Perkara Aktif</option>
          <option value="ARCHIVED">Perkara Terarsip Permanen (Dossier)</option>
        </select>
      </div>

      {/* Audit Checklist Table */}
      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 800 }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', textAlign: 'left' }}>
              <th style={{ padding: '12px 14px', fontWeight: 700 }}>Perkara & Klien</th>
              <th style={{ padding: '12px 10px', fontWeight: 700 }}>SOP-01 (Buku Induk)</th>
              <th style={{ padding: '12px 10px', fontWeight: 700 }}>SOP-02 (BAGK Gelar)</th>
              <th style={{ padding: '12px 10px', fontWeight: 700 }}>SOP-02 (Uji Konflik)</th>
              <th style={{ padding: '12px 10px', fontWeight: 700 }}>SOP-03 (Tim Advokat)</th>
              <th style={{ padding: '12px 10px', fontWeight: 700 }}>SOP-06 (Dossier)</th>
              <th style={{ padding: '12px 14px', fontWeight: 700, textAlign: 'center' }}>Status Akhir</th>
            </tr>
          </thead>
          <tbody>
            {filteredCases.map((c) => {
              const hasReg = !!c.registrationNumber;
              const hasBagk = !!c.bagkNumber;
              const hasConflict = !!c.conflictOfInterestCheck;
              const hasConsultant = !!c.consultantId;
              const hasDossier = !!c.isArchived;

              return (
                <tr key={c.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '12px 14px' }}>
                    <div style={{ fontWeight: 700, color: 'var(--olive, #3b4a2e)' }}>{c.code}</div>
                    <div style={{ fontSize: 13, color: '#0f172a', margin: '2px 0' }}>{c.title}</div>
                    <div style={{ fontSize: 11, color: '#64748b' }}>Klien: {c.client?.name}</div>
                  </td>

                  <td style={{ padding: '12px 10px' }}>
                    {checkBadge(hasReg, c.registrationNumber ? 'No. ' + c.registrationNumber.slice(-6) : null)}
                  </td>

                  <td style={{ padding: '12px 10px' }}>
                    {checkBadge(hasBagk, c.bagkNumber ? 'BAGK Ada' : null)}
                  </td>

                  <td style={{ padding: '12px 10px' }}>
                    {checkBadge(hasConflict, 'Bebas Konflik')}
                  </td>

                  <td style={{ padding: '12px 10px' }}>
                    {checkBadge(hasConsultant, c.consultant ? c.consultant.user.name : null)}
                  </td>

                  <td style={{ padding: '12px 10px' }}>
                    {checkBadge(hasDossier, c.dossierNumber || 'Arsip Siap')}
                  </td>

                  <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        padding: '3px 8px',
                        borderRadius: 4,
                        background: c.isArchived ? '#f0fdf4' : '#eff6ff',
                        color: c.isArchived ? '#15803d' : '#1d4ed8'
                      }}
                    >
                      {c.isArchived ? 'TERARSIP' : c.status}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
