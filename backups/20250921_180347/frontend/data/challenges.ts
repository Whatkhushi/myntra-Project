// Style Challenges Data
export interface Challenge {
  id: string;
  title: string;
  emoji: string;
  description: string;
  instructions: string;
  points: number;
  difficulty: "Easy" | "Medium" | "Hard";
  category: string;
  completed?: boolean;
  completedAt?: string;
}

export interface LeaderboardUser {
  id: string;
  name: string;
  avatar: string;
  points: number;
  rank: number;
  streak: number;
  badges: string[];
  isCurrentUser?: boolean;
}

export interface UserStats {
  totalPoints: number;
  currentStreak: number;
  completedChallenges: string[];
  lastCompletedDate: string | null;
  badges: string[];
}

export const CHALLENGES: Challenge[] = [
  {
    id: "mix-match-master",
    title: "Mix & Match Master",
    emoji: "🌀",
    description: "Create an outfit using 1 Myntra item + 2 Closet items",
    instructions: "Pick one item from your Myntra catalog and combine it with 2 items from your personal closet to create a cohesive look. Show your creativity in mixing different sources!",
    points: 100,
    difficulty: "Easy",
    category: "Daily"
  },
  {
    id: "color-coordination",
    title: "Color Coordination",
    emoji: "🎨",
    description: "Build a monochrome or complementary color outfit",
    instructions: "Create an outfit using either monochrome (same color family) or complementary colors (opposite on color wheel). Show your understanding of color theory!",
    points: 150,
    difficulty: "Medium",
    category: "Weekly"
  },
  {
    id: "sustainable-style",
    title: "Sustainable Style",
    emoji: "🌱",
    description: "Style a look reusing at least 2 closet items",
    instructions: "Build an outfit using at least 2 items you already own. Show how you can create fresh looks with existing pieces - sustainability is key!",
    points: 125,
    difficulty: "Medium",
    category: "Weekly"
  },
  {
    id: "streetwear-king",
    title: "Streetwear King",
    emoji: "👟",
    description: "Put together a casual streetwear vibe",
    instructions: "Create a streetwear-inspired outfit with casual, trendy pieces. Think sneakers, hoodies, joggers, and accessories that scream urban cool!",
    points: 100,
    difficulty: "Easy",
    category: "Weekly"
  },
  {
    id: "occasion-fit",
    title: "Occasion Fit",
    emoji: "✨",
    description: "Build a fit for a given event (party, brunch, wedding)",
    instructions: "Choose an occasion and create the perfect outfit for it. Consider the dress code, venue, and time of day. Show you understand context!",
    points: 200,
    difficulty: "Hard",
    category: "Weekly"
  }
];

export const GENERAL_LEADERBOARD: LeaderboardUser[] = [
  {
    id: "user1",
    name: "StyleQueen✨",
    avatar: "👑",
    points: 2450,
    rank: 1,
    streak: 15,
    badges: ["🔥", "🏆", "👑"]
  },
  {
    id: "user2",
    name: "FashionBae💅",
    avatar: "💄",
    points: 2380,
    rank: 2,
    streak: 12,
    badges: ["🔥", "🏆"]
  },
  {
    id: "user3",
    name: "TrendSetter🔥",
    avatar: "⭐",
    points: 2250,
    rank: 3,
    streak: 8,
    badges: ["🔥", "🏆"]
  },
  {
    id: "user4",
    name: "StyleMaven👑",
    avatar: "💎",
    points: 2100,
    rank: 4,
    streak: 10,
    badges: ["🔥"]
  },
  {
    id: "user5",
    name: "FashionFrenzy💃",
    avatar: "🎭",
    points: 1950,
    rank: 5,
    streak: 6,
    badges: ["🔥"]
  },
  {
    id: "user6",
    name: "TrendyTiger🐅",
    avatar: "🐯",
    points: 1800,
    rank: 6,
    streak: 4,
    badges: []
  },
  {
    id: "user7",
    name: "StyleSage🧙‍♀️",
    avatar: "🔮",
    points: 1650,
    rank: 7,
    streak: 3,
    badges: []
  },
  {
    id: "user8",
    name: "FashionFairy🧚‍♀️",
    avatar: "🦋",
    points: 1500,
    rank: 8,
    streak: 2,
    badges: []
  }
];

