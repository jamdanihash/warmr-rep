-- Drop existing notifications table and related objects
DROP TABLE IF EXISTS notifications CASCADE;

-- Create notifications table with correct column names
CREATE TABLE notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  category notification_category NOT NULL,
  priority notification_priority DEFAULT 'medium',
  title text NOT NULL,
  message text NOT NULL,
  metadata jsonb DEFAULT '{}',
  action_url text,
  action_text text,
  icon text,
  read boolean DEFAULT false,
  archived boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz,
  group_id uuid,
  parent_id uuid REFERENCES notifications(id)
);

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read their own notifications"
  ON notifications
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
  ON notifications
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Anyone can create notifications"
  ON notifications
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create indexes
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_category ON notifications(category);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX idx_notifications_read ON notifications(read);
CREATE INDEX idx_notifications_archived ON notifications(archived);
CREATE INDEX idx_notifications_group_id ON notifications(group_id);
CREATE INDEX idx_notifications_expires_at ON notifications(expires_at);

-- Update message notification function to use correct column name
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
      category,
      priority,
      title,
      message,
      metadata,
      action_url
    )
    VALUES (
      NEW.recipient_id,
      'message',
      'medium',
      'New Message',
      'You have received a new message',
      jsonb_build_object('message_id', NEW.id),
      '/messages'
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;