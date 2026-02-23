
'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from '@/hooks/use-translation';
import { Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DiscountCountdownProps {
  endDate: string | any; // Supports ISO string or Firestore Timestamp
  className?: string;
  isFloating?: boolean;
}

export default function DiscountCountdown({ endDate, className, isFloating = false }: DiscountCountdownProps) {
  const { t, lang } = useTranslation();
  const [timeLeft, setTimeLeft] = useState<{ h: number; m: number; s: number } | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!endDate || !mounted) return;

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
      if (!active) {
        clearInterval(timer);
        // Force a page refresh or state update to revert price could be handled here or by the consumer
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [endDate, mounted]);

  if (!mounted || !timeLeft) return null;

  const formatNum = (num: number) => num.toString().padStart(2, '0');

  return (
    <div 
      className={cn(
        "flex items-center gap-2 px-3 py-1.5 rounded-full border shadow-lg backdrop-blur-md transition-all duration-500 animate-in fade-in zoom-in-95",
        isFloating 
          ? "bg-primary/20 border-[#D4AF37]/30 text-[#D4AF37]" 
          : "bg-primary/10 border-primary/20 text-primary",
        className
      )}
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
    >
      <Clock className={cn("h-3.5 w-3.5 animate-pulse", isFloating ? "text-[#D4AF37]" : "text-[#D4AF37]")} />
      <span className="text-[10px] font-bold uppercase tracking-wider whitespace-nowrap">
        {t.endsIn}:
      </span>
      <div className="flex items-center gap-1 font-mono text-sm font-black tracking-tighter">
        <span className="min-w-[2ch] text-center">{formatNum(timeLeft.h)}</span>
        <span className="opacity-50 text-[10px]">:</span>
        <span className="min-w-[2ch] text-center">{formatNum(timeLeft.m)}</span>
        <span className="opacity-50 text-[10px]">:</span>
        <span className="min-w-[2ch] text-center">{formatNum(timeLeft.s)}</span>
      </div>
    </div>
  );
}
