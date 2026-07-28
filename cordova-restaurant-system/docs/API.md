# API Reference — Cordova Local Restaurant Recommendation System

Base URL: `http://localhost:4000/api` (dev). Interactive Swagger UI is also
served at `/api/docs`.

All responses follow the shape:
```json
{ "success": true, "data": ..., "meta": { ... } }
```
or on error:
```json
{ "success": false, "message": "...", "details": [{ "field": "email", "message": "..." }] }
```

Auth: send `Authorization: Bearer <accessToken>`. The refresh token lives in
an httpOnly cookie set by `/auth/login` and `/auth/refresh` — the frontend's
API client handles refreshing automatically on a 401.

---

## Auth — `/api/auth`

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/register` | — | Create a customer or owner account. `{ email, password, fullName, role?, phone? }` |
| POST | `/login` | — | `{ email, password }` → `{ user, accessToken }` + sets refresh cookie |
| POST | `/refresh` | cookie | Rotates the refresh token, returns a new access token |
| POST | `/logout` | — | Revokes the current refresh token |
| GET | `/me` | required | Current user's basic profile from the JWT |
| POST | `/change-password` | required | `{ currentPassword, newPassword }` — revokes all sessions |

## Users — `/api/users`

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/me` | required | Full profile |
| PATCH | `/me` | required | multipart: `fullName`, `phone`, `avatar` file |
| GET | `/me/preferences` | required | Saved food preferences (feeds recommendations) |
| PUT | `/me/preferences` | required | `{ preferredCuisines, dietaryRestrictions, budgetRange, preferredServices, homeLatitude, homeLongitude, maxDistanceKm }` |
| GET | `/` | admin | List/search users. Query: `role`, `search`, `page`, `limit` |
| PATCH | `/:id/active` | admin | `{ isActive }` |

## Restaurants — `/api/restaurants`

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/` | — | Search/browse. Query: `q`, `cuisines` (csv slugs), `priceRange`, `dietary` (csv), `services` (csv), `lat`, `lng`, `maxDistanceKm`, `sortBy` (`relevance|rating|distance|newest|price_asc|price_desc`), `page`, `limit` |
| GET | `/:id` | optional | Restaurant detail (logs a view). Query: `lat`, `lng` for distance, `source` (`browse|recommendation|search|map`) |
| GET | `/mine` | owner/admin | Restaurants owned by the current user |
| POST | `/` | owner | multipart: business fields + `businessPermit` file. Starts as `pending` |
| PATCH | `/:id` | owner/admin | Update own listing fields |
| POST | `/:id/cover-image` | owner/admin | multipart `image` |

### Menu — `/api/restaurants/:restaurantId/menu`

| Method | Path | Auth |
|---|---|---|
| GET | `/` | — |
| POST | `/categories` | owner/admin |
| DELETE | `/categories/:categoryId` | owner/admin |
| POST | `/items` | owner/admin (multipart, optional `image`) |
| PATCH | `/items/:itemId` | owner/admin |
| DELETE | `/items/:itemId` | owner/admin |

### Reviews — `/api/restaurants/:restaurantId/reviews` + `/api/reviews`

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/restaurants/:restaurantId/reviews` | optional | List; admins see flagged/removed too |
| POST | `/restaurants/:restaurantId/reviews` | customer | `{ rating, comment }` — one per user per restaurant |
| PATCH | `/reviews/:id` | customer (owner of review) | Edit own review |
| DELETE | `/reviews/:id` | customer (owner of review) | Delete own review |
| POST | `/reviews/:id/reply` | owner | `{ reply }` — public owner response |

### Promotions — `/api/restaurants/:restaurantId/promotions` + `/api/promotions`

