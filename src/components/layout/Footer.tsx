
'use client';

import Link from 'next/link';
import { CATEGORIES } from '@/lib/data';

export default function Footer() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="container mx-auto px-4 py-12 md:px-6">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-5 text-right">
          <div className="col-span-2 lg:col-span-2">
            <Link href="/" className="text-xl font-bold text-primary">
              YourGroceriesUSA
            </Link>
            <p className="mt-4 text-sm text-muted-foreground max-w-xs">
              وجهتك لمنتجات التجميل والعافية والأساسيات الفاخرة. مختارة بعناية للأناقة والجودة من أمريكا إليك مباشرة.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground">الأقسام</h3>
            <ul className="mt-4 space-y-2">
              {CATEGORIES.slice(0, 3).map(cat => (
                <li key={cat.id}>
                  <Link href={`/category/${cat.slug}`} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground">باقي الأقسام</h3>
            <ul className="mt-4 space-y-2">
              {CATEGORIES.slice(3).map(cat => (
                <li key={cat.id}>
                  <Link href={`/category/${cat.slug}`} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground">الدعم</h3>
            <ul className="mt-4 space-y-2">
              <li><Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">تواصل معنا</Link></li>
              <li><Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">الشحن والتوصيل</Link></li>
              <li><Link href="/admin" className="text-sm text-muted-foreground hover:text-primary transition-colors">الإدارة</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-12 border-t pt-8 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} YourGroceriesUSA. جميع الحقوق محفوظة.
        </div>
      </div>
    </footer>
  );
}
