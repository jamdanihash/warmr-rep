-- Create notification categories enum if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'notification_category') THEN
    CREATE TYPE notification_category AS ENUM (
      'message',
      'connection',
      'opportunity',
      'system',
      'alert'
    );
  END IF;
END $$;

-- Create notification priority enum if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'notification_priority') THEN
    CREATE TYPE notification_priority AS ENUM (
      'low',
      'medium',
      'high',
      'urgent'
    );
  END IF;
END $$;

-- Drop existing notifications table and related objects if they exist
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS notification_preferences CASCADE;

-- Create notifications table
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

-- Create notification preferences table
CREATE TABLE notification_preferences (
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email_enabled boolean DEFAULT true,
  push_enabled boolean DEFAULT true,
  categories notification_category[] DEFAULT ARRAY['message'::notification_category, 'connection'::notification_category, 'opportunity'::notification_category, 'system'::notification_category, 'alert'::notification_category],
  quiet_hours_start time,
  quiet_hours_end time,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

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

CREATE POLICY "Users can manage their notification preferences"
  ON notification_preferences
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create indexes
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_category ON notifications(category);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX idx_notifications_read ON notifications(read);
CREATE INDEX idx_notifications_group_id ON notifications(group_id);
CREATE INDEX idx_notifications_expires_at ON notifications(expires_at);

-- Create function to clean up expired notifications
CREATE OR REPLACE FUNCTION cleanup_expired_notifications()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM notifications
  WHERE expires_at < now()
  OR created_at < now() - INTERVAL '30 days';
END;
$$;

-- Create function to update notification preferences updated_at
CREATE OR REPLACE FUNCTION update_notification_preferences_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for notification preferences
CREATE TRIGGER update_notification_preferences_timestamp
  BEFORE UPDATE ON notification_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_notification_preferences_timestamp();

-- Create function to handle notification grouping
CREATE OR REPLACE FUNCTION group_similar_notifications()
RETURNS TRIGGER AS $$
BEGIN
  -- If a similar notification exists within 1 hour, group them
  WITH similar_notification AS (
    SELECT id
    FROM notifications
    WHERE user_id = NEW.user_id
    AND category = NEW.category
    AND created_at > now() - INTERVAL '1 hour'
    AND group_id IS NULL
    LIMIT 1
  )
  UPDATE notifications
  SET group_id = (SELECT id FROM similar_notification)
  WHERE id = NEW.id
  AND EXISTS (SELECT 1 FROM similar_notification);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for notification grouping
CREATE TRIGGER group_similar_notifications
  AFTER INSERT ON notifications
  FOR EACH ROW
  EXECUTE FUNCTION group_similar_notifications();