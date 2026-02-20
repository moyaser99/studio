
'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ShoppingBag, Search, User, Menu, Settings, Loader2, LogOut, LogIn, Globe, ClipboardList, X } from 'lucide-react';
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
  const { t, lang, toggleLang, getTranslatedCategory } = useTranslation();
  const { totalItems } = useCart();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);

  // Scroll visibility logic
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  // FAIL-SAFE: Reset header visibility whenever the route changes
  useEffect(() => {
    setIsVisible(true);
    setLastScrollY(0);
    // Debugging path for Mohammad Jebrel
    console.log('Route Changed to:', pathname, '| Header visibility reset to: true');
  }, [pathname]);

  useEffect(() => {
    const handleScroll = () => {
      // Robust scroll check for different browsers/containers
      const currentScrollY = window.scrollY || window.pageYOffset || document.documentElement.scrollTop;
      
      // Safety check: force visibility when at the very top of the page (near 0)
      if (currentScrollY < 15) {
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY && currentScrollY > 60) {
        setIsVisible(false); // Scrolling down
      } else {
        setIsVisible(true); // Scrolling up
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
        // Force extremely high z-index to ensure it stays on top of Admin tables/sidebars
        "z-[9999]",
        isVisible ? "translate-y-0" : "-translate-y-full"
      )}
    >
      <div className="container mx-auto px-4">
        <div className="flex h-16 md:h-20 items-center justify-between gap-2 md:gap-4">
          <div className="flex items-center gap-2 md:gap-4 flex-shrink-0">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary/5 h-9 w-9 md:h-10 md:w-10">
                  <Menu className="h-5 w-5 md:h-6 md:w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side={lang === 'ar' ? 'right' : 'left'} className="w-[85%] sm:w-[350px] bg-white border-primary/10 flex flex-col z-[10000]">
                <SheetHeader className="pb-6 border-b">
                  <SheetTitle className="text-primary text-start font-headline text-xl md:text-2xl font-black">
                    YourGroceriesUSA
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
                  
                  {isAdmin && (
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
                      </div>
                    </div>
                  )}
                </nav>

                <div className="mt-auto pt-6 border-t space-y-3 pb-6">
                  {user ? (
                    <Button 
                      variant="ghost" 
                      onClick={handleLogout} 
                      className="w-full rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/5 h-10 md:h-12 font-bold gap-2 justify-center"
                    >
                      <LogOut className="h-4 w-4 md:h-5 md:w-5" /> {t.logout}
                    </Button>
                  ) : (
                    <Button 
                      variant="default" 
                      onClick={() => navigateTo('/login')} 
                      className="w-full rounded-full h-10 md:h-12 font-bold gap-2 shadow-lg"
                    >
                      <LogIn className="h-4 w-4 md:h-5 md:w-5" /> {t.login}
                    </Button>
                  )}
                </div>
              </SheetContent>
            </Sheet>

            <Link href="/" className="flex items-center">
              <span className="font-headline text-lg md:text-2xl font-black tracking-tighter text-primary truncate max-w-[100px] sm:max-w-none">
                YourGroceriesUSA
              </span>
            </Link>
          </div>

          {/* Desktop Search */}
          <div className="hidden lg:flex flex-1 max-w-xl relative mx-4" ref={searchRef}>
            <form onSubmit={handleSearchSubmit} className="w-full group">
              <div className="relative">
                <Search className="absolute start-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-[#D4AF37] transition-colors" />
                <input
                  type="text"
                  placeholder={t.search}
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowResults(true);
                  }}
                  onFocus={() => setShowResults(true)}
                  className="w-full h-11 ps-12 pe-12 rounded-full border-2 border-[#F8C8DC] bg-white text-base md:text-lg focus:outline-none focus:border-[#D4AF37] transition-all shadow-sm"
                />
                {searchQuery && (
                  <button 
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setShowResults(false);
                    }}
                    className="absolute end-4 top-1/2 -translate-y-1/2 h-6 w-6 text-muted-foreground hover:text-primary transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}
              </div>
            </form>

            {showResults && searchQuery.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-3 bg-white rounded-[2rem] shadow-2xl border border-primary/5 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="p-4 border-b bg-primary/5">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-2">
                    {filteredProducts.length > 0 ? t.latestProducts : t.noProductsFound}
                  </p>
                </div>
                <div className="max-h-[450px] overflow-y-auto">
                  {filteredProducts.map((product) => (
                    <button
                      key={product.id}
                      onClick={() => navigateTo(`/product/${product.id}`)}
                      className="w-full flex items-center gap-4 p-4 hover:bg-primary/5 transition-all group text-start"
                    >
                      <div className="h-14 w-14 rounded-xl overflow-hidden bg-muted flex-shrink-0 border">
                        <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-foreground text-sm line-clamp-1 group-hover:text-primary transition-colors">{lang === 'ar' ? product.name : (product.nameEn || product.name)}</h4>
                        <p className="text-xs text-muted-foreground">{lang === 'ar' ? product.categoryName : (product.categoryNameEn || getTranslatedCategory(product.categoryName))}</p>
                      </div>
                      <div className="text-base font-black text-[#D4AF37]">${product.price?.toFixed(2)}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-1 sm:gap-4 flex-shrink-0">
            <div className="flex items-center gap-1 sm:gap-2">
              <Button 
                onClick={toggleLang}
                size="sm"
                className="rounded-full px-2 sm:px-4 h-9 sm:h-10 border-2 border-[#D4AF37] bg-[#F8C8DC]/20 text-primary hover:bg-[#F8C8DC]/40 transition-all font-bold gap-1 text-[10px] sm:text-xs min-w-[45px] sm:min-w-[60px]"
                variant="ghost"
              >
                <Globe className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#D4AF37]" />
                {t.langToggle}
              </Button>

              <Button 
                variant="ghost" 
                size="icon" 
                className="lg:hidden rounded-full hover:bg-primary/5 h-9 w-9"
                onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
              >
                <Search className="h-5 w-5" />
              </Button>
              
              <Link href="/cart">
                <Button variant="ghost" size="icon" className="relative rounded-full hover:bg-primary/5 h-9 w-9 group">
                  <ShoppingBag className="h-5 w-5" />
                  {totalItems > 0 && (
                    <span 
                      key={totalItems}
                      className="absolute -top-0.5 -right-0.5 h-4 w-4 md:h-5 md:w-5 bg-[#D4AF37] text-white text-[8px] md:text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white shadow-sm animate-in zoom-in duration-300"
                    >
                      {totalItems}
                    </span>
                  )}
                </Button>
              </Link>

              {loading ? (
                <div className="w-9 h-9 md:w-10 md:h-10 flex items-center justify-center">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <Link href={user ? "/profile-completion" : "/login"}>
                  <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary/5 h-9 w-9">
                    <User className="h-5 w-5" />
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Search Input Expansion */}
        {mobileSearchOpen && (
          <div className="lg:hidden pb-4 px-1 animate-in slide-in-from-top duration-300" ref={searchRef}>
            <div className="relative">
              <input
                type="text"
                placeholder={t.search}
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowResults(true);
                }}
                className="w-full h-10 ps-4 pe-10 rounded-full border-2 border-[#F8C8DC] bg-white text-sm focus:outline-none focus:border-[#D4AF37] shadow-sm"
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
                    <img src={product.imageUrl} className="h-10 w-10 rounded-lg object-cover" />
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
