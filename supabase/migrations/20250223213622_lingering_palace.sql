-- Drop existing blocked_users table and related objects
DROP TABLE IF EXISTS blocked_users CASCADE;

-- Create blocked_users table with proper structure and relationships
CREATE TABLE blocked_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  blocker_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  blocked_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reason text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(blocker_id, blocked_id)
);

-- Enable RLS
ALTER TABLE blocked_users ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their blocks"
  ON blocked_users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = blocker_id);

CREATE POLICY "Users can manage their blocks"
  ON blocked_users
  FOR ALL
  TO authenticated
  USING (auth.uid() = blocker_id)
  WITH CHECK (auth.uid() = blocker_id);

-- Create indexes for better performance
CREATE INDEX idx_blocked_users_blocker ON blocked_users(blocker_id);
CREATE INDEX idx_blocked_users_blocked ON blocked_users(blocked_id);
CREATE INDEX idx_blocked_users_created_at ON blocked_users(created_at DESC);

-- Create function to handle connection cleanup when blocking
CREATE OR REPLACE FUNCTION handle_block_connection_cleanup()
RETURNS TRIGGER AS $$
BEGIN
  -- Delete any existing connections between the users
  DELETE FROM connections
  WHERE (requester_id = NEW.blocker_id AND recipient_id = NEW.blocked_id)
     OR (requester_id = NEW.blocked_id AND recipient_id = NEW.blocker_id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for connection cleanup
CREATE TRIGGER cleanup_connections_on_block
  AFTER INSERT ON blocked_users
  FOR EACH ROW
  EXECUTE FUNCTION handle_block_connection_cleanup();