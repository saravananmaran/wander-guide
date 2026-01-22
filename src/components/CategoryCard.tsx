import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Category } from '@/types/place';

interface CategoryCardProps {
  category: Category;
  isSelected?: boolean;
  onClick?: () => void;
  count?: number;
}

export function CategoryCard({ category, isSelected, onClick, count }: CategoryCardProps) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.05, y: -2 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        'flex flex-col items-center justify-center gap-2 p-4 rounded-2xl transition-all duration-200',
        'min-w-[100px] min-h-[100px] md:min-w-[120px] md:min-h-[110px]',
        'shadow-card hover:shadow-card-hover',
        isSelected
          ? 'bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2'
          : 'bg-card text-card-foreground hover:bg-muted/50'
      )}
    >
      <span className="text-3xl md:text-4xl">{category.icon}</span>
      <span className="font-medium text-sm text-center leading-tight">{category.name}</span>
      {count !== undefined && (
        <span className={cn(
          'text-xs px-2 py-0.5 rounded-full',
          isSelected ? 'bg-primary-foreground/20' : 'bg-muted text-muted-foreground'
        )}>
          {count} nearby
        </span>
      )}
    </motion.button>
  );
}
