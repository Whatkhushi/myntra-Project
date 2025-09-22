import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Play } from "lucide-react";
import { Challenge } from "@/data/challenges";

interface ChallengeCardProps {
  challenge: Challenge;
  onStartChallenge: (challenge: Challenge) => void;
  isCompleted: boolean;
}

const ChallengeCard: React.FC<ChallengeCardProps> = ({
  challenge,
  onStartChallenge,
  isCompleted
}) => {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy": return "bg-green-100 text-green-700 border-green-200";
      case "Medium": return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "Hard": return "bg-red-100 text-red-700 border-red-200";
      default: return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getGradientClass = (difficulty: string) => {
    switch (difficulty) {
      case "Easy": return "from-green-400 to-emerald-500";
      case "Medium": return "from-yellow-400 to-orange-500";
      case "Hard": return "from-red-400 to-pink-500";
      default: return "from-gray-400 to-gray-500";
    }
  };

  return (
    <div className={`
      bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300
      ${isCompleted 
        ? "border-green-200 bg-green-50" 
        : "hover:border-myntra-pink"
      }
    `}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold text-myntra-dark mb-2">{challenge.title}</h3>
          <p className="text-gray-600 mb-3">{challenge.description}</p>
          
          <div className="flex items-center gap-3 mb-4">
            <Badge className={getDifficultyColor(challenge.difficulty)}>
              {challenge.difficulty}
            </Badge>
            <Badge variant="secondary" className="bg-myntra-pink-light text-myntra-pink border-0">
              {challenge.points} points
            </Badge>
            <Badge variant="outline" className="border-gray-300">
              {challenge.category}
            </Badge>
          </div>
        </div>
      </div>
      
      {isCompleted ? (
        <div className="flex items-center gap-2 text-green-600">
          <CheckCircle className="h-5 w-5" />
          <span className="font-medium">Challenge Completed Today! 🎉</span>
        </div>
      ) : (
        <Button 
          variant="myntra" 
          onClick={() => onStartChallenge(challenge)}
          className="w-full sm:w-auto"
        >
          <Play className="h-4 w-4 mr-2" />
          Start Challenge
        </Button>
      )}
    </div>
  );
};

export default ChallengeCard;
