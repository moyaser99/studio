
'use client';

import Link from 'next/link';
import { ShoppingBag, Search, User, Menu, Settings, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CATEGORIES } from '@/lib/data';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useUser, useAuth } from '@/firebase';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';

const ADMIN_EMAIL = 'mohammad.dd.my@gmail.com';
const ADMIN_PHONE = '+962780334074';

export default function Header() {
  const { user, loading } = useUser();
  const auth = useAuth();
  const router = useRouter();
  
  // Strict Dual-Factor Admin Shield (Email AND Phone)
  const isAdmin = !loading && !!user && 
    (user.email === ADMIN_EMAIL && user.phoneNumber === ADMIN_PHONE);

  const handleLogout = async () => {
    if (!auth) return;
    try {
      await signOut(auth);
      router.replace('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/80">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-6 lg:gap-10">
            <Link href="/" className="flex items-center">
              <span className="font-headline text-2xl font-black tracking-tighter text-primary">
                YourGroceriesUSA
              </span>
            </Link>
            <nav className="hidden lg:flex gap-8">
              {CATEGORIES.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/category/${cat.slug}`}
                  className="text-sm font-bold transition-colors hover:text-primary relative group"
                >
                  {cat.name}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full"></span>
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="hidden sm:flex rounded-full hover:bg-primary/5">
              <Search className="h-5 w-5" />
            </Button>
            
            {/* Strict Admin DOM Cleanup */}
            {!loading && isAdmin && (
              <Link href="/admin">
                <Button variant="ghost" size="icon" className="rounded-full text-primary hover:bg-primary/10 transition-colors">
                  <Settings className="h-5 w-5" />
                </Button>
              </Link>
            )}

            {loading ? (
              <div className="w-10 h-10 flex items-center justify-center">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              </div>
            ) : user ? (
              <div className="flex items-center gap-2">
                <Button variant="ghost" onClick={handleLogout} className="text-xs font-bold rounded-full bg-muted/50 hover:bg-muted h-8 px-4">خروج</Button>
                <Link href="/profile-completion">
                   <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary/5">
                    <User className="h-5 w-5" />
                  </Button>
                </Link>
              </div>
            ) : (
              <Link href="/login">
                <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary/5">
                  <User className="h-5 w-5" />
                </Button>
              </Link>
            )}

            <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary/5">
              <ShoppingBag className="h-5 w-5" />
            </Button>
            
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden rounded-full hover:bg-primary/5">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <SheetHeader>
                  <SheetTitle className="text-primary text-right font-black text-2xl">YourGroceriesUSA</SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col gap-2 mt-10 text-right">
                  {CATEGORIES.map((cat) => (
                    <Link
                      key={cat.id}
                      href={`/category/${cat.slug}`}
                      className="text-lg font-bold hover:text-primary py-3 px-4 rounded-2xl hover:bg-primary/5 transition-all"
                    >
                      {cat.name}
                    </Link>
                  ))}
                  {/* Mobile Admin Link Cleanup */}
                  {!loading && isAdmin && (
                    <Link href="/admin" className="text-lg font-black text-primary py-3 px-4 rounded-2xl bg-primary/5 mt-4">
                      لوحة التحكم
                    </Link>
                  )}
                  {user && (
                    <Button variant="outline" onClick={handleLogout} className="w-full rounded-full mt-8 border-primary text-primary h-12">
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
