// Mock data for festive product looks
export interface Product {
  id: number;
  name: string;
  price: string;
  seller: string;
  tag: string;
  image: string;
}

export interface FestiveLook {
  title: string;
  tag: string;
  products: Product[];
}

export const festiveLooks: Record<string, FestiveLook> = {
  navratri: {
    title: "Navratri Garba Look",
    tag: "Festive",
    products: [
      {
        id: 1,
        name: "Mirror Work Chaniya Choli",
        price: "₹3,499",
        seller: "Ethnic Styles",
        tag: "Best Seller",
        image: "/images/navratri/Screenshot 2025-09-20 193528.png"
      },
      {
        id: 2,
        name: "Traditional Jewelry Set",
        price: "₹1,899",
        seller: "Festive Wear",
        tag: "New",
        image: "/images/navratri/Screenshot 2025-09-20 194537.png"
      },
      {
        id: 3,
        name: "Gold Temple Jewelry",
        price: "₹1,299",
        seller: "Navratri Essentials",
        tag: "Trending",
        image: "/images/navratri/Screenshot 2025-09-20 200554.png"
      },
      {
        id: 4,
        name: "Heavy Embroidered Lehenga",
        price: "₹2,999",
        seller: "Heritage Jewelry",
        tag: "Premium",
        image: "/images/navratri/Screenshot 2025-09-20 200838.png"
      },
      {
        id: 5,
        name: "Embellished Sneakers",
        price: "₹899",
        seller: "Ethnic Accessories",
        tag: "On Sale",
        image: "/images/navratri/Screenshot 2025-09-20 201116.png"
      },
      {
        id: 6,
        name: "Traditional Dupatta",
        price: "₹1,599",
        seller: "Dance Essentials",
        tag: "Comfort",
        image: "/images/navratri/Screenshot 2025-09-20 201415.png"
      }
    ]
  },
  diwali: {
    title: "Diwali Festive Look",
    tag: "Festive",
    products: [
      {
        id: 7,
        name: "Embroidered Kurta Set",
        price: "₹4,299",
        seller: "Royal Ethnic",
        tag: "Best Seller",
        image: "/images/diwali/Screenshot 2025-09-20 190430.png"
      },
      {
        id: 8,
        name: "Traditional Jewelry Set",
        price: "₹2,199",
        seller: "Luxury Fabrics",
        tag: "Premium",
        image: "/images/diwali/Screenshot 2025-09-20 191813.png"
      },
      {
        id: 9,
        name: "Designer Juttis",
        price: "₹1,799",
        seller: "Ethnic Footwear",
        tag: "New",
        image: "/images/diwali/Screenshot 2025-09-20 191948.png"
      },
      {
        id: 10,
        name: "Heavy Embroidered Lehenga",
        price: "₹3,499",
        seller: "Heritage Jewelry",
        tag: "Trending",
        image: "/images/diwali/Screenshot 2025-09-20 192132.png"
      },
      {
        id: 11,
        name: "Pearl Necklace Set",
        price: "₹2,299",
        seller: "Classic Jewelry",
        tag: "Elegant",
        image: "/images/diwali/Screenshot 2025-09-20 192340.png"
      }
    ]
  },
  autumn: {
    title: "Autumn Cozy Look",
    tag: "Autumn",
    products: [
      {
        id: 13,
        name: "Knit Sweater",
        price: "₹2,499",
        seller: "Cozy Comfort",
        tag: "Best Seller",
        image: "/images/autumn/Screenshot 2025-09-20 202905.png"
      },
      {
        id: 14,
        name: "Ankle Boots",
        price: "₹3,299",
        seller: "Footwear Plus",
        tag: "Trending",
        image: "/images/autumn/Screenshot 2025-09-20 203143.png"
      },
      {
        id: 15,
        name: "Wool Scarf",
        price: "₹1,199",
        seller: "Winter Essentials",
        tag: "New",
        image: "/images/autumn/Screenshot 2025-09-20 204053.png"
      },
      {
        id: 16,
        name: "Beanie Hat",
        price: "₹799",
        seller: "Headwear Co",
        tag: "Comfort",
        image: "/images/autumn/Screenshot 2025-09-20 204208.png"
      },
      {
        id: 17,
        name: "Layered Necklace",
        price: "₹1,499",
        seller: "Modern Jewelry",
        tag: "Stylish",
        image: "/images/autumn/Screenshot 2025-09-20 204352.png"
      }
    ]
  },
  shaadi: {
    title: "Shadi Season Look",
    tag: "Bridal Elegance",
    products: [
      {
        id: 18,
        name: "Heavy Embroidered Lehenga",
        price: "₹15,999",
        seller: "Bridal Couture",
        tag: "Premium",
        image: "/images/shaadi season/Screenshot 2025-09-20 232911.png"
      },
      {
        id: 19,
        name: "Green Embroidered Lehenga / Anarkali Set",
        price: "₹12,999",
        seller: "Heritage Jewelry",
        tag: "Best Seller",
        image: "/images/shaadi season/Screenshot 2025-09-20 233140.png"
      },
      {
        id: 20,
        name: "Black Evening Gown",
        price: "₹8,999",
        seller: "Luxury Footwear",
        tag: "New",
        image: "/images/shaadi season/Screenshot 2025-09-20 233229.png"
      },
      {
        id: 21,
        name: "Black Sequin Saree",
        price: "₹6,999",
        seller: "Royal Fabrics",
        tag: "Trending",
        image: "/images/shaadi season/Screenshot 2025-09-20 233300.png"
      },
      {
        id: 22,
        name: "White Embroidered Saree",
        price: "₹4,999",
        seller: "Traditional Jewelry",
        tag: "Elegant",
        image: "/images/shaadi season/Screenshot 2025-09-20 233405.png"
      },
      {
        id: 23,
        name: "Black Sherwani",
        price: "₹7,999",
        seller: "Artisan Jewelry",
        tag: "Handcrafted",
        image: "/images/shaadi season/Screenshot 2025-09-20 233452.png"
      },
      {
        id: 24,
        name: "Men's White Kurta with Pajama",
        price: "₹2,999",
        seller: "Bridal Accessories",
        tag: "Comfort",
        image: "/images/shaadi season/Screenshot 2025-09-20 233556.png"
      }
    ]
  },
  concert: {
    title: "Concert Night Look",
    tag: "Edgy & Bold",
    products: [
      {
        id: 25,
        name: "Leather Camisole Top",
        price: "₹3,999",
        seller: "Street Style",
        tag: "Trending",
        image: "/images/concert looks/Screenshot 2025-09-21 000934.png"
      },
      {
        id: 26,
        name: "Distressed Black Jeans",
        price: "₹2,499",
        seller: "Urban Denim",
        tag: "Best Seller",
        image: "/images/concert looks/Screenshot 2025-09-21 001028.png"
      },
      {
        id: 27,
        name: "Chunky Black Belt",
        price: "₹1,299",
        seller: "Rock Footwear",
        tag: "New",
        image: "/images/concert looks/Screenshot 2025-09-21 001107.png"
      },
      {
        id: 28,
        name: "Bold Chain Necklace",
        price: "₹899",
        seller: "Edgy Accessories",
        tag: "On Sale",
        image: "/images/concert looks/Screenshot 2025-09-21 001134.png"
      },
      {
        id: 29,
        name: "Leather Jacket",
        price: "₹5,999",
        seller: "Rock Style",
        tag: "Premium",
        image: "/images/concert looks/Screenshot 2025-09-21 001244.png"
      }
    ]
  },
  "rainy-week-vibes": {
    title: "Rainy Week Vibes",
    tag: "Monsoon Mood",
    products: [
      {
        id: 30,
        name: "Distressed Denim Shorts",
        price: "₹1,299",
        seller: "Urban Style",
        tag: "Best Seller",
        image: "https://images.unsplash.com/photo-1596802931247-5f23fd270be0?w=400&h=400&fit=crop&crop=center"
      },
      {
        id: 31,
        name: "High-Waisted Denim Shorts",
        price: "₹1,499",
        seller: "Denim Co",
        tag: "New",
        image: "https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=400&h=400&fit=crop&crop=center"
      },
      {
        id: 32,
        name: "Waterproof Black Jacket",
        price: "₹3,999",
        seller: "Outdoor Gear",
        tag: "Trending",
        image: "https://images.unsplash.com/photo-1605908502724-9093a79a1b39?w=400&h=400&fit=crop&crop=center"
      },
      {
        id: 33,
        name: "Yellow Rain Jacket",
        price: "₹3,499",
        seller: "Rain Essentials",
        tag: "Popular",
        image: "https://images.unsplash.com/photo-1568354930999-0962faa725dc?w=400&h=400&fit=crop&crop=center"
      },
      {
        id: 34,
        name: "Transparent Rain Jacket",
        price: "₹2,999",
        seller: "Rain Style",
        tag: "Trendy",
        image: "https://images.unsplash.com/photo-1583744946564-b52d1e2be1ff?w=400&h=400&fit=crop&crop=center"
      },
      {
        id: 35,
        name: "Classic Rain Boots",
        price: "₹2,499",
        seller: "Footwear Plus",
        tag: "Essential",
        image: "https://images.unsplash.com/photo-1520639888713-7851133b1ed0?w=400&h=400&fit=crop&crop=center"
      },
      // {
      //   id: 36,
      //   name: "Chelsea Rain Boots",
      //   price: "₹2,999",
      //   seller: "Rain Gear Co",
      //   tag: "Must-Have",
      //   image: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=400&h=400&fit=crop&crop=center"
      // },
      {
        id: 37,
        name: "Ankle Rain Boots",
        price: "₹2,799",
        seller: "Rain Style",
        tag: "Stylish",
        image: "https://images.unsplash.com/photo-1638247025967-b4e38f787b76?w=400&h=400&fit=crop&crop=center"
      },
      {
        id: 38,
        name: "Waterproof Backpack",
        price: "₹1,899",
        seller: "Travel Essentials",
        tag: "Practical",
        image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop&crop=center"
      }
    ]
  },
  "college-fest-mode": {
    title: "College Fest Mode",
    tag: "Party Ready",
    products: [
      {
        id: 34,
        name: "Sequin Party Top",
        price: "₹1,799",
        seller: "Glam Style",
        tag: "Trending",
        image: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400&h=400&fit=crop&crop=center"
      },
      {
        id: 35,
        name: "Metallic Crop Top",
        price: "₹1,299",
        seller: "Party Culture",
        tag: "New",
        image: "https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=400&h=400&fit=crop&crop=center"
      },
      {
        id: 36,
        name: "Baggy Jeans",
        price: "₹2,499",
        seller: "Party Wear",
        tag: "Best Seller",
        image: "https://images.unsplash.com/photo-1593795899768-947c4929449d?w=400&h=400&fit=crop&crop=center"
      },
      {
        id: 37,
        name: "Holographic Jacket",
        price: "₹3,499",
        seller: "Festival Fashion",
        tag: "Premium",
        image: "https://images.unsplash.com/photo-1578681994506-b8f463449011?w=400&h=400&fit=crop&crop=center"
      },
      {
        id: 38,
        name: "Glitter Party Jacket",
        price: "₹2,999",
        seller: "Glam Vibes",
        tag: "Must-Have",
        image: "https://images.unsplash.com/photo-1596993100471-c3905dafa78e?w=400&h=400&fit=crop&crop=center"
      },
      {
        id: 39,
        name: "Men's Metallic Bomber",
        price: "₹3,299",
        seller: "Party Edge",
        tag: "Stylish",
        image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400&h=400&fit=crop&crop=center"
      },
      {
        id: 40,
        name: "Sequin Mini Dress",
        price: "₹1,999",
        seller: "Party Style",
        tag: "Glamorous",
        image: "https://images.unsplash.com/photo-1582533561751-ef6f6ab93a2e?w=400&h=400&fit=crop&crop=center"
      },
      {
        id: 41,
        name: "Holographic Sneakers",
        price: "₹2,999",
        seller: "Street Glam",
        tag: "Cool",
        image: "https://images.unsplash.com/photo-1579338559194-a162d19bf842?w=400&h=400&fit=crop&crop=center"
      },
      {
        id: 42,
        name: "Metallic Accessories Set",
        price: "₹999",
        seller: "Party Bling",
        tag: "Essential",
        image: "https://images.unsplash.com/photo-1611085583191-a3b181a88401?w=400&h=400&fit=crop&crop=center"
      }
    ]
  },
  "beach-wedding-guest": {
    title: "Beach Wedding Guest",
    tag: "Beach Vibes",
    products: [
      // {
      //   id: 41,
      //   name: "Floral Maxi Dress",
      //   price: "₹3,499",
      //   seller: "Boho Chic",
      //   tag: "Best Seller",
      //   image: "https://images.unsplash.com/photo-1600949249603-a8b0ec582935?w=400&h=400&fit=crop&crop=center"
      // },
      {
        id: 42,
        name: "Silk Wrap Dress",
        price: "₹4,299",
        seller: "Resort Wear",
        tag: "Premium",
        image: "https://images.unsplash.com/photo-1550639525-c97d455acf70?w=400&h=400&fit=crop&crop=center"
      },
      {
        id: 43,
        name: "Linen Midi Dress",
        price: "₹3,799",
        seller: "Summer Style",
        tag: "Trending",
        image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&h=400&fit=crop&crop=center"
      },
      {
        id: 44,
        name: "Wide Brim Straw Hat",
        price: "₹1,299",
        seller: "Beach Accessories",
        tag: "Must-Have",
        image: "https://images.unsplash.com/photo-1595642527925-4d41cb781653?w=400&h=400&fit=crop&crop=center"
      },
      {
        id: 45,
        name: "Leather Strappy Boots",
        price: "₹2,499",
        seller: "Beach Luxe",
        tag: "Elegant",
        image: "https://images.unsplash.com/photo-1531310197839-ccf54634509e?w=400&h=400&fit=crop&crop=center"
      },
      {
        id: 46,
        name: "Woven Beach Tote",
        price: "₹1,799",
        seller: "Beach Essentials",
        tag: "Stylish",
        image: "https://images.unsplash.com/photo-1534423861386-85a16f5d13fd?w=400&h=400&fit=crop&crop=center"
      },
      {
        id: 47,
        name: "Shell Necklace",
        price: "₹999",
        seller: "Beach Jewelry",
        tag: "Boho",
        image: "https://images.unsplash.com/photo-1611085583191-a3b181a88401?w=400&h=400&fit=crop&crop=center"
      }
    ]
  },
  "cozy-winter-layers": {
    title: "Cozy Winter Layers",
    tag: "Winter Warmth",
    products: [
      // {
      //   id: 48,
      //   name: "Chunky Knit Sweater",
      //   price: "₹2,999",
      //   seller: "Cozy Comfort",
      //   tag: "Best Seller",
      //   image: "https://images.unsplash.com/photo-1624213111452-35e8d3d5cc18?w=400&h=400&fit=crop&crop=center"
      // },
      {
        id: 49,
        name: "Turtleneck Sweater",
        price: "₹2,499",
        seller: "Winter Style",
        tag: "New",
        image: "https://images.unsplash.com/photo-1608063615781-e2ef8c73d114?w=400&h=400&fit=crop&crop=center"
      },
      {
        id: 50,
        name: "Wool Blend Coat",
        price: "₹5,999",
        seller: "Winter Essentials",
        tag: "Premium",
        image: "https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=400&h=400&fit=crop&crop=center"
      },
      {
        id: 51,
        name: "High-Rise Thermal Jeans",
        price: "₹2,499",
        seller: "Denim Co",
        tag: "Trending",
        image: "https://images.unsplash.com/photo-1604176354204-9268737828e4?w=400&h=400&fit=crop&crop=center"
      },
      {
        id: 52,
        name: "Leather Combat Boots",
        price: "₹4,999",
        seller: "Winter Footwear",
        tag: "Must-Have",
        image: "https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=400&h=400&fit=crop&crop=center"
      },
      {
        id: 53,
        name: "Metallic Clutch",
        price: "₹2,299",
        seller: "Luxury Winter",
        tag: "Premium",
        image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400&h=400&fit=crop&crop=center"
      },
      {
        id: 54,
        name: "Knit Beanie",
        price: "₹799",
        seller: "Winter Accessories",
        tag: "Essential",
        image: "https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?w=400&h=400&fit=crop&crop=center"
      }
    ]
  },
  "date-night-glam": {
    title: "Date Night Glam",
    tag: "Romantic Evening",
    products: [
      {
        id: 55,
        name: "Sequin Cocktail Dress",
        price: "₹4,999",
        seller: "Glam Nights",
        tag: "Must Have",
        image: "https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=400&h=400&fit=crop&crop=center"
      },
      {
        id: 56,
        name: "Satin Slip Dress",
        price: "₹3,999",
        seller: "Evening Luxe",
        tag: "Premium",
        image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&h=400&fit=crop&crop=center"
      },
      {
        id: 57,
        name: "Strappy Stilettos",
        price: "₹3,499",
        seller: "Footwear Co",
        tag: "Trending",
        image: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=400&h=400&fit=crop&crop=center"
      },
      {
        id: 58,
        name: "Crystal Drop Earrings",
        price: "₹1,999",
        seller: "Glam Jewelry",
        tag: "New",
        image: "https://images.unsplash.com/photo-1635767798638-3665c302acba?w=400&h=400&fit=crop&crop=center"
      },
      {
        id: 59,
        name: "Metallic Clutch",
        price: "₹2,499",
        seller: "Evening Style",
        tag: "Best Seller",
        image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400&h=400&fit=crop&crop=center"
      },
      {
        id: 60,
        name: "Statement Necklace",
        price: "₹1,799",
        seller: "Accessories Inc",
        tag: "Must-Have",
        image: "https://images.unsplash.com/photo-1599643477877-530eb83abc8e?w=400&h=400&fit=crop&crop=center"
      }
    ]
  }
};
