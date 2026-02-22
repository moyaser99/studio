'use client';

import React, { useState } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  ChevronLeft, 
  ChevronRight, 
  PlusCircle, 
  Package, 
  DollarSign, 
  Tags,
  Image as ImageIcon,
  Loader2
} from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';
import Link from 'next/link';
import ImageUpload from '@/components/admin/ImageUpload';
import { useFirestore } from '@/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

export default function AddProductPage() {
  const { t, lang } = useTranslation();
  const db = useFirestore();
  const { toast } = useToast();
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    nameEn: '',
    description: '',
    descriptionEn: '',
    price: '',
    stock: '',
    category: '',
    imageUrl: '',
  });

  const handleSave = async () => {
    if (!db || !formData.name || !formData.price || !formData.category || !formData.imageUrl) {
      toast({ variant: 'destructive', title: t.errorOccurred, description: t.completeFields });
      return;
    }

    setSaving(true);
    const payload = {
      ...formData,
      price: parseFloat(formData.price) || 0,
      stock: parseInt(formData.stock) || 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      isHidden: false,
      discountPercentage: 0
    };

    try {
      await addDoc(collection(db, 'products'), payload);
      toast({ title: 'Success', description: t.productAdded });
      router.push('/admin');
    } catch (error) {
      toast({ variant: 'destructive', title: t.errorOccurred, description: 'Failed to save product.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-muted/10" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <main className="flex-1 container mx-auto px-4 py-12 md:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8 flex items-center justify-between">
            <div className="text-start">
              <Link href="/admin" className="text-primary flex items-center gap-1 mb-2 hover:underline font-bold">
                {lang === 'ar' ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />} 
                {t.backToDashboard}
              </Link>
              <h1 className="text-4xl font-black font-headline text-primary flex items-center gap-3">
                <PlusCircle className="h-10 w-10" /> {t.addProductTitle}
              </h1>
            </div>
          </div>

          <Card className="rounded-[2.5rem] overflow-hidden border-none shadow-2xl bg-white">
            <CardHeader className="bg-[#F8C8DC]/20 p-8 border-b border-primary/10">
              <CardTitle className="text-2xl font-bold font-headline text-start flex items-center gap-2">
                <Package className="h-6 w-6 text-primary" /> {t.productName}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2 text-start">
                  <Label className="text-lg font-bold">{t.productNameLabel}</Label>
                  <Input 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="مثال: كريم العناية الفاخر"
                    className="h-14 rounded-2xl border-2 border-primary/10 focus:border-[#D4AF37]"
                  />
                </div>
                <div className="space-y-2 text-start">
                  <Label className="text-lg font-bold">{t.productNameEnLabel}</Label>
                  <Input 
                    value={formData.nameEn}
                    onChange={(e) => setFormData({...formData, nameEn: e.target.value})}
                    placeholder="Ex: Luxury Care Cream"
                    className="h-14 rounded-2xl border-2 border-primary/10 focus:border-[#D4AF37]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2 text-start">
                  <Label className="text-lg font-bold">{t.descriptionLabel}</Label>
                  <Textarea 
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="اكتب وصفاً جذاباً..."
                    className="min-h-[140px] rounded-[2rem] border-2 border-primary/10"
                  />
                </div>
                <div className="space-y-2 text-start">
                  <Label className="text-lg font-bold">{t.descriptionEnLabel}</Label>
                  <Textarea 
                    value={formData.descriptionEn}
                    onChange={(e) => setFormData({...formData, descriptionEn: e.target.value})}
                    placeholder="Write a description..."
                    className="min-h-[140px] rounded-[2rem] border-2 border-primary/10"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="space-y-2 text-start">
                  <Label className="text-lg font-bold flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-[#D4AF37]" /> {t.productPrice}
                  </Label>
                  <Input 
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                    placeholder="0.00"
                    className="h-14 rounded-2xl border-2 border-primary/10"
                  />
                </div>
                <div className="space-y-2 text-start">
                  <Label className="text-lg font-bold flex items-center gap-2">
                    <Package className="h-5 w-5 text-[#D4AF37]" /> {t.stock}
                  </Label>
                  <Input 
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({...formData, stock: e.target.value})}
                    placeholder="0"
                    className="h-14 rounded-2xl border-2 border-primary/10"
                  />
                </div>
                <div className="space-y-2 text-start">
                  <Label className="text-lg font-bold flex items-center gap-2">
                    <Tags className="h-5 w-5 text-[#D4AF37]" /> {t.productCategory}
                  </Label>
                  <Select onValueChange={(val) => setFormData({...formData, category: val})}>
                    <SelectTrigger className="h-14 rounded-2xl border-2 border-primary/10">
                      <SelectValue placeholder={t.chooseCategory} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="makeup">Makeup</SelectItem>
                      <SelectItem value="skincare">Skincare</SelectItem>
                      <SelectItem value="haircare">Haircare</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="pt-4">
                <ImageUpload 
                  folder="products"
                  initialUrl={formData.imageUrl}
                  onUploadComplete={(url) => setFormData(prev => ({ ...prev, imageUrl: url }))}
                  label={t.productImage}
                />
              </div>

              <div className="pt-8">
                <Button 
                  onClick={handleSave}
                  disabled={saving}
                  className="w-full h-16 rounded-full text-xl font-bold bg-[#D4AF37] hover:bg-[#B8962D] text-white shadow-xl transition-all hover:scale-[1.01]"
                >
                  {saving ? <Loader2 className="h-6 w-6 animate-spin" /> : t.saveProduct}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
