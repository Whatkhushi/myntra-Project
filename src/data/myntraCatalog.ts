export interface MyntraItem {
  id: string;
  name: string;
  image: string;
  category: string;
  tags: string[];
  price: number;
  season: string;
  occasion: string;
  colors: string[];
  brand: string;
  rating?: number;
  originalPrice?: number;
  discount?: number;
}

export const myntraCatalog: MyntraItem[] = [
  // Tops
  {
    id: "mt1",
    name: "Urban Neon Crop Jacket",
    image: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400&h=400&fit=crop&crop=center",
    category: "tops",
    tags: ["trendy", "neon", "jacket", "crop"],
    price: 2499,
    season: "winter",
    occasion: "party",
    colors: ["neon", "green", "black"],
    brand: "StyleHub",
    rating: 4.2,
    originalPrice: 3499,
    discount: 29
  },
  {
    id: "mt2", 
    name: "Classic White Cotton Shirt",
    image: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400&h=400&fit=crop&crop=center",
    category: "tops",
    tags: ["classic", "cotton", "formal", "white"],
    price: 1299,
    season: "all",
    occasion: "formal",
    colors: ["white"],
    brand: "Formal Co",
    rating: 4.5,
    originalPrice: 1599,
    discount: 19
  },
  {
    id: "mt3",
    name: "Embroidered Kurta Top",
    image: "https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=400&h=400&fit=crop&crop=center",
    category: "tops",
    tags: ["ethnic", "embroidered", "festive", "kurta"],
    price: 1899,
    season: "winter",
    occasion: "festival",
    colors: ["maroon", "gold"],
    brand: "Ethnic Vibes",
    rating: 4.7,
    originalPrice: 2499,
    discount: 24
  },

  // Bottoms
  {
    id: "mb1",
    name: "High-Rise Mom Jeans",
    image: "https://images.unsplash.com/photo-1582418702059-97ebafb35d09?w=400&h=400&fit=crop&crop=center",
    category: "bottoms",
    tags: ["denim", "high-rise", "vintage", "mom-jeans"],
    price: 2199,
    season: "all",
    occasion: "casual",
    colors: ["blue", "denim"],
    brand: "Denim Co"
  },
  {
    id: "mb2",
    name: "Flowy Palazzo Pants", 
    image: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400&h=400&fit=crop&crop=center",
    category: "bottoms",
    tags: ["palazzo", "flowy", "comfortable", "ethnic"],
    price: 1599,
    season: "summer",
    occasion: "casual",
    colors: ["black", "navy"],
    brand: "Comfort Zone"
  },
  {
    id: "mb3",
    name: "Pleated Mini Skirt",
    image: "https://images.unsplash.com/photo-1583496661160-fb5886a13d77?w=400&h=400&fit=crop&crop=center",
    category: "bottoms",
    tags: ["pleated", "mini", "skirt", "trendy"],
    price: 1399,
    season: "summer",
    occasion: "party",
    colors: ["black", "white"],
    brand: "Trendy Threads"
  },

  // Shoes
  {
    id: "ms1",
    name: "Chunky Platform Sneakers",
    image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=400&fit=crop&crop=center",
    category: "shoes",
    tags: ["sneakers", "platform", "chunky", "trendy"],
    price: 3299,
    season: "all",
    occasion: "casual",
    colors: ["white", "pink"],
    brand: "Street Style"
  },
  {
    id: "ms2",
    name: "Classic Black Heels",
    image: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=400&h=400&fit=crop&crop=center",
    category: "shoes", 
    tags: ["heels", "classic", "formal", "black"],
    price: 2799,
    season: "all",
    occasion: "formal",
    colors: ["black"],
    brand: "Formal Footwear"
  },
  {
    id: "ms3",
    name: "Embellished Juttis",
    image: "https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=400&h=400&fit=crop&crop=center",
    category: "shoes",
    tags: ["juttis", "ethnic", "embellished", "traditional"],
    price: 1899,
    season: "all", 
    occasion: "festival",
    colors: ["gold", "red"],
    brand: "Heritage"
  },

  // Accessories
  {
    id: "ma1", 
    name: "Trendy Bucket Hat",
    image: "https://images.unsplash.com/photo-1521369909029-2afed882baee?w=400&h=400&fit=crop&crop=center",
    category: "accessories",
    tags: ["hat", "bucket", "trendy", "streetwear"],
    price: 899,
    season: "summer",
    occasion: "casual",
    colors: ["beige", "black"],
    brand: "Street Vibes"
  },
  {
    id: "ma2",
    name: "Statement Chain Necklace",
    image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&h=400&fit=crop&crop=center",
    category: "accessories",
    tags: ["necklace", "chain", "statement", "gold"],
    price: 1499,
    season: "all",
    occasion: "party",
    colors: ["gold"],
    brand: "Glam Jewelry"
  },
  {
    id: "ma3",
    name: "Embroidered Dupatta",
    image: "https://images.unsplash.com/photo-1583391733585-18e2e5f87728?w=400&h=400&fit=crop&crop=center",
    category: "accessories",
    tags: ["dupatta", "embroidered", "ethnic", "silk"],
    price: 1999,
    season: "winter",
    occasion: "festival",
    colors: ["red", "gold"],
    brand: "Silk Route"
  },

  // Dresses
  {
    id: "md1",
    name: "Boho Maxi Dress",
    image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&h=400&fit=crop&crop=center",
    category: "dresses",
    tags: ["maxi", "boho", "floral", "summer"],
    price: 2899,
    season: "summer",
    occasion: "casual",
    colors: ["floral", "white"],
    brand: "Boho Chic"
  },
  {
    id: "md2",
    name: "Little Black Dress",
    image: "https://images.unsplash.com/photo-1566479179817-c33607d4b4f2?w=400&h=400&fit=crop&crop=center", 
    category: "dresses",
    tags: ["lbd", "classic", "party", "elegant"],
    price: 3499,
    season: "all",
    occasion: "party",
    colors: ["black"],
    brand: "Elegant Evening"
  },
  {
    id: "md3",
    name: "Anarkali Suit Set",
    image: "https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=400&h=400&fit=crop&crop=center",
    category: "dresses", 
    tags: ["anarkali", "ethnic", "suit", "festive"],
    price: 4299,
    season: "winter",
    occasion: "festival",
    colors: ["blue", "gold"],
    brand: "Royal Ethnic"
  }
];

export const seasonalSuggestions = [
  {
    id: "s1",
    title: "Rainy Week Vibes",
    emoji: "🌧️",
    description: "Monsoon Mood",
    items: ["denim shorts", "waterproof jacket", "cute rain boots"],
    season: "monsoon"
  },
  {
    id: "s3",
    title: "College Fest Mode",
    emoji: "🎵", 
    description: "Concert-Ready",
    items: ["black tee", "ripped jeans", "bucket hat"],
    season: "all"
  },
  {
    id: "s4",
    title: "Beach Wedding Guest",
    emoji: "🌴",
    description: "Beach Vibes",
    items: ["flowy maxi dress", "straw hat", "sandals"],
    season: "summer"
  },
  {
    id: "s5",
    title: "Cozy Winter Layers",
    emoji: "❄️", 
    description: "Winter Warmth",
    items: ["oversized sweater", "high-waist jeans", "boots"],
    season: "winter"
  },
  {
    id: "s6",
    title: "Date Night Glam",
    emoji: "💖",
    description: "Date Ready",
    items: ["little black dress", "heels", "statement necklace"],
    season: "all"
  }
];