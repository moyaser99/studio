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
  // next/image requires http or https protocols. 
  // We fall back to a placeholder if the provided URL is invalid (e.g., gs:// links).
  const isValidUrl = product.image && (product.image.startsWith('http://') || product.image.startsWith('https://'));
  const displayImage = isValidUrl ? product.image : 'https://picsum.photos/seed/placeholder/600/600';

  return (
    <Link href={`/product/${product.id}`}>
      <Card className="group overflow-hidden transition-all hover:shadow-lg border-none bg-secondary/10 rounded-3xl h-full">
        <div className="relative aspect-square overflow-hidden">
          <Image
            src={displayImage}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            data-ai-hint="product photo"
          />
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
