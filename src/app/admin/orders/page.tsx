'use client';

import React, { useState, useMemo, useRef } from 'react';
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
  AlertTriangle,
  Search,
  X,
  PackageSearch,
  Printer
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useMemoFirebase } from '@/firebase/use-memo-firebase';
import { useTranslation } from '@/hooks/use-translation';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { format } from 'date-fns';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '@/firebase/errors';
import { Separator } from '@/components/ui/separator';
import { QRCodeSVG } from 'qrcode.react';

const ADMIN_EMAIL = 'mohammad.dd.my@gmail.com';
const ADMIN_PHONE = '+962780334074';

export default function AdminOrdersPage() {
  const db = useFirestore();
  const { user, loading: authLoading } = useUser();
  const { toast } = useToast();
  const { t, lang } = useTranslation();
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [printingOrder, setPrintingOrder] = useState<any>(null);

  const ordersQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
  }, [db]);

  const { data: orders, loading: ordersLoading } = useCollection(ordersQuery);

  const isAdmin = user?.email === ADMIN_EMAIL || user?.phoneNumber === ADMIN_PHONE;

  const filteredOrders = useMemo(() => {
    if (!orders) return [];
    if (!searchTerm.trim()) return orders;

    const queryLower = searchTerm.toLowerCase();
    return orders.filter((order: any) => {
      const orderIdMatch = order.id?.toLowerCase().includes(queryLower);
      const nameMatch = order.customerInfo?.fullName?.toLowerCase().includes(queryLower);
      const phoneMatch = order.customerInfo?.phone?.includes(searchTerm);
      
      return orderIdMatch || nameMatch || phoneMatch;
    });
  }, [orders, searchTerm]);

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

  const handlePrint = (order: any) => {
    setPrintingOrder(order);
    // Wait for the DOM to update with the printable content
    setTimeout(() => {
      window.print();
      setPrintingOrder(null);
    }, 100);
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
      
      {/* Printable Invoice Section - Only visible during print */}
      {printingOrder && (
        <div id="printable-invoice" className="hidden print:block p-8 bg-white text-black" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
          <div className="flex justify-between items-start mb-10">
            <div className="text-start space-y-2">
              <h1 className="text-4xl font-black text-primary tracking-tighter">HarirBoutiqueUSA</h1>
              <p className="text-sm font-bold opacity-70">USA Beauty & Luxury Essentials</p>
              <div className="text-xs space-y-1">
                <p>{t.customerService}: +1 (USA Support)</p>
                <p>Email: contact@harirboutiqueusa.com</p>
              </div>
            </div>
            
            {/* Tracking QR Code */}
            <div className="text-center space-y-1">
              <div className="p-1.5 border-2 border-[#D4AF37] rounded-xl bg-white inline-block shadow-sm">
                <QRCodeSVG 
                  value={`https://harirboutiqueusa.com/track/${printingOrder.id}`} 
                  size={90}
                  level="H"
                  includeMargin={false}
                />
              </div>
              <p className="text-[9px] font-black text-[#D4AF37] uppercase tracking-tighter max-w-[100px] leading-tight">
                {lang === 'ar' ? 'امسح لتتبع طلبك' : 'Scan to track order'}
              </p>
            </div>
          </div>

          <div className="flex justify-between items-start mb-10">
            <div className="space-y-1 text-start">
              <h2 className="text-xl font-black border-b-2 border-[#D4AF37] pb-1 inline-block">{t.invoice}</h2>
              <p className="text-sm font-bold pt-2">{t.orderId}: <span className="font-mono">#{printingOrder.id.toUpperCase()}</span></p>
              <p className="text-sm">{t.invoiceDate}: {printingOrder.createdAt ? format(printingOrder.createdAt.toDate(), 'dd/MM/yyyy HH:mm') : 'N/A'}</p>
            </div>
            <div className="text-start space-y-1 bg-muted/10 p-4 rounded-xl border-s-4 border-[#D4AF37]">
              <h3 className="text-sm font-black uppercase text-[#D4AF37]">{t.billTo}</h3>
              <p className="font-bold text-base">{printingOrder.customerInfo?.fullName}</p>
              <p className="text-sm" dir="ltr">{printingOrder.customerInfo?.phone}</p>
              <p className="text-sm">{printingOrder.customerInfo?.city}, {printingOrder.customerInfo?.address}</p>
            </div>
          </div>

          <table className="w-full mb-10 border-collapse">
            <thead>
              <tr className="bg-[#D4AF37]/10 text-start">
                <th className="py-3 px-4 border-b-2 border-[#D4AF37] text-start">{t.products}</th>
                <th className="py-3 px-4 border-b-2 border-[#D4AF37] text-center">{t.priceLabel}</th>
                <th className="py-3 px-4 border-b-2 border-[#D4AF37] text-center">{t.items}</th>
                <th className="py-3 px-4 border-b-2 border-[#D4AF37] text-end">{t.subtotal}</th>
              </tr>
            </thead>
            <tbody>
              {printingOrder.items?.map((item: any, idx: number) => (
                <tr key={idx} className="border-b">
                  <td className="py-4 px-4 font-bold">{lang === 'ar' ? item.name : (item.nameEn || item.name)}</td>
                  <td className="py-4 px-4 text-center font-mono">${item.price?.toFixed(2)}</td>
                  <td className="py-4 px-4 text-center">{item.quantity}</td>
                  <td className="py-4 px-4 text-end font-black">${(item.price * item.quantity).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex justify-end">
            <div className="w-64 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{t.subtotal}</span>
                <span className="font-bold">${(printingOrder.totalPrice - (printingOrder.shippingFee || 0)).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{t.shippingFee} ({printingOrder.customerInfo?.city})</span>
                <span className="font-bold text-primary">${(printingOrder.shippingFee || 0).toFixed(2)}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-xl font-black bg-[#D4AF37]/5 p-3 rounded-lg border-2 border-[#D4AF37]/20">
                <span>{t.total}</span>
                <span className="text-primary">${printingOrder.totalPrice?.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="mt-20 pt-10 border-t border-dashed text-center space-y-2">
            <p className="font-black text-lg text-primary">{t.thankYouPurchase}</p>
            <p className="text-xs text-muted-foreground italic">Powered by HarirBoutiqueUSA System</p>
          </div>
        </div>
      )}

      {/* Main UI */}
      <main className="flex-1 container mx-auto px-4 py-12 print:hidden">
        <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-6">
          <div className="text-start">
            <Link href="/admin" className="text-primary flex items-center gap-1 mb-2 hover:underline">
              {lang === 'ar' ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />} {t.backToDashboard}
            </Link>
            <h1 className="text-4xl font-black font-headline text-primary flex items-center gap-3">
              <ClipboardList className="h-10 w-10" /> {t.manageOrders}
            </h1>
          </div>

          {/* Advanced Search Bar */}
          <div className="relative w-full md:w-96 group">
            <Search className="absolute start-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-[#D4AF37] transition-colors" />
            <input
              type="text"
              placeholder={lang === 'ar' ? 'ابحث (رقم، اسم، هاتف)...' : 'Search (ID, Name, Phone)...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-14 ps-12 pe-12 rounded-full border-2 border-primary/10 bg-white text-base focus:outline-none focus:border-[#D4AF37] transition-all shadow-lg"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="absolute end-4 top-1/2 -translate-y-1/2 h-8 w-8 flex items-center justify-center text-muted-foreground hover:text-primary transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>

        <Card className="rounded-[2.5rem] overflow-hidden border-none shadow-xl bg-white">
          <CardHeader className="bg-primary/5 p-8 border-b">
            <CardTitle className="text-2xl font-bold font-headline text-start">{t.orderList}</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {ordersLoading ? (
              <div className="py-20 flex justify-center"><Loader2 className="h-10 w-10 animate-spin text-primary/40" /></div>
            ) : filteredOrders && filteredOrders.length > 0 ? (
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
                  {filteredOrders.map((order: any) => (
                    <TableRow key={order.id} className="hover:bg-primary/5 transition-colors">
                      <TableCell className="font-mono text-xs text-muted-foreground text-start">
                        #{order.id.substring(0, 8).toUpperCase()}
                      </TableCell>
                      <TableCell className="font-bold text-start">
                        <div className="flex flex-col">
                          <span>{order.customerInfo?.fullName || 'N/A'}</span>
                          <span className="text-xs text-muted-foreground font-normal" dir="ltr">{order.customerInfo?.phone}</span>
                        </div>
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
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="rounded-full border-2 border-[#D4AF37]/20 text-primary hover:bg-[#D4AF37]/10"
                            onClick={() => handlePrint(order)}
                            title={t.printInvoice}
                          >
                            <Printer className="h-5 w-5 text-primary" />
                          </Button>

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
                                  <div className="flex justify-between text-base">
                                    <span className="text-muted-foreground">{t.subtotal}</span>
                                    <span className="font-bold">${(order.totalPrice - (order.shippingFee || 0)).toFixed(2)}</span>
                                  </div>
                                  <div className="flex justify-between text-base">
                                    <span className="text-muted-foreground">{t.shippingFee}</span>
                                    <span className="font-bold">${(order.shippingFee || 0).toFixed(2)}</span>
                                  </div>
                                  <Separator className="my-2" />
                                  <div className="flex justify-between text-xl font-black">
                                    <span>{t.total}</span>
                                    <span className="text-[#D4AF37]">${order.totalPrice?.toFixed(2)}</span>
                                  </div>
                                  <p className="text-sm text-muted-foreground text-start mt-2">
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
                <PackageSearch className="h-16 w-16 mx-auto mb-4 opacity-20" />
                {searchTerm ? (lang === 'ar' ? 'لا توجد نتائج مطابقة لبحثك.' : 'No matching results found.') : t.noProductsFound}
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-invoice, #printable-invoice * {
            visibility: visible;
          }
          #printable-invoice {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            background: white !important;
            padding: 40px !important;
          }
          .print\:hidden {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
