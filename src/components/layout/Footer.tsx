
'use client';

import Link from 'next/link';
import { CATEGORIES } from '@/lib/data';
import { useUser } from '@/firebase';

const ADMIN_EMAIL = 'mohammad.dd.my@gmail.com';
const ADMIN_PHONE = '+962780334074';

export default function Footer() {
  const { user, loading } = useUser();
  // Strict Admin Shield
  const isAdmin = !loading && !!user && 
    (user.email === ADMIN_EMAIL && user.phoneNumber === ADMIN_PHONE);

  return (
    <footer className="border-t bg-muted/20">
      <div className="container mx-auto px-4 py-16 md:px-6">
        <div className="grid grid-cols-2 gap-12 md:grid-cols-4 lg:grid-cols-5 text-right">
          <div className="col-span-2 lg:col-span-2 space-y-4">
            <Link href="/" className="text-2xl font-black text-primary tracking-tighter">
              YourGroceriesUSA
            </Link>
            <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
              وجهتك لمنتجات التجميل والعافية والأساسيات الفاخرة. مختارة بعناية للأناقة والجودة من أمريكا إليك مباشرة.
            </p>
          </div>
          <div className="space-y-4">
            <h3 className="text-sm font-black uppercase tracking-widest text-foreground">الأقسام</h3>
            <ul className="space-y-3">
              {CATEGORIES.slice(0, 3).map(cat => (
                <li key={cat.id}>
                  <Link href={`/category/${cat.slug}`} className="text-sm text-muted-foreground hover:text-primary transition-colors font-medium">
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="space-y-4">
            <h3 className="text-sm font-black uppercase tracking-widest text-foreground">باقي الأقسام</h3>
            <ul className="space-y-3">
              {CATEGORIES.slice(3, 6).map(cat => (
                <li key={cat.id}>
                  <Link href={`/category/${cat.slug}`} className="text-sm text-muted-foreground hover:text-primary transition-colors font-medium">
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="space-y-4">
            <h3 className="text-sm font-black uppercase tracking-widest text-foreground">الدعم</h3>
            <ul className="space-y-3">
              <li><Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors font-medium">تواصل معنا</Link></li>
              <li><Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors font-medium">الشحن والتوصيل</Link></li>
              {/* Admin Shield in Footer */}
              {!loading && isAdmin && (
                <li><Link href="/admin" className="text-sm font-black text-primary hover:text-primary/80 transition-colors">لوحة التحكم</Link></li>
              )}
            </ul>
          </div>
        </div>
        <div className="mt-16 border-t border-primary/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} YourGroceriesUSA. جميع الحقوق محفوظة.</p>
          <div className="flex gap-6">
             <Link href="#" className="hover:text-primary">سياسة الخصوصية</Link>
             <Link href="#" className="hover:text-primary">شروط الاستخدام</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
