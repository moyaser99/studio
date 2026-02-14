
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, PlusCircle, Trash2, LayoutDashboard, Sparkles } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { CATEGORIES } from '@/lib/data';
import { useFirestore, useUser, useCollection } from '@/firebase';
import { collection, addDoc, serverTimestamp, deleteDoc, doc, query, orderBy, limit } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { useMemoFirebase } from '@/firebase/use-memo-firebase';
import { generateProductDescription } from '@/ai/flows/generate-product-description-flow';
import Image from 'next/image';

const ADMIN_EMAIL = 'mohammad.dd.my@gmail.com';

export default function AdminPage() {
  const db = useFirestore();
  const { user, loading: authLoading } = useUser();
  const router = useRouter();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: '',
    imageUrl: '',
    description: '',
  });

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/login');
      } else if (user.email !== ADMIN_EMAIL) {
        router.push('/');
      }
    }
  }, [user, authLoading, router]);

  const productsQuery = useMemoFirebase(() => {
    if (!db) return null;
    // Limit to prevent huge lists from timing out the browser
    return query(collection(db, 'products'), orderBy('createdAt', 'desc'), limit(50));
  }, [db]);

  const { data: products, loading: productsLoading } = useCollection(productsQuery);

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
        setFormData({ name: '', category: '', price: '', imageUrl: '', description: '' });
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

  const handleDeleteProduct = () => {
    if (!db || !deleteId) return;

    deleteDoc(doc(db, 'products', deleteId))
      .then(() => {
        toast({ title: "تم الحذف", description: "تم حذف المنتج بنجاح." });
      })
      .catch(async (error) => {
        const permissionError = new FirestorePermissionError({
          path: `products/${deleteId}`,
          operation: 'delete',
        });
        errorEmitter.emit('permission-error', permissionError);
      })
      .finally(() => setDeleteId(null));
  };

  const handleGenerateDescription = async () => {
    if (!formData.name || !formData.category) {
      toast({ 
        variant: "destructive", 
        title: "بيانات ناقصة", 
        description: "يرجى إدخال اسم المنتج والقسم أولاً." 
      });
      return;
    }

    setIsGenerating(true);
    try {
      const result = await generateProductDescription({
        productName: formData.name,
        category: formData.category,
        keyFeatures: [], // Can be extended to allow tags input
      });
      setFormData(prev => ({ ...prev, description: result.description }));
      toast({ title: "تم التوليد", description: "تم إنشاء وصف المنتج بواسطة الذكاء الاصطناعي." });
    } catch (error) {
      toast({ 
        variant: "destructive", 
        title: "خطأ", 
        description: "فشل توليد الوصف. يرجى المحاولة لاحقاً." 
      });
    } finally {
      setIsGenerating(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || user.email !== ADMIN_EMAIL) return null;

  return (
    <div className="flex min-h-screen flex-col bg-muted/20" dir="rtl">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-12 md:px-6">
        <div className="mb-10 text-right flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold font-headline text-foreground flex items-center gap-3 justify-end">
              لوحة التحكم <LayoutDashboard className="h-8 w-8 text-primary" />
            </h1>
            <p className="text-muted-foreground mt-2">مرحباً بك مجدداً يا مشرف YourGroceriesUSA.</p>
          </div>
        </div>

        <Tabs defaultValue="manage" className="w-full">
          <TabsList className="grid w-full max-w-lg mx-auto grid-cols-2 mb-10 bg-white border p-1 rounded-full shadow-sm">
            <TabsTrigger value="manage" className="rounded-full py-2 data-[state=active]:bg-primary data-[state=active]:text-white transition-all">
              إدارة المخزون
            </TabsTrigger>
            <TabsTrigger value="add" className="rounded-full py-2 data-[state=active]:bg-primary data-[state=active]:text-white transition-all">
              إضافة منتج جديد
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="add">
            <Card className="max-w-2xl mx-auto border-none shadow-2xl rounded-3xl overflow-hidden bg-white">
              <CardHeader className="bg-primary/5 border-b border-primary/10 py-8">
                <CardTitle className="text-right text-2xl">بيانات المنتج</CardTitle>
                <CardDescription className="text-right">أدخل تفاصيل المنتج بدقة ليتم عرضه بشكل احترافي.</CardDescription>
              </CardHeader>
              <CardContent className="p-10">
                <form onSubmit={handleAddProduct} className="space-y-6">
                  <div className="space-y-2 text-right">
                    <Label htmlFor="name" className="text-base font-semibold">اسم المنتج</Label>
                    <Input
                      id="name"
                      placeholder="مثال: ساعة روز جولد فاخرة"
                      required
                      className="rounded-2xl h-12 px-6 text-right border-none bg-muted/30"
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
                        className="rounded-2xl h-12 px-6 text-right border-none bg-muted/30"
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
                        <SelectTrigger className="rounded-2xl h-12 px-6 text-right border-none bg-muted/30">
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
                    <Label htmlFor="image" className="text-base font-semibold">رابط الصورة</Label>
                    <Input
                      id="image"
                      placeholder="https://..."
                      required
                      className="rounded-2xl h-12 px-6 text-right border-none bg-muted/30"
                      value={formData.imageUrl}
                      onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2 text-right">
                    <div className="flex items-center justify-between">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleGenerateDescription}
                        disabled={isGenerating}
                        className="text-primary hover:text-primary/80 flex items-center gap-2"
                      >
                        {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                        توليد بالذكاء الاصطناعي
                      </Button>
                      <Label htmlFor="description" className="text-base font-semibold">وصف المنتج</Label>
                    </div>
                    <Textarea
                      id="description"
                      placeholder="اكتب وصفاً جذاباً أو استخدم مساعد الذكاء الاصطناعي..."
                      className="rounded-2xl min-h-[150px] px-6 py-4 text-right border-none bg-muted/30 resize-none"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                  </div>

                  <Button 
                    disabled={saving} 
                    type="submit" 
                    className="w-full h-14 text-xl font-bold rounded-full bg-primary hover:bg-primary/90 text-white shadow-xl transition-all"
                  >
                    {saving ? <Loader2 className="ml-3 h-6 w-6 animate-spin" /> : <PlusCircle className="ml-3 h-6 w-6" />}
                    حفظ المنتج في المتجر
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="manage">
            <Card className="border-none shadow-xl rounded-3xl overflow-hidden bg-white">
              <CardHeader className="bg-primary/5 border-b border-primary/10 py-8">
                <CardTitle className="text-right text-2xl">المنتجات الحالية</CardTitle>
                <CardDescription className="text-right">مراجعة المخزون وإدارة المعروض.</CardDescription>
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
                              <div className="relative h-12 w-12 rounded-xl overflow-hidden border shadow-sm">
                                <Image 
                                  src={p.imageUrl?.startsWith('http') ? p.imageUrl : 'https://picsum.photos/seed/placeholder/100/100'} 
                                  alt={p.name} 
                                  fill 
                                  className="object-cover" 
                                  unoptimized 
                                />
                              </div>
                              <span className="font-bold">{p.name}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right text-muted-foreground">{p.categoryName}</TableCell>
                          <TableCell className="text-right font-bold text-primary">${p.price?.toFixed(2)}</TableCell>
                          <TableCell className="text-right">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => setDeleteId(p.id)}
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

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent className="rounded-[2rem] text-right" dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>هل أنت متأكد من الحذف؟</AlertDialogTitle>
            <AlertDialogDescription>
              سيتم حذف المنتج نهائياً من المتجر ولا يمكن التراجع عن هذا الإجراء.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row-reverse gap-2">
            <AlertDialogAction 
              onClick={handleDeleteProduct}
              className="bg-destructive hover:bg-destructive/90 rounded-full"
            >
              نعم، احذف
            </AlertDialogAction>
            <AlertDialogCancel className="rounded-full">إلغاء</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
