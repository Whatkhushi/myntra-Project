/**
 * Gemini API service for AI stylist text suggestions
 * Currently using demo mode - can be enhanced with actual Gemini API integration
 */

export interface LookboardResponse {
  description: string;
  iconicInspiration: string;
  styleKeywords: string[];
  colorPalette: string[];
  fabricSuggestions: string[];
  occasion: string;
  season: string;
}

export interface LookboardImage {
  id: string;
  url: string;
  source: 'pinterest' | 'myntra' | 'unsplash' | 'curated';
  title: string;
  productUrl?: string;
  category: string;
}

export interface LookboardData {
  textResponse: LookboardResponse;
  images: LookboardImage[];
  shopUrl: string;
}

/**
 * Generate AI stylist response with detailed outfit suggestions
 * Currently using demo mode with intelligent mock responses
 */
export async function generateLookboardSuggestion(prompt: string): Promise<LookboardData> {
  // For now, always use mock responses for demo purposes
  // This can be enhanced later with actual Gemini API integration
  return generateMockLookboardResponse(prompt);
}

/**
 * Generate mock response for demo purposes
 */
function generateMockLookboardResponse(prompt: string): LookboardData {
  const lowercasePrompt = prompt.toLowerCase();
  
  if (lowercasePrompt.includes('beach') && lowercasePrompt.includes('wedding')) {
    return {
      textResponse: {
        description: "Try a flowy maxi dress with pearl jewelry and pastel sandals. Inspired by Alia Bhatt's elegant resort look. Perfect for beachside celebrations with light, breathable fabrics that move beautifully in the ocean breeze! ✨",
        iconicInspiration: "Alia Bhatt's elegant resort look",
        styleKeywords: ["flowy", "elegant", "beachside", "pastel", "romantic"],
        colorPalette: ["soft pink", "cream", "gold", "pearl white"],
        fabricSuggestions: ["chiffon", "silk", "linen"],
        occasion: "beach wedding",
        season: "summer"
      },
      images: [
        {
          id: "beach-dress-1",
          url: "/images/beach-wedding/maxi-dress.jpg",
          source: "curated",
          title: "Flowy Maxi Dress",
          category: "dresses"
        },
        {
          id: "beach-jewelry-1",
          url: "/images/beach-wedding/pearl-jewelry.jpg",
          source: "curated",
          title: "Pearl Jewelry Set",
          category: "jewelry"
        },
        {
          id: "beach-shoes-1",
          url: "/images/beach-wedding/pastel-sandals.jpg",
          source: "curated",
          title: "Pastel Sandals",
          category: "shoes"
        },
        {
          id: "beach-inspiration-1",
          url: "/images/beach-wedding/alia-bhatt-inspiration.jpg",
          source: "curated",
          title: "Celebrity Inspiration",
          category: "inspiration"
        }
      ],
      shopUrl: "https://www.myntra.com/women-dresses?f=Color%3Asoft%20pink%2Ccream"
    };
  }

  if (lowercasePrompt.includes('diwali') || lowercasePrompt.includes('festival')) {
    return {
      textResponse: {
        description: "Go traditional with a kurta set in rich colors like maroon or royal blue. Add statement jhumkas and bangles. For a modern twist, try a crop top with a flowy skirt! Don't forget comfy juttis for all that dancing! 🎆",
        iconicInspiration: "Deepika Padukone's festive elegance",
        styleKeywords: ["traditional", "festive", "elegant", "colorful", "dance-ready"],
        colorPalette: ["maroon", "royal blue", "gold", "orange", "red"],
        fabricSuggestions: ["silk", "georgette", "velvet"],
        occasion: "festival",
        season: "festive"
      },
      images: [
        {
          id: "diwali-kurta-1",
          url: "/images/diwali/kurta-set.jpg",
          source: "curated",
          title: "Embroidered Kurta Set",
          category: "ethnic-wear"
        },
        {
          id: "diwali-jewelry-1",
          url: "/images/diwali/jhumkas.jpg",
          source: "curated",
          title: "Statement Jhumkas",
          category: "jewelry"
        },
        {
          id: "diwali-shoes-1",
          url: "/images/diwali/juttis.jpg",
          source: "curated",
          title: "Comfortable Juttis",
          category: "shoes"
        },
        {
          id: "diwali-inspiration-1",
          url: "/images/diwali/deepika-inspiration.jpg",
          source: "curated",
          title: "Celebrity Inspiration",
          category: "inspiration"
        }
      ],
      shopUrl: "https://www.myntra.com/women-ethnic-wear?f=Color%3Amaroon%2Croyal%20blue"
    };
  }

  if (lowercasePrompt.includes('monsoon') || lowercasePrompt.includes('rain')) {
    return {
      textResponse: {
        description: "Monsoon mood activated! 🌧️ Perfect time for layering - try high-waisted jeans with a cute crop top, throw on a denim jacket or waterproof blazer, and finish with ankle boots that can handle puddles! Don't forget a trendy umbrella 😉☔",
        iconicInspiration: "Emma Stone's cozy London vibe in La La Land",
        styleKeywords: ["layered", "cozy", "waterproof", "trendy", "comfortable"],
        colorPalette: ["denim blue", "white", "black", "gray"],
        fabricSuggestions: ["denim", "cotton", "waterproof"],
        occasion: "casual",
        season: "monsoon"
      },
      images: [
        {
          id: "monsoon-jeans-1",
          url: "/images/monsoon/high-waisted-jeans.jpg",
          source: "curated",
          title: "High-Waisted Jeans",
          category: "bottoms"
        },
        {
          id: "monsoon-jacket-1",
          url: "/images/monsoon/denim-jacket.jpg",
          source: "curated",
          title: "Denim Jacket",
          category: "outerwear"
        },
        {
          id: "monsoon-boots-1",
          url: "/images/monsoon/ankle-boots.jpg",
          source: "curated",
          title: "Ankle Boots",
          category: "shoes"
        },
        {
          id: "monsoon-umbrella-1",
          url: "/images/monsoon/trendy-umbrella.jpg",
          source: "curated",
          title: "Trendy Umbrella",
          category: "accessories"
        }
      ],
      shopUrl: "https://www.myntra.com/women-jeans?f=Color%3Adenim%20blue"
    };
  }

  // Default response
  return {
    textResponse: {
      description: "That's such a vibe! ✨ For any look, start with one statement piece and build around it. Mix your closet favorites with trending pieces for the perfect balance! What occasion are you dressing for? 💫",
      iconicInspiration: "Fashion-forward inspiration",
      styleKeywords: ["trendy", "stylish", "versatile"],
      colorPalette: ["neutral", "accent", "pop"],
      fabricSuggestions: ["cotton", "silk", "denim"],
      occasion: "casual",
      season: "all-season"
    },
    images: [
      {
        id: "default-1",
        url: "/images/default/statement-piece.jpg",
        source: "curated",
        title: "Statement Piece",
        category: "tops"
      },
      {
        id: "default-2",
        url: "/images/default/trending-accessory.jpg",
        source: "curated",
        title: "Trending Accessory",
        category: "accessories"
      },
      {
        id: "default-3",
        url: "/images/default/versatile-bottom.jpg",
        source: "curated",
        title: "Versatile Bottom",
        category: "bottoms"
      },
      {
        id: "default-4",
        url: "/images/default/complete-look.jpg",
        source: "curated",
        title: "Complete Look",
        category: "complete-look"
      }
    ],
    shopUrl: "https://www.myntra.com/women"
  };
}

