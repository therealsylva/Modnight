'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Command, Menu, X, ShoppingCart, Palette, Newspaper } from 'lucide-react';
import { useApp } from './AppContext';
import { useCart } from './CartContext';
import { useRouter } from 'next/navigation';

export default function CommandCenter() {
  const { searchQuery, setSearchQuery, isMobileMenuOpen, setIsMobileMenuOpen, setActiveNav } = useApp();
  const { itemCount, toggleCart } = useCart();
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (e.key === 'Escape') {
        inputRef.current?.blur();
        setSearchQuery('');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setSearchQuery]);

  const handleNavClick = (nav?: 'home' | 'trending') => {
    if (nav) setActiveNav(nav);
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}
      </AnimatePresence>

      <motion.div
        className="fixed top-0 left-0 right-0 z-50 md:left-20 md:right-0 bg-[#0B0C0C]/95 backdrop-blur-md border-b border-border"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center justify-between h-16 px-4 md:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 hover:bg-accent rounded-lg transition-colors"
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
            
            <div className="hidden md:flex items-center gap-2">
              <Search className="w-4 h-4 text-muted-foreground" />
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search mods, plugins, creators..."
                className="w-64 lg:w-96 bg-transparent outline-none text-sm font-medium placeholder:text-muted-foreground/50"
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
              />
              <div className="flex items-center gap-1 px-2 py-1 bg-muted rounded border border-border">
                <Command className="w-3 h-3 text-muted-foreground" />
                <span className="text-[10px] text-muted-foreground font-mono">K</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={toggleCart}
              className="relative p-2 hover:bg-accent rounded-lg transition-colors"
            >
              <ShoppingCart className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-foreground text-background text-[10px] font-bold flex items-center justify-center rounded-full">
                  {itemCount > 99 ? '99+' : itemCount}
                </span>
              )}
            </button>
          </div>
        </div>

        <div className="md:hidden px-4 pb-3">
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search mods, plugins, creators..."
            className="w-full px-4 py-2.5 bg-[#111112] border border-border rounded-lg outline-none text-sm font-medium placeholder:text-muted-foreground/50"
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
          />
        </div>
      </motion.div>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            className="fixed left-0 top-0 h-screen w-64 bg-[#0F0F10] border-r border-border z-50 md:hidden"
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          >
            <nav className="flex flex-col h-full py-4 pt-20">
              <div className="px-3 mb-8">
                <img src="/logo.svg" alt="Logo" className="h-9 w-9" />
              </div>
              <div className="flex-1 flex flex-col gap-1 px-2">
                <button
                  onClick={() => handleNavClick('home')}
                  className="flex items-center gap-3 px-4 py-3 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  <span className="font-medium text-sm">Home</span>
                </button>
                <button
                  onClick={() => handleNavClick('trending')}
                  className="flex items-center gap-3 px-4 py-3 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                  </svg>
                  <span className="font-medium text-sm">Trending</span>
                </button>
                <button
                  onClick={() => { toggleCart(); setIsMobileMenuOpen(false); }}
                  className="flex items-center gap-3 px-4 py-3 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors"
                >
                  <div className="relative">
                    <ShoppingCart className="w-5 h-5" />
                    {itemCount > 0 && (
                      <span className="absolute -top-2 -right-2 min-w-[18px] h-[18px] px-1 bg-foreground text-background text-[10px] font-bold flex items-center justify-center rounded-full">
                        {itemCount > 99 ? '99+' : itemCount}
                      </span>
                    )}
                  </div>
                  <span className="font-medium text-sm">Queue{itemCount > 0 ? ` (${itemCount})` : ''}</span>
                </button>
                <button
                  onClick={() => { router.push('/become-a-creator'); setIsMobileMenuOpen(false); }}
                  className="flex items-center gap-3 px-4 py-3 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors"
                >
                  <Palette className="w-5 h-5" />
                  <span className="font-medium text-sm">Become a Creator</span>
                </button>
                <div className="flex items-center gap-3 px-4 py-3 text-muted-foreground/40 cursor-not-allowed">
                  <Newspaper className="w-5 h-5" />
                  <span className="font-medium text-sm">News & Updates</span>
                  <span className="text-[10px] font-medium px-1.5 py-0.5 bg-muted border border-border text-muted-foreground ml-auto">
                    soon
                  </span>
                </div>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
