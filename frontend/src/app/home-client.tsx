'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import NavigationRail from '@/components/NavigationRail';
import CommandCenter from '@/components/CommandCenter';
import ModGrid from '@/components/ModGrid';
import PluginDetailView from '@/components/PluginDetailView';
import CartPanel from '@/components/CartPanel';
import AnnouncementModal from '@/components/AnnouncementModal';
import { CartProvider } from '@/components/CartContext';
import { AppProvider, useApp } from '@/components/AppContext';

import { Flame, Star, Loader2 } from 'lucide-react';
import { usePlugins, usePluginStats, useCategories } from '@/hooks/use-plugins';
import type { Plugin, AnnouncementSettings, Category, PluginStats } from '@/types';

interface HomeClientProps {
  initialPlugins: Plugin[];
  initialStats: PluginStats;
  initialCategories: Category[];
}

function HomePageContent({ initialPlugins, initialStats, initialCategories }: HomeClientProps) {
  const [selectedPlugin, setSelectedPlugin] = useState<Plugin | null>(null);
  const [announcement, setAnnouncement] = useState<AnnouncementSettings | null>(null);
  const [showAnnouncement, setShowAnnouncement] = useState(false);
  const { activeNav, activeCategory, setActiveCategory, searchQuery } = useApp();

  const sortBy = activeNav === 'trending' ? 'likes' : 'downloads';

  const { data: pluginsData, isLoading: pluginsLoading, error: pluginsError, data: livePlugins } = usePlugins({
    category: activeCategory,
    search: searchQuery || undefined,
    sort_by: sortBy,
    sort_order: 'desc',
  }, { 
    fallbackData: { data: initialPlugins, total: initialPlugins.length, page: 1, per_page: 20, total_pages: 1 }
  });

  const { data: statsData, refetch: refetchStats } = usePluginStats();
  const { data: categoriesData } = useCategories();

  const stats = statsData?.data || initialStats;
  const categories = categoriesData?.data || initialCategories;

  const plugins = pluginsData?.data ?? initialPlugins;

  const handleDismissAnnouncement = () => {
    setShowAnnouncement(false);
    sessionStorage.setItem('announcement_dismissed', 'true');
  };

  const formatNumber = (num: number): string => {
    return num.toLocaleString();
  };

  const getFilterLabel = (id: string) => {
    if (id === 'all') return 'All Plugins';
    const cat = categories.find(c => c.id === id);
    return cat?.label ?? id;
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <NavigationRail />
      <CommandCenter />
      
      <main className="flex-1 pt-16 md:pt-16 md:pl-20 pb-8">
        <div className="w-full p-4 md:p-6 space-y-8">
          <motion.div
            className="bg-[#111112] border border-border p-6 w-full"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="flex items-start justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-2">
                  Discover Premium Plugins & Mods for Your Favorite Apps
                </h1>
                <p className="text-muted-foreground text-sm">
                  Browse thousands of high-quality add-ons, styled mods, and app plugins for gaming, productivity, and customization
                </p>
              </div>
              <div className="flex gap-6 text-center">
                <div>
                  <div className="text-2xl font-bold text-foreground font-mono">
                    {stats?.total_plugins.toLocaleString() ?? 0}
                  </div>
                  <div className="text-xs text-muted-foreground">Plugins</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-foreground font-mono">
                    {stats ? formatNumber(stats.total_downloads) : '0'}
                  </div>
                  <div className="text-xs text-muted-foreground">Downloads</div>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setActiveCategory('all')}
                className={`
                  flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all
                  ${activeCategory === 'all'
                    ? 'bg-primary text-foreground border border-border'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                  }
                `}
              >
                <Star className="w-4 h-4" />
                All Plugins
              </button>
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`
                    flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all
                    ${activeCategory === category.id
                      ? 'bg-primary text-foreground border border-border'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                    }
                  `}
                >
                  {category.label}
                  <span className="text-xs opacity-60">({category.count})</span>
                </button>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <div className="flex items-center gap-2 mb-4">
              <Flame className="w-5 h-5 text-foreground" />
              <h2 className="text-lg font-medium text-foreground">
                {searchQuery 
                  ? `Search results for "${searchQuery}"` 
                  : activeNav === 'trending' 
                    ? 'Trending Plugins' 
                    : activeCategory === 'all' 
                      ? 'All Plugins' 
                      : `${getFilterLabel(activeCategory)} Plugins`}
              </h2>
              <span className="text-sm text-muted-foreground ml-2">
                {plugins.length} results
              </span>
            </div>
            
            {pluginsLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              </div>
            ) : pluginsError ? (
              <div className="text-center py-20 text-muted-foreground">
                <p>Failed to load plugins. Please try again.</p>
              </div>
            ) : plugins.length === 0 ? (
              <div className="text-center py-20 text-muted-foreground">
                <p>{searchQuery ? 'No plugins found matching your search.' : 'No plugins found.'}</p>
              </div>
            ) : (
              <ModGrid plugins={plugins} onPluginClick={setSelectedPlugin} />
            )}
          </motion.div>
        </div>
      </main>

      <CartPanel />

      {selectedPlugin && (
        <PluginDetailView
          plugin={selectedPlugin}
          onClose={() => setSelectedPlugin(null)}
        />
      )}

      {announcement && (
        <AnnouncementModal
          isOpen={showAnnouncement}
          onClose={handleDismissAnnouncement}
          title={announcement.title}
          body={announcement.body}
          link={announcement.link}
        />
      )}
    </div>
  );
}

export default function HomeClient({ initialPlugins, initialStats, initialCategories }: HomeClientProps) {
  return (
    <AppProvider>
      <CartProvider>
        <HomePageContent 
          initialPlugins={initialPlugins}
          initialStats={initialStats}
          initialCategories={initialCategories}
        />
      </CartProvider>
    </AppProvider>
  );
}
