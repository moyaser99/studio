import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { FirebaseClientProvider } from '@/firebase';
import { LanguageProvider } from '@/context/language-context';
import { CartProvider } from '@/context/CartContext';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export const metadata: Metadata = {
  metadataBase: new URL('https://harirboutiqueusa.com'),
  title: {
    template: '%s | HarirBoutiqueUSA - Luxury Destination',
    default: 'HarirBoutiqueUSA | Luxury Watches & Essentials in USA',
  },
  description: 'Your premier US-based boutique for curated luxury watches and lifestyle essentials. Shipped locally across all states.',
  alternates: {
    canonical: '/',
    languages: {
      'en-US': '/en',
      'ar-US': '/ar',
    },
  },
  openGraph: {
    title: 'Discover Elegance at HarirBoutiqueUSA',
    description: 'Your premier US-based boutique for curated luxury watches and lifestyle essentials.',
    url: 'https://harirboutiqueusa.com',
    siteName: 'HarirBoutiqueUSA',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1627260126103-f6299a5b39e7?q=80&w=1200&h=630&auto=format&fit=crop',
        width: 1200,
        height: 630,
        alt: 'HarirBoutiqueUSA Luxury Collection',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Discover Elegance at HarirBoutiqueUSA',
    description: 'Your premier US-based boutique for curated luxury watches and lifestyle essentials.',
    images: ['https://images.unsplash.com/photo-1627260126103-f6299a5b39e7?q=80&w=1200&h=630&auto=format&fit=crop'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Noto+Sans+Arabic:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased selection:bg-primary selection:text-white" suppressHydrationWarning>
        <FirebaseClientProvider>
          <LanguageProvider>
            <CartProvider>
              <div className="flex min-h-screen flex-col">
                <Header />
                <main className="flex-1 pt-16 md:pt-20">
                  {children}
                </main>
                <Footer />
              </div>
              <Toaster />
              {/* Global stable recaptcha container - hidden securely to avoid layout shifts and permissions lag */}
              <div 
                id="recaptcha-container" 
                style={{ opacity: 0, position: 'absolute', pointerEvents: 'none', zIndex: -1, bottom: 0 }} 
              />
            </CartProvider>
          </LanguageProvider>
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
