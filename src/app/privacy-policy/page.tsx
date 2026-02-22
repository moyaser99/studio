'use client';

import React from 'react';
import { useTranslation } from '@/hooks/use-translation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  ShieldCheck, 
  Info, 
  CreditCard, 
  UserCheck, 
  Baby, 
  Database, 
  Cookie, 
  Mail 
} from 'lucide-react';

export default function PrivacyPolicyPage() {
  const { t, lang } = useTranslation();

  const sections = [
    {
      id: 'intro',
      title: t.privacyIntroTitle,
      content: t.privacyIntroContent,
      icon: ShieldCheck,
      bgColor: 'bg-primary/5',
      borderColor: 'border-primary/10',
      iconColor: 'text-[#D4AF37]'
    },
    {
      id: 'info',
      title: t.privacyInfoTitle,
      content: t.privacyInfoContent,
      icon: Info,
      bgColor: 'bg-[#D4AF37]/5',
      borderColor: 'border-[#D4AF37]/10',
      iconColor: 'text-primary'
    },
    {
      id: 'payment',
      title: t.privacyPaymentTitle,
      content: t.privacyPaymentContent,
      icon: CreditCard,
      bgColor: 'bg-primary/5',
      borderColor: 'border-primary/10',
      iconColor: 'text-[#D4AF37]'
    },
    {
      id: 'ccpa',
      title: t.privacyCCPATitle,
      content: t.privacyCCPAContent,
      icon: UserCheck,
      bgColor: 'bg-[#D4AF37]/5',
      borderColor: 'border-[#D4AF37]/10',
      iconColor: 'text-primary'
    },
    {
      id: 'coppa',
      title: t.privacyCOPPATitle,
      content: t.privacyCOPPAContent,
      icon: Baby,
      bgColor: 'bg-primary/5',
      borderColor: 'border-primary/10',
      iconColor: 'text-[#D4AF37]'
    },
    {
      id: 'cookies',
      title: t.privacyCookiesTitle,
      content: t.privacyCookiesContent,
      icon: Cookie,
      bgColor: 'bg-[#D4AF37]/5',
      borderColor: 'border-[#D4AF37]/10',
      iconColor: 'text-primary'
    },
    {
      id: 'thirdparty',
      title: t.privacyThirdPartyTitle,
      content: t.privacyThirdPartyContent,
      icon: Database,
      bgColor: 'bg-primary/5',
      borderColor: 'border-primary/10',
      iconColor: 'text-[#D4AF37]'
    },
    {
      id: 'contact',
      title: t.privacyContactTitle,
      content: t.privacyContactContent,
      icon: Mail,
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
            {t.privacyPolicy}
          </h1>
          <p className="text-muted-foreground text-lg md:text-xl max-w-2xl">
            {lang === 'ar' 
              ? 'نحن نأخذ خصوصيتك على محمل الجد. إليك كيف نحمي بياناتك في HarirBoutiqueUSA.' 
              : 'We take your privacy seriously. Here is how we protect your data at HarirBoutiqueUSA.'}
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
                  {section.id === 'contact' && (
                    <a href="mailto:support@harirboutiqueusa.com" className="block mt-4 font-bold text-[#D4AF37] hover:underline">
                      support@harirboutiqueusa.com
                    </a>
                  )}
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
