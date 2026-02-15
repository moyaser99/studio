
'use client';

import Image from 'next/image';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ProductCard from '@/components/product/ProductCard';
import { CATEGORIES, Category } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2, Package } from 'lucide-react';
import { useFirestore, useCollection, useUser, useDoc } from '@/firebase';
import { collection, query, orderBy, limit, where, doc } from 'firebase/firestore';
import { useMemoFirebase } from '@/firebase/use-memo-firebase';

const ADMIN_EMAIL = 'mohammad.dd.my@gmail.com';
const ADMIN_PHONE = '+962780334074';

/**
 * CategoryImage component fetches the latest product image for a specific category.
 */
function CategoryImage({ category }: { category: Category }) {
  const db = useFirestore();
  const categoryProductQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(
      collection(db, 'products'),
      where('category', '==', category.slug),
      orderBy('createdAt', 'desc'),
      limit(1)
    );
  }, [db, category.slug]);

  const { data: products, loading } = useCollection(categoryProductQuery);

  const displayImage = products && products.length > 0 && products[0].imageUrl 
    ? products[0].imageUrl 
    : `https://picsum.photos/seed/${category.slug}/400/400`;

  return (
    <div className="relative aspect-square rounded-full overflow-hidden border-2 border-transparent group-hover:border-primary transition-all p-1 bg-white shadow-sm">
      {loading ? (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/20">
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
        </div>
      ) : (
        <img
          src={displayImage}
          alt={category.name}
          className="absolute inset-0 h-full w-full object-cover rounded-full"
          onError={(e) => {
            (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${category.slug}-err/400/400`;
          }}
        />
      )}
    </div>
  );
}

export default function Home() {
  const db = useFirestore();
  const { user, loading: authLoading } = useUser();
  
  // Strict Dual-Factor Admin Logic (Email AND Phone)
  const isAdmin = !authLoading && !!user && 
    (user.email === ADMIN_EMAIL && user.phoneNumber === ADMIN_PHONE);

  // Dynamic Hero Section Fetch from siteSettings/heroSection
  const heroRef = useMemoFirebase(() => {
    if (!db) return null;
    return doc(db, 'siteSettings', 'heroSection');
  }, [db]);
  const { data: heroDoc, loading: heroLoading } = useDoc(heroRef);

  // Latest Products
  const productsQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, 'products'), orderBy('createdAt', 'desc'), limit(8));
  }, [db]);
  const { data: products, loading: productsLoading } = useCollection(productsQuery);

  const heroImage = heroDoc?.imageUrl;

  return (
    <div className="flex min-h-screen flex-col" dir="rtl">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-secondary/20 to-background overflow-hidden">
          <div className="container mx-auto px-4 md:px-6">
            <div className="grid gap-12 lg:grid-cols-2 items-center">
              <div className="flex flex-col justify-center space-y-6 text-right">
                <div className="space-y-4">
                  <h1 className="text-4xl font-bold tracking-tight sm:text-6xl text-foreground font-headline leading-tight">
                    ارتقِ بأساسياتك اليومية <br/><span className="text-primary">بلمسة من الفخامة</span>
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl leading-relaxed">
                    اكتشف مجموعة مختارة من المكياج الفاخر والعناية بالبشرة وإكسسوارات نمط الحياة. الجودة تلتقي بالأناقة في YourGroceriesUSA.
                  </p>
                </div>
                <div className="flex flex-wrap gap-4">
                  <Link href="/category/makeup">
                    <Button size="lg" className="bg-primary hover:bg-primary/90 text-white px-10 rounded-full text-lg font-bold shadow-lg transition-transform hover:scale-105">
                      تسوق الآن
                    </Button>
                  </Link>
                  {!authLoading && isAdmin && (
                    <Link href="/admin">
                      <Button variant="outline" size="lg" className="border-primary text-primary hover:bg-primary/10 px-10 rounded-full font-bold">
                        لوحة التحكم
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
              <div className="relative aspect-square lg:aspect-[4/3] rounded-[2.5rem] overflow-hidden shadow-2xl ring-8 ring-white/50 bg-[#F8E8E8]">
                {heroLoading ? (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary/30" />
                  </div>
                ) : heroImage ? (
                  <img
                    src={heroImage}
                    alt="Premium Collection"
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-primary/20 font-black text-2xl tracking-tighter">
                    YourGroceriesUSA
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              </div>
            </div>
          </div>
        </section>

        {/* Dynamic Categories Grid */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4 md:px-6">
            <div className="flex items-center justify-between mb-12">
              <h2 className="text-3xl font-bold tracking-tight font-headline">تسوق حسب القسم</h2>
              <Link href="/category/makeup">
                <Button variant="ghost" className="text-primary gap-2 hover:bg-primary/5 rounded-full">
                  عرض جميع الأقسام <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
              {CATEGORIES.map((category) => (
                <Link key={category.id} href={`/category/${category.slug}`} className="group space-y-4 text-center">
                  <CategoryImage category={category} />
                  <span className="block font-bold text-lg group-hover:text-primary transition-colors">{category.name}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Products */}
        <section className="py-20 bg-secondary/5 border-y">
          <div className="container mx-auto px-4 md:px-6">
            <div className="flex items-center justify-between mb-12">
              <div className="space-y-1">
                <h2 className="text-3xl font-bold tracking-tight font-headline">أحدث المنتجات</h2>
                <p className="text-muted-foreground">اكتشف آخر ما وصل إلينا من ماركات عالمية</p>
              </div>
            </div>
            {productsLoading ? (
              <div className="flex justify-center items-center py-24">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
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
              <div className="text-center py-24 bg-white rounded-[3rem] border-2 border-dashed border-primary/20">
                <div className="bg-primary/5 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Package className="h-10 w-10 text-primary/40" />
                </div>
                <p className="text-muted-foreground text-lg mb-6">
                  {isAdmin ? "لا توجد منتجات حالياً. أضف منتجات من لوحة التحكم." : "لا توجد منتجات حالياً. يرجى العودة لاحقاً."}
                </p>
                {!authLoading && isAdmin && (
                  <Link href="/admin">
                     <Button className="rounded-full px-8 h-12 text-lg font-bold">إضافة منتج جديد</Button>
                  </Link>
                )}
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
