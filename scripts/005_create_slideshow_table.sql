-- Create slideshow table to track products shown in the hero slideshow
CREATE TABLE IF NOT EXISTS slideshow (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  position INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable row level security and public read for slideshow
ALTER TABLE slideshow ENABLE ROW LEVEL SECURITY;
CREATE POLICY "slideshow_public_read" ON slideshow FOR SELECT USING (true);

CREATE INDEX IF NOT EXISTS idx_slideshow_product_id ON slideshow(product_id);
