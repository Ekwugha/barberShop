-- Add database constraint to prevent overlapping bookings
-- This provides an additional layer of protection at the database level

-- Create a function to check for overlapping bookings
CREATE OR REPLACE FUNCTION check_booking_overlap()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if there's an overlapping booking for the same barber on the same date
  IF EXISTS (
    SELECT 1 FROM bookings
    WHERE barber_id = NEW.barber_id
      AND date = NEW.date
      AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)
      AND status IN ('pending', 'confirmed')
      AND (
        -- New booking starts during existing booking
        (NEW.start_time >= start_time AND NEW.start_time < end_time) OR
        -- New booking ends during existing booking
        (NEW.end_time > start_time AND NEW.end_time <= end_time) OR
        -- New booking completely contains existing booking
        (NEW.start_time <= start_time AND NEW.end_time >= end_time) OR
        -- New booking is completely contained by existing booking
        (NEW.start_time > start_time AND NEW.end_time < end_time)
      )
  ) THEN
    RAISE EXCEPTION 'Booking time slot is already taken. Please select another time.';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to check before insert or update
DROP TRIGGER IF EXISTS prevent_overlapping_bookings ON bookings;
CREATE TRIGGER prevent_overlapping_bookings
  BEFORE INSERT OR UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION check_booking_overlap();

