import React, { useState, useEffect } from "react";
import { Share2, Download, Sparkles, Lock, Upload, RefreshCw, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { toast } from "@/hooks/use-toast";
import { getWardrobeItems, WardrobeItem, getStyleCard, StyleCardData } from "@/services/wardrobeApi";
import { loadAllWardrobeItems } from "@/utils/wardrobeUtils";

interface ClothingItem {
  id: string;
  image: string;
  category: string;
  name?: string;
  dateAdded: string;
  tags?: {
    color?: string;
    style?: string;
    occasion?: string;
    vibe?: string;
  };
}

interface StyleVibe {
  name: string;
  percentage: number;
  color: string;
  emoji: string;
  description: string;
}

// Gen-Z vibe definitions
const VIBE_DEFINITIONS = {
  girly_pop: {
    name: "Girly Pop",
    emoji: "💖",
    color: "#FF69B4",
    description: "Pink aesthetics, skirts, floral tops – giving main character vibes. You're serving princess energy with a modern twist! ✨"
  },
  edgy: {
    name: "Edgy",
    emoji: "🔥",
    color: "#8B0000",
    description: "All about leather jackets, black fits, and statement boots. You're serving rebel energy and breaking all the rules! 💀"
  },
  streetwear: {
    name: "Streetwear",
    emoji: "👟",
    color: "#FF6B35",
    description: "Comfy fits, sneakers, and oversized everything. You're giving off that cool, effortless vibe that everyone wants! 🏙️"
  },
  clean_girl: {
    name: "Clean Girl",
    emoji: "✨",
    color: "#87CEEB",
    description: "Minimalist queen with perfect basics and that 'I woke up like this' energy. Simple but stunning! 🌸"
  },
  boss_babe: {
    name: "Boss Babe",
    emoji: "💼",
    color: "#4B0082",
    description: "Power suits, blazers, and that 'I mean business' energy. You're serving CEO vibes and we're here for it! 👑"
  },
  grunge: {
    name: "Grunge",
    emoji: "🎸",
    color: "#2F4F4F",
    description: "Flannel, combat boots, and that 'I don't care what you think' attitude. Rock on! 🤘"
  }
};

const FashionCard = () => {
  const [closetItems, setClosetItems] = useState<WardrobeItem[]>([]);
  const [styleVibes, setStyleVibes] = useState<StyleVibe[]>([]);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [showCard, setShowCard] = useState(false);
  const [dominantVibe, setDominantVibe] = useState<StyleVibe | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [styleCardData, setStyleCardData] = useState<StyleCardData | null>(null);
  const [selectedVibe, setSelectedVibe] = useState<string | null>(null);

  useEffect(() => {
    loadWardrobeItems();
  }, []);

  const loadWardrobeItems = async () => {
    try {
      setIsLoading(true);
      
      // Load all wardrobe items using the utility function
      const allItems = await loadAllWardrobeItems();

      // Convert to WardrobeItem format for compatibility
      const wardrobeItems: WardrobeItem[] = allItems.map(item => ({
        id: parseInt(item.id.replace('backend_', '')) || Math.random(),
        image_url: item.image.replace('http://localhost:5000', ''),
        category: item.category,
        created_at: item.dateAdded,
      }));

      setClosetItems(wardrobeItems);
      
      if (allItems.length >= 10) {
        setIsUnlocked(true);
        // Load style card data from backend
        await loadStyleCardData();
        setTimeout(() => setShowCard(true), 500);
      }
    } catch (error) {
      console.error('Failed to load wardrobe items:', error);
      toast({
        title: "Error loading wardrobe",
        description: "Could not load your wardrobe items. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadStyleCardData = async () => {
    try {
      const data = await getStyleCard();
      setStyleCardData(data);
      
      // Convert to StyleVibe format for display
      const vibes: StyleVibe[] = Object.entries(data)
        .filter(([key, value]) => key !== 'total_items' && value > 0)
        .map(([key, value]) => {
          const vibeDef = VIBE_DEFINITIONS[key as keyof typeof VIBE_DEFINITIONS];
          return {
            name: vibeDef.name,
            percentage: value,
            color: vibeDef.color,
            emoji: vibeDef.emoji,
            description: vibeDef.description
          };
        })
        .sort((a, b) => b.percentage - a.percentage);
      
      setStyleVibes(vibes);
      
      if (vibes.length > 0) {
        setDominantVibe(vibes[0]);
      }
    } catch (error) {
      console.error('Failed to load style card data:', error);
      toast({
        title: "Error loading style data",
        description: "Could not load your style analysis. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Prepare data for pie chart
  const pieChartData = styleVibes.map(vibe => ({
    name: vibe.name,
    value: vibe.percentage,
    color: vibe.color,
    emoji: vibe.emoji
  }));

  const handleVibeClick = (vibeName: string) => {
    setSelectedVibe(vibeName);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'My Fashion Personality Card',
        text: `Just discovered my fashion vibe! I'm ${dominantVibe?.percentage}% ${dominantVibe?.name} 🔥`,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(`Just discovered my fashion vibe! I'm ${dominantVibe?.percentage}% ${dominantVibe?.name} 🔥 Check out your fashion personality at ${window.location.href}`);
      toast({
        title: "Link copied! 📋",
        description: "Share your fashion vibe with friends!"
      });
    }
  };

  const handleDownload = () => {
    toast({
      title: "Download coming soon! 📸",
      description: "We're working on making your fashion card downloadable!"
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-myntra-light-gray pt-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-12">
              <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-myntra-pink"></div>
              </div>
              <h1 className="text-3xl font-bold text-myntra-dark mb-4">Analyzing Your Style... 🔍</h1>
              <p className="text-lg text-gray-600">Loading your wardrobe and calculating your fashion personality...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!isUnlocked) {
    return (
      <div className="min-h-screen bg-myntra-light-gray pt-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-12">
              <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Lock className="h-16 w-16 text-gray-400" />
              </div>
              
              <h1 className="text-3xl font-bold text-myntra-dark mb-4">Fashion Personality Locked 🔒</h1>
              <p className="text-lg text-gray-600 mb-6">
                Upload at least 10 items to your wardrobe to unlock your personalized Fashion Personality Card!
              </p>
              
              <div className="max-w-md mx-auto mb-8">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Progress</span>
                  <span>{closetItems.length}/10 items</span>
                </div>
                <Progress value={(closetItems.length / 10) * 100} className="h-3" />
              </div>
              
              <div className="flex gap-4 justify-center">
                <Button 
                  variant="myntra" 
                  size="lg"
                  onClick={() => window.location.href = "/upload"}
                  className="px-8 py-4 text-lg"
                >
                  <Upload className="h-5 w-5 mr-2" />
                  Start Uploading Items
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  onClick={loadWardrobeItems}
                  className="px-8 py-4 text-lg border-myntra-pink text-myntra-pink hover:bg-myntra-pink-light"
                >
                  <RefreshCw className="h-5 w-5 mr-2" />
                  Refresh
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 pt-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Confetti Effect */}
        {showCard && (
          <div className="fixed inset-0 pointer-events-none z-10">
            <div className="absolute top-20 left-1/4 text-4xl animate-bounce">🎉</div>
            <div className="absolute top-32 right-1/4 text-4xl animate-bounce delay-300">✨</div>
            <div className="absolute top-40 left-1/2 text-4xl animate-bounce delay-500">🔥</div>
          </div>
        )}

        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-4 mb-4">
            <h1 className="text-4xl font-bold text-gray-900">Your Fashion Personality Card</h1>
            <Button 
              variant="outline" 
              size="sm"
              onClick={loadWardrobeItems}
              className="border-myntra-pink text-myntra-pink hover:bg-myntra-pink-light"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
          <p className="text-lg text-gray-600">Just like Spotify Wrapped, but for your closet! ✨</p>
        </div>

        {/* Main Fashion Card */}
        <div className={`bg-white rounded-2xl shadow-2xl border border-gray-200 p-8 mb-8 transform transition-all duration-1000 ${showCard ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}>
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Sparkles className="h-8 w-8 text-myntra-pink" />
              <h2 className="text-3xl font-bold text-gray-900">Your Style DNA</h2>
              <Sparkles className="h-8 w-8 text-myntra-pink" />
            </div>
            <p className="text-gray-600">Based on {closetItems.length} wardrobe items</p>
          </div>

          {/* Dominant Vibe Avatar */}
          {dominantVibe && (
            <div className="text-center mb-10">
              <div className={`w-32 h-32 ${dominantVibe.color} rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse`}>
                <span className="text-6xl">{dominantVibe.emoji}</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                You're {dominantVibe.percentage}% {dominantVibe.name}!
              </h3>
              <p className="text-gray-600 text-lg">{dominantVibe.description}</p>
            </div>
          )}

          {/* Style Breakdown with Pie Chart */}
          <div className="space-y-6 mb-10">
            <h4 className="text-xl font-bold text-gray-900 text-center">Your Style Breakdown</h4>
            
            {/* Pie Chart */}
            <div className="flex justify-center mb-8">
              <div className="w-80 h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={120}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.color}
                          stroke="#fff"
                          strokeWidth={2}
                          className="cursor-pointer hover:opacity-80 transition-opacity"
                          onClick={() => handleVibeClick(entry.name)}
                        />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: any) => [`${value}%`, '']}
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Style Vibe Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {styleVibes.map((vibe, index) => (
                <Dialog key={vibe.name}>
                  <DialogTrigger asChild>
                    <Card 
                      className={`cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-105 animate-fade-in`} 
                      style={{ animationDelay: `${index * 200}ms` }}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{vibe.emoji}</span>
                            <div>
                              <div className="font-semibold text-gray-900">{vibe.name}</div>
                              <div className="text-sm text-gray-500">Click to learn more</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-myntra-pink text-lg">{vibe.percentage}%</div>
                            <div className="w-16 bg-gray-200 rounded-full h-2 mt-1">
                              <div 
                                className="h-2 rounded-full transition-all duration-1000 ease-out"
                                style={{ 
                                  width: showCard ? `${vibe.percentage}%` : '0%',
                                  backgroundColor: vibe.color
                                }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        <span className="text-2xl">{vibe.emoji}</span>
                        {vibe.name}
                      </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="text-center">
                        <div className="text-4xl font-bold text-myntra-pink mb-2">{vibe.percentage}%</div>
                        <div className="text-sm text-gray-500">of your wardrobe</div>
                      </div>
                      <p className="text-gray-700 leading-relaxed">{vibe.description}</p>
                    </div>
                  </DialogContent>
                </Dialog>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 justify-center">
            <Button 
              variant="myntra" 
              size="lg"
              onClick={handleShare}
              className="px-8 py-4 text-lg"
            >
              <Share2 className="h-5 w-5 mr-2" />
              Flex your vibe 🔥
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              onClick={handleDownload}
              className="px-8 py-4 text-lg border-myntra-pink text-myntra-pink hover:bg-myntra-pink-light"
            >
              <Download className="h-5 w-5 mr-2" />
              Download Card
            </Button>
          </div>
        </div>

        {/* Fun Facts */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">Fun Facts About Your Style 📊</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-3xl font-bold text-myntra-pink mb-2">{closetItems.length}</div>
              <div className="text-sm text-gray-600">Total Items</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-myntra-pink mb-2">{styleVibes.length}</div>
              <div className="text-sm text-gray-600">Style Vibes</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-myntra-pink mb-2">{dominantVibe?.percentage}%</div>
              <div className="text-sm text-gray-600">Dominant Style</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FashionCard;