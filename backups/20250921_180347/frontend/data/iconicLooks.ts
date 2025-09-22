export interface IconicLook {
  id: string;
  name: string;
  reference: string;
  description: string;
  image?: string;
  tags: string[];
}

export const iconicLooks: IconicLook[] = [
  {
    id: "priyanka-beach",
    name: "Priyanka Chopra Beach Wedding",
    reference: "Baywatch Premiere / Maldives Vacation",
    description: "Effortless beachside elegance with flowing fabrics and delicate gold jewelry",
    tags: ["beach", "wedding", "elegant", "flowy", "gold"]
  },
  {
    id: "emma-monsoon",
    name: "Emma Stone Rainy Day",
    reference: "La La Land",
    description: "Cozy London vibes with layered denim and boots perfect for puddle jumping",
    tags: ["monsoon", "rain", "cozy", "layers", "denim"]
  },
  {
    id: "zendaya-party",
    name: "Zendaya Red Carpet Glam",
    reference: "Met Gala / Euphoria",
    description: "Main character energy with bold accessories and statement pieces",
    tags: ["party", "night out", "glam", "bold", "statement"]
  },
  {
    id: "audrey-date",
    name: "Audrey Hepburn Romance",
    reference: "Breakfast at Tiffany's",
    description: "Timeless elegance with classic silhouettes and pearls",
    tags: ["date", "romantic", "classic", "elegant", "pearls"]
  },
  {
    id: "emily-casual",
    name: "Emily in Paris Café",
    reference: "Emily in Paris",
    description: "Chic Parisian style with berets and croissant energy",
    tags: ["casual", "parisian", "chic", "beret", "café"]
  },
  {
    id: "kdrama-cozy",
    name: "K-Drama Monsoon Aesthetic",
    reference: "Crash Landing on You / Goblin",
    description: "Cozy sweaters and umbrella moments with that perfect rain aesthetic",
    tags: ["monsoon", "cozy", "kdrama", "sweater", "aesthetic"]
  },
  {
    id: "deepika-ethnic",
    name: "Deepika Padukone Festival",
    reference: "Padmaavat / Diwali Celebrations",
    description: "Royal traditional looks with rich colors and statement jewelry",
    tags: ["festival", "ethnic", "traditional", "royal", "jewelry"]
  },
  {
    id: "blake-summer",
    name: "Blake Lively Summer Vibes",
    reference: "Gossip Girl / Cannes",
    description: "Effortless summer elegance with flowy dresses and sun-kissed glamour",
    tags: ["summer", "sunny", "flowy", "elegant", "sundress"]
  }
];

export const getIconicLookByTags = (tags: string[]): IconicLook | null => {
  const matches = iconicLooks.filter(look => 
    tags.some(tag => look.tags.includes(tag.toLowerCase()))
  );
  
  if (matches.length > 0) {
    return matches[Math.floor(Math.random() * matches.length)];
  }
  
  return null;
};