import { ImageSourcePropType } from 'react-native';
import { create } from 'zustand';

/* ---------- Bundled Lovable Picture Assets ---------- */
export const lovableAssets = {
  avAmara: require('../../assets/lovable/av-amara.jpg'),
  avTobi: require('../../assets/lovable/av-tobi.jpg'),
  avZainab: require('../../assets/lovable/av-zainab.jpg'),
  avKelechi: require('../../assets/lovable/av-kelechi.jpg'),
  pSneakers: require('../../assets/lovable/p-sneakers.jpg'),
  pAnkara: require('../../assets/lovable/p-ankara.jpg'),
  pHeadphones: require('../../assets/lovable/p-headphones.jpg'),
  pTote: require('../../assets/lovable/p-tote.jpg'),
  pSkincare: require('../../assets/lovable/p-skincare.jpg'),
  pSunglasses: require('../../assets/lovable/p-sunglasses.jpg'),
  pBeads: require('../../assets/lovable/p-beads.jpg'),
  feedRooftop: require('../../assets/lovable/feed-rooftop.jpg'),
  feedStudio: require('../../assets/lovable/feed-studio.jpg'),
  newsTech: require('../../assets/lovable/news-tech.jpg'),
  newsConcert: require('../../assets/lovable/news-concert.jpg'),
  heroWelcome: require('../../assets/lovable/hero-welcome.jpg'),
};

export type Person = {
  handle: string;
  name: string;
  avatar?: any;
  bio: string;
  location: string;
  verified?: boolean;
  followers: number;
  following: number;
  vendorId?: string;
};

export const people: Person[] = [
  {
    handle: 'amara.styles',
    name: 'Amara Eze',
    avatar: lovableAssets.avAmara,
    bio: 'Stylist · thrift queen · I post fits every Friday ✨',
    location: 'Yaba, Lagos',
    verified: true,
    followers: 18400,
    following: 312,
    vendorId: 'amara-closet',
  },
  {
    handle: 'tobi.wav',
    name: 'Tobi Adeyemi',
    avatar: lovableAssets.avTobi,
    bio: 'Producer. Afrobeats & amapiano. Studio sessions daily.',
    location: 'Lekki, Lagos',
    followers: 9200,
    following: 540,
    vendorId: 'wav-gear',
  },
  {
    handle: 'zainab.glow',
    name: 'Zainab Bello',
    avatar: lovableAssets.avZainab,
    bio: 'Skincare made from Nigerian shea & baobab 🌿',
    location: 'Kaduna',
    verified: true,
    followers: 26100,
    following: 201,
    vendorId: 'glow-botanics',
  },
  {
    handle: 'kelechi.codes',
    name: 'Kelechi Nwosu',
    avatar: lovableAssets.avKelechi,
    bio: 'Building for Africa. Writing about tech & startups.',
    location: 'Abuja',
    followers: 4300,
    following: 890,
  },
];

export const me: Person = {
  handle: 'you',
  name: 'Ada Okafor',
  bio: 'Here for the fits, the gist and the deals.',
  location: 'Surulere, Lagos',
  followers: 248,
  following: 131,
};

export function getPerson(handle: string): Person | undefined {
  if (handle === me.handle || handle === 'ada') return me;
  return people.find((p) => p.handle === handle);
}

/* ---------- Vendors & products ---------- */

export type Vendor = {
  id: string;
  name: string;
  ownerHandle: string;
  location: string;
  pickupAddress: string;
  coords: { lat: number; lng: number };
  rating: number;
  sales: number;
  responseTime: string;
};

export const myCoords = { lat: 6.4969, lng: 3.3553 };

