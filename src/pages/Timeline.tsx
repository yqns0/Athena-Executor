import { PageTransition } from "@/components/ui/page-transition";
import { TimelineView } from "@/components/timeline/TimelineView";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Media, Tag, LoveLetter } from "@/lib/types";
import { Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const Timeline = () => {
  const queryClient = useQueryClient();
  
  // Fetch media
  const { 
    data: medias, 
    isLoading: isLoadingMedias, 
    error: mediaError, 
    refetch: refetchMedias 
  } = useQuery({
    queryKey: ["medias"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("media")
        .select(`*, media_tags(tag_id(id, name))`)
        .order("date", { ascending: true });

      if (error) throw error;

      // Transform the data to match our Media type
      return (data as any[]).map((item) => ({
        ...item,
        date: new Date(item.date),
        created_at: new Date(item.created_at),
        tags: item.media_tags?.map((mt: { tag_id: Tag }) => mt.tag_id)
      })) as Media[];
    },
  });
  
  // Fetch love letters
  const {
    data: letters,
    isLoading: isLoadingLetters,
    error: lettersError,
    refetch: refetchLetters
  } = useQuery({
    queryKey: ["love_letters"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("love_letters")
        .select("*")
        .order("date", { ascending: true });

      if (error) throw error;

      // Transform the data to match our LoveLetter type
      return (data as any[]).map((item) => ({
        ...item,
        date: new Date(item.date),
        created_at: new Date(item.created_at)
      })) as LoveLetter[];
    },
  });
  
  // Combined loading state
  const isLoading = isLoadingMedias || isLoadingLetters;
  
  // Combined error state
  const error = mediaError || lettersError;
  
  // Refetch both media and letters
  const refetchAll = () => {
    refetchMedias();
    refetchLetters();
  };
  
  // Check if we have any content to display
  const hasContent = (medias && medias.length > 0) || (letters && letters.length > 0);

  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-b from-rose-50 to-white">
        <main className="container mx-auto px-4 py-16">
          <h1 className="text-4xl md:text-6xl font-light text-gray-800 mb-8">Chronologie</h1>
          
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <p className="text-gray-600 mb-6">
              Explorez votre histoire à travers cette chronologie interactive. Survolez les points pour voir un aperçu des médias et lettres d'amour, cliquez pour les agrandir.
            </p>
            
            {isLoading && (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 text-rose-500 animate-spin" />
                <span className="ml-2 text-gray-600">Chargement de la chronologie...</span>
              </div>
            )}
            
            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertDescription>
                  Une erreur est survenue lors du chargement de la chronologie. Veuillez réessayer.
                </AlertDescription>
              </Alert>
            )}
            
            {!isLoading && !error && !hasContent && (
              <div className="text-center py-12">
                <p className="text-gray-500">Aucun contenu n'a été ajouté à la chronologie.</p>
                <p className="text-gray-500 mt-2">Ajoutez des photos, vidéos ou lettres d'amour pour les voir apparaître ici.</p>
              </div>
            )}
            
            {!isLoading && !error && hasContent && (
              <TimelineView 
                medias={medias || []} 
                letters={letters || []}
                onMediaDelete={refetchMedias}
                onLetterDelete={refetchLetters}
              />
            )}
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-light text-gray-800 mb-4">Comment utiliser la chronologie</h2>
            <ul className="list-disc pl-5 space-y-2 text-gray-600">
              <li>Utilisez les boutons <strong>zoom</strong> pour ajuster l'échelle de la chronologie</li>
              <li>Naviguez avec les flèches ou faites défiler horizontalement</li>
              <li>Survolez un point pour voir un aperçu du contenu</li>
              <li>Cliquez sur un point pour voir le média ou la lettre en plein écran</li>
              <li>Les éléments sont organisés par leur date, pas par leur date d'ajout</li>
              <li>Les <strong>photos</strong> sont représentées par des cercles avec miniature</li>
              <li>Les <strong>vidéos</strong> sont représentées par des cercles rouges</li>
              <li>Les <strong>lettres d'amour</strong> sont représentées par des cercles roses</li>
            </ul>
          </div>
        </main>
      </div>
    </PageTransition>
  );
};

export default Timeline;
