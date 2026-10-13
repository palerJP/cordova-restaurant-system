ALTER TABLE restaurant_images ADD COLUMN IF NOT EXISTS uploaded_by UUID REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE restaurant_images ADD COLUMN IF NOT EXISTS caption VARCHAR(280) NOT NULL DEFAULT '';
CREATE INDEX IF NOT EXISTS restaurant_images_uploaded_by_idx ON restaurant_images(uploaded_by);
