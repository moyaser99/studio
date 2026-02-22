'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useFirestore, useCollection, useUser, useDoc, useAuth } from '@/firebase';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  orderBy, 
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog';
import { 
  Plus, 
  Edit, 
  Trash2, 
  LayoutDashboard, 
  Package, 
  Settings, 
  Loader2, 
  Image as ImageIcon,
  Save,
  Tags,
  AlertTriangle,
  Eye,
  EyeOff,
  Sparkles,
  BarChart3,
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Calendar,
  ArrowUpRight,
  PackageSearch,
  Search,
  X,
  ClipboardList,
  Truck,
  Percent
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { generateProductDescription } from '@/ai/flows/generate-product-description-flow';
import { useMemoFirebase } from '@/firebase/use-memo-firebase';
import Link from 'next/link';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { useTranslation } from '@/hooks/use-translation';
import { Badge } from '@/components/ui/badge';
import ImageUpload from '@/components/admin/ImageUpload';

const ADMIN_EMAIL = 'mohammad.dd.my@gmail.com';
const ADMIN_PHONE = '+962780334074';
const PLACEHOLDER_IMAGE = 'https://picsum.photos/seed/placeholder/200/200';

export default function AdminPage() {
  const db = useFirestore();
  const auth = useAuth();
  const { user, loading: authLoading } = useUser();
  const { toast } = useToast();
  const { lang, t, getTranslatedCategory } = useTranslation();
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    nameEn: '',
    price: '',
    discountPercentage: '0',
    category: '',
    imageUrl: '',
    description: '',
    descriptionEn: '',
    details: '',
    detailsEn: '',
    stock: '',
  });

  const [heroUrl, setHeroUrl] = useState('');

  const productsQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, 'products'), orderBy('createdAt', 'desc'));
  }, [db]);

  const { data: products, loading: productsLoading } = useCollection(productsQuery);
  
  const categoriesQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, 'categories'), orderBy('displayOrder', 'asc'));
  }, [db]);

  const { data: categories } = useCollection(categoriesQuery);

  const ordersQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
  }, [db]);

  const { data: orders, loading: ordersLoading } = useCollection(ordersQuery);

  const heroRef = useMemoFirebase(() => {
    if (!db) return null;
    return doc(db, 'siteSettings', 'heroSection');
  }, [db]);
  const { data: heroData } = useDoc(heroRef);

  useEffect(() => {
    if (heroData?.imageUrl) {
      setHeroUrl(heroData.imageUrl);
    }
  }, [heroData]);

  const filteredProducts = useMemo(() => {
    if (!products) return [];
    if (!searchTerm.trim()) return products;
    
    const queryLower = searchTerm.toLowerCase();
    return products.filter((p: any) => 
      p.name?.toLowerCase().includes(queryLower) || 
      (p.nameEn && p.nameEn.toLowerCase().includes(queryLower)) ||
      p.categoryName?.toLowerCase().includes(queryLower)
    );
  }, [products, searchTerm]);

  const stats = useMemo(() => {
    if (!orders) return null;

    const now = new Date();
    const oneDay = 24 * 60 * 60 * 1000;
    const sevenDays = 7 * oneDay;
    const thirtyDays = 30 * oneDay;

    let revenue24h = 0;
    let revenue7d = 0;
    let revenue30d = 0;
    let totalRevenue = 0;
    let orders24h = 0;
    let orders7d = 0;
    let orders30d = 0;

    const productSales: Record<string, { name: string; count: number; revenue: number }> = {};

    orders.forEach((order: any) => {
      const orderDate = order.createdAt instanceof Timestamp ? order.createdAt.toDate() : new Date(order.createdAt);
      const diff = now.getTime() - orderDate.getTime();
      const price = order.totalPrice || 0;

      totalRevenue += price;

      if (diff <= oneDay) {
        revenue24h += price;
        orders24h++;
      }
      if (diff <= sevenDays) {
        revenue7d += price;
        orders7d++;
      }
      if (diff <= thirtyDays) {
        revenue30d += price;
        orders30d++;
      }

      order.items?.forEach((item: any) => {
        const id = item.id;
        if (!productSales[id]) {
          productSales[id] = { name: item.name, count: 0, revenue: 0 };
        }
        productSales[id].count += item.quantity || 1;
        productSales[id].revenue += (item.price * item.quantity) || 0;
      });
    });

    const topSelling = Object.values(productSales)
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);

    const lowStock = products?.filter((p: any) => p.stock !== undefined && parseInt(p.stock) < 5) || [];

    return {
      revenue24h,
      revenue7d,
      revenue30d,
      totalRevenue,
      orders24h,
      orders7d,
      orders30d,
      totalOrders: orders.length,
      avgOrderValue: orders.length > 0 ? totalRevenue / orders.length : 0,
      topSelling,
      lowStock
    };
  }, [orders, products]);

  const isAdmin = user?.email === ADMIN_EMAIL || user?.phoneNumber === ADMIN_PHONE;

  if (authLoading) return (
    <div className="flex items-center justify-center p-20">
      <Loader2 className="h-10 w-10 animate-spin text-primary" />
    </div>
  );

  if (!isAdmin && !authLoading) {
    return (
      <div className="flex items-center justify-center bg-muted/20 p-12" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
        <Card className="max-w-md text-center p-8 rounded-3xl shadow-xl">
          <div className="bg-destructive/10 text-destructive p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="h-8 w-8" />
          </div>
          <CardTitle className="text-2xl text-destructive mb-4">{t.sessionWarning}</CardTitle>
          <div className="flex flex-col gap-3">
            <Button onClick={() => window.open(window.location.href, '_blank')} className="rounded-full h-12">Open in New Window</Button>
            <Button onClick={() => window.location.href = '/login'} variant="outline" className="rounded-full h-12">{t.loginTitle}</Button>
          </div>
        </Card>
      </div>
    );
  }

  const handleAiDescription = async () => {
    if (!formData.name) {
      toast({ variant: 'destructive', title: t.errorOccurred, description: 'Please enter product name first.' });
      return;
    }
    setAiLoading(true);
    try {
      const selectedCat = categories?.find((c: any) => c.slug === formData.category);
      const categoryName = selectedCat?.nameAr || formData.category;
      const res = await generateProductDescription({
        productName: formData.name,
        category: categoryName,
        keyFeatures: ['Exclusive product', 'High quality', 'Imported from USA']
      });
      setFormData(prev => ({ 
        ...prev, 
        description: res.descriptionAr,
        descriptionEn: res.descriptionEn 
      }));
      toast({ title: 'Generated', description: t.aiDescriptionSuccess });
    } catch (error) {
      toast({ variant: 'destructive', title: t.errorOccurred, description: t.aiDescriptionError });
    } finally {
      setAiLoading(false);
    }
  };

  const saveProduct = () => {
    if (!db) return;
    setSaving(true);
    const selectedCat = categories?.find((c: any) => c.slug === formData.category);
    const categoryName = selectedCat?.nameAr || '';
    const categoryNameEn = selectedCat?.nameEn || selectedCat?.slug || '';
    
    const payload: any = {
      ...formData,
      price: parseFloat(formData.price) || 0,
      discountPercentage: parseFloat(formData.discountPercentage) || 0,
      stock: parseInt(formData.stock) || 0,
      categoryName,
      categoryNameEn,
      updatedAt: serverTimestamp(),
      isHidden: formData.hasOwnProperty('isHidden') ? (formData as any).isHidden : false,
    };

    if (isEditing) {
      const docRef = doc(db, 'products', isEditing);
      updateDoc(docRef, payload)
        .then(() => {
          toast({ title: 'Updated', description: t.productUpdated });
          resetForm();
        })
        .catch(async () => {
          errorEmitter.emit('permission-error', new FirestorePermissionError({ path: docRef.path, operation: 'update', requestResourceData: payload }));
        })
        .finally(() => setSaving(false));
    } else {
      payload.createdAt = serverTimestamp();
      addDoc(collection(db, 'products'), payload)
        .then(() => {
          toast({ title: 'Added', description: t.productAdded });
          resetForm();
        })
        .catch(async () => {
          errorEmitter.emit('permission-error', new FirestorePermissionError({ path: 'products', operation: 'create', requestResourceData: payload }));
        })
        .finally(() => setSaving(false));
    }
  };

  const toggleVisibility = (id: string, currentStatus: boolean) => {
    if (!db) return;
    setTogglingId(id);
    const docRef = doc(db, 'products', id);
    const newStatus = !currentStatus;
    
    updateDoc(docRef, { isHidden: newStatus })
      .then(() => {
        toast({ 
          title: newStatus ? t.hidden : t.visible, 
          description: newStatus ? 'Product is now hidden.' : 'Product is now visible.' 
        });
      })
      .catch(() => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({ path: docRef.path, operation: 'update' }));
      })
      .finally(() => setTogglingId(null));
  };

  const deleteProduct = (id: string) => {
    if (!isAdmin || !db) return;
    if (!window.confirm(t.confirmDeleteProduct)) return;
    
    setDeletingId(id);
    const docRef = doc(db, 'products', id);
    
    deleteDoc(docRef)
      .then(() => {
        toast({ title: 'Deleted', description: t.productDeleted });
      })
      .catch((err) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({ path: docRef.path, operation: 'delete' }));
      })
      .finally(() => setDeletingId(null));
  };

  const resetForm = () => {
    setFormData({ 
      name: '', 
      nameEn: '', 
      price: '', 
      discountPercentage: '0',
      category: categories?.[0]?.slug || '', 
      imageUrl: '', 
      description: '',
      descriptionEn: '',
      details: '',
      detailsEn: '',
      stock: '',
    });
    setIsAdding(false);
    setIsEditing(null);
    setSaving(false);
  };

  const updateHero = () => {
    if (!db || !heroUrl) return;
    const docRef = doc(db, 'siteSettings', 'heroSection');
    updateDoc(docRef, {
      imageUrl: heroUrl,
      updatedAt: serverTimestamp()
    })
      .then(() => {
        toast({ title: 'Updated', description: t.heroUpdated });
      })
      .catch(async () => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({ path: docRef.path, operation: 'update' }));
      });
  };

  return (
    <div className="container mx-auto px-4 py-12" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-6">
        <div className="text-start">
          <h1 className="text-4xl font-black font-headline text-primary flex items-center gap-3">
            <LayoutDashboard className="h-10 w-10" /> {t.adminDashboard}
          </h1>
        </div>
        
        <div className="flex flex-wrap justify-center md:justify-end gap-4">
          <Link href="/admin/orders">
            <Button className="rounded-full h-14 px-8 text-lg font-black bg-primary border-2 border-[#D4AF37] text-white shadow-lg gap-2 hover:opacity-90 transition-all">
              <ClipboardList className="h-6 w-6" /> {t.manageOrders}
            </Button>
          </Link>

          <Link href="/admin/shipping">
            <Button variant="outline" className="rounded-full h-14 px-8 text-lg font-bold border-[#D4AF37] text-[#D4AF37] gap-2 shadow-sm bg-white hover:bg-muted/50 transition-all">
              <Truck className="h-6 w-6" /> {t.manageShipping}
            </Button>
          </Link>

          <Link href="/admin/categories">
            <Button variant="outline" className="rounded-full h-14 px-8 text-lg font-bold border-[#D4AF37] text-[#D4AF37] gap-2">
              <Tags className="h-6 w-6" /> {t.manageCategories}
            </Button>
          </Link>

          <Dialog open={isAdding || !!isEditing} onOpenChange={(val) => !val && resetForm()}>
            <DialogTrigger asChild>
              <Button onClick={() => setIsAdding(true)} className="rounded-full h-14 px-8 text-lg font-bold shadow-lg gap-2 bg-[#D4AF37] hover:bg-[#B8962D]">
                <Plus className="h-6 w-6" /> {t.addNewProduct}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl rounded-[2.5rem] overflow-y-auto max-h-[90vh] z-[1100]" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
              <DialogHeader>
                <DialogTitle className="text-3xl font-black font-headline text-start text-primary flex items-center gap-2">
                  {isEditing ? t.editProduct : t.addNewProduct}
                  {!isEditing && <Sparkles className="h-6 w-6 text-[#D4AF37]" />}
                </DialogTitle>
              </DialogHeader>
              <div className="grid gap-8 py-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2 text-start">
                    <Label className="text-lg font-bold">{t.productNameLabel}</Label>
                    <input 
                      value={formData.name} 
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      placeholder="مثال: كريم العناية الفاخر" 
                      className="flex h-14 w-full rounded-2xl border-2 border-primary/10 bg-background px-4 text-start focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
                    />
                  </div>
                  <div className="space-y-2 text-start">
                    <Label className="text-lg font-bold">{t.productNameEnLabel}</Label>
                    <input 
                      value={formData.nameEn} 
                      onChange={e => setFormData({...formData, nameEn: e.target.value})}
                      placeholder="Ex: Luxury Care Cream" 
                      className="flex h-14 w-full rounded-2xl border-2 border-primary/10 bg-background px-4 text-start focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="space-y-2 text-start">
                    <Label className="text-lg font-bold">{t.productPrice}</Label>
                    <div className="relative">
                      <DollarSign className="absolute start-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <input 
                        type="number"
                        value={formData.price} 
                        onChange={e => setFormData({...formData, price: e.target.value})}
                        placeholder="0.00" 
                        className="flex h-14 w-full rounded-2xl border-2 border-primary/10 bg-background ps-11 pe-4 text-start focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
                      />
                    </div>
                  </div>
                  <div className="space-y-2 text-start">
                    <Label className="text-lg font-bold">{t.discountLabel}</Label>
                    <div className="relative">
                      <Percent className="absolute start-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <input 
                        type="number"
                        value={formData.discountPercentage} 
                        onChange={e => setFormData({...formData, discountPercentage: e.target.value})}
                        placeholder="0" 
                        className="flex h-14 w-full rounded-2xl border-2 border-primary/10 bg-background ps-11 pe-4 text-start focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
                      />
                    </div>
                  </div>
                  <div className="space-y-2 text-start">
                    <Label className="text-lg font-bold">{t.stock}</Label>
                    <input 
                      type="number"
                      value={formData.stock} 
                      onChange={e => setFormData({...formData, stock: e.target.value})}
                      placeholder="0" 
                      className="flex h-14 w-full rounded-2xl border-2 border-primary/10 bg-background px-4 text-start focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
                    />
                  </div>
                  <div className="space-y-2 text-start">
                    <Label className="text-lg font-bold">{t.categoryLabel}</Label>
                    <select 
                      className="w-full h-14 rounded-2xl border-2 border-primary/10 bg-background px-4 text-start focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
                      value={formData.category}
                      onChange={e => setFormData({...formData, category: e.target.value})}
                    >
                      <option value="" disabled>{t.chooseCategory}</option>
                      {categories?.map((c: any) => <option key={c.id} value={c.slug}>{lang === 'ar' ? c.nameAr : (c.nameEn || getTranslatedCategory(c.nameAr))}</option>)}
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <ImageUpload 
                    folder="products"
                    initialUrl={formData.imageUrl}
                    onUploadComplete={(url) => setFormData(prev => ({ ...prev, imageUrl: url }))}
                    label={t.imageLabel}
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold flex items-center gap-2">
                      <span className="w-1.5 h-6 bg-[#D4AF37] rounded-full" />
                      {lang === 'ar' ? 'الوصف' : 'Description'}
                    </h3>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm" 
                      onClick={handleAiDescription}
                      disabled={aiLoading}
                      className="rounded-full gap-2 h-10 px-4 border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37]/10"
                    >
                      {aiLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                      {t.generateAiDescription}
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2 text-start">
                      <Label className="font-bold opacity-70">{t.descriptionLabel}</Label>
                      <textarea 
                        value={formData.description} 
                        onChange={e => setFormData({...formData, description: e.target.value})}
                        placeholder="اكتب وصفاً جذاباً بالعربية..." 
                        className="flex min-h-[140px] w-full rounded-2xl border-2 border-primary/10 bg-background px-4 py-3 text-start focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
                      />
                    </div>
                    <div className="space-y-2 text-start">
                      <Label className="font-bold opacity-70">{t.descriptionEnLabel}</Label>
                      <textarea 
                        value={formData.descriptionEn} 
                        onChange={e => setFormData({...formData, descriptionEn: e.target.value})}
                        placeholder="Write a compelling description in English..." 
                        className="flex min-h-[140px] w-full rounded-2xl border-2 border-primary/10 bg-background px-4 py-3 text-start focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    <span className="w-1.5 h-6 bg-[#D4AF37] rounded-full" />
                    {lang === 'ar' ? 'تفاصيل إضافية' : 'Technical Specifications'}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2 text-start">
                      <Label className="font-bold opacity-70">المواصفات (AR)</Label>
                      <textarea 
                        value={formData.details} 
                        onChange={e => setFormData({...formData, details: e.target.value})}
                        placeholder="مثال: الوزن، الأبعاد، المكونات..." 
                        className="flex min-h-[120px] w-full rounded-2xl border-2 border-primary/10 bg-background px-4 py-3 text-start focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
                      />
                    </div>
                    <div className="space-y-2 text-start">
                      <Label className="font-bold opacity-70">Specifications (EN)</Label>
                      <textarea 
                        value={formData.detailsEn} 
                        onChange={e => setFormData({...formData, detailsEn: e.target.value})}
                        placeholder="Ex: Weight, Dimensions, Ingredients..." 
                        className="flex min-h-[120px] w-full rounded-2xl border-2 border-primary/10 bg-background px-4 py-3 text-start focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
                      />
                    </div>
                  </div>
                </div>
              </div>
              <DialogFooter className="pt-4 border-t">
                <Button 
                  onClick={saveProduct} 
                  disabled={saving} 
                  className="w-full rounded-full h-16 text-xl font-bold bg-[#D4AF37] hover:bg-[#B8962D] shadow-xl transition-all active:scale-95"
                >
                  {saving ? <Loader2 className="h-6 w-6 animate-spin" /> : (isEditing ? t.save : t.save)}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="analytics" className="space-y-8">
        <TabsList className="bg-white p-1 rounded-full shadow-sm border h-16 w-full max-w-2xl mx-auto grid grid-cols-3">
          <TabsTrigger value="analytics" className="rounded-full gap-2 font-bold text-lg h-14 data-[state=active]:bg-primary data-[state=active]:text-white">
            <BarChart3 className="h-5 w-5" /> {lang === 'ar' ? 'التحليلات' : 'Analytics'}
          </TabsTrigger>
          <TabsTrigger value="products" className="rounded-full gap-2 font-bold text-lg h-14 data-[state=active]:bg-primary data-[state=active]:text-white">
            <Package className="h-5 w-5" /> {t.products}
          </TabsTrigger>
          <TabsTrigger value="settings" className="rounded-full gap-2 font-bold text-lg h-14 data-[state=active]:bg-primary data-[state=active]:text-white">
            <Settings className="h-5 w-5" /> {t.settings}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="analytics" className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="rounded-[2rem] border-none shadow-lg bg-white overflow-hidden hover:shadow-xl transition-all">
              <CardHeader className="bg-primary/5 p-6 pb-2">
                <CardTitle className="text-sm font-bold text-muted-foreground flex items-center gap-2 justify-start uppercase tracking-wider">
                  <Calendar className="h-4 w-4 text-primary" /> {lang === 'ar' ? 'آخر 24 ساعة' : 'Last 24 Hours'}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 pt-2 text-start">
                <div className="text-3xl font-black text-primary">${stats?.revenue24h.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                  <ShoppingCart className="h-3 w-3" /> {stats?.orders24h} {t.items}
                </p>
              </CardContent>
            </Card>

            <Card className="rounded-[2rem] border-none shadow-lg bg-white overflow-hidden hover:shadow-xl transition-all">
              <CardHeader className="bg-[#D4AF37]/5 p-6 pb-2">
                <CardTitle className="text-sm font-bold text-muted-foreground flex items-center gap-2 justify-start uppercase tracking-wider">
                  <TrendingUp className="h-4 w-4 text-[#D4AF37]" /> {lang === 'ar' ? 'آخر 7 أيام' : 'Last 7 Days'}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 pt-2 text-start">
                <div className="text-3xl font-black text-[#D4AF37]">${stats?.revenue7d.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                  <ShoppingCart className="h-3 w-3" /> {stats?.orders7d} {t.items}
                </p>
              </CardContent>
            </Card>

            <Card className="rounded-[2rem] border-none shadow-lg bg-white overflow-hidden hover:shadow-xl transition-all">
              <CardHeader className="bg-blue-500/5 p-6 pb-2">
                <CardTitle className="text-sm font-bold text-muted-foreground flex items-center gap-2 justify-start uppercase tracking-wider">
                  <BarChart3 className="h-4 w-4 text-blue-500" /> {lang === 'ar' ? 'آخر 30 يوم' : 'Last 30 Days'}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 pt-2 text-start">
                <div className="text-3xl font-black text-blue-500">${stats?.revenue30d.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                  <ShoppingCart className="h-3 w-3" /> {stats?.orders30d} {t.items}
                </p>
              </CardContent>
            </Card>

            <Card className="rounded-[2rem] border-none shadow-lg bg-white overflow-hidden hover:shadow-xl transition-all">
              <CardHeader className="bg-green-500/5 p-6 pb-2">
                <CardTitle className="text-sm font-bold text-muted-foreground flex items-center gap-2 justify-start uppercase tracking-wider">
                  <DollarSign className="h-4 w-4 text-green-500" /> {lang === 'ar' ? 'إجمالي الأرباح' : 'Total Revenue'}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 pt-2 text-start">
                <div className="text-3xl font-black text-green-500">${stats?.totalRevenue.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {lang === 'ar' ? 'إجمالي الطلبات:' : 'Total Orders:'} {stats?.totalOrders}
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="rounded-[2.5rem] border-none shadow-xl bg-white overflow-hidden">
              <CardHeader className="bg-primary/5 p-8 border-b">
                <CardTitle className="text-2xl font-bold font-headline text-start flex items-center gap-2">
                  <ArrowUpRight className="h-6 w-6 text-primary" />
                  {lang === 'ar' ? 'الأكثر مبيعاً' : 'Top Selling Products'}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y">
                  {stats?.topSelling.map((prod: any, idx: number) => (
                    <div key={idx} className="p-6 flex items-center justify-between hover:bg-muted/30 transition-colors">
                      <div className="text-start">
                        <div className="font-bold text-lg">{prod.name}</div>
                        <div className="text-sm text-muted-foreground">{prod.count} {lang === 'ar' ? 'مبيعات' : 'Sales'}</div>
                      </div>
                      <div className="text-xl font-black text-primary">${prod.revenue.toFixed(2)}</div>
                    </div>
                  ))}
                  {(!stats || stats.topSelling.length === 0) && (
                    <div className="p-12 text-center text-muted-foreground">
                      {lang === 'ar' ? 'لا توجد بيانات مبيعات بعد' : 'No sales data yet'}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card className="rounded-[2.5rem] border-none shadow-xl bg-white overflow-hidden h-full">
                <CardHeader className="bg-[#D4AF37]/5 p-8 border-b">
                  <CardTitle className="text-2xl font-bold font-headline text-start flex items-center gap-2">
                    <Sparkles className="h-6 w-6 text-[#D4AF37]" />
                    {lang === 'ar' ? 'رؤى ذكية' : 'Smart Insights'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8 space-y-6">
                  <div className="flex items-center justify-between bg-muted/30 p-6 rounded-[1.5rem] border border-dashed">
                    <div className="text-start">
                      <p className="text-sm font-bold text-muted-foreground uppercase">{lang === 'ar' ? 'متوسط قيمة الطلب' : 'Average Order Value'}</p>
                      <p className="text-3xl font-black text-primary">${stats?.avgOrderValue.toFixed(2)}</p>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <TrendingUp className="h-6 w-6 text-primary" />
                    </div>
                  </div>

                  <div className="space-y-4 text-start">
                    <h4 className="font-bold flex items-center gap-2">
                      <PackageSearch className="h-5 w-5 text-[#D4AF37]" />
                      {lang === 'ar' ? 'تنبيهات المخزون' : 'Inventory Alerts'}
                    </h4>
                    {stats?.lowStock && stats.lowStock.length > 0 ? (
                      <div className="space-y-2">
                        {stats.lowStock.map((p: any) => (
                          <div key={p.id} className="flex items-center justify-between p-3 bg-destructive/5 rounded-xl border border-destructive/10">
                            <span className="font-medium text-sm truncate max-w-[200px]">{p.name}</span>
                            <div className="flex items-center gap-2">
                              <Badge variant="destructive" className="rounded-full">{lang === 'ar' ? 'منخفض:' : 'Low:'} {p.stock}</Badge>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="h-7 px-2 text-[10px] rounded-full border-[#D4AF37] text-[#D4AF37]"
                                onClick={() => {
                                  setIsEditing(p.id);
                                  setFormData({
                                    name: p.name,
                                    nameEn: p.nameEn || '',
                                    price: p.price.toString(),
                                    discountPercentage: p.discountPercentage?.toString() || '0',
                                    category: p.category,
                                    imageUrl: p.imageUrl,
                                    description: p.description || '',
                                    descriptionEn: p.descriptionEn || '',
                                    details: p.details || '',
                                    detailsEn: p.detailsEn || '',
                                    stock: p.stock?.toString() || '',
                                  });
                                }}
                              >
                                {lang === 'ar' ? 'تزويد' : 'Restock'}
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 bg-green-500/5 rounded-xl border border-green-500/10 text-green-600 text-sm font-medium">
                        {lang === 'ar' ? 'جميع المنتجات متوفرة بشكل جيد.' : 'All products are well stocked.'}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="products">
          <Card className="rounded-[2.5rem] overflow-hidden border-none shadow-xl bg-white">
            <CardHeader className="bg-primary/5 p-8 border-b space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <CardTitle className="text-2xl font-bold font-headline text-start">{t.productList}</CardTitle>
                
                <div className="relative w-full md:w-80 group">
                  <Search className="absolute start-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-[#D4AF37] transition-colors" />
                  <input
                    type="text"
                    placeholder={lang === 'ar' ? 'ابحث عن منتج...' : 'Search for a product...'}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full h-12 ps-12 pe-12 rounded-full border-2 border-primary/10 bg-background text-sm focus:outline-none focus:border-[#D4AF37] transition-all"
                  />
                  {searchTerm && (
                    <button 
                      onClick={() => setSearchTerm('')}
                      className="absolute end-4 top-1/2 -translate-y-1/2 h-8 w-8 flex items-center justify-center text-muted-foreground hover:text-primary transition-colors"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {productsLoading ? (
                <div className="py-20 flex justify-center"><Loader2 className="h-10 w-10 animate-spin text-primary/40" /></div>
              ) : filteredProducts && filteredProducts.length > 0 ? (
                <Table>
                  <TableHeader className="bg-muted/30">
                    <TableRow>
                      <TableHead className="text-start py-6">{t.imageLabel}</TableHead>
                      <TableHead className="text-start">{t.productName}</TableHead>
                      <TableHead className="text-start">{t.categoryLabel}</TableHead>
                      <TableHead className="text-start">{t.priceLabel}</TableHead>
                      <TableHead className="text-center">{t.actions}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProducts.map((product: any) => (
                      <TableRow key={product.id} className={`hover:bg-primary/5 transition-colors ${product.isHidden ? 'opacity-60 grayscale-[0.5]' : ''}`}>
                        <TableCell>
                          <div className="h-16 w-16 rounded-2xl overflow-hidden bg-muted border">
                            <img 
                              src={product.imageUrl || PLACEHOLDER_IMAGE} 
                              alt={product.name} 
                              className="h-full w-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = PLACEHOLDER_IMAGE;
                              }}
                            />
                          </div>
                        </TableCell>
                        <TableCell className="font-bold text-start">
                          <div className="flex flex-col">
                            <span>{lang === 'ar' ? product.name : (product.nameEn || product.name)}</span>
                            <div className="flex gap-2 mt-1">
                              {product.isHidden && <Badge variant="secondary" className="w-fit text-[10px]">{t.hidden}</Badge>}
                              {product.discountPercentage > 0 && (
                                <Badge className="w-fit text-[10px] bg-primary text-white">-{product.discountPercentage}%</Badge>
                              )}
                              <Badge 
                                variant={parseInt(product.stock) === 0 ? "destructive" : parseInt(product.stock) < 5 ? "secondary" : "outline"} 
                                className="w-fit text-[10px]"
                              >
                                {lang === 'ar' ? 'المخزون:' : 'Stock:'} {product.stock || 0}
                              </Badge>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-start">
                          {lang === 'ar' ? product.categoryName : (product.categoryNameEn || getTranslatedCategory(product.categoryName))}
                        </TableCell>
                        <TableCell className="text-start">
                          <div className="flex flex-col">
                            {product.discountPercentage > 0 ? (
                              <>
                                <span className="font-bold text-primary">${(product.price * (1 - product.discountPercentage / 100)).toFixed(2)}</span>
                                <span className="text-xs text-muted-foreground line-through">${product.price.toFixed(2)}</span>
                              </>
                            ) : (
                              <span className="font-bold text-primary">${product.price?.toFixed(2)}</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-center gap-2">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className={`rounded-full ${product.isHidden ? 'text-muted-foreground' : 'text-primary'} hover:bg-primary/10`}
                              onClick={() => toggleVisibility(product.id, !!product.isHidden)}
                              disabled={togglingId === product.id}
                            >
                              {togglingId === product.id ? <Loader2 className="h-5 w-5 animate-spin" /> : (product.isHidden ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />)}
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="rounded-full text-[#D4AF37] hover:bg-[#D4AF37]/10"
                              onClick={() => {
                                setIsEditing(product.id);
                                setFormData({
                                  name: product.name,
                                  nameEn: product.nameEn || '',
                                  price: product.price.toString(),
                                  discountPercentage: product.discountPercentage?.toString() || '0',
                                  category: product.category,
                                  imageUrl: product.imageUrl,
                                  description: product.description || '',
                                  descriptionEn: product.descriptionEn || '',
                                  details: product.details || '',
                                  detailsEn: product.detailsEn || '',
                                  stock: product.stock?.toString() || '0',
                                });
                              }}
                            >
                              <Edit className="h-5 w-5" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              disabled={deletingId === product.id}
                              className="rounded-full text-destructive hover:bg-destructive/10"
                              onClick={() => deleteProduct(product.id)}
                            >
                              {deletingId === product.id ? <Loader2 className="h-5 w-5 animate-spin" /> : <Trash2 className="h-5 w-5" />}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="py-20 text-center text-muted-foreground">
                  <PackageSearch className="h-12 w-12 mx-auto mb-4 opacity-20" />
                  {searchTerm ? (lang === 'ar' ? 'لا توجد نتائج مطابقة لبحثك.' : 'No matching results found.') : t.noProductsFound}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card className="rounded-[2.5rem] overflow-hidden border-none shadow-xl bg-white">
            <CardHeader className="bg-primary/5 p-8 border-b">
              <CardTitle className="text-2xl font-bold font-headline text-start">{t.siteSettings}</CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
              <div className="space-y-4">
                <ImageUpload 
                  folder="siteSettings/hero"
                  initialUrl={heroUrl}
                  onUploadComplete={(url) => setHeroUrl(url)}
                  label={t.heroBannerImage}
                />
                <div className="flex justify-end pt-4">
                  <Button onClick={updateHero} className="rounded-full h-14 px-10 gap-2 font-bold shadow-xl bg-[#D4AF37] hover:bg-[#B8962D] transition-all hover:scale-105">
                    <Save className="h-5 w-5" /> {t.saveChanges}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
