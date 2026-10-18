# LBH STHM

Portal layanan bantuan hukum STHM berbasis Next.js App Router, REST Route Handlers, Prisma, dan PostgreSQL.

## Setup lokal

1. Salin `.env.example` menjadi `.env` dan isi `DATABASE_URL` serta `AUTH_SECRET`.
2. Jalankan `npm install`.
3. Jalankan `npm run prisma:generate`.
4. Jalankan `npm run prisma:migrate -- --name init` untuk membuat tabel PostgreSQL.
5. Jalankan `npm run dev`, lalu buka `http://localhost:3000`.

Halaman awal adalah landing page publik. CTA mengarah ke AuthCard register/login. Endpoint credentials dan `POST/GET /api/cases` sudah memakai session HTTP-only, bcrypt, Zod, dan query Prisma.

## Endpoint inti

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/session`
- `POST /api/auth/logout`
- `GET /api/cases`
- `POST /api/cases`

Google OAuth, storage S3/R2, email, realtime chat, PDF, scheduler produksi, dan migrasi konten publik membutuhkan kredensial layanan masing-masing sebelum diaktifkan.
