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
  ArrowLeft,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { Separator } from '@/components/ui/separator';

export default function CartPage() {
  const { cartItems, updateQuantity, removeFromCart, totalPrice, totalItems } = useCart();
  const { t, lang } = useTranslation();

  return (
    <div className="min-h-screen flex flex-col bg-muted/5 transition-all duration-300" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <Header />
      <main className="flex-1 container mx-auto px-4 py-12 md:px-6">
        <h1 className="text-4xl font-black font-headline text-primary mb-10 flex items-center gap-3 justify-start">
          <ShoppingBag className="h-10 w-10" /> {t.shoppingCart}
        </h1>

        {cartItems.length > 0 ? (
          <div className="grid lg:grid-cols-3 gap-10 items-start">
            {/* Items List */}
            <div className="lg:col-span-2 space-y-6">
              {cartItems.map((item) => (
                <Card key={item.id} className="rounded-[2.5rem] overflow-hidden border-none shadow-xl bg-white hover:shadow-2xl transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row items-center gap-6">
                      <div className="relative h-32 w-32 rounded-3xl overflow-hidden bg-muted flex-shrink-0">
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
                        <h3 className="text-xl font-bold line-clamp-1">
                          {lang === 'ar' ? item.name : (item.nameEn || item.name)}
                        </h3>
                        <p className="text-2xl font-black text-primary">
                          ${item.price.toFixed(2)}
                        </p>
                      </div>

                      <div className="flex items-center gap-4 bg-muted/30 p-1 rounded-full border">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="rounded-full h-10 w-10 hover:bg-white"
                          onClick={() => updateQuantity(item.id, -1)}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="text-xl font-black w-8 text-center">{item.quantity}</span>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="rounded-full h-10 w-10 hover:bg-white"
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
                        <Trash2 className="h-6 w-6" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Summary Box */}
            <div className="lg:col-span-1">
              <Card className="rounded-[3rem] border-none shadow-2xl bg-white overflow-hidden sticky top-32">
                <div className="bg-primary/5 p-8 border-b">
                  <h2 className="text-2xl font-bold font-headline text-start">{t.orderSummary}</h2>
                </div>
                <CardContent className="p-8 space-y-6">
                  <div className="flex justify-between text-lg font-medium">
                    <span className="text-muted-foreground">{t.subtotal}</span>
                    <span className="font-bold">${totalPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-medium">
                    <span className="text-muted-foreground">{t.shippingFee}</span>
                    <span className="text-[#D4AF37] font-bold">{t.free}</span>
                  </div>
                  <Separator className="opacity-50" />
                  <div className="flex justify-between text-2xl font-black">
                    <span>{t.total}</span>
                    <span className="text-primary">${totalPrice.toFixed(2)}</span>
                  </div>
                  
                  <Link href="/checkout" className="block w-full">
                    <Button className="w-full h-16 rounded-full text-xl font-bold bg-[#D4AF37] hover:bg-[#B8962D] text-white shadow-xl gap-2 mt-4">
                      {t.checkout}
                      {lang === 'ar' ? <ArrowLeft className="h-6 w-6" /> : <ArrowRight className="h-6 w-6" />}
                    </Button>
                  </Link>
                  
                  <Link href="/products" className="block text-center text-primary font-bold hover:underline">
                    {lang === 'ar' ? 'متابعة التسوق' : 'Continue Shopping'}
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          <div className="py-24 text-center bg-white rounded-[4rem] shadow-xl border border-primary/10 max-w-2xl mx-auto px-10">
            <div className="bg-primary/5 w-32 h-32 rounded-full flex items-center justify-center mx-auto mb-10">
              <ShoppingBag className="h-16 w-16 text-primary/30" />
            </div>
            <h2 className="text-3xl font-bold mb-4">{t.cartEmpty}</h2>
            <p className="text-muted-foreground text-lg mb-10">
              {lang === 'ar' ? 'يبدو أنك لم تختر أي منتج بعد، تصفح منتجاتنا الفاخرة الآن.' : 'Looks like you haven\'t added any items yet. Explore our luxury selection.'}
            </p>
            <Link href="/products">
              <Button size="lg" className="rounded-full px-12 h-16 text-xl font-bold shadow-xl">
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
