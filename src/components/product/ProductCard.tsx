
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    price: number;
    categoryName: string;
    image: string;
  };
}

export default function ProductCard({ product }: ProductCardProps) {
  // Enhanced check for supported Image hostnames or fallbacks
  const isImageOptimizable = (url: string) => {
    if (!url) return false;
    const supportedHosts = [
      'images.unsplash.com',
      'picsum.photos',
      'firebasestorage.googleapis.com',
      'gen-lang-client-0789065518.firebasestorage.app',
      'placehold.co',
      'lh3.googleusercontent.com',
      'www.ubuy.com.jo'
    ];
    try {
      const hostname = new URL(url).hostname;
      return supportedHosts.includes(hostname);
    } catch {
      return false;
    }
  };

  const isValidUrl = product.image && (product.image.startsWith('http://') || product.image.startsWith('https://'));
  const useOptimized = isValidUrl && isImageOptimizable(product.image);
  const displayImage = isValidUrl ? product.image : 'https://picsum.photos/seed/placeholder/600/600';

  return (
    <Link href={`/product/${product.id}`}>
      <Card className="group overflow-hidden transition-all hover:shadow-lg border-none bg-secondary/10 rounded-3xl h-full">
        <div className="relative aspect-square overflow-hidden">
          {useOptimized ? (
            <Image
              src={displayImage}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              data-ai-hint="product photo"
            />
          ) : (
            <img
              src={displayImage}
              alt={product.name}
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://picsum.photos/seed/error/600/600';
              }}
            />
          )}
          <Badge className="absolute right-2 top-2 bg-primary/90 rounded-full px-3">
            {product.categoryName}
          </Badge>
        </div>
        <CardContent className="p-5 text-right flex flex-col justify-between h-auto">
          <h3 className="line-clamp-2 font-bold text-foreground group-hover:text-primary transition-colors text-lg leading-snug">
            {product.name}
          </h3>
          <p className="mt-2 text-xl font-bold text-primary">
            ${product.price?.toFixed(2)}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}
