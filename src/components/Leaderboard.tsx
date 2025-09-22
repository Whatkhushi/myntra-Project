import React, { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trophy, Flame, Crown, Star, Users, Globe } from "lucide-react";
import { LeaderboardUser, BADGES } from "@/data/challenges";

interface LeaderboardProps {
  generalLeaderboard: LeaderboardUser[];
  friendsLeaderboard: LeaderboardUser[];
  currentUserStats: any;
}

const Leaderboard: React.FC<LeaderboardProps> = ({
  generalLeaderboard,
  friendsLeaderboard,
  currentUserStats
}) => {
  const [activeTab, setActiveTab] = useState<"general" | "friends">("general");
  const [animatingRanks, setAnimatingRanks] = useState<Set<number>>(new Set());

  const currentLeaderboard = activeTab === "general" ? generalLeaderboard : friendsLeaderboard;

  // Animate rank changes
  useEffect(() => {
    const newAnimatingRanks = new Set<number>();
    currentLeaderboard.forEach((user, index) => {
      if (user.isCurrentUser) {
        newAnimatingRanks.add(index);
      }
    });
    
    if (newAnimatingRanks.size > 0) {
      setAnimatingRanks(newAnimatingRanks);
      setTimeout(() => setAnimatingRanks(new Set()), 1000);
    }
  }, [currentLeaderboard]);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Crown className="h-5 w-5 text-yellow-500" />;
      case 2: return <Trophy className="h-5 w-5 text-gray-400" />;
      case 3: return <Trophy className="h-5 w-5 text-orange-500" />;
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

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-myntra-pink to-myntra-pink-dark p-4 text-white">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Trophy className="h-6 w-6" />
            <h2 className="text-xl font-bold">Leaderboard 🏆</h2>
          </div>
        </div>
        
        {/* Tab Switcher */}
        <div className="flex bg-white/20 rounded-lg p-1">
          <Button
            variant={activeTab === "general" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("general")}
            className={`
              ${activeTab === "general" 
                ? "bg-white text-myntra-pink shadow-md" 
                : "text-white hover:bg-white/10"
              }
            `}
          >
            <Globe className="h-4 w-4 mr-1" />
            General
          </Button>
          <Button
            variant={activeTab === "friends" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("friends")}
            className={`
              ${activeTab === "friends" 
                ? "bg-white text-myntra-pink shadow-md" 
                : "text-white hover:bg-white/10"
              }
            `}
          >
            <Users className="h-4 w-4 mr-1" />
            Friends
          </Button>
        </div>
        <p className="text-myntra-pink-light text-sm mt-2">
          {activeTab === "general" ? "Global rankings" : "Friends competition"}
        </p>
      </div>

      {/* Leaderboard Content */}
      <div className="p-4">
        <div className="space-y-2">
          {currentLeaderboard.slice(0, 6).map((user, index) => (
            <div
              key={user.id}
              className={`
                flex items-center justify-between p-3 rounded-lg border-2 transition-all duration-500
                ${user.isCurrentUser 
                  ? "border-myntra-pink bg-myntra-pink-light shadow-md" 
                  : "border-gray-100 hover:border-gray-200 hover:shadow-sm"
                }
                ${animatingRanks.has(index) ? "animate-bounce" : ""}
              `}
            >
              {/* Rank and User Info */}
              <div className="flex items-center gap-3">
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs
                  ${getRankColor(user.rank)}
                `}>
                  {getRankIcon(user.rank)}
                </div>
                
                <div className="flex items-center gap-2">
                  <div className="text-lg">{user.avatar}</div>
                  <div>
                    <p className={`font-semibold text-sm ${user.isCurrentUser ? "text-myntra-pink" : "text-gray-900"}`}>
                      {user.name}
                    </p>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Flame className="h-3 w-3 text-orange-500" />
                      <span>{user.streak}d</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Points and Badges */}
              <div className="flex items-center gap-2">
                <div className="text-right">
                  <p className="text-lg font-bold text-myntra-dark">
                    {user.points.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500">pts</p>
                </div>
                
                {/* Badges */}
                <div className="flex gap-1">
                  {user.badges.slice(0, 2).map((badge, badgeIndex) => (
                    <Badge
                      key={badgeIndex}
                      variant="secondary"
                      className={`
                        text-sm px-1 py-0.5 ${BADGES[badge as keyof typeof BADGES]?.color || "text-gray-500"}
                        bg-white border border-gray-200
                      `}
                      title={BADGES[badge as keyof typeof BADGES]?.description}
                    >
                      {badge}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Current User Stats */}
        {currentUserStats && (
          <div className="mt-4 p-3 bg-gradient-to-r from-myntra-pink-light to-purple-50 rounded-lg border border-myntra-pink">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-myntra-pink text-sm">Your Progress</h3>
                <p className="text-xs text-gray-600">
                  {currentUserStats.completedChallenges.length} completed
                </p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-myntra-pink">
                  {currentUserStats.totalPoints}
                </p>
                <p className="text-xs text-gray-500">points</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;
