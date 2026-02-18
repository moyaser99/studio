'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ShoppingCart } from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/hooks/use-toast';

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    nameEn?: string;
    price: number;
    categoryName: string;
    categoryNameEn?: string;
    image: string;
  };
}

export default function ProductCard({ product }: ProductCardProps) {
  const { lang, t, getTranslatedCategory } = useTranslation();
  const { addToCart } = useCart();
  const { toast } = useToast();

  const isImageOptimizable = (url: string) => {
    if (!url) return false;
    const supportedHosts = [
      'images.unsplash.com',
      'picsum.photos',
      'firebasestorage.googleapis.com',
      'gen-lang-client-0789065518.firebasestorage.app',
      'placehold.co',
      'lh3.googleusercontent.com',
      'www.ubuy.com.jo',
      'i5.walmartimages.com',
      'm.media-amazon.com'
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

  const displayName = lang === 'ar' ? product.name : (product.nameEn || product.name);
  const displayCategory = lang === 'ar' ? product.categoryName : (product.categoryNameEn || getTranslatedCategory(product.categoryName));

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
    toast({
      title: lang === 'ar' ? 'تمت الإضافة' : 'Added to Cart',
      description: `${displayName} ${lang === 'ar' ? 'أصبح في سلتك الآن' : 'is now in your cart'}.`,
      duration: 2000,
    });
  };

  return (
    <Card className="group overflow-hidden transition-all duration-300 hover:shadow-2xl border-none bg-white rounded-[2rem] h-full flex flex-col shadow-sm">
      <Link href={`/product/${product.id}`} className="relative aspect-square overflow-hidden block">
        {useOptimized ? (
          <Image
            src={displayImage}
            alt={displayName}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-110"
            data-ai-hint="product photo"
          />
        ) : (
          <img
            src={displayImage}
            alt={displayName}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://picsum.photos/seed/error/600/600';
            }}
          />
        )}
        <div className="absolute inset-0 bg-black/5 group-hover:bg-black/0 transition-colors duration-300" />
        <Badge className="absolute start-4 top-4 bg-white/90 backdrop-blur-md text-primary hover:bg-white rounded-full px-4 py-1.5 shadow-sm font-bold border-none transition-all duration-300">
          {displayCategory}
        </Badge>
      </Link>
      
      <CardContent className="p-6 text-start flex flex-col flex-1">
        <Link href={`/product/${product.id}`} className="block group-hover:text-primary transition-colors flex-1">
          <h3 className="line-clamp-2 font-bold text-foreground text-xl leading-snug mb-2">
            {displayName}
          </h3>
          <p className="text-2xl font-black text-primary mb-6">
            ${product.price?.toFixed(2)}
          </p>
        </Link>
        
        <Button 
          onClick={handleAddToCart}
          className="w-full h-12 rounded-full font-bold gap-2 text-lg shadow-md border-2 border-[#D4AF37] bg-[#F8C8DC] text-[#D4AF37] hover:bg-[#F8C8DC]/80 hover:scale-[1.02] transition-all"
        >
          <ShoppingCart className="h-5 w-5" />
          {t.addToCart}
        </Button>
      </CardContent>
    </Card>
  );
}
