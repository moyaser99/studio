'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ShoppingBag, Search, User, Menu, Settings, Loader2, LogOut, LogIn, AlertCircle, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useUser, useAuth, useFirestore, useCollection } from '@/firebase';
import { signOut } from 'firebase/auth';
import { useRouter, usePathname } from 'next/navigation';
import { query, collection, orderBy } from 'firebase/firestore';
import { useMemoFirebase } from '@/firebase/use-memo-firebase';
import { useTranslation } from '@/hooks/use-translation';

const ADMIN_EMAIL = 'mohammad.dd.my@gmail.com';
const ADMIN_PHONE = '+962780334074';

export default function Header() {
  const { user, loading } = useUser();
  const auth = useAuth();
  const db = useFirestore();
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { t, lang, toggleLang } = useTranslation();
  
  const isAdminPage = pathname?.startsWith('/admin');

  const categoriesQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, 'categories'), orderBy('displayOrder', 'asc'));
  }, [db]);
  const { data: categories } = useCollection(categoriesQuery);

  const isAdmin = user?.email === ADMIN_EMAIL || user?.phoneNumber === ADMIN_PHONE;

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
              <SheetContent side={lang === 'ar' ? 'right' : 'left'} className="w-[300px] sm:w-[350px] bg-white border-primary/10 flex flex-col z-[110]">
                <SheetHeader className="pb-6 border-b">
                  <SheetTitle className="text-primary text-start font-headline text-2xl font-black">
                    YourGroceriesUSA
                  </SheetTitle>
                </SheetHeader>
                
                <nav className="flex flex-col gap-2 mt-8 text-start flex-1 overflow-y-auto">
                  <p className="text-xs font-bold text-muted-foreground mb-4 uppercase tracking-widest">{t.shopByCategory}</p>
                  {categories?.map((cat: any) => (
                    <button
                      key={cat.id}
                      onClick={() => navigateTo(`/category/${cat.slug}`)}
                      className="text-lg font-bold hover:text-primary py-3 px-4 rounded-2xl hover:bg-primary/5 transition-all flex items-center justify-between group text-start"
                    >
                      <span>{lang === 'ar' ? cat.nameAr : (cat.nameEn || cat.slug.charAt(0).toUpperCase() + cat.slug.slice(1))}</span>
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity">
                        {lang === 'ar' ? '←' : '→'}
                      </span>
                    </button>
                  ))}
                  
                  {isAdmin && (
                    <div className="mt-8 pt-8 border-t">
                      <p className="text-xs font-bold text-primary mb-4 uppercase tracking-widest">{t.administration}</p>
                      <button 
                        onClick={() => navigateTo('/admin')}
                        className="w-full text-lg font-black text-primary py-3 px-4 rounded-2xl bg-primary/5 flex items-center gap-2 justify-start hover:bg-primary/10 transition-colors"
                      >
                        <Settings className="h-5 w-5" /> {t.admin}
                      </button>
                    </div>
                  )}
                </nav>

                <div className="mt-auto pt-6 border-t space-y-3 pb-6">
                  {user ? (
                    <Button 
                      variant="ghost" 
                      onClick={handleLogout} 
                      className="w-full rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/5 h-12 font-bold gap-2 justify-center"
                    >
                      <LogOut className="h-5 w-5" /> {t.logout}
                    </Button>
                  ) : (
                    <Button 
                      variant="default" 
                      onClick={() => navigateTo('/login')} 
                      className="w-full rounded-full h-12 font-bold gap-2 shadow-lg"
                    >
                      <LogIn className="h-5 w-5" /> {t.login}
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

          <div className="flex items-center gap-4">
            {isAdminPage && (
              <div className="hidden lg:flex items-center gap-2">
                {!loading && !user ? (
                  <div className="flex items-center gap-1.5 bg-destructive/10 text-destructive text-[10px] px-3 py-1 rounded-full font-bold border border-destructive/20 animate-pulse">
                    <AlertCircle className="h-3 w-3" />
                    {t.sessionWarning}
                  </div>
                ) : user && (
                  <div className="text-[10px] text-muted-foreground bg-muted/50 px-3 py-1 rounded-full border">
                    {t.adminIndicator}: <span className="font-bold text-primary">{user.email || user.phoneNumber}</span>
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center gap-2">
              <Button 
                onClick={toggleLang}
                className="hidden sm:flex rounded-full px-4 h-10 border-2 border-[#D4AF37] bg-[#F8C8DC]/20 text-primary hover:bg-[#F8C8DC]/40 transition-all font-bold gap-2 text-sm"
                variant="ghost"
              >
                <Globe className="h-4 w-4 text-[#D4AF37]" />
                {t.langToggle}
              </Button>

              <Button variant="ghost" size="icon" className="hidden sm:flex rounded-full hover:bg-primary/5">
                <Search className="h-5 w-5" />
              </Button>
              
              {isAdmin && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="hidden sm:flex rounded-full text-primary hover:bg-primary/10"
                  onClick={() => navigateTo('/admin')}
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
      </div>
    </header>
  );
}
