# Deployment Guide

## Recommended production topology

```
Frontend (Next.js)  →  Vercel / Netlify / any Node host
Backend (Express)   →  Render / Railway / Fly.io / a VPS behind Nginx
Database            →  Managed PostgreSQL (Render, Railway, Neon, RDS, Supabase)
Uploads             →  Local disk works for a small deployment; for real
                        production, swap middleware/upload.js's disk storage
                        for an S3-compatible bucket (see note below).
```

## 1. Database

1. Provision a PostgreSQL 14+ instance. Note the connection string.
2. From the `backend` folder, with `DATABASE_URL` pointed at the new
   instance:
   ```bash
   DATABASE_URL=postgres://... node src/scripts/migrate.js
   ```
3. Optionally seed demo data (skip this for a real production launch):
   ```bash
   DATABASE_URL=postgres://... node src/scripts/seed.js
   ```

## 2. Backend

1. Set environment variables (see `backend/.env.example`). At minimum:
   `DATABASE_URL`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`,
   `COOKIE_SECRET` (generate with `openssl rand -hex 32` each),
   `CLIENT_URL` (your deployed frontend origin, for CORS),
   `COOKIE_SECURE=true`, `NODE_ENV=production`.
2. Build step: none required (plain Node/Express). Just `npm install --production`.
3. Start command: `node src/server.js` (or `npm start`).
4. Point your host's health check at `GET /health`.
5. Ensure the `uploads/` directory persists across deploys/restarts — most
   PaaS platforms use ephemeral filesystems, so either:
   - mount a persistent volume at `uploads/`, or
   - swap `middleware/upload.js`'s `multer.diskStorage` for
     `multer-s3` (or similar) pointed at an S3-compatible bucket, and
     update `upload.service.js#publicUrlFor` to return the bucket URL
     instead of a local path.

## 3. Frontend

1. Set `NEXT_PUBLIC_API_URL` to your deployed backend's public URL.
2. `npm install && npm run build && npm start`, or deploy directly to
   Vercel (auto-detects Next.js — just set the env var in the dashboard).
3. Because uploaded images are served from the backend's `/uploads` path,
   either:
   - keep the `next.config.js` rewrite that proxies `/uploads/*` to the
     backend (already configured), or
   - serve uploads from a CDN/bucket directly and skip the rewrite.

## 4. CORS & cookies

The backend's CORS config (`app.js`) only allows `env.clientUrl`. Set
`CLIENT_URL` to your exact frontend origin (including protocol, no
trailing slash). The refresh-token cookie is `httpOnly`, `sameSite: lax`,
and `secure` in production — this requires the backend to be served over
HTTPS, or browsers will silently drop the cookie.

## 5. Production checklist

- [ ] All secrets in `.env` are unique, random, and never committed
- [ ] `NODE_ENV=production` on the backend
- [ ] `COOKIE_SECURE=true` and the backend is served over HTTPS
- [ ] `DB_SSL=true` if your managed Postgres requires SSL (most do)
- [ ] Database backups configured on your Postgres provider
- [ ] Rate limit values reviewed for expected traffic
  (`RATE_LIMIT_MAX`, `AUTH_RATE_LIMIT_MAX`)
- [ ] Uploaded file storage is persistent (volume or object storage, not
  ephemeral container disk)
- [ ] Winston logs shipped somewhere durable if you need audit history
  beyond the `audit_logs` DB table (e.g. a log drain)
- [ ] Demo/seed accounts (`admin@cordova-restaurants.gov.ph` etc.) either
  removed or have their passwords rotated before going live
- [ ] A real admin account created via direct DB insert or a one-off
  script (there is intentionally no public "become admin" endpoint)

## Creating the first real admin account

There's no self-service admin registration by design (see
`auth.service.js#register`). Create the first admin directly:

```sql
-- run against your production DB, once, then delete this from your shell history
INSERT INTO users (email, password_hash, full_name, role, email_verified_at)
VALUES (
  'your-real-admin@email.com',
  -- generate with: node -e "require('bcrypt').hash('YourStrongPassword!', 10).then(console.log)"
  '$2b$10$...',
  'Admin Name',
  'admin',
  now()
);
```

## Docker (optional)

No Dockerfiles are included by default to keep the deliverable focused,
but both services are plain Node apps and containerize trivially:

```dockerfile
# backend/Dockerfile (example)
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 4000
CMD ["node", "src/server.js"]
```

Same pattern for `frontend/Dockerfile`, adding a `npm run build` step
before `CMD ["npm", "start"]`.
