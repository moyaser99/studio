
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
import { Loader2, Sparkles, LayoutDashboard, ShoppingCart, Settings } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <h1 className="text-3xl font-bold font-headline">Admin Dashboard</h1>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2"><LayoutDashboard className="h-4 w-4" /> Overview</Button>
            <Button variant="outline" className="gap-2"><Settings className="h-4 w-4" /> Settings</Button>
          </div>
        </div>

        <Tabs defaultValue="orders" className="space-y-8">
          <TabsList className="bg-white border p-1 rounded-xl">
            <TabsTrigger value="orders" className="gap-2 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white">
              <ShoppingCart className="h-4 w-4" /> Recent Orders
            </TabsTrigger>
            <TabsTrigger value="ai-tool" className="gap-2 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white">
              <Sparkles className="h-4 w-4" /> AI Description Tool
            </TabsTrigger>
          </TabsList>

          <TabsContent value="orders">
            <Card className="border-none shadow-sm overflow-hidden">
              <CardHeader className="bg-white">
                <CardTitle>Incoming Orders</CardTitle>
                <CardDescription>View and manage your current sales from YourGroceriesUSA.</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[
                      { id: '#1204', customer: 'Sarah Miller', product: 'Hydrating Rose Serum', amount: '$45.00', status: 'Pending', date: 'May 12, 2024' },
                      { id: '#1203', customer: 'John Doe', product: 'Silk Finish Foundation', amount: '$32.00', status: 'Shipped', date: 'May 11, 2024' },
                      { id: '#1202', customer: 'Emma Wilson', product: 'Daily Multivitamin', amount: '$19.99', status: 'Delivered', date: 'May 10, 2024' },
                    ].map((order) => (
                      <TableRow key={order.id} className="bg-white">
                        <TableCell className="font-medium">{order.id}</TableCell>
                        <TableCell>{order.customer}</TableCell>
                        <TableCell>{order.product}</TableCell>
                        <TableCell>{order.amount}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            order.status === 'Delivered' ? 'bg-green-100 text-green-700' :
                            order.status === 'Shipped' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {order.status}
                          </span>
                        </TableCell>
                        <TableCell>{order.date}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ai-tool">
            <div className="grid gap-8 md:grid-cols-2">
              <Card className="border-none shadow-sm">
                <CardHeader>
                  <CardTitle>Description Generator</CardTitle>
                  <CardDescription>Use AI to create compelling product copy for your store.</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleGenerate} className="space-y-4">
                    <div className="space-y-2">
                      <Label>Product Name</Label>
                      <Input
                        placeholder="e.g. Luxurious Rose Night Cream"
                        required
                        value={formData.productName}
                        onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Category</Label>
                      <Input
                        placeholder="e.g. Skincare"
                        required
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Key Features (comma separated)</Label>
                      <Textarea
                        placeholder="e.g. Anti-aging, Hydrating, Natural oils"
                        required
                        value={formData.keyFeatures}
                        onChange={(e) => setFormData({ ...formData, keyFeatures: e.target.value })}
                      />
                    </div>
                    <Button disabled={loading} type="submit" className="w-full bg-primary hover:bg-primary/90">
                      {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                      Generate Description
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <Card className="border-none shadow-sm bg-secondary/20">
                <CardHeader>
                  <CardTitle>AI Output</CardTitle>
                  <CardDescription>Your generated description will appear here.</CardDescription>
                </CardHeader>
                <CardContent>
                  {aiResult ? (
                    <div className="p-4 bg-white rounded-lg border prose prose-pink max-w-none">
                      <p className="whitespace-pre-wrap text-sm leading-relaxed">{aiResult}</p>
                      <Button variant="ghost" className="mt-4 text-primary p-0 h-auto font-semibold" onClick={() => navigator.clipboard.writeText(aiResult)}>
                        Copy to Clipboard
                      </Button>
                    </div>
                  ) : (
                    <div className="h-64 flex items-center justify-center border-2 border-dashed rounded-lg text-muted-foreground">
                      No description generated yet.
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
