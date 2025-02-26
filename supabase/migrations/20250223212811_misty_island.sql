-- Drop existing messages policy
DROP POLICY IF EXISTS "Users can read and send messages to connections" ON messages;

-- Create more granular policies for messages
CREATE POLICY "Users can read messages they're involved in"
  ON messages
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() IN (sender_id, recipient_id) AND
    NOT EXISTS (
      SELECT 1 FROM blocked_users
      WHERE (blocker_id = recipient_id AND blocked_id = sender_id) OR
            (blocker_id = sender_id AND blocked_id = recipient_id)
    )
  );

CREATE POLICY "Users can send messages to their connections"
  ON messages
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = sender_id AND
    NOT EXISTS (
      SELECT 1 FROM blocked_users
      WHERE (blocker_id = recipient_id AND blocked_id = sender_id) OR
            (blocker_id = sender_id AND blocked_id = recipient_id)
    ) AND
    EXISTS (
      SELECT 1 FROM connections
      WHERE status = 'accepted' AND
            ((requester_id = sender_id AND recipient_id = messages.recipient_id) OR
             (requester_id = messages.recipient_id AND recipient_id = sender_id))
    )
  );

CREATE POLICY "Users can update their own messages"
  ON messages
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = sender_id)
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can delete their own messages"
  ON messages
  FOR DELETE
  TO authenticated
  USING (auth.uid() = sender_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_messages_sender_recipient ON messages(sender_id, recipient_id);
CREATE INDEX IF NOT EXISTS idx_messages_thread_id ON messages(thread_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);