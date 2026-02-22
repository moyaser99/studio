'use client';

import React from 'react';

interface ProductSchemaProps {
  product: {
    id: string;
    name: string;
    nameEn?: string;
    description: string;
    descriptionEn?: string;
    price: number;
    imageUrl: string;
    categoryName: string;
    stock: number;
  };
}

/**
 * ProductSchema component injects JSON-LD Structured Data for better SEO visibility
 * in search engine results (Rich Snippets).
 */
export default function ProductSchema({ product }: ProductSchemaProps) {
  if (!product) return null;

  const jsonLd = {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": product.nameEn || product.name,
    "image": [product.imageUrl],
    "description": product.descriptionEn || product.description,
    "sku": product.id,
    "brand": {
      "@type": "Brand",
      "name": "HarirBoutiqueUSA"
    },
    "offers": {
      "@type": "Offer",
      "url": `https://harirboutiqueusa.com/product/${product.id}`,
      "priceCurrency": "USD",
      "price": product.price,
      "itemCondition": "https://schema.org/NewCondition",
      "availability": product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      "shippingDetails": {
        "@type": "OfferShippingDetails",
        "shippingRate": {
          "@type": "MonetaryAmount",
          "value": "Variable",
          "currency": "USD"
        },
        "shippingDestination": {
          "@type": "DefinedRegion",
          "addressCountry": "US"
        }
      }
    }
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
