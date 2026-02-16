'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useFirestore, useUser, useDoc } from '@/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useMemoFirebase } from '@/firebase/use-memo-firebase';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, MapPin, Phone, CheckCircle, User as UserIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

/**
 * Profile Completion & Management Page
 * Handles fetching existing user data and updating delivery information.
 */
export default function ProfileCompletionPage() {
  const db = useFirestore();
  const { user, loading: authLoading } = useUser();
  const router = useRouter();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    phoneNumber: '',
    address: '',
    fullName: '',
  });

  // Fetch existing profile data from Firestore
  const userRef = useMemoFirebase(() => {
    if (!db || !user) return null;
    return doc(db, 'users', user.uid);
  }, [db, user]);

  const { data: profile, loading: profileLoading } = useDoc(userRef);

  // Sync profile data to form once loaded
  useEffect(() => {
    if (profile) {
      setFormData({
        phoneNumber: profile.phoneNumber || '',
        address: profile.address || '',
        fullName: profile.fullName || profile.displayName || user?.displayName || '',
      });
    }
  }, [profile, user]);

  // Handle unauthorized access
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!db || !user) return;

    setSaving(true);
    const profileData = {
      ...formData,
      email: user.email,
      uid: user.uid,
      updatedAt: serverTimestamp(),
    };

    // Update with merge: true to preserve other fields like createdAt
    setDoc(doc(db, 'users', user.uid), profileData, { merge: true })
      .then(() => {
        toast({ title: "تم التحديث", description: "تم حفظ بياناتك بنجاح." });
        // Redirect to home after success
        router.push('/');
      })
      .catch((error) => {
        toast({ variant: 'destructive', title: 'خطأ', description: 'فشل في حفظ البيانات.' });
      })
      .finally(() => setSaving(false));
  };

  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  const isComplete = profile?.phoneNumber && profile?.address;

  return (
    <div className="min-h-screen flex flex-col bg-muted/20" dir="rtl">
      <Header />
      <main className="flex-1 flex items-center justify-center p-6 py-12">
        <Card className="w-full max-w-lg border-none shadow-2xl rounded-[32px] overflow-hidden bg-white">
          <CardHeader className="bg-primary/5 py-10 text-center border-b border-primary/10">
            <div className="flex justify-center mb-4">
               {isComplete ? (
                 <div className="bg-green-100 text-green-600 p-4 rounded-full shadow-inner">
                    <CheckCircle className="h-8 w-8" />
                 </div>
               ) : (
                 <div className="bg-primary/10 text-primary p-4 rounded-full animate-pulse">
                    <UserIcon className="h-8 w-8" />
                 </div>
               )}
            </div>
            <CardTitle className="text-3xl font-bold font-headline text-primary">
              {isComplete ? 'إدارة الملف الشخصي' : 'إكمال البيانات'}
            </CardTitle>
            <p className="text-muted-foreground mt-2 px-6 text-lg">
              {isComplete 
                ? 'مرحباً بك مجدداً. يمكنك مراجعة أو تحديث بياناتك هنا.' 
                : 'أهلاً بك! نحتاج هذه البيانات لتسهيل عملية التوصيل لك.'}
            </p>
          </CardHeader>
          <CardContent className="p-10">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2 text-right">
                <Label htmlFor="fullName" className="font-bold flex items-center gap-2 justify-end text-lg">
                  الاسم الكامل
                </Label>
                <Input 
                  id="fullName" 
                  placeholder="أدخل اسمك بالكامل" 
                  required
                  className="rounded-2xl h-14 text-right bg-muted/30 border-none focus:ring-2 focus:ring-primary/20 transition-all" 
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                />
              </div>

              <div className="space-y-2 text-right">
                <Label htmlFor="phone" className="font-bold flex items-center gap-2 justify-end text-lg">
                   رقم الهاتف <Phone className="h-4 w-4 text-primary" />
                </Label>
                <Input 
                  id="phone" 
                  placeholder="05XXXXXXXX" 
                  required
                  className="rounded-2xl h-14 text-right bg-muted/30 border-none focus:ring-2 focus:ring-primary/20 transition-all" 
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                />
              </div>

              <div className="space-y-2 text-right">
                <Label htmlFor="address" className="font-bold flex items-center gap-2 justify-end text-lg">
                   عنوان التوصيل بالتفصيل <MapPin className="h-4 w-4 text-primary" />
                </Label>
                <Textarea 
                  id="address" 
                  placeholder="المدينة، الحي، اسم الشارع، رقم المبنى..." 
                  required
                  className="rounded-3xl min-h-[140px] text-right bg-muted/30 border-none p-4 focus:ring-2 focus:ring-primary/20 transition-all" 
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>

              <Button disabled={saving} type="submit" className="w-full h-16 rounded-full text-xl font-bold shadow-xl mt-6 hover:scale-[1.02] transition-transform">
                {saving ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-6 w-6 animate-spin" /> جاري الحفظ...
                  </div>
                ) : (
                  isComplete ? "تحديث البيانات" : "حفظ والمتابعة"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
