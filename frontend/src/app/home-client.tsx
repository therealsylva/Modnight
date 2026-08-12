'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import ModGrid from '@/components/ModGrid';
import PluginDetailView from '@/components/PluginDetailView';
import AnnouncementModal from '@/components/AnnouncementModal';
import { useApp } from '@/components/AppContext';

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

  const { data: pluginsData, isLoading: pluginsLoading, error: pluginsError } = usePlugins({
    category: activeCategory,
    search: searchQuery || undefined,
    sort_by: sortBy,
    sort_order: 'desc',
  }, {
    fallbackData: { data: initialPlugins, total: initialPlugins.length, page: 1, per_page: 20, total_pages: 1 }
  });

  const { data: statsData } = usePluginStats();
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
      {/* pt-28 on mobile to account for header + search bar, md:pt-16 for desktop */}
      <main className="flex-1 pt-28 md:pt-16 md:pl-20 pb-8">
        <div className="w-full p-4 md:p-6 space-y-8">
          <motion.div
            className="bg-[#111112] border border-border p-4 md:p-6 w-full"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {/* Title row - stacked on mobile, side by side on desktop */}
            <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-6 gap-4">
              <div className="flex-1">
                <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                  Free Plugins, Mods & PC Tools — All in One Place
                </h1>
                <p className="text-muted-foreground text-sm">
                  Download free plugins, mods, and standalone PC utilities. Gaming tools, system utilities, productivity add-ons — completely free, no account needed.
                </p>
              </div>

              {/* Stats - row on mobile below title, row on desktop beside title */}
              <div className="flex gap-6 md:text-right">
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

            {/* Category filters - horizontal scroll on mobile */}
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none -mx-1 px-1">
              <button
                onClick={() => setActiveCategory('all')}
                className={`
                  flex-shrink-0 flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all
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
                    flex-shrink-0 flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all
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
    <HomePageContent
      initialPlugins={initialPlugins}
      initialStats={initialStats}
      initialCategories={initialCategories}
    />
  );
}