| Method | Path | Auth |
|---|---|---|
| GET | `/promotions` | — (public feed of currently-active promos, all restaurants) |
| GET | `/restaurants/:restaurantId/promotions` | — |
| POST | `/restaurants/:restaurantId/promotions` | owner/admin (multipart, optional `image`) |
| PATCH | `/restaurants/:restaurantId/promotions/:id` | owner/admin |
| DELETE | `/restaurants/:restaurantId/promotions/:id` | owner/admin |

### Operating hours — `/api/restaurants/:restaurantId/hours`

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/` | — | 7 rows, `day_of_week` 0=Sunday..6=Saturday |
| PUT | `/` | owner/admin | `{ days: [...7 entries] }` — replaces the whole week |

### Favorites — `/api/restaurants/:restaurantId/favorite` + `/api/favorites`

| Method | Path | Auth |
|---|---|---|
| GET | `/favorites` | customer |
| POST | `/restaurants/:restaurantId/favorite` | customer |
| DELETE | `/restaurants/:restaurantId/favorite` | customer |

### Owner analytics — `/api/restaurants/:restaurantId/analytics`

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/` | owner/admin | Query: `days` (default 30). Returns `totalViews`, `viewsFromRecommendation`, `timesRecommended`, `timesTopResult`, `dailyViews` |

## Cuisines — `/api/cuisines`

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/` | — | Lookup list for filter/form UIs |

## AI Recommendation Engine — `/api/recommendations`

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/` | optional | See body below. Logged-in users' saved preferences fill in any field not explicitly sent. |
| GET | `/weights` | admin | Current active scoring weight profile |
| PATCH | `/weights` | admin | `{ cuisineWeight, budgetWeight, proximityWeight, dietaryWeight, ratingWeight }` — must sum to 1.0 |

**POST `/api/recommendations` body:**
```json
{
  "preferredCuisines": ["Seafood", "Cebuano / Local"],
  "budgetRange": "moderate",
  "dietaryRestrictions": ["vegetarian"],
  "requiredServices": ["dine_in"],
  "lat": 10.2531,
  "lng": 123.9494,
  "maxDistanceKm": 5,
  "onlyOpenNow": false,
  "limit": 10
}
```
**Response `data`** is an array of:
```json
{
  "restaurant": { "...": "full restaurant object" },
  "score": 82.4,
  "scoreBreakdown": {
    "cuisineMatch": 100, "budgetFit": 100, "proximity": 62, "dietaryMatch": 100, "rating": 90
  }
}
```
See `docs/DATABASE.md` and `backend/src/services/recommendation.service.js`
for the full scoring algorithm explanation.

## Admin — `/api/admin` (all routes require `role: admin`)

| Method | Path | Description |
|---|---|---|
| GET | `/restaurants?status=pending` | Verification queue |
| PATCH | `/restaurants/:id/verify` | `{ status: 'verified'\|'rejected', rejectionReason? }` |
| PATCH | `/restaurants/:id/suspend` | Suspend a previously-verified business |
| GET | `/users` | Same as `/api/users` (admin-only, kept here for a single admin surface) |
| PATCH | `/users/:id/active` | Activate/deactivate an account |
| GET | `/reviews/flagged` | Moderation queue |
| PATCH | `/reviews/:id/moderate` | `{ status: 'visible'\|'flagged'\|'removed', flaggedReason? }` |
| GET | `/analytics/overview` | System-wide dashboard: user/restaurant/review counts, top cuisine demand, peak search hours |

## Health

`GET /health` → `{ status: "ok", timestamp }`

## Rate limits

General API: 200 requests / 15 min per IP (configurable via `RATE_LIMIT_*`
env vars). Auth endpoints (`/auth/login`, `/auth/register`, `/auth/refresh`):
10 requests / 15 min per IP to blunt credential stuffing.

## Pagination

List endpoints accept `page` (default 1) and `limit` (default 12, max 50)
and return:
```json
"meta": { "page": 1, "limit": 12, "totalCount": 42, "totalPages": 4, "hasNextPage": true, "hasPrevPage": false }
```
