-- Supabase Database Schema for DM Brands Website

-- Create brands table
CREATE TABLE IF NOT EXISTS brands (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  logo_url TEXT,
  banner_url TEXT,
  website TEXT,
  color VARCHAR(7),
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create events table
CREATE TABLE IF NOT EXISTS events (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  cover_image TEXT,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  stand_number VARCHAR(255) NOT NULL,
  location VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create event_brands junction table (many-to-many relationship)
CREATE TABLE IF NOT EXISTS event_brands (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(event_id, brand_id)
);

-- Create catalogues table
CREATE TABLE IF NOT EXISTS catalogues (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  year VARCHAR(20) NOT NULL,
  season VARCHAR(50),
  pdf_url TEXT,
  file_path TEXT,
  color VARCHAR(7),
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_brands_order ON brands(order_index);
CREATE INDEX idx_catalogues_brand ON catalogues(brand_id);
CREATE INDEX idx_catalogues_order ON catalogues(order_index);
CREATE INDEX idx_event_brands_event ON event_brands(event_id);
CREATE INDEX idx_event_brands_brand ON event_brands(brand_id);
CREATE INDEX idx_events_date ON events(date);

-- Enable Row Level Security
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE catalogues ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Public brands are viewable by everyone" ON brands
  FOR SELECT USING (true);

CREATE POLICY "Public events are viewable by everyone" ON events
  FOR SELECT USING (true);

CREATE POLICY "Public event_brands are viewable by everyone" ON event_brands
  FOR SELECT USING (true);

CREATE POLICY "Public catalogues are viewable by everyone" ON catalogues
  FOR SELECT USING (true);

-- Create update trigger function
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_brands_updated_at BEFORE UPDATE ON brands
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_catalogues_updated_at BEFORE UPDATE ON catalogues
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Storage bucket for PDFs
-- Run this in the Supabase Storage section:
-- Create a new public bucket called 'catalogues' for storing PDF files