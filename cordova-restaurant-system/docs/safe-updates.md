# Updating production safely

## Required checks

Changes to `main` must pass the GitHub jobs `backend-tests` and `frontend-checks`.
Use a branch and pull request. The backend job runs the unit suite; the frontend
job runs TypeScript checks, frontend regression tests, and a complete build.

Production Vercel builds have additional checks:

- The frontend checks the configured backend, public listing count, and recommendations.
- The backend starts the candidate application locally and checks listings, recommendations,
  sample menus, and permit authentication against the production database.
- The backend checks persistent image storage credentials and access mode, reads a stored
  image when available, and checks private permit storage configuration.
- SMTP authentication is checked without sending email. This confirms the connection;
  inbox placement still requires a real delivery test after changing providers or credentials.

`MIN_PUBLIC_LISTINGS` is configured as `24` for both Vercel projects. An intentional
reduction in public listings requires a reviewed adjustment to that baseline. Do not
lower it merely to make a broken deployment pass.

Preview builds skip live production checks because they do not have production credentials.
The normal code checks still apply. A passing build reduces risk; it cannot prove that
every authenticated workflow or outside service will remain available.

## Database and files

Keep production data in PostgreSQL and Vercel Blob, never deployment-local disk.
Before applying a migration, save the affected tables and verify the migration on a
separate database. Prefer additive, backward-compatible schema changes so the previous
application version can still run. Never run demo seeds in production.

The guarded `restore_public_catalog.js` tool previews by default. It can restore missing
records only when an approved source backup exists, and never replaces existing owner
applications or their statuses. Keep source backups outside the public repository.

## After a release

Verify public listings, recommendations, a restaurant menu, a stored image, and an
unauthenticated permit request (which must return 401). For auth or email changes,
test signup and delivery using an authorized test mailbox. Avoid sending bulk campaigns
as release tests.

## Recovery

Record the last healthy deployment URL before releasing. If runtime checks fail, restore
the appropriate project's previous Ready deployment in Vercel immediately, then fix the
candidate on a branch. For an API routing emergency the existing CLI fallback is:

```
vercel alias set <previous-ready-api-deployment> cordova-eats-api.vercel.app
```

An application rollback does not restore database rows or reverse migrations. Restore
database data only from a checked backup with the affected records identified.
