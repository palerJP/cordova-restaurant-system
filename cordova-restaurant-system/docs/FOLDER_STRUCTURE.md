# Folder Structure

```
cordova-restaurant-system/
├── database/
│   ├── schema.sql                  Full schema (reference copy)
│   ├── migrations/
│   │   ├── 001_initial_schema.sql  Extensions, enums, tables, indexes, triggers
│   │   └── 002_reference_data.sql  Cuisine lookup + default AI weight profile
│   └── seed.sql                    Demo users/restaurants/menus/reviews (dev only)
│
├── backend/
│   ├── src/
│   │   ├── config/                 env.js, db.js (pg pool), swagger.js
│   │   ├── middleware/             auth (JWT), rbac, errorHandler, rateLimiter,
│   │   │                           validate (express-validator wrapper), upload (multer)
│   │   ├── routes/                 One Express router per resource
│   │   ├── controllers/            HTTP layer: parse req → call services/models → shape res
│   │   ├── services/                Business logic:
│   │   │                             - auth.service.js (register/login/refresh/logout)
│   │   │                             - recommendation.service.js (THE AI ENGINE)
│   │   │                             - upload.service.js (image resize via sharp)
│   │   ├── models/                  Parameterized SQL data access, one file per table/domain
│   │   ├── validators/              express-validator chains per resource
│   │   ├── utils/                   logger, ApiError, JWT helpers, password hashing,
│   │   │                            pagination, slugify
│   │   ├── scripts/                 migrate.js / seed.js — run with `node src/scripts/x.js`
│   │   ├── app.js                   Express app assembly (middleware + routes)
│   │   └── server.js                Entry point (listen + graceful shutdown)
│   ├── tests/
│   │   ├── unit/                    Pure-function tests (recommendation scoring) — no DB needed
│   │   └── integration/             supertest HTTP tests — need a test DB, auto-skip otherwise
│   └── uploads/                     User-uploaded files (gitignored), served at /uploads/*
│
├── frontend/
│   └── src/
│       ├── app/                     Next.js App Router — one folder per route
│       │   ├── page.tsx             Home: browse/search/filter/map
│       │   ├── recommendations/     AI recommendation quiz + results
│       │   ├── restaurants/[slug]/  Restaurant detail
│       │   ├── login/, register/
│       │   ├── favorites/, promotions/
│       │   ├── dashboard/           Owner: my businesses, register new, manage one
│       │   └── admin/               Admin: overview, verification, moderation, users, AI tuning
│       ├── components/
│       │   ├── ui/                  Reusable primitives: Button, Input, Modal, Skeleton, Badge...
│       │   ├── RestaurantCard.tsx, FilterPanel.tsx, MapView(Client).tsx, Navbar.tsx, ...
│       ├── lib/                     api.ts (fetch client + token refresh), auth-context,
│       │                            theme-context, toast-context, types.ts
│       └── hooks/                   useDebounce, useGeolocation
│
└── docs/
    ├── API.md                       Full endpoint reference
    ├── DATABASE.md                  ERD + schema rationale + migration instructions
    ├── DEPLOYMENT.md                 Hosting, env vars, production checklist
    └── FOLDER_STRUCTURE.md           This file
```

## Why this layering (backend)

**routes → controllers → services/models** is a standard three-layer split:

- **routes** only wire up URLs to middleware + a controller function. No
  logic lives here beyond `router.METHOD(path, ...middleware, controller)`.
- **controllers** translate HTTP ↔ domain: read `req.body`/`req.params`,
  call into services or models, and shape the JSON response. They should
  never contain SQL or business rules directly.
- **services** hold logic that doesn't map 1:1 to a database table — most
  importantly the recommendation engine, which reads from multiple models
  and applies scoring logic that has nothing to do with SQL.
- **models** are the only files that talk to the database, using
  parameterized queries (never string-concatenated SQL, to prevent SQL
  injection). Each file corresponds to one table or a small closely-related
  group of tables.

This means, for example, changing the recommendation algorithm only
touches `services/recommendation.service.js`, and changing a database
column only touches the corresponding `models/*.model.js` file plus the
migration — the routes and controllers around them don't need to change.
