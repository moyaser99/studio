
'use client';

import React from 'react';
import { useTranslation } from '@/hooks/use-translation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  Truck, 
  RefreshCcw, 
  Clock, 
  ShieldCheck, 
  PackageCheck, 
  DollarSign,
  AlertCircle,
  Percent
} from 'lucide-react';

export default function ShippingReturnsPage() {
  const { t, lang } = useTranslation();

  const sections = [
    {
      id: 'shipping',
      title: t.shippingPolicyTitle,
      icon: Truck,
      items: [
        { label: lang === 'ar' ? 'الرسوم' : 'Rates', content: t.shippingRatesContent, icon: DollarSign },
        { label: lang === 'ar' ? 'التجهيز' : 'Processing', content: t.processingContent, icon: Clock },
        { label: lang === 'ar' ? 'الناقلون' : 'Carriers', content: t.carriersContent, icon: ShieldCheck }
      ]
    },
    {
      id: 'returns',
      title: t.returnsPolicyTitle,
      icon: RefreshCcw,
      items: [
        { label: lang === 'ar' ? 'المدة' : 'Window', content: t.returnWindowContent, icon: Clock },
        { label: lang === 'ar' ? 'الحالة' : 'Condition', content: t.returnConditionContent, icon: PackageCheck },
        { label: lang === 'ar' ? 'رسوم الإعادة' : 'Restocking Fee', content: t.restockingFeeContent, icon: Percent },
        { label: lang === 'ar' ? 'التكاليف' : 'Costs', content: t.returnCostsContent, icon: AlertCircle }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-muted/10 py-12 md:py-20" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-start mb-12 space-y-4">
          <h1 className="text-4xl md:text-6xl font-black font-headline text-primary tracking-tight">
            {t.shippingReturns}
          </h1>
          <div className="flex flex-col items-start gap-2">
            <p className="text-muted-foreground font-bold text-lg">
              {t.lastUpdatedShipping}
            </p>
            <Separator className="w-24 bg-[#D4AF37] h-1" />
          </div>
        </div>

        <div className="grid gap-12">
          {sections.map((section) => (
            <div key={section.id} className="space-y-6">
              <h2 className="text-3xl font-bold font-headline text-primary flex items-center gap-3 text-start">
                <section.icon className="h-8 w-8 text-[#D4AF37]" /> {section.title}
              </h2>
              
              <div className="grid gap-6">
                {section.items.map((item, idx) => (
                  <Card key={idx} className="rounded-[2rem] border-none shadow-lg bg-white overflow-hidden hover:shadow-xl transition-all duration-300 group">
                    <CardHeader className="bg-primary/5 p-6 border-b border-primary/10 group-hover:bg-[#D4AF37]/5 transition-colors">
                      <CardTitle className="text-xl font-bold flex items-center gap-4 text-primary">
                        <div className="bg-white p-2 rounded-xl shadow-sm text-[#D4AF37]">
                          <item.icon className="h-5 w-5" />
                        </div>
                        <span>{item.label}</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      <p className="text-muted-foreground leading-relaxed text-lg text-start font-medium">
                        {item.content}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-20 p-10 bg-primary/5 rounded-[3rem] border-2 border-dashed border-primary/20 text-center">
          <p className="text-primary font-black text-xl mb-2">HarirBoutiqueUSA Support</p>
          <p className="text-muted-foreground font-medium">
            {lang === 'ar' 
              ? 'إذا كان لديك أي استفسار إضافي حول طلبك، يرجى التواصل معنا مباشرة.' 
              : 'If you have any further questions about your order, please contact us directly.'}
          </p>
        </div>
      </div>
    </div>
  );
}
