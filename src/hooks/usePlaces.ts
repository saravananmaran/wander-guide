import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Place } from '@/types/place';
import { mockPlaces } from '@/data/mockPlaces';

export function usePlaces() {
  return useQuery({
    queryKey: ['places'],
    queryFn: async (): Promise<Place[]> => {
      try {
        const { data, error } = await supabase.functions.invoke('mongodb-api', {
          method: 'GET',
        });

        if (error) {
          console.warn('MongoDB fetch failed, using mock data:', error);
          return mockPlaces;
        }

        if (data?.places && data.places.length > 0) {
          // Map MongoDB documents to Place type
          return data.places.map((doc: any) => ({
            id: doc._id?.$oid || doc._id || String(Math.random()),
            name: doc.name,
            category: doc.category,
            rating: doc.rating,
            reviewCount: doc.reviewCount,
            distance: doc.distance,
            address: doc.address,
            image: doc.image,
            priceLevel: doc.priceLevel,
            isOpen: doc.isOpen,
            openingHours: doc.openingHours,
            description: doc.description,
            tags: doc.tags,
          }));
        }

        // Fallback to mock data if MongoDB is empty
        return mockPlaces;
      } catch (err) {
        console.warn('Error fetching from MongoDB, using mock data:', err);
        return mockPlaces;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
