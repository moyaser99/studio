
'use client';

import React from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useTranslation } from '@/hooks/use-translation';
import { Button } from '@/components/ui/button';
import { CheckCircle2, ShoppingBag, ArrowLeft, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function OrderSuccessPage() {
  const { t, lang } = useTranslation();

  return (
    <div className="min-h-screen flex flex-col bg-muted/5" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <Header />
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-xl w-full bg-white rounded-[4rem] shadow-2xl border border-primary/10 p-12 text-center space-y-8 animate-in fade-in zoom-in duration-500">
          <div className="relative mx-auto w-32 h-32 bg-primary/10 rounded-full flex items-center justify-center">
            <CheckCircle2 className="h-20 w-20 text-[#D4AF37] animate-bounce" />
            <div className="absolute inset-0 rounded-full border-4 border-[#D4AF37]/30 animate-ping"></div>
          </div>
          
          <div className="space-y-4">
            <h1 className="text-4xl font-black font-headline text-primary">
              {lang === 'ar' ? 'شكراً لثقتكم بنا!' : 'Thank You for Your Trust!'}
            </h1>
            <p className="text-xl text-muted-foreground font-medium">
              {lang === 'ar' 
                ? 'تم استلام طلبك بنجاح. سنقوم بالتواصل معك قريباً لتأكيد الشحن.' 
                : 'Your order has been successfully placed. We will contact you soon to confirm shipping.'}
            </p>
          </div>

          <div className="pt-6 flex flex-col gap-4">
            <Link href="/products">
              <Button size="lg" className="w-full h-16 rounded-full text-xl font-bold bg-[#D4AF37] hover:bg-[#B8962D] text-white shadow-xl gap-2">
                <ShoppingBag className="h-6 w-6" />
                {lang === 'ar' ? 'العودة للتسوق' : 'Return to Shopping'}
              </Button>
            </Link>
            
            <Link href="/">
              <Button variant="ghost" className="text-primary font-bold hover:underline gap-2">
                {lang === 'ar' ? 'الرئيسية' : 'Home'}
                {lang === 'ar' ? <ArrowLeft className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
              </Button>
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
