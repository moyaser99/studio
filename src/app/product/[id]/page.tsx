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

  // Exact WhatsApp link format requested: I want to order: [Product Name]
  const whatsappUrl = `https://wa.me/YOUR_NUMBER?text=${encodeURIComponent(`I want to order: ${product.name}`)}`;

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-12 md:px-6">
        <div className="grid gap-12 lg:grid-cols-2 items-start">
          <div className="relative aspect-square overflow-hidden rounded-3xl bg-muted shadow-sm ring-1 ring-muted">
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-cover"
              data-ai-hint="product detail image"
            />
          </div>
          <div className="flex flex-col space-y-8">
            <div className="space-y-4">
              <Badge variant="secondary" className="px-4 py-1 rounded-full text-sm font-semibold tracking-wide">
                {product.category.toUpperCase()}
              </Badge>
              <h1 className="text-4xl font-bold text-foreground font-headline">
                {product.name}
              </h1>
              <p className="text-3xl font-bold text-primary">
                ${product.price.toFixed(2)}
              </p>
            </div>
            
            <Separator className="opacity-50" />
            
            <div className="space-y-4">
              <h3 className="font-semibold text-xl">About this item</h3>
              <p className="text-muted-foreground text-lg leading-relaxed">
                {product.description}
              </p>
            </div>

            {product.features && (
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Highlights</h3>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {product.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm text-muted-foreground bg-muted/30 p-3 rounded-2xl">
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="pt-8">
              <Button 
                onClick={() => window.open(whatsappUrl, '_blank')}
                className="w-full sm:w-auto h-16 px-14 bg-[#25D366] hover:bg-[#128C7E] text-white gap-3 rounded-full text-xl font-bold shadow-xl transition-transform hover:scale-[1.02]"
              >
                <MessageCircle className="h-6 w-6 fill-current" />
                Order via WhatsApp
              </Button>
              <p className="mt-6 text-sm text-center sm:text-left text-muted-foreground">
                Safe and direct communication with YourGroceriesUSA support.
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}