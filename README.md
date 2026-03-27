# NSEC Employee Portal

Mobile-first employee portal for **National Stage Equipment Company**.

## Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — the app is optimized for mobile viewport (390px) but works on desktop too.

## Deploy to Vercel

1. Push this repo to GitHub
2. Go to [vercel.com/new](https://vercel.com/new)
3. Import the repo — Vercel auto-detects Next.js
4. Click Deploy

Or use the CLI:

```bash
npx vercel
```

## Features

- **Bottom tab bar** — Home / Tasks / Quick Create / Calendar / More
- **Role-based dashboard** — Switch between Field, Office, and Management views via the profile menu
- **Task management** — Status filters (Overdue, New, Active, Pending, Done)
- **Calendar** — Week strip navigation with event cards
- **Organized navigation** — 30+ sections grouped into 7 categories (My Work, Communication, Operations, Clients & Sales, Finance & Admin, HR & Compliance, Tools)
- **Quick Create sheet** — Role-aware actions (field crew gets Clock In, Submit Photo; office gets New Order, New Quote)
- **PWA-ready** — Web app manifest for home screen install
- **Safe area support** — Handles notched phones (iPhone, etc.)

## Demo Login

Any email/password works — or just tap Sign In with empty fields. Use the profile avatar (top right) to switch between Field / Office / Management roles and see how the dashboard adapts.

## Tech Stack

- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS v4
- Lucide React icons
- Vercel-ready (standalone output)
