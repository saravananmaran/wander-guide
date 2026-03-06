import { useState, useEffect, useCallback } from 'react';
import { UserLocation } from '@/types/place';

interface UseLocationReturn {
  location: UserLocation | null;
  loading: boolean;
  error: string | null;
  requestLocation: () => void;
}

export function useLocation(): UseLocationReturn {
  const [location, setLocation] = useState<UserLocation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        // Try to get city name from reverse geocoding (mock for now)
        const mockCity = 'Chennai';
        const mockCountry = 'India';
        
        setLocation({
          latitude,
          longitude,
          city: mockCity,
          country: mockCountry,
        });
        setLoading(false);
      },
      (err) => {
        let errorMessage = 'Failed to get your location';
        switch (err.code) {
          case err.PERMISSION_DENIED:
            errorMessage = 'Location permission denied. Please enable location access.';
            break;
          case err.POSITION_UNAVAILABLE:
            errorMessage = 'Location information unavailable';
            break;
          case err.TIMEOUT:
            errorMessage = 'Location request timed out';
            break;
        }
        setError(errorMessage);
        setLoading(false);
        
        // Set a default location for demo purposes
        setLocation({
          latitude: 13.0827,
          longitude: 80.2707,
          city: 'Chennai',
          country: 'India',
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // 5 minutes
      }
    );
  }, []);

  useEffect(() => {
    // Automatically request location on mount
    requestLocation();
  }, [requestLocation]);

  return { location, loading, error, requestLocation };
}
