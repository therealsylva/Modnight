import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';
  const siteUrl = 'https://modnight.com';

  const staticPages = [
    { loc: siteUrl, changefreq: 'daily', priority: '1.0' },
    { loc: `${siteUrl}/about`, changefreq: 'monthly', priority: '0.5' },
    { loc: `${siteUrl}/contact`, changefreq: 'monthly', priority: '0.5' },
    { loc: `${siteUrl}/terms`, changefreq: 'monthly', priority: '0.3' },
    { loc: `${siteUrl}/privacy`, changefreq: 'monthly', priority: '0.3' },
    { loc: `${siteUrl}/become-a-creator`, changefreq: 'monthly', priority: '0.6' },
  ];

  try {
    const res = await fetch(`${apiUrl}/plugins?limit=100`, {
      cache: 'no-store',
    });
    const data = await res.json();
    const plugins = data.data || [];

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${staticPages.map((page) => `
  <url>
    <loc>${page.loc}</loc>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('')}
  ${plugins.map((plugin: any) => `
  <url>
    <loc>${siteUrl}/plugin/${plugin.slug || plugin.id}</loc>
    <lastmod>${new Date(plugin.updated_at || plugin.created_at).toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`).join('')}
</urlset>`;

    return new NextResponse(sitemap, {
      headers: {
        'Content-Type': 'application/xml',
      },
    });
  } catch (error) {
    return new NextResponse('Error generating sitemap', { status: 500 });
  }
}
