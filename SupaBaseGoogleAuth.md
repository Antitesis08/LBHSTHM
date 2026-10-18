# SUPABASE-GOOGLE-AUTH.md — Google Login via Supabase, Database tetap Laragon

## Arsitektur Singkat

```
[Tombol "Masuk/Daftar dengan Google"]
        │
        ▼
  Supabase Auth (hanya urus handshake OAuth Google)
        │  (redirect balik dengan "code")
        ▼
  /app/auth/callback (route handler kita)
        │  1. tukar code -> Supabase session (dapat email, nama, avatar, id)
        │  2. upsert user ke Prisma/Laragon (tabel User kita sendiri)
        │  3. buat cookie session NextAuth secara manual dari data user tsb
        ▼
  Sesi aplikasi berjalan normal via NextAuth (getServerSession/useSession)
  seperti user yang login manual (Credentials + Prisma + Laragon)
```

Login manual (email/password) **tetap 100% lewat NextAuth Credentials + Prisma + Laragon**, tidak berubah. Hanya jalur Google yang lewat Supabase lalu "disuntikkan" ke sesi NextAuth.

---

## 1. Buat Project Supabase (khusus Auth)

1. Daftar di **https://supabase.com/** → **New Project**.
2. Isi nama project (mis. `lbh-sthm-auth`), pilih region terdekat (Singapore), set password database (tidak akan dipakai untuk data aplikasi, cukup asal aman).
3. Tunggu provisioning selesai (~2 menit).
4. Buka **Project Settings > API** — catat:
   - **Project URL** (`https://xxxx.supabase.co`)
   - **anon public key**
   - **service_role key** (rahasia, hanya untuk server, jangan pernah dikirim ke browser)
5. Buka **Project Settings > API > JWT Settings** — catat **JWT Secret** (dipakai untuk verifikasi token di server kalau diperlukan).

## 2. Buat Kredensial Google OAuth (tetap wajib via Google Cloud Console)

1. Buka **https://console.cloud.google.com/** → buat/pilih project.
2. **APIs & Services > OAuth consent screen** → isi seperti biasa, tambahkan akun kamu di Test users.
3. **APIs & Services > Credentials > Create Credentials > OAuth client ID** → Web application.
4. **Authorized redirect URIs** — kali ini arahkan ke **Supabase**, bukan ke app kamu:
   ```
   https://xxxx.supabase.co/auth/v1/callback
   ```
   (ganti `xxxx` dengan project ref Supabase kamu)
5. Simpan → catat **Client ID** dan **Client Secret**.

## 3. Aktifkan Provider Google di Supabase

1. Di dashboard Supabase: **Authentication > Providers > Google**.
2. Toggle **Enable**.
3. Tempel **Client ID** dan **Client Secret** dari langkah 2.
4. Di **Authentication > URL Configuration**:
   - **Site URL**: `http://localhost:3000`
   - **Redirect URLs**: tambahkan `http://localhost:3000/auth/callback`
5. Simpan.

## 4. Variabel Environment Tambahan

Tambahkan ke `.env` (di samping `DATABASE_URL` Laragon yang sudah ada):

```
NEXT_PUBLIC_SUPABASE_URL="https://xxxx.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="xxxx"
SUPABASE_SERVICE_ROLE_KEY="xxxx"        # rahasia, server-only
NEXTAUTH_SECRET="..."                    # sudah ada dari setup sebelumnya
```

## 5. Install Dependency

```bash
npm install @supabase/supabase-js @supabase/ssr
```

## 6. Client Supabase (browser) — untuk tombol Google

`/lib/supabase/browserClient.ts`
```ts
import { createBrowserClient } from "@supabase/ssr";

export function getSupabaseBrowserClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

Di komponen `AuthCard` (tombol "Daftar/Masuk dengan Google"):
```tsx
"use client";
import { getSupabaseBrowserClient } from "@/lib/supabase/browserClient";

async function handleGoogleLogin() {
  const supabase = getSupabaseBrowserClient();
  await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  });
}

