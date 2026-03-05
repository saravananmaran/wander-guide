import { motion } from 'framer-motion';
import { MapPin, Loader2, RefreshCw, Compass } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { UserLocation } from '@/types/place';

interface HeroProps {
  location: UserLocation | null;
  loading: boolean;
  error: string | null;
  onRequestLocation: () => void;
}

export function Hero({ location, loading, error, onRequestLocation }: HeroProps) {
  return (
    <section className="relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-hero opacity-10" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-coral/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-teal/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

      <div className="relative container mx-auto px-4 py-12 md:py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto"
        >
          {/* Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="inline-flex items-center justify-center mb-6"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 rounded-2xl blur-xl animate-pulse-soft" />
              <div className="relative bg-gradient-hero p-4 rounded-2xl shadow-glow">
                <Compass className="h-8 w-8 text-primary-foreground" />
              </div>
            </div>
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="font-display text-4xl md:text-5xl lg:text-6xl font-extrabold mb-4"
          >
            Discover{' '}
            <span className="text-gradient">Amazing Places</span>
            <br />in Chennai
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-lg md:text-xl text-muted-foreground mb-8 max-w-xl mx-auto"
          >
            Explore the best hotels, restaurants, temples, and more across Chennai — the Gateway to South India.
          </motion.p>

          {/* Location Display */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            className="inline-flex flex-col sm:flex-row items-center gap-3 bg-card rounded-2xl px-6 py-4 shadow-card"
          >
            {loading ? (
              <div className="flex items-center gap-3 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                <span>Detecting your location...</span>
              </div>
            ) : location ? (
              <>
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-primary/10 rounded-full">
                    <MapPin className="h-5 w-5 text-primary" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-foreground">{location.city}</p>
                    <p className="text-sm text-muted-foreground">{location.country}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onRequestLocation}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Update
                </Button>
              </>
            ) : error ? (
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <p className="text-sm text-muted-foreground">{error}</p>
                <Button variant="coral" size="sm" onClick={onRequestLocation}>
                  <MapPin className="h-4 w-4 mr-1" />
                  Enable Location
                </Button>
              </div>
            ) : null}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
