'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

type NavView = 'home' | 'trending';

interface AppContextType {
  activeNav: NavView;
  setActiveNav: (nav: NavView) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  activeCategory: string;
  setActiveCategory: (category: string) => void;
  resetFilters: () => void;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [activeNav, setActiveNav] = useState<NavView>('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const resetFilters = () => {
    setSearchQuery('');
    setActiveCategory('all');
  };

  const handleSetActiveNav = (nav: NavView) => {
    setActiveNav(nav);
    resetFilters();
  };

  return (
    <AppContext.Provider value={{
      activeNav,
      setActiveNav: handleSetActiveNav,
      searchQuery,
      setSearchQuery,
      activeCategory,
      setActiveCategory,
      resetFilters,
      isMobileMenuOpen,
      setIsMobileMenuOpen,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
