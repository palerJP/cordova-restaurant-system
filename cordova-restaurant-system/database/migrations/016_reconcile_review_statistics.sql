-- Replace any seeded or stale aggregate values with actual published reviews.
UPDATE restaurants r SET
 review_count=(SELECT COUNT(*) FROM reviews rv WHERE rv.restaurant_id=r.id AND rv.status='visible'),
 avg_rating=COALESCE((SELECT ROUND(AVG(rv.rating)::numeric,2) FROM reviews rv WHERE rv.restaurant_id=r.id AND rv.status='visible'),0);
