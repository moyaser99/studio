'use client';

import Link from 'next/link';
import { ShoppingBag, Search, User, Menu, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CATEGORIES } from '@/lib/data';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useUser, useAuth } from '@/firebase';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';

export default function Header() {
  const { user, loading } = useUser();
  const auth = useAuth();
  const router = useRouter();
  
  // Strict admin check: Only true if loading is finished AND email matches
  const isAdmin = !loading && user?.email === 'mohammad.dd.my@gmail.com';

  const handleLogout = async () => {
    if (!auth) return;
    try {
      await signOut(auth);
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-6 lg:gap-10">
            <Link href="/" className="flex items-center space-x-2">
              <span className="font-headline text-2xl font-bold tracking-tight text-primary">
                YourGroceriesUSA
              </span>
            </Link>
            <nav className="hidden lg:flex gap-6">
              {CATEGORIES.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/category/${cat.slug}`}
                  className="text-sm font-medium transition-colors hover:text-primary"
                >
                  {cat.name}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="hidden sm:flex rounded-full">
              <Search className="h-5 w-5" />
            </Button>
            
            {/* Admin-only settings icon: Completely removed from DOM if not admin */}
            {isAdmin && (
              <Link href="/admin">
                <Button variant="ghost" size="icon" className="rounded-full text-primary hover:bg-primary/10 transition-colors">
                  <Settings className="h-5 w-5" />
                </Button>
              </Link>
            )}

            {user ? (
              <div className="flex items-center gap-2">
                <Button variant="ghost" onClick={handleLogout} className="text-sm rounded-full bg-muted hover:bg-muted/80">خروج</Button>
                <Link href="/profile-completion">
                   <Button variant="ghost" size="icon" className="rounded-full">
                    <User className="h-5 w-5" />
                  </Button>
                </Link>
              </div>
            ) : (
              <Link href="/login">
                <Button variant="ghost" size="icon" className="rounded-full">
                  <User className="h-5 w-5" />
                </Button>
              </Link>
            )}

            <Button variant="ghost" size="icon" className="rounded-full">
              <ShoppingBag className="h-5 w-5" />
            </Button>
            
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden rounded-full">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <SheetHeader>
                  <SheetTitle className="text-primary text-right">YourGroceriesUSA</SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col gap-4 mt-8 text-right">
                  {CATEGORIES.map((cat) => (
                    <Link
                      key={cat.id}
                      href={`/category/${cat.slug}`}
                      className="text-lg font-medium hover:text-primary py-2 border-b border-muted transition-colors"
                    >
                      {cat.name}
                    </Link>
                  ))}
                  {/* Admin-only link in mobile menu */}
                  {isAdmin && (
                    <Link href="/admin" className="text-lg font-bold text-primary py-2 border-b border-muted">
                      لوحة التحكم
                    </Link>
                  )}
                  {user && (
                    <Button variant="outline" onClick={handleLogout} className="w-full rounded-full mt-4">
                      تسجيل الخروج
                    </Button>
                  )}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
