# Business ownership claims

## Owner workflow

1. Sign up using your own email and verify it.
2. Find an existing restaurant under Browse restaurants and open its page.
3. In the page footer under **For Restaurant Owners**, select **Claim Your Business** for an unclaimed municipal listing, or
   **Report Incorrect Ownership** for a listing already managed by another account.
4. Enter your name, relationship to the establishment, contact number, and
   ownership explanation. Attach a permit or authorization document and confirm
   the information is truthful.
5. Track the application using **My claims and notifications** on the restaurant-owner
   page or `/dashboard/claims`. Pending claims do not grant editing access.
6. If more information is requested, reply and optionally attach another document.
   Previous evidence and messages remain in the history.
7. After approval, use **Manage establishment**. The existing restaurant ID,
   menu, reviews, photos, and promotions remain intact.

Applicants can withdraw open applications. Rejected applicants can submit fresh
evidence in a new application. Each application has an in-app support conversation
with admins. A duplicate open claim from the same applicant is blocked; claims
from different applicants are allowed for comparison.

## Admin workflow

Open **Business Verification → Ownership claims**. Filter by status or search
the displayed applicants. Open the application, review its evidence and history,
and independently verify authority to manage the establishment. PDF validation is
not proof of ownership or a malware scan.

Provide a reason to approve, reject, or request more information. Approval of a
disputed listing additionally requires an explicit transfer confirmation. The
current owner is notified when a dispute is submitted and when ownership changes.
Support replies do not reopen or change a decided application.

Approval locks the restaurant and applications in a database transaction, checks
the original owner has not changed, requires an active verified applicant,
grants the owner role, transfers the listing, and rejects other open applications.
Admins cannot approve their own applications. Every submission, decision, reply,
and withdrawal is recorded in application history and audit logs.

## Local setup and release

- Run `npm run db:migrate` in `backend` to apply `014_business_claims.sql`.
  Existing municipal placeholder listings become unclaimed; the placeholder
  account remains disabled. Other existing owner accounts retain their listings.
- Restart the API after updating the code unless it uses automatic reload.
- Development verification emails use the existing local logging workflow.
  Claim updates and support messages are **in-app notifications**, not email.
- Evidence is limited to 5 MB. JPEG, PNG, and WebP files must decode successfully
  and are re-encoded as WebP. PDFs must have a PDF signature and EOF marker.
- Files are stored under `UPLOAD_DIR/claim-evidence`, excluded from Git and
  container build contexts, and never served by public upload routes.
  Download endpoints allow only the applicant or an admin and use attachment,
  no-store, and nosniff headers. Back up this directory with the other uploads.
- Add malware scanning or document sanitization before opening untrusted PDFs
  in a production review process. These content checks do not establish that
  arbitrary PDFs are harmless.
- Local API/database tests cover access control, evidence validation, competing
  approvals, ownership preservation, disputes, additional information,
  notifications, withdrawal, and support replies.
- Run `node src/scripts/test_isolated.js` in `backend` and `npm run build` in
  `frontend` before release. The isolated runner creates and removes its own
  local test database without altering the development database.

The new-registration page links to the search and claims pages so owners can
claim an existing listing before deciding to register a new establishment.
