# CLAUDE.md — Platform LBH STHM (Lembaga Bantuan Hukum Sekolah Tinggi Hukum Militer)

Dokumen ini adalah **konteks kerja utama** untuk Claude (atau developer lain) saat membangun, memperluas, atau memperbaiki platform ini. Rujukan fitur diambil dari struktur layanan LBH/LKBH kampus (mis. LKBH-PPS FH UI), disesuaikan dengan identitas STHM sebagai institusi bernuansa hukum militer.

> Catatan: dokumen ini adalah blueprint hasil observasi pola umum situs LBH kampus (layanan konsultasi, pendampingan, legal opinion, mediasi, HKI, pro bono) — bukan tiruan piksel-demi-piksel dari satu situs tertentu. Struktur fitur & alurnya dibuat relevan dan bisa diadaptasi bebas oleh tim STHM.

> **PRINSIP UTAMA REVISI INI: TIDAK ADA DUMMY.** Setiap fitur yang disebut di dokumen ini WAJIB direalisasikan sebagai fungsi yang benar-benar berjalan: request masuk ke REST API sungguhan → diproses backend → dibaca/ditulis ke PostgreSQL sungguhan → response nyata dikirim ke UI. Tidak boleh ada tombol yang hanya `console.log`, data hardcode di komponen, atau alur yang "terlihat jalan" tapi tidak tersambung ke database.

---

## 1. Ringkasan Proyek

**Nama produk:** LBH STHM — Layanan Konsultasi & Bantuan Hukum
**Tujuan:** Website/aplikasi resmi Lembaga Bantuan Hukum di bawah naungan STHM yang memfasilitasi masyarakat sipil, anggota militer/purnawirawan, dan keluarganya untuk mendapatkan konsultasi hukum, pendampingan, dan layanan hukum lain secara daring maupun tatap muka.

**Target pengguna:**
- **Customer / Klien** — masyarakat umum yang mencari bantuan hukum.
- **Admin** — pengelola operasional LBH.
- **Konsultan Hukum** — pengacara publik & advokat yang menangani kasus/konsultasi.

**Platform target:** Web app **responsive** yang bisa diakses baik dari desktop maupun mobile browser, dibangun sebagai **PWA (Progressive Web App)** agar bisa "di-install" ke home screen HP tanpa perlu publish ke App Store/Play Store dulu (memperluas akses tanpa biaya/waktu review store).

---

## 2. Identitas Visual & Layout (Revisi: Navbar di Atas)

### 2.1 Struktur Layout — Top Navbar (bukan sidebar)

Semua area (publik, customer, konsultan, admin) memakai **navbar horizontal di bagian atas**, bukan sidebar samping:

```
┌───────────────────────────────────────────────────────────┐
│ [Logo LBH STHM]   Beranda  Layanan  Tentang   [🔔] [Avatar▾]│  <- Top Navbar (sticky)
├───────────────────────────────────────────────────────────┤
│                                                             │
│                     Konten Halaman / Dashboard             │
│                                                             │
└───────────────────────────────────────────────────────────┘
```

- **Publik (belum login):** Navbar berisi Beranda, Layanan, Tentang Kami, Galeri, Kontak, tombol `Masuk` dan `Ajukan Bantuan Hukum` (CTA, warna brass/gold, paling menonjol).
- **Customer (sudah login):** Navbar berisi Dashboard, Kasus Saya, Jadwal, Pesan, ikon notifikasi (lonceng dengan badge jumlah), dan dropdown avatar (Profil, Pengaturan, Keluar).
- **Konsultan:** Navbar berisi Dashboard, Kasus Ditugaskan, Jadwal & Ketersediaan, Pesan, notifikasi, dropdown avatar.
- **Admin:** Navbar berisi Dashboard, Manajemen Kasus, Manajemen User, Konten Publik, Laporan, notifikasi, dropdown avatar.
- **Mobile (< 768px):** Menu navbar dikompres jadi **hamburger icon** di kanan yang membuka dropdown/drawer dari atas (bukan sidebar permanen). Notifikasi & avatar tetap terlihat di navbar; sisanya masuk ke menu hamburger. Tidak ada bottom-tab-bar terpisah — konsisten satu pola navigasi (navbar atas) di semua ukuran layar sesuai permintaan.
- Navbar bersifat **sticky** (menempel saat scroll) dengan sedikit shadow saat halaman di-scroll agar tetap terasa interaktif.

