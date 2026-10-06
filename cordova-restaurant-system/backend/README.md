# Backend — Cordova Local Restaurant Recommendation System

Node.js/Express REST API with PostgreSQL, JWT auth, RBAC, a hybrid restaurant
recommender with per-user logistic regression, file uploads, rate limiting,
and Swagger docs.

The recommender hard-filters dietary, service, distance, and open-now constraints.
It ranks new users from saved preferences, then learns each customer's ranking
from helpful/not-helpful votes, saved favorites, and visible review ratings. The
personal model activates after at least 8 signals including 2 positive and 2
negative examples. Apply new database migrations with `npm run db:migrate`.

## External AI suggestions

The recommendations endpoint can use OpenAI to interpret free-text food
requests and select establishments from a short list of known candidates.
CordovaEats generates the displayed reasons and match scores from its own
restaurant data and recommender.

In local development, an administrator can save the key on the AI
Recommendations page. This writes to ignored `backend/.env.local`; the key is
never returned to the browser. The page can also test the saved connection.
Local browser access is required to edit these settings. For hosted systems,
set `OPENAI_API_KEY` as a server environment variable. Server environment
variables take precedence over local files. Do not put a key in the frontend.

`OPENAI_MODEL` defaults to `gpt-4.1-mini`, `OPENAI_TIMEOUT_MS` to 10000,
and `OPENAI_MAX_REQUESTS_PER_15_MIN` to 60 per backend process. This cap
includes connection tests, resets on restart, and is not shared across
multiple server instances. Without a key, or if the provider times out,
rejects a request, or the local cap is reached, recommendations use the
local interpreter and ranker. The OpenAI request uses `store: false`.

When enabled, the backend sends the user's search text and a compact set of
public establishment details to OpenAI. The API key remains server-side.
If `backend/.env` was ever committed, remove it from Git tracking and rotate
the database and signing secrets it contained; ignoring it now does not erase
past Git history.

## Prerequisites

- Node.js 18+
- PostgreSQL 14+ (running locally, in Docker, or a hosted instance)

## Setup

```bash
cd backend
npm install
cp .env.example .env
# edit .env — at minimum set DATABASE_URL and the three secret values

# Create the database (if it doesn't exist yet)
createdb cordova_restaurants

# Apply schema + reference data
npm run db:migrate

# Optional: load demo data (users, restaurants, menus, reviews)
npm run db:seed

npm run dev   # starts on http://localhost:4000 with nodemon
```

Health check: `GET http://localhost:4000/health`
Interactive API docs (Swagger UI): `http://localhost:4000/api/docs`

## Demo accounts (after `npm run db:seed`)

All demo accounts use the password `Password123!`.

| Role | Email |
|---|---|
| Admin | admin@cordova-restaurants.gov.ph |
| Owner | owner.lapulapu@example.com |
| Owner | owner.seaside@example.com |
| Customer | juan.delacruz@example.com |
| Customer | ana.reyes@example.com |

## Running tests

Unit tests (pure functions, no DB needed) run out of the box:

```bash
npm test
```

Integration tests additionally need a **disposable test database** (never
point this at production data — tests create/mutate real rows):

```bash
createdb cordova_restaurants_test
DATABASE_URL=postgres://postgres:postgres@localhost:5432/cordova_restaurants_test \
  node src/scripts/migrate.js
DATABASE_URL=postgres://postgres:postgres@localhost:5432/cordova_restaurants_test npm test
```

Integration test files auto-skip (`describe.skip`) when `DATABASE_URL` is
unset, so `npm test` never fails purely because no DB is configured.

## Folder structure

```
backend/
  src/
    config/       env loading, DB pool, swagger setup
    middleware/    auth (JWT), rbac, error handling, rate limiting, validation, uploads
    routes/        Express routers, one file per resource
    controllers/    HTTP layer — parses req, calls services/models, shapes res
    services/       business logic (auth, recommendation engine, image processing)
    models/         raw parameterized-SQL data access, one file per table/domain
    validators/     express-validator chains per resource
    utils/          logger, ApiError, JWT helpers, password hashing, pagination
    scripts/        migrate.js / seed.js — one-off DB scripts
  tests/
    unit/           pure-function tests (recommendation scoring)
    integration/     supertest HTTP tests (auth, restaurants, recommendations)
  uploads/          user-uploaded files (gitignored, served at /uploads/*)
```

See `../docs/API.md` for the full endpoint reference and
`../docs/DATABASE.md` for the schema/ERD.
