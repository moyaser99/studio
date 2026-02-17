
'use client';

import React, { useState, useEffect } from 'react';
import { useFirestore, useCollection, useUser, useDoc, useAuth } from '@/firebase';
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
  AlertTriangle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { generateProductDescription } from '@/ai/flows/generate-product-description-flow';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useMemoFirebase } from '@/firebase/use-memo-firebase';
import Link from 'next/link';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { useTranslation } from '@/hooks/use-translation';

const ADMIN_EMAIL = 'mohammad.dd.my@gmail.com';
const ADMIN_PHONE = '+962780334074';
const PLACEHOLDER_IMAGE = 'https://picsum.photos/seed/placeholder/200/200';

export default function AdminPage() {
  const db = useFirestore();
  const auth = useAuth();
  const { user, loading: authLoading } = useUser();
  const { toast } = useToast();
  const { lang, t } = useTranslation();
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    nameEn: '',
    price: '',
    category: '',
    imageUrl: '',
    description: '',
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

  const isAdmin = user?.email === ADMIN_EMAIL || user?.phoneNumber === ADMIN_PHONE;

  if (authLoading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="h-10 w-10 animate-spin text-primary" />
    </div>
  );

  if (!isAdmin && !authLoading) {
    return (
      <div className="min-h-screen flex flex-col" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
        <Header />
        <main className="flex-1 flex items-center justify-center bg-muted/20">
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
        </main>
        <Footer />
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
      setFormData(prev => ({ ...prev, description: res.description }));
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
      categoryName,
      categoryNameEn,
      updatedAt: serverTimestamp(),
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
    setFormData({ name: '', nameEn: '', price: '', category: categories?.[0]?.slug || '', imageUrl: '', description: '' });
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
    <div className="min-h-screen flex flex-col bg-muted/10 transition-all duration-300" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <Header />
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-6">
          <div className="text-start">
            <h1 className="text-4xl font-black font-headline text-primary flex items-center gap-3">
              <LayoutDashboard className="h-10 w-10" /> {t.adminDashboard}
            </h1>
          </div>
          
          <div className="flex gap-4">
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
              <DialogContent className="max-w-2xl rounded-3xl overflow-y-auto max-h-[90vh]" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold font-headline text-start">
                    {isEditing ? t.editProduct : t.addNewProduct}
                  </DialogTitle>
                </DialogHeader>
                <div className="grid gap-6 py-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2 text-start">
                      <Label>{t.productNameLabel}</Label>
                      <input 
                        value={formData.name} 
                        onChange={e => setFormData({...formData, name: e.target.value})}
                        placeholder="Ex: Luxury Cream" 
                        className="flex h-12 w-full rounded-xl border border-input bg-background px-4 text-start focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      />
                    </div>
                    <div className="space-y-2 text-start">
                      <Label>{t.productNameEnLabel}</Label>
                      <input 
                        value={formData.nameEn} 
                        onChange={e => setFormData({...formData, nameEn: e.target.value})}
                        placeholder="Ex: Luxury Cream" 
                        className="flex h-12 w-full rounded-xl border border-input bg-background px-4 text-start focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2 text-start">
                      <Label>{t.productPrice}</Label>
                      <input 
                        type="number"
                        value={formData.price} 
                        onChange={e => setFormData({...formData, price: e.target.value})}
                        placeholder="0.00" 
                        className="flex h-12 w-full rounded-xl border border-input bg-background px-4 text-start focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      />
                    </div>
                    <div className="space-y-2 text-start">
                      <Label>{t.categoryLabel}</Label>
                      <select 
                        className="w-full h-12 rounded-xl border border-input bg-background px-4 text-start focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        value={formData.category}
                        onChange={e => setFormData({...formData, category: e.target.value})}
                      >
                        <option value="" disabled>{t.chooseCategory}</option>
                        {categories?.map((c: any) => <option key={c.id} value={c.slug}>{lang === 'ar' ? c.nameAr : (c.nameEn || c.slug)}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="space-y-2 text-start">
                    <Label>{t.imageLabel}</Label>
                    <input 
                      value={formData.imageUrl} 
                      onChange={e => setFormData({...formData, imageUrl: e.target.value})}
                      placeholder="https://..." 
                      className="flex h-12 w-full rounded-xl border border-input bg-background px-4 text-start focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    />
                  </div>
                  <div className="space-y-2 text-start">
                    <div className="flex items-center justify-between">
                      <Label>{t.descriptionLabel}</Label>
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm" 
                        onClick={handleAiDescription}
                        disabled={aiLoading}
                        className="rounded-full gap-2 h-10 px-4"
                      >
                        {aiLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : t.generateAiDescription}
                      </Button>
                    </div>
                    <textarea 
                      value={formData.description} 
                      onChange={e => setFormData({...formData, description: e.target.value})}
                      placeholder="Write a compelling description..." 
                      className="flex min-h-[140px] w-full rounded-2xl border border-input bg-background px-4 py-3 text-start focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={saveProduct} disabled={saving} className="w-full rounded-full h-14 text-lg font-bold bg-[#D4AF37] hover:bg-[#B8962D] shadow-lg">
                    {saving ? <Loader2 className="h-6 w-6 animate-spin" /> : (isEditing ? t.save : t.save)}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Tabs defaultValue="products" className="space-y-8">
          <TabsList className="bg-white p-1 rounded-full shadow-sm border h-16 w-full max-w-md mx-auto grid grid-cols-2">
            <TabsTrigger value="products" className="rounded-full gap-2 font-bold text-lg h-14 data-[state=active]:bg-primary data-[state=active]:text-white">
              <Package className="h-5 w-5" /> {t.products}
            </TabsTrigger>
            <TabsTrigger value="settings" className="rounded-full gap-2 font-bold text-lg h-14 data-[state=active]:bg-primary data-[state=active]:text-white">
              <Settings className="h-5 w-5" /> {t.settings}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="products">
            <Card className="rounded-[2.5rem] overflow-hidden border-none shadow-xl bg-white">
              <CardHeader className="bg-primary/5 p-8 border-b">
                <CardTitle className="text-2xl font-bold font-headline text-start">{t.productList}</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {productsLoading ? (
                  <div className="py-20 flex justify-center"><Loader2 className="h-10 w-10 animate-spin text-primary/40" /></div>
                ) : products && products.length > 0 ? (
                  <Table>
                    <TableHeader className="bg-muted/30">
                      <TableRow>
                        <TableHead className="text-start py-6">{t.imageLabel}</TableHead>
                        <TableHead className="text-start">{t.productName}</TableHead>
                        <TableHead className="text-start">{t.priceLabel}</TableHead>
                        <TableHead className="text-center">{t.actions}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {products.map((product: any) => (
                        <TableRow key={product.id} className="hover:bg-primary/5 transition-colors">
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
                            {lang === 'ar' ? product.name : (product.nameEn || product.name)}
                          </TableCell>
                          <TableCell className="font-bold text-primary text-start">${product.price?.toFixed(2)}</TableCell>
                          <TableCell>
                            <div className="flex justify-center gap-2">
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
                  <div className="py-20 text-center text-muted-foreground">{t.noProductsFound}</div>
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
                  <div className="flex items-center gap-3 text-xl font-bold justify-start">
                    <ImageIcon className="h-6 w-6 text-primary" /> {t.heroBannerImage}
                  </div>
                  <div className="grid gap-6 md:grid-cols-2 items-end">
                    <div className="space-y-2 text-start">
                      <Label>{t.productImage}</Label>
                      <input 
                        placeholder="https://..." 
                        value={heroUrl}
                        onChange={e => setHeroUrl(e.target.value)}
                        className="flex h-12 w-full rounded-2xl border border-input bg-background px-4 text-start focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      />
                    </div>
                    <Button onClick={updateHero} className="rounded-full h-12 gap-2 font-bold shadow-md bg-[#D4AF37] hover:bg-[#B8962D]">
                      <Save className="h-5 w-5" /> {t.saveChanges}
                    </Button>
                  </div>
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
