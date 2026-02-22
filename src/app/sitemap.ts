
import { MetadataRoute } from 'next';

/**
 * Generates a dynamic sitemap for HarirBoutiqueUSA.
 * Includes static routes and will be indexed by search engines.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://harirboutiqueusa.com';

  const staticRoutes = [
    '',
    '/about',
    '/products',
    '/cart',
    '/privacy-policy',
    '/terms-of-use',
    '/shipping-returns',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1 : 0.8,
  }));

  // Note: For dynamic products, in a full production environment, 
  // we would fetch IDs from Firestore here. Since generateMetadata 
  // and sitemap are server-side, we list key categories or a base path.
  
  return [...staticRoutes];
}
