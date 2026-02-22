'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import ProductCard from '@/components/product/ProductCard';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Loader2, Package, Sparkles } from 'lucide-react';
import { useFirestore, useCollection, useUser, useDoc } from '@/firebase';
import { collection, query, limit, doc, orderBy, where } from 'firebase/firestore';
import { useMemoFirebase } from '@/firebase/use-memo-firebase';
import { useTranslation } from '@/hooks/use-translation';

const ADMIN_EMAIL = 'mohammad.dd.my@gmail.com';
const ADMIN_PHONE = '+962780334074';

const FALLBACK_STYLES = [
  'linear-gradient(135deg, #F8C8DC 0%, #D4AF37 100%)',
  'radial-gradient(circle at center, #F8C8DC 40%, #D4AF37 100%)',
  'repeating-linear-gradient(45deg, #F8C8DC, #F8C8DC 10px, #D4AF37 10px, #D4AF37 20px)',
  'linear-gradient(to bottom, #F8C8DC, white)',
  'conic-gradient(from 90deg at 50% 50%, #F8C8DC, #D4AF37, #F8C8DC)',
  'linear-gradient(to top, #F8C8DC, #D4AF37)',
];

function CategoryImage({ category, index }: { category: any, index: number }) {
  const db = useFirestore();
  const { lang, t, getTranslatedCategory } = useTranslation();
  
  const categoryProductQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(
      collection(db, 'products'),
      where('category', '==', category.slug),
      limit(5)
    );
  }, [db, category.slug]);

  const { data: rawProducts, loading } = useCollection(categoryProductQuery);

  const product = useMemo(() => {
    if (!rawProducts) return null;
    return rawProducts.find((p: any) => p.isHidden !== true);
  }, [rawProducts]);

  const productImage = product?.imageUrl || product?.image || (product as any)?.src || null;
  const isNew = product?.createdAt?.seconds && (Date.now() / 1000 - product.createdAt.seconds < 172800);
  
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

  const useOptimized = isImageOptimizable(productImage);
  const fallbackStyle = FALLBACK_STYLES[index % FALLBACK_STYLES.length];
  const catName = lang === 'ar' ? category.nameAr : (category.nameEn || getTranslatedCategory(category.nameAr));

  return (
    <div className="relative aspect-square rounded-full overflow-hidden border-2 border-transparent group-hover:border-primary transition-all p-1 bg-white shadow-sm">
      {loading ? (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/20">
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
        </div>
      ) : productImage ? (
        <div className="relative h-full w-full overflow-hidden rounded-full">
          {useOptimized ? (
            <Image
              src={productImage}
              alt={catName}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-110"
            />
          ) : (
            <img
              src={productImage}
              alt={catName}
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          )}
          {isNew && (
            <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <span className="bg-primary text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-transform">
                {t.new}
              </span>
            </div>
          )}
        </div>
      ) : (
        <div
          className="absolute inset-0 h-full w-full rounded-full transition-all duration-500 group-hover:opacity-90 group-hover:scale-105 flex items-center justify-center"
          style={{ background: fallbackStyle }}
        >
          <Sparkles className="h-8 w-8 text-white/50 animate-pulse" />
        </div>
      )}
    </div>
  );
}

