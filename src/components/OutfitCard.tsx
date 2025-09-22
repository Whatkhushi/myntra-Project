import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

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
  score?: number;
  outfitImage?: string | null;
}

const OutfitCard: React.FC<OutfitCardProps> = ({ 
  outfitId, 
  title, 
  caption, 
  items, 
  score,
  outfitImage
}) => {
  console.log('OutfitCard received items:', items);
  console.log('OutfitCard first item:', items[0]);
  
  return (
    <div className="bg-gradient-to-br from-white to-pink-50 rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:scale-[1.02] overflow-hidden border-2 border-pink-200">
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
      <div className="p-8 border-b border-pink-500/20">
        <div className="text-center mb-4">
          <h3 className="text-2xl font-bold text-pink-500 mb-2">{title}</h3>
          {caption && (
            <p className="text-lg text-gray-600 font-medium leading-relaxed">{caption}</p>
          )}
        </div>
      </div>

      {/* Items Grid */}
      <div className="p-8">
        <div className="grid grid-cols-2 gap-6 mb-8">
          {items.map((item) => (
            <div key={item.id} className="relative group">
              <div className="aspect-square bg-gradient-to-br from-pink-50 to-pink-100 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border border-pink-200">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  onError={(e) => {
                    console.error('Image failed to load:', item.image);
                    console.error('Item data:', item);
                    e.currentTarget.src = '/placeholder-item.jpg';
                  }}
                  onLoad={() => {
                    console.log('Image loaded successfully:', item.image);
                  }}
                />
                
                {/* Badge */}
                <div className="absolute top-3 left-3">
                  <Badge className="bg-pink-500/90 text-white border-0 text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                    <Check className="h-3 w-3 mr-1" />
                    Owned
                  </Badge>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center">
          <Button 
            variant="outline" 
            className="border-2 border-pink-500 text-pink-500 hover:bg-pink-500 hover:text-white py-3 px-8 rounded-xl font-bold transition-all duration-200 hover:shadow-lg"
          >
            💾 Save Outfit
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OutfitCard;