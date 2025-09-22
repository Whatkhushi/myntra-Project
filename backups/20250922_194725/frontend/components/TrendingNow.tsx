import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, ExternalLink, RefreshCw, Calendar, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";

interface TrendingStyle {
  id: string;
  title: string;
  emoji: string;
  description: string;
  defaultPieces: string[];
  holiday?: string;
  date?: string;
  season: string;
  occasion: string;
}

const TrendingNow: React.FC = () => {
  const navigate = useNavigate();
  
  // Define multiple sets of trending styles
  const lookSets: TrendingStyle[][] = [
    // Set 1: Original looks
    [
      {
        id: "navratri",
        title: "Navratri Garba Look",
        emoji: "💃",
        description: "Dance & Celebration",
        defaultPieces: ["Chaniya Choli", "Dupatta", "Jewelry", "Comfortable Shoes"],
        holiday: "Navratri",
        season: "festive",
        occasion: "celebration"
      },
      {
        id: "diwali",
        title: "Diwali Festive Look",
        emoji: "🪔",
        description: "Festive Glam",
        defaultPieces: ["Embroidered Kurta", "Embroidered Dupatta", "Juttis", "Gold Jewelry"],
        holiday: "Diwali",
        season: "festive",
        occasion: "celebration"
      },
      {
        id: "autumn",
        title: "Autumn Cozy Look",
        emoji: "🍂",
        description: "Layered & Stylish",
        defaultPieces: ["Knit Sweater", "Ankle Boots", "Wool Scarf", "Beanie"],
        season: "autumn",
        occasion: "seasonal"
      }
    ],
    // Set 2: New looks (only Shaadi and Concert)
    [
      {
        id: "shaadi",
        title: "Shadi Season Look",
        emoji: "👰",
        description: "Bridal Elegance",
        defaultPieces: ["Heavy Lehenga", "Statement Jewelry", "Designer Heels", "Bridal Dupatta"],
        holiday: "Wedding Season",
        season: "festive",
        occasion: "celebration"
      },
      {
        id: "concert",
        title: "Concert Night Look",
        emoji: "🎵",
        description: "Edgy & Bold",
        defaultPieces: ["Leather Camisole Top", "Distressed Jeans", "Chunky Black Belt", "Bold Accessories"],
        season: "party",
        occasion: "entertainment"
      },
      {
        id: "navratri",
        title: "Navratri Garba Look",
        emoji: "💃",
        description: "Dance & Celebration",
        defaultPieces: ["Chaniya Choli", "Dupatta", "Jewelry", "Comfortable Shoes"],
        holiday: "Navratri",
        season: "festive",
        occasion: "celebration"
      }
    ]
  ];

  const [currentSetIndex, setCurrentSetIndex] = useState(0);
  const staticTrendingStyles = lookSets[currentSetIndex];

  const handleRefresh = () => {
    const nextSetIndex = (currentSetIndex + 1) % lookSets.length;
    setCurrentSetIndex(nextSetIndex);
    
    toast({
      title: "Refreshing trends...",
      description: "Getting the latest festive and seasonal styles!"
    });
  };

  const handleExploreStyle = (style: TrendingStyle) => {
    // Navigate to the product options page for the specific look
    navigate(`/products/${style.id}`);
  };


  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 mb-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Sparkles className="h-6 w-6 text-myntra-pink" />
          <h2 className="text-2xl font-bold text-myntra-dark">Trending Now</h2>
          <Badge className="bg-gradient-to-r from-myntra-pink to-pink-600 text-white border-0 font-semibold">
            Festive
          </Badge>
        </div>
        <Button 
          onClick={handleRefresh}
          variant="outline" 
          size="sm"
          className="border-myntra-pink text-myntra-pink hover:bg-myntra-pink hover:text-white transition-colors"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {staticTrendingStyles.map((style) => (
          <div
            key={style.id}
            className="group bg-gradient-to-br from-pink-50 to-purple-50 rounded-xl p-5 border border-pink-100 hover:shadow-xl transition-all duration-300 transform hover:scale-105 cursor-pointer"
            onClick={() => handleExploreStyle(style)}
          >
            <div className="text-center mb-4">
              <div className="text-4xl mb-3">{style.emoji}</div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{style.title}</h3>
              <div className="flex items-center justify-center gap-2 mb-3">
                <Badge className="bg-myntra-pink/10 text-myntra-pink border-myntra-pink/20 text-sm px-3 py-1 font-medium">
                  {style.description}
                </Badge>
                {style.holiday && (
                  <Badge variant="outline" className="text-xs border-myntra-pink/30 text-myntra-pink">
                    <Calendar className="h-3 w-3 mr-1" />
                    {style.holiday}
                  </Badge>
                )}
              </div>
            </div>

            <div className="space-y-2 mb-4">
              {style.defaultPieces.slice(0, 3).map((item, index) => (
                <div key={index} className="flex items-center gap-2 p-2 bg-white/60 rounded-lg">
                  <div className="w-6 h-6 bg-myntra-pink/20 rounded-full flex items-center justify-center">
                    <span className="text-myntra-pink font-bold text-xs">{index + 1}</span>
                  </div>
                  <span className="text-gray-700 font-medium text-sm capitalize">{item}</span>
                </div>
              ))}
              {style.defaultPieces.length > 3 && (
                <div className="text-center">
                  <span className="text-xs text-gray-500">+{style.defaultPieces.length - 3} more items</span>
                </div>
              )}
            </div>

            <Button 
              className="w-full bg-myntra-pink hover:bg-pink-600 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 group-hover:shadow-lg"
              onClick={() => handleExploreStyle(style)}
            >
              Shop This Look
              <ExternalLink className="h-4 w-4 ml-2" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TrendingNow;
