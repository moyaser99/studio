
'use client';

import React, { useEffect } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ProductCard from '@/components/product/ProductCard';
import { useFirestore, useCollection } from '@/firebase';
import { collection, query, orderBy, where } from 'firebase/firestore';
import { useMemoFirebase } from '@/firebase/use-memo-firebase';
import { Loader2, PackageSearch } from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';

export default function AllProductsPage() {
  const db = useFirestore();
  const { lang, t } = useTranslation();

  // Audit Step: Stable Query construction
  const allProductsQuery = useMemoFirebase(() => {
    if (!db) return null;
    try {
      return query(
        collection(db, 'products'),
        where('isHidden', '!=', true)
      );
    } catch (e) {
      console.error("[Audit] Failed to create products query:", e);
      return null;
    }
  }, [db]);

  const { data: products, loading, error } = useCollection(allProductsQuery);

  // Data Verification Step
  useEffect(() => {
    if (products) {
      console.log(`[Audit] Data verification: Fetched ${products.length} total products.`);
    }
    if (error) {
      console.error("[Audit] Firestore sync error:", error);
    }
  }, [products, error]);

  return (
    <div className="flex min-h-screen flex-col" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <Header />
      <main className="flex-1">
        <section className="bg-primary/5 py-12 md:py-20 border-b">
          <div className="container mx-auto px-4 text-start">
            <h1 className="text-4xl md:text-5xl font-bold font-headline mb-4">{t.allProducts}</h1>
            <p className="text-muted-foreground text-lg max-w-2xl">
              {t.allProductsDesc}
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
              <div className="text-center py-20 bg-destructive/5 rounded-3xl border border-destructive/20">
                <h3 className="text-xl font-bold text-destructive mb-2">{t.errorOccurred}</h3>
                <p className="text-muted-foreground">{t.comeBackLater}</p>
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
              <div className="text-center py-20 bg-muted/20 rounded-3xl border-2 border-dashed">
                <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <PackageSearch className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground">{t.noProductsFound}</p>
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