export const vendors: Vendor[] = [
  {
    id: 'amara-closet',
    name: "Amara's Closet",
    ownerHandle: 'amara.styles',
    location: 'Yaba, Lagos',
    pickupAddress: '22 Herbert Macaulay Way, Yaba',
    coords: { lat: 6.5095, lng: 3.3711 },
    rating: 4.8,
    sales: 1240,
    responseTime: '~10 min',
  },
  {
    id: 'wav-gear',
    name: 'WAV Gear',
    ownerHandle: 'tobi.wav',
    location: 'Lekki, Lagos',
    pickupAddress: 'Admiralty Way, Lekki Phase 1',
    coords: { lat: 6.4474, lng: 3.4723 },
    rating: 4.6,
    sales: 530,
    responseTime: '~1 hr',
  },
  {
    id: 'glow-botanics',
    name: 'Glow Botanics',
    ownerHandle: 'zainab.glow',
    location: 'Kaduna',
    pickupAddress: 'Ahmadu Bello Way, Kaduna',
    coords: { lat: 10.5105, lng: 7.4165 },
    rating: 4.9,
    sales: 3120,
    responseTime: '~5 min',
  },
];

export function getVendor(id: string) {
  return vendors.find((v) => v.id === id);
}

export function sellersFor(productIds: string[]): Vendor[] {
  const ids = new Set(
    productIds
      .map((id) => products.find((p) => p.id === id)?.vendorId)
      .filter(Boolean)
  );
  return vendors.filter((v) => ids.has(v.id));
}

export type Category = { id: string; label: string; emoji: string };
export const categories: Category[] = [
  { id: 'all', label: 'All', emoji: '✦' },
  { id: 'fashion', label: 'Fashion', emoji: '👗' },
  { id: 'shoes', label: 'Shoes', emoji: '👟' },
  { id: 'beauty', label: 'Beauty', emoji: '🧴' },
  { id: 'tech', label: 'Tech', emoji: '🎧' },
  { id: 'accessories', label: 'Accessories', emoji: '🕶️' },
];

export type Product = {
  id: string;
  name: string;
  vendorId: string;
  category: string;
  price: number;
  oldPrice?: number;
  image: any;
  rating: number;
  reviews: number;
  stock: number;
  colors?: { name: string; swatch: 'ink' | 'lime' | 'coral' | 'sun' | 'sky' }[];
  sizes?: string[];
  description: string;
  tag?: string;
};

export const products: Product[] = [
  {
    id: 'retro-runner',
    name: 'Retro Runner Sneakers',
    vendorId: 'amara-closet',
    category: 'shoes',
    price: 38500,
    oldPrice: 45000,
    image: lovableAssets.pSneakers,
    rating: 4.7,
    reviews: 182,
    stock: 6,
    colors: [
      { name: 'Forest', swatch: 'ink' },
      { name: 'Lime', swatch: 'lime' },
    ],
    sizes: ['39', '40', '41', '42', '43', '44'],
    description:
      'Chunky, cushioned and made for Lagos pavements. Breathable mesh upper, suede overlays and a grippy sole that survives danfo stairs.',
    tag: 'Trending',
  },
  {
    id: 'ankara-wrap',
    name: 'Sunburst Ankara Wrap Dress',
    vendorId: 'amara-closet',
    category: 'fashion',
    price: 27000,
    image: lovableAssets.pAnkara,
    rating: 4.9,
    reviews: 96,
    stock: 14,
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    description:
      'Hand-cut from 100% cotton wax print. Adjustable wrap tie, flutter sleeves and a hem that moves when you do. Made in Yaba.',
    tag: 'Made in Lagos',
  },
  {
    id: 'studio-cans',
    name: 'Studio ANC Headphones',
    vendorId: 'wav-gear',
    category: 'tech',
    price: 64000,
    oldPrice: 72000,
    image: lovableAssets.pHeadphones,
    rating: 4.5,
    reviews: 64,
    stock: 3,
    colors: [{ name: 'Midnight', swatch: 'ink' }],
    description:
      'Active noise cancelling, 40-hour battery and tuned for heavy low end. Fold-flat design with a hard travel case.',
    tag: 'Only 3 left',
  },
  {
    id: 'raffia-tote',
    name: 'Hand-woven Raffia Tote',
    vendorId: 'amara-closet',
    category: 'accessories',
    price: 15500,
    image: lovableAssets.pTote,
    rating: 4.6,
    reviews: 41,
    stock: 20,
    description:
      'Woven by artisans in Oyo. Roomy enough for your laptop, sturdy enough for the market run.',
  },
  {
    id: 'glow-set',
    name: 'Baobab Glow Ritual Set',
    vendorId: 'glow-botanics',
    category: 'beauty',
    price: 22800,
    oldPrice: 26000,
    image: lovableAssets.pSkincare,
    rating: 4.9,
    reviews: 412,
    stock: 32,
    description:
      'Marula face oil, baobab toning mist, rooibos serum and whipped shea butter. Four steps, zero fragrance, all glow.',
    tag: 'Bestseller',
  },
  {
    id: 'tortoise-shades',
    name: 'Tortoise Oversized Shades',
    vendorId: 'amara-closet',
    category: 'accessories',
    price: 9800,
    image: lovableAssets.pSunglasses,
    rating: 4.4,
    reviews: 57,
    stock: 11,
    description:
      'UV400 green lenses in a chunky acetate frame. Main-character energy guaranteed.',
  },
  {
    id: 'coral-beads',
    name: 'Coral & Jade Statement Beads',
    vendorId: 'glow-botanics',
    category: 'accessories',
    price: 18200,
    image: lovableAssets.pBeads,
    rating: 4.8,
    reviews: 23,
    stock: 4,
    description:
      'Three-strand hand-beaded necklace with gold accents. Perfect for owambe season.',
    tag: 'Handmade',
  },
];

