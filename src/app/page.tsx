
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ProductCard from '@/components/product/ProductCard';
import { CATEGORIES, Category } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2, Package, Sparkles } from 'lucide-react';
import { useFirestore, useCollection, useUser, useDoc } from '@/firebase';
import { collection, query, orderBy, limit, where, doc } from 'firebase/firestore';
import { useMemoFirebase } from '@/firebase/use-memo-firebase';

const ADMIN_EMAIL = 'mohammad.dd.my@gmail.com';
const ADMIN_PHONE = '+962780334074';

// Luxury Gradient Map based on Pink & Gold theme
const CATEGORY_STYLES: Record<string, string> = {
  makeup: 'linear-gradient(135deg, #F8C8DC 0%, #D4AF37 100%)',
  watches: 'radial-gradient(circle at center, #F8C8DC 40%, #D4AF37 100%)',
  bags: 'repeating-linear-gradient(45deg, #F8C8DC, #F8C8DC 10px, #D4AF37 10px, #D4AF37 20px)',
  skincare: 'linear-gradient(to bottom, #F8C8DC, white)',
  vitamins: 'conic-gradient(from 90deg at 50% 50%, #F8C8DC, #D4AF37, #F8C8DC)',
  haircare: 'linear-gradient(to top, #F8C8DC, #D4AF37)',
};

function CategoryImage({ category, fallbackStyle }: { category: Category, fallbackStyle?: string }) {
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

  const product = products && products.length > 0 ? products[0] : null;
  const productImage = product?.imageUrl || null;
  
  // Check if product is "New" (added in last 48 hours)
  // Firestore timestamps need to be converted to JS Date
  const isNew = product?.createdAt?.toDate 
    ? (new Date().getTime() - product.createdAt.toDate().getTime()) < (48 * 60 * 60 * 1000)
    : false;

  return (
    <div className="relative aspect-square rounded-full overflow-hidden border-2 border-transparent group-hover:border-primary transition-all p-1 bg-white shadow-sm">
      {loading ? (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/20">
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
        </div>
      ) : productImage ? (
        <div className="relative h-full w-full overflow-hidden rounded-full">
          <Image
            src={productImage}
            alt={category.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
          />
          {isNew && (
            <div className="absolute inset-0 bg-black/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="bg-primary text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-2xl backdrop-blur-sm">جديد</span>
            </div>
          )}
        </div>
      ) : (
        <div
          className="absolute inset-0 h-full w-full rounded-full transition-all duration-500 group-hover:opacity-90 group-hover:scale-105 flex items-center justify-center"
          style={{ background: fallbackStyle || '#F8C8DC' }}
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
    return query(collection(db, 'products'), orderBy('createdAt', 'desc'), limit(8));
  }, [db]);
  
  const { data: products, loading: productsLoading } = useCollection(productsQuery);

  const heroImage = heroDoc?.imageUrl;

  if (!mounted) {
    return (
      <div className="flex min-h-screen flex-col" dir="rtl">
        <Header />
        <main className="flex-1">
          <div className="w-full h-[600px] bg-[#F8E8E8] flex items-center justify-center">
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
      <main className="flex-1 overflow-x-hidden">
        {/* Luxury Full-Width Hero Section */}
        <section 
          className="relative w-full h-[600px] md:h-[800px] flex items-center transition-all duration-700 bg-[#F8E8E8]"
          style={{
            backgroundImage: heroImage ? `url(${heroImage})` : 'none',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-l from-white/95 via-white/60 to-transparent md:from-white/80 md:via-white/40" />
          
          <div className="container relative mx-auto px-4 md:px-6 z-10">
            <div className="max-w-[800px] space-y-8 text-right pr-4 md:pr-12">
              <div className="space-y-4">
                <div className="flex items-center gap-2 justify-end text-primary font-bold tracking-widest animate-in fade-in slide-in-from-right-5 duration-700">
                  <Sparkles className="h-5 w-5" /> مجموعة حصرية من أمريكا
                </div>
                <h1 className="text-5xl font-bold tracking-tight sm:text-7xl lg:text-8xl text-foreground font-headline leading-[1.1] animate-in fade-in slide-in-from-right-10 duration-1000">
                  ارتقِ بأساسياتك <br/>
                  <span className="text-primary">اليومية</span>
                </h1>
                <p className="max-w-[600px] text-muted-foreground text-xl md:text-3xl leading-relaxed font-medium animate-in fade-in slide-in-from-right-10 duration-1000 delay-200">
                  اكتشف مختاراتنا الفاخرة من منتجات العناية والجمال ونمط الحياة الراقي.
                </p>
              </div>
              <div className="flex flex-wrap gap-5 animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-300">
                <Link href="/products">
                  <Button size="lg" className="bg-primary hover:bg-primary/90 text-white px-12 h-16 rounded-full text-xl font-bold shadow-2xl transition-all hover:scale-105">
                    تسوق المجموعة
                  </Button>
                </Link>
                {isAdmin && (
                  <Link href="/admin">
                    <Button variant="outline" size="lg" className="border-primary/50 bg-white/50 backdrop-blur-md text-primary hover:bg-primary/10 px-12 h-16 rounded-full font-bold text-lg shadow-xl">
                      إدارة المتجر
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

        {/* Categories Section */}
        <section className="py-24 bg-white">
          <div className="container mx-auto px-4 md:px-6">
            <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-4">
              <div className="text-right">
                <h2 className="text-4xl font-bold tracking-tight font-headline mb-4">تسوق حسب القسم</h2>
                <p className="text-muted-foreground text-lg">مجموعاتنا المختارة بعناية لتناسب ذوقك الرفيع</p>
              </div>
              <Link href="/products">
                <Button variant="ghost" className="text-primary gap-2 hover:bg-primary/5 rounded-full text-lg">
                  استكشف الكل <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-10">
              {CATEGORIES.map((category) => (
                <Link key={category.id} href={`/category/${category.slug}`} className="group space-y-6 text-center">
                  <CategoryImage 
                    category={category} 
                    fallbackStyle={CATEGORY_STYLES[category.slug]} 
                  />
                  <span className="block font-bold text-xl group-hover:text-primary transition-colors">{category.name}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Latest Products */}
        <section className="py-24 bg-secondary/5 border-y">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-right mb-16">
              <h2 className="text-4xl font-bold tracking-tight font-headline mb-4">أحدث المنتجات</h2>
              <p className="text-muted-foreground text-lg">اكتشف آخر ما وصل إلينا من ماركات عالمية فاخرة</p>
            </div>
            
            {productsLoading ? (
              <div className="flex justify-center items-center py-24">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
              </div>
            ) : products && products.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
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
              <div className="text-center py-24 bg-white rounded-[4rem] border-2 border-dashed border-primary/20">
                <div className="bg-primary/5 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8">
                  <Package className="h-12 w-12 text-primary/40" />
                </div>
                <p className="text-muted-foreground text-xl mb-8">
                  {isAdmin ? "المخزون فارغ حالياً. ابدأ بإضافة المنتجات." : "لا توجد منتجات حالياً. يرجى العودة لاحقاً."}
                </p>
                {isAdmin && (
                  <Link href="/admin">
                     <Button className="rounded-full px-12 h-14 text-xl font-bold shadow-lg">أضف أول منتج</Button>
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
