'use client';

import { useState } from 'react';
import {
  DollarSign,
  Plus,
  Search,
  Filter,
  Receipt,
  FileText,
  AlertCircle,
  CheckCircle2,
  Calendar,
  X,
  CreditCard
} from 'lucide-react';

export default function AnggaranClient({ initialCases }) {
  const [cases, setCases] = useState(initialCases);
  const [search, setSearch] = useState('');
  const [selectedCase, setSelectedCase] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', text: '' });

  const [formData, setFormData] = useState({
    caseId: '',
    amount: '',
    category: 'Transport & Akomodasi Sidang',
    description: '',
    receiptUrl: ''
  });

  const categories = [
    'Transport & Akomodasi Sidang',
    'Panjar Biaya Perkara Pengadilan',
    'Pengiriman Berkas / Pos Kilat / Somasi',
    'Penggandaan Berkas & Meterai Dokumen',
    'Biaya Saksi & Keterangan Ahli',
    'Operasional Mediasi Luar Pengadilan'
  ];

  const notify = (text, type = 'info') => {
    setFeedback({ text, type });
    setTimeout(() => setFeedback({ text: '', type: '' }), 5000);
  };

  const filteredCases = cases.filter(
    (c) =>
      c.code.toLowerCase().includes(search.toLowerCase()) ||
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.client.name.toLowerCase().includes(search.toLowerCase())
  );

  const totalOperationalCost = cases.reduce((acc, c) => {
    const caseTotal = (c.expenses || []).reduce((sub, e) => sub + e.amount, 0);
    return acc + caseTotal;
  }, 0);

  const openExpenseModal = (c) => {
    setSelectedCase(c);
    setFormData({
      caseId: c ? c.id : '',
      amount: '',
      category: 'Transport & Akomodasi Sidang',
      description: '',
      receiptUrl: ''
    });
    setIsModalOpen(true);
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();
    if (!formData.caseId || !formData.amount || !formData.description) {
      notify('Harap lengkapi semua isian formulir.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/finances/cases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Gagal menambahkan biaya operasional.');
      }

      // Update local state
      setCases((prev) =>
        prev.map((c) => {
          if (c.id === formData.caseId) {
            return {
              ...c,
              expenses: [data.expense, ...(c.expenses || [])]
            };
          }
          return c;
        })
      );

      setIsModalOpen(false);
      notify('Biaya operasional perkara berhasil dicatat dan disinkronkan ke Buku Kas!', 'success');
    } catch (err) {
      notify(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const formatRupiah = (val) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(val || 0);

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 20px 80px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--olive, #3b4a2e)', background: '#f5f7f2', padding: '4px 10px', borderRadius: 6 }}>
            Lampiran F · AD/ART LKBH STHM
          </span>
          <h1 style={{ fontSize: 24, fontWeight: 800, margin: '6px 0 2px', fontFamily: 'Space Grotesk' }}>
            Anggaran Biaya Operasional Perkara
          </h1>
          <p style={{ margin: 0, color: '#657068', fontSize: 13 }}>
            Monitoring dan alokasi dana bantuan hukum cuma-cuma (pro bono) bersumber dari DIPA & Hibah STHM.
          </p>
        </div>

        <button
          onClick={() => openExpenseModal(null)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            backgroundColor: 'var(--olive, #3b4a2e)',
            color: '#fff',
            border: 'none',
            padding: '10px 18px',
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          <Plus size={16} /> Catat Biaya Perkara
        </button>
      </div>

      {feedback.text && (
        <div
          style={{
            padding: '12px 16px',
            borderRadius: 8,
            marginBottom: 20,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            backgroundColor: feedback.type === 'error' ? '#fef2f2' : '#f0fdf4',
            color: feedback.type === 'error' ? '#991b1b' : '#166534',
            border: `1px solid ${feedback.type === 'error' ? '#fecaca' : '#bbf7d0'}`
          }}
        >
          {feedback.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
          <span style={{ fontSize: 13 }}>{feedback.text}</span>
        </div>
      )}

      {/* Metric Card */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16, marginBottom: 24 }}>
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: 18 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 13, color: '#657068', fontWeight: 600 }}>Total Realisasi Biaya Kasus</span>
            <DollarSign size={20} color="#d97706" />
          </div>
          <div style={{ fontSize: 26, fontWeight: 800, marginTop: 8, color: '#0f172a' }}>
            {formatRupiah(totalOperationalCost)}
          </div>
          <div style={{ fontSize: 12, color: '#059669', marginTop: 4 }}>
            Disalurkan untuk advokasi non-profit & peradilan pro bono
          </div>
        </div>

        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: 18 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 13, color: '#657068', fontWeight: 600 }}>Jumlah Perkara Berjalan</span>
            <FileText size={20} color="#2563eb" />
          </div>
          <div style={{ fontSize: 26, fontWeight: 800, marginTop: 8, color: '#0f172a' }}>
            {cases.length} Perkara
          </div>
          <div style={{ fontSize: 12, color: '#657068', marginTop: 4 }}>
            Terdaftar resmi di Sekretariat LKBH
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ position: 'relative', maxWidth: 400 }}>
          <Search size={16} color="#9ca3af" style={{ position: 'absolute', left: 12, top: 12 }} />
          <input
            type="text"
            placeholder="Cari nomor kode, judul, atau nama klien..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 12px 10px 36px',
              borderRadius: 8,
              border: '1px solid #d1d5db',
              fontSize: 14
            }}
          />
        </div>
      </div>

      {/* Case List with Operational Expenses */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {filteredCases.map((c) => {
          const caseExpenses = c.expenses || [];
          const caseTotal = caseExpenses.reduce((sum, e) => sum + e.amount, 0);

          return (
            <div
              key={c.id}
              style={{
                background: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: 10,
                padding: 20,
                boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 12 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--olive, #3b4a2e)', background: '#f5f7f2', padding: '2px 8px', borderRadius: 4 }}>
                      {c.code}
                    </span>
                    <span style={{ fontSize: 12, color: '#657068' }}>· Klien: <strong>{c.client.name}</strong></span>
                    {c.consultant && (
                      <span style={{ fontSize: 12, color: '#2563eb', background: '#eff6ff', padding: '2px 8px', borderRadius: 4 }}>
                        Advokat: {c.consultant.user.name}
                      </span>
                    )}
                  </div>
                  <h3 style={{ fontSize: 16, fontWeight: 700, margin: '6px 0 2px' }}>{c.title}</h3>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 11, color: '#657068', fontWeight: 600 }}>Alokasi Kasus</div>
                    <div style={{ fontSize: 16, fontWeight: 800, color: '#0f172a' }}>{formatRupiah(caseTotal)}</div>
                  </div>
                  <button
                    onClick={() => openExpenseModal(c)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      background: '#f8fafc',
                      border: '1px solid #cbd5e1',
                      padding: '6px 12px',
                      borderRadius: 6,
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    <Plus size={14} /> Biaya
                  </button>
                </div>
              </div>

              {/* Expense Items Table */}
              {caseExpenses.length === 0 ? (
                <div style={{ padding: '12px', background: '#f9fafb', borderRadius: 6, fontSize: 12, color: '#6b7280', textAlign: 'center' }}>
                  Belum ada catatan pengeluaran operasional untuk perkara ini.
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid #e5e7eb', color: '#657068', textAlign: 'left' }}>
                        <th style={{ padding: '8px 10px', fontWeight: 600 }}>Kategori</th>
                        <th style={{ padding: '8px 10px', fontWeight: 600 }}>Uraian Pengeluaran</th>
                        <th style={{ padding: '8px 10px', fontWeight: 600, textAlign: 'right' }}>Nominal</th>
                        <th style={{ padding: '8px 10px', fontWeight: 600, textAlign: 'right' }}>Tanggal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {caseExpenses.map((exp) => (
                        <tr key={exp.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '8px 10px', fontWeight: 600, color: '#334155' }}>{exp.category}</td>
                          <td style={{ padding: '8px 10px', color: '#475569' }}>{exp.description}</td>
                          <td style={{ padding: '8px 10px', fontWeight: 700, color: '#991b1b', textAlign: 'right' }}>
                            {formatRupiah(exp.amount)}
                          </td>
                          <td style={{ padding: '8px 10px', color: '#94a3b8', fontSize: 12, textAlign: 'right' }}>
                            {new Date(exp.createdAt).toLocaleDateString('id-ID')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Modal Add Expense */}
      {isModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20,
            zIndex: 1000
          }}
        >
          <div
            style={{
              background: '#fff',
              borderRadius: 12,
              padding: 24,
              maxWidth: 500,
              width: '100%',
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>Catat Biaya Operasional Perkara</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#657068' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddExpense} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4, color: '#374151' }}>
                  Perkara Terkait
                </label>
                <select
                  value={formData.caseId}
                  onChange={(e) => setFormData({ ...formData, caseId: e.target.value })}
                  required
                  style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #d1d5db', fontSize: 13 }}
                >
                  <option value="">-- Pilih Perkara --</option>
                  {cases.map((c) => (
                    <option key={c.id} value={c.id}>
                      [{c.code}] {c.title} - {c.client.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4, color: '#374151' }}>
                  Kategori Pengeluaran
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  required
                  style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #d1d5db', fontSize: 13 }}
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4, color: '#374151' }}>
                  Nominal Biaya (Rp)
                </label>
                <input
                  type="number"
                  placeholder="Contoh: 150000"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  required
                  min="1000"
                  style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #d1d5db', fontSize: 13 }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4, color: '#374151' }}>
                  Uraian Keperluan Operasional
                </label>
                <textarea
                  rows={3}
                  placeholder="Contoh: Tiket KRL & transport advokat menghadiri sidang pembacaan gugatan di PN Jaktim"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #d1d5db', fontSize: 13 }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{ padding: '8px 14px', borderRadius: 6, border: '1px solid #d1d5db', background: '#fff', fontSize: 13, cursor: 'pointer' }}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    padding: '8px 16px',
                    borderRadius: 6,
                    border: 'none',
                    background: 'var(--olive, #3b4a2e)',
                    color: '#fff',
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: submitting ? 'not-allowed' : 'pointer'
                  }}
                >
                  {submitting ? 'Menyimpan...' : 'Simpan Biaya'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
