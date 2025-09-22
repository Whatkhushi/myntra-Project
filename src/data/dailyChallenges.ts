// Daily Challenges System with Rotation
export interface DailyChallenge {
  id: string;
  title: string;
  emoji: string;
  description: string;
  instructions: string;
  difficulty: "Easy" | "Medium" | "Hard";
  category: "Style" | "Creativity" | "Social" | "Learning" | "Fun";
  points: number;
  xpReward: number;
  streakBonus: number;
  isCompleted: boolean;
  completedAt?: string;
  progress: number;
  maxProgress: number;
  type: "task" | "streak" | "creative" | "social" | "learning";
  requirements?: string[];
  rewards?: string[];
}

export interface UserProgress {
  totalXP: number;
  level: number;
  currentStreak: number;
  longestStreak: number;
  challengesCompleted: number;
  badges: string[];
  lastActiveDate: string;
  weeklyProgress: number;
  monthlyProgress: number;
}

export interface Badge {
  id: string;
  name: string;
  emoji: string;
  description: string;
  requirement: number;
  category: "streak" | "challenges" | "xp" | "special";
  unlocked: boolean;
  unlockedAt?: string;
}

// Daily challenge pools - different challenges for each day of the week
const MONDAY_CHALLENGES: Omit<DailyChallenge, 'isCompleted' | 'completedAt' | 'progress' | 'maxProgress'>[] = [
  {
    id: "monday-1",
    title: "Outfit Builder",
    emoji: "👕",
    description: "Put together a simple outfit combination and reflect on your choices",
    instructions: "Create a basic outfit by selecting a base item and adding complementary pieces. Think about why they work together!",
    difficulty: "Easy",
    category: "Fun",
    points: 15,
    xpReward: 15,
    streakBonus: 3,
    type: "task",
    requirements: ["Pick a base item (top or bottom)", "Add 1 complementary piece", "Take a quick note on why they match"],
    rewards: ["Outfit builder badge", "Style confidence", "Basic styling skills"]
  },
  {
    id: "monday-2",
    title: "Color Match",
    emoji: "👗",
    description: "Experiment with colors by creating a coordinated look",
    instructions: "Play with color combinations! Choose a main color and build an outfit around it with matching or contrasting colors.",
    difficulty: "Easy",
    category: "Learning",
    points: 20,
    xpReward: 20,
    streakBonus: 4,
    type: "task",
    requirements: ["Select a main color", "Add 2 matching or contrasting colors", "Reflect on how the palette works"],
    rewards: ["Color expert badge", "Color theory knowledge", "Visual harmony skills"]
  },
  {
    id: "monday-3",
    title: "Style Challenge",
    emoji: "🧥",
    description: "Style an outfit for a specific occasion",
    instructions: "Choose an event and create the perfect outfit for it. Think about what works for different occasions!",
    difficulty: "Medium",
    category: "Fun",
    points: 25,
    xpReward: 25,
    streakBonus: 5,
    type: "task",
    requirements: ["Choose an event (casual, formal, party, work)", "Pick items from wardrobe/catalog", "Write why this outfit fits the occasion"],
    rewards: ["Occasion expert badge", "Event styling skills", "Context awareness"]
  },
  {
    id: "monday-4",
    title: "Accessory Match",
    emoji: "👠",
    description: "Enhance your outfit with the right accessories",
    instructions: "Take a base outfit and elevate it with the perfect accessories. Learn how small details make a big difference!",
    difficulty: "Medium",
    category: "Learning",
    points: 30,
    xpReward: 30,
    streakBonus: 6,
    type: "task",
    requirements: ["Choose a base outfit", "Add shoes, bag, and one jewelry piece", "Track how accessories change the vibe", "Reflect on balance"],
    rewards: ["Accessory master badge", "Detail styling skills", "Balance awareness"]
  },
  {
    id: "monday-5",
    title: "Capsule Wardrobe Builder",
    emoji: "🧢",
    description: "Curate a mini capsule wardrobe with versatile items",
    instructions: "Create a small collection of items that can be mixed and matched to create multiple outfits. Focus on versatility!",
    difficulty: "Hard",
    category: "Learning",
    points: 40,
    xpReward: 40,
    streakBonus: 8,
    type: "task",
    requirements: ["Pick 5–7 core items", "Ensure mix & match possibilities", "Balance colors, textures, and categories", "Note how many outfits you can make", "Share your reflections"],
    rewards: ["Capsule expert badge", "Wardrobe planning skills", "Maximization mastery"]
  }
];