export const FRIENDS_LEADERBOARD: LeaderboardUser[] = [
  {
    id: "friend1",
    name: "BestieBae💖",
    avatar: "💕",
    points: 2200,
    rank: 1,
    streak: 14,
    badges: ["🔥", "🏆", "👑"]
  },
  {
    id: "friend2",
    name: "RoomieStyle🏠",
    avatar: "🏡",
    points: 2100,
    rank: 2,
    streak: 11,
    badges: ["🔥", "🏆"]
  },
  {
    id: "friend3",
    name: "CousinChic👗",
    avatar: "👭",
    points: 1950,
    rank: 3,
    streak: 7,
    badges: ["🔥"]
  },
  {
    id: "friend4",
    name: "CollegeBFF🎓",
    avatar: "🎒",
    points: 1800,
    rank: 4,
    streak: 5,
    badges: ["🔥"]
  },
  {
    id: "friend5",
    name: "WorkWife💼",
    avatar: "👩‍💼",
    points: 1650,
    rank: 5,
    streak: 3,
    badges: []
  }
];

export const BADGES = {
  "🔥": { name: "Streak Master", description: "3+ day streak", color: "text-orange-500" },
  "🏆": { name: "Top 3", description: "Ranked in top 3", color: "text-yellow-500" },
  "👑": { name: "Fashion Royalty", description: "Top 1% of users", color: "text-purple-500" },
  "🌟": { name: "All Star", description: "Completed all challenges", color: "text-blue-500" },
  "💎": { name: "Diamond Elite", description: "1000+ points", color: "text-cyan-500" }
};

export const getInitialUserStats = (): UserStats => ({
  totalPoints: 0,
  currentStreak: 0,
  completedChallenges: [],
  lastCompletedDate: null,
  badges: []
});

export const getUserStats = (): UserStats => {
  const saved = localStorage.getItem("challengeUserStats");
  if (saved) {
    return JSON.parse(saved);
  }
  return getInitialUserStats();
};

export const updateUserStats = (challengeId: string, points: number): UserStats => {
  const stats = getUserStats();
  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();
  
  // Update points
  stats.totalPoints += points;
  
  // Update streak
  if (stats.lastCompletedDate === yesterday) {
    stats.currentStreak += 1;
  } else if (stats.lastCompletedDate !== today) {
    stats.currentStreak = 1;
  }
  
  // Update completed challenges
  if (!stats.completedChallenges.includes(challengeId)) {
    stats.completedChallenges.push(challengeId);
  }
  
  stats.lastCompletedDate = today;
  
  // Check for new badges
  const newBadges: string[] = [];
  
  if (stats.currentStreak >= 3 && !stats.badges.includes("🔥")) {
    newBadges.push("🔥");
  }
  
  if (stats.totalPoints >= 1000 && !stats.badges.includes("💎")) {
    newBadges.push("💎");
  }
  
  if (stats.completedChallenges.length === CHALLENGES.length && !stats.badges.includes("🌟")) {
    newBadges.push("🌟");
  }
  
  stats.badges = [...stats.badges, ...newBadges];
  
  localStorage.setItem("challengeUserStats", JSON.stringify(stats));
  return stats;
};

export const getUpdatedLeaderboards = (userStats: UserStats) => {
  // Update general leaderboard with current user
  const updatedGeneral = [...GENERAL_LEADERBOARD];
  const currentUserIndex = updatedGeneral.findIndex(user => user.isCurrentUser);
  
  if (currentUserIndex >= 0) {
    updatedGeneral[currentUserIndex] = {
      ...updatedGeneral[currentUserIndex],
      points: userStats.totalPoints,
      streak: userStats.currentStreak,
      badges: userStats.badges
    };
  } else {
    updatedGeneral.push({
      id: "current-user",
      name: "You",
      avatar: "👤",
      points: userStats.totalPoints,
      rank: 0,
      streak: userStats.currentStreak,
      badges: userStats.badges,
      isCurrentUser: true
    });
  }
  
  // Sort by points and update ranks
  updatedGeneral.sort((a, b) => b.points - a.points);
  updatedGeneral.forEach((user, index) => {
    user.rank = index + 1;
  });
  
  // Update friends leaderboard with current user
  const updatedFriends = [...FRIENDS_LEADERBOARD];
  const currentUserFriendsIndex = updatedFriends.findIndex(user => user.isCurrentUser);
  
  if (currentUserFriendsIndex >= 0) {
    updatedFriends[currentUserFriendsIndex] = {
      ...updatedFriends[currentUserFriendsIndex],
      points: userStats.totalPoints,
      streak: userStats.currentStreak,
      badges: userStats.badges
    };
  } else {
    updatedFriends.push({
      id: "current-user-friends",
      name: "You",
      avatar: "👤",
      points: userStats.totalPoints,
      rank: 0,
      streak: userStats.currentStreak,
      badges: userStats.badges,
      isCurrentUser: true
    });
  }
  
  // Sort by points and update ranks
  updatedFriends.sort((a, b) => b.points - a.points);
  updatedFriends.forEach((user, index) => {
    user.rank = index + 1;
  });
  
  return { general: updatedGeneral, friends: updatedFriends };
};
