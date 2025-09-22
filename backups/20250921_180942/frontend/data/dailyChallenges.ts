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
    title: "Gratitude Journal",
    emoji: "📝",
    description: "Write down 3 things you're grateful for today",
    instructions: "Take a moment to reflect and write down three things you're grateful for. This simple practice can boost your mood and perspective!",
    difficulty: "Easy",
    category: "Learning",
    points: 30,
    xpReward: 20,
    streakBonus: 5,
    type: "task",
    requirements: ["Write 3 gratitude items", "Reflect on each one", "Share if comfortable"],
    rewards: ["Gratitude badge", "Mindfulness points", "Positive mindset"]
  },
  {
    id: "monday-2",
    title: "Mood Tracker",
    emoji: "😊",
    description: "Track your mood and write a brief reflection",
    instructions: "Check in with yourself and track your current mood. Write a brief reflection on what's influencing how you feel today.",
    difficulty: "Easy",
    category: "Learning",
    points: 25,
    xpReward: 15,
    streakBonus: 3,
    type: "task",
    requirements: ["Select current mood", "Rate energy level", "Write reflection"],
    rewards: ["Self-awareness badge", "Wellness points", "Emotional intelligence"]
  },
  {
    id: "monday-3",
    title: "Fitness Push",
    emoji: "💪",
    description: "Complete 20 pushups and track your progress",
    instructions: "Get your blood pumping with 20 pushups! Track your form and how you feel before and after.",
    difficulty: "Medium",
    category: "Fun",
    points: 50,
    xpReward: 30,
    streakBonus: 8,
    type: "task",
    requirements: ["Warm up first", "Complete 20 pushups", "Track form", "Cool down"],
    rewards: ["Fitness badge", "Strength points", "Health boost"]
  },
  {
    id: "monday-4",
    title: "Learning Quiz",
    emoji: "🧠",
    description: "Take a quick quiz on a topic you want to learn",
    instructions: "Choose a topic you're curious about and take a 5-question quiz. Learn something new today!",
    difficulty: "Medium",
    category: "Learning",
    points: 40,
    xpReward: 25,
    streakBonus: 6,
    type: "learning",
    requirements: ["Choose topic", "Answer 5 questions", "Review results"],
    rewards: ["Learning badge", "Knowledge points", "Curiosity boost"]
  },
  {
    id: "monday-5",
    title: "Social Connection",
    emoji: "💬",
    description: "Message a friend or family member to check in",
    instructions: "Reach out to someone you care about. Send a meaningful message and engage in a real conversation.",
    difficulty: "Easy",
    category: "Social",
    points: 35,
    xpReward: 20,
    streakBonus: 4,
    type: "social",
    requirements: ["Choose person", "Send meaningful message", "Engage in conversation"],
    rewards: ["Social badge", "Connection points", "Relationship building"]
  }
];

