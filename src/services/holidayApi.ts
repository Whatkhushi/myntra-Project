/**
 * Holiday API service for fetching upcoming holidays and festivals
 */

export interface Holiday {
  name: string;
  date: string;
  type: string;
  country: string;
  description?: string;
}

export interface HolidayApiResponse {
  holidays: Holiday[];
  success: boolean;
  error?: string;
}

export interface StyleMapping {
  [holidayName: string]: {
    styleId: string;
    title: string;
    emoji: string;
    description: string;
    defaultPieces: string[];
    season: string;
    occasion: string;
  };
}

// Holiday to Style Mapping Configuration
export const HOLIDAY_STYLE_MAPPING: StyleMapping = {
  "Christmas": {
    styleId: "christmas-style",
    title: "Christmas Cozy Vibes",
    emoji: "🎄",
    description: "Festive & Warm",
    defaultPieces: ["red sweater", "wool coat", "boots", "warm scarf"],
    season: "winter",
    occasion: "festive"
  },
  "New Year": {
    styleId: "new-year-style",
    title: "New Year Glam",
    emoji: "✨",
    description: "Party Ready",
    defaultPieces: ["sequin dress", "heels", "statement jewelry", "clutch"],
    season: "winter",
    occasion: "party"
  },
  "Valentine's Day": {
    styleId: "valentines-style",
    title: "Valentine's Romance",
    emoji: "💖",
    description: "Romantic & Sweet",
    defaultPieces: ["pink dress", "red heels", "delicate jewelry", "perfume"],
    season: "winter",
    occasion: "romantic"
  },
  "Holi": {
    styleId: "holi-style",
    title: "Holi Color Fest",
    emoji: "🌈",
    description: "Colorful & Fun",
    defaultPieces: ["white kurta", "colorful dupatta", "comfortable shoes", "sunglasses"],
    season: "spring",
    occasion: "festival"
  },
  "Diwali": {
    styleId: "diwali-style",
    title: "Diwali Elegance",
    emoji: "🪔",
    description: "Festive Glam",
    defaultPieces: ["embroidered saree", "gold jewelry", "juttis", "bindi"],
    season: "autumn",
    occasion: "festival"
  },
  "Eid": {
    styleId: "eid-style",
    title: "Eid Celebration",
    emoji: "🌙",
    description: "Elegant & Traditional",
    defaultPieces: ["embroidered kurta", "matching pants", "traditional shoes", "prayer cap"],
    season: "spring",
    occasion: "religious"
  },
  "Halloween": {
    styleId: "halloween-style",
    title: "Halloween Spooky",
    emoji: "🎃",
    description: "Fun & Creative",
    defaultPieces: ["black dress", "costume accessories", "dramatic makeup", "themed shoes"],
    season: "autumn",
    occasion: "party"
  },
  "Thanksgiving": {
    styleId: "thanksgiving-style",
    title: "Thanksgiving Warmth",
    emoji: "🦃",
    description: "Cozy & Comfortable",
    defaultPieces: ["sweater dress", "boots", "warm scarf", "comfortable pants"],
    season: "autumn",
    occasion: "family"
  }
};

// Seasonal fallback styles when no holidays are upcoming
export const SEASONAL_STYLES: StyleMapping = {
  "winter": {
    styleId: "winter-style",
    title: "Winter Warmth",
    emoji: "❄️",
    description: "Cozy & Warm",
    defaultPieces: ["wool coat", "sweater", "boots", "scarf"],
    season: "winter",
    occasion: "seasonal"
  },
  "spring": {
    styleId: "spring-style",
    title: "Spring Fresh",
    emoji: "🌸",
    description: "Light & Fresh",
    defaultPieces: ["light jacket", "floral dress", "sneakers", "sun hat"],
    season: "spring",
    occasion: "seasonal"
  },
  "summer": {
    styleId: "summer-style",
    title: "Summer Vibes",
    emoji: "☀️",
    description: "Cool & Comfortable",
    defaultPieces: ["cotton shirt", "shorts", "sandals", "sunglasses"],
    season: "summer",
    occasion: "seasonal"
  },
  "autumn": {
    styleId: "autumn-style",
    title: "Autumn Layers",
    emoji: "🍂",
    description: "Layered & Stylish",
    defaultPieces: ["cardigan", "jeans", "ankle boots", "beanie"],
    season: "autumn",
    occasion: "seasonal"
  }
};

