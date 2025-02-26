-- Create support tickets table
CREATE TABLE support_tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name text,
  email text NOT NULL,
  subject text NOT NULL,
  message text NOT NULL,
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in-progress', 'resolved', 'closed')),
  priority text NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  source text NOT NULL DEFAULT 'email' CHECK (source IN ('email', 'chat', 'phone', 'other')),
  assigned_to uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  resolved_at timestamptz
);

-- Create support calls table
CREATE TABLE support_calls (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name text,
  email text NOT NULL,
  scheduled_date date NOT NULL,
  scheduled_time time NOT NULL,
  topic text NOT NULL,
  status text NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled', 'no-show')),
  meeting_link text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_calls ENABLE ROW LEVEL SECURITY;

-- Create policies for support tickets
CREATE POLICY "Users can view their own tickets"
  ON support_tickets
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create tickets"
  ON support_tickets
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tickets"
  ON support_tickets
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create policies for support calls
CREATE POLICY "Users can view their own calls"
  ON support_calls
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can schedule calls"
  ON support_calls
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own calls"
  ON support_calls
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_support_tickets_user_id ON support_tickets(user_id);
CREATE INDEX idx_support_tickets_status ON support_tickets(status);
CREATE INDEX idx_support_tickets_created_at ON support_tickets(created_at DESC);
CREATE INDEX idx_support_tickets_priority ON support_tickets(priority);

CREATE INDEX idx_support_calls_user_id ON support_calls(user_id);
CREATE INDEX idx_support_calls_status ON support_calls(status);
CREATE INDEX idx_support_calls_scheduled_date ON support_calls(scheduled_date);
CREATE INDEX idx_support_calls_created_at ON support_calls(created_at DESC);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updating updated_at
CREATE TRIGGER update_support_tickets_updated_at
  BEFORE UPDATE ON support_tickets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_support_calls_updated_at
  BEFORE UPDATE ON support_calls
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create function to validate call scheduling
CREATE OR REPLACE FUNCTION validate_call_scheduling()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if date is in the future
  IF NEW.scheduled_date < CURRENT_DATE THEN
    RAISE EXCEPTION 'Cannot schedule calls in the past';
  END IF;

  -- Check if date is within 30 days
  IF NEW.scheduled_date > CURRENT_DATE + INTERVAL '30 days' THEN
    RAISE EXCEPTION 'Cannot schedule calls more than 30 days in advance';
  END IF;

  -- Check if time is within business hours (9 AM - 5 PM EST)
  IF NEW.scheduled_time < '09:00:00' OR NEW.scheduled_time > '17:00:00' THEN
    RAISE EXCEPTION 'Calls can only be scheduled between 9 AM and 5 PM EST';
  END IF;

  -- Check if time is on 30-minute intervals
  IF EXTRACT(MINUTE FROM NEW.scheduled_time) NOT IN (0, 30) THEN
    RAISE EXCEPTION 'Calls must be scheduled on the hour or half hour';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for call scheduling validation
CREATE TRIGGER validate_call_scheduling
  BEFORE INSERT OR UPDATE ON support_calls
  FOR EACH ROW
  EXECUTE FUNCTION validate_call_scheduling();