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
  const [occasion, setOccasion] = useState<string>("");
  const [generatedOutfits, setGeneratedOutfits] = useState<any[]>([]);
  const [showOccasionPrompt, setShowOccasionPrompt] = useState(false);

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

  const generateOutfits = () => {
    if (selectedItems.length === 0) return;

    const selected = closetItems.filter(item => selectedItems.includes(item.id));
    
    // Generate wardrobe-only outfit
    const wardrobeOutfit = {
      id: 'wardrobe-only',
      title: `Your Closet Combo 👕`,
      caption: `${occasion ? `Perfect for ${occasion.toLowerCase()}! ` : ''}Mix & match from your wardrobe - giving main character energy! ✨`,
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
      caption: `${occasion ? `Slay at ${occasion.toLowerCase()}! ` : ''}Your pieces + Myntra finds = that's giving runway vibes! 💅`,
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
    setShowOccasionPrompt(false);
    setOccasion("");
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
    if (selectedItems.length === 0) return;
    setShowOccasionPrompt(true);
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

        {/* Occasion Prompt Modal */}
        {showOccasionPrompt && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">What's the occasion? ✨</h3>
              <p className="text-gray-600 mb-4">Tell us the vibe so we can create the perfect look!</p>
              
              <div className="space-y-3 mb-6">
                {['Date Night', 'Casual Day Out', 'Party/Club', 'Work/Office', 'Concert/Event', 'Wedding/Festival', 'College/School', 'Vacation/Travel'].map((occasionOption) => (
                  <button
                    key={occasionOption}
                    onClick={() => setOccasion(occasionOption)}
                    className={`w-full text-left p-3 rounded-lg border-2 transition-all duration-200 ${
                      occasion === occasionOption
                        ? 'border-myntra-pink bg-myntra-pink-light text-myntra-pink'
                        : 'border-gray-200 hover:border-myntra-pink hover:bg-myntra-pink-light/30'
                    }`}
                  >
                    {occasionOption}
                  </button>
                ))}
              </div>

              <div className="mb-4">
                <Label htmlFor="custom-occasion" className="text-sm font-medium text-gray-700 mb-2 block">
                  Or describe your own vibe:
                </Label>
                <Input
                  id="custom-occasion"
                  placeholder="e.g., cozy coffee date, rooftop brunch..."
                  value={occasion}
                  onChange={(e) => setOccasion(e.target.value)}
                  className="border-2 border-gray-200 focus:border-myntra-pink"
                />
              </div>
              
              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => setShowOccasionPrompt(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button 
                  variant="myntra" 
                  onClick={generateOutfits}
                  disabled={!occasion.trim()}
                  className="flex-1"
                >
                  Generate Outfits! ✨
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Generate Button */}
        <div className="mb-8">
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
            <Button
              onClick={handleGenerateClick}
              disabled={selectedItems.length === 0}
              variant="myntra"
              size="lg"
              className="w-full py-4 text-xl font-bold shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              <Sparkles className="h-6 w-6 mr-3" />
              Generate Outfit Recommendations ({selectedItems.length} item{selectedItems.length !== 1 ? 's' : ''})
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