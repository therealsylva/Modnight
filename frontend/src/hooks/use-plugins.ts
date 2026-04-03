'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { PluginFilters } from '@/types';

export function usePlugins(filters?: PluginFilters) {
  return useQuery({
    queryKey: ['plugins', filters],
    queryFn: () => api.plugins.list(filters),
  });
}

export function usePlugin(id: string) {
  return useQuery({
    queryKey: ['plugin', id],
    queryFn: () => api.plugins.get(id),
    enabled: !!id,
  });
}

export function usePluginStats() {
  return useQuery({
    queryKey: ['pluginStats'],
    queryFn: () => api.plugins.stats(),
  });
}

export function useDonateSettings() {
  return useQuery({
    queryKey: ['donateSettings'],
    queryFn: () => api.settings.donate(),
  });
}

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => api.categories.list(),
  });
}
