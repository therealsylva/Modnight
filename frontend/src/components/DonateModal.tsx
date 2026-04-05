'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, Check } from 'lucide-react';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import type { DonateSettings } from '@/types';

interface DonateModalProps {
  isOpen: boolean;
  onClose: () => void;
  pluginTitle?: string;
}

const cryptoIcons: Record<string, string> = {
  btc: '₿',
  eth: 'Ξ',
  sol: '◎',
  ltc: 'Ł',
};

const cryptoNames: Record<string, string> = {
  btc: 'Bitcoin',
  eth: 'Ethereum',
  sol: 'Solana',
  ltc: 'Litecoin',
};

export default function DonateModal({ isOpen, onClose, pluginTitle }: DonateModalProps) {
  const [settings, setSettings] = useState<DonateSettings | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      api.settings.donate().then(res => setSettings(res.data));
    }
  }, [isOpen]);

  const copyToClipboard = async (key: string, address: string) => {
    try {
      await navigator.clipboard.writeText(address);
    } catch {
      const el = document.createElement('textarea');
      el.value = address;
      el.style.position = 'fixed';
      el.style.opacity = '0';
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
    }
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const hasAnyAddress = settings && Object.values(settings).some(v => v);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/70 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          
          <motion.div
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-[#111112] border border-border z-50"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h2 className="font-medium text-foreground">Support the Developer</h2>
              <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              {pluginTitle && (
                <p className="text-sm text-muted-foreground">
                  Show your support for <span className="text-foreground font-medium">{pluginTitle}</span>
                </p>
              )}

              {!settings ? (
                <div className="text-center py-8 text-muted-foreground">Loading...</div>
              ) : !hasAnyAddress ? (
                <div className="text-center py-8 text-muted-foreground">
                  No donation addresses configured
                </div>
              ) : (
                <div className="space-y-3">
                  {Object.entries(settings).map(([key, address]) => {
                    if (!address) return null;
                    return (
                      <div key={key} className="bg-card border border-border p-3">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{cryptoIcons[key]}</span>
                            <span className="text-sm font-medium text-foreground">{cryptoNames[key]}</span>
                          </div>
                          <button
                            onClick={() => copyToClipboard(key, address!)}
                            className="flex items-center gap-1 px-2 py-1 text-xs text-muted-foreground hover:text-foreground border border-border hover:border-foreground/30 transition-colors"
                          >
                            {copiedKey === key ? (
                              <>
                                <Check className="w-3 h-3 text-green-500" />
                                Copied
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                Copy
                              </>
                            )}
                          </button>
                        </div>
                        <p className="text-xs font-mono text-muted-foreground break-all">
                          {address}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}

              <p className="text-xs text-muted-foreground text-center">
                All donations go directly to the plugin developer
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
