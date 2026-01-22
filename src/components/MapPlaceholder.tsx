import { motion } from 'framer-motion';
import { Map, MapPin, Navigation2, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Place } from '@/types/place';
import { cn } from '@/lib/utils';

interface MapPlaceholderProps {
  places: Place[];
  className?: string;
}

export function MapPlaceholder({ places, className }: MapPlaceholderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        'relative rounded-2xl overflow-hidden bg-gradient-to-br from-teal/10 to-secondary/10 border border-border',
        className
      )}
    >
      {/* Map background pattern */}
      <div className="absolute inset-0 opacity-30">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-muted-foreground" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Content overlay */}
      <div className="relative h-full min-h-[300px] md:min-h-[400px] flex flex-col items-center justify-center p-6 text-center">
        <div className="relative mb-6">
          <motion.div
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.6, 0.3]
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute inset-0 bg-primary/20 rounded-full blur-xl"
          />
          <div className="relative bg-primary/10 p-4 rounded-2xl">
            <Map className="h-12 w-12 text-primary" />
          </div>
        </div>

        <h3 className="font-display text-xl font-semibold mb-2">Interactive Map</h3>
        <p className="text-muted-foreground text-sm max-w-xs mb-6">
          Explore {places.length} nearby places on the map. Get directions and discover hidden gems.
        </p>

        {/* Mini place indicators */}
        <div className="flex flex-wrap justify-center gap-2 mb-6">
          {places.slice(0, 5).map((place, index) => (
            <motion.div
              key={place.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center gap-1.5 bg-card px-3 py-1.5 rounded-full shadow-sm text-xs"
            >
              <MapPin className="h-3 w-3 text-primary" />
              <span className="font-medium truncate max-w-[100px]">{place.name}</span>
              <span className="text-muted-foreground">{place.distance}km</span>
            </motion.div>
          ))}
          {places.length > 5 && (
            <div className="flex items-center gap-1 bg-muted px-3 py-1.5 rounded-full text-xs text-muted-foreground">
              +{places.length - 5} more
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <Button variant="hero" size="lg" className="rounded-xl">
            <Navigation2 className="h-4 w-4 mr-2" />
            Get Directions
          </Button>
          <Button variant="outline" size="lg" className="rounded-xl">
            <Maximize2 className="h-4 w-4 mr-2" />
            Full Map
          </Button>
        </div>
      </div>

      {/* Decorative map pins */}
      <motion.div 
        className="absolute top-6 left-8"
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 2, repeat: Infinity, delay: 0.2 }}
      >
        <MapPin className="h-6 w-6 text-coral" />
      </motion.div>
      <motion.div 
        className="absolute top-16 right-12"
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
      >
        <MapPin className="h-5 w-5 text-teal" />
      </motion.div>
      <motion.div 
        className="absolute bottom-20 left-16"
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 2, repeat: Infinity, delay: 0.8 }}
      >
        <MapPin className="h-5 w-5 text-accent" />
      </motion.div>
      <motion.div 
        className="absolute bottom-12 right-8"
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 2, repeat: Infinity, delay: 1.1 }}
      >
        <MapPin className="h-6 w-6 text-secondary" />
      </motion.div>
    </motion.div>
  );
}
