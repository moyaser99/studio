'use client';

import React, { useState } from 'react';
import { useFirestore, useCollection, useUser } from '@/firebase';
import { 
  collection, 
  query, 
  orderBy, 
  doc, 
  updateDoc,
  deleteDoc
} from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  ShoppingBag, 
  Loader2, 
  ChevronLeft, 
  ChevronRight,
  Eye,
  ClipboardList,
  MapPin,
  Phone,
  Trash2,
  AlertTriangle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useMemoFirebase } from '@/firebase/use-memo-firebase';
import { useTranslation } from '@/hooks/use-translation';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { format } from 'date-fns';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '@/firebase/errors';

const ADMIN_EMAIL = 'mohammad.dd.my@gmail.com';
const ADMIN_PHONE = '+962780334074';

export default function AdminOrdersPage() {
  const db = useFirestore();
  const { user, loading: authLoading } = useUser();
  const { toast } = useToast();
  const { t, lang } = useTranslation();
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const ordersQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
  }, [db]);

  const { data: orders, loading: ordersLoading } = useCollection(ordersQuery);

  const isAdmin = user?.email === ADMIN_EMAIL || user?.phoneNumber === ADMIN_PHONE;

  const handleStatusUpdate = (orderId: string, newStatus: string) => {
    if (!db) return;
    setUpdatingId(orderId);
    const docRef = doc(db, 'orders', orderId);
    
    updateDoc(docRef, { status: newStatus })
      .then(() => {
        toast({ 
          title: lang === 'ar' ? 'تم التحديث' : 'Status Updated', 
          description: lang === 'ar' ? 'تم تغيير حالة الطلب بنجاح.' : 'Order status updated successfully.' 
        });
      })
      .catch(async () => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: docRef.path,
          operation: 'update',
          requestResourceData: { status: newStatus }
        } satisfies SecurityRuleContext));
      })
      .finally(() => setUpdatingId(null));
  };

  const handleDeleteOrder = (orderId: string) => {
    if (!db || !isAdmin) return;
    
    if (!window.confirm(lang === 'ar' ? 'هل أنت متأكد من حذف هذا الطلب؟' : 'Are you sure you want to delete this order?')) {
      return;
    }

    setDeletingId(orderId);
    const docRef = doc(db, 'orders', orderId);

    deleteDoc(docRef)
      .then(() => {
        toast({
          title: lang === 'ar' ? 'تم الحذف' : 'Deleted',
          description: lang === 'ar' ? 'تم حذف الطلب بنجاح.' : 'Order has been deleted successfully.'
        });
      })
      .catch(async () => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: docRef.path,
          operation: 'delete'
        } satisfies SecurityRuleContext));
      })
      .finally(() => setDeletingId(null));
  };

  if (authLoading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="h-10 w-10 animate-spin text-primary" />
    </div>
  );

  if (!isAdmin && !authLoading) {
    return (
      <main className="flex-1 flex items-center justify-center bg-muted/20 py-20" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
        <Card className="max-w-md text-center p-8 rounded-[2rem] shadow-xl">
           <div className="bg-destructive/10 text-destructive p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
             <AlertTriangle className="h-8 w-8" />
           </div>
           <h2 className="text-2xl font-bold text-destructive mb-4">{t.sessionWarning}</h2>
           <Link href="/login"><Button className="rounded-full px-8 h-12">{t.loginTitle}</Button></Link>
        </Card>
      </main>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-[#D4AF37] text-white rounded-full px-4">{t.pending}</Badge>;
      case 'processing':
        return <Badge className="bg-blue-400 text-white rounded-full px-4">{t.processing}</Badge>;
      case 'shipped':
        return <Badge className="bg-[#F8C8DC] text-primary rounded-full px-4 font-bold">{t.shipped}</Badge>;
      case 'delivered':
        return <Badge className="bg-green-500 text-white rounded-full px-4">{t.delivered}</Badge>;
      case 'cancelled':
        return <Badge variant="destructive" className="rounded-full px-4">{t.cancelled}</Badge>;
      default:
        return <Badge variant="outline" className="rounded-full px-4">{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-muted/10 transition-all duration-300" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-6">
          <div className="text-start">
            <Link href="/admin" className="text-primary flex items-center gap-1 mb-2 hover:underline">
              {lang === 'ar' ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />} {t.backToDashboard}
            </Link>
            <h1 className="text-4xl font-black font-headline text-primary flex items-center gap-3">
              <ClipboardList className="h-10 w-10" /> {t.manageOrders}
            </h1>
          </div>
        </div>

        <Card className="rounded-[2.5rem] overflow-hidden border-none shadow-xl bg-white">
          <CardHeader className="bg-primary/5 p-8 border-b">
            <CardTitle className="text-2xl font-bold font-headline text-start">{t.orderList}</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {ordersLoading ? (
              <div className="py-20 flex justify-center"><Loader2 className="h-10 w-10 animate-spin text-primary/40" /></div>
            ) : orders && orders.length > 0 ? (
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow>
                    <TableHead className="text-start">{t.orderId}</TableHead>
                    <TableHead className="text-start">{t.fullName}</TableHead>
                    <TableHead className="text-start">{t.orderDate}</TableHead>
                    <TableHead className="text-start">{t.total}</TableHead>
                    <TableHead className="text-start">{t.status}</TableHead>
                    <TableHead className="text-center">{t.actions}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order: any) => (
                    <TableRow key={order.id} className="hover:bg-primary/5 transition-colors">
                      <TableCell className="font-mono text-xs text-muted-foreground text-start">
                        #{order.id.substring(0, 8).toUpperCase()}
                      </TableCell>
                      <TableCell className="font-bold text-start">
                        {order.customerInfo?.fullName || 'N/A'}
                      </TableCell>
                      <TableCell className="text-start text-sm">
                        {order.createdAt ? format(order.createdAt.toDate(), 'dd/MM/yyyy HH:mm') : 'N/A'}
                      </TableCell>
                      <TableCell className="font-bold text-primary text-start">
                        ${order.totalPrice?.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-start">
                        {getStatusBadge(order.status)}
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-center gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="rounded-full text-primary hover:bg-primary/10">
                                <Eye className="h-5 w-5" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl rounded-3xl" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
                              <DialogHeader>
                                <DialogTitle className="text-2xl font-bold font-headline text-start flex items-center gap-2">
                                   <ShoppingBag className="h-6 w-6 text-primary" />
                                   {t.viewDetails}
                                </DialogTitle>
                              </DialogHeader>
                              
                              <div className="grid gap-8 py-4 overflow-y-auto max-h-[70vh]">
                                {/* Customer Info */}
                                <div className="space-y-4">
                                  <h3 className="text-lg font-bold border-b pb-2 text-start">{t.shippingInfo}</h3>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-start">
                                    <div className="flex items-center gap-2">
                                      <Phone className="h-4 w-4 text-[#D4AF37]" />
                                      <span dir="ltr">{order.customerInfo?.phone}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <MapPin className="h-4 w-4 text-[#D4AF37]" />
                                      <span>{order.customerInfo?.city} - {order.customerInfo?.address}</span>
                                    </div>
                                  </div>
                                </div>

                                {/* Items List */}
                                <div className="space-y-4">
                                  <h3 className="text-lg font-bold border-b pb-2 text-start">{t.products}</h3>
                                  <div className="space-y-3">
                                    {order.items?.map((item: any, idx: number) => (
                                      <div key={idx} className="flex justify-between items-center bg-muted/30 p-4 rounded-2xl">
                                        <div className="text-start">
                                          <p className="font-bold">{lang === 'ar' ? item.name : (item.nameEn || item.name)}</p>
                                          <p className="text-sm text-muted-foreground">{item.quantity} x ${item.price?.toFixed(2)}</p>
                                        </div>
                                        <p className="font-black text-primary">${(item.price * item.quantity).toFixed(2)}</p>
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                {/* Summary */}
                                <div className="bg-primary/5 p-6 rounded-3xl space-y-2">
                                  <div className="flex justify-between text-xl font-black">
                                    <span>{t.total}</span>
                                    <span className="text-[#D4AF37]">${order.totalPrice?.toFixed(2)}</span>
                                  </div>
                                  <p className="text-sm text-muted-foreground text-start">
                                    {lang === 'ar' ? 'طريقة الدفع: الدفع عند الاستلام' : 'Payment Method: Cash on Delivery'}
                                  </p>
                                </div>

                                {/* Update Status */}
                                <div className="space-y-3">
                                  <p className="font-bold text-start">{t.updateStatus}</p>
                                  <Select 
                                    defaultValue={order.status} 
                                    onValueChange={(val) => handleStatusUpdate(order.id, val)}
                                    disabled={updatingId === order.id}
                                  >
                                    <SelectTrigger className="w-full h-12 rounded-xl">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="pending">{t.pending}</SelectItem>
                                      <SelectItem value="processing">{t.processing}</SelectItem>
                                      <SelectItem value="shipped">{t.shipped}</SelectItem>
                                      <SelectItem value="delivered">{t.delivered}</SelectItem>
                                      <SelectItem value="cancelled">{t.cancelled}</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                          
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="rounded-full text-destructive hover:bg-destructive/10"
                            onClick={() => handleDeleteOrder(order.id)}
                            disabled={deletingId === order.id}
                          >
                            {deletingId === order.id ? (
                              <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                              <Trash2 className="h-5 w-5" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="py-24 text-center text-muted-foreground">
                <ShoppingBag className="h-16 w-16 mx-auto mb-4 opacity-20" />
                {t.noProductsFound}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
