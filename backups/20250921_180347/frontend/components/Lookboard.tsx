import React, { useState } from 'react';
import { ExternalLink, ShoppingBag, Heart, Star, Bookmark, Share2, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { LookboardImage, LookboardResponse } from '@/services/geminiApi';

interface LookboardProps {
  response: LookboardResponse;
  images: LookboardImage[];
  shopUrl: string;
  onImageClick?: (image: LookboardImage) => void;
  onSaveLook?: (lookboardData: any) => void;
}

const Lookboard: React.FC<LookboardProps> = ({ 
  response, 
  images, 
  shopUrl, 
  onImageClick,
  onSaveLook 
}) => {
  const [isSaved, setIsSaved] = useState(false);

  const handleShopClick = () => {
    window.open(shopUrl, '_blank');
  };

  const handleImageClick = (image: LookboardImage) => {
    if (onImageClick) {
      onImageClick(image);
    } else if (image.productUrl) {
      window.open(image.productUrl, '_blank');
    }
  };

  const handleSaveLook = () => {
    const lookboardData = {
      id: Date.now().toString(),
      response,
      images,
      shopUrl,
      savedAt: new Date().toISOString(),
      title: `${response.occasion} Look`
    };

    // Save to localStorage
    const savedLooks = JSON.parse(localStorage.getItem('savedLooks') || '[]');
    savedLooks.push(lookboardData);
    localStorage.setItem('savedLooks', JSON.stringify(savedLooks));

    setIsSaved(true);
    
    if (onSaveLook) {
      onSaveLook(lookboardData);
    }

    toast({
      title: "Look saved! 💖",
      description: "Your look has been saved to your collection"
    });
  };

  const handleShareLook = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${response.occasion} Look`,
          text: response.description,
          url: window.location.href
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(`${response.occasion} Look: ${response.description}`);
      toast({
        title: "Link copied! 📋",
        description: "Look details copied to clipboard"
      });
    }
  };

  return (
    <div className="mt-6 space-y-6">
      {/* Enhanced Style Keywords and Color Palette */}
      <div className="flex flex-wrap gap-2 mb-4">
        {response.styleKeywords.map((keyword, index) => (
          <Badge 
            key={index}
            variant="secondary" 
            className="bg-gradient-to-r from-myntra-pink/10 to-pink-50 text-myntra-pink border-myntra-pink/30 font-medium px-3 py-1"
          >
            {keyword}
          </Badge>
        ))}
        {response.colorPalette.map((color, index) => (
          <Badge 
            key={`color-${index}`}
            variant="outline" 
            className="border-gray-300 text-gray-600 bg-white/80 backdrop-blur-sm font-medium px-3 py-1"
          >
            {color}
          </Badge>
        ))}
      </div>

      {/* Enhanced Lookboard Grid */}
      <div className="bg-gradient-to-br from-white to-pink-50/30 rounded-2xl border border-gray-200/50 p-6 shadow-lg backdrop-blur-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-myntra-pink to-pink-600 rounded-xl">
              <Star className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Lookboard Inspiration</h3>
              <p className="text-sm text-gray-600">Curated just for you</p>
            </div>
          </div>
          <Badge className="bg-gradient-to-r from-myntra-pink to-pink-600 text-white font-semibold px-4 py-2">
            {images.length} items
          </Badge>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {images.map((image, index) => (
            <div
              key={image.id}
              className="group relative bg-white rounded-xl overflow-hidden cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-2xl border border-gray-100"
              onClick={() => handleImageClick(image)}
            >
              <div className="aspect-square relative">
                <img
                  src={image.url}
                  alt={image.title}
                  className="w-full h-full object-cover group-hover:brightness-110 transition-all duration-300"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/placeholder.svg';
                  }}
                />
                
                {/* Enhanced overlay with source badge */}
                <div className="absolute top-3 right-3">
                  <Badge 
                    variant="secondary" 
                    className="text-xs bg-black/80 text-white border-0 backdrop-blur-sm"
                  >
                    {image.source}
                  </Badge>
                </div>

                {/* Enhanced hover overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-end justify-center pb-4">
                  <div className="bg-white/95 backdrop-blur-sm rounded-full p-2 shadow-lg">
                    <ExternalLink className="h-4 w-4 text-gray-700" />
                  </div>
                </div>
              </div>

              <div className="p-4 bg-white">
                <h4 className="text-sm font-semibold text-gray-900 truncate mb-1">
                  {image.title}
                </h4>
                <p className="text-xs text-gray-500 capitalize font-medium">
                  {image.category}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Enhanced Iconic Inspiration */}
        {response.iconicInspiration && (
          <div className="mb-6 p-5 bg-gradient-to-r from-myntra-pink/5 via-purple-50/50 to-pink-50/30 rounded-xl border border-myntra-pink/20 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-myntra-pink/10 rounded-lg">
                <Heart className="h-4 w-4 text-myntra-pink" />
              </div>
              <span className="text-sm font-semibold text-myntra-pink">Iconic Inspiration</span>
            </div>
            <p className="text-sm text-gray-700 italic leading-relaxed">
              "{response.iconicInspiration}"
            </p>
          </div>
        )}

        {/* Enhanced Fabric Suggestions */}
        {response.fabricSuggestions.length > 0 && (
          <div className="mb-6">
            <p className="text-sm font-semibold text-gray-700 mb-3">Fabric Suggestions:</p>
            <div className="flex flex-wrap gap-2">
              {response.fabricSuggestions.map((fabric, index) => (
                <Badge 
                  key={index}
                  variant="outline" 
                  className="text-xs border-gray-300 text-gray-600 bg-white/80 backdrop-blur-sm font-medium px-3 py-1"
                >
                  {fabric}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Enhanced Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          onClick={handleShopClick}
          className="flex-1 bg-gradient-to-r from-myntra-pink to-pink-600 hover:from-pink-600 hover:to-myntra-pink text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          <ShoppingBag className="h-5 w-5 mr-2" />
          Shop This Look on Myntra
        </Button>
        
        <Button
          variant="outline"
          className={`border-2 font-semibold py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 ${
            isSaved 
              ? 'border-green-500 text-green-600 bg-green-50 hover:bg-green-100' 
              : 'border-myntra-pink text-myntra-pink hover:bg-myntra-pink hover:text-white'
          }`}
          onClick={handleSaveLook}
          disabled={isSaved}
        >
          {isSaved ? (
            <>
              <Bookmark className="h-4 w-4 mr-2" />
              Saved!
            </>
          ) : (
            <>
              <Heart className="h-4 w-4 mr-2" />
              Save Look
            </>
          )}
        </Button>

        <Button
          variant="outline"
          className="border-2 border-gray-300 text-gray-600 hover:bg-gray-50 font-semibold py-4 px-4 rounded-xl transition-all duration-200 transform hover:scale-105"
          onClick={handleShareLook}
        >
          <Share2 className="h-4 w-4" />
        </Button>
      </div>

      {/* Enhanced Additional Info */}
      <div className="flex flex-wrap gap-6 text-sm text-gray-600 bg-white/50 backdrop-blur-sm rounded-xl p-4 border border-gray-200/50">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-myntra-pink rounded-full"></div>
          <span className="font-semibold">Occasion:</span>
          <span className="capitalize font-medium">{response.occasion}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-pink-400 rounded-full"></div>
          <span className="font-semibold">Season:</span>
          <span className="capitalize font-medium">{response.season}</span>
        </div>
      </div>
    </div>
  );
};

export default Lookboard;
