
import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@/lib/data';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <Link href={`/product/${product.id}`}>
      <Card className="group overflow-hidden transition-all hover:shadow-lg border-none bg-secondary/10">
        <div className="relative aspect-square overflow-hidden">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            data-ai-hint="product photo"
          />
          <Badge className="absolute left-2 top-2 bg-primary/90">
            {product.category}
          </Badge>
        </div>
        <CardContent className="p-4">
          <h3 className="line-clamp-1 font-medium text-foreground group-hover:text-primary transition-colors">
            {product.name}
          </h3>
          <p className="mt-1 text-lg font-bold text-primary">
            ${product.price.toFixed(2)}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}
