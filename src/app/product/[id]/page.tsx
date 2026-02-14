
'use client';

import { useParams } from 'next/navigation';
import Image from 'next/image';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { PRODUCTS } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { MessageCircle, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

export default function ProductPage() {
  const { id } = useParams();
  const product = PRODUCTS.find((p) => p.id === id);

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Product not found.</p>
      </div>
    );
  }

  const whatsappMessage = `Hello YourGroceriesUSA! I would like to order: ${product.name} (Price: $${product.price.toFixed(2)})`;
  const whatsappUrl = `https://wa.me/1234567890?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-12 md:px-6">
        <div className="grid gap-8 lg:grid-cols-2 items-start">
          <div className="relative aspect-square overflow-hidden rounded-2xl bg-muted shadow-sm">
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-cover"
              data-ai-hint="product detail image"
            />
          </div>
          <div className="flex flex-col space-y-6">
            <div>
              <Badge variant="outline" className="text-primary border-primary mb-2">
                {product.category.toUpperCase()}
              </Badge>
              <h1 className="text-3xl font-bold text-foreground font-headline sm:text-4xl">
                {product.name}
              </h1>
              <p className="mt-4 text-2xl font-bold text-primary">
                ${product.price.toFixed(2)}
              </p>
            </div>
            
            <Separator />
            
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Product Description</h3>
              <p className="text-muted-foreground leading-relaxed">
                {product.description}
              </p>
            </div>

            {product.features && (
              <div className="space-y-2">
                <h3 className="font-semibold">Key Features</h3>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {product.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="pt-6">
              <Button 
                onClick={() => window.open(whatsappUrl, '_blank')}
                className="w-full sm:w-auto h-14 px-12 bg-[#25D366] hover:bg-[#128C7E] text-white gap-3 rounded-full text-lg font-bold shadow-lg shadow-green-200"
              >
                <MessageCircle className="h-6 w-6" />
                WhatsApp to Order
              </Button>
              <p className="mt-4 text-xs text-center sm:text-left text-muted-foreground">
                Safe and secure checkout via direct WhatsApp communication.
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
