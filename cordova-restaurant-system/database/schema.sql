-- ============================================================================
-- Cordova Local Restaurant Recommendation System
-- Full Database Schema (PostgreSQL 14+)
-- Also MySQL 8+ compatible with minor notes (see docs/DATABASE.md)
-- ============================================================================

-- Extensions -----------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ============================================================================
-- ENUM TYPES
-- ============================================================================
CREATE TYPE user_role AS ENUM ('customer', 'owner', 'admin');
CREATE TYPE business_status AS ENUM ('pending', 'verified', 'rejected', 'suspended');
CREATE TYPE price_range AS ENUM ('budget', 'moderate', 'expensive', 'premium');
CREATE TYPE service_type AS ENUM ('dine_in', 'takeout', 'delivery');
CREATE TYPE review_status AS ENUM ('visible', 'flagged', 'removed');
CREATE TYPE promotion_status AS ENUM ('draft', 'active', 'expired', 'archived');
CREATE TYPE notification_type AS ENUM (
  'business_verified', 'business_rejected', 'review_flagged',
  'new_review', 'promotion_expiring', 'system'
);

-- ============================================================================
-- USERS  (all actors: customer, owner, admin share one table w/ role)
-- ============================================================================
CREATE TABLE users (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email             VARCHAR(255) NOT NULL UNIQUE,
  password_hash     VARCHAR(255) NOT NULL,
  full_name         VARCHAR(150) NOT NULL,
  phone             VARCHAR(30),
  role              user_role NOT NULL DEFAULT 'customer',
  avatar_url        VARCHAR(500),
  is_active         BOOLEAN NOT NULL DEFAULT TRUE,
  email_verified_at TIMESTAMPTZ,
  last_login_at     TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_email ON users(email);

-- Refresh tokens (rotatable, revocable) --------------------------------------
CREATE TABLE refresh_tokens (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash  VARCHAR(255) NOT NULL UNIQUE,
  user_agent  VARCHAR(255),
  ip_address  VARCHAR(64),
  revoked_at  TIMESTAMPTZ,
  expires_at  TIMESTAMPTZ NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_refresh_tokens_user ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_hash ON refresh_tokens(token_hash);

-- Customer food preferences (used by the AI recommendation engine) ----------
CREATE TABLE user_preferences (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id             UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  preferred_cuisines  TEXT[] DEFAULT '{}',
  dietary_restrictions TEXT[] DEFAULT '{}',   -- e.g. vegetarian, vegan, halal, gluten_free
  budget_range        price_range,
  preferred_services   service_type[] DEFAULT '{}',
  home_latitude        DOUBLE PRECISION,
  home_longitude        DOUBLE PRECISION,
  max_distance_km      NUMERIC(5,2) DEFAULT 5.0,
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- CUISINES (lookup table, admin-manageable)
-- ============================================================================
CREATE TABLE cuisines (
  id    SERIAL PRIMARY KEY,
  name  VARCHAR(80) NOT NULL UNIQUE,
  slug  VARCHAR(80) NOT NULL UNIQUE
);

-- ============================================================================
-- BUSINESSES / RESTAURANTS
-- ============================================================================
CREATE TABLE restaurants (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id            UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name                VARCHAR(150) NOT NULL,
  slug                VARCHAR(170) NOT NULL UNIQUE,
  description         TEXT,
  address             VARCHAR(255) NOT NULL,
  barangay            VARCHAR(100),                 -- local admin unit within Cordova
  latitude            DOUBLE PRECISION NOT NULL,
  longitude           DOUBLE PRECISION NOT NULL,
  phone               VARCHAR(30),
  email               VARCHAR(255),
  price_range         price_range NOT NULL DEFAULT 'moderate',
  services_offered    service_type[] NOT NULL DEFAULT '{dine_in}',
  cover_image_url     VARCHAR(500),
  business_permit_url VARCHAR(500),                 -- uploaded verification document
  status              business_status NOT NULL DEFAULT 'pending',
  rejection_reason    TEXT,
  verified_by         UUID REFERENCES users(id),
  verified_at         TIMESTAMPTZ,
  avg_rating          NUMERIC(3,2) NOT NULL DEFAULT 0,
  review_count        INTEGER NOT NULL DEFAULT 0,
  view_count          INTEGER NOT NULL DEFAULT 0,
  is_active           BOOLEAN NOT NULL DEFAULT TRUE, -- owner can temporarily deactivate
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_restaurants_owner ON restaurants(owner_id);
CREATE INDEX idx_restaurants_status ON restaurants(status);
CREATE INDEX idx_restaurants_price_range ON restaurants(price_range);
CREATE INDEX idx_restaurants_location ON restaurants(latitude, longitude);
CREATE INDEX idx_restaurants_name_trgm ON restaurants USING gin (name gin_trgm_ops);

CREATE TABLE restaurant_cuisines (
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  cuisine_id    INTEGER NOT NULL REFERENCES cuisines(id) ON DELETE CASCADE,
  PRIMARY KEY (restaurant_id, cuisine_id)
);
CREATE INDEX idx_restaurant_cuisines_cuisine ON restaurant_cuisines(cuisine_id);

CREATE TABLE restaurant_dietary_options (
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  option        VARCHAR(50) NOT NULL,  -- vegetarian, vegan, halal, gluten_free, etc.
  PRIMARY KEY (restaurant_id, option)
);

CREATE TABLE restaurant_images (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  image_url     VARCHAR(500) NOT NULL,
  is_cover      BOOLEAN NOT NULL DEFAULT FALSE,
  sort_order    INTEGER NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_restaurant_images_restaurant ON restaurant_images(restaurant_id);

-- Operating hours (0=Sunday ... 6=Saturday, supports split shifts) ----------
CREATE TABLE operating_hours (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  day_of_week   SMALLINT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  open_time     TIME NOT NULL,
  close_time    TIME NOT NULL,
  is_closed     BOOLEAN NOT NULL DEFAULT FALSE,
  UNIQUE (restaurant_id, day_of_week, open_time)
);
CREATE INDEX idx_operating_hours_restaurant ON operating_hours(restaurant_id);

-- ============================================================================
-- MENU
-- ============================================================================
CREATE TABLE menu_categories (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  name          VARCHAR(100) NOT NULL,
  sort_order    INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX idx_menu_categories_restaurant ON menu_categories(restaurant_id);

CREATE TABLE menu_items (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  category_id   UUID REFERENCES menu_categories(id) ON DELETE SET NULL,
  name          VARCHAR(150) NOT NULL,
  description   TEXT,
  price         NUMERIC(10,2) NOT NULL CHECK (price >= 0),
  image_url     VARCHAR(500),
  is_available  BOOLEAN NOT NULL DEFAULT TRUE,
  dietary_tags  TEXT[] DEFAULT '{}',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_menu_items_restaurant ON menu_items(restaurant_id);
CREATE INDEX idx_menu_items_category ON menu_items(category_id);

-- ============================================================================
-- REVIEWS & RATINGS
-- ============================================================================
CREATE TABLE reviews (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rating        SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment       TEXT,
  owner_reply    TEXT,
  owner_reply_at TIMESTAMPTZ,
  status        review_status NOT NULL DEFAULT 'visible',
  flagged_reason TEXT,
  moderated_by   UUID REFERENCES users(id),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (restaurant_id, user_id)  -- one review per user per restaurant
);
CREATE INDEX idx_reviews_restaurant ON reviews(restaurant_id);
CREATE INDEX idx_reviews_user ON reviews(user_id);
CREATE INDEX idx_reviews_status ON reviews(status);

-- ============================================================================
-- FAVORITES
-- ============================================================================
CREATE TABLE favorites (
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, restaurant_id)
);

-- ============================================================================
-- PROMOTIONS
-- ============================================================================
CREATE TABLE promotions (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  title         VARCHAR(150) NOT NULL,
  description   TEXT,
  image_url     VARCHAR(500),
  discount_label VARCHAR(50),        -- e.g. "20% OFF", "Buy 1 Take 1"
  start_date    DATE NOT NULL,
  end_date      DATE NOT NULL,
  status        promotion_status NOT NULL DEFAULT 'draft',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (end_date >= start_date)
);
CREATE INDEX idx_promotions_restaurant ON promotions(restaurant_id);
CREATE INDEX idx_promotions_status ON promotions(status);
CREATE INDEX idx_promotions_dates ON promotions(start_date, end_date);

-- ============================================================================
-- RECOMMENDATION / SEARCH LOGS (fuel for AI engine tuning & analytics)
-- ============================================================================
CREATE TABLE recommendation_logs (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID REFERENCES users(id) ON DELETE SET NULL,  -- nullable: guests too
  session_id      VARCHAR(100),
  query_params    JSONB NOT NULL,     -- budget, cuisine, dietary, lat/lng, radius, time
  result_ids      UUID[] NOT NULL,    -- ordered restaurant ids returned
  top_result_id   UUID REFERENCES restaurants(id) ON DELETE SET NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_recommendation_logs_user ON recommendation_logs(user_id);
CREATE INDEX idx_recommendation_logs_created ON recommendation_logs(created_at);
CREATE INDEX idx_recommendation_logs_top_result ON recommendation_logs(top_result_id);

CREATE TABLE restaurant_view_logs (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  user_id       UUID REFERENCES users(id) ON DELETE SET NULL,
  source        VARCHAR(30) DEFAULT 'browse',  -- browse, recommendation, search, map
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_restaurant_view_logs_restaurant ON restaurant_view_logs(restaurant_id);
CREATE INDEX idx_restaurant_view_logs_created ON restaurant_view_logs(created_at);

-- AI scoring weight configuration (admin-tunable "Update AI Model" use case) -
CREATE TABLE recommendation_weights (
  id               SERIAL PRIMARY KEY,
  cuisine_weight   NUMERIC(4,3) NOT NULL DEFAULT 0.30,
  budget_weight    NUMERIC(4,3) NOT NULL DEFAULT 0.25,
  proximity_weight NUMERIC(4,3) NOT NULL DEFAULT 0.20,
  dietary_weight   NUMERIC(4,3) NOT NULL DEFAULT 0.15,
  rating_weight    NUMERIC(4,3) NOT NULL DEFAULT 0.10,
  is_active        BOOLEAN NOT NULL DEFAULT TRUE,
  updated_by       UUID REFERENCES users(id),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- NOTIFICATIONS
-- ============================================================================
CREATE TABLE notifications (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type        notification_type NOT NULL,
  title       VARCHAR(150) NOT NULL,
  body        TEXT,
  is_read     BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_notifications_user ON notifications(user_id, is_read);

-- ============================================================================
-- AUDIT LOG (admin actions: verify/reject business, moderate review, etc.)
-- ============================================================================
CREATE TABLE audit_logs (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  actor_id     UUID REFERENCES users(id) ON DELETE SET NULL,
  action       VARCHAR(100) NOT NULL,       -- e.g. 'business.verify', 'review.remove'
  entity_type  VARCHAR(50) NOT NULL,
  entity_id    UUID,
  metadata     JSONB,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_audit_logs_actor ON audit_logs(actor_id);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);

-- ============================================================================
-- TRIGGERS: keep updated_at fresh + keep restaurant avg_rating/review_count in sync
-- ============================================================================
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_restaurants_updated_at BEFORE UPDATE ON restaurants
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_menu_items_updated_at BEFORE UPDATE ON menu_items
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_reviews_updated_at BEFORE UPDATE ON reviews
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE OR REPLACE FUNCTION recalc_restaurant_rating()
RETURNS TRIGGER AS $$
DECLARE
  target_id UUID;
BEGIN
  target_id := COALESCE(NEW.restaurant_id, OLD.restaurant_id);
  UPDATE restaurants r
  SET avg_rating   = COALESCE((SELECT ROUND(AVG(rating)::numeric, 2) FROM reviews WHERE restaurant_id = target_id AND status = 'visible'), 0),
      review_count = (SELECT COUNT(*) FROM reviews WHERE restaurant_id = target_id AND status = 'visible')
  WHERE r.id = target_id;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_reviews_recalc_ins_upd_del
AFTER INSERT OR UPDATE OR DELETE ON reviews
FOR EACH ROW EXECUTE FUNCTION recalc_restaurant_rating();

