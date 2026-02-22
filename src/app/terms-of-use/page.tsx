
'use client';

import React from 'react';
import { useTranslation } from '@/hooks/use-translation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  FileText, 
  UserCheck, 
  AlertCircle, 
  Scale, 
  ShieldAlert, 
  Globe 
} from 'lucide-react';

export default function TermsOfUsePage() {
  const { t, lang } = useTranslation();

  const sections = [
    {
      id: 'acceptance',
      title: t.termsIntroTitle,
      content: t.termsIntroContent,
      icon: FileText,
      bgColor: 'bg-primary/5',
      borderColor: 'border-primary/10',
      iconColor: 'text-[#D4AF37]'
    },
    {
      id: 'eligibility',
      title: t.termsEligibilityTitle,
      content: t.termsEligibilityContent,
      icon: UserCheck,
      bgColor: 'bg-[#D4AF37]/5',
      borderColor: 'border-[#D4AF37]/10',
      iconColor: 'text-primary'
    },
    {
      id: 'pricing',
      title: t.termsPricingTitle,
      content: t.termsPricingContent,
      icon: AlertCircle,
      bgColor: 'bg-primary/5',
      borderColor: 'border-primary/10',
      iconColor: 'text-[#D4AF37]'
    },
    {
      id: 'liability',
      title: t.termsLiabilityTitle,
      content: t.termsLiabilityContent,
      icon: Scale,
      bgColor: 'bg-[#D4AF37]/5',
      borderColor: 'border-[#D4AF37]/10',
      iconColor: 'text-primary'
    },
    {
      id: 'ip',
      title: t.termsIPTitle,
      content: t.termsIPContent,
      icon: ShieldAlert,
      bgColor: 'bg-primary/5',
      borderColor: 'border-primary/10',
      iconColor: 'text-[#D4AF37]'
    },
    {
      id: 'law',
      title: t.termsLawTitle,
      content: t.termsLawContent,
      icon: Globe,
      bgColor: 'bg-[#D4AF37]/5',
      borderColor: 'border-[#D4AF37]/10',
      iconColor: 'text-primary'
    }
  ];

  return (
    <div className="min-h-screen bg-muted/10 py-12 md:py-20" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-start mb-12 space-y-4">
          <h1 className="text-4xl md:text-6xl font-black font-headline text-primary tracking-tight">
            {t.termsOfUse}
          </h1>
          <p className="text-muted-foreground text-lg md:text-xl max-w-2xl">
            {lang === 'ar' 
              ? 'يرجى قراءة شروط الخدمة بعناية قبل استخدام متجر HarirBoutiqueUSA.' 
              : 'Please read the terms of service carefully before using HarirBoutiqueUSA store.'}
          </p>
        </div>

        <div className="grid gap-8">
          {sections.map((section) => (
            <Card key={section.id} className="rounded-[2.5rem] border-none shadow-xl bg-white overflow-hidden hover:shadow-2xl transition-all duration-300">
              <CardHeader className={`${section.bgColor} p-8 border-b ${section.borderColor}`}>
                <CardTitle className="text-2xl font-bold font-headline text-start flex items-center gap-3 text-primary">
                  <section.icon className={`h-7 w-7 ${section.iconColor}`} /> {section.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <p className="text-muted-foreground leading-relaxed text-lg text-start">
                  {section.content}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-16 text-center">
          <p className="text-sm text-muted-foreground font-medium italic">
            {lang === 'ar' ? 'آخر تحديث: 22 فبراير 2026' : 'Last updated: February 22, 2026'}
          </p>
        </div>
      </div>
    </div>
  );
}
