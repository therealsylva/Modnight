'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import PluginDetailView from '@/components/PluginDetailView';
import { api } from '@/lib/api';
import type { Plugin } from '@/types';
import { Loader2 } from 'lucide-react';

interface Props {
  params: Promise<{ slug: string }>;
}

interface PluginData extends Plugin {
  _related?: Plugin[];
  _likes?: number;
}

export default function PluginClient({ params }: Props) {
  const router = useRouter();
  const [plugin, setPlugin] = useState<PluginData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    params.then(async ({ slug }) => {
      try {
        const res = await api.plugins.getPluginDetails(slug);
        if (res.success) {
          setPlugin({
            ...res.data.plugin,
            _related: res.data.related,
            _likes: res.data.likes,
          });
        } else {
          setError(true);
        }
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    });
  }, [params]);

  const handleClose = () => {
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !plugin) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">Plugin not found</p>
        <button
          onClick={() => router.push('/')}
          className="px-4 py-2 bg-primary border border-border text-sm text-foreground"
        >
          Back to Home
        </button>
      </div>
    );
  }

  return (
    <PluginDetailView
      plugin={plugin}
      relatedPlugins={plugin._related || []}
      initialLikes={plugin._likes || plugin.likes}
      onClose={handleClose}
    />
  );
}
