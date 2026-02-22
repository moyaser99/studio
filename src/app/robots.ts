
import { MetadataRoute } from 'next';

/**
 * Configures the robots.txt file to allow indexing of public pages
 * while protecting administrative and internal routes.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/admin',
        '/admin/',
        '/checkout/success',
        '/api/',
      ],
    },
    sitemap: 'https://harirboutiqueusa.com/sitemap.xml',
  };
}