export function getProduct(id: string) {
  return products.find((p) => p.id === id);
}

/* ---------- Stories ---------- */

export type Story = {
  id: string;
  handle: string;
  slides: { image: any; caption: string; productId?: string }[];
};

export const stories: Story[] = [
  {
    id: 's1',
    handle: 'amara.styles',
    slides: [
      {
        image: lovableAssets.pAnkara,
        caption: 'New drop Friday 🔥 sizes XS–XL',
        productId: 'ankara-wrap',
      },
      {
        image: lovableAssets.pSneakers,
        caption: 'Restocked the green ones. Go go go',
        productId: 'retro-runner',
      },
    ],
  },
  {
    id: 's2',
    handle: 'zainab.glow',
    slides: [
      {
        image: lovableAssets.pSkincare,
        caption: 'My 4-step night routine 🌙',
        productId: 'glow-set',
      },
    ],
  },
  {
    id: 's3',
    handle: 'tobi.wav',
    slides: [{ image: lovableAssets.newsConcert, caption: 'Last night was MADDD' }],
  },
  {
    id: 's4',
    handle: 'kelechi.codes',
    slides: [{ image: lovableAssets.newsTech, caption: 'Demo day at the hub 💻' }],
  },
];

/* ---------- Feed ---------- */

export type Post = {
  id: string;
  handle: string;
  time: string;
  text: string;
  image?: any;
  productId?: string;
  newsId?: string;
  likes: number;
  comments: number;
  reposts: number;
};