const TUESDAY_CHALLENGES: Omit<DailyChallenge, 'isCompleted' | 'completedAt' | 'progress' | 'maxProgress'>[] = [
  {
    id: "tuesday-1",
    title: "Texture Mix Master",
    emoji: "🧵",
    description: "Combine 3 different textures in one outfit",
    instructions: "Mix smooth, rough, and soft textures to create visual interest. Think leather + silk + denim!",
    difficulty: "Medium",
    category: "Style",
    points: 80,
    xpReward: 40,
    streakBonus: 16,
    type: "creative",
    requirements: ["Identify textures", "Combine 3+ textures", "Balance the look"],
    rewards: ["Texture expert", "Design skills", "Visual harmony"]
  },
  {
    id: "tuesday-2",
    title: "Layering Pro",
    emoji: "👗",
    description: "Master the art of layering with 4+ pieces",
    instructions: "Create a sophisticated layered look that's both stylish and functional. Perfect for transitional weather!",
    difficulty: "Hard",
    category: "Style",
    points: 90,
    xpReward: 45,
    streakBonus: 18,
    type: "task",
    requirements: ["Choose base layer", "Add 3+ layers", "Maintain proportions"],
    rewards: ["Layering master", "Styling expertise", "Weather adaptability"]
  },
  {
    id: "tuesday-3",
    title: "Vintage Vibes",
    emoji: "🕰️",
    description: "Style a vintage-inspired outfit from any era",
    instructions: "Channel your favorite fashion era - 60s mod, 70s bohemian, 80s power dressing, or 90s grunge!",
    difficulty: "Medium",
    category: "Style",
    points: 75,
    xpReward: 38,
    streakBonus: 15,
    type: "creative",
    requirements: ["Choose era", "Research style", "Recreate the look"],
    rewards: ["Vintage lover", "Fashion history", "Era expertise"]
  },
  {
    id: "tuesday-4",
    title: "Minimalist Magic",
    emoji: "⚪",
    description: "Create a stunning outfit with only 3 items",
    instructions: "Less is more! Build a chic, minimalist look using just 3 carefully chosen pieces.",
    difficulty: "Hard",
    category: "Style",
    points: 85,
    xpReward: 42,
    streakBonus: 17,
    type: "creative",
    requirements: ["Select 3 items", "Maximize impact", "Keep it simple"],
    rewards: ["Minimalist master", "Editing skills", "Simplicity beauty"]
  },
  {
    id: "tuesday-5",
    title: "Pattern Play",
    emoji: "🎭",
    description: "Mix 2 different patterns in one outfit",
    instructions: "Combine stripes with florals, polka dots with plaid, or any two patterns that work together!",
    difficulty: "Hard",
    category: "Style",
    points: 95,
    xpReward: 48,
    streakBonus: 19,
    type: "creative",
    requirements: ["Choose 2 patterns", "Balance scale", "Coordinate colors"],
    rewards: ["Pattern pro", "Mixing skills", "Bold confidence"]
  }
];

// Continue with other days...
const WEDNESDAY_CHALLENGES: Omit<DailyChallenge, 'isCompleted' | 'completedAt' | 'progress' | 'maxProgress'>[] = [
  {
    id: "wednesday-1",
    title: "Work From Home Chic",
    emoji: "💼",
    description: "Look professional on top, comfy on bottom",
    instructions: "Perfect the WFH aesthetic - professional enough for video calls, comfortable for all-day wear!",
    difficulty: "Easy",
    category: "Style",
    points: 60,
    xpReward: 30,
    streakBonus: 12,
    type: "task",
    requirements: ["Professional top", "Comfortable bottom", "Video-ready look"],
    rewards: ["WFH expert", "Professional comfort", "Zoom confidence"]
  },
  {
    id: "wednesday-2",
    title: "Athleisure Queen",
    emoji: "🏃‍♀️",
    description: "Style activewear for everyday activities",
    instructions: "Make your workout clothes work for coffee runs, errands, and casual outings!",
    difficulty: "Medium",
    category: "Style",
    points: 70,
    xpReward: 35,
    streakBonus: 14,
    type: "task",
    requirements: ["Choose activewear", "Style for everyday", "Maintain comfort"],
    rewards: ["Athleisure pro", "Comfort style", "Active lifestyle"]
  },
  {
    id: "wednesday-3",
    title: "Denim Double",
    emoji: "👖",
    description: "Wear denim on denim (Canadian tuxedo)",
    instructions: "Master the art of double denim - jeans with a denim jacket or shirt. Make it look intentional!",
    difficulty: "Medium",
    category: "Style",
    points: 75,
    xpReward: 38,
    streakBonus: 15,
    type: "creative",
    requirements: ["Choose denim pieces", "Vary washes", "Add contrast"],
    rewards: ["Denim expert", "Canadian tuxedo", "Double denim mastery"]
  },
  {
    id: "wednesday-4",
    title: "Shoe Game Strong",
    emoji: "👟",
    description: "Let your shoes be the statement piece",
    instructions: "Build an outfit around a standout pair of shoes - heels, sneakers, boots, or sandals!",
    difficulty: "Easy",
    category: "Style",
    points: 65,
    xpReward: 32,
    streakBonus: 13,
    type: "task",
    requirements: ["Choose statement shoes", "Build around them", "Let them shine"],
    rewards: ["Shoe enthusiast", "Statement styling", "Footwear focus"]
  },
  {
    id: "wednesday-5",
    title: "Color Blocking",
    emoji: "🟦",
    description: "Create bold color blocks in your outfit",
    instructions: "Use solid, contrasting colors to create striking visual blocks. Think primary colors!",
    difficulty: "Hard",
    category: "Style",
    points: 90,
    xpReward: 45,
    streakBonus: 18,
    type: "creative",
    requirements: ["Choose bold colors", "Create blocks", "Maintain balance"],
    rewards: ["Color expert", "Bold confidence", "Visual impact"]
  }
];

