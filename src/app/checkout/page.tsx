
'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useCart } from '@/context/CartContext';
import { useTranslation } from '@/hooks/use-translation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  MapPin, 
  Phone, 
  User, 
  CheckCircle2, 
  ChevronLeft, 
  ChevronRight,
  ShoppingBag,
  Loader2,
  Building2,
  ExternalLink
} from 'lucide-react';
import Link from 'next/link';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, useUser, useDoc } from '@/firebase';
import { collection, addDoc, serverTimestamp, doc, getDoc, updateDoc, increment } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import emailjs from '@emailjs/browser';
import { useMemoFirebase } from '@/firebase/use-memo-firebase';

const DEFAULT_US_STATES: Record<string, number> = {
  "Alabama": 13, "Alaska": 23, "Arizona": 17, "Arkansas": 14, "California": 20,
  "Colorado": 16, "Connecticut": 13, "Delaware": 13, "Florida": 15, "Georgia": 14,
  "Hawaii": 25, "Idaho": 18, "Illinois": 11, "Indiana": 11, "Iowa": 13,
  "Kansas": 14, "Kentucky": 13, "Louisiana": 15, "Maine": 17, "Maryland": 13,
  "Massachusetts": 13, "Michigan": 9, "Minnesota": 14, "Mississippi": 14, "Missouri": 13,
  "Montana": 18, "Nebraska": 14, "Nevada": 18, "New Hampshire": 13, "New Jersey": 13,
  "New Mexico": 16, "New York": 13, "North Carolina": 13, "North Dakota": 15, "Ohio": 11,
  "Oklahoma": 14, "Oregon": 19, "Pennsylvania": 13, "Rhode Island": 13, "South Carolina": 13,
  "South Dakota": 15, "Tennessee": 13, "Texas": 15, "Utah": 17, "Vermont": 13,
  "Virginia": 13, "Washington": 19, "West Virginia": 13, "Wisconsin": 11, "Wyoming": 16
};

