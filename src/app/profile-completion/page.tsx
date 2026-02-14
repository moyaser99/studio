
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useFirestore, useUser } from '@/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, MapPin, Phone } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function ProfileCompletionPage() {
  const db = useFirestore();
  const { user, loading: authLoading } = useUser();
  const router = useRouter();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    phoneNumber: '',
    address: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!db || !user) return;

    setSaving(true);
    const profileData = {
      ...formData,
      email: user.email,
      displayName: user.displayName,
      updatedAt: serverTimestamp(),
    };

    setDoc(doc(db, 'users', user.uid), profileData, { merge: true })
      .then(() => {
        toast({ title: "تم الحفظ", description: "تم تحديث بيانات التوصيل بنجاح." });
        router.push('/');
      })
      .catch((error) => {
        toast({ variant: 'destructive', title: 'خطأ', description: 'فشل في حفظ البيانات.' });
      })
      .finally(() => setSaving(false));
  };

  if (authLoading) return null;
  if (!user) {
    router.push('/login');
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-muted/20" dir="rtl">
      <Header />
      <main className="flex-1 flex items-center justify-center p-6">
        <Card className="w-full max-w-lg border-none shadow-2xl rounded-3xl overflow-hidden bg-white">
          <CardHeader className="bg-primary/5 py-8 text-center border-b border-primary/10">
            <CardTitle className="text-2xl font-bold font-headline text-primary">إكمال الملف الشخصي</CardTitle>
            <p className="text-muted-foreground mt-2">نحتاج هذه البيانات لتسهيل عملية التوصيل لك.</p>
          </CardHeader>
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2 text-right">
                <Label htmlFor="phone" className="font-semibold flex items-center gap-2 justify-end">
                  <Phone className="h-4 w-4 text-primary" /> رقم الهاتف
                </Label>
                <Input 
                  id="phone" 
                  placeholder="05XXXXXXXX" 
                  required
                  className="rounded-2xl h-12 text-right" 
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                />
              </div>
              <div className="space-y-2 text-right">
                <Label htmlFor="address" className="font-semibold flex items-center gap-2 justify-end">
                  <MapPin className="h-4 w-4 text-primary" /> عنوان التوصيل بالتفصيل
                </Label>
                <Textarea 
                  id="address" 
                  placeholder="المدينة، الحي، اسم الشارع، رقم المبنى..." 
                  required
                  className="rounded-2xl min-h-[120px] text-right" 
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>
              <Button disabled={saving} type="submit" className="w-full h-14 rounded-full text-lg font-bold shadow-lg">
                {saving ? <Loader2 className="h-6 w-6 animate-spin" /> : "حفظ والمتابعة"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
