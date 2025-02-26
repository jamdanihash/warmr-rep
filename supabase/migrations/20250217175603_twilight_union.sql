/*
  # Messaging System Schema

  1. New Tables
    - `connections`
      - Manages user connections and connection requests
      - Includes request message, status, and timestamps
    - `messages`
      - Stores all messages between connected users
      - Includes message content, read status, and thread information
    - `message_attachments`
      - Stores metadata for message attachments
    - `user_settings`
      - Stores user notification preferences and settings
    - `blocked_users`
      - Tracks blocked user relationships
    - `reported_content`
      - Stores user reports for messages or users

  2. Security
    - Enable RLS on all tables
    - Add policies for secure access control
    - Implement rate limiting through request tracking
*/

-- Create connections table
CREATE TABLE connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  status text NOT NULL CHECK (status IN ('pending', 'accepted', 'declined')),
  request_message text CHECK (length(request_message) <= 300),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(requester_id, recipient_id)
);

-- Create messages table
CREATE TABLE messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id uuid DEFAULT gen_random_uuid(),
  sender_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  content text NOT NULL,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  reply_to_id uuid REFERENCES messages(id)
);

-- Create message attachments table
CREATE TABLE message_attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id uuid REFERENCES messages(id) ON DELETE CASCADE,
  file_name text NOT NULL,
  file_type text NOT NULL,
  file_size integer NOT NULL,
  file_path text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create user settings table
CREATE TABLE user_settings (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email_notifications boolean DEFAULT true,
  in_app_notifications boolean DEFAULT true,
  sound_enabled boolean DEFAULT true,
  show_read_receipts boolean DEFAULT true,
  updated_at timestamptz DEFAULT now()
);

-- Create blocked users table
CREATE TABLE blocked_users (
  blocker_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  blocked_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  reason text,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (blocker_id, blocked_id)
);

-- Create reported content table
CREATE TABLE reported_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  reported_user_id uuid REFERENCES auth.users(id),
  message_id uuid REFERENCES messages(id),
  reason text NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create request tracking table for rate limiting
CREATE TABLE request_tracking (
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  request_type text NOT NULL,
  request_count integer DEFAULT 1,
  window_start timestamptz DEFAULT now(),
  PRIMARY KEY (user_id, request_type)
);

-- Enable RLS
ALTER TABLE connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocked_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE reported_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE request_tracking ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can manage their own connections"
  ON connections
  TO authenticated
  USING (
    auth.uid() = requester_id OR 
    auth.uid() = recipient_id
  )
  WITH CHECK (
    auth.uid() = requester_id
  );

CREATE POLICY "Users can read and send messages to connections"
  ON messages
  TO authenticated
  USING (
    auth.uid() IN (sender_id, recipient_id) AND
    NOT EXISTS (
      SELECT 1 FROM blocked_users
      WHERE (blocker_id = recipient_id AND blocked_id = sender_id) OR
            (blocker_id = sender_id AND blocked_id = recipient_id)
    )
  )
  WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM connections
      WHERE status = 'accepted' AND
            ((requester_id = sender_id AND recipient_id = messages.recipient_id) OR
             (requester_id = messages.recipient_id AND recipient_id = sender_id))
    )
  );

CREATE POLICY "Users can manage their settings"
  ON user_settings
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their blocks"
  ON blocked_users
  TO authenticated
  USING (auth.uid() = blocker_id)
  WITH CHECK (auth.uid() = blocker_id);

CREATE POLICY "Users can report content"
  ON reported_content
  TO authenticated
  USING (auth.uid() = reporter_id)
  WITH CHECK (auth.uid() = reporter_id);

-- Create functions for messaging system
CREATE OR REPLACE FUNCTION check_connection_limit()
RETURNS TRIGGER AS $$
BEGIN
  IF (
    SELECT COUNT(*)
    FROM connections
    WHERE requester_id = NEW.requester_id
    AND status = 'pending'
  ) >= 30 THEN
    RAISE EXCEPTION 'Maximum pending connection requests (30) reached';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_request_tracking()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO request_tracking (user_id, request_type)
  VALUES (NEW.sender_id, 'message')
  ON CONFLICT (user_id, request_type)
  DO UPDATE SET
    request_count = CASE
      WHEN request_tracking.window_start < NOW() - INTERVAL '1 hour'
      THEN 1
      ELSE request_tracking.request_count + 1
    END,
    window_start = CASE
      WHEN request_tracking.window_start < NOW() - INTERVAL '1 hour'
      THEN NOW()
      ELSE request_tracking.window_start
    END;

  -- Check rate limit (100 messages per hour)
  IF (
    SELECT request_count
    FROM request_tracking
    WHERE user_id = NEW.sender_id
    AND request_type = 'message'
    AND window_start > NOW() - INTERVAL '1 hour'
  ) > 100 THEN
    RAISE EXCEPTION 'Rate limit exceeded';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER check_connection_limit_trigger
  BEFORE INSERT ON connections
  FOR EACH ROW
  EXECUTE FUNCTION check_connection_limit();

CREATE TRIGGER update_request_tracking_trigger
  BEFORE INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_request_tracking();

-- Create indexes for performance
CREATE INDEX idx_connections_users ON connections(requester_id, recipient_id);
CREATE INDEX idx_messages_users ON messages(sender_id, recipient_id);
CREATE INDEX idx_messages_thread ON messages(thread_id);
CREATE INDEX idx_messages_timestamp ON messages(created_at DESC);
CREATE INDEX idx_blocked_users ON blocked_users(blocker_id, blocked_id);