# PayMongo test payments

## What is implemented

Restaurant owners can create a pending promotion and choose the active 30-day package. The backend snapshots its price (₱199.00, or 19,900 centavos) and duration in `promotion_payment_orders`, creates a PayMongo Hosted Checkout v2 session, and returns only its checkout URL and order ID. The redirect only displays order status. A signed `checkout_session.payment.paid` webhook triggers a fresh server-side session lookup. The database transaction locks the order, checks the session ID, order reference, PHP amount, test mode, and paid payment, records the payment, and starts the promotion for 30 days. Repeated webhook deliveries cannot extend the promotion again.

The existing GCash/Maya reference-and-admin-review path remains available. It is a separate manual process. The Subscription tab now also has a PayMongo **test-mode scheduled monthly subscription** path. The backend creates a PayMongo plan, customer, and subscription; the browser attaches a Maya test payment method to the first invoice's Payment Intent and redirects to Maya authorization. Paid access begins only after a fresh server read confirms an active subscription and a paid first invoice. Signed subscription and invoice events trigger later reconciliation. This flow has been implemented locally, but cannot be verified end to end until the PayMongo account has Subscriptions and Maya enabled with test credentials.

## Setup

1. Use Node 22 or later, PostgreSQL, and the existing npm lockfiles. Run `cd backend && npm install && npm run db:migrate`, then start the backend with `npm run dev`. Start `frontend` with `npm install && npm run dev`.
2. Configure `DATABASE_URL`, `CLIENT_URL`, and the existing JWT and cookie settings as described in `backend/.env.example`. Set `PAYMONGO_SECRET_KEY` to an **sk_test_** key, `PAYMONGO_PUBLIC_KEY` to a **pk_test_** key, and `PAYMONGO_WEBHOOK_SECRET` to the secret for a **test** webhook. Keep these in ignored `backend/.env.local` or server environment settings. The application refuses live keys. No PayMongo key belongs in a `NEXT_PUBLIC_` variable.
3. In PayMongo's test dashboard, register an HTTPS webhook URL of `https://YOUR-HOST/api/payments/paymongo/webhook` subscribed to `checkout_session.payment.paid`, `subscription.activated`, `subscription.past_due`, `subscription.unpaid`, `subscription.updated`, `subscription.invoice.paid`, and `subscription.invoice.payment_failed`. For local testing, expose the backend through an HTTPS tunnel and register its public URL. Use the test webhook's signing secret. The handler rejects signatures older or newer than five minutes.
4. Sign in as a restaurant owner, open a restaurant dashboard, create a promotion, select the package, and click **Continue to PayMongo test checkout**. Use a [PayMongo test payment method](https://docs.paymongo.com/docs/testing). The package's 30-day period begins on the day the verified payment webhook is processed; dates entered in the older promotion form are replaced.
5. After redirect, the dashboard polls `GET /api/payments/orders/:id`. Pending means PayMongo has not confirmed payment; it is not proof of success. If session creation failed, the pending promotion card offers a retry.

`019_paymongo_test_payments.sql` creates `promotion_packages`, `promotion_payment_orders`, and `paymongo_webhook_events`. `020_paymongo_recurring_subscriptions.sql` creates the monthly plans and recurring subscription records. Neither migration resets existing data. To change prices, update the corresponding package/plan in PostgreSQL before the first remote plan is created. Existing remote plans and subscriptions retain their original terms.

## Security and failure behavior

The server uses the authenticated user's ID and verifies restaurant ownership. Browser-supplied amounts are ignored. The webhook reads raw bytes before JSON parsing and checks the `Paymongo-Signature` test (`te`) HMAC with a timing-safe comparison, a five-minute timestamp window, and `livemode: false`. It fetches the checkout from PayMongo before fulfillment. The order row lock and unique event ID make repeat deliveries safe. A failed checkout API request leaves a pending order for retry with the same PayMongo idempotency key. An API error never activates the promotion. Invalid signatures return 401; a valid event arriving before the checkout session is saved returns 503 so PayMongo can retry.

A cancellation redirect asks the backend to expire the checkout session. The order changes to expired only when a fresh PayMongo read confirms session expiry; paid or processing sessions remain pending for the webhook. An unsuccessful payment attempt leaves the checkout open for retry. Current limitations: Refund and dispute webhooks are not yet connected to promotion revocation. The single configured promotion checkout method is QR Ph; enable and test it in the PayMongo test account. The subscription screen's legacy manual payment process and admin overrides are outside PayMongo recurring billing. The test account was not available during implementation, so the live shape of test-mode webhook payloads, payment method availability, successful first charge, and renewal were not verified. Capture real test events and compare their structure with the handler before a panel demo.

## Recurring subscription demo

1. Ask PayMongo to enable Subscriptions and Maya on the **test account**. Configure its test secret/public keys and signed webhook. The plans endpoint shows `available: false` until both keys are configured; account enablement still requires a real test checkout.
2. Sign in as an owner, open **Dashboard → Subscription & Boost**, enter a Maya test phone number, and select a monthly PayMongo plan. The server snapshots the configured price in centavos and creates the remote plan, customer, subscription, and first invoice. It returns the first Payment Intent's client key and the test public key. The browser creates a Maya test payment method with the public key, attaches it to the Payment Intent, and follows PayMongo's authorization redirect. Raw card data never enters this app.
3. Return to the dashboard. It reads `GET /api/payments/subscriptions/:id` and the provider state; `incomplete` means unpaid. When PayMongo reports the first invoice paid and the subscription active, the restaurant tier is applied. Future signed invoice events refresh the tier and next billing date. `past_due`, `unpaid`, and `cancelled` remove the recurring entitlement. The owner can cancel from the same section. A first payment that expires after 24 hours can be started again as a new subscription.
4. Show `SELECT id,plan_id,status,amount_centavos,currency,next_billing_at FROM recurring_subscriptions ORDER BY created_at DESC LIMIT 1;` beside the PayMongo test dashboard. Replay a signed event to demonstrate deduplication. The existing manual reference cards below the PayMongo section remain a separate, administrator-reviewed flow.

The local migration and frontend build can be tested without credentials. A real PayMongo test account was not available here, so the first charge, Maya redirect, future renewal, and exact webhook payload shape still need an account-enabled end-to-end check before a panel demonstration.

## Troubleshooting

- **Checkout cannot start:** check that `PAYMONGO_SECRET_KEY` begins with `sk_test_`, the package is active, and QR Ph is available in your test account. A pending promotion card can retry checkout. An order whose remote response was lost over 23 hours ago needs manual reconciliation because PayMongo idempotency keys expire after 24 hours.
- **Payment remains pending:** verify that the public HTTPS webhook URL reaches the backend, the webhook is subscribed to `checkout_session.payment.paid`, the test webhook secret matches, and the session read shows a paid PHP payment for the stored amount. Do not set the local order to paid by hand.
- **Webhook gets 401:** check the `Paymongo-Signature` header, exact raw body, endpoint secret, test signature (`te`), and server clock. An unsigned test request should get 401.
- **Webhook gets 400 or 500/503:** 400 means the event or session does not match a test order; 503 means the checkout session was not yet linked locally. A provider read failure returns 500. PayMongo retries non-success responses.

## Defense demonstration

1. Show a normal owner account, the 30-day package, and the pending promotion order in PostgreSQL: `SELECT id, status, amount_centavos, currency, checkout_session_id FROM promotion_payment_orders ORDER BY created_at DESC LIMIT 1;`.
2. Complete a PayMongo **test** checkout. Show that the webhook changes the order to `paid` and the matching `promotions` row to `active` with the configured end date.
3. Send an unsigned POST to `/api/payments/paymongo/webhook`; show HTTP 401. Replay the same valid test webhook from the PayMongo dashboard; show that the order has one payment and the end date is unchanged.
4. Show the PayMongo recurring section and its first-invoice authorization, then distinguish it from the manual reference cards below it. Use the recurring demo steps above for a real account-enabled test.

Official references: [Hosted Checkout v2](https://docs.paymongo.com/docs/payment-channels-hosted-checkout), [webhook signatures](https://docs.paymongo.com/docs/developer-tools-webhook-setup-management), [Subscriptions](https://docs.paymongo.com/docs/payment-acceptance-subscriptions), and [webhook events](https://docs.paymongo.com/docs/developer-tools-webhooks-events).
