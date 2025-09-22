import React, { useState, useEffect } from "react";
import { CheckSquare, Square, ShoppingCart, Heart, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import OutfitCard from "@/components/OutfitCard";
import { myntraCatalog, type MyntraItem } from "@/data/myntraCatalog";
import { toast } from "@/hooks/use-toast";
import { loadAllWardrobeItems } from "@/utils/wardrobeUtils";
import { generateOutfitRecommendations, type OutfitGenerationResponse, type OutfitRecommendation } from "@/services/wardrobeApi";

interface ClothingItem {
  id: string;
  image: string;
  category: string;
  name?: string;
  dateAdded: string;
}

interface OutfitItem {
  id: string;
  name: string;
  image: string;
  category: string;
  isOwned: boolean;
  price?: number;
  brand?: string;
}

const OutfitRecommendations = () => {
  const [closetItems, setClosetItems] = useState<ClothingItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [generatedOutfits, setGeneratedOutfits] = useState<any[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    const loadItems = async () => {
      try {
        const allItems = await loadAllWardrobeItems();
        setClosetItems(allItems);
      } catch (error) {
        console.error('Error loading wardrobe items:', error);
        // Fallback to localStorage
        const savedItems = localStorage.getItem("closetItems");
        if (savedItems) {
          setClosetItems(JSON.parse(savedItems));
        }
      }
    };
    
    loadItems();
  }, []);

  const generateOutfits = async () => {
    if (selectedItems.length === 0) {
      toast({
        title: "Please select items first!",
        description: "Choose some items from your closet to generate outfits.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    const selected = closetItems.filter(item => selectedItems.includes(item.id));
    
    toast({
      title: "Generating your perfect look! ✨",
      description: "Our AI stylist is curating outfit recommendations..."
    });

    try {
      // Try to use backend AI recommendations first
      const prompt = `Create outfit recommendations using these items: ${selected.map(item => item.category).join(', ')}. Create stylish and trendy looks.`;
      
      const aiResponse = await generateOutfitRecommendations(
        prompt,
        'casual', // Default to casual
        2 // Generate 2 outfits
      );

      if (aiResponse.success && aiResponse.outfits.length > 0) {
        console.log('AI Response:', aiResponse);
        console.log('Outfits:', aiResponse.outfits);
        
        // Convert AI response to frontend format
        const aiOutfits = aiResponse.outfits.map((outfit: OutfitRecommendation, index: number) => {
          console.log(`Outfit ${index}:`, outfit);
          console.log(`Outfit items:`, outfit.items);
          
          return {
            id: `ai-outfit-${index}`,
            title: outfit.title || `AI Generated Look ${index + 1}`,
            caption: outfit.description || `AI-curated outfit with your selected items! ✨`,
            items: outfit.items.map(aiItem => {
              let imageUrl = '/placeholder-item.jpg';
              
              if (aiItem.image_url) {
                // Handle different image URL formats
                if (aiItem.image_url.startsWith('/uploads/')) {
                  // Direct uploads path
                  imageUrl = `http://localhost:5000${aiItem.image_url}`;
                } else if (aiItem.image_url.includes('/uploads/')) {
                  // Extract filename from full path
                  const filename = aiItem.image_url.split('/uploads/')[1];
                  imageUrl = `http://localhost:5000/uploads/${filename}`;
                } else {
                  // Fallback to direct path
                  imageUrl = `http://localhost:5000${aiItem.image_url}`;
                }
              }
              
              console.log(`Item ${aiItem.id} original URL: ${aiItem.image_url}, mapped URL: ${imageUrl}`);
              
              return {
                id: aiItem.id,
                name: aiItem.description || `${aiItem.category} item`,
                image: imageUrl,
                category: aiItem.category,
                isOwned: true // AI items are treated as owned since they're based on user's wardrobe
              };
            }),
            type: 'ai-generated',
            score: outfit.score,
            styling_tips: outfit.styling_tips || [],
            outfitImage: outfit.image_url ? `http://localhost:5000/api/outfit-image?path=${encodeURIComponent(outfit.image_url)}` : null
          };
        });

        console.log('Converted AI Outfits:', aiOutfits);
        
        // Add the AI outfits
        setGeneratedOutfits(aiOutfits);
        
        toast({
          title: "AI recommendations ready! 🤖",
          description: "Check out your personalized outfit suggestions below"
        });
      } else {
        // Fallback to original logic if AI fails
        generateFallbackOutfits(selected);
      }
    } catch (error) {
      console.log('AI generation failed, using fallback:', error);
      // Fallback to original logic
      generateFallbackOutfits(selected);
    }

    setIsGenerating(false);
  };

  const generateFallbackOutfits = (selected: ClothingItem[]) => {
    // Generate wardrobe-only outfit
    const wardrobeOutfit = {
      id: 'wardrobe-only',
      title: `Your Closet Combo 👕`,
      caption: `Mix & match from your wardrobe - giving main character energy! ✨`,
      items: selected.map(item => ({
        id: item.id,
        name: item.name || `${item.category} item`,
        image: item.image,
        category: item.category,
        isOwned: true
      })),
      type: 'wardrobe-only'
    };

    // Generate complementary Myntra items
    const usedCategories = selected.map(item => item.category.toLowerCase());
    const complementaryItems = myntraCatalog
      .filter(catalogItem => !usedCategories.includes(catalogItem.category.toLowerCase()))
      .sort(() => Math.random() - 0.5)
      .slice(0, Math.max(1, 4 - selected.length));

    const enhancedOutfit = {
      id: 'enhanced-look',
      title: `Enhanced Look 🛍️`,
      caption: `Your pieces + Myntra finds = that's giving runway vibes! 💅`,
      items: [
        ...selected.map(item => ({
          id: item.id,
          name: item.name || `${item.category} item`,
          image: item.image,
          category: item.category,
          isOwned: true
        })),
        ...complementaryItems.map(item => ({
          id: item.id,
          name: item.name,
          image: item.image,
          category: item.category,
          isOwned: false,
          price: item.price,
          brand: item.brand
        }))
      ],
      type: 'enhanced'
    };

    const newOutfits = [wardrobeOutfit, enhancedOutfit];
    setGeneratedOutfits(newOutfits);
    
    toast({
      title: "Outfit recommendations ready! ✨",
      description: "Check out your personalized looks below"
    });
  };

  const toggleItemSelection = (itemId: string) => {
    setSelectedItems(prev => {
      if (prev.includes(itemId)) {
        return prev.filter(id => id !== itemId);
      } else {
        return [...prev, itemId];
      }
    });
  };

  const handleGenerateClick = () => {
    generateOutfits();
  };

  return (
    <div className="min-h-screen bg-myntra-light-gray pt-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">AI Outfit Recommendations</h1>
          <p className="text-lg text-gray-600">Select any number of items from your closet and get personalized outfit suggestions</p>
        </div>

        {/* Selection Section */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8 mb-8">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-myntra-dark mb-2">Select Items from Your Closet</h2>
            <p className="text-gray-600 mb-4">
              Choose any combination of items from your digital wardrobe to create the perfect look!
            </p>
            <Badge className="bg-myntra-pink-light text-myntra-pink border-myntra-pink">
              {selectedItems.length} item{selectedItems.length !== 1 ? 's' : ''} selected
            </Badge>
          </div>

          {closetItems.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg mb-4">No items in your closet yet!</p>
              <Button variant="outline" onClick={() => window.location.href = "/upload"}>
                Upload Your First Item
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {closetItems.map((item) => (
                <div
                  key={item.id}
                  className={`
                    relative cursor-pointer rounded-xl overflow-hidden border-2 transition-all duration-200
                    ${selectedItems.includes(item.id)
                      ? 'border-myntra-pink shadow-lg transform scale-105' 
                      : 'border-gray-200 hover:border-myntra-pink hover:shadow-md'
                    }
                  `}
                >
                  <div className="aspect-square bg-gray-50">
                    <img
                      src={item.image}
                      alt={item.name || `${item.category} item`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={() => toggleItemSelection(item.id)}
                      className={`
                        absolute top-3 left-3 z-10 transition-all duration-200 p-1 rounded-md
                        ${selectedItems.includes(item.id)
                          ? 'bg-myntra-pink text-white shadow-lg' 
                          : 'bg-white/80 text-gray-600 hover:bg-myntra-pink hover:text-white'
                        }
                      `}
                    >
                      {selectedItems.includes(item.id) ? (
                        <CheckSquare className="h-4 w-4" />
                      ) : (
                        <Square className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  <div className="p-3 bg-white">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {item.name || `${item.category} Item`}
                    </p>
                    <p className="text-xs text-gray-500 capitalize">{item.category}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>


        {/* Generate Button */}
        <div className="mb-8">
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
            <Button
              onClick={handleGenerateClick}
              disabled={selectedItems.length === 0 || isGenerating}
              variant="myntra"
              size="lg"
              className="w-full py-4 text-xl font-bold shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              <Sparkles className="h-6 w-6 mr-3" />
              {isGenerating ? 'Generating...' : `Generate Outfit Recommendations (${selectedItems.length} item${selectedItems.length !== 1 ? 's' : ''})`}
            </Button>
          </div>
        </div>

        {/* Generated Outfits */}
        {generatedOutfits.length > 0 && (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Your Personalized Looks ✨</h2>
            <Button 
              variant="outline" 
              onClick={handleGenerateClick}
              className="border-myntra-pink text-myntra-pink hover:bg-myntra-pink-light"
            >
              Generate New Looks
            </Button>
          </div>

          {/* AI Generated Section */}
          {generatedOutfits.some(outfit => outfit.type === 'ai-generated') && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-myntra-pink" />
                AI Generated Looks 🤖
              </h3>
              <div className="grid gap-6">
                {generatedOutfits
                  .filter(outfit => outfit.type === 'ai-generated')
                  .map((outfit) => (
                    <OutfitCard
                      key={outfit.id}
                      outfitId={outfit.id}
                      title={outfit.title}
                      caption={outfit.caption}
                      items={outfit.items}
                      score={outfit.score}
                      styling_tips={outfit.styling_tips}
                      outfitImage={outfit.outfitImage}
                    />
                  ))
                }
              </div>
            </div>
          )}

          {/* Wardrobe Only Section */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Heart className="h-5 w-5 text-myntra-pink" />
                From Your Closet 👕
              </h3>
              <div className="grid gap-6">
                {generatedOutfits
                  .filter(outfit => outfit.type === 'wardrobe-only')
                  .map((outfit) => (
                    <OutfitCard
                      key={outfit.id}
                      outfitId={outfit.id}
                      title={outfit.title}
                      caption={outfit.caption}
                      items={outfit.items}
                    />
                  ))
                }
              </div>
            </div>

            {/* Enhanced Look Section */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <ShoppingCart className="h-5 w-5 text-myntra-pink" />
                From Myntra 🛍️
              </h3>
              <div className="grid gap-6">
                {generatedOutfits
                  .filter(outfit => outfit.type === 'enhanced')
                  .map((outfit) => (
                    <OutfitCard
                      key={outfit.id}
                      outfitId={outfit.id}
                      title={outfit.title}
                      caption={outfit.caption}
                      items={outfit.items}
                    />
                  ))
                }
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OutfitRecommendations;