
'use client';

import { useState } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, PlusCircle, ShoppingCart } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CATEGORIES } from '@/lib/data';
import { useFirestore } from '@/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export default function AdminPage() {
  const db = useFirestore();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: '',
    imageUrl: '',
  });

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
      description: '', // Optional: can be added back if needed
      createdAt: serverTimestamp(),
    };

    // Mutation without await as per guidelines
    addDoc(collection(db, 'products'), productData)
      .then(() => {
        toast({ title: "تم بنجاح", description: "تمت إضافة المنتج إلى المتجر بنجاح." });
        setFormData({
          name: '',
          category: '',
          price: '',
          imageUrl: '',
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

  return (
    <div className="flex min-h-screen flex-col bg-muted/20" dir="rtl">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-12 md:px-6">
        <div className="mb-10 text-right">
          <h1 className="text-4xl font-bold font-headline text-foreground">لوحة التحكم</h1>
          <p className="text-muted-foreground mt-2">إدارة متجر YourGroceriesUSA وإضافة المنتجات.</p>
        </div>

        <Tabs defaultValue="add" className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-10 bg-white border p-1 rounded-full shadow-sm">
            <TabsTrigger value="add" className="rounded-full py-2 data-[state=active]:bg-primary data-[state=active]:text-white transition-all">
              إضافة منتج
            </TabsTrigger>
            <TabsTrigger value="orders" className="rounded-full py-2 data-[state=active]:bg-primary data-[state=active]:text-white transition-all">
              الطلبات
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="add">
            <Card className="max-w-2xl mx-auto border-none shadow-2xl rounded-3xl overflow-hidden bg-white">
              <CardHeader className="bg-primary/5 border-b border-primary/10 py-8">
                <CardTitle className="text-right text-2xl">إضافة منتج جديد</CardTitle>
                <CardDescription className="text-right">أدخل بيانات المنتج ليتم عرضه فوراً في المتجر.</CardDescription>
              </CardHeader>
              <CardContent className="p-10">
                <form onSubmit={handleAddProduct} className="space-y-8">
                  <div className="space-y-3 text-right">
                    <Label htmlFor="name" className="text-base font-semibold">اسم المنتج</Label>
                    <Input
                      id="name"
                      placeholder="مثال: كريم الورد المرطب"
                      required
                      className="rounded-full h-14 px-8 text-right bg-muted/30 border-none focus-visible:ring-primary/30"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3 text-right">
                      <Label htmlFor="price" className="text-base font-semibold">السعر ($)</Label>
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        required
                        className="rounded-full h-14 px-8 text-right bg-muted/30 border-none focus-visible:ring-primary/30"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      />
                    </div>
                    <div className="space-y-3 text-right">
                      <Label htmlFor="category" className="text-base font-semibold">القسم</Label>
                      <Select 
                        value={formData.category} 
                        onValueChange={(value) => setFormData({ ...formData, category: value })}
                      >
                        <SelectTrigger className="rounded-full h-14 px-8 text-right bg-muted/30 border-none focus-visible:ring-primary/30">
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

                  <div className="space-y-3 text-right">
                    <Label htmlFor="image" className="text-base font-semibold">رابط الصورة</Label>
                    <Input
                      id="image"
                      placeholder="https://images.unsplash.com/..."
                      required
                      className="rounded-full h-14 px-8 text-right bg-muted/30 border-none focus-visible:ring-primary/30"
                      value={formData.imageUrl}
                      onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    />
                  </div>

                  <Button 
                    disabled={saving} 
                    type="submit" 
                    className="w-full h-16 text-xl font-bold rounded-full bg-primary hover:bg-primary/90 text-white shadow-xl transition-all active:scale-[0.98] mt-4"
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
          
          <TabsContent value="orders">
            <Card className="border-none shadow-xl rounded-3xl p-20 text-center bg-white">
              <ShoppingCart className="h-20 w-20 mx-auto mb-6 text-primary/20" />
              <h3 className="text-2xl font-bold mb-3 text-foreground">لا توجد طلبات بعد</h3>
              <p className="text-muted-foreground text-lg">بمجرد قيام العملاء بالطلب عبر واتساب، ستتمكن من تتبع المبيعات هنا.</p>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
}
