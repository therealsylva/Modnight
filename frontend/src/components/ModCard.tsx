'use client';

import { motion } from 'framer-motion';
import { Download, User, Check, Plus, Eye } from 'lucide-react';
import { useState } from 'react';
import { useCart } from './CartContext';
import type { Plugin } from '@/types';

interface ModCardProps {
  plugin: Plugin;
  onClick?: () => void;
}

export default function ModCard({ plugin, onClick }: ModCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const { addToCart, isInCart } = useCart();
  const inCart = isInCart(plugin.id);

  const formatDownloads = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!inCart) {
      addToCart(plugin);
    }
  };

  const handlePreview = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClick?.();
  };

  return (
    <motion.div
      className="group relative cursor-pointer"
      onClick={onClick}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -2 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <div className={`
        bg-card border border-border overflow-hidden transition-all duration-200
        ${isHovered ? 'border-foreground/20' : ''}
      `}>
        <div className="relative aspect-video bg-[#111112] overflow-hidden border-b border-border">
          <motion.img
            src={plugin.thumbnail}
            alt={plugin.title}
            className={`
              w-full h-full object-cover transition-transform duration-300
              ${isHovered ? 'scale-105' : 'scale-100'}
            `}
          />
        </div>

        <div className="p-4 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-medium text-sm text-foreground line-clamp-1 flex-1">
              {plugin.title}
            </h3>
            <span className="text-xs font-mono text-muted-foreground px-1.5 py-0.5 bg-muted border border-border flex-shrink-0">
              {plugin.version}
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5 text-muted-foreground flex-1">
              <User className="w-3 h-3" />
              <span className="truncate">{plugin.author}</span>
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Download className="w-3 h-3" />
              <span className="font-mono">{formatDownloads(plugin.downloads)}</span>
            </div>
          </div>

          <div className="flex gap-2">
            <motion.button
              className={`
                flex-1 py-2 text-xs font-medium transition-all duration-200 border flex items-center justify-center gap-1.5
                ${inCart 
                  ? 'bg-green-500/10 text-green-500 border-green-500/30' 
                  : 'bg-primary text-foreground border-border hover:border-foreground/30'
                }
              `}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleQuickAdd}
              disabled={inCart}
            >
              {inCart ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  Added
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5" />
                  Quick Add
                </>
              )}
            </motion.button>
            <motion.button
              className="px-3 py-2 text-xs font-medium text-muted-foreground border border-border hover:text-foreground hover:border-foreground/30 transition-all flex items-center justify-center"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handlePreview}
            >
              <Eye className="w-4 h-4" />
            </motion.button>
          </div>
        </div>
      </div>

      {isHovered && (
        <motion.div
          className="absolute inset-0 -z-10 border border-foreground/10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        />
      )}
    </motion.div>
  );
}