### 2.2 Palet Warna (tema militer, tidak monoton)

| Peran | Warna | Hex | Catatan |
|---|---|---|---|
| Primary (Olive/Army Green) | Hijau army gelap | `#3B4A2E` | Navbar, tombol utama |
| Primary Light | Olive sedang | `#5C6B3F` | Hover state, section background |
| Secondary (Khaki/Desert) | Khaki hangat | `#C9BFA0` | Background section, card |
| Accent (Brass/Gold) | Emas kuningan | `#C9A227` | CTA utama ("Ajukan Bantuan Hukum"), badge status |
| Dark (Gunmetal) | Abu gelap kebiruan | `#2C3333` | Teks utama, footer |
| Support (Steel Blue) | Biru baja pudar | `#4A5D6B` | Grafik, elemen sekunder, tautan |
| Success | Hijau zaitun terang | `#7A9B57` | Status disetujui/selesai |
| Warning | Kuning tanah | `#D9A441` | Status menunggu |
| Danger | Merah bata gelap | `#8C3B2E` | Status ditolak/urgent |
| Netral background | Off-white hangat | `#F4F1EA` | Background halaman |

Prinsip: card dengan shadow lembut, sudut membulat sedang (8–12px), transisi 150–250ms, hindari kesan formulir pemerintah yang kaku. Tipografi heading `Poppins`/`Inter SemiBold`, body `Inter`/`Source Sans 3`.

### 2.3 Mobile-First & Responsive
- Semua breakpoint dirancang mobile-first dengan Tailwind (`sm`, `md`, `lg`, `xl`).
- Form pengajuan kasus, upload dokumen, chat, dan kalender jadwal WAJIB diuji dan berfungsi penuh di layar mobile (bukan hanya menyusut, tapi komponen seperti date-picker & upload harus tetap dapat dioperasikan dengan nyaman di layar sentuh).
- Tambahkan `manifest.json` + service worker (`next-pwa` atau `@ducanh2912/next-pwa`) agar web app bisa di-*add to home screen*.
- Gambar dioptimasi (`next/image`) agar loading tetap cepat di jaringan mobile.

---

## 3. Tech Stack (Revisi: eksplisit REST API + integrasi database nyata)

| Layer | Pilihan | Alasan |
|---|---|---|
| Frontend | **Next.js 14+ (App Router) + TypeScript** | SSR/SEO baik untuk landing page publik, mendukung interaktivitas tinggi & responsive |
| Styling | **Tailwind CSS + shadcn/ui** | Cepat membangun UI konsisten, mudah dikustom sesuai palet militer |
| State/Data fetching | **TanStack Query (React Query)** | Semua data (kasus, jadwal, notifikasi) diambil via REST API sungguhan, bukan mock/hardcode |
| Animasi | **Framer Motion** | Transisi navbar, modal, stepper status kasus |
| **Backend — REST API** | **Next.js Route Handlers (`/app/api/**`) sebagai REST API murni**, mengikuti konvensi HTTP (`GET`, `POST`, `PUT`, `PATCH`, `DELETE`) + status code standar (200/201/400/401/403/404/409/500) | Satu ekosistem TypeScript, tapi backend tetap terstruktur sebagai REST API yang bisa dipanggil dari web maupun (nantinya) aplikasi mobile native jika dibutuhkan |
| Autentikasi | **NextAuth.js (Auth.js) v5** — Credentials Provider (email+password, hashed) **dan Google Provider (OAuth 2.0)** | Login/Register manual DAN "Daftar/Masuk dengan Google" berjalan nyata, session JWT tersimpan & divalidasi di setiap request API |
| Database | **PostgreSQL** (mis. via Supabase/Neon/self-hosted) | Relasional, semua entitas (user, kasus, dokumen) benar-benar tersimpan di sini |
| ORM | **Prisma** | Migrasi terkelola, query type-safe, dipakai langsung di dalam Route Handlers |
| File storage | **S3-compatible (Cloudflare R2/MinIO)** | Upload dokumen klien & dokumen hasil (legal opinion, dsb.) benar-benar tersimpan sebagai file, bukan placeholder |
| Pembuatan dokumen (PDF nyata) | **`@react-pdf/renderer`** atau **Puppeteer (HTML→PDF)** | Saat konsultan "membuat" Legal Opinion/Surat, sistem benar-benar men-generate file PDF dari data kasus + template resmi, disimpan ke storage, lalu tautan unduhnya aktif |
| Realtime | **Socket.IO (server terpisah kecil) atau Pusher** | Chat per-kasus & notifikasi benar-benar real-time, bukan polling dummy |
| Video konsultasi | **Jitsi Meet (self-hosted, gratis)** | Link meeting digenerate otomatis dan aktif saat jadwal dikonfirmasi |
| Email | **Resend / Nodemailer + SMTP** | Email verifikasi akun, notifikasi status, reset password benar-benar terkirim |
| Deployment | **Vercel (frontend+API routes) + Neon/Supabase (Postgres) + Cloudflare R2 (storage)** | Semua layer terhubung sebagai sistem production nyata, bukan lokal saja |

