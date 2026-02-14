
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, useUser } from '@/firebase';
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
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

export default function LoginPage() {
  const auth = useAuth();
  const router = useRouter();
  const { user, loading: authLoading } = useUser();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);

  // Redirect if already logged in
  useEffect(() => {
    if (!authLoading && user) {
      if (user.email === 'mohammad.dd.my@gmail.com') {
        router.push('/admin');
      } else {
        router.push('/');
      }
    }
  }, [user, authLoading, router]);

  const validateEmail = (email: string) => {
    return String(email)
      .toLowerCase()
      .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      );
  };

  const handleGoogleLogin = async () => {
    if (!auth) return;
    setLoading(true);
    try {
      await signInWithPopup(auth, new GoogleAuthProvider());
      // Redirect happens in useEffect
    } catch (error) {
      toast({ variant: 'destructive', title: 'خطأ', description: 'فشل تسجيل الدخول بواسطة Google.' });
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (mode: 'login' | 'register') => {
    if (!auth) return;
    
    if (!email || !password) {
      toast({ variant: 'destructive', title: 'تنبيه', description: 'يرجى إدخال البريد الإلكتروني وكلمة المرور.' });
      return;
    }

    if (!validateEmail(email)) {
      toast({ variant: 'destructive', title: 'خطأ', description: 'البريد الإلكتروني غير صحيح.' });
      return;
    }

    if (password.length < 6) {
      toast({ variant: 'destructive', title: 'خطأ', description: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل.' });
      return;
    }

    setLoading(true);
    try {
      if (mode === 'login') {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
      // Success redirection is handled by the useEffect listener
    } catch (error: any) {
      let errorMessage = 'حدث خطأ غير متوقع.';
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        errorMessage = 'البريد الإلكتروني أو كلمة المرور غير صحيحة.';
      } else if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'هذا البريد الإلكتروني مسجل مسبقاً.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'صيغة البريد الإلكتروني غير صالحة.';
      }
      
      toast({ variant: 'destructive', title: 'فشل العملية', description: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const setupRecaptcha = () => {
    if (!auth) return;
    if (!(window as any).recaptchaVerifier) {
      (window as any).recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        'size': 'invisible',
      });
    }
  };

  const handlePhoneSignIn = async () => {
    if (!auth) return;
    if (!phone) {
      toast({ variant: 'destructive', title: 'تنبيه', description: 'يرجى إدخال رقم الهاتف.' });
      return;
    }
    setLoading(true);
    try {
      setupRecaptcha();
      const verifier = (window as any).recaptchaVerifier;
      const result = await signInWithPhoneNumber(auth, phone, verifier);
      setConfirmationResult(result);
      toast({ title: 'تم إرسال الكود', description: 'يرجى التحقق من هاتفك.' });
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'خطأ', description: 'فشل إرسال كود التحقق. تأكد من الرقم.' });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!confirmationResult || !otp) return;
    setLoading(true);
    try {
      await confirmationResult.confirm(otp);
      // Success redirection is handled by the useEffect listener
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'خطأ', description: 'كود التحقق غير صحيح.' });
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
    <div className="min-h-screen flex flex-col bg-muted/20" dir="rtl">
      <Header />
      <main className="flex-1 flex items-center justify-center p-6">
        <Card className="w-full max-w-md border-none shadow-2xl rounded-[32px] overflow-hidden bg-white">
          <CardHeader className="bg-primary/5 py-10 text-center border-b border-primary/10">
            <CardTitle className="text-3xl font-bold font-headline text-primary">تسجيل الدخول</CardTitle>
            <p className="text-muted-foreground mt-2">أهلاً بك مجدداً في متجرنا</p>
          </CardHeader>
          <CardContent className="p-8">
            <Tabs defaultValue="email" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-8 bg-muted/50 p-1 rounded-full">
                <TabsTrigger value="email" className="rounded-full py-2">بريد إلكتروني</TabsTrigger>
                <TabsTrigger value="phone" className="rounded-full py-2">رقم الهاتف</TabsTrigger>
              </TabsList>

              <TabsContent value="email" className="space-y-4">
                <div className="space-y-2 text-right">
                  <Label htmlFor="email">البريد الإلكتروني</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="example@mail.com"
                    className="rounded-2xl h-12 text-right" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2 text-right">
                  <Label htmlFor="password">كلمة المرور</Label>
                  <Input 
                    id="password" 
                    type="password" 
                    placeholder="******"
                    className="rounded-2xl h-12 text-right" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4 pt-4">
                  <Button onClick={() => handleEmailAuth('login')} disabled={loading} className="rounded-full h-12 gap-2 text-lg">
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4" />} دخول
                  </Button>
                  <Button variant="outline" onClick={() => handleEmailAuth('register')} disabled={loading} className="rounded-full h-12 gap-2 text-lg">
                    <UserPlus className="h-4 w-4" /> جديد
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="phone" className="space-y-4">
                {!confirmationResult ? (
                  <div className="space-y-4">
                    <div className="space-y-2 text-right">
                      <Label htmlFor="phone">رقم الهاتف (مع رمز الدولة)</Label>
                      <Input 
                        id="phone" 
                        placeholder="+966XXXXXXXXX" 
                        className="rounded-2xl h-12 text-right" 
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                      />
                    </div>
                    <Button onClick={handlePhoneSignIn} disabled={loading} className="w-full rounded-full h-12 gap-2 text-lg">
                      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Phone className="h-4 w-4" />} إرسال الكود
                    </Button>
                    <div id="recaptcha-container"></div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="space-y-2 text-right">
                      <Label htmlFor="otp">كود التحقق</Label>
                      <Input 
                        id="otp" 
                        placeholder="123456" 
                        className="rounded-2xl h-12 text-right" 
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                      />
                    </div>
                    <Button onClick={handleVerifyOtp} disabled={loading} className="w-full rounded-full h-12 text-lg">
                      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "تحقق وتأكيد"}
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
                <span className="bg-white px-2 text-muted-foreground">أو عبر</span>
              </div>
            </div>

            <Button variant="outline" onClick={handleGoogleLogin} disabled={loading} className="w-full h-14 rounded-full gap-3 shadow-sm hover:bg-muted/30 text-lg border-2">
              <svg className="h-6 w-6" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81.38z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              متابعة باستخدام Google
            </Button>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
