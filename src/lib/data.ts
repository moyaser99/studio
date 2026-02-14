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
  categoryName: string;
  description: string;
  image: string;
  features?: string[];
}

export const CATEGORIES: Category[] = [
  { id: '1', name: 'المكياج', slug: 'makeup', image: 'https://picsum.photos/seed/makeup/400/500' },
  { id: '2', name: 'العناية بالبشرة', slug: 'skincare', image: 'https://picsum.photos/seed/skincare/400/500' },
  { id: '3', name: 'العناية بالشعر', slug: 'haircare', image: 'https://picsum.photos/seed/haircare/400/500' },
  { id: '4', name: 'الفيتامينات', slug: 'vitamins', image: 'https://picsum.photos/seed/vitamins/400/500' },
  { id: '5', name: 'الحقائب', slug: 'bags', image: 'https://picsum.photos/seed/bags/400/500' },
  { id: '6', name: 'الساعات', slug: 'watches', image: 'https://picsum.photos/seed/watches/400/500' },
];

export const PRODUCTS: Product[] = [
  {
    id: 'p1',
    name: 'كريم أساس بلمسة حريرية',
    price: 32.00,
    category: 'makeup',
    categoryName: 'المكياج',
    description: 'كريم أساس خفيف الوزن يوفر لمسة نهائية حريرية طبيعية تدوم طوال اليوم.',
    image: 'https://picsum.photos/seed/found/600/600',
    features: ['يدوم طويلاً', 'معامل حماية SPF 15', 'تغطية كاملة']
  },
  {
    id: 'p2',
    name: 'سيروم الورد المرطب',
    price: 45.00,
    category: 'skincare',
    categoryName: 'العناية بالبشرة',
    description: 'غني ببتلات الورد الطبيعية، هذا السيروم يرطب البشرة بعمق ويمنحها إشراقة مميزة.',
    image: 'https://picsum.photos/seed/rose/600/600',
    features: ['نباتي', 'خالٍ من البارابين', 'عضوي']
  },
  {
    id: 'p3',
    name: 'ماسك الشعر المغذي',
    price: 28.00,
    category: 'haircare',
    categoryName: 'العناية بالشعر',
    description: 'قناع إصلاح مكثف للشعر الجاف والتالف. يعيد اللمعان والنعومة من أول استخدام.',
    image: 'https://picsum.photos/seed/hairmask/600/600'
  },
  {
    id: 'p4',
    name: 'فيتامينات يومية متعددة',
    price: 19.99,
    category: 'vitamins',
    categoryName: 'الفيتامينات',
    description: 'مكمل يومي كامل يحتوي على جميع العناصر الغذائية الضرورية للحيوية.',
    image: 'https://picsum.photos/seed/vitprod/600/600'
  },
  {
    id: 'p5',
    name: 'حقيبة يد جلدية كلاسيكية',
    price: 120.00,
    category: 'bags',
    categoryName: 'الحقائب',
    description: 'حقيبة يد مصنوعة يدوياً من الجلد الفاخر، مثالية للأساسيات اليومية.',
    image: 'https://picsum.photos/seed/bagprod/600/600'
  },
  {
    id: 'p6',
    name: 'ساعة روز جولد بسيطة',
    price: 85.00,
    category: 'watches',
    categoryName: 'الساعات',
    description: 'ساعة أنيقة باللون الروز جولد مع ميناء بسيط وسوار شبكي.',
    image: 'https://picsum.photos/seed/watchprod/600/600'
  }
];
