import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;
  reviewCount?: number;
  className?: string;
}

export function StarRating({
  rating,
  maxRating = 5,
  size = 'md',
  showValue = true,
  reviewCount,
  className,
}: StarRatingProps) {
  const sizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  };

  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  return (
    <div className={cn('flex items-center gap-1', className)}>
      <div className="flex items-center">
        {Array.from({ length: maxRating }).map((_, index) => {
          const fillPercentage = Math.min(Math.max(rating - index, 0), 1) * 100;
          
          return (
            <div key={index} className="relative">
              <Star
                className={cn(sizes[size], 'text-muted stroke-muted-foreground/30')}
                fill="currentColor"
              />
              <div
                className="absolute inset-0 overflow-hidden"
                style={{ width: `${fillPercentage}%` }}
              >
                <Star
                  className={cn(sizes[size], 'text-gold')}
                  fill="currentColor"
                />
              </div>
            </div>
          );
        })}
      </div>
      {showValue && (
        <span className={cn('font-semibold text-foreground', textSizes[size])}>
          {rating.toFixed(1)}
        </span>
      )}
      {reviewCount !== undefined && (
        <span className={cn('text-muted-foreground', textSizes[size])}>
          ({reviewCount.toLocaleString()})
        </span>
      )}
    </div>
  );
}