const TUESDAY_CHALLENGES: Omit<DailyChallenge, 'isCompleted' | 'completedAt' | 'progress' | 'maxProgress'>[] = [
  {
    id: "tuesday-1",
    title: "Outfit Builder",
    emoji: "👕",
    description: "Put together a simple outfit combination and reflect on your choices",
    instructions: "Create a basic outfit by selecting a base item and adding complementary pieces. Think about why they work together!",
    difficulty: "Easy",
    category: "Fun",
    points: 15,
    xpReward: 15,
    streakBonus: 3,
    type: "task",
    requirements: ["Pick a base item (top or bottom)", "Add 1 complementary piece", "Take a quick note on why they match"],
    rewards: ["Outfit builder badge", "Style confidence", "Basic styling skills"]
  },
  {
    id: "tuesday-2",
    title: "Color Match",
    emoji: "👗",
    description: "Experiment with colors by creating a coordinated look",
    instructions: "Play with color combinations! Choose a main color and build an outfit around it with matching or contrasting colors.",
    difficulty: "Easy",
    category: "Learning",
    points: 20,
    xpReward: 20,
    streakBonus: 4,
    type: "task",
    requirements: ["Select a main color", "Add 2 matching or contrasting colors", "Reflect on how the palette works"],
    rewards: ["Color expert badge", "Color theory knowledge", "Visual harmony skills"]
  },
  {
    id: "tuesday-3",
    title: "Style Challenge",
    emoji: "🧥",
    description: "Style an outfit for a specific occasion",
    instructions: "Choose an event and create the perfect outfit for it. Think about what works for different occasions!",
    difficulty: "Medium",
    category: "Fun",
    points: 25,
    xpReward: 25,
    streakBonus: 5,
    type: "task",
    requirements: ["Choose an event (casual, formal, party, work)", "Pick items from wardrobe/catalog", "Write why this outfit fits the occasion"],
    rewards: ["Occasion expert badge", "Event styling skills", "Context awareness"]
  },
  {
    id: "tuesday-4",
    title: "Accessory Match",
    emoji: "👠",
    description: "Enhance your outfit with the right accessories",
    instructions: "Take a base outfit and elevate it with the perfect accessories. Learn how small details make a big difference!",
    difficulty: "Medium",
    category: "Learning",
    points: 30,
    xpReward: 30,
    streakBonus: 6,
    type: "task",
    requirements: ["Choose a base outfit", "Add shoes, bag, and one jewelry piece", "Track how accessories change the vibe", "Reflect on balance"],
    rewards: ["Accessory master badge", "Detail styling skills", "Balance awareness"]
  },
  {
    id: "tuesday-5",
    title: "Capsule Wardrobe Builder",
    emoji: "🧢",
    description: "Curate a mini capsule wardrobe with versatile items",
    instructions: "Create a small collection of items that can be mixed and matched to create multiple outfits. Focus on versatility!",
    difficulty: "Hard",
    category: "Learning",
    points: 40,
    xpReward: 40,
    streakBonus: 8,
    type: "task",
    requirements: ["Pick 5–7 core items", "Ensure mix & match possibilities", "Balance colors, textures, and categories", "Note how many outfits you can make", "Share your reflections"],
    rewards: ["Capsule expert badge", "Wardrobe planning skills", "Maximization mastery"]
  }
];

