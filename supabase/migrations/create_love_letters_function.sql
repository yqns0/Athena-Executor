-- Create a function to create the love_letters table
CREATE OR REPLACE FUNCTION create_love_letters_table()
RETURNS void AS $$
BEGIN
  -- Check if table exists
  IF NOT EXISTS (
    SELECT FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'love_letters'
  ) THEN
    -- Create love_letters table
    CREATE TABLE public.love_letters (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      date TIMESTAMP WITH TIME ZONE NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
    );

    -- Set up RLS (Row Level Security)
    ALTER TABLE public.love_letters ENABLE ROW LEVEL SECURITY;

    -- Create policy to allow all operations (adjust as needed for your authentication setup)
    CREATE POLICY "Allow all operations for all users" ON public.love_letters
      FOR ALL
      USING (true)
      WITH CHECK (true);

    -- Add comment to table
    COMMENT ON TABLE public.love_letters IS 'Table storing love letters';
    
    RAISE NOTICE 'Love letters table created successfully';
  ELSE
    RAISE NOTICE 'Love letters table already exists';
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
