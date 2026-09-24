# Deployment Guide

Stack deployment:
- **Database** → Supabase (PostgreSQL)
- **Backend API** → Vercel (serverless)
- **Frontend** → Vercel

---

## 1. Setup Supabase

1. Buat akun di https://supabase.com → New Project
2. Tunggu sampai project siap
3. Masuk ke **Project Settings → Database**
4. Ambil dua connection string:
   - **Transaction pooler** (untuk `DATABASE_URL`) — port `6543`
   - **Session mode / direct** (untuk `DIRECT_URL`) — port `5432`

Format keduanya:
```
postgresql://postgres.[project-ref]:[password]@[host]:[port]/postgres
```

> Kenapa dua? Prisma migrate butuh direct connection, tapi serverless butuh pooler. Lihat: https://supabase.com/docs/guides/database/connecting-to-postgres#connection-pooler

---

## 2. Setup Vercel (Backend)

1. Buka https://vercel.com → Add New Project
2. Import repo GitHub, set **Root Directory** ke `backend`
3. Framework preset: **Other**
4. Tambahkan environment variables berikut di Vercel dashboard:

| Key | Value |
|-----|-------|
| `DATABASE_URL` | Transaction pooler URL dari Supabase (port 6543) |
| `DIRECT_URL` | Direct URL dari Supabase (port 5432) |
| `FRONTEND_URL` | URL frontend Vercel (isi setelah deploy frontend) |
| `JWT_SECRET` | String random panjang |
| `ENCRYPTION_KEY` | 32-char random string |
| `CREDENTIAL_ENCRYPTION_KEY` | Base64 encoded key (generate pakai `openssl rand -base64 32`) |
| `SEED_ADMIN_EMAIL` | Email untuk akun demo |
| `SEED_ADMIN_PASSWORD` | Password akun demo |

5. Deploy → catat URL backend-nya (contoh: `https://credential-manager-api.vercel.app`)

---

## 3. Setup Vercel (Frontend)

1. Add New Project lagi di Vercel
2. Import repo yang sama, set **Root Directory** ke `frontend`
3. Framework preset: **Nuxt.js**
4. Tambahkan environment variable:

| Key | Value |
|-----|-------|
| `NUXT_PUBLIC_API_BASE` | URL backend dari step 2 + `/api` (contoh: `https://credential-manager-api.vercel.app/api`) |

5. Deploy → catat URL frontend-nya
6. Balik ke Vercel backend, update `FRONTEND_URL` dengan URL frontend ini (untuk CORS)

---

## 4. Jalankan Migration & Seed

Setelah backend ter-deploy, jalankan ini dari lokal sekali saja:

```bash
cd backend
cp .env.example .env
```

Isi `DATABASE_URL` dengan transaction pooler dan `DIRECT_URL` dengan direct URL dari Supabase, lalu:

```bash
npx prisma migrate deploy
npx prisma db seed
```

---

## 5. Setup GitHub Actions (CI/CD)

Buka repo GitHub → **Settings → Secrets and variables → Actions**, tambahkan secrets berikut:

| Secret | Cara dapat |
|--------|-----------|
| `VERCEL_TOKEN` | https://vercel.com/account/tokens |
| `VERCEL_ORG_ID` | Vercel dashboard → Settings → Team ID (atau Personal Account ID) |
| `VERCEL_BACKEND_PROJECT_ID` | Vercel → pilih project backend → Settings → Project ID |
| `VERCEL_FRONTEND_PROJECT_ID` | Vercel → pilih project frontend → Settings → Project ID |
| `SUPABASE_DATABASE_URL` | Direct URL (port 5432) dari Supabase — untuk Prisma migrate di CI |

Setelah itu, setiap push ke `main`:
- Kalau ada perubahan di `backend/` → GitHub Actions akan run `prisma migrate deploy` ke Supabase lalu deploy backend ke Vercel
- Kalau ada perubahan di `frontend/` → GitHub Actions akan deploy frontend ke Vercel

---

## Cek semua berjalan

- Frontend: buka URL Vercel frontend → login dengan akun seed
- Backend/Swagger: `https://[backend-url]/docs`
- API health: `https://[backend-url]/api`
