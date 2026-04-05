'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import ModCard from './ModCard';
import type { Plugin } from '@/types';

const PAGE_SIZE = 50;

interface ModGridProps {
  plugins: Plugin[];
  onPluginClick?: (plugin: Plugin) => void;
}

export default function ModGrid({ plugins, onPluginClick }: ModGridProps) {
  const [page, setPage] = useState(1);

  // Reset to page 1 whenever the plugin list changes (search/filter)
  useEffect(() => { setPage(1); }, [plugins]);

  const totalPages = Math.max(1, Math.ceil(plugins.length / PAGE_SIZE));
  const start = (page - 1) * PAGE_SIZE;
  const visible = plugins.slice(start, start + PAGE_SIZE);

  const goTo = (p: number) => {
    setPage(p);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Build page number list with ellipsis
  const pageNumbers = (): (number | '...')[] => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages: (number | '...')[] = [1];
    if (page > 3) pages.push('...');
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) pages.push(i);
    if (page < totalPages - 2) pages.push('...');
    pages.push(totalPages);
    return pages;
  };

  return (
    <div className="space-y-6">
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        key={page}
      >
        {visible.map((plugin, index) => (
          <motion.div
            key={plugin.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.02 }}
          >
            <ModCard plugin={plugin} onClick={() => onPluginClick?.(plugin)} />
          </motion.div>
        ))}
      </motion.div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-1 pt-2">
          <button
            onClick={() => goTo(page - 1)}
            disabled={page === 1}
            className="w-8 h-8 flex items-center justify-center border border-border text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {pageNumbers().map((p, i) =>
            p === '...' ? (
              <span key={`ellipsis-${i}`} className="w-8 h-8 flex items-center justify-center text-muted-foreground text-sm">
                …
              </span>
            ) : (
              <button
                key={p}
                onClick={() => goTo(p as number)}
                className={`w-8 h-8 flex items-center justify-center text-sm border transition-colors ${
                  page === p
                    ? 'border-foreground text-foreground bg-primary'
                    : 'border-border text-muted-foreground hover:text-foreground hover:border-foreground/30'
                }`}
              >
                {p}
              </button>
            )
          )}

          <button
            onClick={() => goTo(page + 1)}
            disabled={page === totalPages}
            className="w-8 h-8 flex items-center justify-center border border-border text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
