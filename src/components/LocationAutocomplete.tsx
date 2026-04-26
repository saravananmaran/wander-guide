import { useEffect, useRef, useState } from 'react';
import { MapPin, Loader2 } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export type LocationSuggestion = {
  id: string;
  name: string;
  displayName: string;
  lat: number;
  lon: number;
};

interface LocationAutocompleteProps {
  id?: string;
  value: string;
  placeholder?: string;
  onChange: (value: string) => void;
  onSelect: (s: LocationSuggestion) => void;
  className?: string;
}

export function LocationAutocomplete({
  id,
  value,
  placeholder,
  onChange,
  onSelect,
  className,
}: LocationAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const skipNextFetch = useRef(false);

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  useEffect(() => {
    if (skipNextFetch.current) {
      skipNextFetch.current = false;
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (value.trim().length < 2) {
      setSuggestions([]);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const url = `https://nominatim.openstreetmap.org/search?format=json&limit=5&addressdetails=1&q=${encodeURIComponent(
          value + ', Chennai, India'
        )}`;
        const res = await fetch(url, { headers: { 'Accept-Language': 'en' } });
        const data = await res.json();
        if (Array.isArray(data)) {
          const mapped: LocationSuggestion[] = data.map((d: any) => {
            const parts = (d.display_name as string).split(',');
            return {
              id: d.place_id.toString(),
              name: parts[0].trim(),
              displayName: parts.slice(1, 4).join(',').trim(),
              lat: parseFloat(d.lat),
              lon: parseFloat(d.lon),
            };
          });
          setSuggestions(mapped);
          setOpen(true);
        }
      } catch {
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 350);
    return () => debounceRef.current && clearTimeout(debounceRef.current);
  }, [value]);

  const handlePick = (s: LocationSuggestion) => {
    skipNextFetch.current = true;
    onChange(s.name);
    onSelect(s);
    setOpen(false);
    setSuggestions([]);
  };

  return (
    <div ref={wrapRef} className={cn('relative', className)}>
      <Input
        id={id}
        autoComplete="off"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => suggestions.length > 0 && setOpen(true)}
      />
      {loading && (
        <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
      )}
      <AnimatePresence>
        {open && suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-lg overflow-hidden z-50 max-h-72 overflow-y-auto"
          >
            {suggestions.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => handlePick(s)}
                className="w-full flex items-start gap-2 px-3 py-2 hover:bg-muted/60 transition-colors text-left"
              >
                <MapPin className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{s.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{s.displayName}</p>
                </div>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
