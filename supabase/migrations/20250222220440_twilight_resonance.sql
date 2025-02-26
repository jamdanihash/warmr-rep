/*
  # Update Connections RLS Policies

  1. Changes
    - Drop existing policies
    - Create new policies for connections table with proper security checks
    - Add index for better performance

  2. Security
    - Users can read connections where they are either requester or recipient
    - Users can create connection requests with proper validation
    - Users can update connection status with proper authorization
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can read their connections" ON connections;
DROP POLICY IF EXISTS "Users can manage their own connections" ON connections;

-- Create new, more permissive policies
CREATE POLICY "Users can read their connections"
  ON connections
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = requester_id OR 
    auth.uid() = recipient_id
  );

CREATE POLICY "Users can create connection requests"
  ON connections
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = requester_id AND
    auth.uid() != recipient_id AND
    NOT EXISTS (
      SELECT 1 FROM connections c
      WHERE (
        (c.requester_id = requester_id AND c.recipient_id = recipient_id) OR
        (c.requester_id = recipient_id AND c.recipient_id = requester_id)
      ) AND c.status != 'declined'
    )
  );

CREATE POLICY "Users can update their connection status"
  ON connections
  FOR UPDATE
  TO authenticated
  USING (
    -- Can only update connections where user is the recipient
    auth.uid() = recipient_id AND
    -- Can only update pending connections
    status = 'pending'
  )
  WITH CHECK (
    -- Can only set status to accepted or declined
    status IN ('accepted', 'declined')
  );

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_connections_status ON connections(status);