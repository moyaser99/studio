'use client';

import React from 'react';
import { useTranslation } from '@/hooks/use-translation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  FileText, 
  Gavel, 
  ShieldCheck, 
  ShoppingCart, 
  AlertCircle, 
  Scale, 
  Globe,
  Lock,
  History
} from 'lucide-react';

const TERMS_CONTENT = {
  en: {
    title: 'Terms of Use',
    lastUpdated: 'Last Updated: February 22, 2026',
    intro: 'Welcome to HarirBoutiqueUSA. By accessing or using our website, you agree to be bound by these terms. If you do not agree to all terms, please do not use our services.',
    sections: [
      {
        id: 'overview',
        icon: History,
        title: '1. Overview & Acceptance',
        content: 'These Terms of Use govern your use of the HarirBoutiqueUSA website and all products purchased through the site. Your use of the site constitutes a binding legal agreement between you and HarirBoutiqueUSA.'
      },
      {
        id: 'arbitration',
        icon: Gavel,
        title: '2. ARBITRATION NOTICE (CRITICAL)',
        content: 'PLEASE READ CAREFULLY: You agree that all disputes between you and HarirBoutiqueUSA will be resolved by BINDING, INDIVIDUAL ARBITRATION. You waive your right to participate in a class action lawsuit or class-wide arbitration.',
        highlight: true
      },
      {
        id: 'ip',
        icon: ShieldCheck,
        title: '3. Intellectual Property',
        content: 'All materials on this site, including but not limited to photographs, logos, product descriptions, and graphics, are the exclusive property of HarirBoutiqueUSA and are protected by US and international copyright laws.'
      },
      {
        id: 'orders',
        icon: ShoppingCart,
        title: '4. Orders & Pricing',
        content: 'We reserve the right to refuse or cancel any order. We may, in our sole discretion, limit or cancel quantities purchased per person. In the event of a typographical error or technical glitch regarding pricing, we reserve the right to cancel orders even after confirmation.'
      },
      {
        id: 'liability',
        icon: AlertCircle,
        title: '5. Limitation of Liability',
        content: 'To the maximum extent permitted by law, HarirBoutiqueUSA’s total liability for any claim arising out of your use of the site or products shall not exceed $100.00 or the amount paid for the specific order, whichever is less.'
      },
      {
        id: 'governing-law',
        icon: Scale,
        title: '6. Governing Law',
        content: 'These terms are governed by the laws of the United States and the State of Michigan, without regard to conflict of law principles. Any legal action shall be brought exclusively in the courts of Michigan.'
      }
    ]
  },
  ar: {
    title: 'شروط الاستخدام',
    lastUpdated: 'آخر تحديث: 22 فبراير 2026',
    intro: 'أهلاً بك في HarirBoutiqueUSA. باستخدامك لموقعنا، فإنك توافق على الالتزام بهذه الشروط. إذا كنت لا توافق على كافة الشروط، يرجى عدم استخدام خدماتنا.',
    sections: [
      {
        id: 'overview',
        icon: History,
        title: '1. نظرة عامة والموافقة',
        content: 'تحكم شروط الاستخدام هذه استخدامك لموقع HarirBoutiqueUSA وجميع المنتجات التي يتم شراؤها عبر الموقع. إن استخدامك للموقع يشكل اتفاقية قانونية ملزمة بينك وبين HarirBoutiqueUSA.'
      },
      {
        id: 'arbitration',
        icon: Gavel,
        title: '2. إشعار التحكيم (هام جداً)',
        content: 'يرجى القراءة بعناية: أنت توافق على أن جميع النزاعات بينك وبين HarirBoutiqueUSA سيتم حلها عن طريق التحكيم الفردي الملزم. أنت تتنازل عن حقك في المشاركة في دعاوى جماعية أو تحكيم جماعي.',
        highlight: true
      },
      {
        id: 'ip',
        icon: ShieldCheck,
        title: '3. الملكية الفكرية',
        content: 'جميع المواد الموجودة على هذا الموقع، بما في ذلك على سبيل المثال لا الحصر الصور والشعارات وأوصاف المنتجات والرسومات، هي ملكية حصرية لـ HarirBoutiqueUSA ومحمية بموجب قوانين حقوق النشر الأمريكية والدولية.'
      },
      {
        id: 'orders',
        icon: ShoppingCart,
        title: '4. الطلبات والتسعير',
        content: 'نحتفظ بالحق في رفض أو إلغاء أي طلب. قد نقوم، وفقاً لتقديرنا الخاص، بتحديد أو إلغاء الكميات المشتراة للشخص الواحد. في حالة وجود خطأ مطبعي أو عطل تقني يتعلق بالتسعير، نحتفظ بالحق في إلغاء الطلبات حتى بعد التأكيد.'
      },
      {
        id: 'liability',
        icon: AlertCircle,
        title: '5. حدود المسؤولية',
        content: 'إلى أقصى حد يسمح به القانون، لا تتجاوز المسؤولية الإجمالية لـ HarirBoutiqueUSA عن أي مطالبة ناشئة عن استخدامك للموقع أو المنتجات مبلغ 100.00 دولار أمريكي أو المبلغ المدفوع للطلب المحدد، أيهما أقل.'
      },
      {
        id: 'governing-law',
        icon: Scale,
        title: '6. القانون الحاكم',
        content: 'تخضع هذه الشروط لقوانين الولايات المتحدة الأمريكية وولاية ميشيغان (Michigan). يتم رفع أي إجراء قانوني حصرياً في محاكم ولاية ميشيغان.'
      }
    ]
  }
};

