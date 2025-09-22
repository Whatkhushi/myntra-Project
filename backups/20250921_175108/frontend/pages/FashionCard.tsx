import React, { useState, useEffect } from "react";
import { Share2, Download, Sparkles, Lock, Upload, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/hooks/use-toast";
import { getWardrobeItems, WardrobeItem } from "@/services/wardrobeApi";
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

const FashionCard = () => {
  const [closetItems, setClosetItems] = useState<WardrobeItem[]>([]);
  const [styleVibes, setStyleVibes] = useState<StyleVibe[]>([]);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [showCard, setShowCard] = useState(false);
  const [dominantVibe, setDominantVibe] = useState<StyleVibe | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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
        generateFashionPersonality(wardrobeItems);
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

  const generateFashionPersonality = (items: WardrobeItem[]) => {
    // Analyze closet items to determine style vibes
    const vibeCount = {
      streetwear: 0,
      casual: 0,
      formal: 0,
      ethnic: 0,
      y2k: 0,
      boho: 0,
      minimalist: 0,
      glamorous: 0,
      sporty: 0,
      vintage: 0
    };

    items.forEach(item => {
      const category = item.category.toLowerCase();
      
      // Enhanced categorization logic based on item categories
      // Streetwear & Casual
      if (category.includes('top') || category.includes('hoodie') || category.includes('sweatshirt') || 
          category.includes('t-shirt') || category.includes('tank') || category.includes('crop top')) {
        vibeCount.streetwear++;
        vibeCount.casual++;
      }
      
      // Sneakers and sporty items
      if (category.includes('sneaker') || category.includes('sneakers') || category.includes('sports') || 
          category.includes('athletic') || category.includes('jogger') || category.includes('track')) {
        vibeCount.sporty++;
        vibeCount.streetwear++;
      }
      
      // Formal wear
      if (category.includes('dress') || category.includes('suit') || category.includes('blazer') || 
          category.includes('shirt') || category.includes('trouser') || category.includes('pant')) {
        vibeCount.formal++;
        if (category.includes('party') || category.includes('evening') || category.includes('cocktail')) {
          vibeCount.glamorous++;
        }
      }
      
      // Ethnic wear
      if (category.includes('kurta') || category.includes('saree') || category.includes('lehenga') || 
          category.includes('salwar') || category.includes('kameez') || category.includes('ethnic')) {
        vibeCount.ethnic++;
      }
      
      // Y2K and trendy items
      if (category.includes('crop') || category.includes('cargo') || category.includes('chunky') || 
          category.includes('platform') || category.includes('oversized') || category.includes('baggy')) {
        vibeCount.y2k++;
      }
      
      // Boho and flowy items
      if (category.includes('flowy') || category.includes('maxi') || category.includes('bohemian') || 
          category.includes('wrap') || category.includes('kimono') || category.includes('duster')) {
        vibeCount.boho++;
      }
      
      // Minimalist items
      if (category.includes('basic') || category.includes('simple') || category.includes('plain') || 
          category.includes('solid') || category.includes('neutral')) {
        vibeCount.minimalist++;
      }
      
      // Vintage items
      if (category.includes('vintage') || category.includes('retro') || category.includes('classic') || 
          category.includes('timeless')) {
        vibeCount.vintage++;
      }
      
      // Jeans and denim
      if (category.includes('jean') || category.includes('denim')) {
        vibeCount.casual++;
        vibeCount.streetwear++;
      }
      
      // Accessories and shoes
      if (category.includes('shoe') || category.includes('boot') || category.includes('heel') || 
          category.includes('sandals') || category.includes('flats')) {
        if (category.includes('high') || category.includes('stiletto')) {
          vibeCount.glamorous++;
        } else if (category.includes('sneaker') || category.includes('sport')) {
          vibeCount.sporty++;
        } else {
          vibeCount.casual++;
        }
      }
    });

    // Convert counts to percentages with better calculation
    const totalItems = items.length;
    if (totalItems === 0) return;
    
    const vibes: StyleVibe[] = [
      {
        name: "Streetwear",
        percentage: Math.round((vibeCount.streetwear / totalItems) * 100),
        color: "bg-orange-500",
        emoji: "👟",
        description: "Urban, comfy, trendy"
      },
      {
        name: "Casual",
        percentage: Math.round((vibeCount.casual / totalItems) * 100),
        color: "bg-blue-500",
        emoji: "👕",
        description: "Relaxed, everyday style"
      },
      {
        name: "Formal",
        percentage: Math.round((vibeCount.formal / totalItems) * 100),
        color: "bg-gray-700",
        emoji: "👔",
        description: "Professional, polished"
      },
      {
        name: "Ethnic",
        percentage: Math.round((vibeCount.ethnic / totalItems) * 100),
        color: "bg-purple-500",
        emoji: "🥻",
        description: "Traditional, cultural"
      },
      {
        name: "Y2K",
        percentage: Math.round((vibeCount.y2k / totalItems) * 100),
        color: "bg-pink-500",
        emoji: "✨",
        description: "Retro, futuristic, bold"
      },
      {
        name: "Boho",
        percentage: Math.round((vibeCount.boho / totalItems) * 100),
        color: "bg-green-500",
        emoji: "🌻",
        description: "Free-spirited, flowy"
      },
      {
        name: "Minimalist",
        percentage: Math.round((vibeCount.minimalist / totalItems) * 100),
        color: "bg-gray-400",
        emoji: "⚪",
        description: "Clean, simple, elegant"
      },
      {
        name: "Glamorous",
        percentage: Math.round((vibeCount.glamorous / totalItems) * 100),
        color: "bg-yellow-500",
        emoji: "💎",
        description: "Luxe, party-ready"
      },
      {
        name: "Sporty",
        percentage: Math.round((vibeCount.sporty / totalItems) * 100),
        color: "bg-red-500",
        emoji: "🏃‍♀️",
        description: "Active, athletic, energetic"
      },
      {
        name: "Vintage",
        percentage: Math.round((vibeCount.vintage / totalItems) * 100),
        color: "bg-amber-600",
        emoji: "🕰️",
        description: "Classic, timeless, retro"
      }
    ].filter(vibe => vibe.percentage > 0)
     .sort((a, b) => b.percentage - a.percentage)
     .slice(0, 4); // Show top 4 styles instead of 3

    // Normalize percentages to ensure they add up to 100%
    const totalPercentage = vibes.reduce((sum, vibe) => sum + vibe.percentage, 0);
    if (totalPercentage > 0) {
      vibes.forEach(vibe => {
        vibe.percentage = Math.round((vibe.percentage / totalPercentage) * 100);
      });
    }

    setStyleVibes(vibes);
    setDominantVibe(vibes[0]);
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

          {/* Style Breakdown */}
          <div className="space-y-6 mb-10">
            <h4 className="text-xl font-bold text-gray-900 text-center">Your Style Breakdown</h4>
            {styleVibes.map((vibe, index) => (
              <div key={vibe.name} className={`animate-fade-in`} style={{ animationDelay: `${index * 200}ms` }}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{vibe.emoji}</span>
                    <span className="font-semibold text-gray-900">{vibe.name}</span>
                  </div>
                  <span className="font-bold text-myntra-pink text-lg">{vibe.percentage}%</span>
                </div>
                <div className="relative">
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className={`${vibe.color} h-3 rounded-full transition-all duration-1000 ease-out`}
                      style={{ width: showCard ? `${vibe.percentage}%` : '0%' }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
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