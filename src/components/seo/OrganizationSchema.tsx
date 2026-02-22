
'use client';

import React from 'react';

/**
 * OrganizationSchema component injects JSON-LD for the brand identity.
 */
export default function OrganizationSchema() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "HarirBoutiqueUSA",
    "url": "https://harirboutiqueusa.com",
    "logo": "https://harirboutiqueusa.com/logo.png",
    "description": "Your premier US-based boutique for curated luxury watches and lifestyle essentials.",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Michigan",
      "addressCountry": "US"
    },
    "sameAs": [
      "https://www.instagram.com/bmnas_rh?igsh=NjV1MzAyNDVyemk4&utm_source=qr",
      "https://www.facebook.com/harirboutiqueusa"
    ]
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
