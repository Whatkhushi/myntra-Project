// Gamification system for wardrobe digitization
export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  requirement: number;
  category: "upload" | "variety" | "streak" | "special";
  unlockedAt?: string;
}

export interface UserStats {
  closetPoints: number;
  streak: number;
  lastUploadDate?: string;
  totalUploads: number;
  categoryCounts: {
    tops: number;
    bottoms: number;
    shoes: number;
    accessories: number;
    dresses: number;
  };
  achievements: string[];
}

export const ACHIEVEMENTS: Achievement[] = [
  // Upload achievements
  {
    id: "first_upload",
    name: "Fashion Pioneer",
    description: "Upload your first item to the digital closet",
    icon: "🎯",
    requirement: 1,
    category: "upload"
  },
  {
    id: "fashion_starter",
    name: "Style Collector",
    description: "Upload 5 items to your closet",
    icon: "⭐",
    requirement: 5,
    category: "upload"
  },
  {
    id: "wardrobe_master",
    name: "Wardrobe Master",
    description: "Upload 20 items to build your fashion empire",
    icon: "👑",
    requirement: 20,
    category: "upload"
  },
  {
    id: "fashion_mogul",
    name: "Fashion Mogul",
    description: "Upload 50+ items - you're a true style icon!",
    icon: "💎",
    requirement: 50,
    category: "upload"
  },

  // Category variety achievements
  {
    id: "top_collector",
    name: "Top Collector",
    description: "Upload 10 tops to your collection",
    icon: "👕",
    requirement: 10,
    category: "variety"
  },
  {
    id: "bottom_enthusiast",
    name: "Bottom Enthusiast", 
    description: "Upload 10 bottoms - jeans, pants, shorts & more!",
    icon: "👖",
    requirement: 10,
    category: "variety"
  },
  {
    id: "shoe_addict",
    name: "Shoe Addict",
    description: "Upload 10 pairs of shoes to your collection",
    icon: "👟",
    requirement: 10,
    category: "variety"
  },
  {
    id: "accessory_guru",
    name: "Accessory Guru",
    description: "Upload 10 accessories - bags, jewelry & more!",
    icon: "👜",
    requirement: 10,
    category: "variety"
  },
  {
    id: "dress_lover",
    name: "Dress Lover",
    description: "Upload 10 dresses to your wardrobe",
    icon: "👗",
    requirement: 10,
    category: "variety"
  },

  // Streak achievements
  {
    id: "daily_stylist",
    name: "Daily Stylist",
    description: "Upload items 3 days in a row",
    icon: "🔥",
    requirement: 3,
    category: "streak"
  },
  {
    id: "fashion_week",
    name: "Fashion Week",
    description: "Upload items 7 days in a row",
    icon: "🚀",
    requirement: 7,
    category: "streak"
  },

  // Special achievements
  {
    id: "complete_outfit",
    name: "Complete Outfit",
    description: "Have at least one item in every category",
    icon: "✨",
    requirement: 5,
    category: "special"
  }
];

export const POINTS_PER_UPLOAD = 10;
export const BONUS_POINTS_STREAK = 5;

// AI tagging system (mock implementation)
export interface ItemTags {
  category: string;
  color: string[];
  style: string[];
  season: string[];
  occasion: string[];
}

export const mockAITagging = (category: string): ItemTags => {
  const colorPools = [
    ["Black", "White", "Gray"],
    ["Red", "Pink", "Purple"],
    ["Blue", "Navy", "Light Blue"],
    ["Green", "Olive", "Mint"],
    ["Brown", "Tan", "Beige"],
    ["Yellow", "Orange", "Gold"]
  ];

  const stylesByCategory: Record<string, string[]> = {
    tops: ["Casual", "Formal", "Streetwear", "Vintage", "Boho", "Minimalist"],
    bottoms: ["Casual", "Formal", "Streetwear", "High-waisted", "Slim-fit", "Wide-leg"],
    shoes: ["Casual", "Formal", "Athletic", "Vintage", "Trendy", "Comfortable"],
    accessories: ["Statement", "Minimalist", "Vintage", "Trendy", "Classic", "Boho"],
    dresses: ["Casual", "Formal", "Party", "Vintage", "Boho", "Minimalist"]
  };

  const seasons = ["Spring", "Summer", "Fall", "Winter", "All-season"];
  const occasions = ["Casual", "Work", "Party", "Date", "Travel", "Sport", "Formal"];

  const randomColor = colorPools[Math.floor(Math.random() * colorPools.length)];
  const randomStyles = stylesByCategory[category] || ["Casual", "Trendy"];
  
  return {
    category,
    color: randomColor.slice(0, Math.floor(Math.random() * 2) + 1),
    style: randomStyles.slice(0, Math.floor(Math.random() * 2) + 1),
    season: seasons.slice(0, Math.floor(Math.random() * 3) + 1),
    occasion: occasions.slice(0, Math.floor(Math.random() * 3) + 1)
  };
};

