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
      en: {
        title: '1. Acceptance of Terms',
        content: 'By using HarirBoutiqueUSA, you agree to these terms. If you do not agree, please do not use the site.'
      },
      ar: {
        title: '1. قبول الشروط',
        content: 'باستخدامك لمتجر HarirBoutiqueUSA، فإنك توافق على هذه الشروط. إذا كنت لا توافق، يرجى عدم استخدام الموقع.'
      }
    },
    {
      id: 'eligibility',
      icon: UserCheck,
      en: {
        title: '2. Eligibility',
        content: 'You must be at least 18 years of age to use this site and purchase luxury items.'
      },
      ar: {
        title: '2. الأهلية',
        content: 'يجب أن تكون بعمر 18 عاماً أو أكثر لاستخدام هذا الموقع وشراء السلع الفاخرة.'
      }
    },
    {
      id: 'pricing',
      icon: AlertCircle,
      en: {
        title: '3. Pricing & Accuracy',
        content: 'We reserve the right to correct pricing errors and cancel orders arising from technical glitches or inaccuracies at any time, even after order confirmation.'
      },
      ar: {
        title: '3. دقة التسعير',
        content: 'نحتفظ بالحق في تصحيح أخطاء التسعير وإلغاء الطلبات الناتجة عن أعطال تقنية أو أخطاء في أي وقت، حتى بعد تأكيد الطلب.'
      }
    },
    {
      id: 'shipping',
      icon: Truck,
      en: {
        title: '4. Shipping & Risk of Loss',
        content: 'All items purchased are made pursuant to a shipment contract. The risk of loss and title for such items pass to you upon our delivery to the carrier (e.g., UPS, FedEx, USPS).'
      },
      ar: {
        title: '4. الشحن ومخاطر الفقدان',
        content: 'تخضع جميع المشتريات لعقد شحن؛ وتنتقل مخاطر الخسارة وملكية السلع إليك بمجرد تسليمنا الشحنة لشركة النقل (مثل UPS، FedEx، USPS).'
      }
    },
    {
      id: 'liability',
      icon: Scale,
      en: {
        title: '5. Limitation of Liability',
        content: 'To the maximum extent permitted by US law, HarirBoutiqueUSA shall not be liable for any direct, indirect, or consequential damages resulting from the use of our products or site.'
      },
      ar: {
        title: '5. حدود المسؤولية',
        content: 'إلى أقصى حد يسمح به قانون الولايات المتحدة، لا يتحمل متجر HarirBoutiqueUSA المسؤولية عن أي أضرار مباشرة أو غير مباشرة أو تبعية ناتجة عن استخدام منتجاتنا أو الموقع.'
      }
    },
    {
      id: 'conduct',
      icon: Lock,
      en: {
        title: '6. User Conduct',
        content: 'You agree not to misuse the site, attempt to breach security systems, or use the service for any unlawful purposes.'
      },
      ar: {
        title: '6. سلوك المستخدم',
        content: 'توافق على عدم إساءة استخدام الموقع، أو محاولة اختراق أنظمة الأمان، أو استخدام الخدمة لأي أغراض غير قانونية.'
      }
    },
    {
      id: 'ip',
      icon: ShieldAlert,
      en: {
        title: '7. Intellectual Property',
        content: 'The brand name HarirBoutiqueUSA, all logos, and custom designs are the exclusive property of the store and are protected by copyright laws.'
      },
      ar: {
        title: '7. الملكية الفكرية',
        content: 'اسم العلامة التجارية HarirBoutiqueUSA وجميع الشعارات والتصاميم الخاصة هي ملكية حصرية للمتجر ومحمية بموجب قوانين حقوق النشر.'
      }
    },
    {
      id: 'law',
      icon: Globe,
      en: {
        title: '8. Governing Law',
        content: 'These terms are governed by and construed in accordance with the laws of the United States of America.'
      },
      ar: {
        title: '8. القانون الواجب التطبيق',
        content: 'تخضع هذه الشروط وتفسر وفقاً لقوانين الولايات المتحدة الأمريكية.'
      }
    }
  ];

  return (
    <div className="min-h-screen bg-muted/10 py-12 md:py-20" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="text-center mb-16 space-y-4">
          <h1 className="text-4xl md:text-6xl font-black font-headline text-primary tracking-tight">
            {lang === 'ar' ? 'شروط الاستخدام' : 'Terms of Use'}
          </h1>
          <div className="flex flex-col items-center gap-2">
            <p className="text-muted-foreground font-bold text-lg">
              {lang === 'ar' ? 'آخر تحديث: 22 فبراير 2026' : 'Last updated: February 22, 2026'}
            </p>
            <Separator className="w-24 bg-[#D4AF37] h-1" />
          </div>
        </div>

        <div className="grid gap-10">
          {sections.map((section) => (
            <Card key={section.id} className="rounded-[2.5rem] border-none shadow-xl bg-white overflow-hidden hover:shadow-2xl transition-all duration-300 group">
              <CardHeader className="bg-primary/5 p-8 border-b border-primary/10 group-hover:bg-[#D4AF37]/5 transition-colors">
                <CardTitle className="text-2xl font-bold font-headline flex items-center gap-4 text-primary">
                  <div className="bg-white p-3 rounded-2xl shadow-sm text-[#D4AF37]">
                    <section.icon className="h-6 w-6" />
                  </div>
                  <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 w-full">
                    <span className="text-xl md:text-2xl">{lang === 'ar' ? section.ar.title : section.en.title}</span>
                    <Separator orientation="vertical" className="hidden md:block h-6 bg-primary/20" />
                    <span className="text-base md:text-lg opacity-60 font-medium">{lang === 'ar' ? section.en.title : section.ar.title}</span>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
                  <div className="space-y-3">
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#D4AF37]">English Version</span>
                    <p className="text-muted-foreground leading-relaxed text-lg text-start font-medium">
                      {section.en.content}
                    </p>
                  </div>
                  <div className="space-y-3 md:border-s md:ps-12 border-primary/10">
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#D4AF37]">النسخة العربية</span>
                    <p className="text-muted-foreground leading-relaxed text-lg text-start font-medium" dir="rtl">
                      {section.ar.content}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-20 p-10 bg-primary/5 rounded-[3rem] border-2 border-dashed border-primary/20 text-center">
          <p className="text-primary font-black text-xl mb-2">HarirBoutiqueUSA</p>
          <p className="text-muted-foreground font-medium">
            {lang === 'ar' 
              ? 'نحن نقدر ثقتكم بنا ونسعى دائماً لتقديم أفضل تجربة تسوق فاخرة.' 
              : 'We value your trust and always strive to provide the ultimate luxury shopping experience.'}
          </p>
        </div>
      </div>
    </div>
  );
}
