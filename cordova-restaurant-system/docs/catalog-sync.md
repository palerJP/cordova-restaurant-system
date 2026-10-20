# Restaurant catalog and photos

The committed public catalog snapshot contains 26 restaurants, 167 menu categories, and 952 dishes with their prices and available photos. It contains no account credentials or private owner records. The 518 mirrored photos are served from `frontend/public/images/catalog-webp/` so the deployed frontend does not depend on the original external image hosts or local backend uploads.

The frontend's catalog image map replaces older image URLs returned by the API with the bundled files. When an original photo was unavailable, 35 dish cards use a representative photo from the same restaurant, preferably the same category, and display **Representative photo**. Two covers have a representative fallback. These are not photos of the named dish or establishment.

To refresh the committed snapshot from the catalog database, set `DATABASE_URL` in the backend environment and run `npm run catalog:export` from `backend/`. Review the snapshot, mappings, and new images before committing them. This command only exports public catalog fields and copies referenced images into the frontend.

To load the snapshot into another database, run the migrations there first, then from `backend/` run `npm run catalog:check` with that database's `DATABASE_URL`. The check runs the full import in a transaction and rolls it back. Review the counts, then run `npm run catalog:import` with the same database connection to apply it. The importer matches existing restaurants by ID or slug and dishes by ID or category and name; it adds missing records and updates prices and image paths without deleting existing records.

Deploying this commit makes the bundled photo paths available on Vercel. It does not change a separate production database by itself; use the import command against that database if its restaurants, dishes, or prices need syncing.
