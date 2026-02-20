
'use client';

import React, { useState } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useCart } from '@/context/CartContext';
import { useTranslation } from '@/hooks/use-translation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  MapPin, 
  Phone, 
  User, 
  CheckCircle2, 
  ChevronLeft, 
  ChevronRight,
  ShoppingBag,
  Loader2
} from 'lucide-react';
import Link from 'next/link';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, useUser } from '@/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import emailjs from '@emailjs/browser';

export default function CheckoutPage() {
  const { cartItems, totalPrice, totalItems, clearCart } = useCart();
  const { t, lang } = useTranslation();
  const { toast } = useToast();
  const db = useFirestore();
  const { user } = useUser();
  const router = useRouter();
  
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    city: '',
    address: ''
  });

  const handlePlaceOrder = () => {
    if (!formData.fullName || !formData.phone || !formData.city || !formData.address) {
      toast({
        variant: "destructive",
        title: t.errorOccurred,
        description: t.completeFields
      });
      return;
    }

    if (!db) return;

    setLoading(true);

    const orderData = {
      customerInfo: {
        fullName: formData.fullName,
        phone: formData.phone,
        city: formData.city,
        address: formData.address
      },
      items: cartItems.map(item => ({
        id: item.id,
        name: item.name,
        nameEn: item.nameEn || '',
        price: item.price,
        quantity: item.quantity
      })),
      totalPrice,
      status: 'pending',
      paymentMethod: 'Cash on Delivery',
      createdAt: serverTimestamp(),
      userId: user?.uid || 'guest'
    };

    // Add order to Firestore
    addDoc(collection(db, 'orders'), orderData)
      .then((docRef) => {
        // Prepare EmailJS params
        const orderDetailsString = cartItems
          .map(item => `${lang === 'ar' ? item.name : (item.nameEn || item.name)} (x${item.quantity})`)
          .join(', ');

        const templateParams = {
          order_id: docRef.id,
          customer_name: formData.fullName,
          customer_phone: formData.phone,
          total_price: totalPrice.toFixed(2),
          order_details: orderDetailsString,
        };

        // Send Email Notification to Admin (Mohammad Jebrel)
        emailjs.send(
          process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!,
          process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID!,
          templateParams,
          process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY!
        ).catch(err => {
          // Log failure but don't block user experience
          console.error('EmailJS notification failed:', err);
        });
      })
      .catch(async (err) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: 'orders',
          operation: 'create',
          requestResourceData: orderData
        }));
      });

    // Proceed with UI cleanup and redirect immediately for a smooth experience
    toast({
      title: lang === 'ar' ? 'شكراً لك' : 'Thank You',
      description: lang === 'ar' ? 'تم استلام طلبك بنجاح' : 'Your order has been received.',
    });
    
    clearCart();
    router.push('/checkout/success');
  };

  if (totalItems === 0) {
    return (
      <div className="min-h-screen flex flex-col" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
        <Header />
        <main className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="bg-primary/5 w-24 h-24 rounded-full flex items-center justify-center mb-6">
            <ShoppingBag className="h-10 w-10 text-primary/40" />
          </div>
          <h1 className="text-2xl font-bold mb-4">{t.cartEmpty}</h1>
          <Link href="/products">
            <Button className="rounded-full px-8">{t.startShopping}</Button>
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-muted/5 transition-all duration-300" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <Header />
      <main className="flex-1 container mx-auto px-4 py-12 md:px-6">
        <div className="mb-10 text-start">
          <Link href="/cart" className="text-primary flex items-center gap-1 mb-2 hover:underline font-bold">
            {lang === 'ar' ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />} 
            {lang === 'ar' ? 'العودة للسلة' : 'Back to Cart'}
          </Link>
          <h1 className="text-4xl font-black font-headline text-primary flex items-center gap-3">
            <CheckCircle2 className="h-10 w-10" /> {t.checkoutTitle}
          </h1>
        </div>

        <div className="grid lg:grid-cols-3 gap-10 items-start">
          {/* Shipping Form */}
          <div className="lg:col-span-2 space-y-8">
            <Card className="rounded-[2.5rem] overflow-hidden border-none shadow-xl bg-white">
              <CardHeader className="bg-[#F8C8DC]/20 p-8 border-b border-primary/10">
                <CardTitle className="text-2xl font-bold font-headline text-start flex items-center gap-2">
                  <MapPin className="h-6 w-6 text-primary" /> {t.shippingInfo}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2 text-start">
                    <Label className="text-lg font-bold flex items-center gap-2">
                      <User className="h-4 w-4 text-[#D4AF37]" /> {t.fullName}
                    </Label>
                    <Input 
                      placeholder={t.namePlaceholder}
                      value={formData.fullName}
                      onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                      className="h-14 rounded-2xl border-2 border-primary/10 focus:border-[#D4AF37] focus:ring-[#D4AF37]"
                    />
                  </div>
                  <div className="space-y-2 text-start">
                    <Label className="text-lg font-bold flex items-center gap-2">
                      <Phone className="h-4 w-4 text-[#D4AF37]" /> {t.phoneNumber}
                    </Label>
                    <Input 
                      placeholder={t.phonePlaceholder}
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="h-14 rounded-2xl border-2 border-primary/10 focus:border-[#D4AF37] focus:ring-[#D4AF37]"
                    />
                  </div>
                </div>

                <div className="space-y-2 text-start">
                  <Label className="text-lg font-bold flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-[#D4AF37]" /> {t.city}
                  </Label>
                  <Input 
                    placeholder={t.city}
                    value={formData.city}
                    onChange={(e) => setFormData({...formData, city: e.target.value})}
                    className="h-14 rounded-2xl border-2 border-primary/10 focus:border-[#D4AF37] focus:ring-[#D4AF37]"
                  />
                </div>

                <div className="space-y-2 text-start">
                  <Label className="text-lg font-bold flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-[#D4AF37]" /> {t.detailedAddressLabel}
                  </Label>
                  <Textarea 
                    placeholder={t.addressPlaceholder}
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    className="min-h-[120px] rounded-[1.5rem] border-2 border-primary/10 focus:border-[#D4AF37] focus:ring-[#D4AF37]"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="rounded-[3rem] border-none shadow-2xl bg-white overflow-hidden sticky top-32">
              <div className="bg-primary/5 p-8 border-b">
                <h2 className="text-2xl font-bold font-headline text-start">{t.yourOrder}</h2>
              </div>
              <CardContent className="p-8 space-y-6">
                <div className="max-h-[300px] overflow-y-auto space-y-4 pr-2">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex items-center gap-4">
                      <div className="h-16 w-16 rounded-xl overflow-hidden bg-muted flex-shrink-0">
                        <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                      </div>
                      <div className="flex-1 text-start">
                        <p className="font-bold line-clamp-1">{lang === 'ar' ? item.name : (item.nameEn || item.name)}</p>
                        <p className="text-sm text-muted-foreground">{item.quantity} x ${item.price.toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <Separator className="opacity-50" />
                
                <div className="space-y-3">
                  <div className="flex justify-between text-lg font-medium">
                    <span className="text-muted-foreground">{t.subtotal}</span>
                    <span className="font-bold">${totalPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-medium">
                    <span className="text-muted-foreground">{t.shippingFee}</span>
                    <span className="text-[#D4AF37] font-bold">{t.free}</span>
                  </div>
                  <Separator className="opacity-30" />
                  <div className="flex justify-between text-3xl font-black">
                    <span>{t.total}</span>
                    <span className="text-[#D4AF37]">${totalPrice.toFixed(2)}</span>
                  </div>
                </div>
                
                <Button 
                  onClick={handlePlaceOrder}
                  disabled={loading}
                  className="w-full h-16 rounded-full text-xl font-bold bg-[#D4AF37] hover:bg-[#B8962D] text-white shadow-xl gap-2 mt-4"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      {lang === 'ar' ? 'جاري الطلب...' : 'Processing...'}
                    </div>
                  ) : (
                    t.placeOrder
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
