'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useFirestore, useUser, useDoc } from '@/firebase';
import { doc, setDoc, serverTimestamp, collection, query, where, getDocs } from 'firebase/firestore';
import { useMemoFirebase } from '@/firebase/use-memo-firebase';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, MapPin, Phone, User as UserIcon, Edit3, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

/**
 * Profile Management Page
 * Enforces using Firebase UID as Document ID and Unique Phone Number Rule.
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

  // Fetch existing profile data using the UID as the unique key
  const userRef = useMemoFirebase(() => {
    if (!db || !user) return null;
    return doc(db, 'users', user.uid);
  }, [db, user]);

  const { data: profile, loading: profileLoading } = useDoc(userRef);

  // Pre-fill Logic: Firestore Data -> Auth Data Fallback
  useEffect(() => {
    if (!authLoading && user) {
      const existingName = profile?.fullName || user.displayName || '';
      const existingPhone = profile?.phoneNumber || user.phoneNumber || '';
      const existingAddress = profile?.address || '';

      setFormData({
        fullName: existingName,
        phoneNumber: existingPhone,
        address: existingAddress,
      });
    }
  }, [profile, user, authLoading]);

  // Handle unauthorized access
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db || !user) return;

    setSaving(true);

    try {
      // 1. UNIQUE PHONE CHECK: Ensure phone is not linked to another UID
      if (formData.phoneNumber) {
        const phoneQuery = query(
          collection(db, 'users'),
          where('phoneNumber', '==', formData.phoneNumber)
        );
        const querySnapshot = await getDocs(phoneQuery);
        
        // Check if any document exists with this phone that is NOT the current user
        const duplicate = querySnapshot.docs.find(doc => doc.id !== user.uid);
        
        if (duplicate) {
          toast({ 
            variant: 'destructive', 
            title: 'رقم الهاتف مستخدم', 
            description: 'هذا الرقم مرتبط بحساب آخر بالفعل.' 
          });
          setSaving(false);
          return;
        }
      }
      
      // 2. CONSTRUCT PAYLOAD
      const profileData = {
        fullName: formData.fullName,
        phoneNumber: formData.phoneNumber,
        address: formData.address,
        email: user.email,
        uid: user.uid,
        updatedAt: serverTimestamp(),
      };

      // 3. PERSIST: Always use user.uid as the document ID to prevent duplicates
      const targetDocRef = doc(db, 'users', user.uid);
      await setDoc(targetDocRef, profileData, { merge: true });
      
      toast({ title: "تم التحديث", description: "تم حفظ بياناتك بنجاح." });
      
      // Redirect after successful save
      router.push('/');
    } catch (error: any) {
      console.error("[Firebase Profile Update Error]:", error);
      toast({ 
        variant: 'destructive', 
        title: 'فشل في حفظ البيانات', 
        description: 'حدث خطأ أثناء معالجة طلبك.' 
      });
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  const hasExistingData = !!profile?.address;

  return (
    <div className="min-h-screen flex flex-col bg-muted/20" dir="rtl">
      <Header />
      <main className="flex-1 flex items-center justify-center p-6 py-12">
        <Card className="w-full max-w-lg border-none shadow-2xl rounded-[32px] overflow-hidden bg-white">
          <CardHeader className="bg-primary/5 py-10 text-center border-b border-primary/10">
            <div className="flex justify-center mb-4">
               {hasExistingData ? (
                 <div className="bg-primary/10 text-primary p-4 rounded-full">
                    <Edit3 className="h-8 w-8" />
                 </div>
               ) : (
                 <div className="bg-primary/10 text-primary p-4 rounded-full animate-pulse">
                    <UserIcon className="h-8 w-8" />
                 </div>
               )}
            </div>
            <CardTitle className="text-3xl font-bold font-headline text-primary">
              {hasExistingData ? 'تعديل الملف الشخصي' : 'بيانات التوصيل'}
            </CardTitle>
            <p className="text-muted-foreground mt-2 px-6 text-lg">
              {hasExistingData 
                ? 'يمكنك تحديث معلوماتك وعنوان التوصيل في أي وقت.' 
                : 'أهلاً بك! نحتاج هذه البيانات لتسهيل عملية التوصيل لك.'}
            </p>
          </CardHeader>
          <CardContent className="p-10">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2 text-right">
                <Label htmlFor="fullName" className="font-bold flex items-center gap-2 justify-end text-lg">
                  الاسم الكامل <UserIcon className="h-4 w-4 text-primary" />
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
                    <Loader2 className="h-6 w-6 animate-spin" /> جاري التحقق والحفظ...
                  </div>
                ) : (
                  hasExistingData ? "حفظ التغييرات" : "حفظ والمتابعة"
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