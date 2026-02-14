
import Image from 'next/image';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ProductCard from '@/components/product/ProductCard';
import { CATEGORIES, PRODUCTS } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative w-full py-12 md:py-24 lg:py-32 bg-muted/50 overflow-hidden">
          <div className="container mx-auto px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px] items-center">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none text-foreground font-headline">
                    Elevate Your Everyday Essentials
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    Discover a curated selection of premium makeup, skincare, and lifestyle accessories. Quality meets elegance at YourGroceriesUSA.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Link href="/category/makeup">
                    <Button size="lg" className="bg-primary hover:bg-primary/90 text-white px-8">
                      Shop Now
                    </Button>
                  </Link>
                  <Link href="/admin">
                    <Button variant="outline" size="lg" className="border-primary text-primary hover:bg-primary/10 px-8">
                      Learn More
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="relative aspect-video lg:aspect-square rounded-2xl overflow-hidden shadow-2xl">
                <Image
                  src="https://picsum.photos/seed/hero-usa/800/800"
                  alt="Premium Collection"
                  fill
                  className="object-cover"
                  priority
                  data-ai-hint="luxury cosmetics hero"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Categories Grid */}
        <section className="py-12 md:py-24">
          <div className="container mx-auto px-4 md:px-6">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold tracking-tight md:text-3xl font-headline">Shop by Category</h2>
              <Button variant="link" className="text-primary gap-1">
                View All Categories <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {CATEGORIES.map((category) => (
                <Link key={category.id} href={`/category/${category.slug}`} className="group space-y-2 text-center">
                  <div className="relative aspect-square rounded-full overflow-hidden border-2 border-transparent group-hover:border-primary transition-all p-1 bg-white">
                    <Image
                      src={category.image}
                      alt={category.name}
                      fill
                      className="object-cover rounded-full"
                      data-ai-hint={`category ${category.name}`}
                    />
                  </div>
                  <span className="block font-medium group-hover:text-primary transition-colors">{category.name}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Products */}
        <section className="py-12 md:py-24 bg-secondary/5">
          <div className="container mx-auto px-4 md:px-6">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold tracking-tight md:text-3xl font-headline">Featured Arrivals</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {PRODUCTS.slice(0, 4).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
