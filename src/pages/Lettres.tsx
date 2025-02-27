import { PageTransition } from "@/components/ui/page-transition";
import { useState, useEffect } from "react";
import { LoveLetter } from "@/lib/types";
import { supabase } from "@/integrations/supabase/client";
import { LoveLetterCard } from "@/components/letters/LoveLetterCard";
import { LoveLetterForm } from "@/components/letters/LoveLetterForm";
import { Button } from "@/components/ui/button";
import { PenLine, Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

const Lettres = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isTableReady, setIsTableReady] = useState(false);
  
  // Vérifier et créer la table si nécessaire
  useEffect(() => {
    const checkAndCreateTable = async () => {
      try {
        // Vérifier si la table existe déjà
        const { error: checkError } = await supabase
          .from('love_letters')
          .select('id')
          .limit(1);
        
        if (checkError) {
          console.log("La table love_letters n'existe pas encore, création en cours...");
          
          // Créer la table manuellement
          const { error: createError } = await supabase.rpc('create_love_letters_table');
          
          if (createError) {
            console.error("Erreur lors de la création de la table:", createError);
            toast.error(`Erreur: ${createError.message}`);
            return;
          }
          
          console.log("Table love_letters créée avec succès");
          toast.success("Table des lettres d'amour initialisée avec succès");
        } else {
          console.log("La table love_letters existe déjà");
        }
        
        setIsTableReady(true);
      } catch (error: any) {
        console.error("Erreur lors de la vérification/création de la table:", error);
        toast.error(`Erreur: ${error.message}`);
      }
    };
    
    checkAndCreateTable();
  }, []);
  
  // Fetch letters
  const fetchLetters = async (): Promise<LoveLetter[]> => {
    if (!isTableReady) {
      return [];
    }
    
    const { data, error } = await supabase
      .from("love_letters")
      .select("*")
      .order("date", { ascending: false });
    
    if (error) {
      console.error("Erreur lors de la récupération des lettres:", error);
      throw error;
    }
    
    return data.map(letter => ({
      ...letter,
      date: new Date(letter.date),
      created_at: new Date(letter.created_at)
    }));
  };
  
  const { 
    data: letters = [], 
    isLoading, 
    isError, 
    refetch 
  } = useQuery({
    queryKey: ["love-letters"],
    queryFn: fetchLetters,
    enabled: isTableReady,
    staleTime: 0, // Considérer les données comme obsolètes immédiatement
    cacheTime: 0, // Ne pas mettre en cache les données
    refetchOnWindowFocus: true, // Rafraîchir les données quand la fenêtre reprend le focus
    refetchOnMount: true, // Rafraîchir les données à chaque montage du composant
  });
  
  const handleLetterAdded = () => {
    setIsDialogOpen(false);
    refetch();
  };
  
  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-b from-rose-50 to-white">
        <main className="container mx-auto px-4 py-16">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl md:text-6xl font-light text-gray-800">Lettres d'Amour</h1>
            
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-rose-500 hover:bg-rose-600">
                  <Plus className="mr-2 h-4 w-4" />
                  Nouvelle lettre
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle className="flex items-center">
                    <PenLine className="mr-2 h-5 w-5" />
                    Écrire une lettre d'amour
                  </DialogTitle>
                </DialogHeader>
                <LoveLetterForm onSuccess={handleLetterAdded} />
              </DialogContent>
            </Dialog>
          </div>
          
          {!isTableReady ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-rose-500"></div>
              <p className="ml-4">Initialisation de la fonctionnalité...</p>
            </div>
          ) : isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-rose-500"></div>
            </div>
          ) : isError ? (
            <div className="text-center py-12 text-red-500">
              Une erreur est survenue lors du chargement des lettres.
            </div>
          ) : letters.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p className="mb-4">Aucune lettre d'amour pour le moment.</p>
              <p>Cliquez sur "Nouvelle lettre" pour écrire votre première lettre d'amour.</p>
            </div>
          ) : (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {letters.map((letter) => (
                <LoveLetterCard 
                  key={letter.id} 
                  letter={letter} 
                  onDelete={refetch}
                />
              ))}
            </div>
          )}
        </main>
      </div>
    </PageTransition>
  );
};

export default Lettres;
