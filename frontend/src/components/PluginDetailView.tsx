'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Download, Heart, Share2, ChevronLeft, ChevronRight, ChevronDown, GitBranch, FileText, Clock, Package, Check, X, Play, ArrowRight, Flag, AlertTriangle } from 'lucide-react';
import { useState, useEffect } from 'react';
import type { Plugin } from '@/types';
import { api } from '@/lib/api';
import DonateModal from './DonateModal';
import ShareModal from './ShareModal';
import Link from 'next/link';

interface PluginDetailViewProps {
  plugin: Plugin;
  relatedPlugins?: Plugin[];
  initialLikes?: number;
  onClose: () => void;
}

export default function PluginDetailView({ 
  plugin, 
  relatedPlugins: initialRelated = [], 
  initialLikes: initialLikesCount,
  onClose 
}: PluginDetailViewProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState('readme');
  const [showDependencyTree, setShowDependencyTree] = useState(false);
  const [likes, setLikes] = useState(initialLikesCount ?? plugin.likes);
  const [isLiked, setIsLiked] = useState(false);
  const [showDonate, setShowDonate] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [reportSubmitted, setReportSubmitted] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [relatedPlugins, setRelatedPlugins] = useState<Plugin[]>(initialRelated);

  const images = plugin.images.length > 0 ? plugin.images : [plugin.thumbnail];

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const tabs = [
    { id: 'readme', label: 'ReadMe', icon: FileText },
    { id: 'changelog', label: 'Changelog', icon: Clock },
    { id: 'images', label: 'Plugin Images', icon: Package },
  ];

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = api.plugins.download(plugin.id);
    link.download = `${plugin.title}.zip`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleLike = async () => {
    if (isLiked) return;
    try {
      const res = await api.plugins.like(plugin.id);
      setLikes(res.data);
      setIsLiked(true);
    } catch (error) {
      console.error('Failed to like plugin:', error);
    }
  };

  return (
    <>
      <motion.div
        className="fixed inset-0 bg-background/95 z-50 overflow-y-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        <div className="fixed top-20 left-4 md:left-20 z-50">
          <button
            onClick={onClose}
            className="flex items-center gap-2 px-4 py-2 bg-card border border-border text-sm text-foreground hover:border-foreground/30 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Browse
          </button>
        </div>

        <div className="pt-20 md:pl-20 px-4 md:px-6 min-h-screen">
          <div className="max-w-6xl mx-auto p-2 md:p-6 space-y-6">
            <div className="flex flex-col md:flex-row gap-6">
              <motion.div
                className="flex-1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                <div className="relative aspect-video bg-[#111112] border border-border overflow-hidden">
                  {showVideo && plugin.preview_video ? (
                    <video
                      src={plugin.preview_video}
                      className="w-full h-full object-cover"
                      autoPlay
                      controls
                      onEnded={() => setShowVideo(false)}
                    />
                  ) : (
                    <img
                      src={images[currentImageIndex]}
                      alt={`${plugin.title} screenshot`}
                      className="w-full h-full object-cover"
                    />
                  )}
                  
                  {!showVideo && images.length > 1 && (
                    <>
                      <button
                        onClick={prevImage}
                        className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/60 border border-border flex items-center justify-center hover:bg-black/80 transition-colors"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <button
                        onClick={nextImage}
                        className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/60 border border-border flex items-center justify-center hover:bg-black/80 transition-colors"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </>
                  )}

                  <div className="absolute bottom-4 right-4 px-3 py-1.5 bg-black/60 border border-border text-xs font-mono text-foreground">
                    {currentImageIndex + 1} / {images.length}
                  </div>
                </div>

                <div className="flex gap-2 mt-4">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentImageIndex(idx)}
                      className={`
                        w-20 h-12 bg-[#111112] border overflow-hidden transition-all
                        ${currentImageIndex === idx ? 'border-foreground' : 'border-border hover:border-border/60'}
                      `}
                    >
                      <img src={img} alt={`Screenshot ${idx + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>

                <div className="mt-8 space-y-8">
                  <section>
                    <h2 className="text-xl font-semibold text-foreground mb-3">About This Plugin</h2>
                    <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                      {plugin.description}
                    </p>
                  </section>

                  <section>
                    <h2 className="text-xl font-semibold text-foreground mb-3">Plugin Details</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-card border border-border p-4">
                      <div>
                        <p className="text-xs text-muted-foreground">Version</p>
                        <p className="text-sm font-medium text-foreground">{plugin.version}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Compatibility</p>
                        <p className="text-sm font-medium text-foreground">{plugin.compatibility}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Category</p>
                        <p className="text-sm font-medium text-foreground">{plugin.category}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">File Size</p>
                        <p className="text-sm font-medium text-foreground">{plugin.file_size}</p>
                      </div>
                    </div>
                  </section>
                </div>

                <div className="mt-8">
                  <div className="flex gap-1 border-b border-border mb-4">
                    {tabs.map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`
                          flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors border-b-2
                          ${activeTab === tab.id
                            ? 'text-foreground border-foreground'
                            : 'text-muted-foreground border-transparent hover:text-foreground'
                          }
                        `}
                      >
                        <tab.icon className="w-4 h-4" />
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  <AnimatePresence mode="wait">
                    {activeTab === 'readme' && (
                      <motion.div
                        key="readme"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="bg-card border border-border p-6 space-y-4"
                      >
                        <h3 className="text-sm font-medium text-foreground mb-4">Installation Instructions</h3>
                        <div className="text-sm text-muted-foreground whitespace-pre-wrap">
                          {plugin.installation_instructions || 'No installation instructions provided.'}
                        </div>
                      </motion.div>
                    )}

                    {activeTab === 'changelog' && (
                      <motion.div
                        key="changelog"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="bg-card border border-border p-6 space-y-6"
                      >
                        <div className="space-y-4">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-xs font-mono text-muted-foreground">{plugin.version}</span>
                              <span className="text-xs text-muted-foreground">{plugin.last_updated}</span>
                            </div>
                            <div className="text-sm text-muted-foreground whitespace-pre-wrap">
                              {plugin.changelog || 'No changelog provided.'}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {activeTab === 'images' && (
                      <motion.div
                        key="images"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="bg-card border border-border p-6"
                      >
                        <div className="grid grid-cols-3 gap-4">
                          {images.map((img, idx) => (
                            <div key={idx} className="aspect-video bg-[#111112] border border-border overflow-hidden">
                              <img src={img} alt={`Plugin image ${idx + 1}`} className="w-full h-full object-cover" />
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>

              <motion.div
                className="w-full md:w-80 space-y-4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
              >
                <div className="bg-card border border-border p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <h1 className="text-lg font-medium text-foreground">{plugin.title}</h1>
                    <button 
                      onClick={handleLike}
                      className={`transition-colors ${isLiked ? 'text-red-500' : 'text-muted-foreground hover:text-red-500'}`}
                    >
                      <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
                    </button>
                  </div>
                  
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-muted-foreground">By</span>
                    <span className="text-foreground font-medium">{plugin.author}</span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {plugin.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 text-xs bg-muted text-muted-foreground border border-border"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="bg-card border border-border p-4 space-y-3">
                  {plugin.is_frozen ? (
                    <div className="w-full py-3 text-sm font-medium text-muted-foreground bg-muted/40 border border-border cursor-not-allowed select-none">
                      <div className="flex items-center justify-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-yellow-500/70" />
                        <span className="text-yellow-500/70">Under Investigation</span>
                      </div>
                    </div>
                  ) : (
                    <motion.button
                      onClick={handleDownload}
                      className="w-full py-3 text-sm font-medium text-foreground bg-primary border border-border hover:border-foreground/30 transition-all"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-center justify-center gap-2">
                        <Download className="w-4 h-4" />
                        Download
                      </div>
                    </motion.button>
                  )}

                  {plugin.preview_video && (
                    <motion.button
                      onClick={() => setShowVideo(true)}
                      className="w-full py-3 text-sm font-medium text-foreground bg-card border border-border hover:border-foreground/30 transition-all"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-center justify-center gap-2">
                        <Play className="w-4 h-4" />
                        Preview Video
                      </div>
                    </motion.button>
                  )}

                  <motion.button
                    onClick={() => setShowDonate(true)}
                    className="w-full py-3 text-sm font-medium text-foreground bg-card border border-border hover:border-foreground/30 transition-all"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <Heart className="w-4 h-4" />
                      Donate
                    </div>
                  </motion.button>

                  <button
                    onClick={() => setShowShare(true)}
                    className="w-full py-3 text-sm font-medium text-muted-foreground bg-card border border-border hover:text-foreground transition-colors"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <Share2 className="w-4 h-4" />
                      Share
                    </div>
                  </button>

                  <button
                    onClick={() => setShowReport(true)}
                    className="w-full py-3 text-sm font-medium text-muted-foreground bg-card border border-border hover:text-red-400 hover:border-red-400/30 transition-colors"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <Flag className="w-4 h-4" />
                      Report
                    </div>
                  </button>
                </div>

                <div className="bg-card border border-border p-4 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Downloads</span>
                    <span className="font-mono text-foreground">{plugin.downloads.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Likes</span>
                    <span className="font-mono text-foreground flex items-center gap-1">
                      {likes.toLocaleString()}
                      {isLiked && <Check className="w-3 h-3 text-green-500" />}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">File Size</span>
                    <span className="font-mono text-foreground">{plugin.file_size}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Compatibility</span>
                    <span className="font-mono text-foreground">{plugin.compatibility}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Last Updated</span>
                    <span className="font-mono text-foreground">{plugin.last_updated}</span>
                  </div>
                </div>

                {plugin.dependencies && plugin.dependencies.length > 0 && (
                  <div className="bg-card border border-border p-4 space-y-3">
                    <button
                      onClick={() => setShowDependencyTree(!showDependencyTree)}
                      className="flex items-center justify-between w-full"
                    >
                      <span className="text-sm font-medium text-foreground">Dependencies</span>
                      <ChevronDown
                        className={`w-4 h-4 text-muted-foreground transition-transform ${
                          showDependencyTree ? 'rotate-180' : ''
                        }`}
                      />
                    </button>

                    <AnimatePresence>
                      {showDependencyTree && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="space-y-2"
                        >
                          {plugin.dependencies.map((dep, idx) => (
                            <div
                              key={dep.id}
                              className="flex items-center gap-2 text-xs pl-4 relative"
                            >
                              {idx < plugin.dependencies!.length - 1 && (
                                <div className="absolute left-0 top-4 bottom-0 w-px bg-border" />
                              )}
                              <div className="absolute left-0 top-4 w-4 h-px bg-border" />
                              
                              <GitBranch className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                              <span className="text-foreground flex-1">{dep.name}</span>
                              <span className="font-mono text-muted-foreground">{dep.version}</span>
                            </div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}
              </motion.div>
            </div>

            {relatedPlugins.length > 0 && (
              <div className="mt-12 pt-8 border-t border-border">
                <h2 className="text-xl font-semibold text-foreground mb-6">You Might Also Like</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {relatedPlugins.map((related) => (
                    <Link
                      key={related.id}
                      href={`/plugin/${related.slug || related.id}`}
                      className="group block bg-card border border-border p-4 hover:border-foreground/30 transition-colors"
                    >
                      <div className="aspect-video bg-[#111112] border border-border overflow-hidden mb-3">
                        <img 
                          src={related.thumbnail} 
                          alt={related.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform" 
                        />
                      </div>
                      <h3 className="font-medium text-foreground text-sm truncate">{related.title}</h3>
                      <p className="text-xs text-muted-foreground mt-1">{related.downloads.toLocaleString()} downloads</p>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      <DonateModal 
        isOpen={showDonate} 
        onClose={() => setShowDonate(false)} 
        pluginTitle={plugin.title}
      />
      <ShareModal
        isOpen={showShare}
        onClose={() => setShowShare(false)}
        pluginId={plugin.id}
        pluginSlug={plugin.slug}
        pluginTitle={plugin.title}
      />

      <AnimatePresence>
        {showReport && (
          <motion.div
            className="fixed inset-0 bg-black/70 z-[60] flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => { setShowReport(false); setReportSubmitted(false); setReportReason(''); }}
          >
            <motion.div
              className="bg-card border border-border w-full max-w-md p-6 space-y-4"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              {reportSubmitted ? (
                <div className="text-center py-4 space-y-3">
                  <Check className="w-10 h-10 text-green-500 mx-auto" />
                  <p className="text-sm font-medium text-foreground">Report submitted</p>
                  <p className="text-xs text-muted-foreground">Thanks for helping keep the community safe. Our team will review this plugin.</p>
                  <button
                    onClick={() => { setShowReport(false); setReportSubmitted(false); setReportReason(''); }}
                    className="mt-2 px-4 py-2 text-sm border border-border text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Close
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Flag className="w-4 h-4 text-red-400" />
                      <h3 className="text-sm font-medium text-foreground">Report Plugin</h3>
                    </div>
                    <button onClick={() => setShowReport(false)} className="text-muted-foreground hover:text-foreground">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground">Why are you reporting <span className="text-foreground">{plugin.title}</span>?</p>
                  <div className="space-y-2">
                    {['Malware / malicious code', 'Copyright infringement', 'Misleading description', 'Broken / non-functional', 'Other'].map((reason) => (
                      <button
                        key={reason}
                        onClick={() => setReportReason(reason)}
                        className={`w-full text-left px-3 py-2 text-sm border transition-colors ${
                          reportReason === reason
                            ? 'border-red-400/50 text-foreground bg-red-400/5'
                            : 'border-border text-muted-foreground hover:text-foreground hover:border-border/60'
                        }`}
                      >
                        {reason}
                      </button>
                    ))}
                  </div>
                  <button
                    disabled={!reportReason}
                    onClick={async () => {
                      try {
                        await api.plugins.report(plugin.id, reportReason);
                      } catch (_) {}
                      setReportSubmitted(true);
                    }}
                    className="w-full py-2.5 text-sm font-medium border transition-colors disabled:opacity-40 disabled:cursor-not-allowed border-red-400/50 text-red-400 hover:bg-red-400/10"
                  >
                    Submit Report
                  </button>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