export default function CheckoutPage() {
  const { cartItems, totalPrice, totalItems, clearCart } = useCart();
  const { t, lang } = useTranslation();
  const { toast } = useToast();
  const db = useFirestore();
  const { user } = useUser();
  const router = useRouter();
  
  const [loading, setLoading] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    state: '',
    address: ''
  });

  const [dynamicRates, setDynamicRates] = useState<Record<string, number>>(DEFAULT_US_STATES);

  const shippingRef = useMemoFirebase(() => {
    if (!db) return null;
    return doc(db, 'siteSettings', 'shipping');
  }, [db]);

  const { data: shippingData, loading: loadingShipping } = useDoc(shippingRef);

  useEffect(() => {
    if (shippingData) {
      const mergedRates = { ...DEFAULT_US_STATES };
      Object.keys(DEFAULT_US_STATES).forEach(state => {
        if (typeof shippingData[state] === 'number') {
          mergedRates[state] = shippingData[state];
        }
      });
      setDynamicRates(mergedRates);
    }
  }, [shippingData]);

  const shippingFee = formData.state ? dynamicRates[formData.state] : 0;
  const grandTotal = totalPrice + shippingFee;

  const handlePlaceOrder = async () => {
    if (!formData.fullName || !formData.phone || !formData.state || !formData.address) {
      toast({
        variant: "destructive",
        title: t.errorOccurred,
        description: t.completeFields
      });
      return;
    }

    if (!agreed) {
      toast({
        variant: "destructive",
        title: t.errorOccurred,
        description: lang === 'ar' ? 'يرجى الموافقة على الشروط والسياسات' : 'Please agree to terms and policies'
      });
      return;
    }

    if (!db) return;

    setLoading(true);

    try {
      for (const item of cartItems) {
        const productRef = doc(db, 'products', item.id);
        const productSnap = await getDoc(productRef);
        
        if (productSnap.exists()) {
          const productData = productSnap.data();
          const currentStock = productData.stock || 0;
          
          if (currentStock < item.quantity) {
            toast({
              variant: "destructive",
              title: lang === 'ar' ? 'عذراً' : 'Sorry',
              description: `${lang === 'ar' ? item.name : (item.nameEn || item.name)}: ${t.outOfStockError}`,
              duration: 5000,
            });
            setLoading(false);
            return;
          }
        }
      }

      const finalPhone = formData.phone.startsWith('+1') ? formData.phone : `+1${formData.phone}`;
      const orderData = {
        customerInfo: {
          fullName: formData.fullName,
          phone: finalPhone,
          city: formData.state,
          address: formData.address
        },
        items: cartItems.map(item => ({
          id: item.id,
          name: item.name,
          nameEn: item.nameEn || '',
          price: item.price,
          quantity: item.quantity
        })),
        totalPrice: grandTotal,
        shippingFee: shippingFee,
        status: 'pending',
        paymentMethod: 'Cash on Delivery',
        createdAt: serverTimestamp(),
        userId: user?.uid || 'guest'
      };

      const orderRef = await addDoc(collection(db, 'orders'), orderData);

      for (const item of cartItems) {
        const productRef = doc(db, 'products', item.id);
        updateDoc(productRef, {
          stock: increment(-item.quantity)
        });
      }

      const serviceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;
      const templateId = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID;
      const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;

      if (serviceId && templateId && publicKey) {
        emailjs.init(publicKey);
        const orderDetailsString = cartItems
          .map(item => `${lang === 'ar' ? item.name : (item.nameEn || item.name)} (x${item.quantity})`)
          .join(', ');

        const templateParams = {
          order_id: orderRef.id,
          customer_name: formData.fullName,
          customer_phone: finalPhone,
          total_price: grandTotal.toFixed(2),
          order_details: orderDetailsString,
        };

        emailjs.send(serviceId, templateId, templateParams, publicKey)
          .catch(err => console.error('EmailJS failure:', err));
      }

      toast({
        title: lang === 'ar' ? 'شكراً لك' : 'Thank You',
        description: lang === 'ar' ? 'تم استلام طلبك بنجاح' : 'Your order has been received.',
      });
      
      clearCart();
      router.push('/checkout/success');

    } catch (err: any) {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: 'orders',
        operation: 'create',
      }));
      setLoading(false);
    }
  };

  if (totalItems === 0) {
    return (
      <div className="min-h-screen flex flex-col overflow-x-hidden" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
        <main className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="bg-primary/5 w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center mb-6">
            <ShoppingBag className="h-8 w-8 md:h-10 md:w-10 text-primary/40" />
          </div>
          <h1 className="text-xl md:text-2xl font-bold mb-4">{t.cartEmpty}</h1>
          <Link href="/products">
            <Button className="rounded-full px-8">{t.startShopping}</Button>
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-muted/5 overflow-x-hidden" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <main className="flex-1 container mx-auto px-4 py-8 md:py-12">
        <div className="mb-8 md:mb-10 text-start">
          <Link href="/cart" className="text-primary flex items-center gap-1 mb-2 hover:underline font-bold text-sm md:text-base">
            {lang === 'ar' ? <ChevronRight className="h-4 w-4 md:h-5 md:w-5" /> : <ChevronLeft className="h-4 w-4 md:h-5 md:w-5" />} 
            {lang === 'ar' ? 'العودة للسلة' : 'Back to Cart'}
          </Link>
          <h1 className="text-3xl md:text-4xl font-black font-headline text-primary flex items-center gap-3">
            <CheckCircle2 className="h-8 w-8 md:h-10 md:w-10" /> {t.checkoutTitle}
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-10 items-start">
          <div className="lg:col-span-2 space-y-6 md:space-y-8">
            <Card className="rounded-[1.5rem] md:rounded-[2.5rem] overflow-hidden border-none shadow-xl bg-white">
              <CardHeader className="bg-[#F8C8DC]/20 p-6 md:p-8 border-b border-primary/10">
                <CardTitle className="text-xl md:text-2xl font-bold font-headline text-start flex items-center gap-2">
                  <MapPin className="h-5 w-5 md:h-6 md:w-6 text-primary" /> {t.shippingInfo}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 md:p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2 text-start">
                    <Label className="text-base md:text-lg font-bold flex items-center gap-2">
                      <User className="h-4 w-4 text-[#D4AF37]" /> {t.fullName}
                    </Label>
                    <Input 
                      placeholder={t.namePlaceholder}
                      value={formData.fullName}
                      onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                      className="h-12 md:h-14 rounded-xl md:rounded-2xl border-2 border-primary/10"
                    />
                  </div>
                  <div className="space-y-2 text-start">
                    <Label className="text-base md:text-lg font-bold flex items-center gap-2">
                      <Phone className="h-4 w-4 text-[#D4AF37]" /> {t.phoneNumberUSA}
                    </Label>
                    <div className="flex rounded-xl md:rounded-2xl border-2 border-primary/10 overflow-hidden focus-within:border-[#D4AF37] transition-all">
                      <span className="flex items-center px-4 bg-primary/5 text-[#D4AF37] font-bold border-e-2 border-primary/10">
                        +1
                      </span>
                      <Input 
                        placeholder={t.phonePlaceholder}
                        value={formData.phone}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                          setFormData({...formData, phone: val});
                        }}
                        className="border-none focus-visible:ring-0 shadow-none h-12 md:h-14 text-start"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2 text-start">
                  <Label className="text-base md:text-lg font-bold flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-[#D4AF37]" /> {t.stateLabel}
                  </Label>
                  <Select onValueChange={(val) => setFormData({...formData, state: val})}>
                    <SelectTrigger className="h-12 md:h-14 rounded-xl md:rounded-2xl border-2 border-primary/10 focus:ring-[#D4AF37]">
                      <SelectValue placeholder={t.selectState} />
                    </SelectTrigger>
                    <SelectContent className="z-[10001] rounded-2xl">
                      {Object.keys(dynamicRates).sort().map(state => (
                        <SelectItem key={state} value={state} className="rounded-xl">
                          {state}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 text-start">
                  <Label className="text-base md:text-lg font-bold flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-[#D4AF37]" /> {t.detailedAddressLabel}
                  </Label>
                  <Textarea 
                    placeholder={t.addressPlaceholder}
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    className="min-h-[100px] md:min-h-[120px] rounded-[1rem] md:rounded-[1.5rem] border-2 border-primary/10"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card className="rounded-[2rem] md:rounded-[3rem] border-none shadow-2xl bg-white overflow-hidden sticky top-24 md:top-32">
              <div className="bg-primary/5 p-6 md:p-8 border-b">
                <h2 className="text-xl md:text-2xl font-bold font-headline text-start">{t.yourOrder}</h2>
              </div>
              <CardContent className="p-6 md:p-8 space-y-4 md:space-y-6">
                <div className="max-h-[200px] md:max-h-[300px] overflow-y-auto space-y-4 pr-2">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 md:gap-4">
                      <div className="h-12 w-12 md:h-16 md:w-16 rounded-lg md:rounded-xl overflow-hidden bg-muted flex-shrink-0">
                        <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                      </div>
                      <div className="flex-1 text-start">
                        <p className="font-bold text-sm md:text-base line-clamp-1">{lang === 'ar' ? item.name : (item.nameEn || item.name)}</p>
                        <p className="text-xs md:text-sm text-muted-foreground">{item.quantity} x ${item.price.toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <Separator className="opacity-50" />
                
                <div className="space-y-2 md:space-y-3">
                  <div className="flex justify-between text-base md:text-lg font-medium">
                    <span className="text-muted-foreground">{t.subtotal}</span>
                    <span className="font-bold">${totalPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-base md:text-lg font-medium">
                    <span className="text-muted-foreground">{t.shippingFee}</span>
                    <span className={formData.state ? "text-[#D4AF37] font-bold" : "text-muted-foreground italic text-xs"}>
                      {formData.state ? `$${shippingFee.toFixed(2)}` : t.shippingCalcPending}
                    </span>
                  </div>
                  <Separator className="opacity-30" />
                  <div className="flex justify-between text-2xl md:text-3xl font-black">
                    <span>{t.total}</span>
                    <span className="text-[#D4AF37]">${grandTotal.toFixed(2)}</span>
                  </div>
                </div>

                {/* Terms Acceptance Checkbox */}
                <div className="pt-4 flex items-start gap-3 text-start">
                  <Checkbox 
                    id="terms" 
                    checked={agreed} 
                    onCheckedChange={(val) => setAgreed(val as boolean)}
                    className="mt-1 border-primary data-[state=checked]:bg-primary"
                  />
                  <Label htmlFor="terms" className="text-sm leading-relaxed cursor-pointer font-medium select-none">
                    {lang === 'ar' ? (
                      <>
                        لقد قرأت وأوافق على {' '}
                        <Link href="/terms-of-use" target="_blank" className="text-[#D4AF37] font-bold hover:underline inline-flex items-center gap-0.5">شروط الاستخدام <ExternalLink className="h-3 w-3" /></Link>، {' '}
                        <Link href="/privacy-policy" target="_blank" className="text-[#D4AF37] font-bold hover:underline inline-flex items-center gap-0.5">سياسة الخصوصية <ExternalLink className="h-3 w-3" /></Link>، {' '}
                        و<Link href="/shipping-returns" target="_blank" className="text-[#D4AF37] font-bold hover:underline inline-flex items-center gap-0.5">سياسة الشحن والترجيع <ExternalLink className="h-3 w-3" /></Link>.
                      </>
                    ) : (
                      <>
                        I have read and agree to the {' '}
                        <Link href="/terms-of-use" target="_blank" className="text-[#D4AF37] font-bold hover:underline inline-flex items-center gap-0.5">Terms of Use <ExternalLink className="h-3 w-3" /></Link>, {' '}
                        <Link href="/privacy-policy" target="_blank" className="text-[#D4AF37] font-bold hover:underline inline-flex items-center gap-0.5">Privacy Policy <ExternalLink className="h-3 w-3" /></Link>, {' '}
                        and <Link href="/shipping-returns" target="_blank" className="text-[#D4AF37] font-bold hover:underline inline-flex items-center gap-0.5">Shipping & Returns Policy <ExternalLink className="h-3 w-3" /></Link>.
                      </>
                    )}
                  </Label>
                </div>
                
                <Button 
                  onClick={handlePlaceOrder}
                  disabled={loading || loadingShipping || !agreed}
                  className="w-full h-14 md:h-16 rounded-full text-lg md:text-xl font-bold bg-[#D4AF37] hover:bg-[#B8962D] text-white shadow-xl gap-2 mt-2 md:mt-4 disabled:opacity-50"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      {lang === 'ar' ? 'جاري التحقق...' : 'Verifying...'}
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
    </div>
  );
}
