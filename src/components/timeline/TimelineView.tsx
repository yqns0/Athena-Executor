import { useState, useRef, useEffect } from "react";
import { Media, LoveLetter } from "@/lib/types";
import { TimelineMedia } from "./TimelineMedia";
import { TimelineLetter } from "./TimelineLetter";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from "lucide-react";

interface TimelineViewProps {
  medias: Media[];
  letters: LoveLetter[];
  onMediaDelete?: () => void;
  onLetterDelete?: () => void;
}

export const TimelineView = ({ medias, letters, onMediaDelete, onLetterDelete }: TimelineViewProps) => {
  const [zoom, setZoom] = useState(1);
  const [scrollPosition, setScrollPosition] = useState(0);
  const timelineRef = useRef<HTMLDivElement>(null);
  
  // Trier les médias par date
  const sortedMedias = [...medias].sort((a, b) => a.date.getTime() - b.date.getTime());
  
  // Trier les lettres par date
  const sortedLetters = [...letters].sort((a, b) => a.date.getTime() - b.date.getTime());
  
  // Combiner médias et lettres pour déterminer la plage de dates
  const allItems = [...sortedMedias, ...sortedLetters].sort((a, b) => a.date.getTime() - b.date.getTime());
  
  // Calculer les dates min et max pour l'échelle
  const minDate = allItems.length > 0 ? allItems[0].date.getTime() : new Date().getTime();
  const maxDate = allItems.length > 0 ? allItems[allItems.length - 1].date.getTime() : new Date().getTime();
  const dateRange = maxDate - minDate;
  
  // Fonction pour calculer la position en pourcentage sur la ligne de temps
  const getPositionPercent = (date: Date) => {
    if (dateRange === 0) return 50; // Si toutes les dates sont identiques, centrer
    return ((date.getTime() - minDate) / dateRange) * 100;
  };
  
  // Gérer le zoom
  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.5, 5));
  };
  
  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.5, 0.5));
  };
  
  // Gérer le défilement
  const handleScroll = (direction: 'left' | 'right') => {
    if (!timelineRef.current) return;
    
    const scrollAmount = timelineRef.current.clientWidth * 0.3;
    const newPosition = direction === 'left' 
      ? timelineRef.current.scrollLeft - scrollAmount 
      : timelineRef.current.scrollLeft + scrollAmount;
    
    timelineRef.current.scrollTo({
      left: newPosition,
      behavior: 'smooth'
    });
  };
  
  // Mettre à jour la position de défilement
  const updateScrollPosition = () => {
    if (!timelineRef.current) return;
    setScrollPosition(timelineRef.current.scrollLeft);
  };
  
  useEffect(() => {
    const timeline = timelineRef.current;
    if (timeline) {
      timeline.addEventListener('scroll', updateScrollPosition);
      return () => timeline.removeEventListener('scroll', updateScrollPosition);
    }
  }, []);
  
  // Générer des marqueurs de date pour l'échelle
  const generateDateMarkers = () => {
    if (allItems.length === 0) return [];
    
    // Calculer le nombre de marqueurs en fonction de la plage de dates
    const years = Math.ceil(dateRange / (365 * 24 * 60 * 60 * 1000)) + 1;
    const markers = [];
    
    for (let i = 0; i < years; i++) {
      const date = new Date(minDate);
      date.setFullYear(date.getFullYear() + i);
      
      // Ne pas ajouter de marqueurs au-delà de la date maximale
      if (date.getTime() > maxDate) break;
      
      markers.push({
        date,
        position: getPositionPercent(date)
      });
    }
    
    return markers;
  };
  
  const dateMarkers = generateDateMarkers();
  
  return (
    <div className="w-full space-y-4">
      {/* Contrôles de zoom et navigation */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="icon" onClick={handleZoomOut} disabled={zoom <= 0.5}>
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-sm text-gray-500">Zoom: {zoom.toFixed(1)}x</span>
          <Button variant="outline" size="icon" onClick={handleZoomIn} disabled={zoom >= 5}>
            <ZoomIn className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="icon" onClick={() => handleScroll('left')}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={() => handleScroll('right')}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {/* Conteneur de la chronologie avec défilement horizontal */}
      <div 
        ref={timelineRef}
        className="w-full overflow-x-auto pb-6"
        style={{ 
          overscrollBehavior: 'contain',
        }}
      >
        <div 
          className="relative h-40 min-w-full"
          style={{ 
            width: `${100 * zoom}%`,
          }}
        >
          {/* Ligne de temps */}
          <div className="absolute top-1/2 left-0 right-0 h-1 bg-rose-300 transform -translate-y-1/2"></div>
          
          {/* Marqueurs de date */}
          {dateMarkers.map((marker, index) => (
            <div 
              key={index} 
              className="absolute top-1/2 transform -translate-y-1/2"
              style={{ left: `${marker.position}%` }}
            >
              <div className="h-3 w-1 bg-rose-500 mb-1"></div>
              <div className="text-xs text-gray-600 transform -translate-x-1/2">
                {marker.date.getFullYear()}
              </div>
            </div>
          ))}
          
          {/* Médias sur la chronologie */}
          {sortedMedias.map((media) => (
            <TimelineMedia 
              key={media.id} 
              media={media} 
              position={getPositionPercent(media.date)}
              onDelete={onMediaDelete}
            />
          ))}
          
          {/* Lettres d'amour sur la chronologie */}
          {sortedLetters.map((letter) => (
            <TimelineLetter
              key={letter.id}
              letter={letter}
              position={getPositionPercent(letter.date)}
              onDelete={onLetterDelete}
            />
          ))}
        </div>
      </div>
      
      {/* Légende */}
      <div className="flex justify-center space-x-6 text-sm text-gray-600">
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-cover border border-gray-300 mr-2"></div>
          <span>Photo</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-rose-500 mr-2 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-2 w-2 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            </svg>
          </div>
          <span>Vidéo</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-pink-400 mr-2 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-2 w-2 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <span>Lettre d'amour</span>
        </div>
      </div>
    </div>
  );
};
