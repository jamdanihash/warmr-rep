/*
  # Fix Request Tracking Policy

  1. Changes
    - Add RLS policy for request_tracking table to allow users to manage their own tracking data
    - Add policy for inserting new tracking records
    - Add policy for updating existing tracking records

  2. Security
    - Enable RLS on request_tracking table
    - Ensure users can only access their own tracking data
*/

-- Enable RLS on request_tracking if not already enabled
ALTER TABLE request_tracking ENABLE ROW LEVEL SECURITY;

-- Create policies for request_tracking table
CREATE POLICY "Users can manage their own request tracking"
  ON request_tracking
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_request_tracking_user_type
  ON request_tracking(user_id, request_type);

-- Create function to handle request tracking
CREATE OR REPLACE FUNCTION handle_request_tracking()
RETURNS TRIGGER AS $$
BEGIN
  -- Update or insert tracking record
  INSERT INTO request_tracking (user_id, request_type, request_count, window_start)
  VALUES (
    auth.uid(),
    TG_ARGV[0],
    1,
    NOW()
  )
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

  -- Check rate limit (100 requests per hour)
  IF (
    SELECT request_count
    FROM request_tracking
    WHERE user_id = auth.uid()
    AND request_type = TG_ARGV[0]
    AND window_start > NOW() - INTERVAL '1 hour'
  ) > 100 THEN
    RAISE EXCEPTION 'Rate limit exceeded';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;