/**
 * Get current season based on month
 */
export function getCurrentSeason(): string {
  const month = new Date().getMonth() + 1; // 1-12
  
  if (month >= 12 || month <= 2) return "winter";
  if (month >= 3 && month <= 5) return "spring";
  if (month >= 6 && month <= 8) return "summer";
  return "autumn";
}

/**
 * Fetch holidays from a free API (using Nager.Date as it's free and reliable)
 */
export async function fetchHolidays(countryCode: string = "IN", year: number = new Date().getFullYear()): Promise<HolidayApiResponse> {
  try {
    const response = await fetch(`https://date.nager.at/api/v3/PublicHolidays/${year}/${countryCode}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch holidays: ${response.statusText}`);
    }
    
    const holidays = await response.json();
    
    // Filter holidays for the next 3 weeks
    const today = new Date();
    const threeWeeksFromNow = new Date(today.getTime() + (21 * 24 * 60 * 60 * 1000));
    
    const upcomingHolidays = holidays.filter((holiday: any) => {
      const holidayDate = new Date(holiday.date);
      return holidayDate >= today && holidayDate <= threeWeeksFromNow;
    });
    
    return {
      holidays: upcomingHolidays.map((holiday: any) => ({
        name: holiday.name,
        date: holiday.date,
        type: holiday.type || "public",
        country: countryCode,
        description: holiday.localName
      })),
      success: true
    };
  } catch (error) {
    console.error("Error fetching holidays:", error);
    return {
      holidays: [],
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
}

/**
 * Get trending styles based on holidays and season
 */
export async function getTrendingStyles(): Promise<{
  styles: Array<{
    id: string;
    title: string;
    emoji: string;
    description: string;
    defaultPieces: string[];
    holiday?: string;
    date?: string;
    season: string;
    occasion: string;
  }>;
  source: "holiday" | "seasonal";
}> {
  try {
    // Try to fetch holidays first
    const holidayResponse = await fetchHolidays();
    
    if (holidayResponse.success && holidayResponse.holidays.length > 0) {
      // Map holidays to styles
      const holidayStyles = holidayResponse.holidays
        .map(holiday => {
          const styleMapping = HOLIDAY_STYLE_MAPPING[holiday.name];
          if (styleMapping) {
            return {
              id: styleMapping.styleId,
              title: styleMapping.title,
              emoji: styleMapping.emoji,
              description: styleMapping.description,
              defaultPieces: styleMapping.defaultPieces,
              holiday: holiday.name,
              date: holiday.date,
              season: styleMapping.season,
              occasion: styleMapping.occasion
            };
          }
          return null;
        })
        .filter(Boolean)
        .slice(0, 3); // Limit to 3 styles
      
      if (holidayStyles.length > 0) {
        return {
          styles: holidayStyles,
          source: "holiday"
        };
      }
    }
    
    // Fallback to seasonal styles
    const currentSeason = getCurrentSeason();
    const seasonalStyle = SEASONAL_STYLES[currentSeason];
    
    return {
      styles: [{
        id: seasonalStyle.styleId,
        title: seasonalStyle.title,
        emoji: seasonalStyle.emoji,
        description: seasonalStyle.description,
        defaultPieces: seasonalStyle.defaultPieces,
        season: seasonalStyle.season,
        occasion: seasonalStyle.occasion
      }],
      source: "seasonal"
    };
  } catch (error) {
    console.error("Error getting trending styles:", error);
    
    // Ultimate fallback
    const currentSeason = getCurrentSeason();
    const seasonalStyle = SEASONAL_STYLES[currentSeason];
    
    return {
      styles: [{
        id: seasonalStyle.styleId,
        title: seasonalStyle.title,
        emoji: seasonalStyle.emoji,
        description: seasonalStyle.description,
        defaultPieces: seasonalStyle.defaultPieces,
        season: seasonalStyle.season,
        occasion: seasonalStyle.occasion
      }],
      source: "seasonal"
    };
  }
}