// Continue with other days...
const WEDNESDAY_CHALLENGES: Omit<DailyChallenge, 'isCompleted' | 'completedAt' | 'progress' | 'maxProgress'>[] = [
  {
    id: "wednesday-1",
    title: "Outfit Builder",
    emoji: "👕",
    description: "Put together a simple outfit combination and reflect on your choices",
    instructions: "Create a basic outfit by selecting a base item and adding complementary pieces. Think about why they work together!",
    difficulty: "Easy",
    category: "Fun",
    points: 15,
    xpReward: 15,
    streakBonus: 3,
    type: "task",
    requirements: ["Pick a base item (top or bottom)", "Add 1 complementary piece", "Take a quick note on why they match"],
    rewards: ["Outfit builder badge", "Style confidence", "Basic styling skills"]
  },
  {
    id: "wednesday-2",
    title: "Color Match",
    emoji: "👗",
    description: "Experiment with colors by creating a coordinated look",
    instructions: "Play with color combinations! Choose a main color and build an outfit around it with matching or contrasting colors.",
    difficulty: "Easy",
    category: "Learning",
    points: 20,
    xpReward: 20,
    streakBonus: 4,
    type: "task",
    requirements: ["Select a main color", "Add 2 matching or contrasting colors", "Reflect on how the palette works"],
    rewards: ["Color expert badge", "Color theory knowledge", "Visual harmony skills"]
  },
  {
    id: "wednesday-3",
    title: "Style Challenge",
    emoji: "🧥",
    description: "Style an outfit for a specific occasion",
    instructions: "Choose an event and create the perfect outfit for it. Think about what works for different occasions!",
    difficulty: "Medium",
    category: "Fun",
    points: 25,
    xpReward: 25,
    streakBonus: 5,
    type: "task",
    requirements: ["Choose an event (casual, formal, party, work)", "Pick items from wardrobe/catalog", "Write why this outfit fits the occasion"],
    rewards: ["Occasion expert badge", "Event styling skills", "Context awareness"]
  },
  {
    id: "wednesday-4",
    title: "Accessory Match",
    emoji: "👠",
    description: "Enhance your outfit with the right accessories",
    instructions: "Take a base outfit and elevate it with the perfect accessories. Learn how small details make a big difference!",
    difficulty: "Medium",
    category: "Learning",
    points: 30,
    xpReward: 30,
    streakBonus: 6,
    type: "task",
    requirements: ["Choose a base outfit", "Add shoes, bag, and one jewelry piece", "Track how accessories change the vibe", "Reflect on balance"],
    rewards: ["Accessory master badge", "Detail styling skills", "Balance awareness"]
  },
  {
    id: "wednesday-5",
    title: "Capsule Wardrobe Builder",
    emoji: "🧢",
    description: "Curate a mini capsule wardrobe with versatile items",
    instructions: "Create a small collection of items that can be mixed and matched to create multiple outfits. Focus on versatility!",
    difficulty: "Hard",
    category: "Learning",
    points: 40,
    xpReward: 40,
    streakBonus: 8,
    type: "task",
    requirements: ["Pick 5–7 core items", "Ensure mix & match possibilities", "Balance colors, textures, and categories", "Note how many outfits you can make", "Share your reflections"],
    rewards: ["Capsule expert badge", "Wardrobe planning skills", "Maximization mastery"]
  }
];

