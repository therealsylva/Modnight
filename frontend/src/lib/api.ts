const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080';

function transformPlugin(plugin: Plugin): Plugin {
  return {
    ...plugin,
    thumbnail: plugin.thumbnail.startsWith('http') 
      ? plugin.thumbnail 
      : `${BACKEND_URL}${plugin.thumbnail}`,
  };
}

async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

export const api = {
  plugins: {
    list: (filters?: PluginFilters): Promise<PaginatedResponse<Plugin>> => 
      fetchApi<PaginatedResponse<Plugin>>(`/plugins${buildQueryString(filters)}`)
        .then(res => ({
          ...res,
          data: res.data.map(transformPlugin),
        })),
    
    get: (id: string): Promise<ApiResponse<Plugin>> => 
      fetchApi<ApiResponse<Plugin>>(`/plugins/${id}`)
        .then(res => ({
          ...res,
          data: transformPlugin(res.data),
        })),
    
    getBySlug: (slug: string): Promise<ApiResponse<Plugin>> => 
      fetchApi<ApiResponse<Plugin>>(`/plugins/slug/${slug}`)
        .then(res => ({
          ...res,
          data: transformPlugin(res.data),
        })),
    
    getPluginDetails: (slug: string): Promise<ApiResponse<PluginDetailsResponse>> => 
      fetchApi<ApiResponse<PluginDetailsResponse>>(`/v1/plugin-details/${slug}`)
        .then(res => ({
          ...res,
          data: {
            ...res.data,
            plugin: transformPlugin(res.data.plugin),
            related: res.data.related.map(transformPlugin),
          },
        })),
    
    stats: () => 
      fetchApi<ApiResponse<PluginStats>>('/plugins/stats'),
    
    search: (query: string) => 
      fetchApi<PaginatedResponse<Plugin>>(`/plugins/search?q=${encodeURIComponent(query)}`),
    
    download: (id: string) => 
      `${API_BASE_URL}/plugins/${id}/download`,
    
    like: (id: string) => 
      fetchApi<ApiResponse<number>>(`/plugins/${id}/like`, { method: 'POST' }),
    
    getLikes: (id: string) => 
      fetchApi<ApiResponse<number>>(`/plugins/${id}/likes`),
    
    getRelated: (pluginId: string, category: string, limit: number = 4) => 
      fetchApi<ApiResponse<Plugin[]>>(`/plugins/related?plugin_id=${pluginId}&category=${category}&limit=${limit}`),
    
    batchDownload: (ids: string[]) => 
      fetchApi<ApiResponse<BatchDownloadItem[]>>('/plugins/batch-download', {
        method: 'POST',
        body: JSON.stringify({ plugin_ids: ids }),
      }),
  },

  settings: {
    donate: () => 
      fetchApi<ApiResponse<DonateSettings>>('/settings/donate'),
  },

  announcements: {
    get: () => 
      fetchApi<ApiResponse<AnnouncementSettings>>('/announcements'),
  },

  categories: {
    list: () => 
      fetchApi<ApiResponse<Category[]>>('/categories'),
  },
};

function buildQueryString(filters?: PluginFilters): string {
  if (!filters) return '';
  
  const params = new URLSearchParams();
  
  if (filters.category && filters.category !== 'all') {
    params.append('category', filters.category);
  }
  if (filters.search) {
    params.append('search', filters.search);
  }
  if (filters.sort_by) {
    params.append('sort_by', filters.sort_by);
  }
  if (filters.sort_order) {
    params.append('sort_order', filters.sort_order);
  }
  
  const queryString = params.toString();
  return queryString ? `?${queryString}` : '';
}

import type { Plugin, PluginFilters, PluginStats, ApiResponse, PaginatedResponse, DonateSettings, BatchDownloadItem, Category, AnnouncementSettings } from '@/types';
