
export interface Category {
  id: string;
  name: string;
  slug: string;
  image: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  description: string;
  image: string;
  features?: string[];
}

export const CATEGORIES: Category[] = [
  { id: '1', name: 'Makeup', slug: 'makeup', image: 'https://picsum.photos/seed/makeup/400/500' },
  { id: '2', name: 'Skincare', slug: 'skincare', image: 'https://picsum.photos/seed/skincare/400/500' },
  { id: '3', name: 'Haircare', slug: 'haircare', image: 'https://picsum.photos/seed/haircare/400/500' },
  { id: '4', name: 'Vitamins', slug: 'vitamins', image: 'https://picsum.photos/seed/vitamins/400/500' },
  { id: '5', name: 'Bags', slug: 'bags', image: 'https://picsum.photos/seed/bags/400/500' },
  { id: '6', name: 'Watches', slug: 'watches', image: 'https://picsum.photos/seed/watches/400/500' },
];

export const PRODUCTS: Product[] = [
  {
    id: 'p1',
    name: 'Silk Finish Foundation',
    price: 32.00,
    category: 'makeup',
    description: 'A lightweight foundation that provides a natural silk-like finish for all-day wear.',
    image: 'https://picsum.photos/seed/found/600/600',
    features: ['Long-lasting', 'SPF 15', 'Full coverage']
  },
  {
    id: 'p2',
    name: 'Hydrating Rose Serum',
    price: 45.00,
    category: 'skincare',
    description: 'Infused with real rose petals, this serum deeply hydrates and brightens your complexion.',
    image: 'https://picsum.photos/seed/rose/600/600',
    features: ['Vegan', 'Paraben-free', 'Organic']
  },
  {
    id: 'p3',
    name: 'Nourishing Hair Mask',
    price: 28.00,
    category: 'haircare',
    description: 'Intense repair mask for dry and damaged hair. Restores shine and softness in one use.',
    image: 'https://picsum.photos/seed/hairmask/600/600'
  },
  {
    id: 'p4',
    name: 'Daily Multivitamin',
    price: 19.99,
    category: 'vitamins',
    description: 'A complete daily supplement containing all essential nutrients for vitality.',
    image: 'https://picsum.photos/seed/vitprod/600/600'
  },
  {
    id: 'p5',
    name: 'Classic Leather Tote',
    price: 120.00,
    category: 'bags',
    description: 'Handcrafted premium leather tote bag, perfect for everyday essentials.',
    image: 'https://picsum.photos/seed/bagprod/600/600'
  },
  {
    id: 'p6',
    name: 'Minimalist Rose Gold Watch',
    price: 85.00,
    category: 'watches',
    description: 'Elegant rose gold timepiece with a minimalist dial and mesh strap.',
    image: 'https://picsum.photos/seed/watchprod/600/600'
  }
];