const THURSDAY_CHALLENGES: Omit<DailyChallenge, 'isCompleted' | 'completedAt' | 'progress' | 'maxProgress'>[] = [
  {
    id: "thursday-1",
    title: "Thrift Store Treasure",
    emoji: "🛍️",
    description: "Style an outfit with thrifted or vintage pieces",
    instructions: "Show off your thrifting skills! Style a look using second-hand or vintage finds.",
    difficulty: "Medium",
    category: "Style",
    points: 80,
    xpReward: 40,
    streakBonus: 16,
    type: "task",
    requirements: ["Find thrifted items", "Style creatively", "Show sustainability"],
    rewards: ["Thrift master", "Sustainable style", "Vintage appreciation"]
  },
  {
    id: "thursday-2",
    title: "Mix & Match Master",
    emoji: "🔄",
    description: "Create 3 different outfits from the same 5 items",
    instructions: "Maximize your wardrobe! Use the same 5 pieces to create 3 completely different looks.",
    difficulty: "Hard",
    category: "Style",
    points: 100,
    xpReward: 50,
    streakBonus: 20,
    type: "creative",
    requirements: ["Choose 5 items", "Create 3 looks", "Show versatility"],
    rewards: ["Wardrobe wizard", "Versatility master", "Maximization skills"]
  },
  {
    id: "thursday-3",
    title: "Accessory Swap",
    emoji: "💍",
    description: "Style the same outfit with different accessories",
    instructions: "Take one base outfit and transform it with different accessories for different occasions.",
    difficulty: "Easy",
    category: "Style",
    points: 55,
    xpReward: 28,
    streakBonus: 11,
    type: "task",
    requirements: ["Choose base outfit", "Style 3 ways", "Show versatility"],
    rewards: ["Accessory expert", "Versatility skills", "Transformation mastery"]
  },
  {
    id: "thursday-4",
    title: "Seasonal Transition",
    emoji: "🍂",
    description: "Style a transitional weather outfit",
    instructions: "Perfect for those in-between weather days. Layer strategically for changing temperatures!",
    difficulty: "Medium",
    category: "Style",
    points: 70,
    xpReward: 35,
    streakBonus: 14,
    type: "task",
    requirements: ["Plan for weather", "Layer strategically", "Stay comfortable"],
    rewards: ["Weather warrior", "Layering expert", "Transition mastery"]
  },
  {
    id: "thursday-5",
    title: "Style Storytelling",
    emoji: "📖",
    description: "Tell a story through your outfit",
    instructions: "Use your clothes to tell a story - maybe you're a detective, an artist, or a world traveler!",
    difficulty: "Hard",
    category: "Style",
    points: 85,
    xpReward: 42,
    streakBonus: 17,
    type: "creative",
    requirements: ["Choose a story", "Style accordingly", "Express personality"],
    rewards: ["Storyteller", "Creative expression", "Personality showcase"]
  }
];

