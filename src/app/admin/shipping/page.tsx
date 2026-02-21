
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useFirestore, useUser, useDoc } from '@/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { 
  Loader2, 
  ChevronLeft, 
  ChevronRight, 
  Save, 
  Truck, 
  Search, 
  X,
  AlertTriangle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useMemoFirebase } from '@/firebase/use-memo-firebase';
import Link from 'next/link';
import { useTranslation } from '@/hooks/use-translation';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

const ADMIN_EMAIL = 'mohammad.dd.my@gmail.com';
const ADMIN_PHONE = '+962780334074';

const DEFAULT_RATES: Record<string, number> = {
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

export default function AdminShippingPage() {
  const db = useFirestore();
  const { user, loading: authLoading } = useUser();
  const { toast } = useToast();
  const { t, lang } = useTranslation();
  
  const [rates, setRates] = useState<Record<string, number>>(DEFAULT_RATES);
  const [searchTerm, setSearchTerm] = useState('');
  const [saving, setSaving] = useState(false);

  // Correct collection path is 'siteSettings'
  const shippingRef = useMemoFirebase(() => {
    if (!db) return null;
    return doc(db, 'siteSettings', 'shipping');
  }, [db]);

  const { data: shippingData, loading: ratesLoading } = useDoc(shippingRef);

  useEffect(() => {
    if (shippingData) {
      const cleanRates: Record<string, number> = {};
      Object.keys(DEFAULT_RATES).forEach(state => {
        if (typeof shippingData[state] === 'number') {
          cleanRates[state] = shippingData[state];
        } else {
          cleanRates[state] = DEFAULT_RATES[state];
        }
      });
      setRates(cleanRates);
    }
  }, [shippingData]);

  const filteredStates = useMemo(() => {
    const states = Object.keys(rates).sort();
    if (!searchTerm.trim()) return states;
    return states.filter(state => state.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [rates, searchTerm]);

  const handleRateChange = (state: string, value: string) => {
    const numValue = parseFloat(value) || 0;
    setRates(prev => ({ ...prev, [state]: numValue }));
  };

  const isAdmin = user?.email === ADMIN_EMAIL || user?.phoneNumber === ADMIN_PHONE;

  const handleSave = () => {
    if (!db || !shippingRef || !isAdmin) {
      if (!isAdmin && !authLoading) {
        toast({ variant: 'destructive', title: 'Unauthorized', description: t.insufficientPermissions });
      }
      return;
    }
    
    setSaving(true);
    
    const payload = {
      ...rates,
      updatedAt: serverTimestamp()
    };

    // Using siteSettings collection as per instructions
    setDoc(shippingRef, payload, { merge: true })
      .then(() => {
        toast({ 
          title: lang === 'ar' ? 'تم التحديث' : 'Success', 
          description: lang === 'ar' ? 'تم تحديث أسعار الشحن بنجاح' : 'Shipping rates updated successfully'
        });
      })
      .catch(async (error) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: shippingRef.path,
          operation: 'write',
          requestResourceData: payload
        }));
      })
      .finally(() => setSaving(false));
  };

  if (authLoading) return (
    <div className="flex items-center justify-center p-20">
      <Loader2 className="h-10 w-10 animate-spin text-primary" />
    </div>
  );

  if (!isAdmin && !authLoading) {
    return (
      <div className="flex items-center justify-center bg-muted/20 p-8" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
        <Card className="max-w-md text-center p-8 rounded-3xl shadow-xl">
          <div className="bg-destructive/10 text-destructive p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="h-8 w-8" />
          </div>
          <CardTitle className="text-2xl text-destructive mb-4">{t.sessionWarning}</CardTitle>
          <Link href="/login"><Button className="rounded-full h-12">{t.loginTitle}</Button></Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-6">
        <div className="text-start">
          <Link href="/admin" className="text-primary flex items-center gap-1 mb-2 hover:underline">
            {lang === 'ar' ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />} {t.backToDashboard}
          </Link>
          <h1 className="text-4xl font-black font-headline text-primary flex items-center gap-3">
            <Truck className="h-10 w-10" /> {t.manageShipping}
          </h1>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <div className="relative group flex-1 sm:w-64">
            <Search className="absolute start-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-[#D4AF37] transition-colors" />
            <input
              type="text"
              placeholder={t.searchState}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-12 ps-12 pe-12 rounded-full border-2 border-primary/10 bg-white focus:outline-none focus:border-[#D4AF37] transition-all shadow-sm"
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} className="absolute end-4 top-1/2 -translate-y-1/2 h-8 w-8 flex items-center justify-center text-muted-foreground hover:text-primary">
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
          
          <Button onClick={handleSave} disabled={saving} className="rounded-full h-12 px-8 bg-[#D4AF37] hover:bg-[#B8962D] shadow-lg gap-2 text-lg font-bold transition-all hover:scale-105 active:scale-95">
            {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />} {t.saveChanges}
          </Button>
        </div>
      </div>

      <Card className="rounded-[2.5rem] overflow-hidden border-none shadow-xl bg-white">
        <CardHeader className="bg-primary/5 p-8 border-b">
          <CardTitle className="text-2xl font-bold font-headline text-start">{t.shippingRates}</CardTitle>
        </CardHeader>
        <CardContent className="p-8">
          {ratesLoading ? (
            <div className="py-20 flex justify-center"><Loader2 className="h-10 w-10 animate-spin text-primary/40" /></div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredStates.map(state => (
                <div key={state} className="p-4 rounded-2xl border-2 border-primary/5 hover:border-[#D4AF37]/30 transition-all space-y-3 bg-muted/5 group">
                  <Label className="font-bold text-lg block text-start group-hover:text-primary transition-colors">{state}</Label>
                  <div className="flex items-center gap-2 bg-white rounded-xl border-2 border-primary/10 focus-within:border-[#D4AF37] transition-all overflow-hidden p-1 shadow-sm">
                    <span className="ps-3 font-black text-[#D4AF37]">$</span>
                    <input 
                      type="number" 
                      value={rates[state]} 
                      onChange={(e) => handleRateChange(state, e.target.value)}
                      className="w-full h-10 border-none focus:ring-0 text-start font-bold"
                    />
                  </div>
                </div>
              ))}
              {filteredStates.length === 0 && (
                <div className="col-span-full py-12 text-center text-muted-foreground font-bold">
                   {lang === 'ar' ? 'لم يتم العثور على ولايات.' : 'No states found.'}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
