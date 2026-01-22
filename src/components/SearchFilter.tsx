import { useState } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FilterOptions } from '@/types/place';

interface SearchFilterProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
}

export function SearchFilter({
  searchQuery,
  onSearchChange,
  filters,
  onFiltersChange,
}: SearchFilterProps) {
  const [showFilters, setShowFilters] = useState(false);

  const handleSortChange = (value: string) => {
    onFiltersChange({ ...filters, sortBy: value as FilterOptions['sortBy'] });
  };

  const handleDistanceChange = (value: number[]) => {
    onFiltersChange({ ...filters, maxDistance: value[0] });
  };

  const handleRatingChange = (value: number[]) => {
    onFiltersChange({ ...filters, minRating: value[0] });
  };

  const clearFilters = () => {
    onFiltersChange({});
    onSearchChange('');
  };

  const hasActiveFilters = filters.sortBy || filters.maxDistance || filters.minRating || searchQuery;

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search places, restaurants, hotels..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 h-12 rounded-xl bg-card border-border shadow-card"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <Button
          variant={showFilters ? 'default' : 'outline'}
          size="lg"
          onClick={() => setShowFilters(!showFilters)}
          className="h-12 px-4 rounded-xl"
        >
          <SlidersHorizontal className="h-4 w-4" />
          <span className="hidden sm:inline ml-2">Filters</span>
        </Button>
      </div>

      {/* Expandable Filters */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="bg-card rounded-2xl p-5 shadow-card space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                {/* Sort By */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Sort By</Label>
                  <Select value={filters.sortBy || ''} onValueChange={handleSortChange}>
                    <SelectTrigger className="h-10 rounded-lg">
                      <SelectValue placeholder="Select..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="distance">Distance (Nearest)</SelectItem>
                      <SelectItem value="rating">Rating (Highest)</SelectItem>
                      <SelectItem value="reviews">Reviews (Most)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Max Distance */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    Max Distance: {filters.maxDistance || 5} km
                  </Label>
                  <Slider
                    value={[filters.maxDistance || 5]}
                    onValueChange={handleDistanceChange}
                    min={0.5}
                    max={10}
                    step={0.5}
                    className="py-2"
                  />
                </div>

                {/* Min Rating */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    Min Rating: {filters.minRating || 0}★
                  </Label>
                  <Slider
                    value={[filters.minRating || 0]}
                    onValueChange={handleRatingChange}
                    min={0}
                    max={5}
                    step={0.5}
                    className="py-2"
                  />
                </div>
              </div>

              {hasActiveFilters && (
                <div className="flex justify-end pt-2 border-t border-border">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-3 w-3 mr-1" />
                    Clear all filters
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
