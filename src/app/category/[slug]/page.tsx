'use client';

import { useParams } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ProductCard from '@/components/product/ProductCard';
import { CATEGORIES } from '@/lib/data';
import { useFirestore, useCollection } from '@/firebase';
import { collection, query, where, orderBy } from 'firebase/firestore';
import { useMemoFirebase } from '@/firebase/use-memo-firebase';
import { Loader2, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function CategoryPage() {
  const { slug } = useParams();
  const db = useFirestore();
  
  const category = CATEGORIES.find(c => c.slug === slug);

  const productsQuery = useMemoFirebase(() => {
    if (!db || !slug) return null;
    return query(
      collection(db, 'products'),
      where('category', '==', slug),
      orderBy('createdAt', 'desc')
    );
  }, [db, slug]);

  const { data: products, loading } = useCollection(productsQuery);

  if (!category) {
    return (
      <div className="min-h-screen flex flex-col" dir="rtl">
        <Header />
        <main className="flex-1 flex flex-col items-center justify-center p-6 space-y-4">
          <h1 className="text-2xl font-bold">القسم غير موجود</h1>
          <Link href="/">
            <Button variant="outline" className="rounded-full gap-2">
              <ArrowRight className="h-4 w-4" /> العودة للرئيسية
            </Button>
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col" dir="rtl">
      <Header />
      <main className="flex-1">
        {/* Category Header */}
        <section className="bg-primary/5 py-12 md:py-20 border-b">
          <div className="container mx-auto px-4 text-right">
            <h1 className="text-4xl md:text-5xl font-bold font-headline mb-4">{category.name}</h1>
            <p className="text-muted-foreground text-lg max-w-2xl">
              تصفح مجموعتنا المختارة من أفضل منتجات {category.name} في YourGroceriesUSA.
            </p>
          </div>
        </section>

        {/* Product Grid */}
        <section className="py-12 md:py-24">
          <div className="container mx-auto px-4 md:px-6">
            {loading ? (
              <div className="flex justify-center items-center py-20">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
              </div>
            ) : products && products.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {products.map((product: any) => (
                  <ProductCard 
                    key={product.id} 
                    product={{
                      id: product.id,
                      name: product.name,
                      price: product.price,
                      categoryName: product.categoryName,
                      image: product.imageUrl,
                    }} 
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-muted/20 rounded-3xl border-2 border-dashed">
                <p className="text-muted-foreground">لا توجد منتجات حالياً في هذا القسم.</p>
                <Link href="/">
                   <Button className="mt-4 rounded-full">استكشاف الأقسام الأخرى</Button>
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
