'use client';

import Link from 'next/link';
import { useUser } from '@/firebase';

const ADMIN_EMAIL = 'mohammad.dd.my@gmail.com';
const ADMIN_PHONE = '+962780334074';

export default function Footer() {
  const { user, loading } = useUser();
  const isAdmin = !loading && !!user && (user.email === ADMIN_EMAIL || user.phoneNumber === ADMIN_PHONE);

  return (
    <footer className="border-t bg-white">
      <div className="container mx-auto px-4 py-16 md:px-6">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-3 text-right">
          <div className="space-y-4">
            <Link href="/" className="text-2xl font-black text-primary tracking-tighter">
              YourGroceriesUSA
            </Link>
            <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
              وجهتك لمنتجات التجميل والعافية والأساسيات الفاخرة. مختارة بعناية للأناقة والجودة من أمريكا إليك مباشرة.
            </p>
          </div>
          <div className="space-y-4">
            <h3 className="text-sm font-black uppercase tracking-widest text-foreground">معلومات</h3>
            <ul className="space-y-3">
              <li><Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors font-medium">عن المتجر</Link></li>
              <li><Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors font-medium">سياسة الخصوصية</Link></li>
              <li><Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors font-medium">شروط الاستخدام</Link></li>
            </ul>
          </div>
          <div className="space-y-4">
            <h3 className="text-sm font-black uppercase tracking-widest text-foreground">الدعم</h3>
            <ul className="space-y-3">
              <li><Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors font-medium">تواصل معنا</Link></li>
              <li><Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors font-medium">الشحن والتوصيل</Link></li>
              {isAdmin && (
                <li><Link href="/admin" className="text-sm font-black text-primary hover:text-primary/80 transition-colors">لوحة التحكم</Link></li>
              )}
            </ul>
          </div>
        </div>
        <div className="mt-16 border-t border-primary/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} YourGroceriesUSA. جميع الحقوق محفوظة.</p>
          <div className="flex gap-6">
             <Link href="#" className="hover:text-primary">إنستغرام</Link>
             <Link href="#" className="hover:text-primary">فيسبوك</Link>
             <Link href="#" className="hover:text-primary">واتساب</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}