// Gamification utilities
export const getUserStats = async (): Promise<UserStats> => {
  const saved = localStorage.getItem("userStats");
  let baseStats = saved ? JSON.parse(saved) : {
    closetPoints: 0,
    streak: 0,
    totalUploads: 0,
    categoryCounts: {
      tops: 0,
      bottoms: 0,
      shoes: 0,
      accessories: 0,
      dresses: 0
    },
    achievements: []
  };

  try {
    // Import the utility function dynamically to avoid circular imports
    const { loadAllWardrobeItems } = await import("@/utils/wardrobeUtils");
    const allItems = await loadAllWardrobeItems();
    
    baseStats.totalUploads = allItems.length;
    baseStats.categoryCounts = {
      tops: allItems.filter(item => item.category.toLowerCase() === 'tops').length,
      bottoms: allItems.filter(item => item.category.toLowerCase() === 'bottoms').length,
      shoes: allItems.filter(item => item.category.toLowerCase() === 'shoes').length,
      accessories: allItems.filter(item => item.category.toLowerCase() === 'accessories').length,
      dresses: allItems.filter(item => item.category.toLowerCase() === 'dresses').length
    };
  } catch (error) {
    // Fallback to localStorage if backend is not available
    const savedItems = localStorage.getItem("closetItems");
    let localItems: any[] = [];
    if (savedItems) {
      localItems = JSON.parse(savedItems);
    }

    baseStats.totalUploads = localItems.length;
    baseStats.categoryCounts = {
      tops: localItems.filter(item => item.category.toLowerCase() === 'tops').length,
      bottoms: localItems.filter(item => item.category.toLowerCase() === 'bottoms').length,
      shoes: localItems.filter(item => item.category.toLowerCase() === 'shoes').length,
      accessories: localItems.filter(item => item.category.toLowerCase() === 'accessories').length,
      dresses: localItems.filter(item => item.category.toLowerCase() === 'dresses').length
    };
  }

  return baseStats;
};

export const updateUserStats = async (category: string): Promise<{ 
  newStats: UserStats, 
  newAchievements: Achievement[],
  pointsEarned: number 
}> => {
  const stats = await getUserStats();
  const today = new Date().toDateString();
  
  // Normalize category name
  const normalizedCategory = category.toLowerCase();
  const validCategories = ['tops', 'bottoms', 'shoes', 'accessories', 'dresses'];
  const categoryKey = validCategories.includes(normalizedCategory) 
    ? normalizedCategory as keyof typeof stats.categoryCounts
    : 'accessories'; // Default fallback
  
  // Update basic stats
  stats.totalUploads++;
  stats.categoryCounts[categoryKey]++;
  
  // Calculate points
  let pointsEarned = POINTS_PER_UPLOAD;
  
  // Check streak
  const lastUpload = stats.lastUploadDate ? new Date(stats.lastUploadDate).toDateString() : null;
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString();
  
  if (lastUpload === yesterday) {
    stats.streak++;
    pointsEarned += BONUS_POINTS_STREAK;
  } else if (lastUpload !== today) {
    stats.streak = 1;
  }
  
  stats.lastUploadDate = new Date().toISOString();
  stats.closetPoints += pointsEarned;
  
  // Check for new achievements
  const newAchievements: Achievement[] = [];
  
  ACHIEVEMENTS.forEach(achievement => {
    if (stats.achievements.includes(achievement.id)) return;
    
    let unlocked = false;
    
    switch (achievement.category) {
      case "upload":
        unlocked = stats.totalUploads >= achievement.requirement;
        break;
      case "variety":
        const categoryCount = stats.categoryCounts[achievement.id.split('_')[0] as keyof typeof stats.categoryCounts];
        unlocked = categoryCount >= achievement.requirement;
        break;
      case "streak":
        unlocked = stats.streak >= achievement.requirement;
        break;
      case "special":
        if (achievement.id === "complete_outfit") {
          unlocked = Object.values(stats.categoryCounts).every(count => count > 0);
        }
        break;
    }
    
    if (unlocked) {
      stats.achievements.push(achievement.id);
      achievement.unlockedAt = new Date().toISOString();
      newAchievements.push(achievement);
    }
  });
  
  localStorage.setItem("userStats", JSON.stringify(stats));
  
  return { newStats: stats, newAchievements, pointsEarned };
};

export const getNextLevelProgress = (points: number): { level: number, progress: number, nextLevelPoints: number } => {
  const level = Math.floor(points / 100) + 1;
  const currentLevelPoints = (level - 1) * 100;
  const nextLevelPoints = level * 100;
  const progress = ((points - currentLevelPoints) / 100) * 100;
  
  return { level, progress, nextLevelPoints };
};

// Gen Z messages for achievements
export const genZMessages = [
  "Yass queen! 💅 Your closet is looking fire!",
  "Slay bestie! ✨ That fit is gonna hit different!",
  "No cap, your wardrobe game is STRONG! 🔥",
  "Period! Your style choices are *chef's kiss* 💋",
  "That's giving main character energy! ⭐",
  "Your closet said 'I'm THAT girl' and I'm here for it! 💃",
  "Fit check passed with flying colors! You understood the assignment! 📸",
  "Not you building the most iconic wardrobe! We love to see it! 👑"
];

export const getRandomGenZMessage = (): string => {
  return genZMessages[Math.floor(Math.random() * genZMessages.length)];
};