const FRIDAY_CHALLENGES: Omit<DailyChallenge, 'isCompleted' | 'completedAt' | 'progress' | 'maxProgress'>[] = [
  {
    id: "friday-1",
    title: "Friday Night Ready",
    emoji: "🌃",
    description: "Style an outfit that transitions from day to night",
    instructions: "Perfect for after-work plans! Create a look that works for the office and transforms for evening fun.",
    difficulty: "Medium",
    category: "Style",
    points: 75,
    xpReward: 38,
    streakBonus: 15,
    type: "task",
    requirements: ["Day-appropriate base", "Easy evening transformation", "Versatile pieces"],
    rewards: ["Transition expert", "Day-to-night mastery", "Versatility skills"]
  },
  {
    id: "friday-2",
    title: "Statement Piece Focus",
    emoji: "⭐",
    description: "Build an outfit around one amazing statement piece",
    instructions: "Let one incredible piece be the star - a bold jacket, unique dress, or standout accessory!",
    difficulty: "Easy",
    category: "Style",
    points: 65,
    xpReward: 32,
    streakBonus: 13,
    type: "task",
    requirements: ["Choose statement piece", "Build around it", "Let it shine"],
    rewards: ["Statement expert", "Focus mastery", "Star power"]
  },
  {
    id: "friday-3",
    title: "Weekend Warrior",
    emoji: "🏕️",
    description: "Style for a fun weekend activity",
    instructions: "Dress for your ideal weekend - brunch, hiking, shopping, or a day at the beach!",
    difficulty: "Easy",
    category: "Style",
    points: 60,
    xpReward: 30,
    streakBonus: 12,
    type: "task",
    requirements: ["Choose activity", "Dress appropriately", "Stay comfortable"],
    rewards: ["Weekend expert", "Activity styling", "Fun fashion"]
  },
  {
    id: "friday-4",
    title: "Bold & Beautiful",
    emoji: "💃",
    description: "Step out of your comfort zone with a bold fashion choice",
    instructions: "Try something you've never worn before - bright colors, bold patterns, or daring silhouettes!",
    difficulty: "Hard",
    category: "Style",
    points: 90,
    xpReward: 45,
    streakBonus: 18,
    type: "creative",
    requirements: ["Choose bold element", "Step out of comfort zone", "Own the look"],
    rewards: ["Bold beauty", "Courage points", "Style evolution"]
  },
  {
    id: "friday-5",
    title: "Social Media Ready",
    emoji: "📸",
    description: "Style an Instagram-worthy outfit",
    instructions: "Create a look that's perfect for social media - photogenic, trendy, and shareable!",
    difficulty: "Medium",
    category: "Style",
    points: 70,
    xpReward: 35,
    streakBonus: 14,
    type: "social",
    requirements: ["Photogenic outfit", "Trendy elements", "Shareable style"],
    rewards: ["Social media star", "Photogenic style", "Trend awareness"]
  }
];

const SATURDAY_CHALLENGES: Omit<DailyChallenge, 'isCompleted' | 'completedAt' | 'progress' | 'maxProgress'>[] = [
  {
    id: "saturday-1",
    title: "Saturday Self-Care",
    emoji: "🧘‍♀️",
    description: "Style a comfortable yet put-together look for self-care day",
    instructions: "Perfect for a day of relaxation, errands, or gentle activities. Comfort meets style!",
    difficulty: "Easy",
    category: "Style",
    points: 55,
    xpReward: 28,
    streakBonus: 11,
    type: "task",
    requirements: ["Comfortable base", "Put-together elements", "Self-care vibes"],
    rewards: ["Self-care expert", "Comfort style", "Wellness fashion"]
  },
  {
    id: "saturday-2",
    title: "Adventure Awaits",
    emoji: "🗺️",
    description: "Style for a day of exploration and adventure",
    instructions: "Dress for discovery - whether it's exploring your city, hiking, or trying new activities!",
    difficulty: "Medium",
    category: "Style",
    points: 70,
    xpReward: 35,
    streakBonus: 14,
    type: "task",
    requirements: ["Adventure-appropriate", "Comfortable for movement", "Explorer vibes"],
    rewards: ["Adventure seeker", "Explorer style", "Discovery fashion"]
  },
  {
    id: "saturday-3",
    title: "Creative Expression",
    emoji: "🎨",
    description: "Express your artistic side through fashion",
    instructions: "Use your outfit as a canvas - experiment with colors, textures, and artistic elements!",
    difficulty: "Hard",
    category: "Style",
    points: 85,
    xpReward: 42,
    streakBonus: 17,
    type: "creative",
    requirements: ["Artistic elements", "Creative expression", "Unique combinations"],
    rewards: ["Artistic soul", "Creative expression", "Fashion artistry"]
  },
  {
    id: "saturday-4",
    title: "Casual Chic",
    emoji: "☕",
    description: "Master the art of casual sophistication",
    instructions: "Look effortlessly chic for coffee dates, casual meetups, or weekend outings!",
    difficulty: "Medium",
    category: "Style",
    points: 75,
    xpReward: 38,
    streakBonus: 15,
    type: "task",
    requirements: ["Casual base", "Chic elements", "Effortless style"],
    rewards: ["Casual chic master", "Effortless style", "Sophisticated casual"]
  },
  {
    id: "saturday-5",
    title: "Weekend Warrior",
    emoji: "⚡",
    description: "Style for maximum impact with minimal effort",
    instructions: "Create a stunning look that looks like you spent hours but took minutes to put together!",
    difficulty: "Hard",
    category: "Style",
    points: 80,
    xpReward: 40,
    streakBonus: 16,
    type: "task",
    requirements: ["High impact", "Minimal effort", "Stunning result"],
    rewards: ["Efficiency expert", "Impact mastery", "Effortless beauty"]
  }
];

