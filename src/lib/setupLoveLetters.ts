import { supabase } from "@/integrations/supabase/client";

export const setupLoveLettersTable = async (): Promise<{ success: boolean; message: string }> => {
  try {
    // Vérifier si la table existe déjà
    const { data: tableExists, error: checkError } = await supabase
      .from('love_letters')
      .select('id')
      .limit(1);
    
    // Si la requête fonctionne, la table existe déjà
    if (!checkError) {
      console.log("La table love_letters existe déjà");
      return { success: true, message: "La table love_letters existe déjà" };
    }

    console.log("Erreur lors de la vérification de la table:", checkError);
    
    // Si la table n'existe pas, essayer d'utiliser la fonction RPC
    const { error: createError } = await supabase.rpc('create_love_letters_table');
    
    if (createError) {
      console.error("Erreur lors de la création de la table via RPC:", createError);
      console.log("Tentative de création manuelle de la table...");
      
      // Tentative de création manuelle de la table via SQL
      const { error: sqlError } = await supabase.from('love_letters').insert({
        title: 'Test',
        content: 'Test',
        date: new Date().toISOString()
      });
      
      if (sqlError && sqlError.code === '42P01') { // Erreur "relation does not exist"
        return { 
          success: false, 
          message: "La table n'existe pas et ne peut pas être créée automatiquement. Veuillez exécuter le script SQL manuellement." 
        };
      } else if (sqlError) {
        return { 
          success: false, 
          message: `Erreur lors de la tentative de création manuelle: ${sqlError.message}` 
        };
      }
      
      return { 
        success: true, 
        message: "Table love_letters créée manuellement avec succès" 
      };
    }
    
    return { 
      success: true, 
      message: "Table love_letters créée avec succès via RPC" 
    };
  } catch (error: any) {
    console.error("Erreur inattendue:", error);
    return { 
      success: false, 
      message: `Erreur inattendue: ${error.message}` 
    };
  }
};
