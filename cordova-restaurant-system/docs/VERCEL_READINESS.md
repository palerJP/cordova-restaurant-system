# Vercel deployment preparation

Deploy the repository as **one Vercel Services project**. Import the Git
repository with its Root Directory left at the repository root. The top-level
`vercel.json` builds these two services from the same deployment:

| Service | Root directory | Runtime |
| --- | --- | --- |
| Backend | `cordova-restaurant-system/backend` | Express, Node.js 24 |
| Frontend | `cordova-restaurant-system/frontend` | Next.js 16, Node.js 24 |

The top-level routing sends `/api/*`, `/health`, `/ready`, and `/uploads/*` to
Express and all other paths to Next.js. API requests and sign-in cookies use
the same public origin. Leave `BACKEND_URL` and `NEXT_PUBLIC_API_URL` unset in
the combined project. Set the backend's `CLIENT_URL` to the project's HTTPS
origin, without a trailing slash. Existing separate Vercel projects can stay
online during the transition; the frontend still accepts `BACKEND_URL` for
their legacy rewrite. Vercel Services is currently in beta, so confirm the
account can deploy a Services project before moving a production domain.

## Backend settings and data

Before launch, provision hosted PostgreSQL, a verified outbound email sender,
and two Vercel Blob stores: one Public for images and one Private for business
permits. Set these backend environment variables in Vercel:

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | Hosted PostgreSQL connection string |
| `DB_SSL` | `true` if required by the database provider |
| `DB_POOL_MAX` | Use a small pool appropriate for the database plan |
| `CLIENT_URL` | Frontend HTTPS origin |
| `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `COOKIE_SECRET` | Three distinct random secrets of at least 32 characters each |
| `EMAIL_FROM` | Address verified by the mail provider |
| `RESEND_API_KEY` **or** `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS` | Working email delivery |
| `BLOB_READ_WRITE_TOKEN` | Public image store |
| `BLOB_PRIVATE_READ_WRITE_TOKEN` | Private permit store |

Email verification and Secure refresh cookies are enforced in production.
Do not run `npm run db:seed` on the hosted database: it creates accounts with
published demo passwords and is blocked in production. Bring across the
existing trusted database, or run `npm run db:migrate` and provision real
accounts and restaurant records. If you migrate the local database, remove or
rotate its published demo accounts before launch. The local curated frontend
list is a development fallback; production listings and owner edits come from
the API.

If the existing database contains `/uploads/*` paths, migrate those files
before launch. Follow [`backend/UPLOAD_MIGRATION.md`](../backend/UPLOAD_MIGRATION.md):
run the dry run first, back up data, then apply with both Blob tokens. Check
images and an admin permit download afterward. Local uploads are not included
in a Vercel deployment.

For Groq recommendations, set `GROQ_API_KEY` in the Vercel project
environment. The hosted admin page reads its status but cannot write a local
secret file. Without a key, the app uses its local recommendation ranker.
To enable Google sign-in, set the matching `GOOGLE_CLIENT_ID` in the backend
and `NEXT_PUBLIC_GOOGLE_CLIENT_ID` in the frontend, and authorize the frontend
origin in Google Cloud. Google Maps has a separate optional
`NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`.

## Frontend settings

Set `NEXT_PUBLIC_REQUIRE_EMAIL_VERIFICATION=true` in the combined project.
Keep `BACKEND_URL` and `NEXT_PUBLIC_API_URL` unset in production; Vercel's
top-level Services routing sends browser `/api/*` requests to the backend.
Set Google client and Maps keys only if those features are enabled. The site
fonts are bundled locally, so builds do not fetch Google Fonts.

## Moving from two projects

1. Create the combined project from this repository root, without changing the
   existing frontend or backend projects yet. Add the required environment
   variables and connect the public and private Blob stores.
2. Apply the database migrations, then test the combined project's preview URL
   with real restaurant and menu records, authentication, uploads, and email.
3. Once the combined deployment passes, move the production domain to it and
   update `CLIENT_URL` and Google OAuth origins for that domain. Retire the old
   projects after the new deployment is verified.

## Final checks after the services exist

1. Apply migrations to the hosted database and migrate existing uploads.
2. Test backend `/health`, database-backed browse, sign-up email verification,
   sign-in/refresh, owner upload, and admin permit download.
3. Test the frontend on its HTTPS address: search, restaurant/menu detail,
   recommendations, reviews, and owner/admin pages.
4. Check the build output for Vercel function size and request limits. The
   app caps multipart requests below Vercel's 4.5 MB payload limit. Larger
   uploads need a separate direct-to-Blob flow.

The code can be built and tested locally before this setup. A live Vercel
round trip cannot be confirmed until the hosted database, Blob stores, mail
service, deployment URLs, and optional provider keys are configured.

Vercel references: [Services](https://vercel.com/docs/services),
[Services routing](https://vercel.com/docs/services/routing),
[Express deployment](https://vercel.com/docs/frameworks/backend/express),
[function limits](https://vercel.com/docs/functions/limitations), and
[private Blob storage](https://vercel.com/docs/vercel-blob/private-storage).
