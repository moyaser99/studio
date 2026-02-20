'use client';

import { useParams } from 'next/navigation';
import Image from 'next/image';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { MessageCircle, Loader2, ArrowRight, ShoppingCart, ChevronLeft, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useFirestore, useDoc } from '@/firebase';
import { doc } from 'firebase/firestore';
import { useMemoFirebase } from '@/firebase/use-memo-firebase';
import Link from 'next/link';
import { useTranslation } from '@/hooks/use-translation';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/hooks/use-toast';

export default function ProductPage() {
  const { id } = useParams();
  const db = useFirestore();
  const { lang, t, getTranslatedCategory } = useTranslation();
  const { addToCart } = useCart();
  const { toast } = useToast();
  
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

  const handleAddToCart = () => {
    if (!product) return;
    addToCart(product);
    toast({
      title: lang === 'ar' ? 'تمت الإضافة' : 'Added to Cart',
      description: `${lang === 'ar' ? product.name : (product.nameEn || product.name)} ${lang === 'ar' ? 'أصبح في سلتك الآن' : 'is now in your cart'}.`,
      duration: 2000,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
        <Header />
        <main className="flex-1 flex flex-col items-center justify-center space-y-4">
          <p className="text-xl font-bold">{t.categoryNotFound}</p>
          <Link href="/">
            <Button variant="outline" className="rounded-full gap-2">
              {lang === 'ar' ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />} {t.backToHome}
            </Button>
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const isValidUrl = product.imageUrl && (product.imageUrl.startsWith('http://') || product.imageUrl.startsWith('https://'));
  const optimized = isImageOptimizable(product.imageUrl);
  const displayImage = isValidUrl ? product.imageUrl : 'https://picsum.photos/seed/placeholder/800/800';

  const displayName = lang === 'ar' ? product.name : (product.nameEn || product.name);
  const displayDescription = lang === 'ar' ? product.description : (product.descriptionEn || product.description);
  const displayCategory = lang === 'ar' ? product.categoryName : (product.categoryNameEn || getTranslatedCategory(product.categoryName));

  const message = `مرحباً YourGroceriesUSA، أود طلب منتج: ${displayName}`;
  const whatsappUrl = `https://wa.me/YOUR_NUMBER?text=${encodeURIComponent(message)}`;

  return (
    <div className="flex min-h-screen flex-col" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <Header />
      <main className="flex-1 container mx-auto px-4 py-12 md:px-6">
        <div className="grid gap-12 lg:grid-cols-2 items-start">
          {/* Image Section */}
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
          </div>

          {/* Details Section */}
          <div className="flex flex-col space-y-8 text-start">
            <div className="space-y-4">
              <Badge variant="secondary" className="px-6 py-2 rounded-full text-sm font-bold tracking-wide bg-primary/10 text-primary border-none shadow-sm">
                {displayCategory}
              </Badge>
              <h1 className="text-4xl md:text-5xl font-black text-foreground font-headline leading-tight">
                {displayName}
              </h1>
              <div className="flex items-center gap-4">
                <p className="text-4xl font-black text-primary">
                  ${product.price?.toFixed(2)}
                </p>
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
              <p className="text-muted-foreground text-xl leading-relaxed whitespace-pre-wrap font-medium">
                {displayDescription}
              </p>
            </div>

            <div className="pt-8 flex flex-col sm:flex-row gap-5">
              <Button 
                onClick={handleAddToCart}
                className="flex-1 h-16 rounded-full text-xl font-bold shadow-xl border-2 border-pink-300 bg-primary text-white hover:bg-[#D4AF37] hover:border-[#D4AF37] gap-3 transition-all hover:scale-[1.02] flex items-center justify-center px-4"
              >
                <ShoppingCart className="h-6 w-6" />
                <span className="whitespace-normal leading-tight">{t.addToCart}</span>
              </Button>

              <Button 
                onClick={() => window.open(whatsappUrl, '_blank')}
                className="flex-1 h-16 bg-[#25D366] hover:bg-[#128C7E] text-white gap-3 rounded-full text-xl font-bold shadow-xl transition-all hover:scale-[1.02] flex items-center justify-center px-4"
              >
                <MessageCircle className="h-6 w-6 fill-current" />
                <span className="whitespace-normal leading-tight">{t.orderOnWhatsapp}</span>
              </Button>
            </div>
            
            <p className="text-sm text-muted-foreground font-medium bg-muted/30 p-4 rounded-2xl border border-dashed text-center md:text-start">
              {t.secureContact}
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
