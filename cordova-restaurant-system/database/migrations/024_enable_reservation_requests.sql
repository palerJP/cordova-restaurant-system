-- Requests may be submitted at any time; visit times still follow booking hours.
ALTER TABLE restaurant_reservation_settings ALTER COLUMN enabled SET DEFAULT TRUE;
INSERT INTO restaurant_reservation_settings(restaurant_id, enabled)
SELECT r.id, TRUE FROM restaurants r JOIN users u ON u.id=r.owner_id
WHERE r.is_active=TRUE AND r.status='verified' AND u.is_active=TRUE
ON CONFLICT(restaurant_id) DO UPDATE SET enabled=TRUE, updated_at=now();
