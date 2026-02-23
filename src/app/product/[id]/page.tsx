'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Loader2, ShoppingCart, ChevronLeft, ChevronRight, Sparkles, Check } from 'lucide-react';
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
import { cn } from '@/lib/utils';

export default function ProductPage() {
  const { id } = useParams();
  const db = useFirestore();
  const { lang, t, getTranslatedCategory } = useTranslation();
  const { addToCart } = useCart();
  const { toast } = useToast();
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedColorId, setSelectedColorId] = useState<string | null>(null);
  const [mainImage, setMainImage] = useState<string>('');
  
  const productRef = useMemoFirebase(() => {
    if (!db || !id) return null;
    return doc(db, 'products', id as string);
  }, [db, id]);

  const { data: product, loading } = useDoc(productRef);

  useEffect(() => {
    if (product) {
      setMainImage(product.imageUrl || 'https://picsum.photos/seed/placeholder/800/800');
    }
  }, [product]);

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

    const colorObj = product.colors?.find((c: any) => c.id === selectedColorId);

    addToCart({
      ...product,
      price: price,
      selectedColor: colorObj ? (lang === 'ar' ? colorObj.nameAr : colorObj.nameEn) : null
    });
    
    toast({
      title: lang === 'ar' ? 'تمت الإضافة' : 'Added to Cart',
      description: `${lang === 'ar' ? product.name : (product.nameEn || product.name)} ${lang === 'ar' ? 'أصبح في سلتك الآن' : 'is now in your cart'}.`,
      duration: 2000,
    });
  };

  const handleColorClick = (colorId: string) => {
    setSelectedColorId(colorId);
    // Find image linked to this color
    const linkedImage = product.images?.find((img: any) => img.colorId === colorId);
    if (linkedImage) {
      setMainImage(linkedImage.url);
    }
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

  const optimized = isImageOptimizable(mainImage);
  const displayName = lang === 'ar' ? product.name : (product.nameEn || product.name);
  const displayDescription = lang === 'ar' ? product.description : (product.descriptionEn || product.description);
  const displayCategory = lang === 'ar' ? product.categoryName : (product.categoryNameEn || getTranslatedCategory(product.categoryName));

  const threshold = 200;
  const shouldTruncate = displayDescription?.length > threshold;
  const truncatedText = isExpanded ? displayDescription : (displayDescription?.slice(0, threshold) + '...');

  const galleryImages = [
    { url: product.imageUrl, colorId: null },
    ...(product.images || [])
  ].slice(0, 7);

  return (
    <div className="container mx-auto px-4 py-12 md:px-6">
      <ProductSchema product={product as any} />
      
      <div className="grid gap-12 lg:grid-cols-12 items-start">
        {/* Gallery Column */}
        <div className={cn(
          "lg:col-span-7 flex flex-col md:flex-row gap-4",
          lang === 'ar' ? "md:flex-row-reverse" : "md:flex-row"
        )}>
          {/* Thumbnails */}
          {galleryImages.length > 1 && (
            <div className="flex md:flex-col gap-3 overflow-x-auto md:overflow-y-auto max-h-[500px] scrollbar-hide py-2 px-1 md:w-24 shrink-0">
              {galleryImages.map((img, idx) => (
                <button 
                  key={idx}
                  onClick={() => setMainImage(img.url)}
                  className={cn(
                    "relative aspect-square w-20 md:w-full rounded-2xl overflow-hidden border-2 transition-all flex-shrink-0",
                    mainImage === img.url ? "border-[#D4AF37] shadow-[0_0_10px_rgba(212,175,55,0.3)] scale-95" : "border-transparent"
                  )}
                >
                  {img.url ? (
                    <img src={img.url} alt={`Thumb ${idx}`} className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full bg-primary/10 animate-pulse" />
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Main Image */}
          <div className="relative flex-1 aspect-square overflow-hidden rounded-[3rem] bg-white shadow-2xl ring-1 ring-primary/5 transition-transform duration-500">
            {mainImage ? (
              optimized ? (
                <Image
                  src={mainImage}
                  alt={displayName}
                  fill
                  priority
                  className="object-cover"
                  data-ai-hint="product detail image"
                />
              ) : (
                <img
                  src={mainImage}
                  alt={displayName}
                  className="absolute inset-0 h-full w-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://picsum.photos/seed/placeholder/800/800';
                  }}
                />
              )
            ) : (
              <div className="absolute inset-0 bg-primary/5 animate-pulse flex items-center justify-center">
                <Loader2 className="h-12 w-12 text-primary/20 animate-spin" />
              </div>
            )}
            
            {isDiscounted && (
              <Badge className="absolute top-8 end-8 bg-primary text-white h-16 w-16 rounded-full flex items-center justify-center text-lg font-black shadow-2xl animate-pulse z-10">
                -{calculatedPercentage}%
              </Badge>
            )}
            
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
        </div>

        {/* Info Column */}
        <div className="lg:col-span-5 flex flex-col space-y-8 text-start">
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

          {/* Color Selection */}
          {product.colors && product.colors.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-lg">{lang === 'ar' ? 'اختر اللون' : 'Select Color'}</h3>
                {selectedColorId && (
                  <p className="text-sm text-[#D4AF37] font-bold">
                    {lang === 'ar' 
                      ? product.colors.find((c: any) => c.id === selectedColorId)?.nameAr 
                      : product.colors.find((c: any) => c.id === selectedColorId)?.nameEn}
                  </p>
                )}
              </div>
              <div className="flex flex-wrap gap-4">
                {product.colors.map((color: any) => (
                  <button
                    key={color.id}
                    onClick={() => handleColorClick(color.id)}
                    className={cn(
                      "group relative h-12 w-12 rounded-full border-2 transition-all duration-300 backdrop-blur-md",
                      selectedColorId === color.id 
                        ? "border-[#D4AF37] scale-110 shadow-[0_0_15px_rgba(212,175,55,0.5)]" 
                        : "border-transparent hover:border-primary/30"
                    )}
                    style={{ backgroundColor: color.hex + 'CC' }} // 80% opacity
                    title={lang === 'ar' ? color.nameAr : color.nameEn}
                  >
                    {selectedColorId === color.id && (
                      <Check className="absolute inset-0 m-auto h-5 w-5 text-white drop-shadow-md" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
          
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
