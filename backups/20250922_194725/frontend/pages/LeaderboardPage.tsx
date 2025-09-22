import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Trophy, Crown, Medal, Star, Flame, Calendar, Users, Globe, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getUserProgress } from "@/data/dailyChallenges";

interface LeaderboardUser {
  id: string;
  name: string;
  avatar: string;
  xp: number;
  level: number;
  streak: number;
  badges: string[];
  rank: number;
  isCurrentUser?: boolean;
}

// Mock general leaderboard data
const MOCK_GENERAL_LEADERBOARD: LeaderboardUser[] = [
  {
    id: "user1",
    name: "StyleQueen",
    avatar: "👑",
    xp: 2450,
    level: 25,
    streak: 15,
    badges: ["🔥", "⚡", "👑"],
    rank: 1
  },
  {
    id: "user2",
    name: "FashionBae",
    avatar: "💄",
    xp: 2380,
    level: 24,
    streak: 12,
    badges: ["🔥", "⚡"],
    rank: 2
  },
  {
    id: "user3",
    name: "TrendSetter",
    avatar: "⭐",
    xp: 2250,
    level: 23,
    streak: 8,
    badges: ["🔥"],
    rank: 3
  },
  {
    id: "user4",
    name: "StyleMaven",
    avatar: "💎",
    xp: 2100,
    level: 21,
    streak: 10,
    badges: ["🔥"],
    rank: 4
  },
  {
    id: "user5",
    name: "FashionFrenzy",
    avatar: "🎭",
    xp: 1950,
    level: 20,
    streak: 6,
    badges: [],
    rank: 5
  },
  {
    id: "user6",
    name: "TrendyTiger",
    avatar: "🐅",
    xp: 1800,
    level: 18,
    streak: 4,
    badges: [],
    rank: 6
  },
  {
    id: "user7",
    name: "StyleSage",
    avatar: "🔮",
    xp: 1650,
    level: 17,
    streak: 3,
    badges: [],
    rank: 7
  },
  {
    id: "user8",
    name: "FashionFairy",
    avatar: "🦋",
    xp: 1500,
    level: 15,
    streak: 2,
    badges: [],
    rank: 8
  },
  // extra dummy users for realism
  ...Array.from({ length: 22 }).map((_, i) => ({
    id: `gen-${i+9}`,
    name: `User${i+9}`,
    avatar: ["🦄","🦊","🐼","🐨","🐯","🐰","🐱","🦋","🐻","🦁"][i % 10],
    xp: 800 + Math.floor(Math.random() * 1200),
    level: 5 + Math.floor(Math.random() * 20),
    streak: Math.floor(Math.random() * 15),
    badges: [],
    rank: i+9
  }))
];

// Mock friends leaderboard data (limit to ~5-6 people)
const MOCK_FRIENDS_LEADERBOARD: LeaderboardUser[] = [
  {
    id: "friend1",
    name: "Sarah",
    avatar: "👩",
    xp: 2200,
    level: 22,
    streak: 14,
    badges: ["🔥", "⚡"],
    rank: 1
  },
  {
    id: "friend2",
    name: "Mike",
    avatar: "👨",
    xp: 1950,
    level: 20,
    streak: 8,
    badges: ["🔥"],
    rank: 2
  },
  {
    id: "friend3",
    name: "Emma",
    avatar: "👧",
    xp: 1800,
    level: 18,
    streak: 6,
    badges: [],
    rank: 3
  },
  {
    id: "friend4",
    name: "Alex",
    avatar: "🧑",
    xp: 1650,
    level: 17,
    streak: 4,
    badges: [],
    rank: 4
  },
  {
    id: "friend5",
    name: "Lisa",
    avatar: "👩‍🦰",
    xp: 1500,
    level: 15,
    streak: 3,
    badges: [],
    rank: 5
  },
  {
    id: "friend6",
    name: "Jay",
    avatar: "🧔",
    xp: 1400,
    level: 14,
    streak: 2,
    badges: [],
    rank: 6
  }
];

