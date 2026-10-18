# SETUP-KONFIGURASI.md — Mengaktifkan Modul Lanjutan LBH STHM

Panduan ini melengkapi `CLAUDE.md`. Ikuti urutan di bawah — setiap bagian independen, tapi disusun dari yang paling wajib (database) ke yang paling opsional (chat realtime), supaya kamu bisa berhenti kapan saja dan aplikasi tetap berjalan dengan fitur yang sudah aktif.

Buat file `.env` di root project (jangan commit ke Git — tambahkan ke `.gitignore`) dan isi bertahap sesuai langkah di bawah.

```
# .env — isi bertahap, jangan commit
DATABASE_URL=
NEXTAUTH_URL=
NEXTAUTH_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
S3_ENDPOINT=
S3_ACCESS_KEY_ID=
S3_SECRET_ACCESS_KEY=
S3_BUCKET_NAME=
RESEND_API_KEY=
EMAIL_FROM=
PUSHER_APP_ID=
PUSHER_KEY=
PUSHER_SECRET=
PUSHER_CLUSTER=
```

---

## 1. PostgreSQL via Laragon (WAJIB — dasar semua fitur)

Kamu sudah menyalakan PostgreSQL di Laragon, jadi tinggal ambil kredensialnya:

1. Buka **Laragon** → klik kanan pada tray/menu utama → pastikan service **PostgreSQL** berstatus running (ikon hijau).
2. Klik menu **Laragon > PostgreSQL > pgAdmin** (jika terpasang) atau buka terminal Laragon (`Menu > Terminal`) lalu jalankan:
   ```
   psql -U postgres
   ```
   Password default Laragon untuk PostgreSQL biasanya kosong atau `root` — coba dulu Enter kosong, kalau gagal coba `root`.
3. Setelah masuk psql, buat database khusus proyek:
   ```sql
   CREATE DATABASE lbh_sthm;
   \q
   ```
4. Cek port PostgreSQL Laragon (biasanya **5432**, kadang Laragon memakai **5433** kalau bentrok dengan instalasi lain — cek di Laragon > Preferences > Services & ports).
5. Isi `DATABASE_URL` di `.env`:
   ```
   DATABASE_URL="postgresql://postgres:root@localhost:5432/lbh_sthm?schema=public"
   ```
   Ganti `root` dengan password asli kamu, dan `5432` dengan port aktualnya.
6. Jalankan migrasi Prisma agar semua tabel di Bab 8 `CLAUDE.md` benar-benar terbentuk:
   ```bash
   npx prisma migrate dev --name init
   npx prisma generate
   ```
7. Verifikasi dengan GUI:
   ```bash
   npx prisma studio
   ```
   Browser akan terbuka menampilkan isi tabel — kalau tabel `User`, `Case`, dll. muncul, database sudah tersambung nyata.

✅ **Setelah langkah ini selesai**, fitur register/login manual, pengajuan kasus, dan dashboard status SUDAH bisa berjalan penuh (tidak perlu menunggu layanan lain).

---

## 2. Google OAuth (untuk tombol "Daftar/Masuk dengan Google")

1. Buka **https://console.cloud.google.com/** → login dengan akun Google kamu.
2. Buat project baru (mis. nama `lbh-sthm`).
3. Di sidebar, buka **APIs & Services > OAuth consent screen**:
   - User Type: **External**.
   - Isi nama aplikasi (mis. "LBH STHM"), email support, logo (opsional).
   - Scopes: cukup default (`email`, `profile`, `openid`).
   - Tambahkan akun email kamu sendiri di **Test users** (selama app belum diverifikasi Google, hanya test user yang bisa login).
4. Buka **APIs & Services > Credentials** → **Create Credentials > OAuth client ID**:
   - Application type: **Web application**.
   - Authorized JavaScript origins: `http://localhost:3000`
   - Authorized redirect URIs: `http://localhost:3000/api/auth/callback/google`
   - Simpan → akan muncul **Client ID** dan **Client Secret**.
5. Isi ke `.env`:
   ```
   GOOGLE_CLIENT_ID="xxxx.apps.googleusercontent.com"
   GOOGLE_CLIENT_SECRET="xxxx"
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="<generate dengan: openssl rand -base64 32>"
   ```
