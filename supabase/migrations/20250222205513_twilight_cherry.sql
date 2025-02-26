/*
  # Add Foreign Key Relationships for Connections

  1. Changes
    - Add foreign key relationships between connections and profiles tables
    - Add indexes for better query performance
    - Update RLS policies to ensure proper access control

  2. Security
    - Maintain existing RLS policies
    - Add new policies for proper access control
*/

-- Drop existing foreign key constraints if they exist
ALTER TABLE IF EXISTS connections
  DROP CONSTRAINT IF EXISTS connections_requester_id_fkey,
  DROP CONSTRAINT IF EXISTS connections_recipient_id_fkey;

-- Add foreign key constraints
ALTER TABLE connections
  ADD CONSTRAINT connections_requester_id_fkey
    FOREIGN KEY (requester_id)
    REFERENCES profiles(id)
    ON DELETE CASCADE,
  ADD CONSTRAINT connections_recipient_id_fkey
    FOREIGN KEY (recipient_id)
    REFERENCES profiles(id)
    ON DELETE CASCADE;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_connections_requester_id ON connections(requester_id);
CREATE INDEX IF NOT EXISTS idx_connections_recipient_id ON connections(recipient_id);
CREATE INDEX IF NOT EXISTS idx_connections_status ON connections(status);
CREATE INDEX IF NOT EXISTS idx_connections_created_at ON connections(created_at DESC);

-- Update RLS policies
ALTER TABLE connections ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own connections" ON connections;
DROP POLICY IF EXISTS "Users can read their connections" ON connections;

CREATE POLICY "Users can read their connections"
  ON connections
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = requester_id OR 
    auth.uid() = recipient_id
  );

CREATE POLICY "Users can manage their own connections"
  ON connections
  FOR ALL
  TO authenticated
  USING (
    auth.uid() = requester_id OR 
    auth.uid() = recipient_id
  )
  WITH CHECK (
    auth.uid() = requester_id
  );