export default function Home() {
  const db = useFirestore();
  const { user, loading: authLoading } = useUser();
  const { t, lang, getTranslatedCategory } = useTranslation();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  
  const isAdmin = !authLoading && !!user && (user.email === ADMIN_EMAIL || user.phoneNumber === ADMIN_PHONE);

  const heroRef = useMemoFirebase(() => {
    if (!db) return null;
    return doc(db, 'siteSettings', 'heroSection');
  }, [db]);
  
  const { data: heroDoc, loading: heroLoading } = useDoc(heroRef);

  const productsQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, 'products'), limit(20));
  }, [db]);
  
  const { data: rawProducts, loading: productsLoading } = useCollection(productsQuery);

  const products = useMemo(() => {
    if (!rawProducts) return [];
    return rawProducts.filter((p: any) => p.isHidden !== true).slice(0, 8);
  }, [rawProducts]);

  const categoriesQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, 'categories'), orderBy('displayOrder', 'asc'));
  }, [db]);

  const { data: categories, loading: categoriesLoading } = useCollection(categoriesQuery);

  const heroImage = heroDoc?.imageUrl;

  if (!mounted) {
    return (
      <div className="w-full h-[600px] bg-[#F8E8E8] flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary/40" />
      </div>
    );
  }

  return (
    <div className="flex flex-col overflow-x-hidden w-full">
      <section 
        className="relative w-full h-[500px] md:h-[800px] flex items-center transition-all duration-700 bg-[#F8E8E8]"
        style={{
          backgroundImage: heroImage ? `url(${heroImage})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-start from-white/95 via-white/60 to-transparent md:from-white/80 md:via-white/40" />
        
        <div className="container relative mx-auto px-4 md:px-6 z-10">
          <div className="max-w-[800px] space-y-6 md:space-y-8 text-start ps-2 md:ps-12">
            <div className="space-y-4">
              <div className="flex items-center gap-2 justify-start text-primary font-bold tracking-widest text-sm md:text-base animate-in fade-in slide-in-from-start-5 duration-700">
                <Sparkles className="h-4 w-4 md:h-5 md:w-5" /> {t.exclusiveFromUSA}
              </div>
              <h1 className="text-4xl font-bold tracking-tight sm:text-7xl lg:text-8xl text-foreground font-headline leading-[1.1] animate-in fade-in slide-in-from-start-10 duration-1000">
                {t.elevateDaily.split(' ').slice(0, 2).join(' ')} <br/>
                <span className="text-primary">{t.elevateDaily.split(' ').slice(2).join(' ')}</span>
              </h1>
              <p className="max-w-[600px] text-muted-foreground text-lg md:text-3xl leading-relaxed font-medium animate-in fade-in slide-in-from-start-10 duration-1000 delay-200">
                {t.luxurySelection}
              </p>
            </div>
            <div className="flex flex-wrap gap-4 md:gap-5 animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-300">
              <Link href="/products">
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-white px-8 md:px-12 h-12 md:h-16 rounded-full text-lg md:text-xl font-bold shadow-2xl transition-all hover:scale-105">
                  {t.shopCollection}
                </Button>
              </Link>
              {isAdmin && (
                <Link href="/admin">
                  <Button variant="outline" size="lg" className="border-primary/50 bg-white/50 backdrop-blur-md text-primary hover:bg-primary/10 px-8 md:px-12 h-12 md:h-16 rounded-full font-bold text-base md:text-lg shadow-xl">
                    {t.manageStore}
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
        
        {heroLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/20 backdrop-blur-sm">
            <Loader2 className="h-10 w-10 animate-spin text-primary/40" />
          </div>
        )}
      </section>

      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-12 md:mb-16 gap-4">
            <div className="text-start">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight font-headline mb-4">{t.shopByCategory}</h2>
              <p className="text-muted-foreground text-base md:text-lg">{t.carefullySelected}</p>
            </div>
            <Link href="/products" className="self-end md:self-auto">
              <Button variant="ghost" className="text-primary gap-2 hover:bg-primary/5 rounded-full text-base md:text-lg">
                {t.exploreAll} {lang === 'ar' ? <ArrowLeft className="h-5 w-5" /> : <ArrowRight className="h-5 w-5" />}
              </Button>
            </Link>
          </div>
          
          {categoriesLoading ? (
            <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary/30" /></div>
          ) : categories && categories.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 md:gap-10">
              {categories.map((category: any, idx: number) => (
                <Link key={category.id} href={`/category/${category.slug}`} className="group space-y-4 md:space-y-6 text-center">
                  <CategoryImage 
                    category={category} 
                    index={idx}
                  />
                  <span className="block font-bold text-lg md:text-xl group-hover:text-primary transition-colors">
                    {lang === 'ar' ? category.nameAr : (category.nameEn || getTranslatedCategory(category.nameAr))}
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">{t.comeBackLater}</div>
          )}
        </div>
      </section>

      <section className="py-16 md:py-24 bg-secondary/5 border-y">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-start mb-12 md:mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight font-headline mb-4">{t.latestProducts}</h2>
            <p className="text-muted-foreground text-base md:text-lg">{t.latestArrivals}</p>
          </div>
          
          {productsLoading ? (
            <div className="flex justify-center items-center py-24">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
          ) : products && products.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-10">
              {products.map((product: any) => (
                <ProductCard 
                  key={product.id} 
                  product={{
                    id: product.id,
                    name: product.name,
                    nameEn: product.nameEn,
                    price: product.price,
                    discountPercentage: product.discountPercentage,
                    categoryName: product.categoryName,
                    categoryNameEn: product.categoryNameEn,
                    image: product.imageUrl,
                  }} 
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 md:py-24 bg-white rounded-[2rem] md:rounded-[4rem] border-2 border-dashed border-primary/20 mx-4">
              <div className="bg-primary/5 w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center mx-auto mb-6 md:mb-8">
                <Package className="h-10 w-10 md:h-12 md:w-12 text-primary/40" />
              </div>
              <p className="text-muted-foreground text-lg md:text-xl mb-6 md:mb-8">
                {isAdmin ? t.emptyStock : t.comeBackLater}
              </p>
              {isAdmin && (
                <Link href="/admin">
                   <Button className="rounded-full px-8 md:px-12 h-12 md:h-14 text-lg md:text-xl font-bold shadow-lg bg-[#D4AF37] hover:bg-[#B8962D]">{t.addFirstProduct}</Button>
                </Link>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
