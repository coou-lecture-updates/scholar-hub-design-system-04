import { supabase } from '@/integrations/supabase/client';

interface SitemapUrl {
  loc: string;
  lastmod?: string;
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: string;
}

export const generateSitemap = async (): Promise<string> => {
  const baseUrl = window.location.origin;
  const urls: SitemapUrl[] = [];

  // Static pages
  const staticPages = [
    { path: '/', priority: '1.0', changefreq: 'daily' as const },
    { path: '/about', priority: '0.8', changefreq: 'monthly' as const },
    { path: '/blogs', priority: '0.9', changefreq: 'daily' as const },
    { path: '/events', priority: '0.8', changefreq: 'daily' as const },
    { path: '/contact', priority: '0.7', changefreq: 'monthly' as const },
    { path: '/login', priority: '0.6', changefreq: 'monthly' as const },
    { path: '/signup', priority: '0.6', changefreq: 'monthly' as const }
  ];

  staticPages.forEach(page => {
    urls.push({
      loc: `${baseUrl}${page.path}`,
      lastmod: new Date().toISOString().split('T')[0],
      changefreq: page.changefreq,
      priority: page.priority
    });
  });

  try {
    // Dynamic blog posts
    const { data: blogs } = await supabase
      .from('blog_posts')
      .select('id, updated_at')
      .eq('published', true)
      .order('updated_at', { ascending: false });

    if (blogs) {
      blogs.forEach(blog => {
        urls.push({
          loc: `${baseUrl}/blogs/${blog.id}`,
          lastmod: new Date(blog.updated_at).toISOString().split('T')[0],
          changefreq: 'weekly',
          priority: '0.7'
        });
      });
    }

    // Dynamic events (public ones)
    const { data: events } = await supabase
      .from('events')
      .select('id, updated_at')
      .order('updated_at', { ascending: false });

    if (events) {
      events.forEach(event => {
        urls.push({
          loc: `${baseUrl}/events?event=${event.id}`,
          lastmod: new Date(event.updated_at).toISOString().split('T')[0],
          changefreq: 'weekly',
          priority: '0.6'
        });
      });
    }
  } catch (error) {
    console.error('Error fetching dynamic content for sitemap:', error);
  }

  // Generate XML sitemap
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(url => `  <url>
    <loc>${url.loc}</loc>
    ${url.lastmod ? `<lastmod>${url.lastmod}</lastmod>` : ''}
    ${url.changefreq ? `<changefreq>${url.changefreq}</changefreq>` : ''}
    ${url.priority ? `<priority>${url.priority}</priority>` : ''}
  </url>`).join('\n')}
</urlset>`;

  return sitemap;
};

export const generateRobotsTxt = async (): Promise<string> => {
  const baseUrl = window.location.origin;
  
  try {
    const { data } = await supabase
      .from('system_settings')
      .select('value')
      .eq('key', 'robots_txt_content')
      .single();

    if (data?.value) {
      return data.value;
    }
  } catch (error) {
    console.error('Error fetching robots.txt content:', error);
  }

  // Default robots.txt
  return `User-agent: *
Allow: /
Disallow: /admin/
Disallow: /dashboard/
Disallow: /user-settings/
Disallow: /messages/

Sitemap: ${baseUrl}/sitemap.xml`;
};

export const downloadSitemap = async () => {
  const sitemap = await generateSitemap();
  const blob = new Blob([sitemap], { type: 'application/xml' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'sitemap.xml';
  a.click();
  URL.revokeObjectURL(url);
};

export const downloadRobotsTxt = async () => {
  const robots = await generateRobotsTxt();
  const blob = new Blob([robots], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'robots.txt';
  a.click();
  URL.revokeObjectURL(url);
};