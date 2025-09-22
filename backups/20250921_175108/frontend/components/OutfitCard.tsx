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
}

const OutfitCard: React.FC<OutfitCardProps> = ({ 
  outfitId, 
  title, 
  caption, 
  items, 
  onShopItem 
}) => {
  return (
    <div className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 overflow-hidden border border-gray-100">
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <h3 className="text-xl font-bold text-myntra-dark mb-2">{title}</h3>
        <p className="text-base text-gray-600 font-medium">{caption}</p>
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