
'use client';

import React from 'react';
import ProductCard from '@/components/product/ProductCard';
import { useFirestore, useCollection } from '@/firebase';
import { collection, query } from 'firebase/firestore';
import { useMemoFirebase } from '@/firebase/use-memo-firebase';
import { Loader2, PackageSearch } from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';

export default function AllProductsPage() {
  const db = useFirestore();
  const { lang, t } = useTranslation();

  const allProductsQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, 'products'));
  }, [db]);

  const { data: rawProducts, loading, error } = useCollection(allProductsQuery);

  const products = React.useMemo(() => {
    if (!rawProducts) return [];
    return rawProducts.filter((p: any) => p.isHidden !== true);
  }, [rawProducts]);

  return (
    <div className="w-full">
      <section className="bg-primary/5 py-10 md:py-20 border-b">
        <div className="container mx-auto px-4 text-start">
          <h1 className="text-3xl md:text-5xl font-bold font-headline mb-4">{t.allProducts}</h1>
          <p className="text-muted-foreground text-base md:text-lg max-w-2xl">
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
            <div className="text-center py-20 bg-destructive/5 rounded-3xl border border-destructive/20 mx-4">
              <h3 className="text-xl font-bold text-destructive mb-2">{t.errorOccurred}</h3>
              <p className="text-muted-foreground">{t.comeBackLater}</p>
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
                    categoryName: product.categoryName,
                    categoryNameEn: product.categoryNameEn,
                    image: product.imageUrl,
                  }} 
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 md:py-24 bg-white rounded-[2rem] md:rounded-[4rem] shadow-xl border border-primary/10 max-w-2xl mx-auto px-6 md:px-10">
              <div className="bg-primary/5 w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center mx-auto mb-6 md:mb-8">
                <PackageSearch className="h-8 w-8 md:h-10 md:w-10 text-primary/40" />
              </div>
              <p className="text-muted-foreground text-lg md:text-xl">{t.noProductsFound}</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
