
'use client';

import Link from 'next/link';
import { useUser } from '@/firebase';
import { useTranslation } from '@/hooks/use-translation';
import { Instagram, Facebook } from 'lucide-react';

const ADMIN_EMAIL = 'mohammad.dd.my@gmail.com';
const ADMIN_PHONE = '+962780334074';

export default function Footer() {
  const { user, loading } = useUser();
  const { t, lang } = useTranslation();
  const isAdmin = !loading && !!user && (user.email === ADMIN_EMAIL || user.phoneNumber === ADMIN_PHONE);

  return (
    <footer className="border-t bg-white">
      <div className="container mx-auto px-4 py-16 md:px-6">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-3 text-start">
          <div className="space-y-4">
            <Link href="/" className="text-2xl font-black text-primary tracking-tighter">
              HarirBoutiqueUSA
            </Link>
            <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
              {t.footerDesc}
            </p>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-sm font-black uppercase tracking-widest text-foreground">{t.legalInformation}</h3>
            <ul className="space-y-3">
              <li><Link href="/privacy-policy" className="text-sm text-muted-foreground hover:text-primary transition-colors font-medium">{t.privacyPolicy}</Link></li>
              <li><Link href="/terms-of-use" className="text-sm text-muted-foreground hover:text-primary transition-colors font-medium">{t.termsOfUse}</Link></li>
              <li><Link href="/shipping-returns" className="text-sm text-muted-foreground hover:text-primary transition-colors font-medium">{t.shipping}</Link></li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-black uppercase tracking-widest text-foreground">{t.support}</h3>
            <ul className="space-y-3">
              <li><Link href="/about" className="text-sm text-muted-foreground hover:text-primary transition-colors font-medium">{t.aboutStore}</Link></li>
              <li><Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors font-medium">{t.contactUs}</Link></li>
              {isAdmin && (
                <li><Link href="/admin" className="text-sm font-black text-primary hover:text-primary/80 transition-colors">{t.admin}</Link></li>
              )}
            </ul>
          </div>
        </div>

        <div className="mt-16 border-t border-primary/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <p>© 2026 HarirBoutiqueUSA. {t.allRightsReserved}</p>
          <div className="flex gap-6">
             <Link 
               href="https://www.instagram.com/bmnas_rh?igsh=NjV1MzAyNDVyemk4&utm_source=qr" 
               target="_blank" 
               rel="noopener noreferrer"
               className="text-[#D4AF37] hover:text-primary transition-all duration-300 transform hover:scale-125"
               aria-label="Instagram"
             >
               <Instagram className="h-6 w-6" />
             </Link>
             <Link 
               href="#" 
               target="_blank" 
               rel="noopener noreferrer"
               className="text-[#D4AF37] hover:text-primary transition-all duration-300 transform hover:scale-125"
               aria-label="Facebook"
             >
               <Facebook className="h-6 w-6" />
             </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
