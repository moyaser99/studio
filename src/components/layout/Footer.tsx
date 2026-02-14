import Link from 'next/link';

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
              وجهتك لمنتجات التجميل والعافية والأساسيات الفاخرة. مختارة بعناية للأناقة والجودة.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider">تسوق</h3>
            <ul className="mt-4 space-y-2">
              <li><Link href="/category/makeup" className="text-sm text-muted-foreground hover:text-primary">المكياج</Link></li>
              <li><Link href="/category/skincare" className="text-sm text-muted-foreground hover:text-primary">العناية بالبشرة</Link></li>
              <li><Link href="/category/haircare" className="text-sm text-muted-foreground hover:text-primary">العناية بالشعر</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider">الدعم</h3>
            <ul className="mt-4 space-y-2">
              <li><Link href="#" className="text-sm text-muted-foreground hover:text-primary">اتصل بنا</Link></li>
              <li><Link href="#" className="text-sm text-muted-foreground hover:text-primary">معلومات الشحن</Link></li>
              <li><Link href="#" className="text-sm text-muted-foreground hover:text-primary">المرتجعات</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider">الشركة</h3>
            <ul className="mt-4 space-y-2">
              <li><Link href="#" className="text-sm text-muted-foreground hover:text-primary">من نحن</Link></li>
              <li><Link href="#" className="text-sm text-muted-foreground hover:text-primary">سياسة الخصوصية</Link></li>
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
