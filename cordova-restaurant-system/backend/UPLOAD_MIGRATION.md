# Upload storage for Vercel

Create two Vercel Blob stores and connect them to the backend project: a **Public** store for restaurant and user images, and a **Private** store for business permits. Configure the backend project's `BLOB_READ_WRITE_TOKEN` for the public store and `BLOB_PRIVATE_READ_WRITE_TOKEN` for the private store. Both credentials are required at production startup and must be different. Keep both values in the hosting environment, never in Git or the frontend. Permit downloads go through the authenticated admin API.

Production uploads are stored in Blob. Multipart upload requests are limited to 4 MB, including form overhead, to fit Vercel Functions' 4.5 MB request limit. Larger uploads would need a separate direct-to-Blob client flow.

Existing local uploads require a one-time move after the production database is provisioned and before public launch:

1. Back up the database and the backend `uploads` and `private-uploads` folders.
2. Run database migrations and set `DATABASE_URL` to the target database. On the computer holding the uploaded files, run from `backend`: `npm run storage:migrate`. This previews every local file and reports missing files or permits whose stored references need manual review. It makes no changes.
3. Set both Blob tokens in that shell, then run `npm run storage:migrate -- --apply`. The script uploads files and updates matching database references. It leaves local copies for rollback and can be resumed if interrupted.
4. Run the preview again. It should report zero local references and zero permits needing review. Verify restaurant images, avatars, review photos, and an admin permit download before removing local backups.

The migration covers images in restaurants, users, galleries, menus, promotions, and reviews, plus business permits. Public images use the public store; permits use the private store. The script refuses to apply while files are missing or permit references point to an unsupported location.
