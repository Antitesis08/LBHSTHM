# CONTEXT-HANDOFF.md — Rangkuman Project untuk Melanjutkan di VS Code

Baca file ini dulu sebelum mengerjakan apapun. Ini rangkuman state project LBH STHM sejauh ini, hasil kerja sebelumnya di tool lain (Antigravity) yang sekarang dilanjutkan di sini.

---

## Tech Stack & Konvensi (WAJIB DIIKUTI)

- Next.js App Router, **JavaScript murni (.js/.jsx)** — bukan TypeScript. Jangan buat file `.ts`/`.tsx` baru, ikuti konvensi yang sudah ada.
- Prisma + PostgreSQL (lokal via Laragon).
- **Auth: custom JWT, BUKAN NextAuth.** Sistemnya ada di `lib/auth.js`, pakai `jose`, cookie bernama `lbh_session`. Fungsi yang tersedia:
  - `createSession(user)` — buat cookie session.
  - `getSessionUser()` — ambil user dari session (return `{id, name, email, role}` atau `null`).
  - `requireRole(roles)` — dipakai di awal Route Handler/Server Component, return `{ user }` atau `{ error }` (sudah berupa `Response.json` siap di-return).
  - `clearSession()` — logout.
- Storage dokumen: **Supabase Storage** (S3-compatible), pakai `@aws-sdk/client-s3` dengan `forcePathStyle: true` wajib.
- PDF generation: `@react-pdf/renderer` — jalan lokal, tidak butuh API key eksternal.
- Realtime chat: **belum pakai Pusher** (kredensial belum diisi) — pakai polling dulu (TanStack Query, `refetchInterval`).
- UI: Tailwind + shadcn/ui. Palet warna tema militer (olive/khaki/brass/gunmetal) — lihat detail di bawah kalau perlu.
- **Layout navbar HORIZONTAL DI ATAS untuk semua role** (customer/consultant/admin) — bukan sidebar. Ini keputusan final, sempat ada kesalahan implementasi awal (sidebar) yang sudah diperbaiki.

## Skema Role & RBAC

```
enum Role { CUSTOMER, ADMIN, CONSULTANT }
```
Nilai role di database **persis** `CUSTOMER`/`ADMIN`/`CONSULTANT` (bukan `'Klien'`/`'Admin'`/`'Konsultan'` — sempat ada mapping string Indonesia yang membingungkan di kode lama, sudah dibersihkan supaya pakai nilai asli database langsung).

Proteksi akses 3 lapis (sudah diimplementasikan, ikuti pola ini untuk fitur baru):
1. **Middleware** (`middleware.js`) — cek role dari prefix URL (`/customer/**`, `/consultant/**`, `/admin/**`), redirect ke `/unauthorized` kalau tidak cocok.
2. **`requireRole()` di server component/API** — defense in depth, jangan andalkan middleware saja.
3. **Ownership/assignment check** — query Prisma untuk verifikasi kepemilikan data spesifik (mis. customer cuma boleh akses `case.clientId === user.id`, consultant cuma boleh akses kasus yang `case.consultantId` mengarah ke dia).

## Kategori Dokumen (penting untuk konteks bisnis)

```
enum DocumentSource { CLIENT, CONSULTANT_GENERATED, EXTERNAL_OFFICIAL }
```
- `CLIENT` — upload dari klien (bukti, KTP, SKTM, dll.), tidak pernah digenerate sistem.
- `CONSULTANT_GENERATED` — bisa diupload manual ATAU digenerate via fitur PDF. **Saat ini hanya 2 template aktif: `RINGKASAN_KONSULTASI` dan `LEGAL_OPINION`.** Template `SURAT_KUASA` dan `SOMASI` sengaja **ditolak (501)** karena formatnya belum direview advokat STHM — jangan diaktifkan tanpa konfirmasi eksplisit.
- `EXTERNAL_OFFICIAL` — dokumen dari pihak eksternal (Putusan Pengadilan, Sertifikat HKI DJKI, Akta Notaris) — hanya upload manual, tidak pernah digenerate.

## Status Kasus & Alur

