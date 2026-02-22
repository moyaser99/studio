
'use client';

import React from 'react';
import { useTranslation } from '@/hooks/use-translation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  ShieldCheck, 
  Database, 
  Cookie, 
  UserCheck, 
  Lock, 
  Globe, 
  CreditCard, 
  FileText,
  AlertCircle
} from 'lucide-react';

const POLICY_CONTENT = {
  en: {
    title: 'Privacy Policy',
    lastUpdated: 'Last Updated: February 22, 2026',
    intro: 'This Privacy Policy describes how HarirBoutiqueUSA ("we", "us", or "our") collects, uses, and discloses your personal information when you visit or make a purchase from the site.',
    
    sections: [
      {
        id: 'collection',
        title: '1. Information We Collect',
        icon: Database,
        content: 'We collect information directly from you, passively through technology, and from third parties.',
        subsections: [
          { subtitle: 'Direct Collection', text: 'Contact information (name, shipping/billing address, phone, email) and transaction history.' },
          { subtitle: 'Passive Collection', text: 'Using Google Firebase and Analytics, we collect IP addresses, device identifiers, and browsing behavior.' },
          { subtitle: 'Third-Party Data', text: 'Payment details are handled securely via encrypted third-party processors. We do not store full credit card numbers on our servers.' }
        ]
      },
      {
        id: 'usage',
        title: '2. How We Use Your Information',
        icon: Globe,
        content: 'Your data enables us to provide a luxury shopping experience.',
        bullets: [
          'Order Fulfillment: Processing payments and local USA shipping.',
          'Fraud Protection: Monitoring for suspicious activity to secure HarirBoutiqueUSA.',
          'Marketing: Personalized ads and email communications (opt-out available).',
          'Legal Compliance: Adhering to US federal and state regulations.'
        ]
      },
      {
        id: 'advertising',
        title: '3. Interest-Based Advertising',
        icon: Cookie,
        content: 'We use cookies and tracking pixels to show you products you might love on social media and other websites.',
        text: 'You can manage cookie preferences through your browser settings or visit the Network Advertising Initiative (NAI) opt-out page.'
      }
    ],
    
    table: {
      title: 'Categories of Personal Information Collected',
      headers: ['Category', 'Examples', 'Purpose'],
      rows: [
        ['Identifiers', 'Name, Email, IP Address', 'Service delivery & Auth'],
        ['Commercial Info', 'Purchase history, items in cart', 'Order processing'],
        ['Internet Activity', 'Browsing history on site', 'Marketing & Analytics'],
        ['Geolocation', 'State/City based on IP', 'Shipping rate calculation']
      ]
    },

    states: {
      title: '4. US State-Specific Rights',
      california: {
        title: 'California Residents (CCPA/CPRA)',
        content: 'You have the right to request access to the specific pieces of personal information we have collected, the right to delete information, and the right to opt-out of the "sale" or "sharing" of personal information.'
      },
      others: {
        title: 'Colorado, Virginia, and Connecticut',
        content: 'Residents of these states have similar rights to access, correct, and delete their data, as well as the right to data portability.'
      }
    },

    nevada: {
      title: '5. Nevada Residents',
      content: 'Nevada law allows consumers to opt-out of the sale of "covered information" for monetary consideration. HarirBoutiqueUSA does not sell your data for money.'
    },

    contact: {
      title: '6. Contact & Data Requests',
      content: 'To exercise your rights or ask questions, please contact our privacy officer at:',
      email: 'privacy@harirboutiqueusa.com'
    }
  },
  ar: {
    title: 'سياسة الخصوصية',
    lastUpdated: 'آخر تحديث: 22 فبراير 2026',
    intro: 'توضح سياسة الخصوصية هذه كيف يقوم متجر HarirBoutiqueUSA ("نحن") بجمع واستخدام والكشف عن معلوماتك الشخصية عند زيارتك للموقع أو الشراء منه.',
    
    sections: [
      {
        id: 'collection',
        title: '1. المعلومات التي نجمعها',
        icon: Database,
        content: 'نقوم بجمع المعلومات منك مباشرة، وبشكل تلقائي عبر التكنولوجيا، ومن أطراف ثالثة.',
        subsections: [
          { subtitle: 'الجمع المباشر', text: 'معلومات الاتصال (الاسم، عنوان الشحن/الفواتير، الهاتف، البريد) وسجل المعاملات.' },
          { subtitle: 'الجمع التلقائي', text: 'باستخدام Google Firebase والتحليلات، نجمع عناوين IP ومعرفات الأجهزة وسلوك التصفح.' },
          { subtitle: 'بيانات الأطراف الثالثة', text: 'تتم معالجة تفاصيل الدفع عبر بوابات دفع مشفرة. نحن لا نخزن أرقام البطاقات الكاملة لدينا.' }
        ]
      },
      {
        id: 'usage',
        title: '2. كيف نستخدم معلوماتك',
        icon: Globe,
        content: 'بياناتك تمكننا من تقديم تجربة تسوق فاخرة.',
        bullets: [
          'تنفيذ الطلبات: معالجة المدفوعات والشحن المحلي داخل أمريكا.',
          'الحماية من الاحتيال: مراقبة الأنشطة المشبوهة لتأمين HarirBoutiqueUSA.',
          'التسويق: إعلانات مخصصة ورسائل بريد إلكتروني (مع خيار الإلغاء).',
          'الامتثال القانوني: الالتزام باللوائح الفيدرالية ولوائح الولايات.'
        ]
      },
      {
        id: 'advertising',
        title: '3. الإعلانات القائمة على الاهتمامات',
        icon: Cookie,
        content: 'نستخدم ملفات تعريف الارتباط وبكسلات التتبع لعرض المنتجات التي قد تحبها على وسائل التواصل الاجتماعي.',
        text: 'يمكنك إدارة تفضيلات ملفات تعريف الارتباط عبر إعدادات متصفحك أو زيارة صفحة إلغاء الاشتراك في NAI.'
      }
    ],
    
    table: {
      title: 'فئات المعلومات الشخصية التي يتم جمعها',
      headers: ['الفئة', 'أمثلة', 'الغرض'],
      rows: [
        ['المعرفات', 'الاسم، البريد، عنوان IP', 'تقديم الخدمة والمصادقة'],
        ['معلومات تجارية', 'سجل المشتريات، سلة التسوق', 'معالجة الطلبات'],
        ['نشاط الإنترنت', 'سجل التصفح داخل الموقع', 'التسويق والتحليلات'],
        ['الموقع الجغرافي', 'الولاية/المدينة بناءً على IP', 'حساب تكاليف الشحن']
      ]
    },

    states: {
      title: '4. حقوق الولايات الأمريكية المحددة',
      california: {
        title: 'سكان ولاية كاليفورنيا (CCPA)',
        content: 'يحق لك طلب الوصول إلى معلوماتك، وطلب حذفها، وإلغاء الاشتراك في "بيع" أو "مشاركة" معلوماتك الشخصية.'
      },
      others: {
        title: 'كولورادو، فيرجينيا، وكونيتيكت',
        content: 'يتمتع سكان هذه الولايات بحقوق مماثلة للوصول إلى بياناتهم وتصحيحها وحذفها.'
      }
    },

    nevada: {
      title: '5. سكان ولاية نيفادا',
      content: 'يسمح قانون نيفادا للمستهلكين بإلغاء الاشتراك في بيع المعلومات المغطاة. HarirBoutiqueUSA لا تبيع بياناتك مقابل مبالغ مالية.'
    },

    contact: {
      title: '6. التواصل وطلبات البيانات',
      content: 'لممارسة حقوقك أو طرح أسئلة، يرجى التواصل مع مسؤول الخصوصية لدينا:',
      email: 'privacy@harirboutiqueusa.com'
    }
  }
};

