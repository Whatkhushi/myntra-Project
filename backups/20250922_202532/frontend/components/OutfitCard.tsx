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
  console.log('OutfitCard received items:', items);
  console.log('OutfitCard first item:', items[0]);
  
  return (
    <div className="bg-gradient-to-br from-white to-myntra-pink-light/5 rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:scale-[1.02] overflow-hidden border-2 border-myntra-pink/20">
      {/* Outfit Collage Image */}
      {outfitImage && (
        <div className="relative aspect-w-16 aspect-h-9 overflow-hidden rounded-t-2xl">
          <img 
            src={outfitImage} 
            alt={title} 
            className="w-full h-full object-cover transition-transform duration-700 hover:scale-105" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
          <div className="absolute top-4 right-4">
            {score !== undefined && (
              <Badge className="bg-myntra-pink/90 text-white border-0 text-sm font-bold px-3 py-1 rounded-full shadow-lg">
                {(score * 100).toFixed(0)}% Match
              </Badge>
            )}
          </div>
        </div>
      )}

      {/* Header */}
      <div className="p-8 border-b border-myntra-pink/10">
        <div className="text-center mb-4">
          <h3 className="text-3xl font-bold text-myntra-dark mb-3">{title}</h3>
          <p className="text-lg text-gray-700 font-medium leading-relaxed">{caption}</p>
        </div>
        
        {/* Styling Tips */}
        {styling_tips && styling_tips.length > 0 && (
          <div className="bg-myntra-pink/5 rounded-xl p-4 border border-myntra-pink/20">
            <p className="text-sm font-bold text-myntra-pink mb-3 flex items-center gap-2">
              <span className="text-lg">💡</span>
              Styling Tips
            </p>
            <ul className="text-sm text-gray-700 space-y-2">
              {styling_tips.map((tip, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-myntra-pink font-bold">•</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Items Grid */}
      <div className="p-8">
        <h4 className="text-lg font-bold text-myntra-dark mb-6 text-center">Outfit Pieces</h4>
        <div className="grid grid-cols-2 gap-6 mb-8">
          {items.map((item) => (
            <div key={item.id} className="relative group">
              <div className="aspect-square bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  onError={(e) => {
                    console.error('Image failed to load:', item.image);
                    e.currentTarget.src = '/placeholder-item.jpg';
                  }}
                  onLoad={() => {
                    console.log('Image loaded successfully:', item.image);
                  }}
                />
                
                {/* Badge */}
                <div className="absolute top-3 left-3">
                  {item.isOwned ? (
                    <Badge className="bg-green-500/90 text-white border-0 text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                      <Check className="h-3 w-3 mr-1" />
                      Owned
                    </Badge>
                  ) : (
                    <Badge className="bg-myntra-pink/90 text-white border-0 text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                      <ShoppingCart className="h-3 w-3 mr-1" />
                      Shop
                    </Badge>
                  )}
                </div>
              </div>
              
              {/* Item Info */}
              <div className="mt-4 text-center">
                <p className="text-sm font-bold text-gray-900 truncate">
                  {item.name}
                </p>
                <p className="text-xs text-gray-600 capitalize font-medium">
                  {item.category}
                </p>
                {!item.isOwned && item.price && (
                  <p className="text-sm font-bold text-myntra-pink mt-2">
                    ₹{item.price.toLocaleString()}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <Button 
            variant="outline" 
            className="flex-1 border-2 border-myntra-pink text-myntra-pink hover:bg-myntra-pink-light py-3 rounded-xl font-bold transition-all duration-200 hover:shadow-lg"
          >
            💾 Save Outfit
          </Button>
          <Button 
            variant="myntra" 
            className="flex-1 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-200"
            onClick={() => {
              const shopItems = items.filter(item => !item.isOwned);
              shopItems.forEach(item => onShopItem?.(item.id));
            }}
          >
            🛍️ Shop Missing Items
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OutfitCard;