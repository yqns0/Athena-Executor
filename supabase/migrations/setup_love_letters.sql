-- Script complet pour configurer la table love_letters et la fonction associée

-- 1. Créer la fonction pour créer la table love_letters
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

-- 2. Créer directement la table love_letters (si vous préférez cette approche)
CREATE TABLE IF NOT EXISTS public.love_letters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Set up RLS (Row Level Security) si la table vient d'être créée
DO $$
BEGIN
  ALTER TABLE public.love_letters ENABLE ROW LEVEL SECURITY;
EXCEPTION
  WHEN others THEN
    NULL; -- Ignorer les erreurs si la RLS est déjà activée
END $$;

-- Créer la policy si elle n'existe pas
DO $$
BEGIN
  CREATE POLICY "Allow all operations for all users" ON public.love_letters
    FOR ALL
    USING (true)
    WITH CHECK (true);
EXCEPTION
  WHEN duplicate_object THEN
    NULL; -- Ignorer si la policy existe déjà
END $$;

-- Ajouter un commentaire à la table
COMMENT ON TABLE public.love_letters IS 'Table storing love letters';
