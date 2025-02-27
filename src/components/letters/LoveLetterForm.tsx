import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface LoveLetterFormProps {
  onSuccess: () => void;
}

export const LoveLetterForm = ({ onSuccess }: LoveLetterFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !content || !selectedDate) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    setIsSubmitting(true);
    try {
      // Format the letter content with date
      const formattedContent = `${content}\n\n${format(selectedDate, "d MMMM yyyy", { locale: fr })}`;
      
      // Log the data being sent
      console.log("Sending data to Supabase:", {
        title,
        content: formattedContent,
        date: selectedDate.toISOString()
      });
      
      // Create letter entry
      const { data, error: letterError } = await supabase
        .from("love_letters")
        .insert({
          title,
          content: formattedContent,
          date: selectedDate.toISOString()
        })
        .select();

      if (letterError) {
        console.error("Supabase error details:", letterError);
        throw letterError;
      }

      console.log("Letter added successfully:", data);
      toast.success("Lettre d'amour ajoutée avec succès !");
      onSuccess();
      setTitle("");
      setContent("");
      setSelectedDate(new Date());
    } catch (error: any) {
      console.error("Error adding letter:", error);
      // Afficher un message d'erreur plus détaillé
      toast.error(`Erreur: ${error.message || "Une erreur est survenue lors de l'ajout de la lettre"}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 py-4">
      <div className="grid gap-2">
        <Label htmlFor="title">Objet*</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Objet de la lettre"
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="content">Contenu*</Label>
        <Textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Écrivez votre lettre d'amour ici..."
          className="min-h-[200px]"
        />
      </div>
      <div className="grid gap-2">
        <Label>Date*</Label>
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={(date) => date && setSelectedDate(date)}
          className="rounded-md border"
          initialFocus
        />
      </div>
      <Button type="submit" disabled={isSubmitting} className="mt-4">
        {isSubmitting ? "Envoi en cours..." : "Envoyer la lettre"}
      </Button>
    </form>
  );
};
