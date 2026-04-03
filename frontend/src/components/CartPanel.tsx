'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Trash2 } from 'lucide-react';
import { useCart } from './CartContext';
import { api } from '@/lib/api';
import { useState } from 'react';

export default function CartPanel() {
  const { items, isOpen, closeCart, removeFromCart, clearCart } = useCart();
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadAll = async () => {
    if (items.length === 0) return;

    setIsDownloading(true);
    try {
      const result = await api.plugins.batchDownload(items.map(i => i.id));
      result.data.forEach((item, index) => {
        setTimeout(() => {
          const link = document.createElement('a');
          link.href = item.download_url;
          link.download = `${item.title}.zip`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }, index * 500);
      });
      clearCart();
      closeCart();
    } catch (error) {
      console.error('Batch download failed:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/50 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
          />
          
          <motion.div
            className="fixed right-0 top-16 bottom-0 w-80 bg-[#0F0F10] border-l border-border z-50 flex flex-col"
            initial={{ x: 320 }}
            animate={{ x: 0 }}
            exit={{ x: 320 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          >
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h2 className="font-medium text-foreground">Download Queue</h2>
              <button onClick={closeCart} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {items.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  No plugins in queue
                </div>
              ) : (
                items.map(item => (
                  <motion.div
                    key={item.id}
                    className="bg-card border border-border p-3 flex items-center gap-3"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <img
                      src={item.thumbnail}
                      alt={item.title}
                      className="w-12 h-12 object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground line-clamp-1">{item.title}</p>
                      <p className="text-xs text-muted-foreground">{item.author}</p>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-muted-foreground hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </motion.div>
                ))
              )}
            </div>

            {items.length > 0 && (
              <div className="p-4 border-t border-border space-y-2">
                <button
                  onClick={handleDownloadAll}
                  disabled={isDownloading}
                  className="w-full py-3 text-sm font-medium text-foreground bg-primary border border-border hover:border-foreground/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Download className="w-4 h-4" />
                  {isDownloading ? 'Downloading...' : `Download All (${items.length})`}
                </button>
                <button
                  onClick={clearCart}
                  className="w-full py-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  Clear Queue
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
