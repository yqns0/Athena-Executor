import { PageTransition } from "@/components/ui/page-transition";
import { Button } from "@/components/ui/button";
import { Plus, Search, SortAsc, SortDesc } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Media, Tag } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { MediaUploadForm } from "@/components/gallery/MediaUploadForm";
import { MediaCard } from "@/components/gallery/MediaCard";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type SortOption = 'date-desc' | 'date-asc' | 'created-desc' | 'created-asc';

const Galerie = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredMedias, setFilteredMedias] = useState<Media[]>([]);
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [sortOption, setSortOption] = useState<SortOption>('date-desc');

  const { data: medias, refetch: refetchMedias } = useQuery({
    queryKey: ["medias"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("media")
        .select(`*, media_tags(tag_id(id, name))`)
        .order("date", { ascending: false });

      if (error) throw error;

      // Transform the data to match our Media type
      return (data as any[]).map((item) => ({
        ...item,
        date: new Date(item.date),
        created_at: new Date(item.created_at),
        tags: item.media_tags?.map((mt: { tag_id: Tag }) => mt.tag_id)
      })) as Media[];
    },
    staleTime: 0, // Considérer les données comme obsolètes immédiatement
    cacheTime: 0, // Ne pas mettre en cache les données
    refetchOnWindowFocus: true, // Rafraîchir les données quand la fenêtre reprend le focus
    refetchOnMount: true, // Rafraîchir les données à chaque montage du composant
  });

  // Fetch all available tags
  useEffect(() => {
    const fetchTags = async () => {
      const { data, error } = await supabase
        .from("tags")
        .select("*")
        .order("name");
      
      if (error) {
        console.error("Error fetching tags:", error);
        return;
      }
      
      setAvailableTags(data as Tag[]);
    };
    
    fetchTags();
  }, []);

  // Filter and sort medias based on search query and sort option
  useEffect(() => {
    if (!medias) {
      setFilteredMedias([]);
      return;
    }

    // First filter by search query
    let filtered = [...medias];
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter((media) => {
        // Check if any tag matches the search query
        return media.tags?.some((tag) => 
          tag.name.toLowerCase().includes(query)
        ) || 
        // Also search in title and description
        media.title.toLowerCase().includes(query) ||
        (media.description && media.description.toLowerCase().includes(query));
      });
    }

    // Then sort based on selected option
    switch (sortOption) {
      case 'date-desc':
        filtered.sort((a, b) => b.date.getTime() - a.date.getTime());
        break;
      case 'date-asc':
        filtered.sort((a, b) => a.date.getTime() - b.date.getTime());
        break;
      case 'created-desc':
        filtered.sort((a, b) => b.created_at.getTime() - a.created_at.getTime());
        break;
      case 'created-asc':
        filtered.sort((a, b) => a.created_at.getTime() - b.created_at.getTime());
        break;
    }

    setFilteredMedias(filtered);
  }, [searchQuery, medias, sortOption]);

  // Get sort option label
  const getSortOptionLabel = (option: SortOption): string => {
    switch (option) {
      case 'date-desc':
        return 'Date (récent → ancien)';
      case 'date-asc':
        return 'Date (ancien → récent)';
      case 'created-desc':
        return 'Date d\'ajout (récent → ancien)';
      case 'created-asc':
        return 'Date d\'ajout (ancien → récent)';
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-b from-rose-50 to-white">
        <main className="container mx-auto px-4 py-16">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl md:text-6xl font-light text-gray-800">
              Galerie
            </h1>
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Ajouter un média</DialogTitle>
                </DialogHeader>
                <MediaUploadForm onSuccess={refetchMedias} />
              </DialogContent>
            </Dialog>
          </div>

          {/* Barre de recherche et filtres */}
          <div className="mb-6 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Rechercher par tag, titre ou description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-full"
              />
            </div>
            
            <div className="flex flex-col md:flex-row justify-between gap-4">
              {/* Tags populaires */}
              {availableTags.length > 0 && (
                <div className="flex-1">
                  <p className="text-sm text-gray-500 mb-2">Tags populaires:</p>
                  <div className="flex flex-wrap gap-2">
                    {availableTags.slice(0, 10).map((tag) => (
                      <button
                        key={tag.id}
                        onClick={() => setSearchQuery(tag.name)}
                        className="bg-rose-100 hover:bg-rose-200 text-rose-800 px-2 py-1 rounded-full text-sm transition-colors"
                      >
                        {tag.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Options de tri */}
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">Trier par:</span>
                <Select
                  value={sortOption}
                  onValueChange={(value) => setSortOption(value as SortOption)}
                >
                  <SelectTrigger className="w-[220px]">
                    <SelectValue placeholder="Sélectionner un tri" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date-desc">Date (récent → ancien)</SelectItem>
                    <SelectItem value="date-asc">Date (ancien → récent)</SelectItem>
                    <SelectItem value="created-desc">Date d'ajout (récent → ancien)</SelectItem>
                    <SelectItem value="created-asc">Date d'ajout (ancien → récent)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Résultats de recherche */}
          <div className="flex justify-between items-center mb-4">
            <p className="text-gray-600">
              {filteredMedias.length} média(s) {searchQuery && <span>pour "{searchQuery}"</span>}
            </p>
            <p className="text-sm text-gray-500">
              Trié par: {getSortOptionLabel(sortOption)}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {filteredMedias?.map((media) => (
              <MediaCard 
                key={media.id} 
                media={media} 
                onDelete={refetchMedias}
              />
            ))}
          </div>
          
          {filteredMedias?.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">Aucun média trouvé</p>
            </div>
          )}
        </main>
      </div>
    </PageTransition>
  );
};

export default Galerie;
