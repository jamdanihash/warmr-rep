/*
  # Add Sample Notifications

  1. New Tables
    - None (using existing notifications table)
  
  2. Changes
    - Add sample notifications for testing
    - Add trigger for notification cleanup
  
  3. Security
    - No changes to existing RLS policies
*/

-- Insert sample notifications
DO $$
DECLARE
  user_id uuid;
BEGIN
  -- Get a sample user ID
  SELECT id INTO user_id FROM auth.users LIMIT 1;

  IF user_id IS NOT NULL THEN
    -- Insert sample notifications
    INSERT INTO notifications (
      user_id,
      title,
      message,
      type,
      read,
      action_url,
      created_at
    ) VALUES
      (
        user_id,
        'New Connection Request',
        'TechCorp Solutions wants to connect with you',
        'connection',
        false,
        '/connections',
        NOW() - INTERVAL '30 minutes'
      ),
      (
        user_id,
        'New Message',
        'You have a new message from HealthPlus Systems',
        'message',
        false,
        '/messages',
        NOW() - INTERVAL '1 hour'
      ),
      (
        user_id,
        'Opportunity Match',
        'New opportunity matching your criteria: "Software Development Services"',
        'opportunity',
        true,
        '/opportunities',
        NOW() - INTERVAL '2 hours'
      ),
      (
        user_id,
        'Connection Accepted',
        'Global Finance Group accepted your connection request',
        'connection',
        true,
        '/connections',
        NOW() - INTERVAL '3 hours'
      ),
      (
        user_id,
        'Profile View',
        'Your profile was viewed by Industrial Manufacturing Co',
        'system',
        true,
        '/profile',
        NOW() - INTERVAL '4 hours'
      );
  END IF;
END $$;