import React, { useState, useEffect } from "react";
import { Filter, Grid, Trash2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import GamificationDashboard from "@/components/GamificationDashboard";
import { getWardrobeItems, deleteWardrobeItem } from "@/services/wardrobeApi";
import { loadAllWardrobeItems, clearLocalStorageDuplicates } from "@/utils/wardrobeUtils";

interface ClothingItem {
  id: string;
  image: string;
  category: string;
  name?: string;
  dateAdded: string;
}

const CATEGORIES = [
  { name: "All", value: "all" },
  { name: "Tops", value: "tops", color: "bg-category-tops" },
  { name: "Bottoms", value: "bottoms", color: "bg-category-bottoms" },
  { name: "Shoes", value: "shoes", color: "bg-category-shoes" },
  { name: "Accessories", value: "accessories", color: "bg-category-accessories" },
  { name: "Dresses", value: "dresses", color: "bg-category-dresses" },
];

const ClosetGrid = () => {
  const [items, setItems] = useState<ClothingItem[]>([]);
  const [activeFilter, setActiveFilter] = useState("all");
  const [filteredItems, setFilteredItems] = useState<ClothingItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load items from both localStorage and backend
  const loadItems = async () => {
    try {
      setIsLoading(true);
      
      // First, clean up any duplicates in localStorage
      await clearLocalStorageDuplicates();
      
      // Use the utility function to load all items
      const allItems = await loadAllWardrobeItems();
      
      setItems(allItems);
      setFilteredItems(allItems);
    } catch (error) {
      console.error('Error loading items:', error);
      setItems([]);
      setFilteredItems([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, []);

  // Filter items when category changes
  useEffect(() => {
    if (activeFilter === "all") {
      setFilteredItems(items);
    } else {
      setFilteredItems(items.filter(item => item.category.toLowerCase() === activeFilter));
    }
  }, [activeFilter, items]);

  const getCategoryColor = (category: string) => {
    const categoryData = CATEGORIES.find(cat => cat.value === category.toLowerCase());
    return categoryData?.color || "bg-myntra-gray";
  };

  const handleDeleteItem = async (itemId: string) => {
    try {
      // Attempt backend delete when the id starts with "backend_"
      if (itemId.startsWith('backend_')) {
        const numericId = parseInt(itemId.replace('backend_', ''), 10);
        if (!Number.isNaN(numericId)) {
          await deleteWardrobeItem(numericId);
        }
      }

      // Optimistically update local state/localStorage
      const updatedItems = items.filter(item => item.id !== itemId);
      setItems(updatedItems);
      
      // Only update localStorage for non-backend items
      const localItems = updatedItems.filter(item => !item.id.startsWith('backend_'));
      localStorage.setItem("closetItems", JSON.stringify(localItems));

      // Re-fetch from backend to ensure permanence
      await loadItems();
    } catch (error) {
      console.error('Failed to delete item:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-3">My Wardrobe</h1>
              <p className="text-lg text-gray-600">Organize and browse your digital closet collection</p>
            </div>
            <Button
              onClick={loadItems}
              disabled={isLoading}
              variant="outline"
              size="lg"
              className="flex items-center gap-2 border-2 border-myntra-pink text-myntra-pink hover:bg-myntra-pink-light"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              {isLoading ? 'Refreshing...' : 'Refresh'}
            </Button>
          </div>
        </div>

        {/* Gamification Dashboard */}
        <GamificationDashboard />

        {/* Fashion Card Unlock Notification */}
        {items.length >= 10 && (
          <div className="mb-8">
            <div className="bg-gradient-primary rounded-xl p-6 text-white animate-pulse">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold mb-2">🎉 Fashion Personality Unlocked!</h3>
                  <p className="text-white/90">You've uploaded {items.length} items - discover your style DNA!</p>
                </div>
                <Button 
                  variant="secondary"
                  onClick={() => window.location.href = "/fashion-card"}
                  className="bg-white text-myntra-dark hover:bg-gray-100 font-semibold animate-bounce"
                >
                  View Style Card ✨
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Filter Bar */}
        <div className="mb-10 bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-2 bg-myntra-pink-light rounded-lg">
              <Filter className="h-5 w-5 text-myntra-pink" />
            </div>
            <span className="text-lg font-semibold text-gray-900">Filter by Category</span>
          </div>
          <div className="flex flex-wrap gap-3">
            {CATEGORIES.map((category) => (
              <Button
                key={category.value}
                variant={activeFilter === category.value ? "default" : "outline"}
                size="lg"
                onClick={() => setActiveFilter(category.value)}
                className={`
                  rounded-full transition-all duration-300 border-2 font-medium px-6 py-3
                  ${activeFilter === category.value 
                    ? 'bg-myntra-pink hover:bg-primary-hover text-white shadow-lg border-myntra-pink transform scale-105' 
                    : 'hover:bg-myntra-pink-light border-gray-200 hover:border-myntra-pink text-gray-700 hover:text-myntra-pink hover:scale-105'
                  }
                `}
              >
                {category.name}
                <Badge 
                  variant="secondary" 
                  className={`ml-3 text-xs font-bold px-2 py-1 rounded-full ${
                    activeFilter === category.value 
                      ? 'bg-white/20 text-white border-0' 
                      : 'bg-gray-100 text-gray-600 border-0'
                  }`}
                >
                  {category.value === "all" 
                    ? items.length 
                    : items.filter(item => item.category.toLowerCase() === category.value).length
                  }
                </Badge>
              </Button>
            ))}
          </div>
        </div>

        {/* Items Grid */}
        {filteredItems.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl shadow-lg border border-gray-100">
            <div className="p-8">
              <div className="w-24 h-24 bg-myntra-pink-light rounded-full flex items-center justify-center mx-auto mb-6">
                <Grid className="h-12 w-12 text-myntra-pink" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                {activeFilter === "all" ? "Your closet is empty" : `No ${activeFilter} found`}
              </h3>
              <p className="text-gray-600 mb-8 text-lg max-w-md mx-auto">
                {activeFilter === "all" 
                  ? "Start building your digital wardrobe by uploading your first item!"
                  : `Upload some ${activeFilter} to see them here.`
                }
              </p>
              <Button 
                variant="myntra" 
                size="lg"
                className="px-8 py-4 text-lg font-semibold"
                onClick={() => window.location.href = "/upload"}
              >
                Upload Your First Item
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 mb-12">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 overflow-hidden group border border-gray-100"
              >
                <div className="aspect-square relative overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.name || `${item.category} item`}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute top-3 left-3">
                    <Badge 
                      className={`
                        ${getCategoryColor(item.category)} text-white text-xs font-bold px-3 py-1
                        shadow-lg border-0 uppercase tracking-wide rounded-full
                      `}
                    >
                      {item.category}
                    </Badge>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteItem(item.id);
                    }}
                    className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full shadow-lg"
                    title="Delete item"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 pointer-events-none"></div>
                </div>
                <div className="p-4">
                  <p className="text-sm font-medium text-gray-900 truncate mb-1">
                    {item.name || `${item.category} Item`}
                  </p>
                  <p className="text-xs text-gray-500">
                    Added {new Date(item.dateAdded).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ClosetGrid;