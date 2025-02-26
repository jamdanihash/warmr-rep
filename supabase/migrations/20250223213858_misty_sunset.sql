-- Create function to handle unblocking
CREATE OR REPLACE FUNCTION handle_unblock()
RETURNS TRIGGER AS $$
BEGIN
  -- When a block is removed, we don't automatically restore connections
  -- Users will need to reconnect if they want to
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for unblocking
CREATE TRIGGER handle_unblock_trigger
  AFTER DELETE ON blocked_users
  FOR EACH ROW
  EXECUTE FUNCTION handle_unblock();

-- Update connections policy to exclude blocked users
DROP POLICY IF EXISTS "Users can manage their own connections" ON connections;
CREATE POLICY "Users can manage their own connections"
  ON connections
  FOR ALL
  TO authenticated
  USING (
    (auth.uid() = requester_id OR auth.uid() = recipient_id) AND
    NOT EXISTS (
      SELECT 1 FROM blocked_users
      WHERE (blocker_id = requester_id AND blocked_id = recipient_id) OR
            (blocker_id = recipient_id AND blocked_id = requester_id)
    )
  )
  WITH CHECK (
    auth.uid() = requester_id AND
    NOT EXISTS (
      SELECT 1 FROM blocked_users
      WHERE (blocker_id = requester_id AND blocked_id = recipient_id) OR
            (blocker_id = recipient_id AND blocked_id = requester_id)
    )
  );

-- Create function to get blocked users with profiles
CREATE OR REPLACE FUNCTION get_blocked_users_with_profiles(user_id uuid)
RETURNS TABLE (
  id uuid,
  company_name text,
  industry text,
  location text,
  blocked_at timestamptz,
  reason text
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.company_name,
    p.industry,
    p.location,
    b.created_at as blocked_at,
    b.reason
  FROM blocked_users b
  JOIN profiles p ON p.id = b.blocked_id
  WHERE b.blocker_id = user_id
  ORDER BY b.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;