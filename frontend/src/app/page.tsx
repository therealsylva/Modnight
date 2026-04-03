import { api } from '@/lib/api';
import HomeClient from './home-client';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ModNight - Premium Plugins & Mods',
  description: 'Discover and download premium add-ons, mods, and plugins for your favorite games and tools.',
  openGraph: {
    title: 'ModNight - Premium Plugins & Mods',
    description: 'Discover and download premium add-ons, mods, and plugins for your favorite games and tools.',
    type: 'website',
  },
};

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';
  
  let initialPlugins = [];
  let initialStats = { total_plugins: 0, total_downloads: 0, categories: {} };
  let initialCategories = [];

  try {
    const [pluginsRes, statsRes, categoriesRes] = await Promise.all([
      fetch(`${API_URL}/plugins?per_page=20`, { cache: 'no-store' }),
      fetch(`${API_URL}/plugins/stats`, { cache: 'no-store' }),
      fetch(`${API_URL}/categories`, { cache: 'no-store' }),
    ]);

    const pluginsData = await pluginsRes.json();
    const statsData = await statsRes.json();
    const categoriesData = await categoriesRes.json();

    initialPlugins = pluginsData.data || [];
    initialStats = statsData.data || initialStats;
    initialCategories = categoriesData.data || [];
  } catch (error) {
    console.error('Failed to fetch initial data:', error);
  }

  return (
    <HomeClient
      initialPlugins={initialPlugins}
      initialStats={initialStats}
      initialCategories={initialCategories}
    />
  );
}
