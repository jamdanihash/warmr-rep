-- Create settings for existing users
INSERT INTO settings (user_id)
SELECT id FROM auth.users
WHERE NOT EXISTS (
  SELECT 1 FROM settings WHERE user_id = auth.users.id
)
ON CONFLICT (user_id) DO NOTHING;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_settings_user_id ON settings(user_id);
CREATE INDEX IF NOT EXISTS idx_settings_updated_at ON settings(updated_at DESC);