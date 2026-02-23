
'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from '@/hooks/use-translation';
import { Clock } from 'lucide-react';

interface DiscountCountdownProps {
  endDate: string | any; // Supports ISO string or Firestore Timestamp
}

export default function DiscountCountdown({ endDate }: DiscountCountdownProps) {
  const { t, lang } = useTranslation();
  const [timeLeft, setTimeLeft] = useState<{ h: number; m: number; s: number } | null>(null);

  useEffect(() => {
    if (!endDate) return;

    const targetDate = endDate.toDate ? endDate.toDate().getTime() : new Date(endDate).getTime();

    const calculateTime = () => {
      const now = new Date().getTime();
      const diff = targetDate - now;

      if (diff <= 0) {
        setTimeLeft(null);
        return false;
      }

      const h = Math.floor(diff / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({ h, m, s });
      return true;
    };

    const hasTimeLeft = calculateTime();
    if (!hasTimeLeft) return;

    const timer = setInterval(() => {
      const active = calculateTime();
      if (!active) clearInterval(timer);
    }, 1000);

    return () => clearInterval(timer);
  }, [endDate]);

  if (!timeLeft) return null;

  return (
    <div 
      className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border-2 border-primary/20 animate-in fade-in slide-in-from-top-1 duration-500 shadow-sm"
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
    >
      <Clock className="h-4 w-4 text-[#D4AF37] animate-pulse" />
      <span className="text-[10px] sm:text-xs font-bold text-primary whitespace-nowrap">
        {t.endsIn}:
      </span>
      <div className="flex items-center gap-1 font-mono text-xs sm:text-sm font-black text-[#D4AF37]">
        <span className="bg-white px-1.5 py-0.5 rounded shadow-inner min-w-[2ch] text-center">{timeLeft.h}</span>
        <span className="text-[10px] font-bold text-primary">{t.hours}</span>
        <span className="opacity-50">:</span>
        <span className="bg-white px-1.5 py-0.5 rounded shadow-inner min-w-[2ch] text-center">{timeLeft.m}</span>
        <span className="text-[10px] font-bold text-primary">{t.minutes}</span>
        <span className="opacity-50">:</span>
        <span className="bg-white px-1.5 py-0.5 rounded shadow-inner min-w-[2ch] text-center">{timeLeft.s}</span>
        <span className="text-[10px] font-bold text-primary">{t.seconds}</span>
      </div>
    </div>
  );
}
