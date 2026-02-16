
'use client';

import * as React from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ProductCard from '@/components/product/ProductCard';
import { CATEGORIES } from '@/lib/data';
import { useFirestore, useCollection } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import { useMemoFirebase } from '@/firebase/use-memo-firebase';
import { Loader2, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = React.use(params);
  const rawSlug = resolvedParams.slug;
  
  const slug = React.useMemo(() => {
    try {
      return decodeURIComponent(rawSlug).toLowerCase();
    } catch (e) {
      return rawSlug.toLowerCase();
    }
  }, [rawSlug]);

  const db = useFirestore();
  const category = CATEGORIES.find(c => c.slug === slug);

  // تبسيط الاستعلام بإزالة orderBy لتجنب الحاجة لفهارس مركبة (Composite Indexes) قد تسبب أخطاء صلاحيات
  const productsQuery = useMemoFirebase(() => {
    if (!db || !slug) return null;
    
    try {
      return query(
        collection(db, 'products'),
        where('category', '==', slug)
      );
    } catch (e) {
      return null;
    }
  }, [db, slug]);

  const { data: products, loading, error } = useCollection(productsQuery);

  if (!category) {
    return (
      <div className="min-h-screen flex flex-col" dir="rtl">
        <Header />
        <main className="flex-1 flex flex-col items-center justify-center p-6 space-y-4">
          <h1 className="text-2xl font-bold font-headline">القسم غير موجود</h1>
          <p className="text-muted-foreground">عذراً، لم نتمكن من العثور على القسم المطلوب.</p>
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
        <section className="bg-primary/5 py-12 md:py-20 border-b">
          <div className="container mx-auto px-4 text-right">
            <h1 className="text-4xl md:text-5xl font-bold font-headline mb-4">{category.name}</h1>
            <p className="text-muted-foreground text-lg max-w-2xl">
              تصفح مجموعتنا المختارة من أفضل منتجات {category.name} المستوردة حصرياً.
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
                <h3 className="text-xl font-bold text-destructive mb-2">تنبيه</h3>
                <p className="text-muted-foreground text-sm">لا توجد بيانات متاحة لهذا القسم حالياً.</p>
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
              <div className="text-center py-20 bg-muted/20 rounded-[3rem] border-2 border-dashed border-primary/20 max-w-2xl mx-auto px-6">
                <p className="text-muted-foreground text-xl mb-6">لا توجد منتجات حالياً في قسم {category.name}.</p>
                <Link href="/products">
                   <Button className="rounded-full px-8 h-12 font-bold shadow-md">استكشاف كافة الأقسام</Button>
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
