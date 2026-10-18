'use client';

import { useState } from 'react';
import {
  FileSpreadsheet,
  Printer,
  Calendar,
  Building,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  ShieldCheck
} from 'lucide-react';

export default function NeracaClient({ records }) {
  const [filterMonth, setFilterMonth] = useState('ALL');

  const formatRupiah = (val) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(val || 0);

  const incomeRecords = records.filter((r) => r.type === 'INCOME');
  const expenseRecords = records.filter((r) => r.type === 'EXPENSE');

  const totalIncome = incomeRecords.reduce((sum, r) => sum + r.amount, 0);
  const totalExpense = expenseRecords.reduce((sum, r) => sum + r.amount, 0);
  const netBalance = totalIncome - totalExpense;

  // Grouping by category
  const groupByCategory = (list) => {
    const map = {};
    list.forEach((r) => {
      const cat = r.category || 'Lain-lain';
      if (!map[cat]) map[cat] = 0;
      map[cat] += r.amount;
    });
    return Object.entries(map).map(([name, amount]) => ({ name, amount }));
  };

  const incomeCategories = groupByCategory(incomeRecords);
  const expenseCategories = groupByCategory(expenseRecords);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '24px 20px 80px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--olive, #3b4a2e)', background: '#f5f7f2', padding: '4px 10px', borderRadius: 6 }}>
            Lampiran (F) Format AD/ART
          </span>
          <h1 style={{ fontSize: 24, fontWeight: 800, margin: '6px 0 2px', fontFamily: 'Space Grotesk' }}>
            Buku Kas Umum & Neraca LKBH STHM
          </h1>
          <p style={{ margin: 0, color: '#657068', fontSize: 13 }}>
            Laporan pertanggungjawaban keuangan berkala untuk Ketua LKBH dan Dewan Pengawas.
          </p>
        </div>

        <button
          onClick={handlePrint}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            backgroundColor: '#f8fafc',
            color: '#1e293b',
            border: '1px solid #cbd5e1',
            padding: '8px 16px',
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          <Printer size={16} /> Cetak / Unduh PDF
        </button>
      </div>

      {/* Zero Fee Declaration Card */}
      <div
        style={{
          background: '#f0fdf4',
          border: '1px solid #bbf7d0',
          borderRadius: 10,
          padding: '14px 18px',
          marginBottom: 24,
          display: 'flex',
          alignItems: 'center',
          gap: 12
        }}
      >
        <ShieldCheck size={24} color="#15803d" />
        <div style={{ fontSize: 13, color: '#166534' }}>
          <strong>Pernyataan Kepatuhan Bab VII AD/ART:</strong> Seluruh layanan pendampingan hukum kepada pemohon pro bono bebas biaya (Zero Fee). Pendanaan sepenuhnya dikelola dari anggaran institusi, DIPA, dan donasi sah non-komersial.
        </div>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, marginBottom: 24 }}>
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, padding: 18 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#64748b' }}>Total Penerimaan (Kas Masuk)</span>
            <TrendingUp size={18} color="#16a34a" />
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#15803d', marginTop: 8 }}>
            {formatRupiah(totalIncome)}
          </div>
        </div>

        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, padding: 18 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#64748b' }}>Total Pengeluaran (Kas Keluar)</span>
            <TrendingDown size={18} color="#dc2626" />
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#b91c1c', marginTop: 8 }}>
            {formatRupiah(totalExpense)}
          </div>
        </div>

        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, padding: 18 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#64748b' }}>Saldo Akhir Kas LKBH</span>
            <Building size={18} color="#2563eb" />
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', marginTop: 8 }}>
            {formatRupiah(netBalance)}
          </div>
        </div>
      </div>

      {/* Official Neraca Breakdown Table */}
      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, overflow: 'hidden', marginBottom: 24 }}>
        <div style={{ padding: '16px 20px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Rekapitulasi Kategori Keuangan (Lampiran F)</h3>
          <span style={{ fontSize: 12, color: '#64748b' }}>Periode Berjalan STHM</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 }}>
          {/* Penerimaan */}
          <div style={{ padding: 20, borderRight: '1px solid #e2e8f0' }}>
            <h4 style={{ margin: '0 0 12px', fontSize: 14, fontWeight: 700, color: '#15803d' }}>
              I. PENERIMAAN / ALOKASI ANGGARAN
            </h4>
            <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
              <tbody>
                {incomeCategories.map((c) => (
                  <tr key={c.name} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '8px 0', color: '#334155' }}>{c.name}</td>
                    <td style={{ padding: '8px 0', fontWeight: 600, textAlign: 'right', color: '#0f172a' }}>
                      {formatRupiah(c.amount)}
                    </td>
                  </tr>
                ))}
                <tr>
                  <td style={{ padding: '12px 0 0', fontWeight: 700, color: '#0f172a' }}>Total Penerimaan</td>
                  <td style={{ padding: '12px 0 0', fontWeight: 800, textAlign: 'right', color: '#15803d' }}>
                    {formatRupiah(totalIncome)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Pengeluaran */}
          <div style={{ padding: 20 }}>
            <h4 style={{ margin: '0 0 12px', fontSize: 14, fontWeight: 700, color: '#b91c1c' }}>
              II. PENGELUARAN / REALISASI OPERASIONAL
            </h4>
            <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
              <tbody>
                {expenseCategories.map((c) => (
                  <tr key={c.name} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '8px 0', color: '#334155' }}>{c.name}</td>
                    <td style={{ padding: '8px 0', fontWeight: 600, textAlign: 'right', color: '#0f172a' }}>
                      {formatRupiah(c.amount)}
                    </td>
                  </tr>
                ))}
                <tr>
                  <td style={{ padding: '12px 0 0', fontWeight: 700, color: '#0f172a' }}>Total Pengeluaran</td>
                  <td style={{ padding: '12px 0 0', fontWeight: 800, textAlign: 'right', color: '#b91c1c' }}>
                    {formatRupiah(totalExpense)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div style={{ padding: '16px 20px', background: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 14, fontWeight: 800 }}>SURPLUS / DEFISIT BERJALAN</span>
          <span style={{ fontSize: 18, fontWeight: 800, color: netBalance >= 0 ? '#15803d' : '#b91c1c' }}>
            {formatRupiah(netBalance)}
          </span>
        </div>
      </div>
    </div>
  );
}
