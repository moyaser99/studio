'use client';

import { useState } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, PlusCircle, Trash2, LogIn, Package } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { CATEGORIES } from '@/lib/data';
import { useFirestore, useUser, useAuth, useCollection } from '@/firebase';
import { collection, addDoc, serverTimestamp, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { useMemoFirebase } from '@/firebase/use-memo-firebase';
import Image from 'next/image';

export default function AdminPage() {
  const db = useFirestore();
  const auth = useAuth();
  const { user, loading: authLoading } = useUser();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: '',
    imageUrl: '',
    description: '',
  });

  // Fetch all products for management
  const productsQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, 'products'), orderBy('createdAt', 'desc'));
  }, [db]);

  const { data: products, loading: productsLoading } = useCollection(productsQuery);

  const handleLogin = async () => {
    if (!auth) return;
    try {
      await signInWithPopup(auth, new GoogleAuthProvider());
    } catch (error) {
      toast({ variant: 'destructive', title: 'خطأ في تسجيل الدخول', description: 'لم نتمكن من تسجيل دخولك.' });
    }
  };

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!db) return;
    
    setSaving(true);
    const categoryObj = CATEGORIES.find(c => c.slug === formData.category);
    
    const productData = {
      name: formData.name,
      category: formData.category,
      categoryName: categoryObj?.name || formData.category,
      price: parseFloat(formData.price),
      imageUrl: formData.imageUrl,
      description: formData.description,
      createdAt: serverTimestamp(),
    };

    addDoc(collection(db, 'products'), productData)
      .then(() => {
        toast({ title: "تم بنجاح", description: "تمت إضافة المنتج بنجاح." });
        setFormData({
          name: '',
          category: '',
          price: '',
          imageUrl: '',
          description: '',
        });
      })
      .catch(async (error) => {
        const permissionError = new FirestorePermissionError({
          path: 'products',
          operation: 'create',
          requestResourceData: productData,
        });
        errorEmitter.emit('permission-error', permissionError);
      })
      .finally(() => setSaving(false));
  };

  const handleDeleteProduct = (id: string) => {
    if (!db) return;
    if (!confirm('هل أنت متأكد من حذف هذا المنتج؟')) return;

    deleteDoc(doc(db, 'products', id))
      .then(() => {
        toast({ title: "تم الحذف", description: "تم حذف المنتج بنجاح." });
      })
      .catch(async (error) => {
        const permissionError = new FirestorePermissionError({
          path: `products/${id}`,
          operation: 'delete',
        });
        errorEmitter.emit('permission-error', permissionError);
      });
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/20">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col bg-muted/20" dir="rtl">
        <Header />
        <main className="flex-1 flex items-center justify-center p-6">
          <Card className="max-w-md w-full text-center p-12 space-y-8 rounded-3xl shadow-2xl bg-white border-none">
            <div className="bg-primary/10 w-24 h-24 rounded-full flex items-center justify-center mx-auto">
              <Package className="h-12 w-12 text-primary" />
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-bold">لوحة تحكم المشرف</h1>
              <p className="text-muted-foreground">يرجى تسجيل الدخول للوصول إلى أدوات الإدارة.</p>
            </div>
            <Button onClick={handleLogin} className="w-full h-14 text-lg font-bold rounded-full gap-3 bg-primary hover:bg-primary/90 text-white shadow-lg">
              <LogIn className="h-6 w-6" /> تسجيل الدخول بواسطة Google
            </Button>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-muted/20" dir="rtl">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-12 md:px-6">
        <div className="mb-10 text-right flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold font-headline text-foreground">لوحة التحكم</h1>
            <p className="text-muted-foreground mt-2">إدارة متجر YourGroceriesUSA.</p>
          </div>
          <div className="flex items-center gap-3 bg-white px-6 py-3 rounded-full shadow-sm border">
            <div className="text-right">
              <p className="text-sm font-bold">{user.displayName}</p>
              <p className="text-xs text-muted-foreground">{user.email}</p>
            </div>
            {user.photoURL && (
              <Image src={user.photoURL} alt="Profile" width={40} height={40} className="rounded-full" />
            )}
          </div>
        </div>

        <Tabs defaultValue="manage" className="w-full">
          <TabsList className="grid w-full max-w-lg mx-auto grid-cols-2 mb-10 bg-white border p-1 rounded-full shadow-sm">
            <TabsTrigger value="manage" className="rounded-full py-2 data-[state=active]:bg-primary data-[state=active]:text-white transition-all">
              إدارة المنتجات
            </TabsTrigger>
            <TabsTrigger value="add" className="rounded-full py-2 data-[state=active]:bg-primary data-[state=active]:text-white transition-all">
              إضافة منتج
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="add">
            <Card className="max-w-2xl mx-auto border-none shadow-2xl rounded-3xl overflow-hidden bg-white">
              <CardHeader className="bg-primary/5 border-b border-primary/10 py-8">
                <CardTitle className="text-right text-2xl">إضافة منتج جديد</CardTitle>
                <CardDescription className="text-right">أدخل بيانات المنتج ليتم عرضه فوراً في المتجر.</CardDescription>
              </CardHeader>
              <CardContent className="p-10">
                <form onSubmit={handleAddProduct} className="space-y-6">
                  <div className="space-y-2 text-right">
                    <Label htmlFor="name" className="text-base font-semibold">اسم المنتج</Label>
                    <Input
                      id="name"
                      placeholder="مثال: كريم الورد المرطب"
                      required
                      className="rounded-2xl h-12 px-6 text-right bg-muted/30 border-none"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2 text-right">
                      <Label htmlFor="price" className="text-base font-semibold">السعر ($)</Label>
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        required
                        className="rounded-2xl h-12 px-6 text-right bg-muted/30 border-none"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2 text-right">
                      <Label htmlFor="category" className="text-base font-semibold">القسم</Label>
                      <Select 
                        value={formData.category} 
                        onValueChange={(value) => setFormData({ ...formData, category: value })}
                      >
                        <SelectTrigger className="rounded-2xl h-12 px-6 text-right bg-muted/30 border-none">
                          <SelectValue placeholder="اختر القسم" />
                        </SelectTrigger>
                        <SelectContent>
                          {CATEGORIES.map(cat => (
                            <SelectItem key={cat.id} value={cat.slug}>{cat.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2 text-right">
                    <Label htmlFor="image" className="text-base font-semibold">رابط الصورة (https)</Label>
                    <Input
                      id="image"
                      placeholder="https://..."
                      required
                      className="rounded-2xl h-12 px-6 text-right bg-muted/30 border-none"
                      value={formData.imageUrl}
                      onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2 text-right">
                    <Label htmlFor="description" className="text-base font-semibold">الوصف</Label>
                    <Textarea
                      id="description"
                      placeholder="اكتب وصفاً جذاباً للمنتج..."
                      className="rounded-2xl min-h-[120px] px-6 py-4 text-right bg-muted/30 border-none resize-none"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                  </div>

                  <Button 
                    disabled={saving} 
                    type="submit" 
                    className="w-full h-14 text-xl font-bold rounded-full bg-primary hover:bg-primary/90 text-white shadow-xl transition-all"
                  >
                    {saving ? (
                      <Loader2 className="ml-3 h-6 w-6 animate-spin" />
                    ) : (
                      <PlusCircle className="ml-3 h-6 w-6" />
                    )}
                    حفظ المنتج
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="manage">
            <Card className="border-none shadow-xl rounded-3xl overflow-hidden bg-white">
              <CardHeader className="bg-primary/5 border-b border-primary/10 py-8">
                <CardTitle className="text-right text-2xl">إدارة المنتجات</CardTitle>
                <CardDescription className="text-right">قائمة بجميع المنتجات المضافة للمتجر.</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      <TableHead className="text-right">المنتج</TableHead>
                      <TableHead className="text-right">القسم</TableHead>
                      <TableHead className="text-right">السعر</TableHead>
                      <TableHead className="text-right">الإجراء</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {productsLoading ? (
                      <TableRow>
                        <TableCell colSpan={4} className="h-32 text-center">
                          <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
                        </TableCell>
                      </TableRow>
                    ) : products && products.length > 0 ? (
                      products.map((p: any) => (
                        <TableRow key={p.id}>
                          <TableCell className="text-right font-medium">
                            <div className="flex items-center gap-3">
                              <div className="relative h-10 w-10 rounded-lg overflow-hidden border">
                                <Image src={p.imageUrl} alt={p.name} fill className="object-cover" />
                              </div>
                              <span>{p.name}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right text-muted-foreground">{p.categoryName}</TableCell>
                          <TableCell className="text-right font-bold">${p.price?.toFixed(2)}</TableCell>
                          <TableCell className="text-right">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleDeleteProduct(p.id)}
                              className="text-destructive hover:text-destructive hover:bg-destructive/10 rounded-full"
                            >
                              <Trash2 className="h-4 w-4 ml-1" /> حذف
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="h-32 text-center text-muted-foreground italic">
                          لا توجد منتجات حالياً...
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
}
