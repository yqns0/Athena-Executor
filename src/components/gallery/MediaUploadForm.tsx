
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface MediaUploadFormProps {
  onSuccess: () => void;
}

export const MediaUploadForm = ({ onSuccess }: MediaUploadFormProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !title || !selectedDate) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    setIsUploading(true);
    try {
      // Upload file to storage
      const fileExt = file.name.split(".").pop();
      const filePath = `${crypto.randomUUID()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from("media")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Create media entry
      const { data: mediaData, error: mediaError } = await supabase
        .from("media")
        .insert({
          title,
          description,
          date: selectedDate.toISOString(),
          file_path: filePath,
          type: file.type.startsWith("image/") ? "image" : "video",
        })
        .select()
        .single();

      if (mediaError) throw mediaError;

      // Handle tags
      for (const tagName of tags) {
        // Insert tag if it doesn't exist
        const { data: tagData, error: tagError } = await supabase
          .from("tags")
          .upsert({ name: tagName })
          .select()
          .single();

        if (tagError) throw tagError;

        // Create media-tag relation
        await supabase.from("media_tags").insert({
          media_id: mediaData.id,
          tag_id: tagData.id,
        });
      }

      toast.success("Média ajouté avec succès !");
      onSuccess();
      setTitle("");
      setDescription("");
      setSelectedDate(undefined);
      setTags([]);
    } catch (error) {
      console.error("Error:", error);
      toast.error("Une erreur est survenue lors de l'upload");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="grid gap-4 py-4">
      <div className="grid gap-2">
        <Label htmlFor="title">Titre*</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Titre du média"
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description du média"
        />
      </div>
      <div className="grid gap-2">
        <Label>Date*</Label>
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={setSelectedDate}
          className="rounded-md border"
        />
      </div>
      <div className="grid gap-2">
        <Label>Tags</Label>
        <div className="flex gap-2">
          <Input
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            placeholder="Ajouter un tag"
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddTag();
              }
            }}
          />
          <Button onClick={handleAddTag} variant="outline">
            Ajouter
          </Button>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="bg-rose-100 text-rose-800 px-2 py-1 rounded-full text-sm flex items-center gap-1"
            >
              {tag}
              <button
                onClick={() => handleRemoveTag(tag)}
                className="hover:text-rose-600"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="file">Fichier*</Label>
        <Input
          id="file"
          type="file"
          accept="image/*,video/*"
          onChange={handleFileUpload}
          disabled={isUploading}
        />
      </div>
    </div>
  );
};
