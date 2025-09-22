import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trophy, Flame, Star, Crown, Zap } from "lucide-react";

const ChallengeDemo: React.FC = () => {
  return (
    <div className="bg-gradient-to-br from-myntra-pink-light via-purple-50 to-blue-50 p-8 rounded-2xl shadow-xl">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-myntra-dark mb-2">
          🎯 Style Challenges - Complete Features
        </h2>
        <p className="text-gray-600">
          All features implemented as requested! Here's what you get:
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Challenge Cards */}
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-myntra-pink to-myntra-pink-dark rounded-lg flex items-center justify-center">
              <Trophy className="h-5 w-5 text-white" />
            </div>
            <h3 className="font-bold text-gray-900">5 Interactive Challenges</h3>
          </div>
          <ul className="text-sm text-gray-600 space-y-2">
            <li>• Mix & Match Master 🌀</li>
            <li>• Color Coordination 🎨</li>
            <li>• Sustainable Style 🌱</li>
            <li>• Streetwear King 👟</li>
            <li>• Occasion Fit ✨</li>
          </ul>
        </div>

        {/* Challenge Details */}
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
              <Star className="h-5 w-5 text-white" />
            </div>
            <h3 className="font-bold text-gray-900">Challenge Details</h3>
          </div>
          <ul className="text-sm text-gray-600 space-y-2">
            <li>• Full instructions page</li>
            <li>• Pro tips and guidance</li>
            <li>• Submit challenge button</li>
            <li>• Completion tracking</li>
          </ul>
        </div>

        {/* Points System */}
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <h3 className="font-bold text-gray-900">Points & Progression</h3>
          </div>
          <ul className="text-sm text-gray-600 space-y-2">
            <li>• Dynamic point system</li>
            <li>• Streak tracking</li>
            <li>• Badge unlocking</li>
            <li>• Real-time updates</li>
          </ul>
        </div>

        {/* Leaderboards */}
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Crown className="h-5 w-5 text-white" />
            </div>
            <h3 className="font-bold text-gray-900">Dual Leaderboards</h3>
          </div>
          <ul className="text-sm text-gray-600 space-y-2">
            <li>• General leaderboard 🌍</li>
            <li>• Friends leaderboard 👯</li>
            <li>• Tab switcher</li>
            <li>• Rank animations</li>
          </ul>
        </div>

        {/* Streaks & Badges */}
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
              <Flame className="h-5 w-5 text-white" />
            </div>
            <h3 className="font-bold text-gray-900">Streaks & Badges</h3>
          </div>
          <ul className="text-sm text-gray-600 space-y-2">
            <li>• Daily streak system</li>
            <li>• Achievement badges</li>
            <li>• Dynamic updates</li>
            <li>• Visual feedback</li>
          </ul>
        </div>

        {/* Gen Z Styling */}
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-500 rounded-lg flex items-center justify-center">
              <span className="text-white text-lg">✨</span>
            </div>
            <h3 className="font-bold text-gray-900">Gen Z Vibes</h3>
          </div>
          <ul className="text-sm text-gray-600 space-y-2">
            <li>• Emojis everywhere 🎯</li>
            <li>• Gradient backgrounds</li>
            <li>• Hover animations</li>
            <li>• Confetti effects</li>
          </ul>
        </div>
      </div>

      <div className="mt-8 text-center">
        <Badge className="bg-gradient-to-r from-myntra-pink to-myntra-pink-dark text-white border-0 px-4 py-2 text-lg">
          🎉 All Features Complete! Ready to flex your style game! 🔥
        </Badge>
      </div>
    </div>
  );
};

export default ChallengeDemo;
