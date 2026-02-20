
'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ShoppingBag, Search, User, Menu, Settings, Loader2, LogOut, LogIn, AlertCircle, Globe, ClipboardList, X } from 'lucide-react';
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
  const { t, lang, toggleLang, getTranslatedCategory } = useTranslation();
  const { totalItems } = useCart();
  
  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);

  const isAdminPage = pathname?.startsWith('/admin');

  // Fetch all active products for client-side search
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

  // Search Logic with Debounce effect
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
      ).slice(0, 6); // Limit results for luxury look

      setFilteredProducts(filtered);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, allProducts]);

  // Close search results when clicking outside
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
    router.push(path);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowResults(false);
      // Optional: router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <header className="sticky top-0 z-[100] w-full border-b bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/80">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex h-20 items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-shrink-0">
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
                      <div className="space-y-2">
                        <button 
                          onClick={() => navigateTo('/admin')}
                          className="w-full text-lg font-black text-primary py-3 px-4 rounded-2xl bg-primary/5 flex items-center gap-2 justify-start hover:bg-primary/10 transition-colors"
                        >
                          <Settings className="h-5 w-5" /> {t.admin}
                        </button>
                        <button 
                          onClick={() => navigateTo('/admin/orders')}
                          className="w-full text-lg font-black text-[#D4AF37] py-3 px-4 rounded-2xl bg-[#D4AF37]/5 flex items-center gap-2 justify-start hover:bg-[#D4AF37]/10 transition-colors"
                        >
                          <ClipboardList className="h-5 w-5" /> {t.manageOrders}
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

          {/* Search Bar Implementation */}
          <div className="hidden lg:flex flex-1 max-w-xl relative" ref={searchRef}>
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
                  className="w-full h-12 ps-12 pe-12 rounded-full border-2 border-[#F8C8DC] bg-white text-lg focus:outline-none focus:border-[#D4AF37] transition-all shadow-sm"
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

            {/* Search Results Dropdown */}
            {showResults && searchQuery.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-3 bg-white rounded-[2rem] shadow-2xl border border-primary/5 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="p-4 border-b bg-primary/5">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-2">
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
                      <div className="h-16 w-16 rounded-2xl overflow-hidden bg-muted flex-shrink-0 border">
                        <img 
                          src={product.imageUrl || 'https://picsum.photos/seed/placeholder/200/200'} 
                          alt={product.name} 
                          className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                          {lang === 'ar' ? product.name : (product.nameEn || product.name)}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {lang === 'ar' ? product.categoryName : (product.categoryNameEn || getTranslatedCategory(product.categoryName))}
                        </p>
                      </div>
                      <div className="text-lg font-black text-[#D4AF37]">
                        ${product.price?.toFixed(2)}
                      </div>
                    </button>
                  ))}
                  {filteredProducts.length === 0 && (
                    <div className="p-12 text-center text-muted-foreground">
                      <Search className="h-12 w-12 mx-auto mb-4 opacity-10" />
                      <p className="text-lg font-medium">{t.noProductsFound}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-4 flex-shrink-0">
            {isAdminPage && (
              <div className="hidden xl:flex items-center gap-2">
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

              <Button variant="ghost" size="icon" className="lg:hidden rounded-full hover:bg-primary/5">
                <Search className="h-5 w-5" />
              </Button>
              
              {isAdmin && (
                <div className="hidden sm:flex items-center gap-2">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="rounded-full text-primary hover:bg-primary/10"
                    onClick={() => navigateTo('/admin')}
                  >
                    <Settings className="h-5 w-5" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="rounded-full text-[#D4AF37] hover:bg-[#D4AF37]/10"
                    onClick={() => navigateTo('/admin/orders')}
                  >
                    <ClipboardList className="h-5 w-5" />
                  </Button>
                </div>
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

              <Link href="/cart">
                <Button variant="ghost" size="icon" className="relative rounded-full hover:bg-primary/5 group">
                  <ShoppingBag className="h-5 w-5" />
                  {totalItems > 0 && (
                    <span 
                      key={totalItems}
                      className="absolute -top-1 -right-1 h-5 w-5 bg-[#D4AF37] text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white shadow-sm animate-in zoom-in duration-300"
                    >
                      {totalItems}
                    </span>
                  )}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
