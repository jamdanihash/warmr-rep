-- Drop existing message policies
DROP POLICY IF EXISTS "Users can read messages they're involved in" ON messages;
DROP POLICY IF EXISTS "Users can send messages to their connections" ON messages;
DROP POLICY IF EXISTS "Users can update their own messages" ON messages;
DROP POLICY IF EXISTS "Users can delete their own messages" ON messages;

-- Create updated policies with proper checks
CREATE POLICY "Users can read messages they're involved in"
  ON messages
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() IN (sender_id, recipient_id) AND
    NOT EXISTS (
      SELECT 1 FROM blocked_users
      WHERE (blocker_id = auth.uid() AND blocked_id = CASE 
          WHEN auth.uid() = sender_id THEN recipient_id
          ELSE sender_id
        END) OR
        (blocker_id = CASE 
          WHEN auth.uid() = sender_id THEN recipient_id
          ELSE sender_id
        END AND blocked_id = auth.uid())
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
  WITH CHECK (
    auth.uid() = sender_id AND
    NOT EXISTS (
      SELECT 1 FROM blocked_users
      WHERE (blocker_id = recipient_id AND blocked_id = sender_id) OR
            (blocker_id = sender_id AND blocked_id = recipient_id)
    )
  );

CREATE POLICY "Users can delete their own messages"
  ON messages
  FOR DELETE
  TO authenticated
  USING (auth.uid() = sender_id);

-- Create function to handle message notifications
CREATE OR REPLACE FUNCTION handle_message_notification()
RETURNS TRIGGER AS $$
BEGIN
  -- Only create notification if users aren't blocked
  IF NOT EXISTS (
    SELECT 1 FROM blocked_users
    WHERE (blocker_id = NEW.recipient_id AND blocked_id = NEW.sender_id) OR
          (blocker_id = NEW.sender_id AND blocked_id = NEW.recipient_id)
  ) THEN
    INSERT INTO notifications (
      user_id,
      type,
      title,
      message,
      related_id,
      action_url
    )
    VALUES (
      NEW.recipient_id,
      'message',
      'New Message',
      'You have received a new message',
      NEW.id::text,
      '/messages'
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for message notifications
DROP TRIGGER IF EXISTS on_message_sent ON messages;
CREATE TRIGGER on_message_sent
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION handle_message_notification();