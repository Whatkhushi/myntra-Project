import React, { useState, useEffect } from "react";
import { Trophy, Star, Zap, TrendingUp, Gift } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { getUserStats, getNextLevelProgress, ACHIEVEMENTS, UserStats } from "@/data/gamification";

const GamificationDashboard: React.FC = () => {
  const [stats, setStats] = useState<UserStats>({
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
  });
  const [isLoading, setIsLoading] = useState(true);
  const { level, progress, nextLevelPoints } = getNextLevelProgress(stats.closetPoints);

  useEffect(() => {
    const loadStats = async () => {
      try {
        setIsLoading(true);
        const updatedStats = await getUserStats();
        setStats(updatedStats);
      } catch (error) {
        console.error('Error loading stats:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadStats();
  }, []);
  
  const recentAchievements = ACHIEVEMENTS
    .filter(achievement => stats.achievements.includes(achievement.id))
    .sort((a, b) => {
      const dateA = new Date(a.unlockedAt || 0).getTime();
      const dateB = new Date(b.unlockedAt || 0).getTime();
      return dateB - dateA;
    })
    .slice(0, 3);

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 mb-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-gray-200 rounded-lg p-4 h-20"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <Trophy className="h-6 w-6 text-myntra-pink" />
          Your Style Stats
        </h2>
        <Badge className="bg-gradient-primary text-white border-0 font-bold">
          Level {level}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {/* Closet Points */}
        <div className="bg-gradient-category rounded-lg p-4 text-center">
          <div className="w-10 h-10 bg-myntra-pink rounded-full flex items-center justify-center mx-auto mb-2">
            <Zap className="h-5 w-5 text-white" />
          </div>
          <p className="text-2xl font-bold text-myntra-pink mb-1">{stats.closetPoints}</p>
          <p className="text-sm text-gray-600 font-medium">Closet Points</p>
        </div>

        {/* Streak */}
        <div className="bg-gradient-category rounded-lg p-4 text-center">
          <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-2">
            <TrendingUp className="h-5 w-5 text-white" />
          </div>
          <p className="text-2xl font-bold text-orange-500 mb-1">{stats.streak}</p>
          <p className="text-sm text-gray-600 font-medium">Day Streak 🔥</p>
        </div>

        {/* Total Items */}
        <div className="bg-gradient-category rounded-lg p-4 text-center">
          <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-2">
            <Gift className="h-5 w-5 text-white" />
          </div>
          <p className="text-2xl font-bold text-green-500 mb-1">{stats.totalUploads}</p>
          <p className="text-sm text-gray-600 font-medium">Items Added</p>
        </div>

        {/* Achievements */}
        <div className="bg-gradient-category rounded-lg p-4 text-center">
          <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-2">
            <Star className="h-5 w-5 text-white" />
          </div>
          <p className="text-2xl font-bold text-yellow-500 mb-1">{stats.achievements.length}</p>
          <p className="text-sm text-gray-600 font-medium">Achievements</p>
        </div>
      </div>

      {/* Level Progress */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium text-gray-700">Progress to Level {level + 1}</p>
          <p className="text-sm text-myntra-pink font-semibold">{stats.closetPoints}/{nextLevelPoints}</p>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Recent Achievements */}
      {recentAchievements.length > 0 && (
        <div>
          <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
            <Star className="h-4 w-4 text-yellow-500" />
            Recent Achievements
          </h3>
          <div className="flex flex-wrap gap-2">
            {recentAchievements.map((achievement) => (
              <Badge
                key={achievement.id}
                variant="secondary"
                className="bg-yellow-50 text-yellow-800 border border-yellow-200 px-3 py-1"
              >
                {achievement.icon} {achievement.name}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default GamificationDashboard;