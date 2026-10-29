export type Sector = {
  key: string;
  label: string;
  emoji: string;
  description: string;
  subcategories: string[];
  tint: string;
};

export const SECTORS: Sector[] = [
  {
    key: 'female-clothes',
    label: 'Female Clothes',
    emoji: '👗',
    description: "Women's fashion, dresses, two-pieces, skirts & traditional Ankara wear",
    subcategories: [
      'Dresses & Gowns',
      'Tops & Blouses',
      'Two-Piece Sets',
      'Skirts & Pants',
      'Traditional & Ankara',
      'Jumpsuits & Playsuits',
      'Denim & Jeans',
      'Loungewear & Sleepwear',
    ],
    tint: 'rgba(233, 30, 99, 0.15)',
  },
  {
    key: 'male-clothes',
    label: 'Male Clothes',
    emoji: '👔',
    description: "Men's fashion, suits, native wear, shirts & casual streetwear",
    subcategories: [
      'Shirts & Polos',
      'Native Wear & Kaftans',
      'Trousers & Chinos',
      'Suits & Blazers',
      'Hoodies & Sweatshirts',
      'T-Shirts & Tanks',
      'Shorts & Cargo',
      'Jackets & Coats',
    ],
    tint: 'rgba(33, 150, 243, 0.15)',
  },
  {
    key: 'wigs-hair',
    label: 'Wigs & Hair',
    emoji: '💇‍♀️',
    description: 'Human hair, bone straight, closures, frontals, braids & hair accessories',
    subcategories: [
      'Human Hair Wigs',
      'Bone Straight & Curls',
      'Lace Frontals & Closures',
      'Hair Bundles & Weaves',
      'Synthetic Wigs',
      'Braids & Extensions',
      'Hair Care & Adhesives',
    ],
    tint: 'rgba(156, 39, 176, 0.15)',
  },
  {
    key: 'accessories-jewelry',
    label: 'Accessories & Jewelry',
    emoji: '💍',
    description: 'Watches, chains, sunglasses, earrings, rings, belts & caps',
    subcategories: [
      'Watches & Timepieces',
      'Necklaces & Pendants',
      'Earrings & Rings',
      'Bracelets & Bangles',
      'Sunglasses & Frames',
      'Belts & Buckles',
      'Caps, Hats & Beanies',
    ],
    tint: 'rgba(255, 193, 7, 0.15)',
  },
  {
    key: 'shoes-footwear',
    label: 'Shoes & Footwear',
    emoji: '👠',
    description: 'Heels, sneakers, loafers, slides, sandals & formal shoes',
    subcategories: [
      'Heels & Wedges',
      'Sneakers & Trainers',
      'Slides & Slippers',
      'Loafers & Oxford Shoes',
      'Boots & Ankle Boots',
      'Sandals & Flats',
    ],
    tint: 'rgba(76, 175, 80, 0.15)',
  },
  {
    key: 'bags-wallets',
    label: 'Bags & Wallets',
    emoji: '👜',
    description: 'Handbags, totes, crossbody bags, clutches, backpacks & wallets',
    subcategories: [
      'Handbags & Totes',
      'Crossbody & Shoulder Bags',
      'Clutches & Mini Bags',
      'Backpacks & Travel Bags',
      'Wallets & Cardholders',
    ],
    tint: 'rgba(255, 87, 34, 0.15)',
  },
  {
    key: 'beauty-skincare',
    label: 'Beauty & Skincare',
    emoji: '💄',
    description: 'Makeup, cosmetics, skincare, perfumes, oils & body care',
    subcategories: [
      'Skincare & Serums',
      'Perfumes & Fragrances',
      'Makeup & Lipsticks',
      'Body Oils & Lotions',
      'Nail Care & Lashes',
    ],
    tint: 'rgba(240, 98, 146, 0.15)',
  },
  {
    key: 'gadgets-electronics',
    label: 'Gadgets & Tech',
    emoji: '🎧',
    description: 'Phone accessories, AirPods, chargers, smartwatches & audio',
    subcategories: [
      'Phone Cases & Grips',
      'Earbuds & Headphones',
      'Smartwatches & Bands',
      'Chargers & Cables',
      'Bluetooth Speakers',
    ],
    tint: 'rgba(0, 188, 212, 0.15)',
  },
  {
    key: 'home-fragrance',
    label: 'Home & Living',
    emoji: '🛋️',
    description: 'Scented candles, diffusers, bedding, decor & lifestyle',
    subcategories: [
      'Scented Candles & Diffusers',
      'Bedding & Pillows',
      'Room Decor & Lighting',
      'Kitchen & Dining',
    ],
    tint: 'rgba(121, 85, 72, 0.15)',
  },
  {
    key: 'others',
    label: 'Others',
    emoji: '✨',
    description: 'Specialty products, custom crafts & other unlisted items',
    subcategories: ['Custom Crafts', 'Specialty Items', 'General Merchandise'],
    tint: 'rgba(158, 158, 158, 0.15)',
  },
];

export const getSectorByKey = (key: string): Sector | undefined => {
  return SECTORS.find((s) => s.key === key.toLowerCase());
};

export const getSectorLabels = (): string[] => {
  return SECTORS.map((s) => s.label);
};