const THURSDAY_CHALLENGES: Omit<DailyChallenge, 'isCompleted' | 'completedAt' | 'progress' | 'maxProgress'>[] = [
  {
    id: "thursday-1",
    title: "Outfit Builder",
    emoji: "👕",
    description: "Put together a simple outfit combination and reflect on your choices",
    instructions: "Create a basic outfit by selecting a base item and adding complementary pieces. Think about why they work together!",
    difficulty: "Easy",
    category: "Fun",
    points: 15,
    xpReward: 15,
    streakBonus: 3,
    type: "task",
    requirements: ["Pick a base item (top or bottom)", "Add 1 complementary piece", "Take a quick note on why they match"],
    rewards: ["Outfit builder badge", "Style confidence", "Basic styling skills"]
  },
  {
    id: "thursday-2",
    title: "Color Match",
    emoji: "👗",
    description: "Experiment with colors by creating a coordinated look",
    instructions: "Play with color combinations! Choose a main color and build an outfit around it with matching or contrasting colors.",
    difficulty: "Easy",
    category: "Learning",
    points: 20,
    xpReward: 20,
    streakBonus: 4,
    type: "task",
    requirements: ["Select a main color", "Add 2 matching or contrasting colors", "Reflect on how the palette works"],
    rewards: ["Color expert badge", "Color theory knowledge", "Visual harmony skills"]
  },
  {
    id: "thursday-3",
    title: "Style Challenge",
    emoji: "🧥",
    description: "Style an outfit for a specific occasion",
    instructions: "Choose an event and create the perfect outfit for it. Think about what works for different occasions!",
    difficulty: "Medium",
    category: "Fun",
    points: 25,
    xpReward: 25,
    streakBonus: 5,
    type: "task",
    requirements: ["Choose an event (casual, formal, party, work)", "Pick items from wardrobe/catalog", "Write why this outfit fits the occasion"],
    rewards: ["Occasion expert badge", "Event styling skills", "Context awareness"]
  },
  {
    id: "thursday-4",
    title: "Accessory Match",
    emoji: "👠",
    description: "Enhance your outfit with the right accessories",
    instructions: "Take a base outfit and elevate it with the perfect accessories. Learn how small details make a big difference!",
    difficulty: "Medium",
    category: "Learning",
    points: 30,
    xpReward: 30,
    streakBonus: 6,
    type: "task",
    requirements: ["Choose a base outfit", "Add shoes, bag, and one jewelry piece", "Track how accessories change the vibe", "Reflect on balance"],
    rewards: ["Accessory master badge", "Detail styling skills", "Balance awareness"]
  },
  {
    id: "thursday-5",
    title: "Capsule Wardrobe Builder",
    emoji: "🧢",
    description: "Curate a mini capsule wardrobe with versatile items",
    instructions: "Create a small collection of items that can be mixed and matched to create multiple outfits. Focus on versatility!",
    difficulty: "Hard",
    category: "Learning",
    points: 40,
    xpReward: 40,
    streakBonus: 8,
    type: "task",
    requirements: ["Pick 5–7 core items", "Ensure mix & match possibilities", "Balance colors, textures, and categories", "Note how many outfits you can make", "Share your reflections"],
    rewards: ["Capsule expert badge", "Wardrobe planning skills", "Maximization mastery"]
  }
];

