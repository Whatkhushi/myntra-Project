import React from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, Sparkles, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { seasonalSuggestions } from "@/data/myntraCatalog";
import { toast } from "@/hooks/use-toast";
import TrendingNow from "@/components/TrendingNow";

const SeasonalStyling = () => {
  const navigate = useNavigate();
  
  const handleExploreStyle = (suggestion: any) => {
    // Navigate to product options page for seasonal suggestions
    const styleName = suggestion.title.toLowerCase().replace(/\s+/g, '-');
    navigate(`/products/${styleName}`);
  };

  return (
    <div className="min-h-screen bg-myntra-light-gray pt-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-4 bg-gradient-primary rounded-xl shadow-lg">
              <Calendar className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-myntra-dark">Seasonal & Event Styling</h1>
              <p className="text-lg text-gray-600 mt-2">Curated looks for every occasion and season</p>
            </div>
          </div>
        </div>

        {/* Dynamic Trending Now Section */}
        <TrendingNow />

        {/* All Seasonal Suggestions */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-myntra-dark mb-8">All Season Styles</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {seasonalSuggestions.map((suggestion) => (
              <div
                key={suggestion.id}
                className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 overflow-hidden border border-gray-100 group"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-3xl">{suggestion.emoji}</div>
                    <Badge 
                      variant="secondary" 
                      className="bg-myntra-pink-light text-myntra-pink border-0 capitalize"
                    >
                      {suggestion.season}
                    </Badge>
                  </div>
                  
                  <h3 className="text-xl font-bold text-myntra-dark mb-2">{suggestion.title}</h3>
                  <p className="text-gray-600 mb-4 font-medium">{suggestion.description}</p>
                  
                  <div className="space-y-2 mb-6">
                    {suggestion.items.map((item, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-myntra-pink rounded-full"></div>
                        <span className="text-sm text-gray-700 capitalize">{item}</span>
                      </div>
                    ))}
                  </div>
                  
                  <Button 
                    variant="outline" 
                    className="w-full border-myntra-pink text-myntra-pink hover:bg-myntra-pink-light group-hover:bg-myntra-pink group-hover:text-white transition-colors"
                    onClick={() => handleExploreStyle(suggestion)}
                  >
                    Explore This Look
                    <ExternalLink className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Seasonal Tips */}
        <div className="bg-gradient-primary rounded-xl p-8 text-white mb-12">
          <h2 className="text-2xl font-bold mb-4">Pro Styling Tips 💡</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center mt-1">
                  <span className="text-white text-sm font-bold">1</span>
                </div>
                <p className="text-white/90">Mix textures for visual interest - pair smooth silk with rough denim</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center mt-1">
                  <span className="text-white text-sm font-bold">2</span>
                </div>
                <p className="text-white/90">Follow the 60-30-10 rule for color combinations</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center mt-1">
                  <span className="text-white text-sm font-bold">3</span>
                </div>
                <p className="text-white/90">Invest in versatile pieces that work across seasons</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center mt-1">
                  <span className="text-white text-sm font-bold">4</span>
                </div>
                <p className="text-white/90">Accessories can transform any basic outfit instantly</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeasonalStyling;