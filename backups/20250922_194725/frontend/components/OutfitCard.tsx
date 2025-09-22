import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, ShoppingCart } from "lucide-react";

interface OutfitItem {
  id: string;
  name: string;
  image: string;
  category: string;
  isOwned: boolean;
  price?: number;
  brand?: string;
}

interface OutfitCardProps {
  outfitId: string;
  title: string;
  caption: string;
  items: OutfitItem[];
  onShopItem?: (itemId: string) => void;
  score?: number;
  styling_tips?: string[];
  outfitImage?: string | null;
}

const OutfitCard: React.FC<OutfitCardProps> = ({ 
  outfitId, 
  title, 
  caption, 
  items, 
  onShopItem,
  score,
  styling_tips,
  outfitImage
}) => {
  return (
    <div className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 overflow-hidden border border-gray-100">
      {/* Outfit Collage Image */}
      {outfitImage && (
        <div className="aspect-w-16 aspect-h-9 overflow-hidden rounded-t-xl">
          <img 
            src={outfitImage} 
            alt={title} 
            className="w-full h-full object-cover" 
          />
        </div>
      )}

      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xl font-bold text-myntra-dark">{title}</h3>
          {score !== undefined && (
            <Badge className="bg-myntra-pink-light text-myntra-pink border-myntra-pink text-xs font-bold px-2 py-1">
              Score: {(score * 100).toFixed(0)}%
            </Badge>
          )}
        </div>
        <p className="text-base text-gray-600 font-medium">{caption}</p>
        
        {/* Styling Tips */}
        {styling_tips && styling_tips.length > 0 && (
          <div className="mt-3">
            <p className="text-sm font-semibold text-gray-700 mb-2">💡 Styling Tips:</p>
            <ul className="text-sm text-gray-600 space-y-1">
              {styling_tips.map((tip, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-myntra-pink mr-2">•</span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Items Grid */}
      <div className="p-6">
        <div className="grid grid-cols-2 gap-4 mb-6">
          {items.map((item) => (
            <div key={item.id} className="relative group">
              <div className="aspect-square bg-gray-50 rounded-lg overflow-hidden">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
                
                {/* Badge */}
                <div className="absolute top-2 left-2">
                  {item.isOwned ? (
                    <Badge className="bg-green-100 text-green-700 border-green-200 text-xs font-bold px-2 py-1">
                      <Check className="h-3 w-3 mr-1" />
                      In Your Closet
                    </Badge>
                  ) : (
                    <Badge className="bg-myntra-pink text-white border-0 text-xs font-bold px-2 py-1">
                      <ShoppingCart className="h-3 w-3 mr-1" />
                      Shop on Myntra
                    </Badge>
                  )}
                </div>
              </div>
              
              {/* Item Info */}
              <div className="mt-3">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {item.name}
                </p>
                <p className="text-xs text-gray-500 capitalize">
                  {item.category}
                </p>
                {!item.isOwned && item.price && (
                  <p className="text-sm font-bold text-myntra-pink mt-1">
                    ₹{item.price.toLocaleString()}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button variant="outline" className="flex-1 border-myntra-pink text-myntra-pink hover:bg-myntra-pink-light">
            Save Outfit
          </Button>
          <Button 
            variant="myntra" 
            className="flex-1"
            onClick={() => {
              const shopItems = items.filter(item => !item.isOwned);
              shopItems.forEach(item => onShopItem?.(item.id));
            }}
          >
            Shop Missing Items
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OutfitCard;