const FRIDAY_CHALLENGES: Omit<DailyChallenge, 'isCompleted' | 'completedAt' | 'progress' | 'maxProgress'>[] = [
  {
    id: "friday-1",
    title: "Outfit Builder",
    emoji: "👕",
    description: "Put together a simple outfit combination and reflect on your choices",
    instructions: "Create a basic outfit by selecting a base item and adding complementary pieces. Think about why they work together!",
    difficulty: "Easy",
    category: "Fun",
    points: 15,
    xpReward: 15,
    streakBonus: 3,
    type: "task",
    requirements: ["Pick a base item (top or bottom)", "Add 1 complementary piece", "Take a quick note on why they match"],
    rewards: ["Outfit builder badge", "Style confidence", "Basic styling skills"]
  },
  {
    id: "friday-2",
    title: "Color Match",
    emoji: "👗",
    description: "Experiment with colors by creating a coordinated look",
    instructions: "Play with color combinations! Choose a main color and build an outfit around it with matching or contrasting colors.",
    difficulty: "Easy",
    category: "Learning",
    points: 20,
    xpReward: 20,
    streakBonus: 4,
    type: "task",
    requirements: ["Select a main color", "Add 2 matching or contrasting colors", "Reflect on how the palette works"],
    rewards: ["Color expert badge", "Color theory knowledge", "Visual harmony skills"]
  },
  {
    id: "friday-3",
    title: "Style Challenge",
    emoji: "🧥",
    description: "Style an outfit for a specific occasion",
    instructions: "Choose an event and create the perfect outfit for it. Think about what works for different occasions!",
    difficulty: "Medium",
    category: "Fun",
    points: 25,
    xpReward: 25,
    streakBonus: 5,
    type: "task",
    requirements: ["Choose an event (casual, formal, party, work)", "Pick items from wardrobe/catalog", "Write why this outfit fits the occasion"],
    rewards: ["Occasion expert badge", "Event styling skills", "Context awareness"]
  },
  {
    id: "friday-4",
    title: "Accessory Match",
    emoji: "👠",
    description: "Enhance your outfit with the right accessories",
    instructions: "Take a base outfit and elevate it with the perfect accessories. Learn how small details make a big difference!",
    difficulty: "Medium",
    category: "Learning",
    points: 30,
    xpReward: 30,
    streakBonus: 6,
    type: "task",
    requirements: ["Choose a base outfit", "Add shoes, bag, and one jewelry piece", "Track how accessories change the vibe", "Reflect on balance"],
    rewards: ["Accessory master badge", "Detail styling skills", "Balance awareness"]
  },
  {
    id: "friday-5",
    title: "Capsule Wardrobe Builder",
    emoji: "🧢",
    description: "Curate a mini capsule wardrobe with versatile items",
    instructions: "Create a small collection of items that can be mixed and matched to create multiple outfits. Focus on versatility!",
    difficulty: "Hard",
    category: "Learning",
    points: 40,
    xpReward: 40,
    streakBonus: 8,
    type: "task",
    requirements: ["Pick 5–7 core items", "Ensure mix & match possibilities", "Balance colors, textures, and categories", "Note how many outfits you can make", "Share your reflections"],
    rewards: ["Capsule expert badge", "Wardrobe planning skills", "Maximization mastery"]
  }
];

const SATURDAY_CHALLENGES: Omit<DailyChallenge, 'isCompleted' | 'completedAt' | 'progress' | 'maxProgress'>[] = [
  {
    id: "saturday-1",
    title: "Outfit Builder",
    emoji: "👕",
    description: "Put together a simple outfit combination and reflect on your choices",
    instructions: "Create a basic outfit by selecting a base item and adding complementary pieces. Think about why they work together!",
    difficulty: "Easy",
    category: "Fun",
    points: 15,
    xpReward: 15,
    streakBonus: 3,
    type: "task",
    requirements: ["Pick a base item (top or bottom)", "Add 1 complementary piece", "Take a quick note on why they match"],
    rewards: ["Outfit builder badge", "Style confidence", "Basic styling skills"]
  },
  {
    id: "saturday-2",
    title: "Color Match",
    emoji: "👗",
    description: "Experiment with colors by creating a coordinated look",
    instructions: "Play with color combinations! Choose a main color and build an outfit around it with matching or contrasting colors.",
    difficulty: "Easy",
    category: "Learning",
    points: 20,
    xpReward: 20,
    streakBonus: 4,
    type: "task",
    requirements: ["Select a main color", "Add 2 matching or contrasting colors", "Reflect on how the palette works"],
    rewards: ["Color expert badge", "Color theory knowledge", "Visual harmony skills"]
  },
  {
    id: "saturday-3",
    title: "Style Challenge",
    emoji: "🧥",
    description: "Style an outfit for a specific occasion",
    instructions: "Choose an event and create the perfect outfit for it. Think about what works for different occasions!",
    difficulty: "Medium",
    category: "Fun",
    points: 25,
    xpReward: 25,
    streakBonus: 5,
    type: "task",
    requirements: ["Choose an event (casual, formal, party, work)", "Pick items from wardrobe/catalog", "Write why this outfit fits the occasion"],
    rewards: ["Occasion expert badge", "Event styling skills", "Context awareness"]
  },
  {
    id: "saturday-4",
    title: "Accessory Match",
    emoji: "👠",
    description: "Enhance your outfit with the right accessories",
    instructions: "Take a base outfit and elevate it with the perfect accessories. Learn how small details make a big difference!",
    difficulty: "Medium",
    category: "Learning",
    points: 30,
    xpReward: 30,
    streakBonus: 6,
    type: "task",
    requirements: ["Choose a base outfit", "Add shoes, bag, and one jewelry piece", "Track how accessories change the vibe", "Reflect on balance"],
    rewards: ["Accessory master badge", "Detail styling skills", "Balance awareness"]
  },
  {
    id: "saturday-5",
    title: "Capsule Wardrobe Builder",
    emoji: "🧢",
    description: "Curate a mini capsule wardrobe with versatile items",
    instructions: "Create a small collection of items that can be mixed and matched to create multiple outfits. Focus on versatility!",
    difficulty: "Hard",
    category: "Learning",
    points: 40,
    xpReward: 40,
    streakBonus: 8,
    type: "task",
    requirements: ["Pick 5–7 core items", "Ensure mix & match possibilities", "Balance colors, textures, and categories", "Note how many outfits you can make", "Share your reflections"],
    rewards: ["Capsule expert badge", "Wardrobe planning skills", "Maximization mastery"]
  }
];

const SUNDAY_CHALLENGES: Omit<DailyChallenge, 'isCompleted' | 'completedAt' | 'progress' | 'maxProgress'>[] = [
  {
    id: "sunday-1",
    title: "Outfit Builder",
    emoji: "👕",
    description: "Put together a simple outfit combination and reflect on your choices",
    instructions: "Create a basic outfit by selecting a base item and adding complementary pieces. Think about why they work together!",
    difficulty: "Easy",
    category: "Fun",
    points: 15,
    xpReward: 15,
    streakBonus: 3,
    type: "task",
    requirements: ["Pick a base item (top or bottom)", "Add 1 complementary piece", "Take a quick note on why they match"],
    rewards: ["Outfit builder badge", "Style confidence", "Basic styling skills"]
  },
  {
    id: "sunday-2",
    title: "Color Match",
    emoji: "👗",
    description: "Experiment with colors by creating a coordinated look",
    instructions: "Play with color combinations! Choose a main color and build an outfit around it with matching or contrasting colors.",
    difficulty: "Easy",
    category: "Learning",
    points: 20,
    xpReward: 20,
    streakBonus: 4,
    type: "task",
    requirements: ["Select a main color", "Add 2 matching or contrasting colors", "Reflect on how the palette works"],
    rewards: ["Color expert badge", "Color theory knowledge", "Visual harmony skills"]
  },
  {
    id: "sunday-3",
    title: "Style Challenge",
    emoji: "🧥",
    description: "Style an outfit for a specific occasion",
    instructions: "Choose an event and create the perfect outfit for it. Think about what works for different occasions!",
    difficulty: "Medium",
    category: "Fun",
    points: 25,
    xpReward: 25,
    streakBonus: 5,
    type: "task",
    requirements: ["Choose an event (casual, formal, party, work)", "Pick items from wardrobe/catalog", "Write why this outfit fits the occasion"],
    rewards: ["Occasion expert badge", "Event styling skills", "Context awareness"]
  },
  {
    id: "sunday-4",
    title: "Accessory Match",
    emoji: "👠",
    description: "Enhance your outfit with the right accessories",
    instructions: "Take a base outfit and elevate it with the perfect accessories. Learn how small details make a big difference!",
    difficulty: "Medium",
    category: "Learning",
    points: 30,
    xpReward: 30,
    streakBonus: 6,
    type: "task",
    requirements: ["Choose a base outfit", "Add shoes, bag, and one jewelry piece", "Track how accessories change the vibe", "Reflect on balance"],
    rewards: ["Accessory master badge", "Detail styling skills", "Balance awareness"]
  },
  {
    id: "sunday-5",
    title: "Capsule Wardrobe Builder",
    emoji: "🧢",
    description: "Curate a mini capsule wardrobe with versatile items",
    instructions: "Create a small collection of items that can be mixed and matched to create multiple outfits. Focus on versatility!",
    difficulty: "Hard",
    category: "Learning",
    points: 40,
    xpReward: 40,
    streakBonus: 8,
    type: "task",
    requirements: ["Pick 5–7 core items", "Ensure mix & match possibilities", "Balance colors, textures, and categories", "Note how many outfits you can make", "Share your reflections"],
    rewards: ["Capsule expert badge", "Wardrobe planning skills", "Maximization mastery"]
  }
];

