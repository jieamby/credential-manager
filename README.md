# Credential Manager

A full-stack web app for managing credentials and passwords securely.

> Untuk panduan deploy ke Supabase + Vercel + CI/CD, lihat [DEPLOYMENT.md](./DEPLOYMENT.md).

## Tech Stack
- **Frontend:** Nuxt 3 + Tailwind CSS
- **Backend:** NestJS + Prisma ORM
- **Database:** PostgreSQL

## Run with Docker (recommended)

```bash
cp .env.example .env
```
Isi `.env` di root dengan nilai yang sesuai, lalu:

```bash
docker-compose up --build
```

Itu saja. Postgres + backend + frontend akan jalan otomatis.
- Frontend: http://localhost:3001
- Backend API: http://localhost:3000/api
- Swagger docs: http://localhost:3000/docs

---

## Run manually (tanpa Docker)

### 1. Backend
```bash
cd backend
npm install
cp .env.example .env
```
Isi `.env` dengan Postgres URL dan key-key yang dibutuhkan, lalu:

```bash
npx prisma db push
npx prisma db seed
npm run start:dev
```
API jalan di `http://localhost:3000`.

### 2. Frontend
Buka terminal baru:
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```
Pastikan `NUXT_PUBLIC_API_BASE` di `.env` frontend mengarah ke backend yang sedang jalan.

Buka `http://localhost:3001`. Login pakai akun yang di-generate seeder.

## Notes
- Untuk production, build dua-duanya pakai `npm run build`.
- Pastikan semua secret key di `.env` diganti dengan nilai random yang kuat.
