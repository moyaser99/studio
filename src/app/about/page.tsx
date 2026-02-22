
'use client';

import React from 'react';
import { useTranslation } from '@/hooks/use-translation';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Sparkles, Target, Star, ShieldCheck, Clock } from 'lucide-react';
import Image from 'next/image';

export default function AboutPage() {
  const { t, lang } = useTranslation();

  return (
    <div className="min-h-screen bg-muted/10 pb-20" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      {/* Hero Section */}
      <section className="relative h-[400px] md:h-[600px] overflow-hidden">
        <Image 
          src="https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=1080&auto=format&fit=crop"
          alt="Luxury Makeup Collection"
          fill
          className="object-cover"
          priority
          data-ai-hint="luxury makeup"
        />
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
        <div className="absolute inset-0 flex items-center justify-center text-center p-4">
          <div className="max-w-3xl space-y-6">
            <h1 className="text-4xl md:text-7xl font-black font-headline text-white drop-shadow-lg">
              HarirBoutiqueUSA
            </h1>
            <div className="flex items-center justify-center gap-4">
              <Separator className="w-12 bg-[#D4AF37] h-1" />
              <p className="text-xl md:text-2xl font-bold text-[#F8C8DC] tracking-widest uppercase">
                {t.ourStory}
              </p>
              <Separator className="w-12 bg-[#D4AF37] h-1" />
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 -mt-20 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Main Narrative */}
          <div className="lg:col-span-8 space-y-8">
            <Card className="rounded-[3rem] border-none shadow-2xl bg-white overflow-hidden">
              <CardContent className="p-8 md:p-12 space-y-8">
                <div className="space-y-4">
                  <h2 className="text-3xl md:text-4xl font-black font-headline text-primary flex items-center gap-3 text-start">
                    <Sparkles className="h-8 w-8 text-[#D4AF37]" /> {t.ourStory}
                  </h2>
                  <p className="text-lg md:text-xl text-muted-foreground leading-relaxed text-start font-medium">
                    {t.narrativeText}
                  </p>
                </div>

                <Separator className="opacity-20" />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h3 className="text-2xl font-bold text-primary flex items-center gap-2 text-start">
                      <Target className="h-6 w-6 text-[#D4AF37]" /> {t.ourMission}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed text-start">
                      {t.missionText}
                    </p>
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-2xl font-bold text-primary flex items-center gap-2 text-start">
                      <Star className="h-6 w-6 text-[#D4AF37]" /> {t.whyUs}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed text-start">
                      {t.whyUsText}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Values Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { icon: ShieldCheck, title: lang === 'ar' ? 'أصالة مضمونة' : 'Authenticity', desc: lang === 'ar' ? 'نضمن أن كل قطعة في متجرنا أصلية 100%.' : 'We guarantee 100% authenticity for every piece.' },
                { icon: Clock, title: lang === 'ar' ? 'شحن محلي سريع' : 'Local Shipping', desc: lang === 'ar' ? 'توصيل سريع وموثوق داخل الولايات المتحدة.' : 'Fast and reliable delivery within the USA.' },
                { icon: Star, title: lang === 'ar' ? 'خدمة متميزة' : 'Premium Service', desc: lang === 'ar' ? 'دعم فني مخصص لضمان رضاكم التام.' : 'Dedicated support to ensure your complete satisfaction.' }
              ].map((value, idx) => (
                <Card key={idx} className="rounded-[2rem] border-none shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all group">
                  <CardContent className="p-6 text-center space-y-3">
                    <div className="mx-auto w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center text-[#D4AF37] group-hover:scale-110 transition-transform">
                      <value.icon className="h-6 w-6" />
                    </div>
                    <h4 className="font-bold text-primary">{value.title}</h4>
                    <p className="text-xs text-muted-foreground">{value.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Sidebar Image/Info */}
          <div className="lg:col-span-4 space-y-8">
            <div className="relative aspect-[3/4] rounded-[3rem] overflow-hidden shadow-2xl border-4 border-white bg-white">
              <Image 
                src="https://images.unsplash.com/photo-1621274220348-2043609906d0?q=80&w=1080&auto=format&fit=crop"
                alt="Traditional Palestinian Thobe"
                fill
                className="object-cover"
                data-ai-hint="palestinian embroidery"
              />
            </div>
            
            <Card className="rounded-[2.5rem] border-none shadow-xl bg-primary text-white overflow-hidden">
              <CardContent className="p-8 text-center space-y-4">
                <h3 className="text-xl font-bold tracking-tight">HarirBoutiqueUSA</h3>
                <p className="text-sm opacity-90 leading-relaxed">
                  {lang === 'ar' 
                    ? 'انضم إلى آلاف العملاء الذين اختاروا الفخامة مع خدمة محلية استثنائية.' 
                    : 'Join thousands of customers who chose luxury with exceptional local service.'}
                </p>
              </CardContent>
            </Card>
          </div>

        </div>
      </div>
    </div>
  );
}
