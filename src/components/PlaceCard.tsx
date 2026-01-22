import { motion } from 'framer-motion';
import { MapPin, Clock, Navigation } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Place } from '@/types/place';
import { StarRating } from './StarRating';
import { Badge } from '@/components/ui/badge';

interface PlaceCardProps {
  place: Place;
  index?: number;
  onClick?: () => void;
}

export function PlaceCard({ place, index = 0, onClick }: PlaceCardProps) {
  const priceLabel = place.priceLevel ? '$'.repeat(place.priceLevel) : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      whileHover={{ y: -4 }}
      onClick={onClick}
      className="group cursor-pointer"
    >
      <div className="bg-card rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300">
        {/* Image */}
        <div className="relative h-48 overflow-hidden">
          <img
            src={place.image}
            alt={place.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent" />
          
          {/* Distance badge */}
          <div className="absolute top-3 right-3 bg-card/90 backdrop-blur-sm px-2.5 py-1 rounded-full flex items-center gap-1.5 text-sm font-medium">
            <Navigation className="h-3.5 w-3.5 text-primary" />
            {place.distance < 1 
              ? `${(place.distance * 1000).toFixed(0)}m` 
              : `${place.distance.toFixed(1)}km`}
          </div>

          {/* Open/Closed status */}
          {place.isOpen !== undefined && (
            <div className={cn(
              'absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-medium',
              place.isOpen 
                ? 'bg-teal/90 text-secondary-foreground' 
                : 'bg-muted text-muted-foreground'
            )}>
              {place.isOpen ? 'Open Now' : 'Closed'}
            </div>
          )}

          {/* Rating overlay */}
          <div className="absolute bottom-3 left-3">
            <StarRating 
              rating={place.rating} 
              reviewCount={place.reviewCount}
              size="sm"
              className="bg-card/90 backdrop-blur-sm px-2 py-1 rounded-full"
            />
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="font-display font-semibold text-lg leading-tight group-hover:text-primary transition-colors">
              {place.name}
            </h3>
            {priceLabel && (
              <span className="text-sm font-medium text-muted-foreground shrink-0">
                {priceLabel}
              </span>
            )}
          </div>

          <p className="text-sm text-muted-foreground flex items-center gap-1.5 mb-3">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{place.address}</span>
          </p>

          {place.openingHours && (
            <p className="text-xs text-muted-foreground flex items-center gap-1.5 mb-3">
              <Clock className="h-3 w-3 shrink-0" />
              {place.openingHours}
            </p>
          )}

          {place.tags && place.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {place.tags.slice(0, 3).map((tag) => (
                <Badge 
                  key={tag} 
                  variant="secondary" 
                  className="text-xs px-2 py-0.5 bg-muted text-muted-foreground"
                >
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
