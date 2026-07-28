-- ============================================================================
-- Migration 004: Amenities + Nearby Attractions (Priority 4 support)
-- ============================================================================
-- Adds:
--   1. An `amenities` column on restaurants (parking, wifi, outdoor seating,
--      etc.) — owner-editable, shown on the restaurant detail page.
--   2. An `attractions` table seeded with real, researched Cordova, Cebu
--      landmarks (CCLEX Bridge, Gilutongan Island, Nalusuan Island, Day-as
--      Boardwalk, Isla Romantica) — used to power a "Nearby Attractions"
--      section on restaurant detail pages via distance calculation.
--
-- Coordinates for attractions are reasonable approximate placements based
-- on their described barangay/location in sourced material, not
-- individually GPS-verified pins — same honesty standard as migration 003.
-- ============================================================================

ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS amenities TEXT[] NOT NULL DEFAULT '{}';

CREATE TABLE IF NOT EXISTS attractions (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        VARCHAR(150) NOT NULL,
  slug        VARCHAR(170) NOT NULL UNIQUE,
  description TEXT,
  category    VARCHAR(50) NOT NULL, -- landmark, beach, island, boardwalk, etc.
  latitude    DOUBLE PRECISION NOT NULL,
  longitude   DOUBLE PRECISION NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_attractions_location ON attractions(latitude, longitude);

INSERT INTO attractions (id, name, slug, description, category, latitude, longitude) VALUES
(
  'aea5c22d-ae75-4e1e-83cb-9593e1c6dad8',
  'Cebu–Cordova Link Expressway (CCLEX)',
  'cclex-bridge',
  '[Verified] The longest sea-crossing bridge in the Philippines (8.9 km), connecting Cebu City to Cordova via a cable-stayed design with two 145-meter towers. A popular photo spot, especially at night when the towers are illuminated.',
  'landmark', 10.2650, 123.9680
),
(
  '541c676b-dda4-44c6-bd57-03f0839f42cb',
  'Gilutongan Island & Marine Sanctuary',
  'gilutongan-island',
  '[Verified] A Cordova barangay roughly 5 km southeast of the town center, home to a marine protected sanctuary established in 1991. White-sand beaches and shallow coral reefs make it a popular snorkeling and diving day trip.',
  'island', 10.2250, 123.9850
),
(
  'ae6181e8-337c-463c-add2-889229f312ec',
  'Nalusuan Island Marine Sanctuary',
  'nalusuan-island',
  '[Verified] A small island and marine sanctuary within Gilutongan barangay''s territory, known for its dive sites, coral gardens, and white sandbar.',
  'island', 10.2200, 123.9800
),
(
  '317fc58d-37dd-468f-861d-d7ec118c2913',
  'Day-as Boardwalk',
  'day-as-boardwalk',
  '[Name confirmed, location approximate] An emerging waterfront boardwalk attraction in Barangay Day-as, near several floating restaurants. Exact boundaries not independently verified.',
  'boardwalk', 10.2680, 123.9695
),
(
  '0953c107-be4c-4607-b3c1-5e9b26381012',
  'Isla Romantica',
  'isla-romantica',
  '[Name confirmed, location approximate] An emerging tourist spot in Cordova mentioned alongside the Day-as Boardwalk as part of the town''s growing waterfront attractions. Exact location not independently verified.',
  'landmark', 10.2670, 123.9650
)
ON CONFLICT (slug) DO NOTHING;
