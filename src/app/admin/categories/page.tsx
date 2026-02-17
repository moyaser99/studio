'use client';

import React, { useState } from 'react';
import { useFirestore, useCollection, useUser, useAuth } from '@/firebase';
import { 
  collection, 
  deleteDoc, 
  doc, 
  query, 
  orderBy, 
  where, 
  getDocs,
  limit,
  addDoc, 
  updateDoc, 
  serverTimestamp
} from 'firebase/firestore';
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
  Tags, 
  Loader2, 
  ChevronLeft,
  AlertTriangle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useMemoFirebase } from '@/firebase/use-memo-firebase';
import Link from 'next/link';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export const maxDuration = 60;

const ADMIN_EMAIL = 'mohammad.dd.my@gmail.com';
const ADMIN_PHONE = '+962780334074';

export default function AdminCategoriesPage() {
  const db = useFirestore();
  const auth = useAuth();
  const { user, loading: authLoading } = useUser();
  const { toast } = useToast();
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    nameAr: '',
    slug: '',
    displayOrder: '0',
  });

  const categoriesQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, 'categories'), orderBy('displayOrder', 'asc'));
  }, [db]);

  const { data: categories, loading: categoriesLoading } = useCollection(categoriesQuery);

  const isAdmin = user?.email === ADMIN_EMAIL || user?.phoneNumber === ADMIN_PHONE;

  if (authLoading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="h-10 w-10 animate-spin text-primary" />
    </div>
  );

  if (!isAdmin && !authLoading) {
    return (
      <div className="min-h-screen flex flex-col" dir="rtl">
        <Header />
        <main className="flex-1 flex items-center justify-center bg-muted/20">
          <Card className="max-w-md text-center p-8 rounded-3xl shadow-xl">
            <div className="bg-destructive/10 text-destructive p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="h-8 w-8" />
            </div>
            <CardTitle className="text-2xl text-destructive mb-4">وصول مرفوض أو جلسة مفقودة</CardTitle>
            <p className="text-muted-foreground mb-6">
              ليس لديك الصلاحيات الكافية، أو أن المتصفح فقد بيانات تسجيل الدخول بسبب قيود الأمان.
              <br/><br/>
              <b>حل مقترح:</b> يرجى فتح الموقع في نافذة مستقلة (New Tab) بدلاً من الإطار الحالي.
            </p>
            <div className="flex flex-col gap-3">
              <Button onClick={() => window.open(window.location.href, '_blank')} className="rounded-full h-12">فتح في نافذة جديدة</Button>
              <Button onClick={() => window.location.href = '/login'} variant="outline" className="rounded-full h-12">الذهاب لصفحة الدخول</Button>
            </div>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  const saveCategory = () => {
    if (!db || !formData.nameAr || !formData.slug) {
      toast({ variant: 'destructive', title: 'خطأ', description: 'يرجى إكمال جميع الحقول المطلوبة.' });
      return;
    }
    
    setSaving(true);
    const payload = {
      nameAr: formData.nameAr,
      slug: formData.slug.toLowerCase().trim(),
      displayOrder: parseInt(formData.displayOrder) || 0,
      updatedAt: serverTimestamp(),
    };

    if (isEditing) {
      const docRef = doc(db, 'categories', isEditing);
      updateDoc(docRef, payload)
        .then(() => {
          toast({ title: 'تم التحديث', description: 'تم تحديث القسم بنجاح.' });
          resetForm();
        })
        .catch(async () => {
          errorEmitter.emit('permission-error', new FirestorePermissionError({ path: docRef.path, operation: 'update', requestResourceData: payload }));
        })
        .finally(() => setSaving(false));
    } else {
      (payload as any).createdAt = serverTimestamp();
      addDoc(collection(db, 'categories'), payload)
        .then(() => {
          toast({ title: 'تمت الإضافة', description: 'تمت إضافة القسم الجديد بنجاح.' });
          resetForm();
        })
        .catch(async () => {
          errorEmitter.emit('permission-error', new FirestorePermissionError({ path: 'categories', operation: 'create', requestResourceData: payload }));
        })
        .finally(() => setSaving(false));
    }
  };

  const deleteCategory = (id: string, slug: string) => {
    if (!isAdmin || !db) {
      if (!user) {
        alert('عذراً، الجلسة منتهية أو مفقودة. يرجى فتح الموقع في نافذة جديدة أو إعادة تسجيل الدخول.');
      }
      return;
    }

    // Immediate user intent confirmation
    if (!window.confirm('هل أنت متأكد من حذف هذا القسم؟')) return;

    setDeletingId(id);
    const docRef = doc(db, 'categories', id);

    // Optimized: Run the product check but don't block the UI unnecessarily long
    const productCheckQuery = query(
      collection(db, 'products'),
      where('category', '==', slug),
      limit(1)
    );
    
    getDocs(productCheckQuery)
      .then((snapshot) => {
        if (!snapshot.empty) {
          const proceed = window.confirm('تنبيه: هذا القسم يحتوي على منتجات. حذفه قد يؤثر على عرضها. هل تريد المتابعة على أي حال؟');
          if (!proceed) {
            setDeletingId(null);
            return;
          }
        }
        
        deleteDoc(docRef)
          .then(() => {
            toast({ title: 'تم الحذف', description: 'تم إزالة القسم بنجاح.' });
          })
          .catch((err) => {
            if (!auth?.currentUser) {
              toast({ variant: 'destructive', title: 'جلسة مفقودة', description: 'يرجى فتح الموقع في نافذة جديدة لإتمام العملية.' });
            } else {
              toast({ variant: 'destructive', title: 'خطأ في الصلاحيات', description: 'عذراً، لا تملك صلاحية الحذف من قاعدة البيانات.' });
            }
            errorEmitter.emit('permission-error', new FirestorePermissionError({ path: docRef.path, operation: 'delete' }));
          })
          .finally(() => setDeletingId(null));
      })
      .catch((e) => {
        // If check fails, try to delete anyway if the user confirmed the first prompt
        deleteDoc(docRef)
          .then(() => toast({ title: 'تم الحذف', description: 'تم إزالة القسم بنجاح.' }))
          .catch(() => toast({ variant: 'destructive', title: 'خطأ', description: 'فشل في حذف القسم.' }))
          .finally(() => setDeletingId(null));
      });
  };

  const resetForm = () => {
    setFormData({ nameAr: '', slug: '', displayOrder: '0' });
    setIsAdding(false);
    setIsEditing(null);
    setSaving(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-muted/10" dir="rtl">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-6">
          <div className="text-right">
            <Link href="/admin" className="text-primary flex items-center gap-1 mb-2 hover:underline">
              <ChevronLeft className="h-4 w-4" /> العودة للوحة التحكم
            </Link>
            <h1 className="text-4xl font-black font-headline text-primary flex items-center gap-3">
              <Tags className="h-10 w-10" /> إدارة الأقسام
            </h1>
          </div>
          
          <Dialog open={isAdding || !!isEditing} onOpenChange={(val) => !val && resetForm()}>
            <DialogTrigger asChild>
              <Button onClick={() => setIsAdding(true)} className="rounded-full h-14 px-8 text-lg font-bold shadow-lg gap-2 bg-[#D4AF37] hover:bg-[#B8962D]">
                <Plus className="h-6 w-6" /> إضافة قسم جديد
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md rounded-3xl">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold font-headline">
                  {isEditing ? 'تعديل القسم' : 'إضافة قسم جديد'}
                </DialogTitle>
              </DialogHeader>
              <div className="grid gap-6 py-4">
                <div className="space-y-2 text-right">
                  <Label>اسم القسم (بالعربية)</Label>
                  <input 
                    value={formData.nameAr} 
                    onChange={e => setFormData({...formData, nameAr: e.target.value})}
                    placeholder="مثال: المكياج" 
                    className="flex h-12 w-full rounded-xl border border-input bg-background px-4 text-right focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </div>
                <div className="space-y-2 text-right">
                  <Label>المعرف (Slug)</Label>
                  <input 
                    value={formData.slug} 
                    onChange={e => setFormData({...formData, slug: e.target.value})}
                    placeholder="example: makeup" 
                    className="flex h-12 w-full rounded-xl border border-input bg-background px-4 text-right focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </div>
                <div className="space-y-2 text-right">
                  <Label>ترتيب العرض</Label>
                  <input 
                    type="number"
                    value={formData.displayOrder} 
                    onChange={e => setFormData({...formData, displayOrder: e.target.value})}
                    placeholder="0" 
                    className="flex h-12 w-full rounded-xl border border-input bg-background px-4 text-right focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button 
                  onClick={saveCategory} 
                  disabled={saving}
                  className="w-full rounded-full h-14 text-lg font-bold bg-[#D4AF37] hover:bg-[#B8962D] shadow-lg"
                >
                  {saving ? <Loader2 className="h-6 w-6 animate-spin" /> : (isEditing ? 'حفظ التعديلات' : 'إضافة القسم')}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="rounded-[2.5rem] overflow-hidden border-none shadow-xl bg-white">
          <CardHeader className="bg-primary/5 p-8 border-b">
            <CardTitle className="text-2xl font-bold font-headline text-right">قائمة الأقسام</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {categoriesLoading ? (
              <div className="py-20 flex justify-center"><Loader2 className="h-10 w-10 animate-spin text-primary/40" /></div>
            ) : categories && categories.length > 0 ? (
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow>
                    <TableHead className="text-right">الاسم</TableHead>
                    <TableHead className="text-right">المعرف (Slug)</TableHead>
                    <TableHead className="text-center">الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categories.map((cat: any) => (
                    <TableRow key={cat.id} className="hover:bg-primary/5 transition-colors">
                      <TableCell className="font-bold">{cat.nameAr}</TableCell>
                      <TableCell>{cat.slug}</TableCell>
                      <TableCell>
                        <div className="flex justify-center gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="rounded-full text-[#D4AF37] hover:bg-[#D4AF37]/10"
                            onClick={() => {
                              setIsEditing(cat.id);
                              setFormData({
                                nameAr: cat.nameAr,
                                slug: cat.slug,
                                displayOrder: cat.displayOrder.toString(),
                              });
                            }}
                          >
                            <Edit className="h-5 w-5" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            disabled={deletingId === cat.id}
                            className="rounded-full text-destructive hover:bg-destructive/10"
                            onClick={() => deleteCategory(cat.id, cat.slug)}
                          >
                            {deletingId === cat.id ? <Loader2 className="h-5 w-5 animate-spin" /> : <Trash2 className="h-5 w-5" />}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="py-20 text-center text-muted-foreground">لا توجد أقسام حالياً.</div>
            )}
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