/**
 * Generate lookboard images based on the AI response
 */
async function generateLookboardImages(response: LookboardResponse, originalPrompt: string): Promise<LookboardImage[]> {
  // For now, return curated images based on the occasion/season
  // In a real implementation, this would fetch from Pinterest, Myntra, or Unsplash APIs
  
  const occasion = response.occasion.toLowerCase();
  const season = response.season.toLowerCase();
  
  // This would be replaced with actual API calls
  return [
    {
      id: `${occasion}-1`,
      url: `/images/${occasion}/main-piece.jpg`,
      source: "curated",
      title: "Main Piece",
      category: "main"
    },
    {
      id: `${occasion}-2`,
      url: `/images/${occasion}/accessory.jpg`,
      source: "curated",
      title: "Accessory",
      category: "accessories"
    },
    {
      id: `${occasion}-3`,
      url: `/images/${occasion}/shoes.jpg`,
      source: "curated",
      title: "Shoes",
      category: "shoes"
    },
    {
      id: `${occasion}-4`,
      url: `/images/${occasion}/inspiration.jpg`,
      source: "curated",
      title: "Inspiration",
      category: "inspiration"
    }
  ];
}

/**
 * Generate Myntra shop URL based on the response
 */
function generateShopUrl(response: LookboardResponse): string {
  const baseUrl = "https://www.myntra.com/women";
  const occasion = response.occasion.toLowerCase();
  const colors = response.colorPalette.join('%2C');
  
  if (occasion.includes('beach') || occasion.includes('wedding')) {
    return `${baseUrl}-dresses?f=Color%3A${colors}`;
  }
  
  if (occasion.includes('festival') || occasion.includes('diwali')) {
    return `${baseUrl}-ethnic-wear?f=Color%3A${colors}`;
  }
  
  if (occasion.includes('monsoon') || occasion.includes('rain')) {
    return `${baseUrl}-jeans?f=Color%3A${colors}`;
  }
  
  return baseUrl;
}
