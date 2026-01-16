-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Barber Profile Table
CREATE TABLE IF NOT EXISTS barber_profile (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  bio TEXT,
  experience_years INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Clients Table
CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  photo_url TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Services Table
CREATE TABLE IF NOT EXISTS services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  duration INTEGER NOT NULL DEFAULT 30, -- in minutes
  price DECIMAL(10, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Availability Table
CREATE TABLE IF NOT EXISTS availability (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  barber_id UUID NOT NULL REFERENCES barber_profile(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0 = Sunday, 6 = Saturday
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  slot_duration INTEGER NOT NULL DEFAULT 30, -- in minutes
  buffer_time INTEGER NOT NULL DEFAULT 0, -- in minutes
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(barber_id, day_of_week)
);

-- Bookings Table
CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  barber_id UUID NOT NULL REFERENCES barber_profile(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings(date);
CREATE INDEX IF NOT EXISTS idx_bookings_barber_date ON bookings(barber_id, date);
CREATE INDEX IF NOT EXISTS idx_bookings_client ON bookings(client_id);
CREATE INDEX IF NOT EXISTS idx_availability_barber ON availability(barber_id);
CREATE INDEX IF NOT EXISTS idx_clients_user_id ON clients(user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_barber_profile_updated_at BEFORE UPDATE ON barber_profile
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_availability_updated_at BEFORE UPDATE ON availability
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies

-- Enable RLS
ALTER TABLE barber_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;

-- Barber Profile Policies
CREATE POLICY "Barber profiles are viewable by everyone"
  ON barber_profile FOR SELECT
  USING (true);

CREATE POLICY "Users can update their own barber profile"
  ON barber_profile FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own barber profile"
  ON barber_profile FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Clients Policies
CREATE POLICY "Clients are viewable by barbers and themselves"
  ON clients FOR SELECT
  USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM barber_profile
      WHERE barber_profile.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own client profile"
  ON clients FOR INSERT
  WITH CHECK (auth.uid() = user_id OR auth.uid() IS NULL);

CREATE POLICY "Users can update their own client profile"
  ON clients FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Barbers can update any client"
  ON clients FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM barber_profile
      WHERE barber_profile.user_id = auth.uid()
    )
  );

-- Bookings Policies
CREATE POLICY "Bookings are viewable by barbers and clients"
  ON bookings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM clients
      WHERE clients.id = bookings.client_id
      AND (clients.user_id = auth.uid() OR auth.uid() IS NULL)
    ) OR
    EXISTS (
      SELECT 1 FROM barber_profile
      WHERE barber_profile.id = bookings.barber_id
      AND barber_profile.user_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can create bookings"
  ON bookings FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Barbers can update bookings"
  ON bookings FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM barber_profile
      WHERE barber_profile.id = bookings.barber_id
      AND barber_profile.user_id = auth.uid()
    )
  );

-- Availability Policies
CREATE POLICY "Availability is viewable by everyone"
  ON availability FOR SELECT
  USING (true);

CREATE POLICY "Barbers can manage their own availability"
  ON availability FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM barber_profile
      WHERE barber_profile.id = availability.barber_id
      AND barber_profile.user_id = auth.uid()
    )
  );

-- Services Policies
CREATE POLICY "Services are viewable by everyone"
  ON services FOR SELECT
  USING (true);

-- Storage Policies (for Supabase Storage)
-- Note: These need to be set up in Supabase Dashboard under Storage > Policies
-- 
-- Recommended bucket settings:
-- 1. haircut-gallery (public bucket):
--    - File size limit: 5MB (5,242,880 bytes)
--    - Allowed MIME types: image/jpeg, image/png, image/webp, image/gif
--    - Public access: Enabled
--
-- 2. client-photos (private bucket):
--    - File size limit: 5MB (5,242,880 bytes)
--    - Allowed MIME types: image/jpeg, image/png, image/webp
--    - Public access: Disabled
--
-- To set file size limits:
-- 1. Go to Storage > haircut-gallery > Settings
-- 2. Set "File size limit" to 5242880 (5MB)
-- 3. Repeat for client-photos bucket

-- Insert some default services
INSERT INTO services (name, description, duration, price) VALUES
  ('Haircut', 'Classic haircut with styling', 30, NULL),
  ('Haircut & Beard', 'Full haircut and beard trim', 45, NULL),
  ('Premium Cut', 'Premium haircut with wash and styling', 60, NULL)
ON CONFLICT DO NOTHING;

