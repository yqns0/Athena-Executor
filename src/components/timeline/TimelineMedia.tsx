import { useState } from "react";
import { Media } from "@/lib/types";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

interface TimelineMediaProps {
  media: Media;
  position: number;
  onDelete?: () => void;
}

export const TimelineMedia = ({ media, position, onDelete }: TimelineMediaProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const publicUrl = supabase.storage.from("media").getPublicUrl(media.file_path).data.publicUrl;
  
  // Calculer la taille en fonction de l'importance ou simplement utiliser une taille fixe
  const size = 40; // taille de base en pixels
  
  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      
      // 1. Delete the media-tag relations
      const { error: tagsError } = await supabase
        .from("media_tags")
        .delete()
        .eq("media_id", media.id);
      
      if (tagsError) throw tagsError;
      
      // 2. Delete the media entry from the database
      const { error: mediaError } = await supabase
        .from("media")
        .delete()
        .eq("id", media.id);
      
      if (mediaError) throw mediaError;
      
      // 3. Delete the file from storage
      const { error: storageError } = await supabase
        .storage
        .from("media")
        .remove([media.file_path]);
      
      if (storageError) throw storageError;
      
      toast.success("Média supprimé avec succès");
      
      // Call the onDelete callback to refresh the timeline
      if (onDelete) {
        onDelete();
      }
    } catch (error) {
      console.error("Error deleting media:", error);
      toast.error("Une erreur est survenue lors de la suppression");
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
      setIsDialogOpen(false);
    }
  };
  
  return (
    <TooltipProvider>
      <Tooltip>
        <div 
          className="absolute transform -translate-y-1/2"
          style={{ 
            left: `${position}%`,
            top: "50%",
            zIndex: isHovered ? 10 : 1
          }}
        >
          <TooltipTrigger asChild>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <div
                  className={`rounded-full border-4 border-white shadow-md transition-all duration-300 cursor-pointer bg-cover bg-center`}
                  style={{ 
                    width: isHovered ? size * 1.5 : size,
                    height: isHovered ? size * 1.5 : size,
                    backgroundImage: media.type === "image" ? `url(${publicUrl})` : "none",
                    backgroundColor: media.type === "video" ? "rgba(239, 68, 68, 0.7)" : "transparent",
                  }}
                  onMouseEnter={() => setIsHovered(true)}
                  onMouseLeave={() => setIsHovered(false)}
                >
                  {media.type === "video" && (
                    <div className="flex items-center justify-center h-full">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  )}
                </div>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[800px] p-0 bg-transparent border-0">
                <div className="relative">
                  {media.type === "image" ? (
                    <img 
                      src={publicUrl} 
                      alt={media.title} 
                      className="max-h-[80vh] object-contain rounded-lg shadow-xl"
                    />
                  ) : (
                    <video 
                      src={publicUrl} 
                      controls 
                      autoPlay
                      className="max-h-[80vh] max-w-full object-contain rounded-lg shadow-xl"
                    />
                  )}
                  
                  {/* Bouton de suppression - déplacé en bas à droite */}
                  <div className="absolute bottom-4 right-4 flex justify-end">
                    <Button
                      variant="destructive"
                      size="sm"
                      className="bg-red-500/80 hover:bg-red-600"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowDeleteDialog(true);
                      }}
                      disabled={isDeleting}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Supprimer
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="p-2 max-w-xs">
            <div className="space-y-1">
              <p className="font-medium">{media.title}</p>
              <p className="text-xs text-gray-500">{format(media.date, "d MMMM yyyy", { locale: fr })}</p>
              {media.description && (
                <p className="text-xs">{media.description}</p>
              )}
              {media.tags && media.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {media.tags.map((tag) => (
                    <span key={tag.id} className="bg-rose-100 text-rose-800 px-1.5 py-0.5 rounded-full text-xs">
                      {tag.name}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </TooltipContent>
        </div>
      </Tooltip>
      
      {/* Dialogue de confirmation de suppression */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Ce média sera définitivement supprimé de votre galerie.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Annuler</AlertDialogCancel>
            <AlertDialogAction 
              onClick={(e) => {
                e.preventDefault();
                handleDelete();
              }}
              disabled={isDeleting}
              className="bg-red-500 hover:bg-red-600"
            >
              {isDeleting ? "Suppression..." : "Supprimer"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </TooltipProvider>
  );
};
