import { LoveLetter } from "@/lib/types";
import { format, isToday } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { forceDeleteLoveLetter } from "@/utils/check-rls";
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

interface LoveLetterCardProps {
  letter: LoveLetter;
  onDelete?: () => void;
}

export const LoveLetterCard = ({ letter, onDelete }: LoveLetterCardProps) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const queryClient = useQueryClient();
  
  const isCurrentDay = isToday(new Date(letter.date));
  
  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      console.log("Début de la suppression de la lettre:", letter.id);
      
      // Suppression forcée de la lettre
      const success = await forceDeleteLoveLetter(letter.id);
      
      if (!success) {
        console.error("Erreur lors de la suppression forcée de la lettre");
        toast.error("Une erreur est survenue lors de la suppression");
        setIsDeleting(false);
        setShowDeleteDialog(false);
        return;
      }
      
      // Forcer un rafraîchissement plus agressif après la suppression
      queryClient.invalidateQueries(["love-letters"]);
      queryClient.invalidateQueries(["love-letters"], { type: 'active' });
      queryClient.invalidateQueries(["love-letters"], { type: 'inactive' });
      
      toast.success("Lettre supprimée avec succès");
      
      // Appeler le callback onDelete pour rafraîchir la liste des lettres
      if (onDelete) {
        console.log("Appel du callback onDelete avec délai");
        // Attendre un peu avant de rafraîchir pour s'assurer que la suppression est bien prise en compte
        setTimeout(() => {
          onDelete();
        }, 500);
      }
    } catch (error) {
      console.error("Error deleting letter:", error);
      toast.error("Une erreur est survenue lors de la suppression");
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  return (
    <>
      <div 
        className={cn(
          "bg-white rounded-lg shadow-md p-6 relative",
          isCurrentDay && "border-2 border-rose-400 shadow-rose-200"
        )}
      >
        {isCurrentDay && (
          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-rose-400 text-white px-3 py-1 rounded-full text-sm">
            Aujourd'hui
          </div>
        )}
        
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-semibold text-gray-800">{letter.title}</h3>
          <Button
            variant="ghost"
            size="icon"
            className="text-gray-500 hover:text-red-500"
            onClick={() => setShowDeleteDialog(true)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="text-gray-700 mb-4 whitespace-pre-line">
          {letter.content}
        </div>
        
        <div className="text-sm text-gray-500 mt-4">
          {format(new Date(letter.date), "d MMMM yyyy", { locale: fr })}
        </div>
      </div>
      
      {/* Dialogue de confirmation de suppression */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Cette lettre sera définitivement supprimée.
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
    </>
  );
};
