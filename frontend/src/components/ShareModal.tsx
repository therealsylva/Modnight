'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, Check, Twitter, Facebook, Linkedin } from 'lucide-react';
import { useState } from 'react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  pluginId: string;
  pluginSlug?: string;
  pluginTitle: string;
}

export default function ShareModal({ isOpen, onClose, pluginId, pluginSlug, pluginTitle }: ShareModalProps) {
  const [copied, setCopied] = useState(false);

  const pluginSlugOrId = pluginSlug || pluginId;
  const shareUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/plugin/${pluginSlugOrId}`
    : `/plugin/${pluginSlugOrId}`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
    } catch {
      const el = document.createElement('textarea');
      el.value = shareUrl;
      el.style.position = 'fixed';
      el.style.opacity = '0';
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareLinks = {
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(`Check out ${pluginTitle} on ModNight`)}&url=${encodeURIComponent(shareUrl)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
  };

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
              <h2 className="font-medium text-foreground">Share Plugin</h2>
              <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div className="bg-card border border-border p-3">
                <p className="text-sm text-muted-foreground mb-2">Share link</p>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={shareUrl}
                    readOnly
                    className="flex-1 bg-transparent text-sm font-mono text-foreground outline-none"
                  />
                  <button
                    onClick={copyToClipboard}
                    className="flex items-center gap-1 px-3 py-2 text-xs font-medium text-foreground bg-primary border border-border hover:border-foreground/30 transition-colors"
                  >
                    {copied ? (
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
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-3">Share on social media</p>
                <div className="flex gap-2">
                  <a
                    href={shareLinks.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-card border border-border hover:border-foreground/30 transition-colors text-foreground text-sm"
                  >
                    <Twitter className="w-4 h-4" />
                    Twitter
                  </a>
                  <a
                    href={shareLinks.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-card border border-border hover:border-foreground/30 transition-colors text-foreground text-sm"
                  >
                    <Facebook className="w-4 h-4" />
                    Facebook
                  </a>
                  <a
                    href={shareLinks.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-card border border-border hover:border-foreground/30 transition-colors text-foreground text-sm"
                  >
                    <Linkedin className="w-4 h-4" />
                    LinkedIn
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
