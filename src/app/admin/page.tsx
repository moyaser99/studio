
'use client';

import React, { useState } from 'react';
import { useFirestore, useCollection, useUser, useDoc } from '@/firebase';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  orderBy, 
  serverTimestamp 
} from 'firebase/firestore';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
  Sparkles,
  Image as ImageIcon,
  Save,
  Tags,
  ChevronRight
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { generateProductDescription } from '@/ai/flows/generate-product-description-flow';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useMemoFirebase } from '@/firebase/use-memo-firebase';
import Link from 'next/link';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

const ADMIN_EMAIL = 'mohammad.dd.my@gmail.com';
const ADMIN_PHONE = '+962780334074';

export default function AdminPage() {
  const db = useFirestore();
  const { user, loading: authLoading } = useUser();
  const { toast } = useToast();
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form States
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: '',
    imageUrl: '',
    description: '',
  });

  const [heroUrl, setHeroUrl] = useState('');

  // Queries
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

  const heroRef = useMemoFirebase(() => {
    if (!db) return null;
    return doc(db, 'siteSettings', 'heroSection');
  }, [db]);
  const { data: heroData } = useDoc(heroRef);

  const isAdmin = user?.email === ADMIN_EMAIL || user?.phoneNumber === ADMIN_PHONE;

  if (authLoading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="h-10 w-10 animate-spin text-primary" />
    </div>
  );

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/20">
        <Card className="max-w-md text-center p-8 rounded-3xl">
          <CardTitle className="text-2xl text-destructive mb-4">وصول مرفوض</CardTitle>
          <p className="text-muted-foreground mb-6">ليس لديك الصلاحيات الكافية للوصول لهذه الصفحة.</p>
          <Button onClick={() => window.location.href = '/'} className="rounded-full">العودة للرئيسية</Button>
        </Card>
      </div>
    );
  }

  const handleAiDescription = async () => {
    if (!formData.name) {
      toast({ variant: 'destructive', title: 'خطأ', description: 'يرجى إدخال اسم المنتج أولاً.' });
      return;
    }
    setAiLoading(true);
    try {
      const categoryName = categories?.find((c: any) => c.slug === formData.category)?.nameAr || formData.category;
      const res = await generateProductDescription({
        productName: formData.name,
        category: categoryName,
        keyFeatures: ['منتج حصري', 'جودة عالية', 'مستورد من أمريكا']
      });
      setFormData(prev => ({ ...prev, description: res.description }));
      toast({ title: 'تم التوليد', description: 'تم إنشاء الوصف بواسطة الذكاء الاصطناعي.' });
    } catch (error) {
      toast({ variant: 'destructive', title: 'خطأ', description: 'فشل في توليد الوصف.' });
    } finally {
      setAiLoading(false);
    }
  };

  const saveProduct = () => {
    if (!db) return;
    setSaving(true);
    const categoryName = categories?.find((c: any) => c.slug === formData.category)?.nameAr || '';
    
    const payload: any = {
      ...formData,
      price: parseFloat(formData.price) || 0,
      categoryName,
      updatedAt: serverTimestamp(),
    };

    if (isEditing) {
      const docRef = doc(db, 'products', isEditing);
      updateDoc(docRef, payload)
        .then(() => {
          toast({ title: 'تم التحديث', description: 'تم تحديث المنتج بنجاح.' });
          resetForm();
        })
        .catch(async (err) => {
          errorEmitter.emit('permission-error', new FirestorePermissionError({ path: docRef.path, operation: 'update', requestResourceData: payload }));
        })
        .finally(() => setSaving(false));
    } else {
      payload.createdAt = serverTimestamp();
      addDoc(collection(db, 'products'), payload)
        .then(() => {
          toast({ title: 'تمت الإضافة', description: 'تمت إضافة المنتج الجديد بنجاح.' });
          resetForm();
        })
        .catch(async (err) => {
          errorEmitter.emit('permission-error', new FirestorePermissionError({ path: 'products', operation: 'create', requestResourceData: payload }));
        })
        .finally(() => setSaving(false));
    }
  };

  const deleteProduct = (id: string) => {
    if (!db || !confirm('هل أنت متأكد من حذف هذا المنتج؟')) return;
    const docRef = doc(db, 'products', id);
    deleteDoc(docRef)
      .then(() => {
        toast({ title: 'تم الحذف', description: 'تم إزالة المنتج من المخزون.' });
      })
      .catch(async (err) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({ path: docRef.path, operation: 'delete' }));
      });
  };

  const resetForm = () => {
    setFormData({ name: '', price: '', category: categories?.[0]?.slug || '', imageUrl: '', description: '' });
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
        toast({ title: 'تم التحديث', description: 'تم تغيير صورة الـ Hero Banner بنجاح.' });
      })
      .catch(async (err) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({ path: docRef.path, operation: 'update' }));
      });
  };

  return (
    <div className="min-h-screen flex flex-col bg-muted/10" dir="rtl">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-6">
          <div className="text-right">
            <h1 className="text-4xl font-black font-headline text-primary flex items-center gap-3">
              <LayoutDashboard className="h-10 w-10" /> لوحة التحكم
            </h1>
            <p className="text-muted-foreground mt-2 text-lg">إدارة منتجات YourGroceriesUSA وإعدادات الموقع</p>
          </div>
          
          <div className="flex gap-4">
            <Link href="/admin/categories">
              <Button variant="outline" className="rounded-full h-14 px-8 text-lg font-bold border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37]/10 gap-2">
                <Tags className="h-6 w-6" /> إدارة الأقسام
              </Button>
            </Link>
            <Dialog open={isAdding || !!isEditing} onOpenChange={(val) => !val && resetForm()}>
              <DialogTrigger asChild>
                <Button onClick={() => setIsAdding(true)} className="rounded-full h-14 px-8 text-lg font-bold shadow-lg gap-2 bg-[#D4AF37] hover:bg-[#B8962D]">
                  <Plus className="h-6 w-6" /> إضافة منتج جديد
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl rounded-3xl overflow-y-auto max-h-[90vh]">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold font-headline">
                    {isEditing ? 'تعديل منتج' : 'إضافة منتج جديد'}
                  </DialogTitle>
                </DialogHeader>
                <div className="grid gap-6 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2 text-right">
                      <Label>اسم المنتج</Label>
                      <Input 
                        value={formData.name} 
                        onChange={e => setFormData({...formData, name: e.target.value})}
                        placeholder="مثال: كريم أساس فاخر" 
                        className="rounded-xl"
                      />
                    </div>
                    <div className="space-y-2 text-right">
                      <Label>السعر ($)</Label>
                      <Input 
                        type="number"
                        value={formData.price} 
                        onChange={e => setFormData({...formData, price: e.target.value})}
                        placeholder="0.00" 
                        className="rounded-xl"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2 text-right">
                      <Label>القسم</Label>
                      <select 
                        className="w-full h-10 rounded-xl border border-input bg-background px-3"
                        value={formData.category}
                        onChange={e => setFormData({...formData, category: e.target.value})}
                      >
                        <option value="" disabled>اختر القسم...</option>
                        {categories?.map((c: any) => <option key={c.id} value={c.slug}>{c.nameAr}</option>)}
                      </select>
                    </div>
                    <div className="space-y-2 text-right">
                      <Label>رابط الصورة</Label>
                      <Input 
                        value={formData.imageUrl} 
                        onChange={e => setFormData({...formData, imageUrl: e.target.value})}
                        placeholder="https://..." 
                        className="rounded-xl"
                      />
                    </div>
                  </div>
                  <div className="space-y-2 text-right">
                    <div className="flex items-center justify-between">
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm" 
                        onClick={handleAiDescription}
                        disabled={aiLoading}
                        className="rounded-full gap-2 border-primary/30 text-primary hover:bg-primary/5"
                      >
                        {aiLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
                        توليد الوصف بالذكاء الاصطناعي
                      </Button>
                      <Label>الوصف</Label>
                    </div>
                    <Textarea 
                      value={formData.description} 
                      onChange={e => setFormData({...formData, description: e.target.value})}
                      placeholder="اكتب وصفاً جذاباً للمنتج..." 
                      className="rounded-xl min-h-[120px]"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={saveProduct} disabled={saving} className="w-full rounded-full h-12 text-lg font-bold bg-[#D4AF37] hover:bg-[#B8962D]">
                    {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : (isEditing ? 'حفظ التعديلات' : 'إضافة المنتج للمخزون')}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Tabs defaultValue="products" className="space-y-8">
          <TabsList className="bg-white p-1 rounded-full shadow-sm border h-14 w-full max-w-md mx-auto grid grid-cols-2">
            <TabsTrigger value="products" className="rounded-full gap-2 font-bold text-lg">
              <Package className="h-5 w-5" /> المنتجات
            </TabsTrigger>
            <TabsTrigger value="settings" className="rounded-full gap-2 font-bold text-lg">
              <Settings className="h-5 w-5" /> الإعدادات
            </TabsTrigger>
          </TabsList>

          <TabsContent value="products">
            <Card className="rounded-[2.5rem] overflow-hidden border-none shadow-xl bg-white">
              <CardHeader className="bg-primary/5 p-8 border-b">
                <CardTitle className="text-2xl font-bold font-headline">قائمة المنتجات</CardTitle>
                <CardDescription>إدارة المخزون الحالي للمتجر</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {productsLoading ? (
                  <div className="py-20 flex justify-center"><Loader2 className="h-10 w-10 animate-spin text-primary/40" /></div>
                ) : products && products.length > 0 ? (
                  <Table>
                    <TableHeader className="bg-muted/30">
                      <TableRow>
                        <TableHead className="text-right py-6">الصورة</TableHead>
                        <TableHead className="text-right">الاسم</TableHead>
                        <TableHead className="text-right">القسم</TableHead>
                        <TableHead className="text-right">السعر</TableHead>
                        <TableHead className="text-center">الإجراءات</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {products.map((product: any) => (
                        <TableRow key={product.id} className="hover:bg-primary/5 transition-colors">
                          <TableCell>
                            <div className="h-16 w-16 rounded-2xl overflow-hidden bg-muted">
                              <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" />
                            </div>
                          </TableCell>
                          <TableCell className="font-bold text-lg">{product.name}</TableCell>
                          <TableCell className="text-muted-foreground">{product.categoryName}</TableCell>
                          <TableCell className="font-bold text-primary">${product.price?.toFixed(2)}</TableCell>
                          <TableCell>
                            <div className="flex justify-center gap-2">
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="rounded-full text-[#D4AF37] hover:bg-yellow-50"
                                onClick={() => {
                                  setIsEditing(product.id);
                                  setFormData({
                                    name: product.name,
                                    price: product.price.toString(),
                                    category: product.category,
                                    imageUrl: product.imageUrl,
                                    description: product.description,
                                  });
                                }}
                              >
                                <Edit className="h-5 w-5" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="rounded-full text-destructive hover:bg-destructive/5"
                                onClick={() => deleteProduct(product.id)}
                              >
                                <Trash2 className="h-5 w-5" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="py-20 text-center text-muted-foreground">لا توجد منتجات حالياً.</div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card className="rounded-[2.5rem] overflow-hidden border-none shadow-xl bg-white">
              <CardHeader className="bg-primary/5 p-8 border-b">
                <CardTitle className="text-2xl font-bold font-headline">إعدادات الموقع</CardTitle>
                <CardDescription>تحديث المظهر العام والعناصر الترويجية</CardDescription>
              </CardHeader>
              <CardContent className="p-8 space-y-8">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-xl font-bold">
                    <ImageIcon className="h-6 w-6 text-primary" /> صورة الـ Hero Banner الرئيسية
                  </div>
                  <div className="grid gap-6 md:grid-cols-2 items-end">
                    <div className="space-y-2 text-right">
                      <Label>رابط الصورة الجديدة</Label>
                      <Input 
                        placeholder="https://..." 
                        value={heroUrl}
                        onChange={e => setHeroUrl(e.target.value)}
                        className="rounded-2xl h-12"
                      />
                    </div>
                    <Button onClick={updateHero} className="rounded-full h-12 gap-2 font-bold shadow-md bg-[#D4AF37] hover:bg-[#B8962D]">
                      <Save className="h-5 w-5" /> حفظ الصورة الجديدة
                    </Button>
                  </div>
                  {heroData?.imageUrl && (
                    <div className="mt-6">
                      <Label className="block mb-2 text-muted-foreground">المعاينة الحالية:</Label>
                      <div className="relative aspect-video rounded-[2rem] overflow-hidden border-4 border-white shadow-2xl">
                        <img src={heroData.imageUrl} className="w-full h-full object-cover" alt="Hero Preview" />
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
}
