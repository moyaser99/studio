
'use client';

import { useState } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { generateProductDescription } from '@/ai/flows/generate-product-description-flow';
import { Loader2, Sparkles, LayoutDashboard, ShoppingCart, Settings, Eye, PlusCircle } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { CATEGORIES } from '@/lib/data';
import { useFirestore } from '@/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export default function AdminPage() {
  const db = useFirestore();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [aiResult, setAiResult] = useState('');
  
  const [formData, setFormData] = useState({
    productName: '',
    category: '',
    price: '',
    imageUrl: '',
    description: '',
    keyFeatures: '',
  });

  const handleGenerate = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!formData.productName || !formData.category) {
      toast({ variant: "destructive", title: "تنبيه", description: "يرجى إدخال الاسم والقسم أولاً." });
      return;
    }
    setLoading(true);
    try {
      const result = await generateProductDescription({
        productName: formData.productName,
        category: formData.category,
        keyFeatures: formData.keyFeatures.split(',').map((f) => f.trim()),
      });
      setAiResult(result.description);
      setFormData(prev => ({ ...prev, description: result.description }));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db) return;
    
    setSaving(true);
    const categoryObj = CATEGORIES.find(c => c.slug === formData.category);
    
    const productData = {
      name: formData.productName,
      category: formData.category,
      categoryName: categoryObj?.name || formData.category,
      price: parseFloat(formData.price),
      imageUrl: formData.imageUrl,
      description: formData.description,
      createdAt: serverTimestamp(),
    };

    addDoc(collection(db, 'products'), productData)
      .then(() => {
        toast({ title: "تم النجاح", description: "تم إضافة المنتج بنجاح إلى المتجر." });
        setFormData({
          productName: '',
          category: '',
          price: '',
          imageUrl: '',
          description: '',
          keyFeatures: '',
        });
        setAiResult('');
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

  return (
    <div className="flex min-h-screen flex-col bg-muted/20" dir="rtl">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-12 md:px-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4 text-right">
          <div>
            <h1 className="text-4xl font-bold font-headline text-foreground">لوحة التحكم</h1>
            <p className="text-muted-foreground mt-1">إدارة عمليات YourGroceriesUSA والمخزون.</p>
          </div>
        </div>

        <Tabs defaultValue="add-product" className="space-y-8">
          <TabsList className="bg-white border p-1 rounded-full w-full max-w-lg mx-auto flex">
            <TabsTrigger value="add-product" className="flex-1 gap-2 rounded-full data-[state=active]:bg-primary data-[state=active]:text-white transition-all">
              <PlusCircle className="h-4 w-4" /> إضافة منتج
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex-1 gap-2 rounded-full data-[state=active]:bg-primary data-[state=active]:text-white transition-all">
              <ShoppingCart className="h-4 w-4" /> الطلبات
            </TabsTrigger>
          </TabsList>

          <TabsContent value="add-product">
            <div className="grid gap-8 lg:grid-cols-2">
              <Card className="border-none shadow-sm rounded-3xl text-right">
                <CardHeader>
                  <CardTitle>إضافة منتج جديد</CardTitle>
                  <CardDescription>أدخل تفاصيل المنتج ليتم عرضه في المتجر.</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleAddProduct} className="space-y-5">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>اسم المنتج</Label>
                        <Input
                          placeholder="مثال: سيروم الورد"
                          required
                          className="rounded-full px-5 h-12 text-right"
                          value={formData.productName}
                          onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>السعر ($)</Label>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          required
                          className="rounded-full px-5 h-12 text-right"
                          value={formData.price}
                          onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>القسم</Label>
                      <Select 
                        value={formData.category} 
                        onValueChange={(value) => setFormData({ ...formData, category: value })}
                      >
                        <SelectTrigger className="rounded-full h-12 text-right">
                          <SelectValue placeholder="اختر القسم" />
                        </SelectTrigger>
                        <SelectContent>
                          {CATEGORIES.map(cat => (
                            <SelectItem key={cat.id} value={cat.slug}>{cat.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>رابط الصورة</Label>
                      <Input
                        placeholder="https://example.com/image.jpg"
                        required
                        className="rounded-full px-5 h-12 text-right"
                        value={formData.imageUrl}
                        onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center mb-1">
                        <Label>وصف المنتج</Label>
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="sm" 
                          className="text-primary gap-1 h-8 rounded-full"
                          onClick={handleGenerate}
                          disabled={loading}
                        >
                          {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
                          توليد بالذكاء الاصطناعي
                        </Button>
                      </div>
                      <Textarea
                        placeholder="اكتب وصفاً جذاباً أو استخدم الذكاء الاصطناعي..."
                        required
                        className="rounded-3xl p-5 min-h-[120px] text-right"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      />
                    </div>

                    <Button disabled={saving} type="submit" className="w-full h-12 text-lg rounded-full">
                      {saving ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <PlusCircle className="mr-2 h-5 w-5" />}
                      حفظ المنتج
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <Card className="border-none shadow-sm bg-secondary/10 rounded-3xl overflow-hidden relative text-right flex flex-col">
                <CardHeader>
                  <CardTitle>معاينة المنتج</CardTitle>
                  <CardDescription>كيف سيظهر المنتج للعملاء.</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col items-center justify-center p-8">
                  {formData.imageUrl ? (
                    <div className="w-full max-w-[300px] bg-white rounded-3xl overflow-hidden shadow-lg">
                      <div className="aspect-square relative bg-muted">
                        <img src={formData.imageUrl} alt="Preview" className="object-cover w-full h-full" />
                      </div>
                      <div className="p-4 text-right">
                        <Badge className="mb-2">{CATEGORIES.find(c => c.slug === formData.category)?.name || 'القسم'}</Badge>
                        <h3 className="font-bold text-lg">{formData.productName || 'اسم المنتج'}</h3>
                        <p className="text-primary font-bold text-xl">${formData.price || '0.00'}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center text-muted-foreground">
                      <Eye className="h-12 w-12 mx-auto mb-4 opacity-20" />
                      <p>أضف رابط صورة للمعاينة</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="orders">
            <Card className="border-none shadow-sm overflow-hidden rounded-3xl">
              <CardHeader className="bg-white px-8 pt-8 text-right">
                <CardTitle className="text-2xl font-bold">تاريخ الطلبات</CardTitle>
                <CardDescription>إدارة الطلبات المستلمة من العملاء.</CardDescription>
              </CardHeader>
              <CardContent className="px-8 pb-8">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="font-bold text-right">رقم الطلب</TableHead>
                      <TableHead className="font-bold text-right">العميل</TableHead>
                      <TableHead className="font-bold text-right">المنتج</TableHead>
                      <TableHead className="font-bold text-right">السعر</TableHead>
                      <TableHead className="font-bold text-right">الحالة</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                        لا توجد طلبات حقيقية بعد. سيتم ربطها قريباً.
                      </TableCell>
                    </TableRow>
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
