'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, useUser, useFirestore } from '@/firebase';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc, serverTimestamp, collection, query, where, getDocs } from 'firebase/firestore';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UserPlus, Loader2, Phone, Mail, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { useTranslation } from '@/hooks/use-translation';

export default function RegisterPage() {
  const auth = useAuth();
  const db = useFirestore();
  const router = useRouter();
  const { user, loading: authLoading } = useUser();
  const { toast } = useToast();
  const { t, lang } = useTranslation();
  
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    phoneNumber: '',
  });

  useEffect(() => {
    if (!authLoading && user) {
      router.replace('/');
    }
  }, [user, authLoading, router]);

  const validateEmail = (email: string) => {
    return String(email).toLowerCase().match(/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth || !db) return;

    if (!formData.fullName || !formData.email || !formData.password || !formData.phoneNumber) {
      toast({ variant: 'destructive', title: 'Warning', description: 'Please complete all fields.' });
      return;
    }

    if (!validateEmail(formData.email)) {
      toast({ variant: 'destructive', title: 'Error', description: 'Invalid email address.' });
      return;
    }

    setLoading(true);
    const finalPhone = `+1${formData.phoneNumber.replace(/\D/g, '')}`;

    try {
      const phoneQuery = query(
        collection(db, 'users'),
        where('phoneNumber', '==', finalPhone)
      );
      
      const querySnapshot = await getDocs(phoneQuery).catch(async (err) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: 'users',
          operation: 'list',
        }));
        throw err;
      });
      
      if (!querySnapshot.empty) {
        toast({ 
          variant: 'destructive', 
          title: 'Phone in use', 
          description: t.phoneInUse 
        });
        setLoading(false);
        return;
      }

      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const newUser = userCredential.user;

      await updateProfile(newUser, { displayName: formData.fullName });

      const userProfile = {
        fullName: formData.fullName,
        email: formData.email,
        phoneNumber: finalPhone,
        uid: newUser.uid,
        updatedAt: serverTimestamp(),
      };

      const userDocRef = doc(db, 'users', newUser.uid);
      setDoc(userDocRef, userProfile, { merge: true })
        .then(() => {
          toast({ 
            title: lang === 'ar' ? 'نجاح' : 'Success', 
            description: lang === 'ar' ? 'أهلاً بك في حرير بوتيك USA.' : 'Welcome to Harir Boutique USA.' 
          });
          router.replace('/');
        })
        .catch(async () => {
          errorEmitter.emit('permission-error', new FirestorePermissionError({
            path: userDocRef.path,
            operation: 'write',
            requestResourceData: userProfile,
          }));
          setLoading(false);
        });

    } catch (error: any) {
      let errorMessage = 'Failed to create account. Please try again.';
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'This email is already registered.';
      }
      toast({ variant: 'destructive', title: 'Registration Error', description: errorMessage });
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
            <CardTitle className="text-3xl font-bold font-headline text-primary">{t.registerTitle}</CardTitle>
            <p className="text-muted-foreground mt-2">{t.registerSubtitle}</p>
          </CardHeader>
          <CardContent className="p-8">
            <form onSubmit={handleRegister} className="space-y-5">
              <div className="space-y-2 text-start">
                <Label htmlFor="fullName" className="flex items-center gap-2 justify-start">
                  {t.fullName} <User className="h-4 w-4 text-primary" />
                </Label>
                <Input 
                  id="fullName" 
                  placeholder={t.namePlaceholder}
                  className="rounded-2xl h-12 text-start" 
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2 text-start">
                <Label htmlFor="email" className="flex items-center gap-2 justify-start">
                  {t.email} <Mail className="h-4 w-4 text-primary" />
                </Label>
                <Input 
                  id="email" 
                  type="email"
                  placeholder="example@mail.com"
                  className="rounded-2xl h-12 text-start" 
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2 text-start">
                <Label htmlFor="phone" className="flex items-center gap-2 justify-start">
                  {t.phoneNumber} <Phone className="h-4 w-4 text-primary" />
                </Label>
                {/* Fixed Prefix Input */}
                <div className="flex rounded-2xl h-12 text-start bg-background border overflow-hidden focus-within:ring-2 focus-within:ring-primary/20">
                  <span className="flex items-center px-4 bg-primary/5 text-[#D4AF37] font-bold border-e border-primary/10">
                    +1
                  </span>
                  <Input 
                    id="phone" 
                    placeholder={t.phonePlaceholder}
                    className="border-none focus-visible:ring-0 shadow-none h-full text-start bg-transparent" 
                    value={formData.phoneNumber}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                      setFormData({ ...formData, phoneNumber: val });
                    }}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2 text-start">
                <Label htmlFor="password">{t.password}</Label>
                <Input 
                  id="password" 
                  type="password" 
                  placeholder="******"
                  className="rounded-2xl h-12 text-start" 
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
              </div>

              <Button type="submit" disabled={loading} className="w-full rounded-full h-14 mt-6 gap-2 text-lg font-bold">
                {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : <UserPlus className="h-6 w-6" />}
                {t.registerBtn}
              </Button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-muted-foreground">
                {t.alreadyHaveAccount}{' '}
                <Link href="/login" className="text-primary font-bold hover:underline">
                  {t.loginTitle}
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
