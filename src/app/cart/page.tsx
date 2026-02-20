
'use client';

import React from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useCart } from '@/context/CartContext';
import { useTranslation } from '@/hooks/use-translation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Trash2, 
  Plus, 
  Minus, 
  ShoppingBag, 
  ArrowRight, 
  ArrowLeft
} from 'lucide-react';
import Link from 'next/link';
import { Separator } from '@/components/ui/separator';

export default function CartPage() {
  const { cartItems, updateQuantity, removeFromCart, totalPrice } = useCart();
  const { t, lang } = useTranslation();

  return (
    <div className="min-h-screen flex flex-col bg-muted/5 overflow-x-hidden" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8 md:py-12">
        <h1 className="text-3xl md:text-4xl font-black font-headline text-primary mb-8 md:mb-10 flex items-center gap-3 justify-start">
          <ShoppingBag className="h-8 w-8 md:h-10 md:w-10" /> {t.shoppingCart}
        </h1>

        {cartItems.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-10 items-start">
            {/* Items List */}
            <div className="lg:col-span-2 space-y-4 md:space-y-6">
              {cartItems.map((item) => (
                <Card key={item.id} className="rounded-[1.5rem] md:rounded-[2.5rem] overflow-hidden border-none shadow-lg bg-white hover:shadow-xl transition-all duration-300">
                  <CardContent className="p-4 md:p-6">
                    <div className="flex flex-col sm:flex-row items-center gap-4 md:gap-6">
                      <div className="relative h-24 w-24 md:h-32 md:w-32 rounded-2xl md:rounded-3xl overflow-hidden bg-muted flex-shrink-0">
                        <img 
                          src={item.image} 
                          alt={item.name} 
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://picsum.photos/seed/placeholder/200/200';
                          }}
                        />
                      </div>
                      
                      <div className="flex-1 text-center sm:text-start space-y-1">
                        <h3 className="text-lg md:text-xl font-bold line-clamp-1">
                          {lang === 'ar' ? item.name : (item.nameEn || item.name)}
                        </h3>
                        <p className="text-xl md:text-2xl font-black text-primary">
                          ${item.price.toFixed(2)}
                        </p>
                      </div>

                      <div className="flex items-center gap-3 md:gap-4 bg-muted/30 p-1 rounded-full border">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="rounded-full h-8 w-8 md:h-10 md:w-10 hover:bg-white"
                          onClick={() => updateQuantity(item.id, -1)}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="text-lg md:text-xl font-black w-6 md:w-8 text-center">{item.quantity}</span>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="rounded-full h-8 w-8 md:h-10 md:w-10 hover:bg-white"
                          onClick={() => updateQuantity(item.id, 1)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>

                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="rounded-full text-destructive hover:bg-destructive/10"
                        onClick={() => removeFromCart(item.id)}
                      >
                        <Trash2 className="h-5 w-5 md:h-6 md:w-6" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Summary Box */}
            <div className="lg:col-span-1">
              <Card className="rounded-[2rem] md:rounded-[3rem] border-none shadow-xl bg-white overflow-hidden sticky top-24 md:top-32">
                <div className="bg-primary/5 p-6 md:p-8 border-b">
                  <h2 className="text-xl md:text-2xl font-bold font-headline text-start">{t.orderSummary}</h2>
                </div>
                <CardContent className="p-6 md:p-8 space-y-4 md:space-y-6">
                  <div className="flex justify-between text-base md:text-lg font-medium">
                    <span className="text-muted-foreground">{t.subtotal}</span>
                    <span className="font-bold">${totalPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-base md:text-lg font-medium">
                    <span className="text-muted-foreground">{t.shippingFee}</span>
                    <span className="text-[#D4AF37] font-bold">{t.free}</span>
                  </div>
                  <Separator className="opacity-50" />
                  <div className="flex justify-between text-xl md:text-2xl font-black">
                    <span>{t.total}</span>
                    <span className="text-primary">${totalPrice.toFixed(2)}</span>
                  </div>
                  
                  <Link href="/checkout" className="block w-full pt-2">
                    <Button className="w-full h-14 md:h-16 rounded-full text-lg md:text-xl font-bold bg-[#D4AF37] hover:bg-[#B8962D] text-white shadow-lg gap-2">
                      {t.checkout}
                      {lang === 'ar' ? <ArrowLeft className="h-5 w-5 md:h-6 md:w-6" /> : <ArrowRight className="h-5 w-5 md:h-6 md:w-6" />}
                    </Button>
                  </Link>
                  
                  <Link href="/products" className="block text-center text-primary font-bold hover:underline text-sm md:text-base">
                    {lang === 'ar' ? 'متابعة التسوق' : 'Continue Shopping'}
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          <div className="py-16 md:py-24 text-center bg-white rounded-[2rem] md:rounded-[4rem] shadow-xl border border-primary/10 max-w-2xl mx-auto px-6 md:px-10">
            <div className="bg-primary/5 w-24 h-24 md:w-32 md:h-32 rounded-full flex items-center justify-center mx-auto mb-8 md:mb-10">
              <ShoppingBag className="h-12 w-12 md:h-16 md:w-16 text-primary/30" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold mb-4">{t.cartEmpty}</h2>
            <p className="text-muted-foreground text-base md:text-lg mb-8 md:mb-10">
              {lang === 'ar' ? 'يبدو أنك لم تختر أي منتج بعد، تصفح منتجاتنا الفاخرة الآن.' : 'Looks like you haven\'t added any items yet. Explore our luxury selection.'}
            </p>
            <Link href="/products">
              <Button size="lg" className="rounded-full px-8 md:px-12 h-14 md:h-16 text-lg md:text-xl font-bold shadow-xl">
                {t.startShopping}
              </Button>
            </Link>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
