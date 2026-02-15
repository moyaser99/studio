
'use client';

import { useState, useEffect } from 'react';
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
 * Updated to wait for auth state to avoid premature permission errors.
 */
function CategoryImage({ category }: { category: Category }) {
  const db = useFirestore();
  const { loading: authLoading } = useUser();
  
  const categoryProductQuery = useMemoFirebase(() => {
    if (!db || authLoading) return null;
    return query(
      collection(db, 'products'),
      where('category', '==', category.slug),
      orderBy('createdAt', 'desc'),
      limit(1)
    );
  }, [db, category.slug, authLoading]);

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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Strict Dual-Factor Admin Logic (Email AND Phone)
  const isAdmin = !authLoading && !!user && 
    (user.email === ADMIN_EMAIL && user.phoneNumber === ADMIN_PHONE);

  // Dynamic Hero Section Fetch - Waits for auth state to be stable
  const heroRef = useMemoFirebase(() => {
    if (!db || authLoading) return null;
    return doc(db, 'siteSettings', 'heroSection');
  }, [db, authLoading]);
  
  const { data: heroDoc, loading: heroLoading } = useDoc(heroRef);

  // Latest Products - Now waits for authLoading to prevent permission flutters
  const productsQuery = useMemoFirebase(() => {
    if (!db || authLoading) return null;
    return query(collection(db, 'products'), orderBy('createdAt', 'desc'), limit(8));
  }, [db, authLoading]);
  const { data: products, loading: productsLoading } = useCollection(productsQuery);

  const heroImage = heroDoc?.imageUrl;

  if (!mounted) {
    return (
      <div className="flex min-h-screen flex-col" dir="rtl">
        <Header />
        <main className="flex-1">
          <div className="w-full h-[500px] md:h-[750px] bg-[#F8E8E8] flex items-center justify-center">
             <Loader2 className="h-10 w-10 animate-spin text-primary/40" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col" dir="rtl">
      <Header />
      <main className="flex-1">
        {/* Luxury Hero Banner Section */}
        <section 
          className="relative w-full min-h-[500px] md:min-h-[750px] flex items-center bg-[#F8E8E8] transition-all duration-700"
          style={{
            backgroundImage: heroImage ? `url(${heroImage})` : 'none',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-l from-white/95 via-white/70 to-transparent md:from-white/90 md:via-white/50" />
          
          <div className="container relative mx-auto px-4 md:px-6 z-10">
            <div className="max-w-[750px] space-y-8 text-right pr-2 md:pr-10">
              <div className="space-y-6">
                <h1 className="text-4xl font-bold tracking-tight sm:text-6xl lg:text-7xl text-foreground font-headline leading-[1.1] animate-in fade-in slide-in-from-right-10 duration-1000">
                  ارتقِ بأساسياتك اليومية <br/>
                  <span className="text-primary drop-shadow-sm">بلمسة من الفخامة</span>
                </h1>
                <p className="max-w-[550px] text-muted-foreground text-lg md:text-2xl leading-relaxed font-medium animate-in fade-in slide-in-from-right-10 duration-1000 delay-200">
                  اكتشف مجموعة مختارة من المكياج الفاخر والعناية بالبشرة وإكسسوارات نمط الحياة. الجودة تلتقي بالأناقة في YourGroceriesUSA.
                </p>
              </div>
              <div className="flex flex-wrap gap-5 animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-300">
                <Link href="/category/makeup">
                  <Button size="lg" className="bg-primary hover:bg-primary/90 text-white px-12 h-16 rounded-full text-xl font-bold shadow-2xl transition-all hover:scale-105 active:scale-95">
                    تسوق الآن
                  </Button>
                </Link>
                {isAdmin && (
                  <Link href="/admin">
                    <Button variant="outline" size="lg" className="border-primary/50 bg-white/40 backdrop-blur-md text-primary hover:bg-primary/10 px-12 h-16 rounded-full font-bold text-lg shadow-xl">
                      لوحة التحكم
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </div>
          
          {(heroLoading || authLoading) && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/20 backdrop-blur-sm">
              <Loader2 className="h-10 w-10 animate-spin text-primary/40" />
            </div>
          )}
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
                {isAdmin && (
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
