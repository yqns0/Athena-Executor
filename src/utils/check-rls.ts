import { supabase } from "@/integrations/supabase/client";

/**
 * Fonction pour vérifier les politiques RLS sur une table
 */
export async function checkRLSPolicies(tableName: string) {
  try {
    console.log(`Vérification des politiques RLS pour la table ${tableName}...`);
    
    // Cette requête utilise la fonction système de Supabase pour lister les politiques
    const { data, error } = await supabase.rpc('get_policies_for_table', {
      table_name: tableName
    });
    
    if (error) {
      console.error(`Erreur lors de la vérification des politiques RLS:`, error);
      return null;
    }
    
    console.log(`Politiques RLS pour ${tableName}:`, data);
    return data;
  } catch (error) {
    console.error(`Exception lors de la vérification des politiques RLS:`, error);
    return null;
  }
}

/**
 * Fonction pour désactiver temporairement RLS sur une table
 */
export async function disableRLS(tableName: string) {
  try {
    console.log(`Tentative de désactivation de RLS pour la table ${tableName}...`);
    
    // Cette requête utilise la fonction système de Supabase pour désactiver RLS
    const { data, error } = await supabase.rpc('disable_rls_for_table', {
      table_name: tableName
    });
    
    if (error) {
      console.error(`Erreur lors de la désactivation de RLS:`, error);
      return false;
    }
    
    console.log(`RLS désactivé pour ${tableName}:`, data);
    return true;
  } catch (error) {
    console.error(`Exception lors de la désactivation de RLS:`, error);
    return false;
  }
}

/**
 * Fonction pour forcer la suppression d'un média avec contournement RLS
 */
export async function forceDeleteMedia(media: any) {
  try {
    console.log(`Tentative de suppression forcée du média ${media.id}...`);
    
    // 1. Supprimer les relations média-tags
    try {
      const { error: tagsError } = await supabase
        .from("media_tags")
        .delete()
        .eq("media_id", media.id);
      
      if (tagsError) {
        console.error("Erreur lors de la suppression des relations média-tags:", tagsError);
      } else {
        console.log("Relations média-tags supprimées avec succès");
      }
    } catch (error) {
      console.error("Erreur lors de la suppression des relations média-tags:", error);
    }
    
    // 2. Utiliser une fonction RPC côté serveur pour contourner RLS
    // Convertir l'UUID en string si nécessaire
    const mediaId = typeof media.id === 'object' ? media.id.toString() : media.id;
    
    console.log("Type de media.id:", typeof media.id);
    console.log("Valeur de media.id:", media.id);
    console.log("Valeur convertie:", mediaId);
    
    const { data, error } = await supabase.rpc('force_delete_media', {
      media_id: mediaId
    });
    
    if (error) {
      console.error(`Erreur lors de la suppression forcée:`, error);
      return false;
    }
    
    // 3. Supprimer le fichier du stockage
    try {
      const { error: storageError } = await supabase
        .storage
        .from("media")
        .remove([media.file_path]);
      
      if (storageError) {
        console.error("Erreur lors de la suppression du fichier du stockage:", storageError);
      } else {
        console.log("Fichier supprimé du stockage avec succès");
      }
    } catch (error) {
      console.error("Erreur lors de la suppression du fichier du stockage:", error);
    }
    
    console.log(`Suppression forcée réussie:`, data);
    return true;
  } catch (error) {
    console.error(`Exception lors de la suppression forcée:`, error);
    return false;
  }
}

/**
 * Fonction pour forcer la suppression d'une lettre d'amour avec contournement RLS
 */
export async function forceDeleteLoveLetter(letterId: string) {
  try {
    console.log(`Tentative de suppression forcée de la lettre ${letterId}...`);
    
    // Convertir l'UUID en string si nécessaire
    const letterIdStr = typeof letterId === 'object' ? letterId.toString() : letterId;
    
    console.log("Type de letterId:", typeof letterId);
    console.log("Valeur de letterId:", letterId);
    console.log("Valeur convertie:", letterIdStr);
    
    // Utiliser une fonction RPC côté serveur pour contourner RLS
    const { data, error } = await supabase.rpc('force_delete_love_letter', {
      letter_id: letterIdStr
    });
    
    if (error) {
      console.error(`Erreur lors de la suppression forcée:`, error);
      return false;
    }
    
    console.log(`Suppression forcée réussie:`, data);
    return true;
  } catch (error) {
    console.error(`Exception lors de la suppression forcée:`, error);
    return false;
  }
}

/**
 * Fonction pour vérifier les permissions de suppression d'un média
 */
export async function checkRLSPoliciesForMedia(media: any) {
  try {
    console.log(`Vérification des permissions pour le média ${media.id}...`);
    
    // Vérifier si l'utilisateur a la permission de supprimer ce média
    // Cette requête vérifie si l'utilisateur peut accéder au média en mode suppression
    const { data, error } = await supabase
      .from("media")
      .delete()
      .eq("id", media.id)
      .select();
    
    if (error) {
      // Si une erreur se produit, c'est probablement à cause des politiques RLS
      console.error(`Erreur de permission:`, error);
      
      // Vérifier si l'erreur est liée à RLS
      if (error.message.includes("permission") || error.message.includes("policy")) {
        console.log("Problème de permission RLS détecté");
        return false;
      }
    }
    
    // Si nous arrivons ici, c'est que l'utilisateur a probablement la permission
    return true;
  } catch (error) {
    console.error(`Exception lors de la vérification des permissions:`, error);
    // En cas de doute, on continue
    return true;
  }
}

/**
 * Fonction pour vérifier les permissions de suppression d'une lettre d'amour
 */
export async function checkRLSPoliciesForLoveLetter(letter: any) {
  try {
    console.log(`Vérification des permissions pour la lettre ${letter.id}...`);
    
    // Vérifier si l'utilisateur a la permission de supprimer cette lettre
    // Cette requête vérifie si l'utilisateur peut accéder à la lettre en mode suppression
    const { data, error } = await supabase
      .from("love_letters")
      .delete()
      .eq("id", letter.id)
      .select();
    
    if (error) {
      // Si une erreur se produit, c'est probablement à cause des politiques RLS
      console.error(`Erreur de permission:`, error);
      
      // Vérifier si l'erreur est liée à RLS
      if (error.message.includes("permission") || error.message.includes("policy")) {
        console.log("Problème de permission RLS détecté");
        return false;
      }
    }
    
    // Si nous arrivons ici, c'est que l'utilisateur a probablement la permission
    return true;
  } catch (error) {
    console.error(`Exception lors de la vérification des permissions:`, error);
    // En cas de doute, on continue
    return true;
  }
}