export default function TermsOfUsePage() {
  const { lang } = useTranslation();
  const content = TERMS_CONTENT[lang as keyof typeof TERMS_CONTENT] || TERMS_CONTENT.en;

  return (
    <div className="min-h-screen bg-muted/10 py-12 md:py-20" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <div className="container mx-auto px-4 max-w-4xl">
        
        {/* Header Section */}
        <div className="text-start mb-12 space-y-4">
          <h1 className="text-4xl md:text-6xl font-black font-headline text-primary tracking-tight">
            {content.title}
          </h1>
          <div className="flex flex-col items-start gap-2">
            <p className="text-[#D4AF37] font-bold text-lg">{content.lastUpdated}</p>
            <Separator className="w-24 bg-[#D4AF37] h-1" />
          </div>
          <p className="text-muted-foreground text-lg leading-relaxed max-w-3xl">
            {content.intro}
          </p>
        </div>

        {/* Main Sections */}
        <div className="grid gap-8">
          {content.sections.map((section) => (
            <Card 
              key={section.id} 
              className={`rounded-[2rem] border-none shadow-xl bg-white overflow-hidden transition-all duration-300 hover:shadow-2xl group ${section.highlight ? 'ring-2 ring-primary/20' : ''}`}
            >
              <CardHeader className={`p-6 border-b border-primary/10 transition-colors ${section.highlight ? 'bg-primary/5' : 'bg-muted/30 group-hover:bg-[#D4AF37]/5'}`}>
                <CardTitle className="text-xl md:text-2xl font-bold font-headline flex items-center gap-4 text-primary">
                  <div className="bg-white p-2.5 rounded-xl shadow-sm text-[#D4AF37] group-hover:scale-110 transition-transform">
                    <section.icon className="h-6 w-6" />
                  </div>
                  <span>{section.title}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <p className={`leading-relaxed text-lg text-start font-medium ${section.highlight ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {section.content}
                </p>
                {section.highlight && (
                  <div className="mt-4 p-4 rounded-xl bg-destructive/5 border border-destructive/10 flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                    <p className="text-sm text-destructive font-bold text-start">
                      {lang === 'ar' ? 'هذا البند يؤثر على حقوقك القانونية في رفع القضايا.' : 'This section affects your legal rights to file a lawsuit.'}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Footer Support Notice */}
        <div className="mt-20 p-10 bg-primary/5 rounded-[3rem] border-2 border-dashed border-primary/20 text-center">
          <p className="text-primary font-black text-xl mb-2">HarirBoutiqueUSA Legal Department</p>
          <p className="text-muted-foreground font-medium">
            {lang === 'ar' 
              ? 'باستخدامك لخدماتنا، فإنك تساهم في الحفاظ على بيئة تسوق آمنة وفاخرة.' 
              : 'By using our services, you help maintain a safe and premium shopping environment.'}
          </p>
          <div className="mt-6 flex justify-center gap-4">
            <Lock className="h-5 w-5 text-[#D4AF37]" />
            <Globe className="h-5 w-5 text-[#D4AF37]" />
            <ShieldCheck className="h-5 w-5 text-[#D4AF37]" />
          </div>
        </div>

        <div className="mt-12 text-center">
          <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">
            © 2026 HarirBoutiqueUSA. {lang === 'ar' ? 'جميع الحقوق محفوظة' : 'All Rights Reserved.'}
          </p>
        </div>
      </div>
    </div>
  );
}