// <button onClick={handleGoogleLogin}>Masuk dengan Google</button>
```

## 7. Route Handler Jembatan — inti dari integrasi ini

`/app/auth/callback/route.ts`
```ts
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { encode } from "next-auth/jwt";
import { prisma } from "@/lib/db/prisma";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  if (!code) {
    return NextResponse.redirect(new URL("/?error=missing_code", request.url));
  }

  // 1) Tukar "code" jadi session Supabase (verifikasi OAuth berhasil)
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get: (name) => cookieStore.get(name)?.value } }
  );

  const { data, error } = await supabase.auth.exchangeCodeForSession(code);
  if (error || !data.session?.user) {
    return NextResponse.redirect(new URL("/?error=oauth_failed", request.url));
  }

  const supabaseUser = data.session.user;
  const email = supabaseUser.email!;
  const name =
    (supabaseUser.user_metadata?.full_name as string) ?? email.split("@")[0];

  // 2) Upsert user ke database KITA SENDIRI (Prisma -> Laragon Postgres)
  const user = await prisma.user.upsert({
    where: { email },
    update: {}, // biarkan data lama tidak tertimpa kalau sudah ada
    create: {
      name,
      email,
      provider: "GOOGLE",
      googleId: supabaseUser.id,
      role: "CUSTOMER",
      isVerified: true,
    },
  });

  // 3) Buat cookie session NextAuth secara manual, seolah user login normal
  const token = await encode({
    token: {
      sub: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
    secret: process.env.NEXTAUTH_SECRET!,
  });

  const isProd = process.env.NODE_ENV === "production";
  const cookieName = isProd
    ? "__Secure-next-auth.session-token"
    : "next-auth.session-token";

  const response = NextResponse.redirect(new URL("/dashboard", request.url));
  response.cookies.set(cookieName, token, {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/",
    maxAge: 30 * 24 * 60 * 60, // 30 hari, samakan dengan konfigurasi session NextAuth kamu
  });

  return response;
}
```

Setelah ini, `getServerSession()`/`useSession()` NextAuth di halaman lain akan **membaca user ini seperti sesi normal** — tidak perlu kode tambahan di tempat lain, karena cookie-nya kompatibel dengan format yang NextAuth harapkan.

⚠️ Catatan penting:
- Nama cookie & struktur token harus konsisten dengan konfigurasi `session.strategy: "jwt"` di `authOptions` NextAuth kamu. Kalau NextAuth diset pakai strategi `database` (bukan `jwt`), pendekatan `encode` manual ini tidak berlaku — pastikan `authOptions.session.strategy = "jwt"`.
- Redirect tujuan akhir (`/dashboard`) sebaiknya diarahkan sesuai role user (Customer/Konsultan/Admin) — tambahkan logic percabangan di situ.
- Endpoint ini idealnya divalidasi juga dengan rate limiting sederhana untuk mencegah penyalahgunaan.

## 8. Uji Coba

1. `npm run dev`.
2. Buka landing page → klik CTA → klik "Daftar dengan Google".
3. Akan redirect ke halaman consent Google (bukan Supabase, Google tetap yang tampil ke user).
4. Setelah setuju, Google redirect ke Supabase → Supabase redirect ke `/auth/callback` app kamu dengan `?code=...`.
5. Route handler menukar code, membuat/mengambil user di Laragon Postgres (cek via `npx prisma studio`), lalu set cookie session.
6. User otomatis masuk ke `/dashboard` dalam keadaan sudah login — coba `useSession()` di halaman dashboard, harus menampilkan email/nama yang sesuai.

---

## Kalau Terasa Terlalu Rumit

Kalau di tengah jalan pola jembatan ini terasa berat untuk dirawat, alternatif yang jauh lebih sederhana (fungsinya identik dari sisi user — tetap ada tombol "Masuk dengan Google") adalah memakai `GoogleProvider` bawaan NextAuth langsung tanpa Supabase sama sekali, seperti di `SETUP-KONFIGURASI.md` Bab 2 — bedanya cuma redirect URI di Google Cloud Console diarahkan ke app kamu sendiri (`/api/auth/callback/google`), dan NextAuth yang otomatis mengurus semua sesi tanpa perlu route handler jembatan manual ini. Dua-duanya valid; yang di atas dipakai kalau kamu memang ingin memanfaatkan dashboard Supabase untuk mengelola provider Google-nya.