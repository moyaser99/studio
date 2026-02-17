'use client';

import { useState, useEffect } from 'react';

const translations = {
  ar: {
    home: 'الرئيسية',
    categories: 'الأقسام',
    cart: 'السلة',
    search: 'بحث',
    admin: 'لوحة التحكم',
    login: 'تسجيل الدخول',
    logout: 'تسجيل الخروج',
    shopByCategory: 'تسوق حسب القسم',
    administration: 'الإدارة',
    sessionWarning: 'الجلسة غير مكتشفة - يرجى الفتح في نافذة جديدة',
    adminIndicator: 'المشرف',
    langToggle: 'EN'
  },
  en: {
    home: 'Home',
    categories: 'Categories',
    cart: 'Cart',
    search: 'Search',
    admin: 'Dashboard',
    login: 'Login',
    logout: 'Logout',
    shopByCategory: 'Shop by Category',
    administration: 'Administration',
    sessionWarning: 'Session not detected - please open in a new tab',
    adminIndicator: 'Admin',
    langToggle: 'العربية'
  }
};

export function useTranslation() {
  const [lang, setLang] = useState<'ar' | 'en'>('ar');

  useEffect(() => {
    const savedLang = localStorage.getItem('app-lang') as 'ar' | 'en';
    if (savedLang) {
      setLang(savedLang);
      document.documentElement.dir = savedLang === 'ar' ? 'rtl' : 'ltr';
      document.documentElement.lang = savedLang;
    } else {
      document.documentElement.dir = 'rtl';
      document.documentElement.lang = 'ar';
    }
  }, []);

  const toggleLang = () => {
    const newLang = lang === 'ar' ? 'en' : 'ar';
    setLang(newLang);
    localStorage.setItem('app-lang', newLang);
    document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = newLang;
  };

  return { t: translations[lang], lang, toggleLang };
}
