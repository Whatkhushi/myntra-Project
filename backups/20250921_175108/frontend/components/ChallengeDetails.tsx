import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, CheckCircle, Trophy, Star } from "lucide-react";
import { Challenge } from "@/data/challenges";

interface ChallengeDetailsProps {
  challenge: Challenge;
  onBack: () => void;
  onSubmitChallenge: (challenge: Challenge) => void;
}

const ChallengeDetails: React.FC<ChallengeDetailsProps> = ({
  challenge,
  onBack,
  onSubmitChallenge
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    // Simulate challenge completion process
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    onSubmitChallenge(challenge);
    setIsSubmitting(false);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy": return "bg-green-100 text-green-700 border-green-200";
      case "Medium": return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "Hard": return "bg-red-100 text-red-700 border-red-200";
      default: return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-myntra-pink-light to-purple-50 pt-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Button
          variant="outline"
          onClick={onBack}
          className="mb-6 hover:bg-white hover:shadow-md transition-all duration-300"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Challenges
        </Button>

        {/* Challenge Header */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 mb-8">
          <div className="flex items-start gap-6">
            <div className={`
              w-20 h-20 rounded-2xl flex items-center justify-center text-4xl
              bg-gradient-to-br from-myntra-pink to-myntra-pink-dark
            `}>
              {challenge.emoji}
            </div>
            
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {challenge.title}
              </h1>
              <p className="text-lg text-gray-600 mb-4">
                {challenge.description}
              </p>
              
              <div className="flex items-center gap-3">
                <Badge className={getDifficultyColor(challenge.difficulty)}>
                  {challenge.difficulty}
                </Badge>
                <Badge variant="secondary" className="bg-myntra-pink-light text-myntra-pink border-0">
                  <Trophy className="h-3 w-3 mr-1" />
                  {challenge.points} points
                </Badge>
                <Badge variant="outline" className="border-gray-300">
                  {challenge.category}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Star className="h-6 w-6 text-myntra-pink" />
            Challenge Instructions
          </h2>
          <div className="bg-gradient-to-r from-myntra-pink-light to-purple-50 rounded-xl p-6">
            <p className="text-lg text-gray-700 leading-relaxed">
              {challenge.instructions}
            </p>
          </div>
        </div>

        {/* Visual Task Example */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            💡 Pro Tips
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 rounded-xl p-4">
              <h4 className="font-semibold text-gray-900 mb-2">🎯 Focus Areas</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Color harmony and balance</li>
                <li>• Style consistency</li>
                <li>• Occasion appropriateness</li>
                <li>• Personal expression</li>
              </ul>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <h4 className="font-semibold text-gray-900 mb-2">✨ Bonus Points</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Creative combinations</li>
                <li>• Trend awareness</li>
                <li>• Accessory coordination</li>
                <li>• Photo quality</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Submit Section */}
        <div className="bg-gradient-to-r from-myntra-pink to-myntra-pink-dark rounded-2xl shadow-xl p-8 text-white">
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-2">Ready to Submit? 🚀</h3>
            <p className="text-myntra-pink-light mb-6">
              Once you submit, you'll earn {challenge.points} points and this challenge will be marked as completed!
            </p>
            
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-white text-myntra-pink hover:bg-gray-100 font-bold py-4 px-8 rounded-xl text-lg transition-all duration-300 hover:scale-105 hover:shadow-lg"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-myntra-pink border-t-transparent rounded-full animate-spin" />
                  Submitting Challenge...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Submit Challenge
                </div>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChallengeDetails;