6. Pastikan `lib/auth` (NextAuth config) sudah memasukkan `GoogleProvider` dengan `clientId`/`clientSecret` dari `process.env`.
7. Restart dev server (`npm run dev`), lalu coba klik "Masuk dengan Google" — akan redirect ke halaman consent Google beneran.

⚠️ Saat nanti deploy ke domain produksi, tambahkan origin & redirect URI produksi di langkah 4, dan submit app untuk verifikasi Google (kalau target user > test user list) agar warning "unverified app" hilang.

---

## 3. Penyimpanan File — Cloudflare R2 (untuk upload dokumen & hasil PDF)

R2 dipilih karena API-compatible dengan S3 tapi tanpa biaya egress, dan ada free tier.

1. Buat akun di **https://dash.cloudflare.com/** (gratis).
2. Masuk ke **R2 Object Storage** → **Create bucket** → beri nama mis. `lbh-sthm-docs`.
3. Buka **Manage R2 API Tokens** → **Create API Token** dengan permission **Object Read & Write**, scope ke bucket tersebut.
4. Catat: **Access Key ID**, **Secret Access Key**, dan **Endpoint** (formatnya `https://<account_id>.r2.cloudflarestorage.com`).
5. Isi ke `.env`:
   ```
   S3_ENDPOINT="https://<account_id>.r2.cloudflarestorage.com"
   S3_ACCESS_KEY_ID="xxxx"
   S3_SECRET_ACCESS_KEY="xxxx"
   S3_BUCKET_NAME="lbh-sthm-docs"
   ```
6. Install SDK jika belum:
   ```bash
   npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
   ```
7. Pastikan helper di `/lib/storage` memakai `S3Client` dari `@aws-sdk/client-s3` dengan config `endpoint`, `region: "auto"`, dan credentials dari `.env` — dipakai di endpoint `POST /api/cases/:id/documents` dan `generate-doc`.

**Alternatif lebih sederhana untuk development lokal** (tanpa daftar cloud dulu): simpan file sementara ke folder lokal `/public/uploads` menggunakan `fs` Node.js biasa. Ini valid untuk tahap development, tapi **wajib** dipindah ke R2/S3 sebelum production karena Vercel/serverless tidak punya disk permanen.

---

## 4. Email/SMTP (verifikasi akun & notifikasi)

Pilihan termudah untuk mulai: **Resend** (gratis untuk volume kecil, setup jauh lebih simpel dari SMTP manual).

1. Daftar di **https://resend.com/** → verifikasi domain (atau pakai domain sandbox mereka dulu untuk testing).
2. Ambil **API Key** di dashboard.
3. Isi `.env`:
   ```
   RESEND_API_KEY="re_xxxx"
   EMAIL_FROM="LBH STHM <no-reply@yourdomain.com>"
   ```
4. Install:
   ```bash
   npm install resend
   ```
5. Buat helper `/lib/email/sendEmail.ts` yang memanggil Resend API — dipakai untuk: email verifikasi register, notifikasi status kasus berubah, pengingat jadwal.

**Alternatif:** kalau mau pakai Gmail SMTP biasa untuk testing cepat, gunakan `nodemailer` dengan **App Password** Gmail (bukan password akun biasa — aktifkan di myaccount.google.com/apppasswords, butuh 2FA aktif dulu).

---

## 5. Realtime Chat & Notifikasi — Pusher (lebih mudah dari self-host Socket.IO)

Karena Next.js di Vercel serverless tidak cocok untuk server Socket.IO permanen, **Pusher** lebih praktis untuk mulai:

1. Daftar di **https://pusher.com/** → buat app baru (Channels), pilih region terdekat (Singapore/ap1 kalau ada).
2. Ambil `app_id`, `key`, `secret`, `cluster` dari dashboard.
3. Isi `.env`:
   ```
   PUSHER_APP_ID="xxxx"
   PUSHER_KEY="xxxx"
   PUSHER_SECRET="xxxx"
   PUSHER_CLUSTER="ap1"
   ```
