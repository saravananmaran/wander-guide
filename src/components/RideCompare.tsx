import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Bike, Car, Clock, IndianRupee, MapPin, ArrowRight, Loader2, Navigation } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLocation } from '@/hooks/useLocation';
import { toast } from 'sonner';
import { LocationAutocomplete, type LocationSuggestion } from './LocationAutocomplete';

type RideOption = {
  provider: 'Rapido' | 'Uber';
  type: string;
  icon: 'bike' | 'car';
  baseFare: number;
  perKm: number;
  perMin: number;
  avgSpeedKmh: number;
  surge: number;
};

const RIDE_OPTIONS: RideOption[] = [
  { provider: 'Rapido', type: 'Bike', icon: 'bike', baseFare: 15, perKm: 6, perMin: 1, avgSpeedKmh: 28, surge: 1.0 },
  { provider: 'Rapido', type: 'Auto', icon: 'car', baseFare: 25, perKm: 12, perMin: 1.2, avgSpeedKmh: 22, surge: 1.0 },
  { provider: 'Uber', type: 'Moto', icon: 'bike', baseFare: 20, perKm: 7, perMin: 1, avgSpeedKmh: 28, surge: 1.1 },
  { provider: 'Uber', type: 'Auto', icon: 'car', baseFare: 30, perKm: 13, perMin: 1.3, avgSpeedKmh: 22, surge: 1.1 },
  { provider: 'Uber', type: 'Go', icon: 'car', baseFare: 50, perKm: 16, perMin: 1.5, avgSpeedKmh: 25, surge: 1.15 },
];

function estimate(distanceKm: number, opt: RideOption) {
  const minutes = (distanceKm / opt.avgSpeedKmh) * 60;
  const raw = (opt.baseFare + opt.perKm * distanceKm + opt.perMin * minutes) * opt.surge;
  const fare = Math.max(opt.baseFare + 10, Math.round(raw));
  return { fare, etaMin: Math.max(3, Math.round(minutes)), pickupMin: 2 + Math.floor(Math.random() * 5) };
}

