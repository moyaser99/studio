'use client';

import * as React from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ProductCard from '@/components/product/ProductCard';
import { useFirestore, useCollection } from '@/firebase';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { useMemoFirebase } from '@/firebase/use-memo-firebase';
import { Loader2, ArrowRight } from 'lucide-react';
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

  // Fetch category data to get nameAr
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

  const { data: products, loading, error } = useCollection(productsQuery);

  const displayCategoryName = category 
    ? (lang === 'ar' ? (category as any).nameAr : ((category as any).nameEn || getTranslatedCategory((category as any).nameAr)))
    : '';

  if (catLoading) {
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

  if (!category && !loading) {
    return (
      <div className="min-h-screen flex flex-col" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
        <Header />
        <main className="flex-1 flex flex-col items-center justify-center p-6 space-y-4">
          <h1 className="text-2xl font-bold font-headline">{t.categoryNotFound}</h1>
          <p className="text-muted-foreground">{t.sorryCategoryNotFound}</p>
          <Link href="/">
            <Button variant="outline" className="rounded-full gap-2">
              <ArrowRight className="h-4 w-4" /> {t.backToHome}
            </Button>
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <Header />
      <main className="flex-1">
        <section className="bg-primary/5 py-12 md:py-20 border-b">
          <div className="container mx-auto px-4 text-start">
            <h1 className="text-4xl md:text-5xl font-bold font-headline mb-4">{displayCategoryName}</h1>
            <p className="text-muted-foreground text-lg max-w-2xl">
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
              <div className="text-center py-20 bg-destructive/5 rounded-3xl border border-destructive/20 max-w-lg mx-auto">
                <h3 className="text-xl font-bold text-destructive mb-2">{t.errorOccurred}</h3>
                <p className="text-muted-foreground text-sm">{t.comeBackLater}</p>
              </div>
            ) : products && products.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {products.map((product: any) => (
                  <ProductCard 
                    key={product.id} 
                    product={{
                      id: product.id,
                      name: product.name,
                      nameEn: product.nameEn,
                      price: product.price,
                      categoryName: product.categoryName,
                      categoryNameEn: product.categoryNameEn,
                      image: product.imageUrl,
                    }} 
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-muted/20 rounded-[3rem] border-2 border-dashed border-primary/20 max-w-2xl mx-auto px-6">
                <p className="text-muted-foreground text-xl mb-6">{t.noProductsInCategory}</p>
                <Link href="/products">
                   <Button className="rounded-full px-8 h-12 font-bold shadow-md bg-[#D4AF37] hover:bg-[#B8962D]">{t.exploreAll}</Button>
                </Link>
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
