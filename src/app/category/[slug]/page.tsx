'use client';

import * as React from 'react';
import ProductCard from '@/components/product/ProductCard';
import { useFirestore, useCollection } from '@/firebase';
import { collection, query, where, limit } from 'firebase/firestore';
import { useMemoFirebase } from '@/firebase/use-memo-firebase';
import { Loader2, ArrowRight, PackageOpen } from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = React.use(params);
  const rawSlug = resolvedParams.slug;
  const { lang, t, getTranslatedCategory } = useTranslation();
  
  const slug = React.useMemo(() => {
    try {
      return decodeURIComponent(rawSlug).toLowerCase();
    } catch (e) {
      return rawSlug.toLowerCase();
    }
  }, [rawSlug]);

  const db = useFirestore();

  const categoryQuery = useMemoFirebase(() => {
    if (!db || !slug) return null;
    return query(collection(db, 'categories'), where('slug', '==', slug), limit(1));
  }, [db, slug]);
  const { data: categoryData, loading: catLoading } = useCollection(categoryQuery);
  const category = categoryData && categoryData.length > 0 ? categoryData[0] : null;

  const productsQuery = useMemoFirebase(() => {
    if (!db || !slug) return null;
    return query(
      collection(db, 'products'),
      where('category', '==', slug)
    );
  }, [db, slug]);

  const { data: rawProducts, loading, error } = useCollection(productsQuery);

  const products = React.useMemo(() => {
    if (!rawProducts) return [];
    return rawProducts.filter((p: any) => p.isHidden !== true);
  }, [rawProducts]);

  const displayCategoryName = category 
    ? (lang === 'ar' ? (category as any).nameAr : ((category as any).nameEn || getTranslatedCategory((category as any).nameAr)))
    : '';

  if (catLoading) {
    return (
      <div className="flex-1 flex items-center justify-center p-20">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!category && !catLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12 space-y-4">
        <div className="bg-primary/5 p-6 rounded-full mb-4">
           <PackageOpen className="h-12 w-12 text-primary/40" />
        </div>
        <h1 className="text-xl md:text-2xl font-bold font-headline">{t.categoryNotFound}</h1>
        <p className="text-muted-foreground text-center">{t.sorryCategoryNotFound}</p>
        <Link href="/">
          <Button variant="outline" className="rounded-full gap-2">
            <ArrowRight className="h-4 w-4" /> {t.backToHome}
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full">
      <section className="bg-primary/5 py-10 md:py-20 border-b">
        <div className="container mx-auto px-4 text-start">
          <h1 className="text-3xl md:text-5xl font-bold font-headline mb-4">{displayCategoryName}</h1>
          <p className="text-muted-foreground text-base md:text-lg max-w-2xl">
            {t.browseOurCollection}
          </p>
        </div>
      </section>

      <section className="py-12 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
          ) : error ? (
            <div className="text-center py-20 bg-destructive/5 rounded-3xl border border-destructive/20 max-w-lg mx-auto px-4">
              <h3 className="text-xl font-bold text-destructive mb-2">{t.errorOccurred}</h3>
              <p className="text-muted-foreground text-sm">{t.comeBackLater}</p>
            </div>
          ) : products && products.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
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
            <div className="text-center py-16 md:py-24 bg-white rounded-[2rem] md:rounded-[4rem] shadow-xl border border-primary/10 max-w-2xl mx-auto px-6 md:px-10">
              <div className="bg-primary/5 w-20 h-20 md:w-32 md:h-32 rounded-full flex items-center justify-center mx-auto mb-8 md:mb-10">
                <PackageOpen className="h-12 w-12 md:h-16 md:w-16 text-primary/30" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold mb-4">{lang === 'ar' ? 'لا توجد منتجات في هذا القسم حالياً' : 'No products in this category yet'}</h2>
              <p className="text-muted-foreground text-base md:text-lg mb-8 md:mb-10">
                {lang === 'ar' ? 'يرجى مراجعة القسم لاحقاً أو استكشاف باقي مجموعتنا الفاخرة.' : 'Please check back later or explore the rest of our luxury collection.'}
              </p>
              <Link href="/products">
                 <Button className="rounded-full px-8 md:px-12 h-12 md:h-16 text-lg md:text-xl font-bold shadow-xl bg-[#D4AF37] hover:bg-[#B8962D]">{t.exploreAll}</Button>
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