const SUNDAY_CHALLENGES: Omit<DailyChallenge, 'isCompleted' | 'completedAt' | 'progress' | 'maxProgress'>[] = [
  {
    id: "sunday-1",
    title: "Sunday Best",
    emoji: "⛪",
    description: "Style your best Sunday outfit for any occasion",
    instructions: "Whether it's brunch, church, family time, or relaxation - look your absolute best!",
    difficulty: "Easy",
    category: "Style",
    points: 60,
    xpReward: 30,
    streakBonus: 12,
    type: "task",
    requirements: ["Best outfit", "Occasion-appropriate", "Sunday vibes"],
    rewards: ["Sunday best", "Occasion mastery", "Best self"]
  },
  {
    id: "sunday-2",
    title: "Reflection & Renewal",
    emoji: "🔄",
    description: "Style an outfit that represents your goals and aspirations",
    instructions: "Use your clothes to reflect who you want to be - confident, successful, creative, or adventurous!",
    difficulty: "Medium",
    category: "Style",
    points: 75,
    xpReward: 38,
    streakBonus: 15,
    type: "creative",
    requirements: ["Reflect goals", "Aspirational style", "Personal expression"],
    rewards: ["Goal-oriented", "Aspirational style", "Personal growth"]
  },
  {
    id: "sunday-3",
    title: "Family Time Fashion",
    emoji: "👨‍👩‍👧‍👦",
    description: "Style for quality time with loved ones",
    instructions: "Look great while being comfortable for family activities, meals, or quality time together!",
    difficulty: "Easy",
    category: "Style",
    points: 55,
    xpReward: 28,
    streakBonus: 11,
    type: "task",
    requirements: ["Family-appropriate", "Comfortable", "Quality time ready"],
    rewards: ["Family fashion", "Quality time style", "Loved ones ready"]
  },
  {
    id: "sunday-4",
    title: "Prep for Success",
    emoji: "📋",
    description: "Style an outfit that prepares you for the week ahead",
    instructions: "Dress for success and confidence as you prepare for the upcoming week!",
    difficulty: "Medium",
    category: "Style",
    points: 70,
    xpReward: 35,
    streakBonus: 14,
    type: "task",
    requirements: ["Success-oriented", "Confidence-boosting", "Week preparation"],
    rewards: ["Success preparation", "Confidence boost", "Week readiness"]
  },
  {
    id: "sunday-5",
    title: "Gratitude & Grace",
    emoji: "🙏",
    description: "Style an outfit that makes you feel grateful and graceful",
    instructions: "Choose pieces that make you feel thankful for what you have and graceful in your movements!",
    difficulty: "Easy",
    category: "Style",
    points: 65,
    xpReward: 32,
    streakBonus: 13,
    type: "task",
    requirements: ["Grateful feeling", "Graceful movement", "Thankful vibes"],
    rewards: ["Gratitude fashion", "Graceful style", "Thankful beauty"]
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

// Get today's challenges
export const getTodaysChallenges = (): DailyChallenge[] => {
  const today = getCurrentDay();
  const challenges = CHALLENGE_POOLS[today];
  
  // Check if we already have today's challenges stored
  const storedDate = localStorage.getItem('dailyChallengesDate');
  const todayDate = new Date().toDateString();
  
  if (storedDate === todayDate) {
    const storedChallenges = localStorage.getItem('dailyChallenges');
    if (storedChallenges) {
      return JSON.parse(storedChallenges);
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

// Update user progress
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
