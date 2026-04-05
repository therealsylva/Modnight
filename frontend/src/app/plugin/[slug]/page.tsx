import { Metadata } from 'next';
import PluginClient from './client';
import JsonLd from '@/components/JsonLd';

interface Props {
  params: Promise<{ slug: string }>;
}

const SITE_URL = 'https://modnight.com';

interface PluginData {
  id: string;
  slug?: string;
  title: string;
  author: string;
  description: string;
  thumbnail: string;
  version: string;
  compatibility: string;
  category: string;
  downloads: number;
  updated_at: string;
}

async function getPlugin(slug: string): Promise<PluginData | null> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

  try {
    const res = await fetch(`${apiUrl}/plugins/slug/${slug}`, { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      return data.data;
    }
  } catch {}

  try {
    const res = await fetch(`${apiUrl}/plugins/${slug}`, { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      return data.data;
    }
  } catch {}

  return null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const plugin = await getPlugin(slug);

  if (plugin) {
    const pluginUrl = `${SITE_URL}/plugin/${plugin.slug || plugin.id}`;

    return {
      title: `${plugin.title} by ${plugin.author} - ModNight`,
      description: plugin.description?.slice(0, 160) || '',
      alternates: {
        canonical: pluginUrl,
      },
      openGraph: {
        title: plugin.title,
        description: plugin.description?.slice(0, 160) || '',
        images: [plugin.thumbnail],
        type: 'article',
        authors: [plugin.author],
        url: pluginUrl,
      },
      twitter: {
        card: 'summary_large_image',
        title: plugin.title,
        description: plugin.description?.slice(0, 160) || '',
        images: [plugin.thumbnail],
      },
    };
  }

  return {
    title: 'Plugin Not Found - ModNight',
  };
}

export default async function PluginPage({ params }: Props) {
  const { slug } = await params;
  const plugin = await getPlugin(slug);

  const jsonLd = plugin ? {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": plugin.title,
    "description": plugin.description?.slice(0, 160),
    "author": {
      "@type": "Person",
      "name": plugin.author
    },
    "dateModified": plugin.updated_at,
    "version": plugin.version,
    "operatingSystem": plugin.compatibility,
    "downloadUrl": `${SITE_URL}/api/download/${plugin.id}`,
    "applicationCategory": "DeveloperApplication"
  } : null;

  return (
    <>
      {jsonLd && <JsonLd data={jsonLd} />}
      <PluginClient params={params} />
    </>
  );
}
