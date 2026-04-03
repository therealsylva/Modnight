export interface Plugin {
  id: string;
  slug?: string;
  title: string;
  author: string;
  downloads: number;
  likes: number;
  version: string;
  thumbnail: string;
  images: string[];
  preview_video?: string;
  description: string;
  category: string;
  tags: string[];
  dependencies?: PluginDependency[];
  compatibility: string;
  file_size: string;
  changelog: string;
  installation_instructions: string;
  last_updated: string;
  created_at: string;
  updated_at: string;
}

export type PluginCategory = string;

export interface PluginDependency {
  id: string;
  name: string;
  version: string;
  required: boolean;
}

export interface Category {
  id: string;
  label: string;
  count: number;
}

export interface PluginStats {
  total_plugins: number;
  total_downloads: number;
  categories: Record<string, number>;
}

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

export interface PluginFilters {
  category?: PluginCategory;
  search?: string;
  sort_by?: 'downloads' | 'likes' | 'updated' | 'name';
  sort_order?: 'asc' | 'desc';
}

export interface DonateSettings {
  btc?: string;
  eth?: string;
  sol?: string;
  ltc?: string;
}

export interface BatchDownloadItem {
  id: string;
  title: string;
  download_url: string;
}

export interface CartItem {
  id: string;
  title: string;
  author: string;
  thumbnail: string;
}

export interface PluginDetailsResponse {
  plugin: Plugin;
  related: Plugin[];
  likes: number;
}

export interface AnnouncementSettings {
  active: boolean;
  title: string;
  body: string;
  link?: string;
}
