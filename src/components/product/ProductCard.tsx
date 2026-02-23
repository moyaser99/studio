
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
import DiscountCountdown from './DiscountCountdown';

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    nameEn?: string;
    price: number; // This is originalPrice
    discountType?: 'none' | 'permanent' | 'timed';
    discountPrice?: number;
    discountEndDate?: any;
    discountPercentage?: number;
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

  // Pricing Logic
  const getCalculatedPrice = () => {
    if (product.discountType === 'permanent' && product.discountPrice) {
      return product.discountPrice;
    }
    if (product.discountType === 'timed' && product.discountPrice && product.discountEndDate) {
      const targetDate = product.discountEndDate.toDate ? product.discountEndDate.toDate().getTime() : new Date(product.discountEndDate).getTime();
      if (new Date().getTime() < targetDate) {
        return product.discountPrice;
      }
    }
    // Fallback to legacy percentage or original price
    if (product.discountPercentage && product.discountPercentage > 0) {
      return product.price * (1 - product.discountPercentage / 100);
    }
    return product.price;
  };

  const finalPrice = getCalculatedPrice();
  const isDiscounted = finalPrice < product.price;
  const calculatedPercentage = isDiscounted ? Math.round(((product.price - finalPrice) / product.price) * 100) : 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({
      ...product,
      price: finalPrice
    });
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

        {isDiscounted && (
          <Badge className="absolute end-4 top-4 bg-primary text-white h-12 w-12 sm:h-14 sm:w-14 rounded-full flex items-center justify-center text-xs sm:text-sm font-black shadow-xl animate-in fade-in zoom-in duration-500 ring-2 ring-white/20">
            -{calculatedPercentage}%
          </Badge>
        )}
      </Link>
      
      <CardContent className="p-4 sm:p-6 text-start flex flex-col flex-1">
        <Link href={`/product/${product.id}`} className="block group-hover:text-primary transition-colors flex-1">
          <div className="mb-2">
            {product.discountType === 'timed' && <DiscountCountdown endDate={product.discountEndDate} />}
          </div>
          <h3 className="line-clamp-2 font-bold text-foreground text-lg sm:text-xl leading-snug mb-2">
            {displayName}
          </h3>
          <div className="flex items-center gap-3 mb-4 sm:mb-6">
            <p className="text-xl sm:text-2xl font-black text-primary">
              ${finalPrice.toFixed(2)}
            </p>
            {isDiscounted && (
              <p className="text-sm sm:text-base text-muted-foreground line-through font-medium">
                ${product.price.toFixed(2)}
              </p>
            )}
          </div>
        </Link>
        
        <Button 
          onClick={handleAddToCart}
          className="w-full h-10 sm:h-12 rounded-full font-bold gap-2 text-sm sm:text-lg shadow-md border-2 border-pink-300 bg-primary text-white hover:bg-[#D4AF37] hover:border-[#D4AF37] hover:scale-[1.02] transition-all animate-pulse-luxury flex items-center justify-center px-2"
        >
          <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5" />
          <span className="whitespace-normal leading-tight">{t.addToCart}</span>
        </Button>
      </CardContent>
    </Card>
  );
}
