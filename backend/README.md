# Backend — Credential Manager API

NestJS + Prisma + PostgreSQL.

## Setup

```bash
npm install
cp .env.example .env
```

Isi `.env` dulu sebelum lanjut, minimal:
- `DATABASE_URL` — PostgreSQL connection string
- `JWT_SECRET` — bebas, string random
- `ENCRYPTION_KEY` — harus 32-char hex / 64 char (untuk AES-256)

## Database

```bash
npx prisma db push
npx prisma db seed
```

Seeder akan buat akun demo yang bisa langsung dipakai login.

## Run

```bash
npm run start:dev
```

API berjalan di port yang diset di `.env` (default `3001`).

## Testing

```bash
npm run test:e2e
```

Pastikan DB sudah jalan sebelum *e2e* dieksekusi.

## Folder structure

```
src/
├── common/         # shared utilities (encryption, guards, dll)
├── database/       # Prisma service
└── modules/
    ├── auth/
    ├── credential/
    ├── credential-category/
    └── credential-group/
prisma/
├── schema.prisma
└── seed.ts
```
