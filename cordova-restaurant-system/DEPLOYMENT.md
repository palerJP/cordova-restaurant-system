# Production Deployment

Status: local hardening and packaging completed; public launch is not approved.
Domain and hosting have not been selected. Docker is unavailable on the current
machine, so the container stack must be tested on the target Linux host.
Local builds alone are not deployment verification.

## Local Verification

- 102 backend tests pass, including isolated-database migrations, authentication,
  diner/owner/admin permissions, OAuth rejection, and private-document access.
- 14 frontend regression tests pass for auth forms, search, history, and refresh.
- Next.js production build renders all 32 routes without lint/type errors.
- Production dependency audits report zero known vulnerabilities at this check;
  development-tool advisories remain and are not a claim of zero security risk.
- Browser verification confirms production-preview admin login and promotion/
  subscription moderation loading after the database repair.
- Environment files and generated output are excluded from source/container
  packaging; the existing local frontend environment file remains on disk.

Production email delivery, real OAuth configuration, DNS/TLS, container startup,
backups/restoration, and comprehensive role-specific acceptance testing remain
release gates. Do not interpret the local test suite as proof that every possible
workflow is error-free.

## Self-hosted option

The production Compose stack runs PostgreSQL, migration and API services,
Next.js, and Caddy for automatic HTTPS. Only ports 80 and 443 are published.
Database data, uploaded files, and certificates have persistent volumes.

1. Choose a Linux host with Docker Compose and a domain. Point the domain's A
   record to the host; only add AAAA if IPv6 is configured on that host.
2. Create `.env.production` using `.env.production.example`. Provide independent
   random JWT/cookie secrets of at least 32 characters, a hexadecimal database
   password, a verified email sender, and working Resend or SMTP credentials.
   Never commit this file or put private secrets in `NEXT_PUBLIC_*` variables.
3. Configure Google's authorized website origins and optional Maps key restrictions
   for the actual HTTPS domain. Frontend public keys are set at build time.
4. Back up the current database and uploads before importing any existing data.
   Do not run demonstration seeds or bulk email-verification scripts in production.
5. Run `docker compose --env-file .env.production -f compose.production.yml config`
   privately; the resolved output includes secrets. Then run the same command
   with `up --build -d` instead of `config`.
6. Check `/health` for process liveness and `/ready` for database/schema readiness.
   Test registration, email verification, password reset, diner reviews,
   owner edits/uploads, and admin moderation with separate test accounts.

Create the initial admin with `node src/scripts/create_admin.js` inside the
backend container. Supply `ADMIN_EMAIL` and `ADMIN_PASSWORD` through your secret
manager or an ephemeral environment injection, not command-line literals.
The script refuses to overwrite existing accounts. Remove those bootstrap
variables immediately afterward. Facebook sign-in is deliberately disabled in
production until a real provider integration is configured and tested.

## Release Gates

- Complete all role/access-control and sensitive-document checks.
- Run unit tests, isolated-database integration tests, production build, and
  desktop/mobile browser verification after the final changes.
- Confirm production dependency audits have no unresolved release blockers.
- Provision an admin account securely; do not ship known demonstration passwords.
- Verify email delivery and external integrations using production configuration.
- Configure off-host database/upload backups, test restoration, and monitor
  readiness, disk usage, email failures, and application errors.
- Record the released Git commit and retain the prior image and database backup
  for rollback. Never delete Docker volumes to restart or upgrade the service.

The stack follows the official [Next.js deployment documentation](https://nextjs.org/docs/app/getting-started/deploying).
Managed hosting is also possible, but persistent uploads, database access,
same-origin API routing, and email callbacks must be configured for that provider.
