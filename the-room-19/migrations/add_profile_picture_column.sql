-- Create a function that adds the profile_picture column to the staffs table
CREATE OR REPLACE FUNCTION add_profile_picture_column()
RETURNS void AS $$
BEGIN
  -- Check if the column already exists
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'staffs' AND column_name = 'profile_picture'
  ) THEN
    -- Add the profile_picture column to the staffs table
    ALTER TABLE staffs ADD COLUMN profile_picture TEXT;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 