-- Safely add archived column if it doesn't exist
DO $$ 
BEGIN
  -- Add archived column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'notifications' 
    AND column_name = 'archived'
  ) THEN
    ALTER TABLE notifications
      ADD COLUMN archived boolean DEFAULT false;

    -- Create index for archived column
    CREATE INDEX idx_notifications_archived ON notifications(archived);

    -- Update existing notifications to have archived = false
    UPDATE notifications SET archived = false WHERE archived IS NULL;

    -- Make archived column NOT NULL after setting default values
    ALTER TABLE notifications
      ALTER COLUMN archived SET NOT NULL;
  END IF;
END $$;

-- Recreate policies to ensure they work with archived column
DO $$ 
BEGIN
  -- Drop existing policies
  DROP POLICY IF EXISTS "Users can read their own notifications" ON notifications;
  DROP POLICY IF EXISTS "Users can update their own notifications" ON notifications;
  DROP POLICY IF EXISTS "Anyone can create notifications" ON notifications;
  
  -- Create new policies
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
END $$;