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

export default function ConsultantProfileForm({ profile }) {
  const router = useRouter();
  const [bio, setBio] = useState(profile?.bio || '');
  const [specialization, setSpecialization] = useState(profile?.specialization || []);
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
      formData.set('bio', bio);
      formData.set('specialization', JSON.stringify(specialization));
      if (photoFile) formData.set('photo', photoFile);

      const res = await fetch('/api/consultant/profile', {
        method: 'PATCH',
        credentials: 'include',
        body: formData,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Gagal menyimpan profil.');
      setMessage('Profil berhasil diperbarui.');
      router.refresh();
    } catch (error) {
      setMessage(error.message || 'Terjadi kesalahan.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: 24 }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Profil Konsultan</h1>
      <p style={{ color: '#657068', marginBottom: 20 }}>Lengkapi biodata dan foto profil untuk muncul di daftar konsultan yang bisa dipilih customer.</p>
      <form onSubmit={handleSubmit} style={{ background: '#fff', borderRadius: 16, padding: 20, border: '1px solid #e5e7eb' }}>
        <label style={{ display: 'block', marginBottom: 12 }}>
          <div style={{ fontWeight: 600, marginBottom: 6 }}>Bio</div>
          <textarea value={bio} onChange={(event) => setBio(event.target.value)} rows={6} style={{ width: '100%', padding: 12, borderRadius: 10, border: '1px solid #d1d5db' }} />
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
          {saving ? 'Menyimpan...' : 'Simpan Profil'}
        </button>
      </form>
    </div>
  );
}
