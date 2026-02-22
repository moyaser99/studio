'use client';

import React from 'react';
import { useTranslation } from '@/hooks/use-translation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldCheck, Info, CreditCard, UserCheck, Baby } from 'lucide-react';

export default function PrivacyPolicyPage() {
  const { t, lang } = useTranslation();

  return (
    <div className="min-h-screen bg-muted/10 py-12 md:py-20" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-start mb-12 space-y-4">
          <h1 className="text-4xl md:text-6xl font-black font-headline text-primary tracking-tight">
            {t.privacyPolicy}
          </h1>
          <p className="text-muted-foreground text-lg md:text-xl max-w-2xl">
            {lang === 'ar' 
              ? 'نحن نأخذ خصوصيتك على محمل الجد. إليك كيف نحمي بياناتك في HarirBoutiqueUSA.' 
              : 'We take your privacy seriously. Here is how we protect your data at HarirBoutiqueUSA.'}
          </p>
        </div>

        <div className="grid gap-8">
          {/* Section 1: Introduction */}
          <Card className="rounded-[2.5rem] border-none shadow-xl bg-white overflow-hidden hover:shadow-2xl transition-all duration-300">
            <CardHeader className="bg-primary/5 p-8 border-b border-primary/10">
              <CardTitle className="text-2xl font-bold font-headline text-start flex items-center gap-3">
                <ShieldCheck className="h-7 w-7 text-[#D4AF37]" /> {t.privacyIntroTitle}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <p className="text-muted-foreground leading-relaxed text-lg text-start">
                {t.privacyIntroContent}
              </p>
            </CardContent>
          </Card>

          {/* Section 2: Info Collection */}
          <Card className="rounded-[2.5rem] border-none shadow-xl bg-white overflow-hidden hover:shadow-2xl transition-all duration-300">
            <CardHeader className="bg-[#D4AF37]/5 p-8 border-b border-[#D4AF37]/10">
              <CardTitle className="text-2xl font-bold font-headline text-start flex items-center gap-3">
                <Info className="h-7 w-7 text-primary" /> {t.privacyInfoTitle}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <p className="text-muted-foreground leading-relaxed text-lg text-start">
                {t.privacyInfoContent}
              </p>
            </CardContent>
          </Card>

          {/* Section 3: Payment & Security */}
          <Card className="rounded-[2.5rem] border-none shadow-xl bg-white overflow-hidden hover:shadow-2xl transition-all duration-300">
            <CardHeader className="bg-primary/5 p-8 border-b border-primary/10">
              <CardTitle className="text-2xl font-bold font-headline text-start flex items-center gap-3">
                <CreditCard className="h-7 w-7 text-[#D4AF37]" /> {t.privacyPaymentTitle}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <p className="text-muted-foreground leading-relaxed text-lg text-start">
                {t.privacyPaymentContent}
              </p>
            </CardContent>
          </Card>

          {/* Section 4: CCPA Rights */}
          <Card className="rounded-[2.5rem] border-none shadow-xl bg-white overflow-hidden hover:shadow-2xl transition-all duration-300">
            <CardHeader className="bg-[#D4AF37]/5 p-8 border-b border-[#D4AF37]/10">
              <CardTitle className="text-2xl font-bold font-headline text-start flex items-center gap-3">
                <UserCheck className="h-7 w-7 text-primary" /> {t.privacyCCPATitle}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <p className="text-muted-foreground leading-relaxed text-lg text-start">
                {t.privacyCCPAContent}
              </p>
            </CardContent>
          </Card>

          {/* Section 5: COPPA Compliance */}
          <Card className="rounded-[2.5rem] border-none shadow-xl bg-white overflow-hidden hover:shadow-2xl transition-all duration-300">
            <CardHeader className="bg-primary/5 p-8 border-b border-primary/10">
              <CardTitle className="text-2xl font-bold font-headline text-start flex items-center gap-3">
                <Baby className="h-7 w-7 text-[#D4AF37]" /> {t.privacyCOPPATitle}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <p className="text-muted-foreground leading-relaxed text-lg text-start">
                {t.privacyCOPPAContent}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-16 text-center">
          <p className="text-sm text-muted-foreground font-medium italic">
            {lang === 'ar' ? 'آخر تحديث: 20 فبراير 2026' : 'Last updated: February 20, 2026'}
          </p>
        </div>
      </div>
    </div>
  );
}
