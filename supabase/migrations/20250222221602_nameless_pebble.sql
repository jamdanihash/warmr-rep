-- Drop existing policies first
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Anyone can read opportunities" ON opportunities;
  DROP POLICY IF EXISTS "Public can read opportunities" ON opportunities;
  DROP POLICY IF EXISTS "Authenticated users can create opportunities" ON opportunities;
  DROP POLICY IF EXISTS "Users can update their own opportunities" ON opportunities;
  DROP POLICY IF EXISTS "Users can delete their own opportunities" ON opportunities;
END $$;

-- Create new policies
CREATE POLICY "Public can read opportunities"
  ON opportunities
  FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create opportunities"
  ON opportunities
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own opportunities"
  ON opportunities
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own opportunities"
  ON opportunities
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);