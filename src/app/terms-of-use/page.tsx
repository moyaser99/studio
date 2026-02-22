'use client';

import React from 'react';
import { useTranslation } from '@/hooks/use-translation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  FileText, 
  UserCheck, 
  AlertCircle, 
  Truck, 
  Scale, 
  ShieldAlert, 
  Globe,
  Lock
} from 'lucide-react';

export default function TermsOfUsePage() {
  const { t, lang } = useTranslation();

  const sections = [
    {
      id: 'acceptance',
      icon: FileText,
      title: lang === 'ar' ? '1. الموافقة على الشروط' : '1. Acceptance of Terms',
      content: lang === 'ar' 
        ? 'باستخدامك لمتجر HarirBoutiqueUSA، فإنك توافق على هذه الشروط. إذا كنت لا توافق، يرجى عدم استخدام الموقع.' 
        : 'By using HarirBoutiqueUSA, you agree to these terms. If you do not agree, please do not use the site.'
    },
    {
      id: 'eligibility',
      icon: UserCheck,
      title: lang === 'ar' ? '2. الأهلية' : '2. Eligibility',
      content: lang === 'ar' 
        ? 'يجب أن تكون بعمر 18 عاماً أو أكثر لشراء السلع الفاخرة من هذا الموقع.' 
        : 'Must be 18+ to purchase luxury items from this site.'
    },
    {
      id: 'pricing',
      icon: AlertCircle,
      title: lang === 'ar' ? '3. أخطاء التسعير' : '3. Pricing & Accuracy',
      content: lang === 'ar' 
        ? 'نحتفظ بالحق في إلغاء الطلبات الناتجة عن أخطاء تقنية في التسعير أو معلومات غير دقيقة في أي وقت.' 
        : 'We reserve the right to cancel orders arising from technical pricing errors or inaccuracies at any time.'
    },
    {
      id: 'shipping',
      icon: Truck,
      title: lang === 'ar' ? '4. الشحن ومخاطر الفقدان' : '4. Shipping & Risk of Loss',
      content: lang === 'ar' 
        ? 'تنتقل مخاطر الخسارة وملكية السلع إليك بمجرد تسليم الشحنة لشركة النقل (مثل UPS، FedEx، USPS).' 
        : 'Risk of loss and title for items pass to you upon our delivery to the carrier (e.g., UPS, FedEx, USPS).'
    },
    {
      id: 'liability',
      icon: Scale,
      title: lang === 'ar' ? '5. حدود المسؤولية' : '5. Limitation of Liability',
      content: lang === 'ar' 
        ? 'مسؤوليتنا محدودة وفقاً لأقصى حد يسمح به قانون الولايات المتحدة الأمريكية فيما يتعلق باستخدام منتجاتنا أو الموقع.' 
        : 'Our liability is limited to the maximum extent permitted by US law regarding the use of our products or site.'
    },
    {
      id: 'ip',
      icon: ShieldAlert,
      title: lang === 'ar' ? '6. الملكية الفكرية' : '6. Intellectual Property',
      content: lang === 'ar' 
        ? 'اسم العلامة HarirBoutiqueUSA وجميع التصاميم والشعارات هي ملكية محمية بموجب قوانين الملكية الفكرية.' 
        : 'The HarirBoutiqueUSA brand name and all custom designs are protected property and exclusive to the store.'
    }
  ];

  return (
    <div className="min-h-screen bg-muted/10 py-12 md:py-20" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-start mb-12 space-y-4">
          <h1 className="text-4xl md:text-6xl font-black font-headline text-primary tracking-tight">
            {lang === 'ar' ? 'شروط الاستخدام' : 'Terms of Use'}
          </h1>
          <div className="flex flex-col items-start gap-2">
            <p className="text-muted-foreground font-bold text-lg">
              {lang === 'ar' ? 'آخر تحديث: 22 فبراير 2026' : 'Last updated: February 22, 2026'}
            </p>
            <Separator className="w-24 bg-[#D4AF37] h-1" />
          </div>
        </div>

        <div className="grid gap-8">
          {sections.map((section) => (
            <Card key={section.id} className="rounded-[2rem] border-none shadow-xl bg-white overflow-hidden hover:shadow-2xl transition-all duration-300 group">
              <CardHeader className="bg-primary/5 p-6 border-b border-primary/10 group-hover:bg-[#D4AF37]/5 transition-colors">
                <CardTitle className="text-2xl font-bold font-headline flex items-center gap-4 text-primary">
                  <div className="bg-white p-3 rounded-2xl shadow-sm text-[#D4AF37]">
                    <section.icon className="h-6 w-6" />
                  </div>
                  <span className="text-xl md:text-2xl">{section.title}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <p className="text-muted-foreground leading-relaxed text-lg text-start font-medium">
                  {section.content}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-20 p-10 bg-primary/5 rounded-[3rem] border-2 border-dashed border-primary/20 text-center">
          <p className="text-primary font-black text-xl mb-2">HarirBoutiqueUSA</p>
          <p className="text-muted-foreground font-medium">
            {lang === 'ar' 
              ? 'باستخدامك لخدماتنا، فإنك تساهم في الحفاظ على بيئة تسوق آمنة وفاخرة.' 
              : 'By using our services, you help maintain a safe and premium shopping environment.'}
          </p>
        </div>
      </div>
    </div>
  );
}
