-- Script simple pour créer la table love_letters
-- Exécutez ce script dans la console SQL de Supabase

-- Créer la table love_letters
CREATE TABLE IF NOT EXISTS public.love_letters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Activer la sécurité au niveau des lignes (RLS)
ALTER TABLE public.love_letters ENABLE ROW LEVEL SECURITY;

-- Créer une politique permettant toutes les opérations pour tous les utilisateurs
CREATE POLICY "Allow all operations for all users" ON public.love_letters
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Ajouter un commentaire à la table
COMMENT ON TABLE public.love_letters IS 'Table storing love letters';