export const posts: Post[] = [
  {
    id: 'p1',
    handle: 'tobi.wav',
    time: '2h',
    text: "Rooftop sessions with the gang. Lagos sunsets don't miss 🌇",
    image: lovableAssets.feedRooftop,
    likes: 1284,
    comments: 86,
    reposts: 40,
  },
  {
    id: 'p2',
    handle: 'amara.styles',
    time: '4h',
    text: "These just came back in stock and they're already flying. Sizes 39–44 👟",
    productId: 'retro-runner',
    likes: 642,
    comments: 51,
    reposts: 18,
  },
  {
    id: 'p3',
    handle: 'kelechi.codes',
    time: '5h',
    text: "Lagos startups raised more this quarter than the whole of last year. Thread on what's working 👇",
    newsId: 'n1',
    likes: 410,
    comments: 73,
    reposts: 112,
  },
  {
    id: 'p4',
    handle: 'amara.styles',
    time: '1d',
    text: 'Behind the scenes at the studio. 30 metres of wax print and one very tired sewing machine 😅',
    image: lovableAssets.feedStudio,
    likes: 2310,
    comments: 140,
    reposts: 64,
  },
  {
    id: 'p5',
    handle: 'zainab.glow',
    time: '1d',
    text: 'Harmattan is coming. Your skin barrier will thank you for the shea butter now, not later.',
    productId: 'glow-set',
    likes: 980,
    comments: 66,
    reposts: 29,
  },
];

export function getPost(id: string) {
  return posts.find((p) => p.id === id);
}

export type Comment = {
  id: string;
  handle: string;
  text: string;
  time: string;
  likes: number;
};

export const comments: Record<string, Comment[]> = {
  p1: [
    { id: 'c1', handle: 'amara.styles', text: 'Invite me next time abeg 😭', time: '1h', likes: 24 },
    { id: 'c2', handle: 'kelechi.codes', text: 'That skyline is unreal', time: '58m', likes: 9 },
  ],
  p4: [
    { id: 'c3', handle: 'zainab.glow', text: 'The print on the left!! Need it', time: '20h', likes: 31 },
    { id: 'c4', handle: 'tobi.wav', text: 'Respect the hustle 🙌🏾', time: '18h', likes: 12 },
  ],
};

/* ---------- News ---------- */

export type NewsItem = {
  id: string;
  title: string;
  category: string;
  image: any;
  author: string;
  time: string;
  readMins: number;
  excerpt: string;
  body: string[];
};

export const news: NewsItem[] = [
  {
    id: 'n1',
    title: "Lagos startups just had their biggest quarter ever — here's who's hiring",
    category: 'Tech',
    image: lovableAssets.newsTech,
    author: 'Kelechi Nwosu',
    time: '5h ago',
    readMins: 4,
    excerpt: 'Fintech still leads, but creator tools and logistics are catching up fast.',
    body: [
      'Young founders in Lagos raised more in the last three months than in all of last year, with fintech, creator tools and last-mile logistics leading the pack.',
      'Most of the money went to early-stage teams with fewer than 20 people — which means a lot of junior roles are opening up for designers, developers and community managers.',
      'We spoke to five founders about what they look for when hiring. The short version: show your work, ship something, and be online where your users are.',
    ],
  },
  {
    id: 'n2',
    title: 'The Afrobeats summer tour dates are out. Lagos gets two nights',
    category: 'Music',
    image: lovableAssets.newsConcert,
    author: 'Tobi Adeyemi',
    time: '1d ago',
    readMins: 3,
    excerpt: "Tickets drop Friday at noon. Here's how to not get scammed.",
    body: [
      'The biggest names in Afrobeats are bringing the summer tour home, with two back-to-back nights at Eko Convention Centre.',
      'Tickets go on sale Friday at noon. Only buy from the official link — resellers on social media have already started posting fake listings.',
    ],
  },
  {
    id: 'n3',
    title: 'Thrift is the new luxury: how Gen Z is rewriting Yaba market',
    category: 'Style',
    image: lovableAssets.feedStudio,
    author: 'Amara Eze',
    time: '2d ago',
    readMins: 5,
    excerpt: 'Okrika, upcycling and the designers turning bale finds into runway looks.',
    body: [
      "Walk through Yaba market on a Saturday and you'll see it: stylists with ring lights, resellers with QR codes, and designers hunting for the perfect bale.",
      'Upcycling has gone from side hustle to full-blown movement, and local brands are leaning in.',
    ],
  },
];

export function getNews(id: string) {
  return news.find((n) => n.id === id);
}

/* ---------- Notifications ---------- */

export type Notification = {
  id: string;
  kind: 'like' | 'follow' | 'order' | 'comment' | 'promo';
  handle?: string;
  text: string;
  time: string;
  unread?: boolean;
};

export const notifications: Notification[] = [
  { id: 'x1', kind: 'order', text: 'Your Retro Runner Sneakers are out for delivery 🛵', time: '10m', unread: true },
  { id: 'x2', kind: 'like', handle: 'amara.styles', text: 'liked your comment', time: '1h', unread: true },
  { id: 'x3', kind: 'follow', handle: 'zainab.glow', text: 'started following you', time: '3h', unread: true },
  { id: 'x4', kind: 'comment', handle: 'tobi.wav', text: 'replied: “Pull up next Saturday!”', time: '5h' },
  { id: 'x5', kind: 'promo', text: 'Weekend flash sale: up to 30% off Beauty', time: '1d' },
];

/* ---------- Wallet ---------- */

export type Txn = { id: string; label: string; detail: string; amount: number; time: string };
export const transactions: Txn[] = [
  { id: 't1', label: 'Glow Botanics', detail: 'Order #AK-2041', amount: -22800, time: 'Today, 09:12' },
  { id: 't2', label: 'Wallet top-up', detail: 'From GTBank ••42', amount: 50000, time: 'Yesterday' },
  { id: 't3', label: 'Referral bonus', detail: 'Zainab joined Aktive', amount: 1000, time: 'Mon' },
  { id: 't4', label: "Amara's Closet", detail: 'Order #AK-1987', amount: -38500, time: 'Sat' },
  { id: 't5', label: 'Refund', detail: 'Order #AK-1902', amount: 9800, time: 'Last week' },
];

/* ---------- Orders (sample history) ---------- */

export type OrderStatus = 'placed' | 'packed' | 'shipped' | 'delivered';
export const orderSteps: { key: OrderStatus; label: string }[] = [
  { key: 'placed', label: 'Order placed' },
  { key: 'packed', label: 'Packed by vendor' },
  { key: 'shipped', label: 'Out for delivery' },
  { key: 'delivered', label: 'Delivered' },
];

export type Order = {
  id: string;
  date: string;
  status: OrderStatus;
  items: { productId: string; qty: number; option?: string | undefined }[];
  total: number;
  address: string;
  delivery: 'pickup' | 'delivery';
};

export const sampleOrders: Order[] = [
  {
    id: 'AK-2041',
    date: 'Today',
    status: 'shipped',
    items: [{ productId: 'retro-runner', qty: 1, option: 'Forest · 41' }],
    total: 38500,
    address: '14 Adeniran Ogunsanya St, Surulere',
    delivery: 'delivery',
  },
  {
    id: 'AK-1987',
    date: 'Sat, 7 Nov',
    status: 'delivered',
    items: [
      { productId: 'glow-set', qty: 1 },
      { productId: 'tortoise-shades', qty: 1 },
    ],
    total: 35100,
    address: '14 Adeniran Ogunsanya St, Surulere',
    delivery: 'pickup',
  },
];

/* ---------- Vendor dashboard (seller view for Amara's Closet) ---------- */

export const vendorSales = [
  { day: 'Mon', sales: 42000 },
  { day: 'Tue', sales: 61500 },
  { day: 'Wed', sales: 38000 },
  { day: 'Thu', sales: 87000 },
  { day: 'Fri', sales: 124000 },
  { day: 'Sat', sales: 98500 },
  { day: 'Sun', sales: 71000 },
];

export type VendorOrder = {
  id: string;
  buyer: string;
  productId: string;
  amount: number;
  status: 'new' | 'packing' | 'shipped';
  time: string;
};

