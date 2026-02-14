
'use client';

import { useState } from 'react';
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
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LogIn, Mail, Phone, Lock, UserPlus, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function LoginPage() {
  const auth = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);

  const handleGoogleLogin = async () => {
    if (!auth) return;
    setLoading(true);
    try {
      await signInWithPopup(auth, new GoogleAuthProvider());
      router.push('/');
    } catch (error) {
      toast({ variant: 'destructive', title: 'خطأ', description: 'فشل تسجيل الدخول بواسطة Google.' });
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (mode: 'login' | 'register') => {
    if (!auth) return;
    setLoading(true);
    try {
      if (mode === 'login') {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
      router.push('/');
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'خطأ', description: error.message });
    } finally {
      setLoading(false);
    }
  };

  const setupRecaptcha = () => {
    if (!auth) return;
    (window as any).recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
      'size': 'invisible',
    });
  };

  const handlePhoneSignIn = async () => {
    if (!auth) return;
    setLoading(true);
    try {
      setupRecaptcha();
      const verifier = (window as any).recaptchaVerifier;
      const result = await signInWithPhoneNumber(auth, phone, verifier);
      setConfirmationResult(result);
      toast({ title: 'تم إرسال الكود', description: 'يرجى التحقق من هاتفك.' });
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'خطأ', description: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!confirmationResult) return;
    setLoading(true);
    try {
      await confirmationResult.confirm(otp);
      router.push('/');
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'خطأ', description: 'كود التحقق غير صحيح.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-muted/20" dir="rtl">
      <Header />
      <main className="flex-1 flex items-center justify-center p-6">
        <Card className="w-full max-w-md border-none shadow-2xl rounded-3xl overflow-hidden bg-white">
          <CardHeader className="bg-primary/5 py-8 text-center">
            <CardTitle className="text-3xl font-bold font-headline text-primary">تسجيل الدخول</CardTitle>
            <p className="text-muted-foreground mt-2">أهلاً بك في YourGroceriesUSA</p>
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
                    className="rounded-full" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2 text-right">
                  <Label htmlFor="password">كلمة المرور</Label>
                  <Input 
                    id="password" 
                    type="password" 
                    className="rounded-full" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4 pt-4">
                  <Button onClick={() => handleEmailAuth('login')} disabled={loading} className="rounded-full gap-2">
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4" />} دخول
                  </Button>
                  <Button variant="outline" onClick={() => handleEmailAuth('register')} disabled={loading} className="rounded-full gap-2">
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
                        className="rounded-full" 
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                      />
                    </div>
                    <Button onClick={handlePhoneSignIn} disabled={loading} className="w-full rounded-full gap-2">
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
                        className="rounded-full" 
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                      />
                    </div>
                    <Button onClick={handleVerifyOtp} disabled={loading} className="w-full rounded-full">
                      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "تحقق وتأكيد"}
                    </Button>
                  </div>
                )}
              </TabsContent>
            </Tabs>

            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t"></span>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-muted-foreground">أو عبر</span>
              </div>
            </div>

            <Button variant="outline" onClick={handleGoogleLogin} disabled={loading} className="w-full h-12 rounded-full gap-3 shadow-sm">
              <LogIn className="h-5 w-5" /> تسجيل الدخول بواسطة Google
            </Button>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