**Prinsip wajib:** setiap fitur di Bab 5 harus punya (a) UI, (b) endpoint REST, (c) query Prisma ke Postgres, (d) response nyata yang dipakai UI — keempatnya harus ada, tidak boleh berhenti di langkah (a) saja.

---

## 4. Alur Publik & Landing Page (Revisi: wajib untuk pengunjung belum login)

### 4.1 Aturan Navigasi
- Pengunjung yang **belum login** dan membuka domain utama **selalu diarahkan ke Landing Page publik** (`/`), bukan langsung ke form pengajuan atau dashboard.
- Landing Page berisi semua materi pengenalan LBH STHM sebelum pengunjung memutuskan mendaftar.
- Baru setelah pengunjung tertarik dan menekan CTA, mereka diarahkan ke alur autentikasi (register/login).

### 4.2 Isi Landing Page (`/`)
1. **Hero Section** — judul (mis. "Mewujudkan Keadilan Hukum bagi Masyarakat & Keluarga Besar STHM"), sub-judul singkat, tombol CTA utama **"Ajukan Bantuan Hukum"** (warna brass/gold, paling menonjol) + tombol sekunder "Pelajari Layanan Kami".
2. **Tentang LBH STHM** — profil singkat, visi-misi, di bawah naungan STHM.
3. **Layanan Kami** — grid 6 kartu ikon: Konsultasi Hukum, Pendampingan Hukum, Legal Opinion, Mediasi, Pendaftaran HKI, Pro Bono (masing-masing bisa diklik untuk detail).
4. **Kenapa Memilih Kami** — poin keunggulan (konsultan tersertifikasi, respons cepat, biaya terjangkau/gratis pro bono, dsb.).
5. **Tim Konsultan (opsional)** — foto & nama beberapa pengacara publik/advokat unggulan.
6. **Galeri Kegiatan** — dokumentasi kegiatan LBH.
7. **Testimoni (opsional)**.
8. **FAQ singkat**.
9. **CTA Section penutup** — ajakan sekali lagi untuk mengajukan bantuan hukum.
10. **Footer** — kontak, alamat, jam layanan, tautan cepat, media sosial.

### 4.3 Perilaku CTA "Ajukan Bantuan Hukum"
- Jika pengunjung **belum login** → klik CTA membuka **modal/halaman Auth** (lihat Bab 5) dengan tab default "Daftar Akun", bukan langsung ke form kasus.
- Jika pengunjung **sudah login** → klik CTA langsung membawa ke form pengajuan kasus di dashboard customer.
- Setelah berhasil register/login, user otomatis diarahkan (redirect) ke form pengajuan kasus yang tadi ingin diakses (bukan ke dashboard kosong), agar alurnya terasa menyambung.

---

## 5. Autentikasi — Login & Register (Revisi: Google OAuth + layout card)