4. Install:
   ```bash
   npm install pusher pusher-js
   ```
5. Server (`/lib/realtime/pusherServer.ts`) trigger event saat ada pesan baru (`POST /api/cases/:id/messages`); client (`pusher-js`) subscribe ke channel `case-{caseId}` di halaman chat untuk update instan.

*(Kalau nanti skala besar & perlu self-host penuh, baru migrasi ke Socket.IO di server Node terpisah — tidak wajib di tahap awal.)*

---

## 6. Generate PDF (Legal Opinion, Surat) — Tidak butuh kredensial eksternal

Ini beda dari layanan lain: **`@react-pdf/renderer` berjalan sepenuhnya lokal**, tidak butuh API key pihak ketiga.

1. Install:
   ```bash
   npm install @react-pdf/renderer
   ```
2. Buat template dokumen di `/lib/pdf/templates/legalOpinion.tsx` menggunakan komponen `Document`, `Page`, `Text` dari library ini, isi data dari `Case` (judul, deskripsi, nama klien, nama konsultan, tanggal).
3. Di endpoint `POST /api/cases/:id/generate-doc`: render PDF ke buffer (`renderToStream`/`renderToBuffer`), upload buffer tersebut ke R2/S3 (Bab 3), simpan record baru di tabel `Document` dengan `isGenerated: true`.
4. Modul ini otomatis aktif begitu Bab 1 (database) dan Bab 3 (storage) sudah jalan — tidak ada langkah pendaftaran tambahan.

---

## 7. Menangani 3 Vulnerability npm

Jangan langsung `npm audit fix --force` tanpa cek dulu — kadang itu memaksa downgrade/upgrade major version yang bisa merusak kompatibilitas.

Langkah aman:
```bash
npm audit                # lihat detail: paket apa, severity apa, disebabkan oleh dependency langsung/transitif
npm audit fix            # perbaikan otomatis yang AMAN (tidak ganti major version)
npm audit                # cek ulang sisa
```

Jika masih ada sisa setelah `npm audit fix`:
1. Lihat nama paket & severity-nya (`npm audit` menampilkan detail + link advisory).
2. Cek apakah itu **dependency langsung** kamu atau **transitif** (dependency-nya-dependency). Kalau transitif dan severity low/moderate serta belum ada fix resmi, biasanya aman ditunda dan dipantau — dokumentasikan di README sebagai known issue.
3. Kalau severity **high/critical** dan ada fix version: update manual paket tersebut ke versi yang disebutkan advisory:
   ```bash
   npm install <nama-paket>@<versi-aman>
   ```
4. Setelah update, jalankan test/build ulang untuk pastikan tidak ada breaking change:
   ```bash
   npm run build
   ```
5. Hindari `npm audit fix --force` kecuali kamu sudah baca changelog paket yang di-downgrade/upgrade dan siap uji ulang seluruh fitur terkait.

---

## 8. Urutan Rekomendasi Pengerjaan

| Prioritas | Langkah | Dampak jika dilakukan |
|---|---|---|
| 1 | Bab 1 — Postgres/Prisma | Auth manual, pengajuan kasus, dashboard status **langsung aktif** |
| 2 | Bab 7 — `npm audit fix` | Menutup celah keamanan sebelum fitur lain ditambah |
| 3 | Bab 2 — Google OAuth | Tombol "Daftar/Masuk dengan Google" aktif |
| 4 | Bab 3 — R2/S3 | Upload dokumen klien & unduh hasil aktif |
| 5 | Bab 6 — PDF generator | Fitur "buat Legal Opinion" otomatis aktif (tinggal Bab 1+3 selesai) |
| 6 | Bab 4 — Email/SMTP | Notifikasi & verifikasi email aktif |
| 7 | Bab 5 — Pusher | Chat & notifikasi real-time aktif |

Setelah setiap bab selesai, jalankan `npm run dev` dan uji fitur terkait sebelum lanjut ke bab berikutnya — supaya kalau ada error, kamu tahu persis penyebabnya dari langkah mana.

---

*Simpan file ini bersama `CLAUDE.md` di root repository sebagai referensi setup tim.*