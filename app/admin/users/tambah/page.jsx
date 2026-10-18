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

export default function AdminUserCreatePage() {
  const router = useRouter();
  
  const [role, setRole] = useState('CUSTOMER');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  
  // Consultant Specifics
  const [type, setType] = useState('PENGACARA_PUBLIK');
  const [bio, setBio] = useState('');
  const [specialization, setSpecialization] = useState([]);
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const toggleSpecialization = (value) => {
    setSpecialization((prev) => prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    if (password.length < 8) {
      setMessage({ type: 'error', text: 'Password minimal 8 karakter.' });
      setLoading(false);
      return;
    }

    try {
      const payload = { role, name, email, password, phone: phone || undefined };
      if (role === 'CONSULTANT') {
        payload.consultantData = {
          type,
          bio: bio || undefined,
          specialization
        };
      }

      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || 'Gagal membuat user.');
      
      setMessage({ type: 'success', text: `User ${name} berhasil ditambahkan.` });
      setTimeout(() => router.push('/admin/users'), 1500);
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: 24 }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Tambah User Baru</h1>
      <p style={{ color: '#657068', marginBottom: 24 }}>Tambahkan pengguna baru untuk sistem ini dengan menetapkan peran (role) secara spesifik.</p>

      {message.text && (
        <div style={{ padding: 12, borderRadius: 8, marginBottom: 16, fontSize: 14, background: message.type === 'error' ? '#fee2e2' : '#dcfce7', color: message.type === 'error' ? '#991b1b' : '#166534' }}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ background: '#fff', borderRadius: 16, padding: 24, border: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 14, fontWeight: 500 }}>
          Peran (Role)
          <select value={role} onChange={e => setRole(e.target.value)} style={{ padding: 10, borderRadius: 8, border: '1px solid #d1d5db' }}>
            <option value="CUSTOMER">Klien (Customer)</option>
            <option value="CONSULTANT">Konsultan (Consultant)</option>
            <option value="ADMIN">Administrator (Admin)</option>
          </select>
        </label>

        <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 14, fontWeight: 500 }}>
          Nama Lengkap
          <input value={name} onChange={e => setName(e.target.value)} required style={{ padding: 10, borderRadius: 8, border: '1px solid #d1d5db' }} />
        </label>
        
        <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 14, fontWeight: 500 }}>
          Alamat Email
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required style={{ padding: 10, borderRadius: 8, border: '1px solid #d1d5db' }} />
        </label>

        <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 14, fontWeight: 500 }}>
          Password Awal
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={8} style={{ padding: 10, borderRadius: 8, border: '1px solid #d1d5db' }} />
        </label>

        <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 14, fontWeight: 500 }}>
          Nomor Telepon (opsional)
          <input value={phone} onChange={e => setPhone(e.target.value)} style={{ padding: 10, borderRadius: 8, border: '1px solid #d1d5db' }} />
        </label>

        {role === 'CONSULTANT' && (
          <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column', gap: 16 }}>
            <h2 style={{ fontSize: 16, fontWeight: 600 }}>Profil Konsultan</h2>
            <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 14, fontWeight: 500 }}>
              Tipe Konsultan
              <select value={type} onChange={e => setType(e.target.value)} style={{ padding: 10, borderRadius: 8, border: '1px solid #d1d5db' }}>
                <option value="PENGACARA_PUBLIK">Pengacara Publik</option>
                <option value="ADVOKAT">Advokat</option>
              </select>
            </label>
            <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 14, fontWeight: 500 }}>
              Spesialisasi
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 4 }}>
                {specializationOptions.map((item) => (
                  <button key={item} type="button" onClick={() => toggleSpecialization(item)} style={{ border: specialization.includes(item) ? '1px solid var(--primary, #3b4a2e)' : '1px solid #d1d5db', background: specialization.includes(item) ? 'var(--primary, #3b4a2e)' : '#fff', color: specialization.includes(item) ? '#fff' : '#374151', borderRadius: 999, padding: '6px 12px', fontSize: 12, cursor: 'pointer' }}>
                    {item.replaceAll('_', ' ')}
                  </button>
                ))}
              </div>
            </label>
            <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 14, fontWeight: 500 }}>
              Bio
              <textarea value={bio} onChange={e => setBio(e.target.value)} rows={4} style={{ padding: 10, borderRadius: 8, border: '1px solid #d1d5db' }} />
            </label>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 16 }}>
          <button type="button" onClick={() => router.back()} style={{ padding: '10px 16px', background: '#f3f4f6', border: 'none', borderRadius: 8, fontWeight: 500, cursor: 'pointer' }}>Batal</button>
          <button type="submit" disabled={loading} style={{ padding: '10px 16px', background: 'var(--primary, #3b4a2e)', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 500, cursor: loading ? 'wait' : 'pointer' }}>
            {loading ? 'Menyimpan...' : 'Simpan User Baru'}
          </button>
        </div>
      </form>
    </div>
  );
}
