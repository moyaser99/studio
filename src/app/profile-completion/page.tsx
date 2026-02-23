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
import { Loader2, MapPin, Phone, User as UserIcon, Edit3 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { useTranslation } from '@/hooks/use-translation';

export default function ProfileCompletionPage() {
  const db = useFirestore();
  const { user, loading: authLoading } = useUser();
  const router = useRouter();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    phoneNumber: '',
    address: '',
    fullName: '',
  });

  const userRef = useMemoFirebase(() => {
    if (!db || !user) return null;
    return doc(db, 'users', user.uid);
  }, [db, user]);

  const { data: profile, loading: profileLoading } = useDoc(userRef);

  useEffect(() => {
    if (!authLoading && user) {
      let displayPhone = profile?.phoneNumber || user.phoneNumber || '';
      if (displayPhone.startsWith('+1')) {
        displayPhone = displayPhone.substring(2);
      } else if (displayPhone.startsWith('+962')) {
        displayPhone = displayPhone.substring(4);
      }
      
      setFormData({
        fullName: profile?.fullName || user.displayName || '',
        phoneNumber: displayPhone,
        address: profile?.address || '',
      });
    }
  }, [profile, user, authLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Safety check: Ensure user.uid is ready before writing
    if (!db || !user || !user.uid) {
      toast({ variant: 'destructive', title: 'Error', description: 'Authentication not ready. Please wait.' });
      return;
    }

    setSaving(true);
    const prefix = (profile?.phoneNumber?.startsWith('+962')) ? '+962' : '+1';
    const finalPhone = `${prefix}${formData.phoneNumber.replace(/\D/g, '')}`;

    try {
      if (formData.phoneNumber) {
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
        
        const duplicate = querySnapshot.docs.find(doc => doc.id !== user.uid);
        
        if (duplicate) {
          toast({ variant: 'destructive', title: 'Phone in use', description: t.phoneInUse });
          setSaving(false);
          return;
        }
      }
      
      const profileData = {
        fullName: formData.fullName,
        phoneNumber: finalPhone,
        address: formData.address,
        email: user.email,
        uid: user.uid,
        updatedAt: serverTimestamp(),
      };

      const targetDocRef = doc(db, 'users', user.uid);
      
      setDoc(targetDocRef, profileData, { merge: true })
        .then(() => {
          // Persistence for Checkout auto-population
          localStorage.setItem('harir-delivery-info', JSON.stringify(profileData));
          
          toast({ title: "Success", description: t.profileUpdated });
          router.push('/');
        })
        .catch(async () => {
          errorEmitter.emit('permission-error', new FirestorePermissionError({
            path: targetDocRef.path,
            operation: 'write',
            requestResourceData: profileData,
          }));
          setSaving(false);
        });

    } catch (error: any) {
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
    <div className="min-h-screen flex flex-col bg-muted/20">
      <main className="flex-1 flex items-center justify-center p-6 py-12">
        <Card className="w-full max-w-lg border-none shadow-2xl rounded-[32px] overflow-hidden bg-white">
          <CardHeader className="bg-primary/5 py-10 text-center border-b border-primary/10">
            <div className="flex justify-center mb-4">
               <div className="bg-primary/10 text-primary p-4 rounded-full">
                  {hasExistingData ? <Edit3 className="h-8 w-8" /> : <UserIcon className="h-8 w-8" />}
               </div>
            </div>
            <CardTitle className="text-3xl font-bold font-headline text-primary">
              {hasExistingData ? t.profileTitleEdit : t.profileTitle}
            </CardTitle>
            <p className="text-muted-foreground mt-2 px-6 text-lg text-start">
              {hasExistingData ? t.profileSubtitleEdit : t.profileSubtitle}
            </p>
          </CardHeader>
          <CardContent className="p-10">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2 text-start">
                <Label htmlFor="fullName" className="font-bold flex items-center gap-2 justify-start text-lg">
                  {t.fullName} <UserIcon className="h-4 w-4 text-primary" />
                </Label>
                <Input 
                  id="fullName" 
                  placeholder={t.namePlaceholder} 
                  required
                  className="rounded-2xl h-14 text-start bg-muted/30 border-none" 
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                />
              </div>

              <div className="space-y-2 text-start">
                <Label htmlFor="phone" className="font-bold flex items-center gap-2 justify-start text-lg">
                   {t.phoneLogin} <Phone className="h-4 w-4 text-primary" />
                </Label>
                <div className="flex rounded-2xl h-14 text-start bg-muted/30 border-none overflow-hidden focus-within:ring-2 focus-within:ring-primary/20">
                  <span className="flex items-center px-4 bg-primary/5 text-[#D4AF37] font-bold border-e border-primary/10 select-none cursor-default">
                    {(profile?.phoneNumber?.startsWith('+962')) ? '+962' : '+1'}
                  </span>
                  <Input 
                    id="phone" 
                    placeholder={t.phonePlaceholder} 
                    required
                    className="border-none focus-visible:ring-0 shadow-none h-full text-start bg-transparent" 
                    value={formData.phoneNumber}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                      setFormData({ ...formData, phoneNumber: val });
                    }}
                  />
                </div>
              </div>

              <div className="space-y-2 text-start">
                <Label htmlFor="address" className="font-bold flex items-center gap-2 justify-start text-lg">
                   {t.deliveryAddress} <MapPin className="h-4 w-4 text-primary" />
                </Label>
                <Textarea 
                  id="address" 
                  placeholder={t.addressPlaceholder} 
                  required
                  className="rounded-3xl min-h-[140px] text-start bg-muted/30 border-none p-4" 
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>

              <Button disabled={saving} type="submit" className="w-full h-16 rounded-full text-xl font-bold shadow-xl mt-6">
                {saving ? <Loader2 className="h-6 w-6 animate-spin" /> : (hasExistingData ? t.saveChanges : t.saveAndContinue)}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
