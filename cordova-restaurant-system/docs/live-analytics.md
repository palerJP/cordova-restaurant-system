# Live database analytics

Owner analytics and the admin overview read database snapshots every five seconds while visible, with refresh on focus/reconnect and a manual refresh button. This is polling, not an instantaneous push feed. Responses use `Cache-Control: private, no-store`. Failed or invalid responses never become zero: the UI shows an error, and any retained snapshot is marked as last-successful data.

## Sources and definitions

- Profile requests: committed `business_analytics_events` rows with `kind='view'` in the selected period. These are detail-page API requests, not unique people. A page reload can add another request.
- Requests from recommendations: those profile requests tagged by a recommendation link. Browse/search links use separate source tags.
- Included in recommendation results: one event per restaurant per generated recommendation response, recorded by the recommendation service. This does not claim a card was seen or clicked. Normal ranked searches and admin previews do not contribute.
- First result: recommendation events with position 1. A unique event/restaurant/type key prevents duplicate writes with the same event identifier.
- Saved businesses: current favorites from active accounts, excluding the business owner, admins, and known demo actors. These are not paid subscribers.
- Reviews and ratings: actual visible review rows, excluding known demo customer IDs. No cached rating or catalog estimate is used in these dashboards.
- Active paid businesses: current non-free restaurant tiers backed by an unexpired, admin-verified subscription transaction for the same tier, with verifier and verification timestamp. A sample tier, pending payment, or expired transaction does not qualify.
- Verified payments: verification records within the period, not payment-provider settlement confirmation or calculated revenue.
- Admin accounts/content: current database record counts. Known seed user IDs and their demo reviews, plus the exact seed promotion fixture, are excluded. Restaurant catalog entries remain real establishment records; their count is not a count of active human users.
- Cuisine/hour charts: distinct generated recommendation requests with at least one tracked result in the event ledger. A result with ten restaurants counts as one request, not ten. Zero activity has zero-height bars.

## Tracking and history

The ledger begins at the database timestamp in `business_analytics_tracking`. Old mixed search/history logs are not backfilled, because their origin cannot reliably establish genuine recommendation activity. The UI shows this start date. Clearing browsing/search history does not delete ledger events. Signed-in owner self-visits, admin activity, and the known seed actors are excluded at write time. Anonymous traffic cannot be identified as an owner or a unique person.

The 30-day activity window includes today and the preceding 29 calendar days in `Asia/Manila` (UTC+8). Each snapshot uses one SQL statement and one database timestamp. Current favorites/reviews/subscriptions are explicitly labeled current; they are not presented as 30-day acquisition counts.

Migration `021_live_business_analytics.sql` is additive and idempotent. For existing deployments, the analytics model provisions only its own tables under a transaction/advisory lock on first use; it does not run unrelated pending migrations or alter existing history records. Known demo account IDs come from the repository seed script. Unknown manually fabricated historical content cannot be automatically certified; no dashboard should claim payment settlement or unique visitors from these records.

## Verification

The database regression test runs actual PostgreSQL queries in an isolated local schema and rolls everything back. It covers zero activity, demo exclusions, duplicate event writes, owner/admin exclusion, rank positions, daily totals, retained analytics after history deletion, expired/out-of-window events, verified versus pending/sample subscriptions, and failures propagating instead of becoming zeros. Frontend contract tests reject missing fields, old snapshots, negatives, invalid timestamps, and numeric strings.
