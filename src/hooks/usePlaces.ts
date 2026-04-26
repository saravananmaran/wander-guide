import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Place } from '@/types/place';
import { mockPlaces } from '@/data/mockPlaces';

export function usePlaces() {
  return useQuery({
    queryKey: ['places'],
    queryFn: async (): Promise<Place[]> => {
      const { data, error } = await supabase
        .from('places')
        .select('*')
        .order('rating', { ascending: false });

      if (error) {
        console.warn('Failed to fetch places, using mock data:', error);
        return mockPlaces;
      }

      if (!data || data.length === 0) return mockPlaces;

      return data.map((row: any) => ({
        id: row.id,
        name: row.name,
        category: row.category,
        rating: Number(row.rating),
        reviewCount: row.review_count,
        distance: row.distance != null ? Number(row.distance) : 0,
        address: row.address ?? '',
        image: row.image ?? '',
        priceLevel: row.price_level ?? undefined,
        isOpen: row.is_open ?? true,
        openingHours: row.opening_hours ?? undefined,
        description: row.description ?? '',
        tags: row.tags ?? [],
      }));
    },
    staleTime: 5 * 60 * 1000,
  });
}
