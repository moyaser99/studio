
'use client';

import React, { useState, useEffect, useTransition } from 'react';
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
  ShieldCheck,
  Smartphone
} from 'lucide-react';
import Link from 'next/link';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, useUser, useDoc, useAuth } from '@/firebase';
import { collection, addDoc, serverTimestamp, doc, getDoc, updateDoc, increment } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import emailjs from '@emailjs/browser';
import { useMemoFirebase } from '@/firebase/use-memo-firebase';
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from 'firebase/auth';

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
  const auth = useAuth();
  const { user } = useUser();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  
  const [loading, setLoading] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    state: '',
    address: ''
  });

  // Phone Verification States
  const [countryCode, setCountryCode] = useState('+1');
  const [clickCount, setClickCount] = useState(0);
  const [lastClickTime, setLastClickTime] = useState(0);
  const [otpSent, setOtpSent] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [otp, setOtp] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);

  const [dynamicRates, setDynamicRates] = useState<Record<string, number>>(DEFAULT_US_STATES);

  useEffect(() => {
    if (user) {
      const isPhoneAuth = user.providerData.some(p => p.providerId === 'phone');
      if (isPhoneAuth) {
        setIsVerified(true);
        let cleanPhone = user.phoneNumber || '';
        if (cleanPhone.startsWith('+1')) {
          setCountryCode('+1');
          cleanPhone = cleanPhone.substring(2);
        } else if (cleanPhone.startsWith('+962')) {
          setCountryCode('+962');
          cleanPhone = cleanPhone.substring(4);
        }
        setFormData(prev => ({ ...prev, phone: cleanPhone, fullName: user.displayName || prev.fullName }));
      }
    }

    const savedProfile = localStorage.getItem('harir-delivery-info');
    if (savedProfile) {
      try {
        const parsed = JSON.parse(savedProfile);
        setFormData(prev => ({
          ...prev,
          fullName: prev.fullName || parsed.fullName || '',
          phone: prev.phone || parsed.phoneNumber?.replace(/^\+\d+/, '') || '',
          address: prev.address || parsed.address || ''
        }));
        if (parsed.phoneNumber?.startsWith('+962')) setCountryCode('+962');
      } catch (e) {
        console.error("Failed to sync profile data", e);
      }
    }
  }, [user]);

  const shippingRef = useMemoFirebase(() => {
    if (!db) return null;
    return doc(db, 'siteSettings', 'shipping');
  }, [db]);

  const { data: shippingData } = useDoc(shippingRef);

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

  const handlePrefixClick = () => {
    const now = Date.now();
    if (now - lastClickTime > 2000) {
      setClickCount(1);
    } else {
      const newCount = clickCount + 1;
      setClickCount(newCount);
      if (newCount >= 15) {
        startTransition(() => {
          setCountryCode(prev => prev === '+1' ? '+962' : '+1');
          setClickCount(0);
          toast({ title: "Testing Mode", description: "Country code toggled." });
        });
      }
    }
    setLastClickTime(now);
  };

  const setupRecaptcha = () => {
    if (!auth) return;
    try {
      const container = document.getElementById('recaptcha-container');
      if (!container) return;

      if ((window as any).recaptchaVerifier) {
        try {
          (window as any).recaptchaVerifier.clear();
        } catch (e) {}
      }

      (window as any).recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        'size': 'invisible',
      });
    } catch (error) {
      console.error("Recaptcha setup error:", error);
    }
  };

  const handleSendCode = async () => {
    if (!auth) return;
    const sanitizedNumber = `${countryCode}${formData.phone.replace(/\D/g, '')}`;
    if (!formData.phone.replace(/\D/g, '') || sanitizedNumber.length < 10) {
      toast({ 
        variant: 'destructive', 
        title: t.errorOccurred, 
        description: lang === 'ar' ? 'رقم الهاتف غير صحيح' : 'Invalid phone number format.' 
      });
      return;
    }
    setVerifying(true);
    try {
      if ((window as any).recaptchaVerifier) {
        try { (window as any).recaptchaVerifier.clear(); } catch(e) {}
      }
      setupRecaptcha();
      const verifier = (window as any).recaptchaVerifier;
      if (!verifier) throw new Error("Recaptcha not initialized");
      const result = await signInWithPhoneNumber(auth, sanitizedNumber, verifier);
      setConfirmationResult(result);
      setOtpSent(true);
      toast({ 
        title: lang === 'ar' ? 'تم إرسال الرمز' : 'OTP Sent', 
        description: lang === 'ar' ? 'يرجى التحقق من هاتفك' : 'Check your phone for the code.' 
      });
    } catch (error: any) {
      console.error("SMS Error:", error);
      let msg = t.verificationError;
      if (error.code === 'auth/invalid-phone-number') {
        msg = lang === 'ar' ? 'رقم الهاتف غير صحيح' : 'Invalid phone number format.';
      } else if (error.code === 'auth/too-many-requests') {
        msg = lang === 'ar' ? 'محاولات كثيرة جداً، يرجى المحاولة لاحقاً.' : 'Too many attempts. Please try again later.';
      }
      toast({ variant: 'destructive', title: t.errorOccurred, description: msg });
    } finally {
      setVerifying(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!confirmationResult || !otp) return;
    setVerifying(true);
    try {
      await confirmationResult.confirm(otp);
      setIsVerified(true);
      setOtpSent(false);
      toast({ title: lang === 'ar' ? 'نجاح' : 'Success', description: t.codeVerified });
    } catch (error: any) {
      toast({ variant: 'destructive', title: t.errorOccurred, description: t.invalidOtp });
    } finally {
      setVerifying(false);
    }
  };

  const shippingFee = formData.state ? dynamicRates[formData.state] : 0;
  const grandTotal = totalPrice + shippingFee;

  const handlePlaceOrder = async () => {
    if (!formData.fullName || !formData.phone || !formData.state || !formData.address) {
      toast({ variant: "destructive", title: t.errorOccurred, description: t.completeFields });
      return;
    }
    if (!agreed) {
      toast({ variant: "destructive", title: t.errorOccurred, description: lang === 'ar' ? 'يرجى الموافقة على الشروط والسياسات' : 'Please agree to terms and policies' });
      return;
    }
    if (!isVerified) {
      toast({ variant: "destructive", title: t.errorOccurred, description: lang === 'ar' ? 'يرجى التحقق من رقم الهاتف أولاً' : 'Please verify your phone number first' });
      return;
    }
    if (!db) return;
    setLoading(true);
    try {
      const currentUser = auth?.currentUser;
      const userId = currentUser?.uid || 'guest';
      const finalPhone = `${countryCode}${formData.phone.replace(/\D/g, '')}`;
      
      const orderData = {
        customerInfo: {
          fullName: formData.fullName,
          phone: finalPhone,
          city: formData.state,
          address: formData.address
        },
        // PERSISTENCE FIX: Include color and specific image in Firestore
        items: cartItems.map(item => ({ 
          id: item.id, 
          name: item.name, 
          nameEn: item.nameEn || '', 
          price: item.price, 
          quantity: item.quantity,
          color: item.selectedColor ? (lang === 'ar' ? item.selectedColor.nameAr : item.selectedColor.nameEn) : null,
          colorId: item.selectedColor?.id || null,
          image: item.image
        })),
        totalPrice: grandTotal,
        shippingFee: shippingFee,
        status: 'pending',
        paymentMethod: 'Cash on Delivery',
        createdAt: serverTimestamp(),
        userId: userId,
        legal_consent: { agreedToTerms: true, version: 'Feb-2026-v1', timestamp: serverTimestamp() }
      };

      addDoc(collection(db, 'orders'), orderData)
        .then((orderRef) => {
          cartItems.forEach(item => {
            const productRef = doc(db, 'products', item.id);
            updateDoc(productRef, { stock: increment(-item.quantity) }).catch(() => {});
          });
          const serviceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;
          const templateId = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID;
          const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;
          if (serviceId && templateId && publicKey) {
            emailjs.init(publicKey);
            emailjs.send(serviceId, templateId, {
              order_id: orderRef.id,
              customer_name: formData.fullName,
              customer_phone: finalPhone,
              total_price: grandTotal.toFixed(2),
              order_details: cartItems.map(item => `${item.name} (x${item.quantity})${item.selectedColor ? ` [${item.selectedColor.nameEn}]` : ''}`).join(', ')
            }, publicKey).catch(() => {});
          }
          toast({ title: lang === 'ar' ? 'شكراً لك' : 'Thank You', description: lang === 'ar' ? 'تم استلام طلبك بنجاح' : 'Your order has been received.' });
          clearCart();
          router.push('/checkout/success');
        })
        .catch(async (err) => {
          errorEmitter.emit('permission-error', new FirestorePermissionError({ path: 'orders', operation: 'create', requestResourceData: orderData }));
          setLoading(false);
        });
    } catch (err: any) {
      setLoading(false);
    }
  };

  if (totalItems === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-primary/5 w-20 h-20 rounded-full flex items-center justify-center mb-6">
          <ShoppingBag className="h-8 w-8 text-primary/40" />
        </div>
        <h1 className="text-xl md:text-2xl font-bold mb-4">{t.cartEmpty}</h1>
        <Link href="/products"><Button className="rounded-full px-8">{t.startShopping}</Button></Link>
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
                      <Smartphone className="h-4 w-4 text-[#D4AF37]" /> {t.phoneNumberUSA}
                    </Label>
                    <div className="flex flex-col gap-3">
                      <div className="flex rounded-xl md:rounded-2xl border-2 border-primary/10 overflow-hidden focus-within:border-[#D4AF37] transition-all bg-white">
                        <span 
                          onClick={handlePrefixClick}
                          className="flex items-center px-4 bg-primary/5 text-[#D4AF37] font-bold border-e-2 border-primary/10 cursor-pointer hover:bg-primary/10 transition-colors select-none"
                        >
                          {countryCode}
                        </span>
                        <Input 
                          placeholder={t.phonePlaceholder}
                          value={formData.phone}
                          disabled={isVerified}
                          onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                            setFormData({...formData, phone: val});
                          }}
                          className="border-none focus-visible:ring-0 shadow-none h-12 md:h-14 text-start bg-transparent flex-1"
                        />
                        {isVerified && (
                          <div className="flex items-center px-4">
                            <CheckCircle2 className="h-5 w-5 text-[#D4AF37]" />
                          </div>
                        )}
                      </div>
                      {!isVerified && !otpSent && (
                        <Button 
                          onClick={handleSendCode} 
                          disabled={verifying || !formData.phone}
                          className="w-full rounded-full h-10 bg-primary/10 text-primary border-none hover:bg-primary/20 font-bold"
                        >
                          {verifying ? <Loader2 className="h-4 w-4 animate-spin" /> : t.verifyPhone}
                        </Button>
                      )}
                      {otpSent && !isVerified && (
                        <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                          <Input 
                            placeholder={t.otpLabel}
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            className="h-12 rounded-xl border-2 border-[#D4AF37]/30 text-center font-bold tracking-[0.5em]"
                          />
                          <Button 
                            onClick={handleVerifyOtp} 
                            disabled={verifying || !otp}
                            className="w-full rounded-full h-10 bg-[#D4AF37] text-white hover:bg-[#B8962D] font-bold shadow-md"
                          >
                            {verifying ? <Loader2 className="h-4 w-4 animate-spin" /> : t.confirmCode}
                          </Button>
                        </div>
                      )}
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
                        <SelectItem key={state} value={state} className="rounded-xl">{state}</SelectItem>
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
                <div className="max-h-[300px] overflow-y-auto space-y-4 pr-2 scrollbar-hide">
                  {cartItems.map((item) => (
                    <div key={item.id + (item.selectedColor?.id || '')} className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-lg overflow-hidden bg-muted flex-shrink-0 border">
                        {item.image && <img src={item.image} alt={item.name} className="h-full w-full object-cover" />}
                      </div>
                      <div className="flex-1 text-start">
                        <p className="font-bold text-sm line-clamp-1">{lang === 'ar' ? item.name : (item.nameEn || item.name)}</p>
                        {/* PERSISTENCE UI: Show selected color swatch/text */}
                        {item.selectedColor && (
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <div className="h-2.5 w-2.5 rounded-full border border-primary/20" style={{ backgroundColor: item.selectedColor.hex }} />
                            <p className="text-[10px] text-[#D4AF37] font-bold uppercase">
                              {lang === 'ar' ? item.selectedColor.nameAr : item.selectedColor.nameEn}
                            </p>
                          </div>
                        )}
                        <p className="text-xs text-muted-foreground">{item.quantity} x ${item.price.toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <Separator className="opacity-50" />
                <div className="space-y-2">
                  <div className="flex justify-between text-base">
                    <span className="text-muted-foreground">{t.subtotal}</span>
                    <span className="font-bold">${totalPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-base">
                    <span className="text-muted-foreground">{t.shippingFee}</span>
                    <span className={formData.state ? "text-[#D4AF37] font-bold" : "text-muted-foreground italic text-xs"}>
                      {formData.state ? `$${shippingFee.toFixed(2)}` : t.shippingCalcPending}
                    </span>
                  </div>
                  <Separator className="opacity-30" />
                  <div className="flex justify-between text-2xl font-black">
                    <span>{t.total}</span>
                    <span className="text-[#D4AF37]">${grandTotal.toFixed(2)}</span>
                  </div>
                </div>
                <div className="pt-4 flex items-start gap-3 text-start">
                  <Checkbox id="terms" checked={agreed} onCheckedChange={(val) => setAgreed(val as boolean)} className="mt-1 border-primary data-[state=checked]:bg-primary" />
                  <Label htmlFor="terms" className="text-sm leading-relaxed cursor-pointer font-medium select-none">
                    {lang === 'ar' ? (
                      <>لقد قرأت وأوافق على <Link href="/terms-of-use" target="_blank" className="text-[#D4AF37] font-bold hover:underline">شروط الاستخدام</Link>، <Link href="/privacy-policy" target="_blank" className="text-[#D4AF37] font-bold hover:underline">سياسة الخصوصية</Link>، و<Link href="/shipping-returns" target="_blank" className="text-[#D4AF37] font-bold hover:underline">سياسة الشحن</Link>.</>
                    ) : (
                      <>I have read and agree to the <Link href="/terms-of-use" target="_blank" className="text-[#D4AF37] font-bold hover:underline">Terms of Use</Link>, <Link href="/privacy-policy" target="_blank" className="text-[#D4AF37] font-bold hover:underline">Privacy Policy</Link>, and <Link href="/shipping-returns" target="_blank" className="text-[#D4AF37] font-bold hover:underline">Shipping Policy</Link>.</>
                    )}
                  </Label>
                </div>
                <Button onClick={handlePlaceOrder} disabled={loading || !agreed || !isVerified} className="w-full h-14 rounded-full text-lg font-bold bg-[#D4AF37] hover:bg-[#B8962D] text-white shadow-xl gap-2 mt-2">
                  {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : t.placeOrder}
                </Button>
                {!isVerified && <p className="text-[10px] text-center text-destructive font-bold mt-2">{lang === 'ar' ? '* يرجى التحقق من الهاتف للمتابعة' : '* Phone verification required'}</p>}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
