import { useState } from 'react';
import { motion } from 'framer-motion';
import { Compass, Menu, X, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <motion.a
            href="/"
            className="flex items-center gap-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="p-2 bg-gradient-to-br from-coral to-sunset rounded-xl">
              <Compass className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-xl">TravelSpot</span>
          </motion.a>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <a href="#categories" className="text-muted-foreground hover:text-foreground transition-colors font-medium">
              Categories
            </a>
            <a href="#places" className="text-muted-foreground hover:text-foreground transition-colors font-medium">
              Nearby
            </a>
            <a href="#map" className="text-muted-foreground hover:text-foreground transition-colors font-medium">
              Map
            </a>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="hidden md:flex">
              <Search className="h-5 w-5" />
            </Button>
            <Button variant="coral" className="hidden md:flex">
              Get Started
            </Button>
            
            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden py-4 border-t border-border"
          >
            <nav className="flex flex-col gap-3">
              <a
                href="#categories"
                className="px-4 py-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Categories
              </a>
              <a
                href="#places"
                className="px-4 py-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Nearby Places
              </a>
              <a
                href="#map"
                className="px-4 py-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Map
              </a>
              <div className="pt-3 border-t border-border">
                <Button variant="coral" className="w-full">
                  Get Started
                </Button>
              </div>
            </nav>
          </motion.div>
        )}
      </div>
    </header>
  );
}
