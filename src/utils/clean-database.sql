-- Script pour nettoyer la base de données
-- Ce script supprime toutes les entrées des tables media, media_tags et love_letters

-- 1. Supprimer d'abord les relations dans media_tags (table dépendante)
DELETE FROM public.media_tags;

-- 2. Supprimer tous les médias
DELETE FROM public.media;

-- 3. Supprimer toutes les lettres d'amour
DELETE FROM public.love_letters;

-- Vérifier que les tables sont vides
SELECT 'media_tags count: ' || COUNT(*) FROM public.media_tags;
SELECT 'media count: ' || COUNT(*) FROM public.media;
SELECT 'love_letters count: ' || COUNT(*) FROM public.love_letters;
