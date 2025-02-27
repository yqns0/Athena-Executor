import { useState } from "react";
import { LoveLetter } from "@/lib/types";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Trash2, Mail } from "lucide-react";
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
import { supabase } from "@/integrations/supabase/client";
import { forceDeleteLoveLetter, checkRLSPoliciesForMedia } from "@/utils/check-rls";

interface TimelineLetterProps {
  letter: LoveLetter;
  position: number;
  onDelete?: () => void;
}

export const TimelineLetter = ({ letter, position, onDelete }: TimelineLetterProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Calculer la taille en fonction de l'importance ou simplement utiliser une taille fixe
  const size = 40; // taille de base en pixels
  
  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      
      // Essayer d'abord la méthode standard
      const { error } = await supabase
        .from("love_letters")
        .delete()
        .eq("id", letter.id);
      
      // Si erreur, utiliser la méthode forcée
      if (error) {
        console.error("Erreur lors de la suppression standard:", error);
        console.log("Tentative de suppression forcée...");
        
        const success = await forceDeleteLoveLetter(letter.id);
        
        if (!success) {
          throw new Error("La suppression forcée a également échoué");
        }
      }
      
      toast.success("Lettre d'amour supprimée avec succès");
      
      // Call the onDelete callback to refresh the timeline
      if (onDelete) {
        onDelete();
      }
    } catch (error) {
      console.error("Error deleting love letter:", error);
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
                  className={`rounded-full border-4 border-white shadow-md transition-all duration-300 cursor-pointer flex items-center justify-center`}
                  style={{ 
                    width: isHovered ? size * 1.5 : size,
                    height: isHovered ? size * 1.5 : size,
                    backgroundColor: "rgba(244, 114, 182, 0.7)", // Pink color for love letters
                  }}
                  onMouseEnter={() => setIsHovered(true)}
                  onMouseLeave={() => setIsHovered(false)}
                >
                  <Mail className="h-6 w-6 text-white" />
                </div>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px] p-6 bg-white">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <h2 className="text-2xl font-bold text-rose-600">{letter.title}</h2>
                    <p className="text-sm text-gray-500">{format(letter.date, "d MMMM yyyy", { locale: fr })}</p>
                  </div>
                  
                  <div className="bg-rose-50 p-4 rounded-lg border border-rose-200 whitespace-pre-wrap">
                    {letter.content}
                  </div>
                  
                  {/* Bouton de suppression */}
                  <div className="flex justify-end">
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
              <p className="font-medium">{letter.title}</p>
              <p className="text-xs text-gray-500">{format(letter.date, "d MMMM yyyy", { locale: fr })}</p>
              <p className="text-xs truncate">{letter.content.substring(0, 100)}{letter.content.length > 100 ? "..." : ""}</p>
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
              Cette action est irréversible. Cette lettre d'amour sera définitivement supprimée.
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
