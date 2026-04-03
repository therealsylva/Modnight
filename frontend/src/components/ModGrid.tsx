'use client';

import { motion } from 'framer-motion';
import ModCard from './ModCard';
import type { Plugin } from '@/types';

interface ModGridProps {
  plugins: Plugin[];
  onPluginClick?: (plugin: Plugin) => void;
}

export default function ModGrid({ plugins, onPluginClick }: ModGridProps) {
  return (
    <motion.div
      className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {plugins.map((plugin, index) => (
        <motion.div
          key={plugin.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.05 }}
        >
          <ModCard
            plugin={plugin}
            onClick={() => onPluginClick?.(plugin)}
          />
        </motion.div>
      ))}
    </motion.div>
  );
}
