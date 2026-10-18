'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const specializationOptions = [
  'KONSULTASI_HUKUM',
  'PENDAMPINGAN_HUKUM',
  'LEGAL_OPINION',
  'MEDIASI',
  'PENDAFTARAN_HKI',
  'PRO_BONO',
];

export default function AdminConsultantCreateForm() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [type, setType] = useState('PENGACARA_PUBLIK');
  const [bio, setBio] = useState('');
  const [specialization, setSpecialization] = useState([]);
  const [photoFile, setPhotoFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const toggleSpecialization = (value) => {
    setSpecialization((prev) => prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      const formData = new FormData();
      formData.set('name', name);
      formData.set('email', email);
      formData.set('type', type);
      formData.set('bio', bio);
      formData.set('specialization', JSON.stringify(specialization));
      if (photoFile) formData.set('photo', photoFile);

      const res = await fetch('/api/admin/consultants', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Gagal menambahkan konsultan.');
      setMessage(`Konsultan berhasil dibuat. ${data.message || ''}`);
      router.push('/admin/konsultan');
    } catch (error) {
      setMessage(error.message || 'Terjadi kesalahan.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: 24 }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Tambah Konsultan Baru</h1>
      <p style={{ color: '#657068', marginBottom: 20 }}>Buat akun konsultan dan profil terkait dalam satu proses.</p>
      <form onSubmit={handleSubmit} style={{ background: '#fff', borderRadius: 16, padding: 20, border: '1px solid #e5e7eb' }}>
        <label style={{ display: 'block', marginBottom: 12 }}>
          <div style={{ fontWeight: 600, marginBottom: 6 }}>Nama</div>
          <input value={name} onChange={(event) => setName(event.target.value)} required style={{ width: '100%', padding: 12, borderRadius: 10, border: '1px solid #d1d5db' }} />
        </label>
        <label style={{ display: 'block', marginBottom: 12 }}>
          <div style={{ fontWeight: 600, marginBottom: 6 }}>Email</div>
          <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required style={{ width: '100%', padding: 12, borderRadius: 10, border: '1px solid #d1d5db' }} />
        </label>
        <label style={{ display: 'block', marginBottom: 12 }}>
          <div style={{ fontWeight: 600, marginBottom: 6 }}>Tipe</div>
          <select value={type} onChange={(event) => setType(event.target.value)} style={{ width: '100%', padding: 12, borderRadius: 10, border: '1px solid #d1d5db' }}>
            <option value="PENGACARA_PUBLIK">PENGACARA_PUBLIK</option>
            <option value="ADVOKAT">ADVOKAT</option>
          </select>
        </label>
        <label style={{ display: 'block', marginBottom: 12 }}>
          <div style={{ fontWeight: 600, marginBottom: 6 }}>Bio</div>
          <textarea value={bio} onChange={(event) => setBio(event.target.value)} rows={5} style={{ width: '100%', padding: 12, borderRadius: 10, border: '1px solid #d1d5db' }} />
        </label>
        <label style={{ display: 'block', marginBottom: 12 }}>
          <div style={{ fontWeight: 600, marginBottom: 6 }}>Spesialisasi</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {specializationOptions.map((item) => (
              <button key={item} type="button" onClick={() => toggleSpecialization(item)} style={{ border: specialization.includes(item) ? '1px solid #3b4a2e' : '1px solid #d1d5db', background: specialization.includes(item) ? '#3b4a2e' : '#fff', color: specialization.includes(item) ? '#fff' : '#374151', borderRadius: 999, padding: '8px 12px', cursor: 'pointer' }}>
                {item.replaceAll('_', ' ')}
              </button>
            ))}
          </div>
        </label>
        <label style={{ display: 'block', marginBottom: 12 }}>
          <div style={{ fontWeight: 600, marginBottom: 6 }}>Foto Profil</div>
          <input type="file" accept="image/*" onChange={(event) => setPhotoFile(event.target.files?.[0] || null)} />
        </label>
        {message && <div style={{ marginBottom: 12, color: '#3b4a2e' }}>{message}</div>}
        <button type="submit" disabled={saving} style={{ background: '#3b4a2e', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 16px', cursor: 'pointer' }}>
          {saving ? 'Menyimpan...' : 'Simpan Konsultan'}
        </button>
      </form>
    </div>
  );
}
