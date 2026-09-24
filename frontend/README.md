# Frontend — Credential Manager

Nuxt 3 + Tailwind CSS.

## Setup

```bash
npm install
cp .env.example .env
```

Isi `NUXT_PUBLIC_API_BASE` di `.env` dengan URL backend yang sedang berjalan, contoh:
```
NUXT_PUBLIC_API_BASE=http://localhost:3001/api
```

## Run

```bash
npm run dev
```

Buka `http://localhost:3000` di browser.

## Build (production)

```bash
npm run build
node .output/server/index.mjs
```

## Folder structure

```
app/
├── components/
│   ├── base/       # reusable components (BaseTable, BaseButton, BaseInput, dll)
│   └── shared/     # shared UI (GroupMenu, dll)
├── composables/    # useApi, useAuth, useGroups, usePaginatedList, dll
├── layouts/        # default layout (sidebar + nav)
├── pages/          # credentials/, groups/, categories/, auth/
├── types/          # TypeScript interfaces
└── utils/          # helper functions
```
