export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/dashboard', '/download/', '/invoice/', '/checkout', '/settings', '/api/'],
      },
    ],
    sitemap: 'https://www.themeszoo.com/sitemap.xml',
    host: 'https://www.themeszoo.com',
  };
}
