'use client';

import { useState, useEffect, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, useUser } from '@/firebase';
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  signInWithEmailAndPassword,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult
} from 'firebase/auth';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LogIn, UserPlus, Phone, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { useTranslation } from '@/hooks/use-translation';

const ADMIN_EMAIL = 'mohammad.dd.my@gmail.com';
const ADMIN_PHONE = '+962780334074';

export default function LoginPage() {
  const auth = useAuth();
  const router = useRouter();
  const { user, loading: authLoading } = useUser();
  const { toast } = useToast();
  const { t, lang } = useTranslation();
  const [isPending, startTransition] = useTransition();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);

  // Testing Toggles
  const [countryCode, setCountryCode] = useState('+1');
  const [clickCount, setClickCount] = useState(0);
  const [lastClickTime, setLastClickTime] = useState(0);

  useEffect(() => {
    if (!authLoading && user) {
      const isAdmin = user.email === ADMIN_EMAIL || user.phoneNumber === ADMIN_PHONE;
      if (isAdmin) {
        router.replace('/admin');
      } else {
        router.replace('/');
      }
    }
  }, [user, authLoading, router]);

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

  const validateEmail = (email: string) => {
    return String(email).toLowerCase().match(/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
  };

  const handleEmailLogin = async () => {
    if (!auth) return;
    if (!email || !password) {
      toast({ variant: 'destructive', title: 'Warning', description: 'Please enter email and password.' });
      return;
    }
    if (!validateEmail(email)) {
      toast({ variant: 'destructive', title: 'Error', description: 'Invalid email address.' });
      return;
    }
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Login Failed', description: 'Invalid email or password.' });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (!auth) return;
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      if (error.code !== 'auth/popup-closed-by-user') {
        toast({ variant: 'destructive', title: t.errorOccurred, description: lang === 'ar' ? 'فشل تسجيل الدخول باستخدام جوجل' : 'Failed to sign in with Google.' });
      }
    } finally {
      setLoading(false);
    }
  };

  const setupRecaptcha = () => {
    if (!auth) return;
    try {
      const container = document.getElementById('recaptcha-container');
      if (!container) return;

      if ((window as any).recaptchaVerifier) {
        try { (window as any).recaptchaVerifier.clear(); } catch (e) {}
      }

      (window as any).recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        'size': 'invisible',
      });
    } catch (error) {
      console.error("Recaptcha setup error:", error);
    }
  };

  const handlePhoneSignIn = async () => {
    if (!auth) return;
    const cleanPhone = phone.replace(/\D/g, '');
    if (!cleanPhone) {
      toast({ variant: 'destructive', title: 'Warning', description: 'Please enter phone number.' });
      return;
    }
    
    setLoading(true);
    const finalPhone = `${countryCode}${cleanPhone}`;

    try {
      setupRecaptcha();
      const verifier = (window as any).recaptchaVerifier;
      if (!verifier) throw new Error("Recaptcha not ready");

      // Safeguard: Ensure no database calls happen during SMS dispatch
      const result = await signInWithPhoneNumber(auth, finalPhone, verifier);
      setConfirmationResult(result);
      toast({ title: 'Code Sent', description: 'Please check your phone.' });
    } catch (error: any) {
      console.error("SMS Login Error:", error);
      let msg = 'Failed to send verification code.';
      if (error.code === 'auth/invalid-phone-number') msg = 'Invalid phone number format.';
      if (error.code === 'auth/too-many-requests') msg = 'Too many requests. Please try later.';
      
      toast({ variant: 'destructive', title: 'Error', description: msg });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!confirmationResult || !otp) return;
    setLoading(true);
    try {
      await confirmationResult.confirm(otp);
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: 'Invalid verification code.' });
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-muted/20">
      <main className="flex-1 flex items-center justify-center p-6 py-12">
        <Card className="w-full max-w-md border-none shadow-2xl rounded-[32px] overflow-hidden bg-white">
          <CardHeader className="bg-primary/5 py-10 text-center border-b border-primary/10">
            <CardTitle className="text-3xl font-bold font-headline text-primary">{t.loginTitle}</CardTitle>
            <p className="text-muted-foreground mt-2">{t.loginSubtitle}</p>
          </CardHeader>
          <CardContent className="p-8">
            <Tabs defaultValue="email" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-8 bg-muted/50 p-1 rounded-full">
                <TabsTrigger value="email" className="rounded-full py-2">{t.emailLogin}</TabsTrigger>
                <TabsTrigger value="phone" className="rounded-full py-2">{t.phoneLogin}</TabsTrigger>
              </TabsList>

              <TabsContent value="email" className="space-y-4">
                <div className="space-y-2 text-start">
                  <Label htmlFor="email">{t.email}</Label>
                  <Input id="email" type="email" placeholder="example@mail.com" className="rounded-2xl h-12 text-start" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className="space-y-2 text-start">
                  <Label htmlFor="password">{t.password}</Label>
                  <Input id="password" type="password" placeholder="******" className="rounded-2xl h-12 text-start" value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>
                <Button onClick={handleEmailLogin} disabled={loading} className="w-full rounded-full h-12 mt-4 gap-2 text-lg font-bold shadow-lg">
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4" />} {t.loginBtn}
                </Button>
                <div className="text-center pt-4">
                   <Link href="/register" className="text-primary font-bold hover:underline flex items-center justify-center gap-2">
                     <UserPlus className="h-4 w-4" /> {t.registerLink}
                   </Link>
                </div>
              </TabsContent>

              <TabsContent value="phone" className="space-y-4">
                {!confirmationResult ? (
                  <div className="space-y-4">
                    <div className="space-y-2 text-start">
                      <Label htmlFor="phone">{t.phoneNumberUSA}</Label>
                      <div className="flex rounded-2xl h-12 text-start bg-background border overflow-hidden focus-within:ring-2 focus-within:ring-primary/20">
                        <span 
                          onClick={handlePrefixClick}
                          style={{ cursor: 'default', userSelect: 'none' }}
                          className="flex items-center px-4 bg-primary/5 text-[#D4AF37] font-bold border-e border-primary/10"
                        >
                          {countryCode}
                        </span>
                        <Input 
                          id="phone" 
                          placeholder={t.phonePlaceholder} 
                          className="border-none focus-visible:ring-0 shadow-none h-full text-start bg-transparent flex-1" 
                          value={phone}
                          onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                            setPhone(val);
                          }}
                        />
                      </div>
                    </div>
                    <Button onClick={handlePhoneSignIn} disabled={loading} className="w-full rounded-full h-12 gap-2 text-lg font-bold">
                      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Phone className="h-4 w-4" />} {t.sendCode}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="space-y-2 text-start">
                      <Label htmlFor="otp">{t.otpLabel}</Label>
                      <Input id="otp" placeholder="123456" className="rounded-2xl h-12 text-start" value={otp} onChange={(e) => setOtp(e.target.value)} />
                    </div>
                    <Button onClick={handleVerifyOtp} disabled={loading} className="w-full rounded-full h-12 text-lg font-bold">
                      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : t.verifyAndConfirm}
                    </Button>
                  </div>
                )}
              </TabsContent>
            </Tabs>

            <div className="relative my-10">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t"></span>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-muted-foreground font-bold">{t.or}</span>
              </div>
            </div>

            <Button variant="outline" onClick={handleGoogleLogin} disabled={loading} className="w-full h-14 rounded-full gap-3 shadow-sm hover:bg-muted/30 text-lg border-2 font-bold transition-all">
              <svg className="h-6 w-6" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81.38z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              {t.googleLogin}
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