function haversineKm(a: { lat: number; lon: number }, b: { lat: number; lon: number }) {
  const R = 6371;
  const toRad = (x: number) => (x * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

async function geocode(query: string): Promise<{ lat: number; lon: number; label: string } | null> {
  // Bias results to Chennai region
  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(
    query + ', Chennai, India'
  )}`;
  const res = await fetch(url, { headers: { 'Accept-Language': 'en' } });
  if (!res.ok) return null;
  const data = await res.json();
  if (!Array.isArray(data) || data.length === 0) return null;
  return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon), label: data[0].display_name };
}

export function RideCompare() {
  const { location } = useLocation();
  const [pickup, setPickup] = useState('');
  const [drop, setDrop] = useState('');
  const [pickupCoords, setPickupCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [dropCoords, setDropCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [usedCurrentLocation, setUsedCurrentLocation] = useState(false);

  const results = useMemo(() => {
    if (distance == null) return [];
    return RIDE_OPTIONS.map((opt) => ({ opt, ...estimate(distance, opt) })).sort((a, b) => a.fare - b.fare);
  }, [distance]);

  const cheapest = results[0];

  const handleCompare = async () => {
    if (!drop.trim()) {
      toast.error('Enter a drop location');
      return;
    }
    setLoading(true);
    setDistance(null);
    try {
      let pCoords: { lat: number; lon: number } | null = pickupCoords;
      if (pickup.trim()) {
        if (!pCoords) {
          const g = await geocode(pickup);
          if (!g) {
            toast.error('Could not find pickup location');
            setLoading(false);
            return;
          }
          pCoords = { lat: g.lat, lon: g.lon };
        }
        setUsedCurrentLocation(false);
      } else if (location) {
        pCoords = { lat: location.latitude, lon: location.longitude };
        setUsedCurrentLocation(true);
      } else {
        toast.error('Enter a pickup or enable location');
        setLoading(false);
        return;
      }

      let dCoords = dropCoords;
      if (!dCoords) {
        const dropG = await geocode(drop);
        if (!dropG) {
          toast.error('Could not find drop location');
          setLoading(false);
          return;
        }
        dCoords = { lat: dropG.lat, lon: dropG.lon };
      }

      const km = haversineKm(pCoords, dCoords);
      const adjusted = Math.max(0.5, +(km * 1.2).toFixed(1));
      setDistance(adjusted);
    } catch (e) {
      toast.error('Failed to calculate distance');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="overflow-hidden border-2">
      <CardHeader className="bg-gradient-to-r from-coral/10 to-teal/10">
        <CardTitle className="font-display text-2xl flex items-center gap-2">
          <Car className="h-6 w-6 text-coral" />
          Compare Rides: Rapido vs Uber
        </CardTitle>
        <CardDescription>
          Live fare estimates — distance auto-calculated from your pickup & drop. Prices are indicative.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="pickup" className="flex items-center gap-1">
              <MapPin className="h-3 w-3 text-teal" /> Pickup{' '}
              <span className="text-xs text-muted-foreground">(leave blank to use current location)</span>
            </Label>
            <LocationAutocomplete
              id="pickup"
              placeholder="e.g. MG Road, T Nagar"
              value={pickup}
              onChange={(v) => { setPickup(v); setPickupCoords(null); }}
              onSelect={(s: LocationSuggestion) => setPickupCoords({ lat: s.lat, lon: s.lon })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="drop" className="flex items-center gap-1">
              <MapPin className="h-3 w-3 text-coral" /> Drop
            </Label>
            <LocationAutocomplete
              id="drop"
              placeholder="e.g. Chennai Airport"
              value={drop}
              onChange={(v) => { setDrop(v); setDropCoords(null); }}
              onSelect={(s: LocationSuggestion) => setDropCoords({ lat: s.lat, lon: s.lon })}
            />
          </div>
        </div>
        </div>

        <Button
          variant="hero"
          size="lg"
          className="w-full md:w-auto"
          onClick={handleCompare}
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Calculating…
            </>
          ) : (
            <>
              Compare Fares <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>

        {distance != null && results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h3 className="font-semibold text-lg">Available rides</h3>
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <Navigation className="h-3 w-3" />
                {distance} km {usedCurrentLocation && '(from current location)'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {results.map(({ opt, fare, etaMin, pickupMin }) => {
                const isCheapest = opt === cheapest.opt;
                const Icon = opt.icon === 'bike' ? Bike : Car;
                const providerColor = opt.provider === 'Rapido' ? 'text-yellow-600' : 'text-foreground';
                return (
                  <motion.div
                    key={`${opt.provider}-${opt.type}`}
                    whileHover={{ y: -2 }}
                    className={`relative rounded-xl border-2 p-4 transition-colors ${
                      isCheapest ? 'border-teal bg-teal/5' : 'border-border bg-card'
                    }`}
                  >
                    {isCheapest && (
                      <Badge className="absolute -top-2 -right-2 bg-teal text-secondary-foreground">
                        Best price
                      </Badge>
                    )}
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className={`font-bold ${providerColor}`}>{opt.provider}</div>
                        <div className="text-sm text-muted-foreground flex items-center gap-1">
                          <Icon className="h-3 w-3" /> {opt.type}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-display text-2xl font-bold flex items-center justify-end">
                          <IndianRupee className="h-5 w-5" />
                          {fare}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground border-t pt-2">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {etaMin} min ride
                      </span>
                      <span>{pickupMin} min away</span>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            <p className="text-xs text-muted-foreground italic">
              * Distance from OpenStreetMap (straight-line + 20% road buffer). Fares use mock pricing models — actual fares depend on real-time surge, tolls, and route.
            </p>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}
