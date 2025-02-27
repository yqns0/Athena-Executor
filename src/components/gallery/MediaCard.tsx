import { Media } from "@/lib/types";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Trash2, Maximize2 } from "lucide-react";
import { useState } from "react";
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
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { checkRLSPoliciesForMedia, forceDeleteMedia } from "@/utils/check-rls";

interface MediaCardProps {
  media: Media;
  onDelete?: () => void;
}

export const MediaCard = ({ media, onDelete }: MediaCardProps) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showFullscreen, setShowFullscreen] = useState(false);
  const queryClient = useQueryClient();

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      console.log("Début de la suppression du média:", media.id);
      
      // Vérification des politiques RLS
      const hasPermission = await checkRLSPoliciesForMedia(media);
      if (!hasPermission) {
        console.error("Erreur : vous n'avez pas la permission de supprimer ce média");
        toast.error("Vous n'avez pas la permission de supprimer ce média");
        setIsDeleting(false);
        setShowDeleteDialog(false);
        return;
      }
      
      // Suppression forcée du média
      const success = await forceDeleteMedia(media);
      
      if (!success) {
        console.error("Erreur lors de la suppression forcée du média");
        toast.error("Une erreur est survenue lors de la suppression");
        setIsDeleting(false);
        setShowDeleteDialog(false);
        return;
      }
      
      // Forcer un rafraîchissement plus agressif après la suppression
      queryClient.invalidateQueries(["medias"]);
      queryClient.invalidateQueries(["medias"], { type: 'active' });
      queryClient.invalidateQueries(["medias"], { type: 'inactive' });
      
      toast.success("Média supprimé avec succès");
      
      // Appeler le callback onDelete pour rafraîchir la liste des médias
      if (onDelete) {
        console.log("Appel du callback onDelete avec délai");
        // Attendre un peu avant de rafraîchir pour s'assurer que la suppression est bien prise en compte
        setTimeout(() => {
          onDelete();
        }, 500);
      }
    } catch (error) {
      console.error("Error deleting media:", error);
      toast.error("Une erreur est survenue lors de la suppression");
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const publicUrl = supabase.storage.from("media").getPublicUrl(media.file_path).data.publicUrl;

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden group relative">
      <div className="relative">
        {media.type === "image" ? (
          <img
            src={publicUrl}
            alt={media.title}
            className="w-full h-48 object-cover cursor-pointer"
            onClick={() => setShowFullscreen(true)}
          />
        ) : (
          <video
            src={publicUrl}
            className="w-full h-48 object-cover"
            controls
          />
        )}
        
        {/* Boutons d'action */}
        <div className="absolute top-2 right-2 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="secondary"
            size="icon"
            className="bg-white/80 hover:bg-white"
            onClick={() => setShowFullscreen(true)}
          >
            <Maximize2 className="h-4 w-4 text-gray-700" />
          </Button>
          
          <Button
            variant="destructive"
            size="icon"
            onClick={() => setShowDeleteDialog(true)}
            disabled={isDeleting}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="text-lg font-medium text-gray-800">{media.title}</h3>
        <p className="text-sm text-gray-600 mt-1">
          {format(media.date, "dd/MM/yyyy")}
        </p>
        {media.description && (
          <p className="text-gray-600 mt-2">{media.description}</p>
        )}
        {media.tags && media.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {media.tags.map((tag) => (
              <span
                key={tag.id}
                className="bg-rose-100 text-rose-800 px-2 py-1 rounded-full text-sm"
              >
                {tag.name}
              </span>
            ))}
          </div>
        )}
      </div>
      
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
      
      {/* Dialogue d'affichage plein écran */}
      <Dialog open={showFullscreen} onOpenChange={setShowFullscreen}>
        <DialogContent className="sm:max-w-[90vw] p-0 bg-transparent border-0 max-h-[90vh] overflow-hidden">
          <div className="relative bg-black/90 rounded-lg p-4 flex items-center justify-center">
            {media.type === "image" ? (
              <img
                src={publicUrl}
                alt={media.title}
                className="max-h-[80vh] max-w-full object-contain"
              />
            ) : (
              <video
                src={publicUrl}
                controls
                autoPlay
                className="max-h-[80vh] max-w-full object-contain"
              />
            )}
            
            {/* Bouton de suppression dans la vue plein écran */}
            <Button
              variant="destructive"
              size="icon"
              className="absolute top-4 right-4"
              onClick={(e) => {
                e.stopPropagation();
                setShowDeleteDialog(true);
              }}
              disabled={isDeleting}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