export const vendorOrders: VendorOrder[] = [
  { id: 'AK-2058', buyer: 'Chioma A.', productId: 'ankara-wrap', amount: 27000, status: 'new', time: '4 min ago' },
  { id: 'AK-2055', buyer: 'Femi O.', productId: 'retro-runner', amount: 38500, status: 'new', time: '22 min ago' },
  { id: 'AK-2049', buyer: 'Halima S.', productId: 'raffia-tote', amount: 15500, status: 'packing', time: '1 hr ago' },
  { id: 'AK-2041', buyer: 'Ada O.', productId: 'retro-runner', amount: 38500, status: 'shipped', time: 'Today' },
];

export const interests = [
  'Fashion',
  'Sneakers',
  'Beauty',
  'Afrobeats',
  'Tech',
  'Food',
  'Football',
  'Thrift',
  'Startups',
  'Art',
  'Gaming',
  'Owambe',
];

/* ---------- Pricing & Formatting ---------- */

export const RIDER_BASE_FEE = 1000;
export const RIDER_PER_KM = 200;
export const LOCAL_RADIUS_KM = 50;
export const INTERSTATE_FEE = 8000;

export type DeliveryOption = 'pickup' | 'delivery';
export type LatLng = { lat: number; lng: number };
export type PricedLine = { price: number; qty: number };

export function subtotalOf(lines: PricedLine[]): number {
  return lines.reduce((sum, l) => sum + l.price * l.qty, 0);
}

export function distanceKm(a: LatLng, b: LatLng): number {
  const r = (d: number) => (d * Math.PI) / 180;
  const h =
    Math.sin(r(b.lat - a.lat) / 2) ** 2 +
    Math.cos(r(a.lat)) * Math.cos(r(b.lat)) * Math.sin(r(b.lng - a.lng) / 2) ** 2;
  return Math.round(12742 * Math.asin(Math.sqrt(h)) * 10) / 10;
}

export function riderFee(km: number): number {
  if (km > LOCAL_RADIUS_KM) return INTERSTATE_FEE;
  return Math.ceil((RIDER_BASE_FEE + RIDER_PER_KM * km) / 50) * 50;
}

export function deliveryFee(sellerDistancesKm: number[], option: DeliveryOption): number {
  if (option === 'pickup') return 0;
  return sellerDistancesKm.reduce((sum, km) => sum + riderFee(km), 0);
}

export function orderTotal(lines: PricedLine[], sellerDistancesKm: number[], option: DeliveryOption) {
  const subtotal = subtotalOf(lines);
  const delivery = subtotal > 0 ? deliveryFee(sellerDistancesKm, option) : 0;
  return { subtotal, delivery, total: subtotal + delivery };
}

export function formatKm(km: number): string {
  return km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(km < 10 ? 1 : 0)} km`;
}

const naira = new Intl.NumberFormat('en-NG', { maximumFractionDigits: 0 });
export function formatNaira(amount: number): string {
  const sign = amount < 0 ? '−' : '';
  return `${sign}₦${naira.format(Math.abs(amount))}`;
}

export function compact(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1).replace(/\.0$/, '')}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, '')}k`;
  return String(n);
}

/* ---------- Lovable Store (Zustand) ---------- */

export type CartLine = {
  key: string;
  productId: string;
  qty: number;
  color?: string | undefined;
  size?: string | undefined;
};

export type Profile = {
  name: string;
  email: string;
  role: 'buyer' | 'vendor';
  intents: string[];
  interests: string[];
};

export type AppState = {
  signedIn: boolean;
  profile: Profile;
  cart: CartLine[];
  wishlist: string[];
  likedPosts: string[];
  savedPosts: string[];
  following: string[];
  orders: Order[];
  myPosts: { id: string; text: string; time: string; image?: any }[];
  storeName: string;
  storeLive: boolean;
};

function toggleIn(list: string[], id: string) {
  return list.includes(id) ? list.filter((x) => x !== id) : [...list, id];
}

