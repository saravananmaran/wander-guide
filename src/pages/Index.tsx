import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Header } from '@/components/Header';
import { Hero } from '@/components/Hero';
import { Footer } from '@/components/Footer';
import { CategoryCard } from '@/components/CategoryCard';
import { PlaceCard } from '@/components/PlaceCard';
import { SearchFilter } from '@/components/SearchFilter';
import { MapPlaceholder } from '@/components/MapPlaceholder';
import { ChatWidget } from '@/components/ChatWidget';
import { useLocation } from '@/hooks/useLocation';
import { usePlaces } from '@/hooks/usePlaces';
import { categories } from '@/data/mockPlaces';
import { CategoryType, FilterOptions } from '@/types/place';

const Index = () => {
  const { location, loading, error, requestLocation } = useLocation();
  const { data: allPlaces = [] } = usePlaces();
  const [selectedCategory, setSelectedCategory] = useState<CategoryType | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterOptions>({});

  // Filter and sort places
  const filteredPlaces = useMemo(() => {
    let places = [...allPlaces];

    // Filter by category
    if (selectedCategory) {
      places = places.filter((p) => p.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      places = places.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.address.toLowerCase().includes(query) ||
          p.tags?.some((t) => t.toLowerCase().includes(query))
      );
    }

    // Filter by max distance
    if (filters.maxDistance) {
      places = places.filter((p) => p.distance <= filters.maxDistance!);
    }

    // Filter by min rating
    if (filters.minRating) {
      places = places.filter((p) => p.rating >= filters.minRating!);
    }

    // Sort
    if (filters.sortBy) {
      switch (filters.sortBy) {
        case 'distance':
          places.sort((a, b) => a.distance - b.distance);
          break;
        case 'rating':
          places.sort((a, b) => b.rating - a.rating);
          break;
        case 'reviews':
          places.sort((a, b) => b.reviewCount - a.reviewCount);
          break;
      }
    }

    return places;
  }, [selectedCategory, searchQuery, filters, allPlaces]);

  // Count places per category
  const categoryCounts = useMemo(() => {
    const counts: Record<CategoryType, number> = {} as Record<CategoryType, number>;
    allPlaces.forEach((place) => {
      counts[place.category] = (counts[place.category] || 0) + 1;
    });
    return counts;
  }, [allPlaces]);

  const handleCategoryClick = (categoryId: CategoryType) => {
    setSelectedCategory(selectedCategory === categoryId ? null : categoryId);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main>
        {/* Hero Section */}
        <Hero
          location={location}
          loading={loading}
          error={error}
          onRequestLocation={requestLocation}
        />

        {/* Categories Section */}
        <section id="categories" className="container mx-auto px-4 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-8"
          >
            <h2 className="font-display text-2xl md:text-3xl font-bold mb-2">
              Explore by Category
            </h2>
            <p className="text-muted-foreground">
              Find exactly what you're looking for
            </p>
          </motion.div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 md:gap-4">
            {categories.map((category, index) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
              >
                <CategoryCard
                  category={category}
                  isSelected={selectedCategory === category.id}
                  onClick={() => handleCategoryClick(category.id)}
                  count={categoryCounts[category.id]}
                />
              </motion.div>
            ))}
          </div>
        </section>

        {/* Search & Filter + Places Section */}
        <section id="places" className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <SearchFilter
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              filters={filters}
              onFiltersChange={setFilters}
            />
          </div>

          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-display text-2xl md:text-3xl font-bold">
                {selectedCategory
                  ? categories.find((c) => c.id === selectedCategory)?.name
                  : 'Nearby Places'}
              </h2>
              <p className="text-muted-foreground">
                {filteredPlaces.length} places found
              </p>
            </div>
          </div>

          {filteredPlaces.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredPlaces.map((place, index) => (
                <PlaceCard key={place.id} place={place} index={index} />
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <p className="text-muted-foreground text-lg mb-4">
                No places found matching your criteria
              </p>
              <button
                onClick={() => {
                  setSelectedCategory(null);
                  setSearchQuery('');
                  setFilters({});
                }}
                className="text-primary hover:underline font-medium"
              >
                Clear all filters
              </button>
            </motion.div>
          )}
        </section>

        {/* Map Section */}
        <section id="map" className="container mx-auto px-4 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-8"
          >
            <h2 className="font-display text-2xl md:text-3xl font-bold mb-2">
              Explore the Map
            </h2>
            <p className="text-muted-foreground">
              See all places at a glance and get directions
            </p>
          </motion.div>

          <MapPlaceholder places={filteredPlaces} className="h-[400px] md:h-[500px]" />
        </section>
      </main>

      <Footer />
      <ChatWidget />
    </div>
  );
};

export default Index;
