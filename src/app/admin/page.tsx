'use client';

import { useState } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { generateProductDescription } from '@/ai/flows/generate-product-description-flow';
import { Loader2, Sparkles, LayoutDashboard, ShoppingCart, Settings, Eye } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

export default function AdminPage() {
  const [loading, setLoading] = useState(false);
  const [aiResult, setAiResult] = useState('');
  const [formData, setFormData] = useState({
    productName: '',
    category: '',
    keyFeatures: '',
  });

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await generateProductDescription({
        productName: formData.productName,
        category: formData.category,
        keyFeatures: formData.keyFeatures.split(',').map((f) => f.trim()),
      });
      setAiResult(result.description);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-muted/20">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-12 md:px-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4 text-right">
          <div>
            <h1 className="text-4xl font-bold font-headline text-foreground">لوحة التحكم</h1>
            <p className="text-muted-foreground mt-1">إدارة عمليات YourGroceriesUSA والمخزون.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-2 rounded-full"><LayoutDashboard className="h-4 w-4" /> لوحة القيادة</Button>
            <Button variant="outline" size="sm" className="gap-2 rounded-full"><Settings className="h-4 w-4" /> الإعدادات</Button>
          </div>
        </div>

        <Tabs defaultValue="orders" className="space-y-8" dir="rtl">
          <TabsList className="bg-white border p-1 rounded-full w-full max-w-md mx-auto flex">
            <TabsTrigger value="orders" className="flex-1 gap-2 rounded-full data-[state=active]:bg-primary data-[state=active]:text-white transition-all">
              <ShoppingCart className="h-4 w-4" /> الطلبات
            </TabsTrigger>
            <TabsTrigger value="ai-tool" className="flex-1 gap-2 rounded-full data-[state=active]:bg-primary data-[state=active]:text-white transition-all">
              <Sparkles className="h-4 w-4" /> أدوات الذكاء الاصطناعي
            </TabsTrigger>
          </TabsList>

          <TabsContent value="orders">
            <Card className="border-none shadow-sm overflow-hidden rounded-3xl">
              <CardHeader className="bg-white px-8 pt-8 text-right">
                <CardTitle className="text-2xl font-bold">تاريخ طلبات واتساب</CardTitle>
                <CardDescription>استفسارات الطلبات المستلمة حديثاً من العملاء.</CardDescription>
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
                      <TableHead className="text-left font-bold">الإجراء</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[
                      { id: '#YG-9021', customer: 'سارة ميلر', product: 'سيروم الورد المرطب', amount: '$45.00', status: 'قيد الانتظار', date: '12 مايو 2024' },
                      { id: '#YG-9020', customer: 'أحمد علي', product: 'كريم أساس بلمسة حريرية', amount: '$32.00', status: 'في محادثة', date: '11 مايو 2024' },
                      { id: '#YG-9019', customer: 'إيما ويلسون', product: 'حقيبة يد كلاسيكية', amount: '$120.00', status: 'تم التأكيد', date: '10 مايو 2024' },
                      { id: '#YG-9018', customer: 'ديفيد تشين', product: 'فيتامينات يومية', amount: '$19.99', status: 'مكتمل', date: '09 مايو 2024' },
                    ].map((order) => (
                      <TableRow key={order.id} className="bg-white hover:bg-muted/30 transition-colors">
                        <TableCell className="font-mono text-sm text-muted-foreground text-right">{order.id}</TableCell>
                        <TableCell className="font-medium text-right">{order.customer}</TableCell>
                        <TableCell className="text-right">{order.product}</TableCell>
                        <TableCell className="font-bold text-primary text-right">{order.amount}</TableCell>
                        <TableCell className="text-right">
                          <Badge variant="secondary" className={`
                            ${order.status === 'مكتمل' ? 'bg-green-100 text-green-700' :
                              order.status === 'تم التأكيد' ? 'bg-blue-100 text-blue-700' :
                              order.status === 'في محادثة' ? 'bg-purple-100 text-purple-700' : 'bg-orange-100 text-orange-700'}
                          `}>
                            {order.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-left">
                          <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary/10 hover:text-primary">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ai-tool">
            <div className="grid gap-8 md:grid-cols-2">
              <Card className="border-none shadow-sm rounded-3xl text-right">
                <CardHeader>
                  <CardTitle>مولد وصف المنتجات</CardTitle>
                  <CardDescription>أنشئ نصوصاً تسويقية فاخرة بمساعدة الذكاء الاصطناعي.</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleGenerate} className="space-y-5">
                    <div className="space-y-2">
                      <Label>اسم المنتج</Label>
                      <Input
                        placeholder="مثال: كريم الليل الفاخر بالورد"
                        required
                        className="rounded-full px-5 h-12 text-right"
                        value={formData.productName}
                        onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>القسم</Label>
                      <Input
                        placeholder="مثال: العناية بالبشرة"
                        required
                        className="rounded-full px-5 h-12 text-right"
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>المميزات الأساسية (مفصولة بفاصلة)</Label>
                      <Textarea
                        placeholder="مثال: مضاد للشيخوخة، مرطب، زيوت طبيعية"
                        required
                        className="rounded-3xl p-5 min-h-[120px] text-right"
                        value={formData.keyFeatures}
                        onChange={(e) => setFormData({ ...formData, keyFeatures: e.target.value })}
                      />
                    </div>
                    <Button disabled={loading} type="submit" className="w-full h-12 text-lg rounded-full">
                      {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Sparkles className="mr-2 h-5 w-5" />}
                      توليد النص
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <Card className="border-none shadow-sm bg-secondary/30 rounded-3xl overflow-hidden relative text-right">
                <div className="absolute top-0 left-0 p-8 opacity-10">
                   <Sparkles className="h-32 w-32" />
                </div>
                <CardHeader>
                  <CardTitle>المعاينة والنتيجة</CardTitle>
                  <CardDescription>راجع وانسخ النص المولد أدناه.</CardDescription>
                </CardHeader>
                <CardContent className="h-full">
                  {aiResult ? (
                    <div className="space-y-4">
                      <div className="p-6 bg-white rounded-3xl border border-primary/20 prose prose-pink max-w-none shadow-inner">
                        <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/80 italic">{aiResult}</p>
                      </div>
                      <Button variant="outline" className="w-full rounded-full border-primary text-primary font-bold" onClick={() => navigator.clipboard.writeText(aiResult)}>
                        نسخ النص
                      </Button>
                    </div>
                  ) : (
                    <div className="h-[400px] flex flex-col items-center justify-center border-2 border-dashed border-primary/20 rounded-3xl text-muted-foreground bg-white/50">
                      <Sparkles className="h-12 w-12 mb-4 text-primary/30" />
                      <p className="text-center px-8">املأ النموذج لتوليد أوصاف أنيقة للمنتجات.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
}
