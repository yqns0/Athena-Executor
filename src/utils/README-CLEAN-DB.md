# Instructions pour nettoyer la base de données

Pour supprimer manuellement toutes les photos, vidéos et lettres existantes dans la base de données, suivez ces étapes :

## Étapes à suivre

1. Connectez-vous à votre compte Supabase (https://whewwtnuslgtstnrbaeb.supabase.co)
2. Cliquez sur l'onglet "SQL Editor" dans le menu de gauche
3. Créez un nouveau script SQL (New Query)
4. Copiez et collez le contenu du fichier `clean-database.sql` dans l'éditeur
5. Exécutez le script en cliquant sur le bouton "Run" ou en appuyant sur Ctrl+Enter

## Résultat attendu

Le script supprimera :
- Toutes les relations entre médias et tags (table `media_tags`)
- Tous les médias (photos et vidéos) de la table `media`
- Toutes les lettres d'amour de la table `love_letters`

À la fin de l'exécution, vous devriez voir un résultat confirmant que les tables sont vides :
```
media_tags count: 0
media count: 0
love_letters count: 0
```

## Après la suppression

Une fois les données supprimées, rechargez votre application. Les galeries de médias et de lettres devraient maintenant être vides, et vous pourrez ajouter de nouveaux éléments sans problème.

## Note importante

Ce script ne supprime pas les fichiers stockés dans le bucket Supabase. Si vous souhaitez également supprimer les fichiers physiques, vous devrez le faire séparément via l'interface "Storage" de Supabase.