// Challenge pools by day
const CHALLENGE_POOLS = {
  monday: MONDAY_CHALLENGES,
  tuesday: TUESDAY_CHALLENGES,
  wednesday: WEDNESDAY_CHALLENGES,
  thursday: THURSDAY_CHALLENGES,
  friday: FRIDAY_CHALLENGES,
  saturday: SATURDAY_CHALLENGES,
  sunday: SUNDAY_CHALLENGES
};

// Get current day of week
const getCurrentDay = (): keyof typeof CHALLENGE_POOLS => {
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  return days[new Date().getDay()] as keyof typeof CHALLENGE_POOLS;
};

// Force refresh challenges (for development/testing)
export const forceRefreshChallenges = (): void => {
  localStorage.removeItem('dailyChallenges');
  localStorage.removeItem('dailyChallengesDate');
  localStorage.removeItem('userProgress');
};

// Get today's challenges
export const getTodaysChallenges = (): DailyChallenge[] => {
  const today = getCurrentDay();
  const challenges = CHALLENGE_POOLS[today];
  
  // Check if we already have today's challenges stored
  const storedDate = localStorage.getItem('dailyChallengesDate');
  const todayDate = new Date().toDateString();
  
  // If we have challenges for today, return them (preserving completion status)
  if (storedDate === todayDate) {
    const storedChallenges = localStorage.getItem('dailyChallenges');
    if (storedChallenges) {
      try {
        const parsedChallenges = JSON.parse(storedChallenges);
        // Ensure all challenges have the required properties
        return parsedChallenges.map((challenge: any) => ({
          ...challenge,
          isCompleted: challenge.isCompleted || false,
          progress: challenge.progress || 0,
          maxProgress: challenge.maxProgress || challenge.requirements?.length || 1,
          completedAt: challenge.completedAt || undefined
        }));
      } catch (error) {
        console.error('Error parsing stored challenges:', error);
        // Fall through to generate new challenges
      }
    }
  }
  
  // Generate new challenges for today
  const shuffled = [...challenges].sort(() => Math.random() - 0.5);
  const todaysChallenges = shuffled.slice(0, 5).map(challenge => ({
    ...challenge,
    isCompleted: false,
    progress: 0,
    maxProgress: challenge.requirements?.length || 1
  }));
  
  // Store today's challenges
  localStorage.setItem('dailyChallenges', JSON.stringify(todaysChallenges));
  localStorage.setItem('dailyChallengesDate', todayDate);
  
  return todaysChallenges;
};