```
enum CaseStatus { DIAJUKAN, DIVERIFIKASI, DITUGASKAN, PROSES, MENUNGGU_DOKUMEN, SELESAI, DITOLAK }
```
Alur: Customer ajukan (boleh sertakan `preferredConsultantId` sebagai USULAN opsional, bukan penugasan resmi) → Admin verifikasi → Admin assign konsultan resmi (`consultantId`, boleh ikuti preferensi atau ganti) → Konsultan proses → Selesai.

**Penting:** `preferredConsultantId` TIDAK PERNAH memberi akses ke kasus — akses konsultan murni berdasarkan `consultantId` resmi hasil assignment admin.

## Progress Sejauh Ini (sudah selesai)

- ✅ Auth: register/login manual + Google login (via Supabase Auth, dijembatani ke `lbh_session` custom lewat `createSession()` di route `/app/auth/callback`).
- ✅ Upload dokumen + generate PDF (2 template aktif) — komponen `DocumentUploader.jsx`, `DocumentList.jsx`, `GenerateDocumentModal.jsx` sudah diekstrak jadi reusable.
- ✅ Refactor layout: `TopNavbar.jsx` per role, `app/customer/layout.jsx`, `app/consultant/layout.jsx`, `app/admin/layout.jsx`.
- ✅ Middleware proteksi route (`middleware.js`) + halaman `/unauthorized`.
- ✅ Halaman detail kasus: `app/customer/kasus/[id]/page.jsx`, `app/consultant/kasus/[id]/page.jsx`, dengan `CaseStepper.jsx` (stepper + keterangan status) dan ownership/assignment check server-side.
- ✅ `CaseRow` di list kasus sudah diubah dari toast jadi `router.push()` ke halaman detail.

## Sedang Dikerjakan / Belum Selesai

- ⬜ **Smoke test keamanan** — 3 skenario ini HARUS dijalankan dan dipastikan hijau sebelum lanjut fitur baru:
  1. Customer A akses URL kasus milik Customer B secara manual → harus redirect `/unauthorized`.
  2. Consultant yang tidak ditugaskan akses URL kasus tersebut → harus redirect `/unauthorized`.
  3. Customer akses URL `/consultant/...` atau `/admin/...` manual → harus redirect `/unauthorized`.
- ⬜ **Fitur Chat per kasus — BELUM DIMULAI SAMA SEKALI.** Ini task berikutnya. Spesifikasi lengkap:
  - Model `Message` (caseId, senderId, content, createdAt) — cek dulu apakah sudah ada di schema, sesuaikan kalau beda struktur.
  - Endpoint: `GET/POST /api/cases/:id/messages`, pakai `requireRole()` + ownership check yang sama seperti pola di atas. Tolak kirim pesan kalau status kasus `SELESAI`/`DITOLAK` (409).
  - Buat `Notification` ke lawan bicara setiap ada pesan baru.
  - Komponen `<ChatThread caseId />` — bubble chat, polling via TanStack Query (`refetchInterval: 8000`, pakai param `?after=` biar hemat), optimistic update saat kirim.
  - **Pasang di tab "Pesan" yang SUDAH ADA sebagai placeholder** di kedua halaman detail kasus (customer & consultant) — jangan bikin route baru.
  - Field yang tersedia dari `getSessionUser()`: `id, name, email, role` saja — jangan asumsikan ada field lain.

## Fitur yang Masih Ditunda (belum prioritas)

- Realtime Pusher (masih polling dulu, kredensial belum diisi).
- Jadwal/kalender konsultan (Bab 1.5/2.4 di spesifikasi dashboard).
- Statistik & laporan admin.
- Manajemen konten publik (landing page editor).
- Payment gateway sesi berbayar lanjutan.

---

**Instruksi untuk kamu (AI assistant di VS Code):** Lanjutkan dari titik "Sedang Dikerjakan" di atas. Kalau ada bagian struktur kode (skema Prisma, nama file, fungsi helper) yang berbeda dari yang disebut di sini, TELUSURI DULU kode aktual di project sebelum asumsi — dokumen ini rangkuman keputusan desain, bukan cermin 100% akurat dari kode saat ini (kode adalah sumber kebenaran, dokumen ini panduan konteks/niat).
