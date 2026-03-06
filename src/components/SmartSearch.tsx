import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, MapPin, Loader2, X, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';

export interface SearchResult {
  id: string;
  name: string;
  displayName: string;
  lat: number;
  lon: number;
  type: 'place' | 'ai';
}

interface SmartSearchProps {
  onSelectResult: (result: SearchResult) => void;
  onSearchChange: (query: string) => void;
  searchQuery: string;
  className?: string;
}

export function SmartSearch({ onSelectResult, onSearchChange, searchQuery, className }: SmartSearchProps) {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [aiSuggestion, setAiSuggestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const searchNominatim = useCallback(async (query: string) => {
    if (query.length < 3) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query + ' Chennai')}&limit=6&addressdetails=1`,
        { headers: { 'User-Agent': 'ChennaiSpot/1.0', 'Accept-Language': 'en' } }
      );
      const data = await res.json();
      const mapped: SearchResult[] = data.map((item: any) => ({
        id: item.place_id.toString(),
        name: item.display_name.split(',')[0],
        displayName: item.display_name.split(',').slice(0, 3).join(', '),
        lat: parseFloat(item.lat),
        lon: parseFloat(item.lon),
        type: 'place' as const,
      }));
      setResults(mapped);
      setShowDropdown(true);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const getAiSuggestion = useCallback(async (query: string) => {
    if (query.length < 3) {
      setAiSuggestion('');
      return;
    }
    setAiLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('chat', {
        body: {
          messages: [
            {
              role: 'user',
              content: `In one short sentence (max 20 words), suggest the best place in Chennai for: "${query}". Just the recommendation, no explanation.`,
            },
          ],
        },
      });

      if (error) throw error;

      // Handle streaming response
      if (data instanceof ReadableStream) {
        const reader = data.getReader();
        const decoder = new TextDecoder();
        let text = '';
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          for (const line of chunk.split('\n')) {
            if (!line.startsWith('data: ') || line.includes('[DONE]')) continue;
            try {
              const parsed = JSON.parse(line.slice(6));
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) text += content;
            } catch {}
          }
        }
        setAiSuggestion(text.trim());
      } else if (typeof data === 'string') {
        setAiSuggestion(data.trim());
      }
    } catch {
      setAiSuggestion('');
    } finally {
      setAiLoading(false);
    }
  }, []);

  const handleInputChange = (value: string) => {
    onSearchChange(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      searchNominatim(value);
      getAiSuggestion(value);
    }, 400);
  };

  const handleSelect = (result: SearchResult) => {
    onSearchChange(result.name);
    onSelectResult(result);
    setShowDropdown(false);
  };

  return (
    <div ref={wrapperRef} className={cn('relative', className)}>
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search places, landmarks, restaurants in Chennai..."
          value={searchQuery}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => results.length > 0 && setShowDropdown(true)}
          className="pl-12 pr-10 h-14 rounded-2xl bg-card border-border shadow-card text-base"
        />
        {loading && (
          <Loader2 className="absolute right-10 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
        )}
        {searchQuery && (
          <button
            onClick={() => { onSearchChange(''); setResults([]); setAiSuggestion(''); setShowDropdown(false); }}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <AnimatePresence>
        {showDropdown && (results.length > 0 || aiSuggestion || aiLoading) && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-2xl shadow-lg overflow-hidden z-50"
          >
            {/* AI Suggestion */}
            {(aiSuggestion || aiLoading) && (
              <div className="px-4 py-3 bg-primary/5 border-b border-border">
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <span className="text-xs font-semibold text-primary">AI Suggestion</span>
                </div>
                {aiLoading ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    <span>Thinking...</span>
                  </div>
                ) : (
                  <p className="text-sm text-foreground">{aiSuggestion}</p>
                )}
              </div>
            )}

            {/* Map Results */}
            <div className="max-h-[280px] overflow-y-auto">
              {results.map((result) => (
                <button
                  key={result.id}
                  onClick={() => handleSelect(result)}
                  className="w-full flex items-start gap-3 px-4 py-3 hover:bg-muted/50 transition-colors text-left"
                >
                  <MapPin className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{result.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{result.displayName}</p>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
