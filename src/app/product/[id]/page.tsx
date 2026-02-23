
'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Loader2, ShoppingCart, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useFirestore, useDoc } from '@/firebase';
import { doc } from 'firebase/firestore';
import { useMemoFirebase } from '@/firebase/use-memo-firebase';
import Link from 'next/link';
import { useTranslation } from '@/hooks/use-translation';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/hooks/use-toast';
import ProductSchema from '@/components/seo/ProductSchema';
import DiscountCountdown from '@/components/product/DiscountCountdown';

export default function ProductPage() {
  const { id } = useParams();
  const db = useFirestore();
  const { lang, t, getTranslatedCategory } = useTranslation();
  const { addToCart } = useCart();
  const { toast } = useToast();
  const [isExpanded, setIsExpanded] = useState(false);
  
  const productRef = useMemoFirebase(() => {
    if (!db || !id) return null;
    return doc(db, 'products', id as string);
  }, [db, id]);

  const { data: product, loading } = useDoc(productRef);

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

  const getCalculatedPrice = () => {
    if (!product) return 0;
    if (product.discountType === 'permanent' && product.discountPrice) {
      return product.discountPrice;
    }
    if (product.discountType === 'timed' && product.discountPrice && product.discountEndDate) {
      const targetDate = product.discountEndDate.toDate ? product.discountEndDate.toDate().getTime() : new Date(product.discountEndDate).getTime();
      if (new Date().getTime() < targetDate) {
        return product.discountPrice;
      }
    }
    if (product.discountPercentage && product.discountPercentage > 0) {
      return product.price * (1 - product.discountPercentage / 100);
    }
    return product.price;
  };

  const handleAddToCart = () => {
    if (!product) return;
    const price = getCalculatedPrice();

    addToCart({
      ...product,
      price: price
    });
    
    toast({
      title: lang === 'ar' ? 'تمت الإضافة' : 'Added to Cart',
      description: `${lang === 'ar' ? product.name : (product.nameEn || product.name)} ${lang === 'ar' ? 'أصبح في سلتك الآن' : 'is now in your cart'}.`,
      duration: 2000,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center space-y-4 p-12">
        <p className="text-xl font-bold">{t.categoryNotFound}</p>
        <Link href="/">
          <Button variant="outline" className="rounded-full gap-2">
            {lang === 'ar' ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />} {t.backToHome}
          </Button>
        </Link>
      </div>
    );
  }

  const finalPrice = getCalculatedPrice();
  const isDiscounted = finalPrice < product.price;
  const calculatedPercentage = isDiscounted ? Math.round(((product.price - finalPrice) / product.price) * 100) : 0;

  const isValidUrl = product.imageUrl && (product.imageUrl.startsWith('http://') || product.imageUrl.startsWith('https://'));
  const optimized = isImageOptimizable(product.imageUrl);
  const displayImage = isValidUrl ? product.imageUrl : 'https://picsum.photos/seed/placeholder/800/800';

  const displayName = lang === 'ar' ? product.name : (product.nameEn || product.name);
  const displayDescription = lang === 'ar' ? product.description : (product.descriptionEn || product.description);
  const displayCategory = lang === 'ar' ? product.categoryName : (product.categoryNameEn || getTranslatedCategory(product.categoryName));

  const threshold = 200;
  const shouldTruncate = displayDescription?.length > threshold;
  const truncatedText = isExpanded ? displayDescription : (displayDescription?.slice(0, threshold) + '...');

  return (
    <div className="container mx-auto px-4 py-12 md:px-6">
      <ProductSchema product={product as any} />
      
      <div className="grid gap-12 lg:grid-cols-2 items-start">
        <div className="relative aspect-square overflow-hidden rounded-[3rem] bg-white shadow-2xl ring-1 ring-primary/5 transition-transform hover:scale-[1.01] duration-500">
          {optimized ? (
            <Image
              src={displayImage}
              alt={displayName}
              fill
              className="object-cover"
              data-ai-hint="product detail image"
            />
          ) : (
            <img
              src={displayImage}
              alt={displayName}
              className="absolute inset-0 h-full w-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://picsum.photos/seed/placeholder/800/800';
              }}
            />
          )}
          {isDiscounted && (
            <Badge className="absolute top-8 end-8 bg-primary text-white h-16 w-16 rounded-full flex items-center justify-center text-lg font-black shadow-2xl animate-pulse z-10">
              -{calculatedPercentage}%
            </Badge>
          )}
          
          {/* Detailed Floating Timer for Product Details */}
          {product.discountType === 'timed' && (
            <div className="absolute bottom-8 left-0 right-0 flex justify-center z-10">
              <DiscountCountdown 
                endDate={product.discountEndDate} 
                isFloating={true} 
                className="scale-125 shadow-2xl border-white/40 px-6 py-2" 
              />
            </div>
          )}
        </div>

        <div className="flex flex-col space-y-8 text-start">
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <Badge variant="secondary" className="px-6 py-2 rounded-full text-sm font-bold tracking-wide bg-primary/10 text-primary border-none shadow-sm">
                {displayCategory}
              </Badge>
              {product.discountType === 'permanent' && (
                <div className="bg-[#D4AF37]/10 text-[#D4AF37] px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest flex items-center gap-2 border border-[#D4AF37]/20">
                  <Sparkles className="h-3 w-3" />
                  {lang === 'ar' ? 'عرض خاص' : 'Special Offer'}
                </div>
              )}
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-foreground font-headline leading-tight">
              {displayName}
            </h1>
            <div className="flex items-center gap-6">
              <div className="flex flex-col">
                <p className="text-5xl font-black text-primary">
                  ${finalPrice.toFixed(2)}
                </p>
                {isDiscounted && (
                  <p className="text-xl text-muted-foreground line-through font-bold mt-1">
                    ${product.price.toFixed(2)}
                  </p>
                )}
              </div>
              {product.isHidden && (
                <Badge variant="destructive" className="rounded-full px-4">{t.hidden}</Badge>
              )}
            </div>
          </div>
          
          <Separator className="opacity-50" />
          
          <div className="space-y-6">
            <h3 className="font-black text-2xl font-headline flex items-center gap-2">
              <span className="w-2 h-8 bg-[#D4AF37] rounded-full inline-block"></span>
              {t.aboutProduct}
            </h3>
            <div className="space-y-2">
              <p className="text-xl text-muted-foreground leading-relaxed whitespace-pre-wrap font-medium">
                {shouldTruncate ? truncatedText : displayDescription}
              </p>
              {shouldTruncate && (
                <button 
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="text-primary font-bold hover:underline decoration-2 underline-offset-4 transition-all"
                >
                  {isExpanded ? t.showLess : t.readMore}
                </button>
              )}
            </div>
          </div>

          <div className="pt-8 flex flex-col gap-5">
            <Button 
              onClick={handleAddToCart}
              className="w-full h-16 rounded-full text-xl font-bold shadow-xl border-2 border-pink-300 bg-primary text-white hover:bg-[#D4AF37] hover:border-[#D4AF37] gap-3 transition-all hover:scale-[1.02] animate-pulse-luxury flex items-center justify-center px-4"
            >
              <ShoppingCart className="h-6 w-6" />
              <span className="whitespace-normal leading-tight">{t.addToCart}</span>
            </Button>
          </div>
          
          <p className="text-sm text-muted-foreground font-medium bg-muted/30 p-4 rounded-2xl border border-dashed text-center md:text-start">
            {t.secureContact}
          </p>
        </div>
      </div>
    </div>
  );
}