export const useLovableStore = create<AppState>(() => ({
  signedIn: true,
  profile: { name: 'Ada Okafor', email: 'ada@aktive.ng', role: 'buyer', intents: ['shop', 'connect'], interests: ['Fashion', 'Sneakers', 'Afrobeats'] },
  cart: [],
  wishlist: ['retro-runner', 'glow-set'],
  likedPosts: ['p1', 'p4'],
  savedPosts: ['p2'],
  following: ['amara.styles', 'zainab.glow'],
  orders: [],
  myPosts: [],
  storeName: '',
  storeLive: false,
}));

export function useApp<T>(selector: (s: AppState) => T): T {
  return useLovableStore(selector);
}

export const actions = {
  signIn(partial?: Partial<Profile>) {
    useLovableStore.setState((s) => ({
      ...s,
      signedIn: true,
      profile: { ...s.profile, ...partial },
    }));
  },
  signOut() {
    useLovableStore.setState((s) => ({
      ...s,
      signedIn: false,
    }));
  },
  updateProfile(partial: Partial<Profile>) {
    useLovableStore.setState((s) => ({
      ...s,
      profile: { ...s.profile, ...partial },
    }));
  },
  addToCart(productId: string, opts: { qty?: number; color?: string; size?: string } = {}) {
    const key = [productId, opts.color ?? '', opts.size ?? ''].join('|');
    useLovableStore.setState((s) => {
      const existing = s.cart.find((l) => l.key === key);
      const cart = existing
        ? s.cart.map((l) => (l.key === key ? { ...l, qty: l.qty + (opts.qty ?? 1) } : l))
        : [...s.cart, { key, productId, qty: opts.qty ?? 1, color: opts.color, size: opts.size }];
      return { ...s, cart };
    });
  },
  setQty(key: string, qty: number) {
    useLovableStore.setState((s) => ({
      ...s,
      cart: qty <= 0 ? s.cart.filter((l) => l.key !== key) : s.cart.map((l) => (l.key === key ? { ...l, qty } : l)),
    }));
  },
  removeLine(key: string) {
    useLovableStore.setState((s) => ({
      ...s,
      cart: s.cart.filter((l) => l.key !== key),
    }));
  },
  toggleWishlist(productId: string) {
    useLovableStore.setState((s) => ({
      ...s,
      wishlist: toggleIn(s.wishlist, productId),
    }));
  },
  toggleLike(postId: string) {
    useLovableStore.setState((s) => ({
      ...s,
      likedPosts: toggleIn(s.likedPosts, postId),
    }));
  },
  toggleSave(postId: string) {
    useLovableStore.setState((s) => ({
      ...s,
      savedPosts: toggleIn(s.savedPosts, postId),
    }));
  },
  toggleFollow(handle: string) {
    useLovableStore.setState((s) => ({
      ...s,
      following: toggleIn(s.following, handle),
    }));
  },
  placeOrder(input: { total: number; address: string; delivery: DeliveryOption }): string {
    const currentOrders = useLovableStore.getState().orders;
    const id = `AK-${2060 + currentOrders.length}`;
    useLovableStore.setState((s) => ({
      ...s,
      orders: [
        {
          id,
          date: 'Just now',
          status: 'placed',
          total: input.total,
          address: input.address,
          delivery: input.delivery,
          items: s.cart.map((l) => ({
            productId: l.productId,
            qty: l.qty,
            option: [l.color, l.size].filter(Boolean).join(' · ') || undefined,
          })),
        },
        ...s.orders,
      ],
      cart: [],
    }));
    return id;
  },
  addPost(text: string, image?: any) {
    useLovableStore.setState((s) => ({
      ...s,
      myPosts: [{ id: `m${Date.now()}`, text, time: 'now', image }, ...s.myPosts],
    }));
  },
  launchStore(name: string) {
    useLovableStore.setState((s) => ({
      ...s,
      storeName: name,
      storeLive: true,
      profile: { ...s.profile, role: 'vendor' },
    }));
  },
};
