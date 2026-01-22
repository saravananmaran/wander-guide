export type CategoryType = 
  | 'hotels' 
  | 'restaurants' 
  | 'hospitals' 
  | 'shops' 
  | 'theatres' 
  | 'parks' 
  | 'malls' 
  | 'guides';

export interface Place {
  id: string;
  name: string;
  category: CategoryType;
  rating: number;
  reviewCount: number;
  distance: number; // in km
  address: string;
  image: string;
  priceLevel?: number; // 1-4
  isOpen?: boolean;
  openingHours?: string;
  description?: string;
  tags?: string[];
}

export interface Category {
  id: CategoryType;
  name: string;
  icon: string;
  color: string;
  count?: number;
}

export interface UserLocation {
  latitude: number;
  longitude: number;
  city?: string;
  country?: string;
}

export interface FilterOptions {
  category?: CategoryType;
  minRating?: number;
  maxDistance?: number;
  sortBy?: 'distance' | 'rating' | 'reviews';
  priceLevel?: number[];
  isOpen?: boolean;
}
