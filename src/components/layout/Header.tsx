'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ShoppingBag, Search, User, Menu, Settings, Loader2, LogOut, LogIn } from 'lucide-react';
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
  const [open, setOpen] = useState(false);
  
  const isAdmin = user?.email === ADMIN_EMAIL || user?.phoneNumber === ADMIN_PHONE;
  
  // Log for verification as requested
  console.log('Admin Detection Status:', isAdmin);

  const handleLogout = async () => {
    if (!auth) return;
    try {
      await signOut(auth);
      setOpen(false);
      router.push('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const navigateTo = (path: string) => {
    if (path === '/admin') {
      console.log('Navigating to Admin...');
    }
    setOpen(false);
    router.push(path);
  };

  return (
    <header className="sticky top-0 z-[100] w-full border-b bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/80">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex h-20 items-center justify-between">
          <div className="flex items-center gap-4">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary/5">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[350px] bg-white border-l-primary/10 flex flex-col z-[110]">
                <SheetHeader className="pb-6 border-b">
                  <SheetTitle className="text-primary text-right font-headline text-2xl font-black">
                    YourGroceriesUSA
                  </SheetTitle>
                </SheetHeader>
                
                <nav className="flex flex-col gap-2 mt-8 text-right flex-1">
                  <p className="text-xs font-bold text-muted-foreground mb-4 uppercase tracking-widest">تسوق حسب القسم</p>
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => navigateTo(`/category/${cat.slug}`)}
                      className="text-lg font-bold hover:text-primary py-3 px-4 rounded-2xl hover:bg-primary/5 transition-all flex items-center justify-between group text-right"
                    >
                      <span>{cat.name}</span>
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity">←</span>
                    </button>
                  ))}
                  
                  {isAdmin && (
                    <div className="mt-8 pt-8 border-t">
                      <p className="text-xs font-bold text-primary mb-4 uppercase tracking-widest">الإدارة</p>
                      <button 
                        onClick={() => {
                          console.log('Navigating to Admin from Sidebar...');
                          navigateTo('/admin');
                        }}
                        className="w-full text-lg font-black text-primary py-3 px-4 rounded-2xl bg-primary/5 flex items-center gap-2 justify-end hover:bg-primary/10 transition-colors"
                      >
                        لوحة التحكم <Settings className="h-5 w-5" />
                      </button>
                    </div>
                  )}
                </nav>

                <div className="mt-auto pt-6 border-t space-y-3">
                  {user ? (
                    <Button 
                      variant="outline" 
                      onClick={handleLogout} 
                      className="w-full rounded-full border-primary text-primary hover:bg-primary hover:text-white h-12 font-bold gap-2"
                    >
                      <LogOut className="h-4 w-4" /> تسجيل الخروج
                    </Button>
                  ) : (
                    <Button 
                      variant="default" 
                      onClick={() => navigateTo('/login')} 
                      className="w-full rounded-full h-12 font-bold gap-2"
                    >
                      <LogIn className="h-4 w-4" /> تسجيل الدخول
                    </Button>
                  )}
                </div>
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
              <Button 
                variant="ghost" 
                size="icon" 
                className="hidden sm:flex rounded-full text-primary hover:bg-primary/10"
                onClick={() => {
                  console.log('Navigating to Admin from Header Icon...');
                  navigateTo('/admin');
                }}
              >
                <Settings className="h-5 w-5" />
              </Button>
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
