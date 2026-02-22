'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ShoppingBag, Search, User, Menu, Settings, Loader2, LogOut, LogIn, Globe, ClipboardList, X, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useUser, useAuth, useFirestore, useCollection } from '@/firebase';
import { signOut } from 'firebase/auth';
import { useRouter, usePathname } from 'next/navigation';
import { query, collection, orderBy, where } from 'firebase/firestore';
import { useMemoFirebase } from '@/firebase/use-memo-firebase';
import { useTranslation } from '@/hooks/use-translation';
import { useCart } from '@/context/CartContext';
import { cn } from '@/lib/utils';

const ADMIN_EMAIL = 'mohammad.dd.my@gmail.com';
const ADMIN_PHONE = '+962780334074';

export default function Header() {
  const { user, loading } = useUser();
  const auth = useAuth();
  const db = useFirestore();
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const { t, lang, toggleLang } = useTranslation();
  const { totalItems } = useCart();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  // Scroll visibility logic
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    setMounted(true);
    setIsVisible(true);
    setLastScrollY(0);
  }, [pathname]);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY || window.pageYOffset || document.documentElement.scrollTop;
      
      if (currentScrollY < 15) {
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY && currentScrollY > 60) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const productsQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, 'products'), where('isHidden', '!=', true));
  }, [db]);
  const { data: allProducts } = useCollection(productsQuery);

  const categoriesQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, 'categories'), orderBy('displayOrder', 'asc'));
  }, [db]);
  const { data: categories } = useCollection(categoriesQuery);

  const isAdmin = user?.email === ADMIN_EMAIL || user?.phoneNumber === ADMIN_PHONE;

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim() === '' || !allProducts) {
        setFilteredProducts([]);
        return;
      }

      const queryLower = searchQuery.toLowerCase();
      const filtered = allProducts.filter((p: any) => 
        p.name?.toLowerCase().includes(queryLower) || 
        (p.nameEn && p.nameEn.toLowerCase().includes(queryLower)) ||
        p.categoryName?.toLowerCase().includes(queryLower) ||
        (p.categoryNameEn && p.categoryNameEn.toLowerCase().includes(queryLower))
      ).slice(0, 6);

      setFilteredProducts(filtered);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, allProducts]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
    setShowResults(false);
    setSearchQuery('');
    setMobileSearchOpen(false);
    router.push(path);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowResults(false);
      setMobileSearchOpen(false);
    }
  };

  return (
    <header 
      className={cn(
        "fixed top-0 left-0 right-0 w-full border-b transition-transform duration-300",
        "bg-white/80 backdrop-blur-md border-[#D4AF37]/10",
        "z-[9999]",
        isVisible ? "translate-y-0" : "-translate-y-full"
      )}
    >
      <div className="container mx-auto px-4">
        <div className="flex h-16 md:h-20 items-center justify-between gap-4">
          
          {/* Left Section: Menu + Logo */}
          <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary/5 h-9 w-9 md:h-10 md:w-10">
                  <Menu className="h-5 w-5 md:h-6 md:w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side={lang === 'ar' ? 'right' : 'left'} className="w-[85%] sm:w-[350px] bg-white border-primary/10 flex flex-col z-[10000]">
                <SheetHeader className="pb-6 border-b">
                  <SheetTitle className="text-primary text-start font-headline text-xl md:text-2xl font-black">
                    HarirBoutiqueUSA
                  </SheetTitle>
                </SheetHeader>
                
                <nav className="flex flex-col gap-1 mt-6 text-start flex-1 overflow-y-auto">
                  <p className="text-[10px] md:text-xs font-bold text-muted-foreground mb-3 uppercase tracking-widest">{t.shopByCategory}</p>
                  <button
                    onClick={() => navigateTo('/products')}
                    className="text-base md:text-lg font-bold hover:text-primary py-2 md:py-3 px-3 md:px-4 rounded-xl md:rounded-2xl hover:bg-primary/5 transition-all flex items-center justify-between group text-start"
                  >
                    <span>{t.allProducts}</span>
                  </button>
                  {categories?.map((cat: any) => (
                    <button
                      key={cat.id}
                      onClick={() => navigateTo(`/category/${cat.slug}`)}
                      className="text-base md:text-lg font-bold hover:text-primary py-2 md:py-3 px-3 md:px-4 rounded-xl md:rounded-2xl hover:bg-primary/5 transition-all flex items-center justify-between group text-start"
                    >
                      <span>{lang === 'ar' ? cat.nameAr : (cat.nameEn || cat.slug.charAt(0).toUpperCase() + cat.slug.slice(1))}</span>
                    </button>
                  ))}
                  
                  {mounted && isAdmin && (
                    <div className="mt-6 pt-6 border-t">
                      <p className="text-[10px] md:text-xs font-bold text-primary mb-3 uppercase tracking-widest">{t.administration}</p>
                      <div className="space-y-2">
                        <button 
                          onClick={() => navigateTo('/admin')}
                          className="w-full text-base md:text-lg font-black text-primary py-2 md:py-3 px-3 md:px-4 rounded-xl md:rounded-2xl bg-primary/5 flex items-center gap-2 justify-start hover:bg-primary/10"
                        >
                          <Settings className="h-4 w-4 md:h-5 md:w-5" /> {t.admin}
                        </button>
                        <button 
                          onClick={() => navigateTo('/admin/orders')}
                          className="w-full text-base md:text-lg font-black text-[#D4AF37] py-2 md:py-3 px-3 md:px-4 rounded-xl md:rounded-2xl bg-[#D4AF37]/5 flex items-center gap-2 justify-start hover:bg-[#D4AF37]/10"
                        >
                          <ClipboardList className="h-4 w-4 md:h-5 md:w-5" /> {t.manageOrders}
                        </button>
                        <button 
                          onClick={() => navigateTo('/admin/shipping')}
                          className="w-full text-base md:text-lg font-black text-[#D4AF37] py-2 md:py-3 px-3 md:px-4 rounded-xl md:rounded-2xl bg-primary/5 flex items-center gap-2 justify-start hover:bg-[#D4AF37]/10"
                        >
                          <Truck className="h-4 w-4 md:h-5 md:w-5" /> {t.manageShipping}
                        </button>
                      </div>
                    </div>
                  )}
                </nav>

                <div className="mt-auto pt-6 border-t space-y-3 pb-6">
                  {mounted && user ? (
                    <Button 
                      variant="ghost" 
                      onClick={handleLogout} 
                      className="w-full rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/5 h-10 md:h-12 font-bold gap-2 justify-center"
                    >
                      <LogOut className="h-4 w-4 md:h-5 md:w-5" /> {t.logout}
                    </Button>
                  ) : mounted ? (
                    <Button 
                      variant="default" 
                      onClick={() => navigateTo('/login')} 
                      className="w-full rounded-full h-10 md:h-12 font-bold gap-2 shadow-lg"
                    >
                      <LogIn className="h-4 w-4 md:h-5 md:w-5" /> {t.login}
                    </Button>
                  ) : null}
                </div>
              </SheetContent>
            </Sheet>

            <Link href="/" className="flex items-center">
              <span className="font-headline text-lg md:text-2xl font-black tracking-tighter text-primary whitespace-nowrap">
                HarirBoutiqueUSA
              </span>
            </Link>
          </div>

          {/* Middle Section: Expansive Search Bar */}
          <div className="hidden lg:flex flex-1 items-center justify-center max-w-xl mx-auto px-4" ref={searchRef}>
            <form onSubmit={handleSearchSubmit} className="relative group w-full">
              <Search className="absolute start-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-[#D4AF37] transition-colors" />
              <input
                type="text"
                placeholder={t.search}
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowResults(true);
                }}
                onFocus={() => setShowResults(true)}
                className="w-full h-10 ps-11 pe-10 rounded-full border-2 border-[#F8C8DC] bg-white text-sm focus:outline-none focus:border-[#D4AF37] transition-all shadow-sm"
              />
              {searchQuery && (
                <button 
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setShowResults(false);
                  }}
                  className="absolute end-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground hover:text-primary transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              )}

              {showResults && searchQuery.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-3 bg-white rounded-2xl shadow-2xl border border-primary/5 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300 z-[10000]">
                  <div className="p-3 border-b bg-primary/5">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-2">
                      {filteredProducts.length > 0 ? t.latestProducts : t.noProductsFound}
                    </p>
                  </div>
                  <div className="max-h-[350px] overflow-y-auto">
                    {filteredProducts.map((product) => (
                      <button
                        key={product.id}
                        type="button"
                        onClick={() => navigateTo(`/product/${product.id}`)}
                        className="w-full flex items-center gap-3 p-3 hover:bg-primary/5 transition-all group text-start"
                      >
                        <div className="h-10 w-10 rounded-lg overflow-hidden bg-muted flex-shrink-0 border">
                          <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-foreground text-xs line-clamp-1">{lang === 'ar' ? product.name : (product.nameEn || product.name)}</h4>
                          <p className="text-[10px] text-muted-foreground">${product.price?.toFixed(2)}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </form>
          </div>

          {/* Right Section: Language, Cart, Profile */}
          <div className="flex items-center gap-1 sm:gap-3 flex-shrink-0">
            
            {/* Language Toggle Button */}
            <Button 
              onClick={toggleLang}
              size="sm"
              className="rounded-full px-2 sm:px-3 h-8 sm:h-9 border-2 border-[#D4AF37] bg-[#F8C8DC]/20 text-primary hover:bg-[#F8C8DC]/40 transition-all font-bold gap-1 text-[10px] sm:text-xs"
              variant="ghost"
            >
              <Globe className="h-3.5 w-3.5 text-[#D4AF37]" />
              {mounted ? t.langToggle : '...'}
            </Button>

            {/* Mobile Search Toggle */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="lg:hidden rounded-full hover:bg-primary/5 h-8 w-8 sm:h-9 sm:w-9"
              onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
            >
              <Search className="h-4 w-4 sm:h-5 sm:w-5 text-[#D4AF37]" />
            </Button>
            
            {/* Cart Icon */}
            <Link href="/cart">
              <Button variant="ghost" size="icon" className="relative rounded-full hover:bg-primary/5 h-8 w-8 sm:h-9 sm:w-9">
                <ShoppingBag className="h-4 w-4 sm:h-5 sm:w-5 text-[#D4AF37]" />
                {mounted && totalItems > 0 && (
                  <span 
                    key={totalItems}
                    className="absolute -top-0.5 -right-0.5 h-4 w-4 bg-[#D4AF37] text-white text-[8px] font-bold rounded-full flex items-center justify-center border-2 border-white shadow-sm"
                  >
                    {totalItems}
                  </span>
                )}
              </Button>
            </Link>

            {/* User Profile Icon */}
            {mounted && loading ? (
              <div className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <Link href={mounted && user ? "/profile-completion" : "/login"}>
                <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary/5 h-8 w-8 sm:h-9 sm:w-9">
                  <User className="h-4 w-4 sm:h-5 sm:w-5 text-[#D4AF37]" />
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Mobile Search Input Expansion */}
        {mobileSearchOpen && (
          <div className="lg:hidden pb-4 px-1 animate-in slide-in-from-top duration-300">
            <div className="relative">
              <input
                type="text"
                placeholder={t.search}
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowResults(true);
                }}
                className="w-full h-9 ps-4 pe-10 rounded-full border-2 border-[#F8C8DC] bg-white text-sm focus:outline-none focus:border-[#D4AF37] shadow-sm"
                autoFocus
              />
              <button 
                onClick={() => setMobileSearchOpen(false)}
                className="absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            {showResults && searchQuery.length > 0 && (
              <div className="absolute top-full left-4 right-4 z-[1200] mt-2 bg-white rounded-2xl shadow-2xl border border-primary/5 overflow-hidden">
                {filteredProducts.map((product) => (
                  <button
                    key={product.id}
                    onClick={() => navigateTo(`/product/${product.id}`)}
                    className="w-full flex items-center gap-3 p-3 hover:bg-primary/5 border-b last:border-0 text-start"
                  >
                    <img src={product.imageUrl} className="h-10 w-10 rounded-lg object-cover" alt={product.name} />
                    <div className="flex-1">
                      <p className="text-xs font-bold line-clamp-1">{lang === 'ar' ? product.name : (product.nameEn || product.name)}</p>
                      <p className="text-[10px] text-muted-foreground">${product.price?.toFixed(2)}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