### 5.1 Layout Card Auth
Satu komponen `AuthCard` dengan dua tab: **Masuk** dan **Daftar Akun**. Urutan elemen sesuai permintaan:

**Tab "Daftar Akun":**
1. Form input: Nama Lengkap, Email, No. HP, Kata Sandi, Konfirmasi Kata Sandi.
2. Tombol **"Buat Akun"** (submit form, primary button warna army green).
3. Divider teks "atau".
4. Tombol **"Daftar dengan Google"** (ikon Google + border, secondary button) — memicu OAuth flow Google sungguhan.
5. Teks kecil di bawah: "Sudah punya akun? **Masuk di sini**" (switch ke tab Masuk).

**Tab "Masuk":**
1. Form input: Email, Kata Sandi.
2. Tombol **"Masuk"** (primary button).
3. Tautan "Lupa kata sandi?".
4. Divider teks "atau".
5. Tombol **"Masuk dengan Google"**.
6. Teks kecil: "Belum punya akun? **Daftar di sini**".

### 5.2 Implementasi Nyata
- **Credentials flow:** password di-hash dengan `bcrypt`/`argon2` sebelum disimpan ke tabel `User`. Endpoint `POST /api/auth/register` membuat user baru beneran di Postgres; `POST /api/auth/login` (via NextAuth Credentials Provider) memverifikasi hash & membuat session JWT nyata.
- **Google OAuth flow:** menggunakan **Google Cloud Console OAuth Client ID/Secret** asli (disimpan di `.env`: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`), dikonfigurasi di NextAuth `GoogleProvider`. Saat user pertama kali daftar/masuk via Google, sistem otomatis membuat/mengaitkan row `User` (role default `CUSTOMER`) berdasarkan email Google — bukan sekadar tombol dekoratif.
- Verifikasi email (opsional tapi disarankan): kirim email verifikasi nyata via Resend/SMTP setelah register manual.
- Role `CONSULTANT` dan `ADMIN` **tidak bisa dibuat lewat form publik** — hanya dibuat/diundang oleh Admin melalui dashboard (mencegah publik mendaftar sebagai konsultan/admin).
- Setelah login sukses (metode apa pun), redirect sesuai role: Customer → dashboard klien, Konsultan → dashboard kasus, Admin → dashboard admin.

---

## 6. Peran & Hak Akses (Role-Based Access Control)

| Fitur | Customer | Konsultan Hukum | Admin |
|---|---|---|---|
| Registrasi & login (manual + Google) | ✅ | ✅ (diundang/diverifikasi admin) | ✅ (super admin only) |
| Ajukan konsultasi/kasus | ✅ | — | — |
| Lihat status pengajuan sendiri | ✅ | ✅ (kasus yang ditangani) | ✅ (semua) |
| Upload dokumen pendukung | ✅ | ✅ (dokumen hasil kerja) | ✅ |
| Terima & kelola penugasan kasus | — | ✅ | ✅ (assign manual) |
| Chat dengan pihak terkait | ✅ (dgn konsultan) | ✅ (dgn klien & admin) | ✅ (semua thread) |
| Buat Legal Opinion / dokumen resmi (PDF nyata) | — | ✅ | ✅ (review/approve) |
| Kelola jadwal konsultasi | ✅ (booking) | ✅ (atur ketersediaan) | ✅ (kelola global) |
| Verifikasi identitas & kelayakan pro bono | — | (opsional review awal) | ✅ |
| Kelola user & role | — | — | ✅ |
| Lihat laporan & statistik | — | ✅ (kasus sendiri) | ✅ (menyeluruh) |
| Kelola konten publik (landing page, galeri, artikel) | — | — | ✅ |

Sub-peran Konsultan Hukum: **Pengacara Publik** (litigasi/pro bono) dan **Advokat/Dosen Pembina** (non-litigasi, legal opinion, HKI, mediasi).

---

## 7. Modul & Fitur Utama — dengan Kontrak REST API

Setiap fitur di bawah wajib punya endpoint nyata (contoh kontrak, sesuaikan detail):

### 7.1 Auth
```
POST   /api/auth/register           -> buat user (Credentials)
POST   /api/auth/login              -> login (NextAuth Credentials)
GET    /api/auth/session            -> cek sesi aktif
POST   /api/auth/logout             -> hapus sesi
(NextAuth otomatis menyediakan /api/auth/signin/google, /api/auth/callback/google)
```

### 7.2 Kasus / Layanan
```
POST   /api/cases                   -> klien ajukan kasus baru (+upload dokumen awal)
GET    /api/cases                   -> daftar kasus (difilter sesuai role: milik sendiri/ditugaskan/semua)
GET    /api/cases/:id               -> detail kasus
PATCH  /api/cases/:id/status        -> admin/konsultan ubah status (DIVERIFIKASI, DITUGASKAN, PROSES, SELESAI, DITOLAK)
PATCH  /api/cases/:id/assign        -> admin menugaskan konsultan
```

### 7.3 Dokumen
```
POST   /api/cases/:id/documents     -> upload file (ke S3/R2), simpan metadata ke Postgres
GET    /api/cases/:id/documents     -> daftar dokumen kasus
POST   /api/cases/:id/generate-doc  -> generate PDF Legal Opinion/Surat resmi dari template + data kasus (output file nyata, tersimpan & bisa diunduh)
GET    /api/documents/:id/download  -> unduh file nyata
```

### 7.4 Jadwal
```
GET    /api/consultants/:id/availability   -> slot tersedia konsultan
POST   /api/schedules                      -> booking jadwal (validasi bentrok slot)
PATCH  /api/schedules/:id                  -> ubah/reschedule
```

### 7.5 Chat & Notifikasi
```
GET    /api/cases/:id/messages      -> riwayat chat kasus
POST   /api/cases/:id/messages      -> kirim pesan (juga broadcast via Socket.IO ke pihak terkait)
GET    /api/notifications           -> daftar notifikasi user
PATCH  /api/notifications/:id/read  -> tandai terbaca
```

### 7.6 Admin
```
GET    /api/admin/users             -> daftar & kelola user
POST   /api/admin/consultants       -> undang/buat akun konsultan
GET    /api/admin/stats             -> statistik dashboard (jumlah kasus per status/layanan)
PUT    /api/admin/content/landing   -> kelola konten landing page (hero, layanan, galeri)
```

Semua endpoint di atas wajib: (1) divalidasi dengan Zod, (2) dicek RBAC di middleware/handler, (3) benar-benar query ke Prisma/Postgres, (4) mengembalikan response JSON nyata yang dipakai TanStack Query di frontend.

---

## 8. Rancangan Skema Database (PostgreSQL, via Prisma)

```prisma
enum Role {
  CUSTOMER
  ADMIN
  CONSULTANT
}

enum AuthProvider {
  CREDENTIALS
  GOOGLE
}

enum ConsultantType {
  PENGACARA_PUBLIK
  ADVOKAT
}

enum ServiceType {
  KONSULTASI_HUKUM
  PENDAMPINGAN_HUKUM
  LEGAL_OPINION
  MEDIASI
  PENDAFTARAN_HKI
  PRO_BONO
}

enum CaseStatus {
  DIAJUKAN
  DIVERIFIKASI
  DITUGASKAN
  PROSES
  MENUNGGU_DOKUMEN
  SELESAI
  DITOLAK
}

model User {
  id            String        @id @default(cuid())
  name          String
  email         String        @unique
  phone         String?
  passwordHash  String?       // null jika daftar via Google
  provider      AuthProvider  @default(CREDENTIALS)
  googleId      String?       @unique
  role          Role          @default(CUSTOMER)
  isVerified    Boolean       @default(false)
  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt

  consultantProfile ConsultantProfile?
  casesAsClient     Case[]     @relation("ClientCases")
  messages          Message[]
  notifications     Notification[]
}

model ConsultantProfile {
  id             String          @id @default(cuid())
  userId         String          @unique
  user           User            @relation(fields: [userId], references: [id])
  type           ConsultantType
  specialization String[]
  barNumber      String?
  isAvailable    Boolean         @default(true)
  casesAssigned  Case[]          @relation("AssignedCases")
  availabilities Availability[]
}

model Availability {
  id           String            @id @default(cuid())
  consultantId String
  consultant   ConsultantProfile @relation(fields: [consultantId], references: [id])
  dayOfWeek    Int
  startTime    String
  endTime      String
}

model Case {
  id            String       @id @default(cuid())
  code          String       @unique
  clientId      String
  client        User         @relation("ClientCases", fields: [clientId], references: [id])
  consultantId  String?
  consultant    ConsultantProfile? @relation("AssignedCases", fields: [consultantId], references: [id])
  serviceType   ServiceType
  title         String
  description   String
  status        CaseStatus   @default(DIAJUKAN)
  isProBono     Boolean      @default(false)
  proBonoProof  String?
  createdAt     DateTime     @default(now())
  updatedAt     DateTime     @updatedAt

  documents     Document[]
  schedules     Schedule[]
  messages      Message[]
}

model Document {
  id         String   @id @default(cuid())
  caseId     String
  case       Case     @relation(fields: [caseId], references: [id])
  uploaderId String
  fileUrl    String   // path nyata di S3/R2
  fileName   String
  fileType   String
  isGenerated Boolean @default(false) // true jika hasil generate PDF sistem
  createdAt  DateTime @default(now())
}

model Schedule {
  id           String   @id @default(cuid())
  caseId       String
  case         Case     @relation(fields: [caseId], references: [id])
  scheduledAt  DateTime
  mode         String   // "online" | "offline"
  meetingLink  String?  // link Jitsi otomatis
  location     String?
  createdAt    DateTime @default(now())
}

model Message {
  id        String   @id @default(cuid())
  caseId    String?
  case      Case?    @relation(fields: [caseId], references: [id])
  senderId  String
  sender    User     @relation(fields: [senderId], references: [id])
  content   String
  createdAt DateTime @default(now())
}

model Notification {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  title     String
  body      String
  isRead    Boolean  @default(false)
  createdAt DateTime @default(now())
}

model ServiceContent {
  id          String   @id @default(cuid())
  type        ServiceType @unique
  title       String
  description String
  iconUrl     String?
}

model GalleryItem {
  id        String   @id @default(cuid())
  title     String
  imageUrl  String
  createdAt DateTime @default(now())
}
```

---

## 9. Alur Proses (End-to-End)

### 9.1 Alur Pengunjung Baru (Belum Login)
1. Buka domain → mendarat di **Landing Page** (`/`).
2. Membaca profil, layanan, galeri LBH STHM.
3. Klik CTA **"Ajukan Bantuan Hukum"** → modal Auth muncul, tab "Daftar Akun" aktif.
4. Isi form Daftar Akun **atau** klik "Daftar dengan Google".
5. Setelah akun dibuat & sesi aktif → otomatis redirect ke form pengajuan kasus (bukan dashboard kosong).

### 9.2 Alur Customer — Pengajuan Layanan
1. Login (manual/Google) → verifikasi sesi via `/api/auth/session`.
2. Pilih jenis layanan → isi form detail kasus → upload dokumen (`POST /api/cases`, `POST /api/cases/:id/documents`).
3. Jika Pro Bono → upload bukti kelayakan.
4. Kasus tersimpan nyata di Postgres berstatus **DIAJUKAN**; admin menerima notifikasi nyata.
5. Klien memantau status real-time (stepper) via `GET /api/cases/:id`.

### 9.3 Alur Admin — Verifikasi & Penugasan
1. Admin buka daftar kasus baru → `PATCH /api/cases/:id/status` → **DIVERIFIKASI**/**DITOLAK**.
2. Admin pilih konsultan sesuai spesialisasi & ketersediaan → `PATCH /api/cases/:id/assign` → status **DITUGASKAN**.
3. Sistem membuat jadwal & link Jitsi otomatis (`POST /api/schedules`), notifikasi terkirim ke klien & konsultan.

### 9.4 Alur Konsultan — Penanganan Kasus
1. Terima notifikasi kasus baru → buka detail.
2. Lakukan konsultasi (online/offline) sesuai jadwal.
3. Update status → **PROSES**, tambahkan catatan.
4. Bila perlu dokumen tambahan → status **MENUNGGU_DOKUMEN**.
5. Selesaikan output layanan → `POST /api/cases/:id/generate-doc` (PDF nyata dibuat & disimpan) atau upload manual → status **SELESAI**.
6. Klien menerima notifikasi & bisa unduh dokumen (`GET /api/documents/:id/download`).

### 9.5 Alur Pro Bono
1. Klien ajukan dengan bukti kelayakan.
2. Admin/konsultan review kelayakan.
3. Disetujui → `isProBono = true`, lanjut tanpa biaya. Ditolak → opsi lanjut sebagai layanan berbayar biasa.

---

## 10. Konvensi Pengembangan (untuk Claude Code / kontributor)

- TypeScript strict mode di seluruh proyek.
- Struktur folder:
  ```
  /app
    /(public)         -> landing page, tentang, layanan, galeri
    /(auth)           -> modal/halaman login & register (AuthCard)
    /(customer)       -> dashboard klien (navbar atas)
    /(consultant)     -> dashboard konsultan (navbar atas)
    /(admin)          -> dashboard admin (navbar atas)
    /api              -> REST API route handlers (lihat Bab 7)
  /components
    /layout           -> TopNavbar, MobileMenu, Footer
    /ui               -> shadcn/ui dikustom tema militer
    /auth             -> AuthCard, GoogleButton
    /shared
  /lib
    /db               -> prisma client
    /auth             -> NextAuth config (Credentials + Google)
    /storage          -> helper upload S3/R2
    /pdf              -> generator dokumen (react-pdf/puppeteer)
    /validators        -> zod schemas
  /prisma
    schema.prisma
  ```
- **Tidak boleh** ada data hardcode di komponen untuk fitur inti (kasus, jadwal, dokumen, user) — semua wajib fetch dari REST API.
- Setiap PR/commit fitur baru wajib menyertakan: endpoint API + migrasi Prisma + UI yang memanggilnya, dianggap tidak selesai jika salah satu hilang.
- Semua endpoint mutasi (POST/PATCH/DELETE) wajib cek sesi & role di server (middleware `withAuth`/`getServerSession`), tidak boleh hanya mengandalkan penyembunyian UI.
- Uji responsive di breakpoint mobile (375px), tablet (768px), desktop (1280px) untuk setiap fitur baru.

---

## 11. Non-Fungsional

- **Keamanan:** hash password (bcrypt/argon2), validasi OAuth state/nonce bawaan NextAuth, rate limiting login, validasi tipe & ukuran upload file, sanitasi input, HTTPS wajib di production.
- **Skalabilitas:** index pada kolom `status`, `serviceType`, `clientId`, `consultantId`.
- **Ketersediaan:** backup database berkala, error logging terpusat (mis. Sentry).
- **Privasi data:** akses dokumen kasus dibatasi hanya klien pemilik, konsultan yang ditugaskan, dan admin; dokumen di storage diberi URL bertanda-tangan (signed URL) berumur pendek, bukan public URL permanen.
- **Mobile performance:** lazy-load gambar galeri, code-splitting per rute dashboard.

---

## 12. Roadmap Implementasi Bertahap

1. **MVP (fungsional penuh, bukan dummy):** Landing page + Auth (Credentials & Google) + REST API dasar tersambung Postgres + form pengajuan kasus + dashboard status sederhana + admin assignment manual. Navbar atas & responsive mobile sudah berlaku sejak MVP.
2. **Fase 2:** Kalender jadwal + link Jitsi otomatis, notifikasi email/in-app nyata.
3. **Fase 3:** Chat real-time (Socket.IO) per kasus, upload multi-dokumen, generator PDF Legal Opinion nyata.
4. **Fase 4:** Dashboard statistik admin, payment gateway sesi berbayar lanjutan (Midtrans/Xendit), audit log.
5. **Fase 5:** PWA install prompt, dark mode dashboard, export laporan PDF/Excel, optimasi performa mobile.

---

*Dokumen ini bersifat living document — perbarui sesuai kebutuhan STHM (nomenklatur resmi lembaga, kebijakan biaya, ketentuan pro bono, kredensial Google OAuth produksi, dsb.) sebelum masuk tahap pengembangan penuh.*