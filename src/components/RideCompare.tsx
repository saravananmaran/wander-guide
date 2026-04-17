import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Bike, Car, Clock, IndianRupee, MapPin, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

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

// Mock fare models (approx. Indian metro pricing)
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
  return { fare, etaMin: Math.max(3, Math.round(minutes)), pickupMin: Math.round(2 + Math.random() * 4) };
}

export function RideCompare() {
  const [pickup, setPickup] = useState('');
  const [drop, setDrop] = useState('');
  const [distance, setDistance] = useState<number>(5);
  const [submitted, setSubmitted] = useState(false);

  const results = useMemo(() => {
    return RIDE_OPTIONS.map((opt) => ({ opt, ...estimate(distance, opt) })).sort((a, b) => a.fare - b.fare);
  }, [distance]);

  const cheapest = results[0];

  return (
    <Card className="overflow-hidden border-2">
      <CardHeader className="bg-gradient-to-r from-coral/10 to-teal/10">
        <CardTitle className="font-display text-2xl flex items-center gap-2">
          <Car className="h-6 w-6 text-coral" />
          Compare Rides: Rapido vs Uber
        </CardTitle>
        <CardDescription>
          Get instant fare estimates for your trip. Prices are indicative and may vary with surge & traffic.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="pickup" className="flex items-center gap-1">
              <MapPin className="h-3 w-3 text-teal" /> Pickup
            </Label>
            <Input
              id="pickup"
              placeholder="e.g. MG Road"
              value={pickup}
              onChange={(e) => setPickup(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="drop" className="flex items-center gap-1">
              <MapPin className="h-3 w-3 text-coral" /> Drop
            </Label>
            <Input
              id="drop"
              placeholder="e.g. Airport"
              value={drop}
              onChange={(e) => setDrop(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="distance">Distance (km)</Label>
            <Input
              id="distance"
              type="number"
              min={0.5}
              step={0.5}
              value={distance}
              onChange={(e) => setDistance(Math.max(0.5, Number(e.target.value) || 0))}
            />
          </div>
        </div>

        <Button
          variant="hero"
          size="lg"
          className="w-full md:w-auto"
          onClick={() => setSubmitted(true)}
        >
          Compare Fares <ArrowRight className="h-4 w-4" />
        </Button>

        {submitted && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-lg">Available rides</h3>
              <span className="text-sm text-muted-foreground">{distance} km trip</span>
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
              * Estimates use mock pricing models. Actual fares depend on real-time surge, tolls, and route.
            </p>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}
