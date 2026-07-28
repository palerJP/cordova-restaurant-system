# Cordova Local Restaurant Recommendation System (with AI Suggestions)

A full-stack web platform connecting customers with accredited local
restaurants in the Municipality of Cordova, Cebu, via a rule-based +
weighted-scoring recommendation engine — built from the project's Capstone
proposal deck.

## Quickstart

```bash
# 1. Database
createdb cordova_restaurants
cd backend && cp .env.example .env   # edit DATABASE_URL + secrets
npm install
npm run db:migrate
npm run db:seed        # optional demo data
npm run dev             # http://localhost:4000

# 2. Frontend (new terminal)
cd frontend
cp .env.local.example .env.local
npm install
npm run dev              # http://localhost:3000
```

Demo accounts (after `npm run db:seed`), all using password `Password123!`:

| Role | Email |
|---|---|
| Admin | admin@cordova-restaurants.gov.ph |
| Owner | owner.lapulapu@example.com |
| Customer | juan.delacruz@example.com |

Full setup details: [`backend/README.md`](backend/README.md) ·
[`frontend/README.md`](frontend/README.md)

## Documentation

- [`docs/API.md`](docs/API.md) — full REST API reference
- [`docs/DATABASE.md`](docs/DATABASE.md) — ERD + schema design notes
- [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) — hosting & production checklist
- [`docs/FOLDER_STRUCTURE.md`](docs/FOLDER_STRUCTURE.md) — codebase layout explained
- Interactive API docs: `http://localhost:4000/api/docs` (Swagger UI) once the backend is running

## Tech stack (as specified in the proposal)

| Layer | Technology |
|---|---|
| Frontend | React.js / **Next.js 14**, Tailwind CSS, Leaflet.js |
| Backend | Node.js / Express |
| Database | **PostgreSQL** (primary target; MySQL-compatible notes in `docs/DATABASE.md`) |
| AI Module | Rule-based filtering + weighted scoring (see below) |
| Dev tools | Git/GitHub, Postman-compatible REST API, Swagger/OpenAPI |

## Feature checklist (mapped to the original proposal)

### Customer features
- [x] AI-powered restaurant search & recommendations — `POST /api/recommendations`, `/recommendations` page
- [x] Budget & dietary restriction filters — hard filters in the recommendation engine + browse filters
- [x] Real-time restaurant browsing — `/` (search/filter/sort/paginate)
- [x] Rating & review submission — `/restaurants/[slug]` reviews tab
- [x] Preference-based personalization — `user_preferences` table, saved and reused across requests

### Restaurant owner features
- [x] Business profile registration & verification — `/dashboard/new` → admin verify queue
- [x] Menu & price management dashboard — `/dashboard/[id]` Menu tab
- [x] Operating hours configuration — `/dashboard/[id]` Hours tab
- [x] Promotion posting system — `/dashboard/[id]` Promotions tab + public `/promotions` feed
- [x] Analytics: views, clicks & recommendations — `/dashboard/[id]` Analytics tab

### Admin features
- [x] Business permit & registration verification — `/admin/businesses`
- [x] Content & review moderation — `/admin/reviews`
- [x] User account management — `/admin/users`
- [x] System-wide analytics reports — `/admin` overview
- [x] Cuisine demand & peak search trends — `/admin` overview charts
- [x] "Update AI Model" (tune recommendation weights) — `/admin/ai-model`

### Cross-cutting (production-readiness requirements)
- [x] JWT auth with rotating refresh tokens, RBAC (`customer`/`owner`/`admin`)
- [x] bcrypt password hashing, rate limiting, input validation (express-validator), XSS sanitization on user text
- [x] File upload + image optimization (multer + sharp)
- [x] Pagination, search, filtering, sorting on all list endpoints
- [x] Database transactions for multi-step writes (business creation, weekly hours replace)
- [x] Centralized error handling, structured logging (winston)
- [x] Swagger/OpenAPI scaffold at `/api/docs`
- [x] Responsive, accessible UI with dark/light mode, loading skeletons, toast notifications
- [x] Unit tests (recommendation scoring) + integration tests (auth, restaurants/recommendations)

## Assumptions made (undocumented in the original proposal)

The proposal deck describes objectives, use cases, and a tech stack, but
has no wireframes, ERD, field-level spec, or exact scoring formula. Where
the deck was silent, these decisions were made and are documented in
context:

- **Recommendation scoring weights**: cuisine 30%, budget 25%, proximity
  20%, dietary 15%, rating 10% — admin-tunable, see `docs/DATABASE.md` and
  `recommendation.service.js`.
- **Distance calculation**: Haversine formula on stored lat/lng (no
  external routing API/key required).
- **Business verification flow**: owner submits a permit document →
  `pending` → admin approves (`verified`) or rejects with a reason.
- **Review moderation**: visible by default; admin can flag or remove;
  owners can publicly reply but not delete/edit customer reviews.
- **Auth**: email + password, JWT access token (15 min) + rotating
  refresh token (30 days, httpOnly cookie); no self-service admin signup.
- **Database engine**: PostgreSQL chosen as primary (richer array/JSONB/
  trigram support for this use case); MySQL compatibility notes provided
  since the proposal listed "MySQL / PostgreSQL".

## Known limitations / suggested next steps

- No automated CI pipeline is included (not specified in the proposal)
  — see `docs/DEPLOYMENT.md` for a manual deployment checklist instead.
- File uploads are stored on local disk by default; swap for S3-compatible
  storage before a real production launch (documented in `docs/DEPLOYMENT.md`).
- Public pages are entirely client-rendered for simplicity; migrating the
  home and restaurant-detail pages to Next.js Server Components would
  improve SEO and first-paint performance.
- No push/email notifications are wired up yet — the `notifications` table
  exists in the schema for this purpose but nothing writes to it yet.
