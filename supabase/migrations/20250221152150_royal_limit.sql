/*
  # Update opportunities delete policy

  1. Changes
    - Safely handle delete policy creation
    - Ensure policy exists for deleting opportunities

  2. Security
    - Users can only delete their own opportunities
    - Maintains existing RLS policies
*/

-- Safely handle the delete policy
DO $$
BEGIN
  -- Drop the policy if it exists
  DROP POLICY IF EXISTS "Users can delete their own opportunities" ON opportunities;
  
  -- Create the policy
  CREATE POLICY "Users can delete their own opportunities"
    ON opportunities
    FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);
END
$$;