# Review reporting and moderation

On a live restaurant's Reviews tab, signed-in users can select Report review, choose a category, and explain the concern (10–1000 characters). Users cannot report their own reviews or submit duplicate reports; reporting is limited to 20 requests per account per hour. Reporting alone does not hide a review or change the restaurant rating.

Admins open Content & Review Moderation, then Reported Reviews. Inspect reports and the original text/rating snapshot, enter a decision reason, and select Keep / Restore Visible, Hide for Investigation, or Remove. Hiding temporarily keeps reports open. Keeping dismisses open reports; removing resolves them. Hidden and removed reviews are excluded from public reviews and rating calculations. Pagination supports larger queues.

Reporter identities are excluded from responses to admins and are unavailable to restaurant owners and reviewers. Moderation records decision history and the administrator's identity in the database audit log, and creates an in-app notification for the review author. This does not send email. Review submission requires a successful API response; cached/demo reviews are no longer merged into live listings.

Migration: database/migrations/015_review_reporting.sql. Run npm run db:migrate from backend for each deployment before launching updated code. Local development database is already migrated.

## Live review totals

Migration 016 reconciles stored restaurant ratings/counts against actual visible reviews. Cards and owner dashboards subscribe to a shared public statistics request every five seconds while visible. The detail page fetches reviews when their count/revision changes, refreshes on focus/reconnect, and retries periodically. It uses server pagination totals, supports older review pages, and retains confirmed reviews during connection failures. Empty ratings display an em dash; static sample reviews do not count. Statistics polling has its own request limit. These updates work while the frontend, API and database are running; polling resumes when a background tab becomes visible.

## Managing your own reviews

Select My Reviews from the profile menu to find all your reviews, including hidden/removed ones. On your review card, hold a touch for 600 ms or select the three-dot menu. Scrolling, releasing early, and canceled touches stop the hold gesture. Edit changes the rating/comment and can remove existing photos; deletion requires confirmation. Native modal dialogs trap focus and support Escape/Cancel. Updates refresh public review statistics. API ownership checks apply to every read/edit/delete, including users who have since become restaurant owners. Editing never changes moderation status. Mobile browser support targets current Android Chrome and iOS Safari; physical-device testing remains outstanding.

## Unique reactions

Migration 017 records each reaction against a review/account pair with a database unique index. Repeating the same emoji is idempotent; choosing another replaces that user's existing emoji. Concurrent requests cannot inflate counts. Allowed emojis are validated, hidden reviews reject reactions, and authenticated review reads return the user's current selection and ownership flag. Legacy anonymous counters are recalculated from attributed votes because repeated taps could have inflated them. The owner menu uses a three-dot button with an accessible label; selecting it opens Edit/Delete actions.
