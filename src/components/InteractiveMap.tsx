import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Place, UserLocation } from '@/types/place';
import { cn } from '@/lib/utils';

// Fix default marker icons for Leaflet + bundlers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const userIcon = new L.DivIcon({
  html: `<div style="
    width: 20px; height: 20px;
    background: hsl(221 83% 53%);
    border: 3px solid white;
    border-radius: 50%;
    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
  "></div>`,
  className: '',
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

const placeIcon = new L.DivIcon({
  html: `<div style="
    width: 28px; height: 28px;
    background: hsl(var(--primary));
    border: 2px solid white;
    border-radius: 50% 50% 50% 0;
    transform: rotate(-45deg);
    box-shadow: 0 2px 6px rgba(0,0,0,0.3);
    display: flex; align-items: center; justify-content: center;
  "><div style="
    width: 8px; height: 8px;
    background: white;
    border-radius: 50%;
  "></div></div>`,
  className: '',
  iconSize: [28, 28],
  iconAnchor: [14, 28],
  popupAnchor: [0, -28],
});

const searchIcon = new L.DivIcon({
  html: `<div style="
    width: 32px; height: 32px;
    background: hsl(0, 84%, 60%);
    border: 3px solid white;
    border-radius: 50% 50% 50% 0;
    transform: rotate(-45deg);
    box-shadow: 0 3px 10px rgba(0,0,0,0.4);
    display: flex; align-items: center; justify-content: center;
  "><div style="
    width: 10px; height: 10px;
    background: white;
    border-radius: 50%;
  "></div></div>`,
  className: '',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

function RecenterMap({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], map.getZoom());
  }, [lat, lng, map]);
  return null;
}

interface InteractiveMapProps {
  places: Place[];
  userLocation: UserLocation | null;
  searchedLocation?: { lat: number; lng: number; name: string } | null;
  className?: string;
}

export function InteractiveMap({ places, userLocation, searchedLocation, className }: InteractiveMapProps) {
  const center: [number, number] = searchedLocation
    ? [searchedLocation.lat, searchedLocation.lng]
    : userLocation
      ? [userLocation.latitude, userLocation.longitude]
      : [13.0827, 80.2707];

  // Generate pseudo lat/lng for places based on distance
  const placePositions = places.map((place, i) => {
    const angle = (i / places.length) * 2 * Math.PI + (i * 0.5);
    const dist = place.distance * 0.009;
    return {
      place,
      lat: center[0] + Math.cos(angle) * dist,
      lng: center[1] + Math.sin(angle) * dist,
    };
  });

  return (
    <div className={cn('rounded-2xl overflow-hidden border border-border shadow-card', className)}>
      <MapContainer
        center={center}
        zoom={14}
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%', minHeight: '400px' }}
        className="z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <RecenterMap lat={center[0]} lng={center[1]} />

        {userLocation && (
          <>
            <Marker position={[userLocation.latitude, userLocation.longitude]} icon={userIcon}>
              <Popup>
                <div className="text-center">
                  <p className="font-semibold text-sm">📍 You are here</p>
                  <p className="text-xs text-gray-500">{userLocation.city}, {userLocation.country}</p>
                </div>
              </Popup>
            </Marker>
            <Circle
              center={[userLocation.latitude, userLocation.longitude]}
              radius={500}
              pathOptions={{
                color: 'hsl(221, 83%, 53%)',
                fillColor: 'hsl(221, 83%, 53%)',
                fillOpacity: 0.08,
                weight: 1,
              }}
            />
          </>
        )}

        {searchedLocation && (
          <Marker position={[searchedLocation.lat, searchedLocation.lng]} icon={searchIcon}>
            <Popup>
              <div className="text-center">
                <p className="font-semibold text-sm">🔍 {searchedLocation.name}</p>
              </div>
            </Popup>
          </Marker>
        )}

        {placePositions.map(({ place, lat, lng }) => (
          <Marker key={place.id} position={[lat, lng]} icon={placeIcon}>
            <Popup>
              <div className="min-w-[180px]">
                <img
                  src={place.image}
                  alt={place.name}
                  className="w-full h-24 object-cover rounded-md mb-2"
                />
                <h3 className="font-semibold text-sm">{place.name}</h3>
                <p className="text-xs text-gray-500 mb-1">{place.address}</p>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-yellow-500">★ {place.rating}</span>
                  <span className="text-gray-400">·</span>
                  <span className="text-gray-500">{place.distance} km away</span>
                </div>
                {place.isOpen !== undefined && (
                  <span className={`text-xs font-medium mt-1 inline-block ${place.isOpen ? 'text-green-600' : 'text-red-500'}`}>
                    {place.isOpen ? '● Open' : '● Closed'}
                  </span>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
