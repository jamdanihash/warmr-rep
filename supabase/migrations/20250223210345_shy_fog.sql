-- Create settings table if it doesn't exist
DO $$ 
BEGIN
  CREATE TABLE IF NOT EXISTS settings (
    user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    theme text NOT NULL DEFAULT 'light' CHECK (theme IN ('light', 'dark', 'system')),
    language text NOT NULL DEFAULT 'en' CHECK (language IN ('en', 'es', 'fr', 'de', 'ja', 'zh')),
    timezone text NOT NULL DEFAULT 'UTC',
    date_format text NOT NULL DEFAULT 'MM/DD/YYYY' CHECK (date_format IN ('MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD')),
    time_format text NOT NULL DEFAULT '12h' CHECK (time_format IN ('12h', '24h')),
    currency text NOT NULL DEFAULT 'USD' CHECK (currency IN ('USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'CNY', 'INR', 'SGD')),
    email_notifications jsonb NOT NULL DEFAULT '{
      "messages": true,
      "connections": true,
      "opportunities": true,
      "system": true,
      "marketing": false
    }',
    push_notifications jsonb NOT NULL DEFAULT '{
      "messages": true,
      "connections": true,
      "opportunities": true,
      "system": true
    }',
    privacy jsonb NOT NULL DEFAULT '{
      "profile_visibility": "public",
      "show_email": true,
      "show_phone": true,
      "allow_messages": true
    }',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
  );
EXCEPTION
  WHEN duplicate_table THEN NULL;
END $$;

-- Enable RLS
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own settings" ON settings;
DROP POLICY IF EXISTS "Users can update their own settings" ON settings;
DROP POLICY IF EXISTS "Users can insert their own settings" ON settings;

-- Create policies
CREATE POLICY "Users can view their own settings"
  ON settings
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings"
  ON settings
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can insert their own settings"
  ON settings
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create or replace function to handle settings creation on user signup
CREATE OR REPLACE FUNCTION handle_new_user_settings()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO settings (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Safely create trigger (drop if exists first)
DROP TRIGGER IF EXISTS on_auth_user_created_settings ON auth.users;
CREATE TRIGGER on_auth_user_created_settings
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user_settings();

-- Create or replace function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_settings_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Safely create trigger (drop if exists first)
DROP TRIGGER IF EXISTS update_settings_updated_at ON settings;
CREATE TRIGGER update_settings_updated_at
  BEFORE UPDATE ON settings
  FOR EACH ROW
  EXECUTE FUNCTION update_settings_updated_at_column();