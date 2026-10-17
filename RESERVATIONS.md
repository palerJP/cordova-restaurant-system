# Restaurant reservations

Owners enable online requests in Dashboard > Reservations after publishing operating hours. Set the available guest capacity, maximum party size, booking duration, and minimum notice, then save. Reservations are disabled by default.

Customers open a restaurant's Reserve tab, choose a date, party size and available time, and provide contact details. Signed-in, verified customers can submit a request. My Reservations shows the persisted status and allows cancellation before the booking starts.

Requests begin as pending and do not guarantee a table. Owners confirm or decline requests in their Reservations dashboard and may add a customer-visible note. Confirmed reservations hold capacity; cancelling releases it. Owners can mark a started booking as no-show or an ended booking as completed. No email or SMS notification is sent; both lists refresh every 15 seconds while visible and offer manual refresh.

All booking times use Philippine time (Asia/Manila). Availability follows published operating hours, minimum notice, a 90-day booking window, and confirmed overlapping reservations. The backend rechecks capacity under a database transaction when confirming, preventing concurrent overbooking. Retried submissions use an idempotency key. Customers cannot access other customers' bookings; owners manage only their own restaurants.

Database migration: `database/migrations/022_restaurant_reservations.sql`. The backend readiness check also provisions these additive tables safely. No example reservations are inserted.

Validation: seven real PostgreSQL HTTP integration tests cover permissions, persistence, retries, cancellation, capacity, concurrent confirmations, hours and timing. A browser test exercised owner enablement, customer request, owner confirmation, customer status and cancellation against the backend and database. Customer and owner layouts were checked at 390px width; frontend TypeScript passed.