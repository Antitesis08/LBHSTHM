'use client';

import { useState } from 'react';
import { Pencil, Trash2, X, AlertTriangle, UserX } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function UserActions({ user }) {
  const router = useRouter();
  const [editModal, setEditModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [googleEmailWarningModal, setGoogleEmailWarningModal] = useState(false);
  const [pendingGoogleUpdatePayload, setPendingGoogleUpdatePayload] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isSoftDelete = user._count.casesAsClient > 0 || (user.consultantProfile?._count?.casesAssigned > 0);
  const isSelf = false; // We can check this if we passed the current user id, but server API will block it anyway. Actually, let's just pass currentUser. Wait, server blocks it.

  async function handleEdit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    const formData = new FormData(e.currentTarget);
    const payload = {
      name: formData.get('name'),
      email: formData.get('email'),
      phone: formData.get('phone') || undefined,
      newPassword: formData.get('newPassword') || undefined,
    };
    
    if (user.role === 'CONSULTANT') {
      payload.bio = formData.get('bio') || undefined;
      const specs = formData.get('specialization');
      if (specs) payload.specialization = specs.split(',').map(s => s.trim()).filter(Boolean);
      payload.isAvailable = formData.get('isAvailable') === 'true';
    }

    if (user.provider === 'GOOGLE' && payload.email !== user.email) {
      setPendingGoogleUpdatePayload(payload);
      setGoogleEmailWarningModal(true);
      setLoading(false);
      return;
    }

    await executeUpdate(payload);
  }

  async function executeUpdate(payload) {
    setLoading(true);
    try {
      const res = await fetch(`/api/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal menyimpan');
      
      setEditModal(false);
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/users/${user.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal menghapus');
      
      setDeleteModal(false);
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ display: 'flex', gap: 8 }}>
      <button 
        onClick={() => setEditModal(true)} 
        style={{ padding: '6px 12px', borderRadius: 6, background: '#f3f4f6', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 500, color: '#374151' }}
      >
        <Pencil size={14} /> Edit
      </button>
      
      <button 
        onClick={() => setDeleteModal(true)}
        disabled={user.isActive === false} // Optional: disable delete if already soft-deleted? No, user requested soft-delete on related cases, meaning they might already be soft deleted. Let's disable if already soft deleted.
        style={{ padding: '6px 12px', borderRadius: 6, background: user.isActive === false ? '#f3f4f6' : '#fee2e2', border: 'none', cursor: user.isActive === false ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 500, color: user.isActive === false ? '#9ca3af' : '#991b1b' }}
      >
        {isSoftDelete ? <UserX size={14} /> : <Trash2 size={14} />} 
        {isSoftDelete ? 'Nonaktifkan' : 'Hapus Permanen'}
      </button>

      {/* Edit Modal */}
      {editModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onMouseDown={() => setEditModal(false)}>
          <div style={{ background: '#fff', padding: 24, borderRadius: 12, width: '100%', maxWidth: 500, maxHeight: '90vh', overflowY: 'auto' }} onMouseDown={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ fontSize: 18, fontWeight: 600 }}>Edit User: {user.name}</h2>
              <button onClick={() => setEditModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} color="#657068" /></button>
            </div>
            
            {error && <div style={{ padding: 12, background: '#fee2e2', color: '#991b1b', borderRadius: 8, marginBottom: 16, fontSize: 14 }}>{error}</div>}

            <form onSubmit={handleEdit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 14, fontWeight: 500 }}>
                Nama Lengkap
                <input name="name" defaultValue={user.name} required style={{ padding: 10, borderRadius: 6, border: '1px solid #d1d5db' }} />
              </label>
              
              <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 14, fontWeight: 500 }}>
                Email Baru (Admin Override)
                <input name="email" type="email" defaultValue={user.email} required style={{ padding: 10, borderRadius: 6, border: '1px solid #d1d5db' }} />
              </label>

              <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 14, fontWeight: 500 }}>
                Reset Password (opsional, biarkan kosong jika tidak diubah)
                <input name="newPassword" type="password" minLength={8} placeholder="Masukkan password baru (minimal 8 karakter)..." style={{ padding: 10, borderRadius: 6, border: '1px solid #d1d5db' }} />
              </label>

              <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 14, fontWeight: 500 }}>
                Nomor Telepon
                <input name="phone" defaultValue={user.phone || ''} style={{ padding: 10, borderRadius: 6, border: '1px solid #d1d5db' }} />
              </label>

              {user.role === 'CONSULTANT' && (
                <>
                  <div style={{ height: 1, background: '#e5e7eb', margin: '8px 0' }} />
                  <p style={{ fontWeight: 600, fontSize: 14 }}>Profil Konsultan</p>
                  
                  <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 14, fontWeight: 500 }}>
                    Spesialisasi (pisahkan dengan koma)
                    <input name="specialization" defaultValue={(user.consultantProfile?.specialization || []).join(', ')} style={{ padding: 10, borderRadius: 6, border: '1px solid #d1d5db' }} />
                  </label>
                  
                  <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 14, fontWeight: 500 }}>
                    Bio
                    <textarea name="bio" defaultValue={user.consultantProfile?.bio || ''} style={{ padding: 10, borderRadius: 6, border: '1px solid #d1d5db', minHeight: 80 }} />
                  </label>

                  <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 14, fontWeight: 500 }}>
                    Status Ketersediaan
                    <select name="isAvailable" defaultValue={user.consultantProfile?.isAvailable ? 'true' : 'false'} style={{ padding: 10, borderRadius: 6, border: '1px solid #d1d5db' }}>
                      <option value="true">Tersedia (Bisa ditugaskan kasus baru)</option>
                      <option value="false">Tidak Tersedia</option>
                    </select>
                  </label>
                </>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 16 }}>
                <button type="button" onClick={() => setEditModal(false)} style={{ padding: '10px 16px', background: '#f3f4f6', border: 'none', borderRadius: 8, fontWeight: 500, cursor: 'pointer' }}>Batal</button>
                <button type="submit" disabled={loading} style={{ padding: '10px 16px', background: 'var(--primary, #3b4a2e)', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 500, cursor: loading ? 'wait' : 'pointer' }}>
                  {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onMouseDown={() => setDeleteModal(false)}>
          <div style={{ background: '#fff', padding: 24, borderRadius: 12, width: '100%', maxWidth: 400 }} onMouseDown={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#fee2e2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <AlertTriangle size={24} />
              </div>
              <h2 style={{ fontSize: 18, fontWeight: 600 }}>Konfirmasi {isSoftDelete ? 'Penonaktifan' : 'Penghapusan'}</h2>
            </div>
            
            {error && <div style={{ padding: 12, background: '#fee2e2', color: '#991b1b', borderRadius: 8, marginBottom: 16, fontSize: 14 }}>{error}</div>}

            {isSoftDelete ? (
              <p style={{ color: '#4b5563', fontSize: 14, marginBottom: 24, lineHeight: 1.5 }}>
                Pengguna <strong>{user.name}</strong> memiliki data riwayat kasus di dalam sistem. Data pengguna ini <strong>tidak dapat dihapus secara permanen</strong> demi menjaga integritas data kasus.<br/><br/>
                Tindakan ini akan <strong>menonaktifkan</strong> akun tersebut, sehingga pengguna tidak dapat lagi login atau menggunakan aplikasi. Anda yakin?
              </p>
            ) : (
              <p style={{ color: '#4b5563', fontSize: 14, marginBottom: 24, lineHeight: 1.5 }}>
                Pengguna <strong>{user.name}</strong> belum memiliki kasus apapun. Anda yakin ingin <strong>menghapus permanen</strong> akun ini beserta profilnya? Tindakan ini tidak dapat dibatalkan.
              </p>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              <button onClick={() => setDeleteModal(false)} style={{ padding: '10px 16px', background: '#f3f4f6', border: 'none', borderRadius: 8, fontWeight: 500, cursor: 'pointer' }}>Batal</button>
              <button onClick={handleDelete} disabled={loading} style={{ padding: '10px 16px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 500, cursor: loading ? 'wait' : 'pointer' }}>
                {loading ? 'Memproses...' : isSoftDelete ? 'Ya, Nonaktifkan' : 'Ya, Hapus Permanen'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Google Email Warning Modal */}
      {googleEmailWarningModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onMouseDown={() => setGoogleEmailWarningModal(false)}>
          <div style={{ background: '#fff', padding: 24, borderRadius: 12, width: '100%', maxWidth: 450 }} onMouseDown={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <AlertTriangle size={24} />
              </div>
              <h2 style={{ fontSize: 18, fontWeight: 600 }}>Peringatan Perubahan Email</h2>
            </div>
            
            <p style={{ color: '#4b5563', fontSize: 14, marginBottom: 24, lineHeight: 1.5 }}>
              Mengubah email akun yang terhubung dengan Google dapat menyebabkan duplikat akun saat user tersebut login kembali menggunakan Google. Anda yakin ingin melanjutkan perubahan email ini?
            </p>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              <button onClick={() => setGoogleEmailWarningModal(false)} style={{ padding: '10px 16px', background: '#f3f4f6', border: 'none', borderRadius: 8, fontWeight: 500, cursor: 'pointer' }}>Batal</button>
              <button 
                onClick={() => {
                  setGoogleEmailWarningModal(false);
                  executeUpdate(pendingGoogleUpdatePayload);
                }} 
                disabled={loading} 
                style={{ padding: '10px 16px', background: '#d97706', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 500, cursor: loading ? 'wait' : 'pointer' }}
              >
                {loading ? 'Memproses...' : 'Ya, Ubah Email'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
