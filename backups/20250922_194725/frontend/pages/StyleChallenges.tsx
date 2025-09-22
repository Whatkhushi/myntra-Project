import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Trophy, Flame, Target, Star, Crown, Calendar, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  getTodaysChallenges, 
  getUserProgress 
} from "@/data/dailyChallenges";

const StyleChallenges = () => {
  const navigate = useNavigate();
  const [challenges, setChallenges] = useState<any[]>([]);
  const [userProgress, setUserProgress] = useState(getUserProgress());

  useEffect(() => {
    const todaysChallenges = getTodaysChallenges();
    setChallenges(todaysChallenges);
  }, []);

  const completedChallenges = challenges.filter(c => c.isCompleted).length;
  const totalXP = userProgress.totalXP;
  const level = userProgress.level;
  const streak = userProgress.currentStreak;

  return (
    <div className="min-h-screen bg-myntra-light-gray pt-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-gradient-primary rounded-xl shadow-lg">
                <Trophy className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-myntra-dark">Style Challenges</h1>
                <p className="text-lg text-gray-600 mt-2">Level up your fashion game with daily challenges</p>
              </div>
            </div>
            <Button
              onClick={() => navigate('/daily-challenges')}
              variant="myntra"
              className="px-6 py-3"
            >
              <Calendar className="h-4 w-4 mr-2" />
              Daily Challenges
            </Button>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10"
        >
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 text-center hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Flame className="h-6 w-6 text-orange-500" />
              <span className="text-2xl font-bold text-myntra-dark">{streak}</span>
            </div>
            <p className="text-sm text-gray-600 font-medium">Day Streak</p>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 text-center hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Target className="h-6 w-6 text-myntra-pink" />
              <span className="text-2xl font-bold text-myntra-dark">{completedChallenges}</span>
            </div>
            <p className="text-sm text-gray-600 font-medium">Completed Today</p>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 text-center hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Star className="h-6 w-6 text-yellow-500" />
              <span className="text-2xl font-bold text-myntra-dark">{totalXP}</span>
            </div>
            <p className="text-sm text-gray-600 font-medium">Total XP</p>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 text-center hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Crown className="h-6 w-6 text-purple-500" />
              <span className="text-2xl font-bold text-myntra-dark">Lv.{level}</span>
            </div>
            <p className="text-sm text-gray-600 font-medium">Level</p>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"
        >
          <div 
            onClick={() => navigate('/daily-challenges')}
            className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 cursor-pointer hover:border-myntra-pink group"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-myntra-pink to-myntra-pink-dark rounded-lg group-hover:scale-110 transition-transform duration-300">
                <Calendar className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-myntra-dark mb-1">Daily Challenges</h3>
                <p className="text-sm text-gray-600">Complete 5 unique challenges each day</p>
              </div>
            </div>
          </div>

          <div 
            onClick={() => navigate('/leaderboard')}
            className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 cursor-pointer hover:border-myntra-pink group"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg group-hover:scale-110 transition-transform duration-300">
                <Trophy className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-myntra-dark mb-1">Leaderboard</h3>
                <p className="text-sm text-gray-600">See how you rank against others</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 cursor-pointer hover:border-myntra-pink group">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg group-hover:scale-110 transition-transform duration-300">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-myntra-dark mb-1">Your Progress</h3>
                <p className="text-sm text-gray-600">Track your style journey</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Progress Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl shadow-lg border border-gray-100 p-6"
        >
          <h3 className="text-xl font-bold text-myntra-dark mb-4">Today's Progress</h3>
          
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Challenges Completed</span>
                <span>{completedChallenges}/{challenges.length}</span>
              </div>
              <Progress 
                value={(completedChallenges / challenges.length) * 100} 
                className="h-3" 
              />
            </div>
            
            <div>
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Level Progress</span>
                <span>{totalXP % 100}/100 XP</span>
              </div>
              <Progress 
                value={(totalXP % 100)} 
                className="h-3" 
              />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default StyleChallenges;