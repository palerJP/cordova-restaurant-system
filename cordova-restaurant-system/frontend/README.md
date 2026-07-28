# Frontend — Cordova Local Restaurant Recommendation System

Next.js 14 (App Router) + TypeScript + Tailwind CSS + Leaflet.

## Setup

```bash
cd frontend
npm install
cp .env.local.example .env.local
# edit .env.local if your backend isn't on http://localhost:4000

npm run dev   # http://localhost:3000
```

The backend must be running first (see `../backend/README.md`).

## What's implemented

| Area | Pages |
|---|---|
| Public browse | `/` — search, filter (cuisine/budget/dietary/service), sort, paginate, grid/map toggle |
| AI recommendations | `/recommendations` — preference quiz + ranked results with a "why this match?" score breakdown |
| Restaurant detail | `/restaurants/[slug]` — menu, reviews (+ submit), operating hours, map, favorite toggle, active promotions |
| Auth | `/login`, `/register` (customer or owner) |
| Customer | `/favorites` |
| Public promos | `/promotions` |
| Owner dashboard | `/dashboard` (my businesses), `/dashboard/new` (register + upload permit), `/dashboard/[id]` (profile / menu / hours / promotions / analytics tabs) |
| Admin dashboard | `/admin` (system analytics + cuisine demand + peak hours), `/admin/businesses` (verification queue), `/admin/reviews` (moderation queue), `/admin/users` (account management), `/admin/ai-model` (recommendation weight tuning) |

## Design system

- Colors pulled from the original Canva deck's title slide (rust/orange `brand`, navy `ink`, gold accent, forest green) — see `tailwind.config.js`.
- Dark/light mode via a `.dark` class on `<html>`, toggled by `ThemeToggle`, persisted to `localStorage`.
- Reusable primitives in `src/components/ui/`: `Button`, `Input`/`Textarea`, `Select`, `Modal`, `Skeleton`, `Badge`/`StarRating`, `Pagination`.
- Loading skeletons (`app/loading.tsx` + per-page skeleton states), toast notifications (`lib/toast-context.tsx`), and a global error boundary (`app/error.tsx`).
- Accessibility: form inputs are labeled and associate errors via `aria-describedby`; modals trap focus and close on `Escape`; interactive filter chips use `aria-pressed`.

## Folder structure

```
frontend/src/
  app/            Next.js App Router pages (one folder per route)
  components/     Shared React components
    ui/           Small reusable primitives (Button, Modal, Skeleton, ...)
  lib/             api.ts (fetch client + token refresh), auth-context, theme-context,
                    toast-context, types.ts (shared TS types)
  hooks/           useDebounce, useGeolocation
  styles/          globals.css (Tailwind + theme variables)
```

## Notes / known limitations

- The restaurant detail route is keyed by `slug` in the URL, but the backend's
  detail endpoint takes a UUID. The page resolves slug → id via a search
  call first. For a larger dataset, add a dedicated `GET
  /api/restaurants/by-slug/:slug` endpoint instead (straightforward addition
  to `restaurant.controller.js` / `restaurant.model.js`).
- Image upload previews are not implemented (files are sent directly on
  submit) — add a `URL.createObjectURL` preview if desired.
- No SSR data-fetching (everything is client-rendered with `'use client'`)
  to keep the token-refresh/auth logic simple. For SEO on public pages
  (home, restaurant detail), migrating those to Server Components with a
  server-side fetch would be the next iteration.
