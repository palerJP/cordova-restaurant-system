# Restaurant subscriptions

Owners open Dashboard > Subscription & Boost, choose Basic (PHP499), Premium (PHP999), or Featured (PHP1999), transfer using the displayed GCash/Maya details, and submit the receipt reference. This is a manual transfer workflow, not an automatic payment gateway or recurring charge. Confirm the destination before sending real money.

The request remains pending without activating a new boost. In Admin > Promotions > Subscriptions, check the transfer in the receiving payment account, then Confirm & Verify or Reject. The server sets the plan and matching transaction expiry together. All plans last 30 days; same-tier renewal adds 30 days to a still-active expiry. Verification retries do not extend the plan twice. Rejected or ended requests need a new payment request, not reactivation of an old receipt.

Only one pending request per restaurant is accepted. The same request retry returns its pending record; reusing a reference on another restaurant or after processing is rejected. Owner/admin permissions and ownership are enforced on the backend. Restaurant row locks serialize concurrent changes. Ending an older record cannot cancel a newer entitlement. Verified records must be terminated before deletion. Downgrading cancels pending requests.

The owner screen refreshes every 15 seconds while visible and has a manual refresh button and recent request history. Admin has Refresh records. Expired plans display as free. The standalone payment page reports failed requests as failures and requires a selected restaurant.

Validation: 8 real PostgreSQL HTTP subscription tests, 6 analytics tests and 7 reservation regression tests passed. A real browser exercised owner login and request, admin login and verification, owner status, admin termination and mobile layout against temporary local accounts and database records, removed afterward. No money was transferred and no production test payment was verified. External receipt authenticity and payment-provider settlement require administrator review.
