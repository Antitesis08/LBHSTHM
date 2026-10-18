'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Wallet, TrendingUp, TrendingDown, Plus, FileText, CheckCircle2 } from 'lucide-react';

const CATEGORIES_INCOME = [
  'Dukungan/Hibah Institusi STHM',
  'Kerjasama Bantuan Hukum Kemenkumham',
  'Kontribusi/Kerjasama Program',
  'Sumbangan/Donasi Sukarela',
];

const CATEGORIES_EXPENSE = [
  'Operasional Litigasi dan Non-Litigasi',
  'Kegiatan Pengabdian Masyarakat & Penyuluhan',
  'Administrasi dan Kesekretariatan',
  'Koordinasi dan Rapat Pengurus',
  'Keperluan Tak Terduga',
];

export default function BendaharaDashboardClient({ initialRecords, summary }) {
  const router = useRouter();
  const [records, setRecords] = useState(initialRecords);
  const [type, setType] = useState('EXPENSE');
  const [category, setCategory] = useState(CATEGORIES_EXPENSE[0]);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState('');

  const notify = (msg) => {
    setNotice(msg);
    setTimeout(() => setNotice(''), 4500);
  };

  const formatRupiah = (val) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount || !description) {
      notify('Jumlah dan uraian wajib diisi.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/finances', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          category,
          amount: parseFloat(amount),
          description,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setRecords((prev) => [data.record, ...prev]);
        setAmount('');
        setDescription('');
        notify('Transaksi keuangan berhasil dicatat ke Buku Kas LKBH STHM.');
        router.refresh();
      } else {
        notify(`Gagal: ${data.error}`);
      }
    } catch {
      notify('Terjadi kesalahan jaringan.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: '#16a34a', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Lampiran F: Standar Pelaporan Keuangan LKBH STHM
        </span>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#0f172a', margin: '4px 0 8px' }}>
          Buku Kas & Ikhtisar Arus Keuangan Lembaga
        </h1>
        <p style={{ margin: 0, fontSize: 14, color: '#64748b' }}>
          Pengelolaan alokasi DIPA/APBN, operasional bantuan hukum pro bono, administrasi kesekretariatan, dan transparansi anggaran penanganan perkara.
        </p>
      </div>

      {/* Ringkasan Eksekutif (Ikhtisar Arus Kas) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16, marginBottom: 28 }}>
        <div style={{ background: '#fff', padding: '20px 24px', borderRadius: 12, border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#16a34a', marginBottom: 8 }}>
            <TrendingUp size={20} />
            <span style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase' }}>Total Pemasukan</span>
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#0f172a' }}>{formatRupiah(summary.totalIncome)}</div>
          <span style={{ fontSize: 11, color: '#64748b' }}>Dukungan DIPA STHM & Hibah Program</span>
        </div>

        <div style={{ background: '#fff', padding: '20px 24px', borderRadius: 12, border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#dc2626', marginBottom: 8 }}>
            <TrendingDown size={20} />
            <span style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase' }}>Total Pengeluaran</span>
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#0f172a' }}>{formatRupiah(summary.totalExpense)}</div>
          <span style={{ fontSize: 11, color: '#64748b' }}>Biaya Perkara, Sidang & Administrasi</span>
        </div>

        <div style={{ background: '#fff', padding: '20px 24px', borderRadius: 12, border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#2563eb', marginBottom: 8 }}>
            <Wallet size={20} />
            <span style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase' }}>Saldo Kas Bersih</span>
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, color: summary.netBalance >= 0 ? '#15803d' : '#b91c1c' }}>
            {formatRupiah(summary.netBalance)}
          </div>
          <span style={{ fontSize: 11, color: '#64748b' }}>Sisa Saldo Kas Operasional LKBH</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 2fr', gap: 20 }}>
        {/* Form Input Transaksi */}
        <form onSubmit={handleSubmit} style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', padding: 22 }}>
          <h3 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Plus size={18} /> Catat Transaksi Keuangan
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: '#334155' }}>
              Tipe Transaksi
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 4 }}>
                <button
                  type="button"
                  onClick={() => {
                    setType('INCOME');
                    setCategory(CATEGORIES_INCOME[0]);
                  }}
                  style={{
                    padding: '8px 12px', borderRadius: 6, fontSize: 13, fontWeight: 600,
                    border: `1px solid ${type === 'INCOME' ? '#16a34a' : '#cbd5e1'}`,
                    background: type === 'INCOME' ? '#f0fdf4' : '#f8fafc',
                    color: type === 'INCOME' ? '#15803d' : '#64748b', cursor: 'pointer'
                  }}
                >
                  Pemasukan
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setType('EXPENSE');
                    setCategory(CATEGORIES_EXPENSE[0]);
                  }}
                  style={{
                    padding: '8px 12px', borderRadius: 6, fontSize: 13, fontWeight: 600,
                    border: `1px solid ${type === 'EXPENSE' ? '#dc2626' : '#cbd5e1'}`,
                    background: type === 'EXPENSE' ? '#fef2f2' : '#f8fafc',
                    color: type === 'EXPENSE' ? '#b91c1c' : '#64748b', cursor: 'pointer'
                  }}
                >
                  Pengeluaran
                </button>
              </div>
            </label>

            <label style={{ fontSize: 13, fontWeight: 600, color: '#334155' }}>
              Kategori Alokasi
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', borderRadius: 6, border: '1px solid #cbd5e1', marginTop: 4, fontSize: 13 }}
              >
                {(type === 'INCOME' ? CATEGORIES_INCOME : CATEGORIES_EXPENSE).map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </label>

            <label style={{ fontSize: 13, fontWeight: 600, color: '#334155' }}>
              Jumlah Nominal (Rp)
              <input
                type="number"
                required
                min="1000"
                placeholder="Misal: 2500000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', borderRadius: 6, border: '1px solid #cbd5e1', marginTop: 4, fontSize: 13 }}
              />
            </label>

            <label style={{ fontSize: 13, fontWeight: 600, color: '#334155' }}>
              Uraian / Keterangan Transaksi
              <textarea
                rows={3}
                required
                placeholder="Misal: Biaya transportasi pendampingan sidang ke Pengadilan Negeri Jakarta Timur..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', borderRadius: 6, border: '1px solid #cbd5e1', marginTop: 4, fontSize: 13, lineHeight: 1.5 }}
              />
            </label>

            <button
              type="submit"
              disabled={loading}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                padding: '12px', background: '#16a34a', color: '#fff', border: 'none',
                borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', marginTop: 6
              }}
            >
              <CheckCircle2 size={16} /> {loading ? 'Menyimpan...' : 'Simpan ke Buku Kas'}
            </button>
          </div>
        </form>

        {/* Tabel Catatan Transaksi */}
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', padding: 22, overflowX: 'auto' }}>
          <h3 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 700, color: '#0f172a' }}>
            Rincian Pembukuan Kas ({records.length})
          </h3>

          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: 600 }}>
                <th style={{ padding: '10px 14px', textAlign: 'left' }}>Tanggal</th>
                <th style={{ padding: '10px 14px', textAlign: 'left' }}>Kategori & Uraian</th>
                <th style={{ padding: '10px 14px', textAlign: 'right' }}>Nominal</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r) => {
                const isIncome = r.type === 'INCOME';
                return (
                  <tr key={r.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px 14px', verticalAlign: 'top', color: '#64748b', fontSize: 12, whiteSpace: 'nowrap' }}>
                      {new Intl.DateTimeFormat('id-ID', { dateStyle: 'short' }).format(new Date(r.date))}
                    </td>
                    <td style={{ padding: '12px 14px', verticalAlign: 'top' }}>
                      <strong style={{ display: 'block', color: '#0f172a' }}>{r.category}</strong>
                      <span style={{ fontSize: 12, color: '#475569' }}>{r.description}</span>
                    </td>
                    <td style={{ padding: '12px 14px', verticalAlign: 'top', textAlign: 'right', fontWeight: 700, color: isIncome ? '#16a34a' : '#dc2626', whiteSpace: 'nowrap' }}>
                      {isIncome ? '+ ' : '- '}
                      {formatRupiah(r.amount)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {notice && (
        <div style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 1000,
          background: '#0f172a', color: '#fff', padding: '12px 20px',
          borderRadius: 10, fontSize: 13, fontWeight: 500, boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
        }}>
          {notice}
        </div>
      )}
    </div>
  );
}
