
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="container mx-auto px-4 py-12 md:px-6">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-5">
          <div className="col-span-2 lg:col-span-2">
            <Link href="/" className="text-xl font-bold text-primary">
              YourGroceriesUSA
            </Link>
            <p className="mt-4 text-sm text-muted-foreground max-w-xs">
              Your destination for premium beauty, wellness, and lifestyle essentials. Curated for elegance and quality.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider">Shop</h3>
            <ul className="mt-4 space-y-2">
              <li><Link href="/category/makeup" className="text-sm text-muted-foreground hover:text-primary">Makeup</Link></li>
              <li><Link href="/category/skincare" className="text-sm text-muted-foreground hover:text-primary">Skincare</Link></li>
              <li><Link href="/category/haircare" className="text-sm text-muted-foreground hover:text-primary">Haircare</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider">Support</h3>
            <ul className="mt-4 space-y-2">
              <li><Link href="#" className="text-sm text-muted-foreground hover:text-primary">Contact Us</Link></li>
              <li><Link href="#" className="text-sm text-muted-foreground hover:text-primary">Shipping Info</Link></li>
              <li><Link href="#" className="text-sm text-muted-foreground hover:text-primary">Returns</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider">Company</h3>
            <ul className="mt-4 space-y-2">
              <li><Link href="#" className="text-sm text-muted-foreground hover:text-primary">About Us</Link></li>
              <li><Link href="#" className="text-sm text-muted-foreground hover:text-primary">Privacy Policy</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-12 border-t pt-8 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} YourGroceriesUSA. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