// Badge definitions
export const BADGES: Badge[] = [
  {
    id: "first-challenge",
    name: "Getting Started",
    emoji: "🎯",
    description: "Complete your first challenge",
    requirement: 1,
    category: "challenges",
    unlocked: false
  },
  {
    id: "streak-3",
    name: "On Fire",
    emoji: "🔥",
    description: "Complete challenges for 3 days in a row",
    requirement: 3,
    category: "streak",
    unlocked: false
  },
  {
    id: "streak-7",
    name: "Week Warrior",
    emoji: "⚡",
    description: "Complete challenges for 7 days in a row",
    requirement: 7,
    category: "streak",
    unlocked: false
  },
  {
    id: "streak-30",
    name: "Month Master",
    emoji: "👑",
    description: "Complete challenges for 30 days in a row",
    requirement: 30,
    category: "streak",
    unlocked: false
  },
  {
    id: "xp-100",
    name: "Rising Star",
    emoji: "⭐",
    description: "Earn 100 XP points",
    requirement: 100,
    category: "xp",
    unlocked: false
  },
  {
    id: "xp-500",
    name: "Style Expert",
    emoji: "💎",
    description: "Earn 500 XP points",
    requirement: 500,
    category: "xp",
    unlocked: false
  },
  {
    id: "xp-1000",
    name: "Fashion Icon",
    emoji: "🌟",
    description: "Earn 1000 XP points",
    requirement: 1000,
    category: "xp",
    unlocked: false
  },
  {
    id: "challenges-10",
    name: "Challenge Crusher",
    emoji: "🏆",
    description: "Complete 10 challenges",
    requirement: 10,
    category: "challenges",
    unlocked: false
  },
  {
    id: "challenges-50",
    name: "Challenge Champion",
    emoji: "🥇",
    description: "Complete 50 challenges",
    requirement: 50,
    category: "challenges",
    unlocked: false
  },
  {
    id: "perfect-week",
    name: "Perfect Week",
    emoji: "✨",
    description: "Complete all challenges in a week",
    requirement: 7,
    category: "special",
    unlocked: false
  }
];

// Get user progress
export const getUserProgress = (): UserProgress => {
  const stored = localStorage.getItem('userProgress');
  if (stored) {
    return JSON.parse(stored);
  }
  
  return {
    totalXP: 0,
    level: 1,
    currentStreak: 0,
    longestStreak: 0,
    challengesCompleted: 0,
    badges: [],
    lastActiveDate: new Date().toDateString(),
    weeklyProgress: 0,
    monthlyProgress: 0
  };
};

// Calculate dynamic XP based on performance
export const calculateDynamicXP = (challenge: DailyChallenge, performance: number): number => {
  // performance is a number between 0 and 1 (0 = poor, 1 = perfect)
  const baseXP = challenge.xpReward;
  const maxXP = challenge.points; // Maximum possible XP for this challenge
  
  // Calculate XP based on performance
  // Minimum 20% of base XP, maximum 100% of max XP
  const minXP = Math.floor(baseXP * 0.2);
  const calculatedXP = Math.floor(minXP + (performance * (maxXP - minXP)));
  
  // Ensure we don't exceed the maximum possible XP
  return Math.min(calculatedXP, maxXP);
};

// Update user progress with dynamic scoring
export const updateUserProgress = (challenge: DailyChallenge, earnedXP: number): UserProgress => {
  const progress = getUserProgress();
  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();
  
  // Update XP and level
  progress.totalXP += earnedXP;
  progress.level = Math.floor(progress.totalXP / 100) + 1;
  
  // Update streak
  if (progress.lastActiveDate === yesterday) {
    progress.currentStreak += 1;
  } else if (progress.lastActiveDate !== today) {
    progress.currentStreak = 1;
  }
  
  if (progress.currentStreak > progress.longestStreak) {
    progress.longestStreak = progress.currentStreak;
  }
  
  progress.challengesCompleted += 1;
  progress.lastActiveDate = today;
  
  // Check for new badges
  const newBadges = checkForNewBadges(progress);
  progress.badges = [...progress.badges, ...newBadges];
  
  localStorage.setItem('userProgress', JSON.stringify(progress));
  return progress;
};

// Check for new badges
const checkForNewBadges = (progress: UserProgress): string[] => {
  const newBadges: string[] = [];
  
  BADGES.forEach(badge => {
    if (progress.badges.includes(badge.id)) return;
    
    let unlocked = false;
    switch (badge.category) {
      case 'challenges':
        unlocked = progress.challengesCompleted >= badge.requirement;
        break;
      case 'streak':
        unlocked = progress.currentStreak >= badge.requirement;
        break;
      case 'xp':
        unlocked = progress.totalXP >= badge.requirement;
        break;
      case 'special':
        // Special logic for perfect week, etc.
        break;
    }
    
    if (unlocked) {
      newBadges.push(badge.id);
    }
  });
  
  return newBadges;
};