const LeaderboardPage = () => {
  const [activeTab, setActiveTab] = useState<"day" | "week" | "month">("day");
  const [leaderboardType, setLeaderboardType] = useState<"general" | "friends">("general");
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [currentUser, setCurrentUser] = useState<LeaderboardUser | null>(null);

  useEffect(() => {
    const userProgress = getUserProgress();
    
    // Create current user entry
    const currentUserEntry: LeaderboardUser = {
      id: "current-user",
      name: "You",
      avatar: "👤",
      xp: userProgress.totalXP,
      level: userProgress.level,
      streak: userProgress.currentStreak,
      badges: userProgress.badges,
      rank: 0,
      isCurrentUser: true
    };

    // Choose the appropriate leaderboard data
    const baseData = leaderboardType === "general" ? MOCK_GENERAL_LEADERBOARD : MOCK_FRIENDS_LEADERBOARD;
    
    // Combine with mock data and sort by XP
    const combined = [...baseData, currentUserEntry]
      .sort((a, b) => b.xp - a.xp)
      .map((user, index) => ({ ...user, rank: index + 1 }));

    setLeaderboard(combined);
    setCurrentUser(combined.find(user => user.isCurrentUser) || null);
  }, [leaderboardType]);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Crown className="h-6 w-6 text-yellow-500" />;
      case 2: return <Medal className="h-6 w-6 text-gray-400" />;
      case 3: return <Medal className="h-6 w-6 text-orange-500" />;
      default: return <span className="text-lg font-bold text-gray-500">#{rank}</span>;
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1: return "bg-gradient-to-r from-yellow-400 to-yellow-500 text-yellow-900";
      case 2: return "bg-gradient-to-r from-gray-300 to-gray-400 text-gray-800";
      case 3: return "bg-gradient-to-r from-orange-400 to-orange-500 text-orange-900";
      default: return "bg-gray-100 text-gray-600";
    }
  };

  const topThree = leaderboard.slice(0, 3);
  const rest = leaderboard.slice(3);

  return (
    <div className="min-h-screen bg-myntra-light-gray pt-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-4 bg-gradient-primary rounded-xl shadow-lg">
              <Trophy className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-myntra-dark">Leaderboard</h1>
              <p className="text-lg text-gray-600 mt-2">See how you stack up against other style enthusiasts</p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-myntra-dark">Rankings</h2>
            <div className="flex gap-4">
              {/* Leaderboard Type Toggle */}
              <div className="flex bg-gray-100 rounded-lg p-1">
                <Button
                  variant={leaderboardType === "general" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setLeaderboardType("general")}
                  className={leaderboardType === "general" ? "bg-myntra-pink text-white" : "text-gray-600"}
                >
                  <Globe className="h-4 w-4 mr-2" />
                  General
                </Button>
                <Button
                  variant={leaderboardType === "friends" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setLeaderboardType("friends")}
                  className={leaderboardType === "friends" ? "bg-myntra-pink text-white" : "text-gray-600"}
                >
                  <UserCheck className="h-4 w-4 mr-2" />
                  Friends
                </Button>
              </div>
              
              {/* Time Period Toggle */}
              <div className="flex bg-gray-100 rounded-lg p-1">
                <Button
                  variant={activeTab === "day" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setActiveTab("day")}
                  className={activeTab === "day" ? "bg-myntra-pink text-white" : "text-gray-600"}
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Day
                </Button>
                <Button
                  variant={activeTab === "week" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setActiveTab("week")}
                  className={activeTab === "week" ? "bg-myntra-pink text-white" : "text-gray-600"}
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Week
                </Button>
                <Button
                  variant={activeTab === "month" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setActiveTab("month")}
                  className={activeTab === "month" ? "bg-myntra-pink text-white" : "text-gray-600"}
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Month
                </Button>
              </div>
            </div>
          </div>
          
          <div className="text-sm text-gray-600">
            {leaderboardType === "general" 
              ? "🌍 Global rankings - compete with style enthusiasts worldwide" 
              : "👥 Friends leaderboard - see how you rank among your friends"
            }
          </div>
        </div>

        {/* Podium - Top 3 */}
        {topThree.length > 0 && (
          <div className="mb-12">
            <h3 className="text-2xl font-bold text-myntra-dark mb-6 text-center">Top Performers</h3>
            <div className="flex items-end justify-center gap-8 mb-8">
              {/* 2nd Place */}
              {topThree[1] && (
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-center"
                >
                  <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-200 p-6 mb-4 w-48">
                    <div className="w-16 h-16 bg-gradient-to-r from-gray-300 to-gray-400 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Medal className="h-8 w-8 text-gray-800" />
                    </div>
                    <div className="text-3xl mb-2">{topThree[1].avatar}</div>
                    <h4 className="text-lg font-bold text-gray-900 mb-1">{topThree[1].name}</h4>
                    <p className="text-sm text-gray-600 mb-2">Level {topThree[1].level}</p>
                    <p className="text-2xl font-bold text-myntra-dark">{topThree[1].xp.toLocaleString()}</p>
                    <p className="text-xs text-gray-500">XP</p>
                  </div>
                  <div className="bg-gray-200 rounded-lg p-2">
                    <span className="text-sm font-bold text-gray-700">2nd Place</span>
                  </div>
                </motion.div>
              )}

              {/* 1st Place */}
              {topThree[0] && (
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-center"
                >
                  <div className="bg-white rounded-2xl shadow-2xl border-2 border-yellow-300 p-6 mb-4 w-52 transform scale-110">
                    <div className="w-20 h-20 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Crown className="h-10 w-10 text-yellow-900" />
                    </div>
                    <div className="text-4xl mb-2">{topThree[0].avatar}</div>
                    <h4 className="text-xl font-bold text-gray-900 mb-1">{topThree[0].name}</h4>
                    <p className="text-sm text-gray-600 mb-2">Level {topThree[0].level}</p>
                    <p className="text-3xl font-bold text-myntra-dark">{topThree[0].xp.toLocaleString()}</p>
                    <p className="text-xs text-gray-500">XP</p>
                  </div>
                  <div className="bg-yellow-400 rounded-lg p-2">
                    <span className="text-sm font-bold text-yellow-900">1st Place</span>
                  </div>
                </motion.div>
              )}

              {/* 3rd Place */}
              {topThree[2] && (
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-center"
                >
                  <div className="bg-white rounded-2xl shadow-xl border-2 border-orange-200 p-6 mb-4 w-48">
                    <div className="w-16 h-16 bg-gradient-to-r from-orange-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Medal className="h-8 w-8 text-orange-900" />
                    </div>
                    <div className="text-3xl mb-2">{topThree[2].avatar}</div>
                    <h4 className="text-lg font-bold text-gray-900 mb-1">{topThree[2].name}</h4>
                    <p className="text-sm text-gray-600 mb-2">Level {topThree[2].level}</p>
                    <p className="text-2xl font-bold text-myntra-dark">{topThree[2].xp.toLocaleString()}</p>
                    <p className="text-xs text-gray-500">XP</p>
                  </div>
                  <div className="bg-orange-200 rounded-lg p-2">
                    <span className="text-sm font-bold text-orange-800">3rd Place</span>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        )}

        {/* Rest of Leaderboard */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-xl font-bold text-myntra-dark">Full Rankings</h3>
          </div>
          
          <div className="divide-y divide-gray-100">
            {rest.map((user, index) => (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`
                  flex items-center justify-between p-4 transition-all duration-300
                  ${user.isCurrentUser 
                    ? "bg-myntra-pink-light border-l-4 border-myntra-pink" 
                    : "hover:bg-gray-50"
                  }
                `}
              >
                <div className="flex items-center gap-4">
                  <div className={`
                    w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm
                    ${getRankColor(user.rank)}
                  `}>
                    {getRankIcon(user.rank)}
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">{user.avatar}</div>
                    <div>
                      <p className={`font-semibold ${user.isCurrentUser ? "text-myntra-pink" : "text-gray-900"}`}>
                        {user.name}
                      </p>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Flame className="h-3 w-3 text-orange-500" />
                        <span>{user.streak} day streak</span>
                        <span>•</span>
                        <span>Level {user.level}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-xl font-bold text-myntra-dark">
                      {user.xp.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500">XP</p>
                  </div>
                  
                  {/* Badges */}
                  <div className="flex gap-1">
                    {user.badges.slice(0, 3).map((badge, badgeIndex) => (
                      <Badge
                        key={badgeIndex}
                        variant="secondary"
                        className="text-sm px-2 py-1 bg-yellow-100 text-yellow-800 border-0"
                      >
                        {badge}
                      </Badge>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Current User Stats */}
        {currentUser && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-8 bg-gradient-to-r from-myntra-pink to-myntra-pink-dark rounded-xl p-6 text-white"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold mb-2">Your Progress</h3>
                <p className="text-myntra-pink-light">
                  Rank #{currentUser.rank} • Level {currentUser.level} • {currentUser.streak} day streak
                </p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold">{currentUser.xp.toLocaleString()}</p>
                <p className="text-myntra-pink-light">Total XP</p>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default LeaderboardPage;