export default function PrivacyPolicyPage() {
  const { lang } = useTranslation();
  const content = POLICY_CONTENT[lang as keyof typeof POLICY_CONTENT];

  return (
    <div className="min-h-screen bg-muted/10 py-12 md:py-20" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <div className="container mx-auto px-4 max-w-5xl">
        
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

        <div className="grid gap-10">
          {/* Main Sections */}
          {content.sections.map((section) => (
            <Card key={section.id} className="rounded-[2.5rem] border-none shadow-xl bg-white overflow-hidden hover:shadow-2xl transition-all duration-300">
              <CardHeader className="bg-primary/5 p-8 border-b border-primary/10">
                <CardTitle className="text-2xl font-bold font-headline flex items-center gap-4 text-primary">
                  <div className="bg-white p-3 rounded-2xl shadow-sm text-[#D4AF37]">
                    <section.icon className="h-6 w-6" />
                  </div>
                  <span>{section.title}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                <p className="text-foreground text-lg font-medium text-start">{section.content}</p>
                
                {section.subsections && (
                  <div className="grid md:grid-cols-3 gap-6">
                    {section.subsections.map((sub, i) => (
                      <div key={i} className="p-4 rounded-2xl bg-muted/30 border border-dashed border-primary/10 text-start">
                        <h4 className="font-black text-primary mb-2">{sub.subtitle}</h4>
                        <p className="text-sm text-muted-foreground">{sub.text}</p>
                      </div>
                    ))}
                  </div>
                )}

                {section.bullets && (
                  <ul className="space-y-3">
                    {section.bullets.map((bullet, i) => (
                      <li key={i} className="flex items-start gap-3 text-start">
                        <div className="h-2 w-2 rounded-full bg-[#D4AF37] mt-2.5 flex-shrink-0" />
                        <span className="text-muted-foreground">{bullet}</span>
                      </li>
                    ))}
                  </ul>
                )}

                {section.text && <p className="text-muted-foreground italic text-start">{section.text}</p>}
              </CardContent>
            </Card>
          ))}

          {/* Comparison Table */}
          <Card className="rounded-[2.5rem] border-none shadow-xl bg-white overflow-hidden">
            <CardHeader className="bg-[#D4AF37]/5 p-8 border-b border-[#D4AF37]/10">
              <CardTitle className="text-2xl font-bold font-headline text-start flex items-center gap-3 text-primary">
                <FileText className="h-6 w-6 text-[#D4AF37]" /> {content.table.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    {content.table.headers.map((h, i) => (
                      <TableHead key={i} className={`font-black text-primary text-start p-6 ${i === 0 ? 'ps-8' : ''}`}>{h}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {content.table.rows.map((row, i) => (
                    <TableRow key={i} className="hover:bg-primary/5 transition-colors">
                      <TableCell className="font-bold p-6 ps-8 text-start">{row[0]}</TableCell>
                      <TableCell className="text-muted-foreground p-6 text-start">{row[1]}</TableCell>
                      <TableCell className="text-muted-foreground p-6 text-start">{row[2]}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* State Specific Section */}
          <div className="space-y-8">
            <h2 className="text-3xl font-bold font-headline text-primary flex items-center gap-3 text-start ps-4">
              <UserCheck className="h-8 w-8 text-[#D4AF37]" /> {content.states.title}
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              <Card className="rounded-[2.5rem] border-none shadow-lg bg-white p-8 space-y-4 hover:border-primary/20 border transition-all">
                <h3 className="text-xl font-black text-[#D4AF37] text-start">{content.states.california.title}</h3>
                <p className="text-muted-foreground leading-relaxed text-start">{content.states.california.content}</p>
              </Card>
              <Card className="rounded-[2.5rem] border-none shadow-lg bg-white p-8 space-y-4 hover:border-primary/20 border transition-all">
                <h3 className="text-xl font-black text-[#D4AF37] text-start">{content.states.others.title}</h3>
                <p className="text-muted-foreground leading-relaxed text-start">{content.states.others.content}</p>
              </Card>
            </div>
          </div>

          {/* Nevada & Contact */}
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="rounded-[2.5rem] border-none shadow-lg bg-primary text-white p-8 flex flex-col justify-center">
              <div className="flex items-center gap-3 mb-4">
                <AlertCircle className="h-6 w-6 text-[#D4AF37]" />
                <h3 className="text-xl font-bold">{content.nevada.title}</h3>
              </div>
              <p className="opacity-90 leading-relaxed text-start">{content.nevada.content}</p>
            </Card>

            <Card className="rounded-[2.5rem] border-2 border-dashed border-primary/20 bg-white p-8 space-y-4">
              <h3 className="text-xl font-black text-primary text-start flex items-center gap-2">
                <Lock className="h-5 w-5 text-[#D4AF37]" /> {content.contact.title}
              </h3>
              <p className="text-muted-foreground text-start">{content.contact.content}</p>
              <a href={`mailto:${content.contact.email}`} className="block text-2xl font-black text-[#D4AF37] hover:underline text-start truncate">
                {content.contact.email}
              </a>
            </Card>
          </div>
        </div>

        <div className="mt-20 pt-10 border-t text-center">
          <p className="text-sm text-muted-foreground font-medium italic">
            HarirBoutiqueUSA &copy; 2026. {lang === 'ar' ? 'جميع الحقوق محفوظة' : 'All Rights Reserved.'}
          </p>
        </div>
      </div>
    </div>
  );
}
