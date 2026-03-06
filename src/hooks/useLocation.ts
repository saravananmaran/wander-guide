import { useState, useEffect, useCallback } from 'react';
import { UserLocation } from '@/types/place';

interface UseLocationReturn {
  location: UserLocation | null;
  loading: boolean;
  error: string | null;
  requestLocation: () => void;
}

async function reverseGeocode(lat: number, lon: number): Promise<{ city: string; country: string }> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=10&addressdetails=1`,
      {
        headers: {
          'Accept-Language': 'en',
          'User-Agent': 'ChennaiSpot/1.0',
        },
      }
    );
    if (!response.ok) throw new Error('Geocoding failed');
    const data = await response.json();
    const address = data.address || {};
    const city = address.city || address.town || address.village || address.county || 'Unknown';
    const country = address.country || 'Unknown';
    return { city, country };
  } catch {
    return { city: 'Chennai', country: 'India' };
  }
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
        const { city, country } = await reverseGeocode(latitude, longitude);
        
        setLocation({ latitude, longitude, city, country });
        setLoading(false);
      },
      async (err) => {
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
        
        // Default to Chennai
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
        maximumAge: 300000,
      }
    );
  }, []);

  useEffect(() => {
    requestLocation();
  }, [requestLocation]);

  return { location, loading, error, requestLocation };
}
