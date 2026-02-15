'use client';

import Link from 'next/link';
import { ShoppingBag, Search, User, Menu, Settings, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CATEGORIES } from '@/lib/data';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useUser, useAuth } from '@/firebase';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

const ADMIN_EMAIL = 'mohammad.dd.my@gmail.com';
const ADMIN_PHONE = '+962780334074';

export default function Header() {
  const { user, loading } = useUser();
  const auth = useAuth();
  const router = useRouter();
  
  const isAdmin = !loading && !!user && (user.email === ADMIN_EMAIL || user.phoneNumber === ADMIN_PHONE);

  useEffect(() => {
    if (!loading) {
      console.log('Admin Detection Status:', isAdmin);
    }
  }, [isAdmin, loading]);

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
        <div className="flex h-20 items-center justify-between">
          <div className="flex items-center gap-4">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary/5">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[350px] bg-white border-l-primary/10">
                <SheetHeader className="pb-6 border-b">
                  <SheetTitle className="text-primary text-right font-headline text-2xl font-black">
                    YourGroceriesUSA
                  </SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col gap-2 mt-8 text-right">
                  <p className="text-xs font-bold text-muted-foreground mb-4 uppercase tracking-widest">تسوق حسب القسم</p>
                  {CATEGORIES.map((cat) => (
                    <Link
                      key={cat.id}
                      href={`/category/${cat.slug}`}
                      className="text-lg font-bold hover:text-primary py-3 px-4 rounded-2xl hover:bg-primary/5 transition-all flex items-center justify-between group"
                    >
                      <span>{cat.name}</span>
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity">←</span>
                    </Link>
                  ))}
                  
                  {isAdmin && (
                    <div className="mt-8 pt-8 border-t">
                      <p className="text-xs font-bold text-primary mb-4 uppercase tracking-widest">الإدارة</p>
                      <Link href="/admin" className="text-lg font-black text-primary py-3 px-4 rounded-2xl bg-primary/5 flex items-center gap-2 justify-end">
                        لوحة التحكم <Settings className="h-5 w-5" />
                      </Link>
                    </div>
                  )}
                  
                  {user && (
                    <div className="mt-auto pt-8">
                      <Button variant="outline" onClick={handleLogout} className="w-full rounded-full border-primary text-primary h-12 font-bold">
                        تسجيل الخروج
                      </Button>
                    </div>
                  )}
                </nav>
              </SheetContent>
            </Sheet>

            <Link href="/" className="flex items-center">
              <span className="font-headline text-2xl font-black tracking-tighter text-primary">
                YourGroceriesUSA
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="hidden sm:flex rounded-full hover:bg-primary/5">
              <Search className="h-5 w-5" />
            </Button>
            
            {isAdmin && (
              <Link href="/admin" className="hidden sm:block">
                <Button variant="ghost" size="icon" className="rounded-full text-primary hover:bg-primary/10">
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

            <Button variant="ghost" size="icon" className="relative rounded-full hover:bg-primary/5">
              <ShoppingBag className="h-5 w-5" />
              <span className="absolute top-1 right-1 h-2 w-2 bg-primary rounded-full border border-white"></span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}