import React from 'react';
import { Heart, Eye, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Product } from '@/data/festiveProducts';

interface ProductCardProps {
  product: Product;
  onWishlist: (productId: number) => void;
  onView: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  isInWishlist?: boolean;
  isInCart?: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onWishlist,
  onView,
  onAddToCart,
  isInWishlist = false,
  isInCart = false
}) => {
  const getTagColor = (tag: string) => {
    switch (tag.toLowerCase()) {
      case 'best seller':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'new':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'trending':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'premium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'on sale':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'comfort':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'elegant':
        return 'bg-pink-100 text-pink-800 border-pink-200';
      case 'stylish':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'practical':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:scale-105 group">
      {/* Product Image */}
      <div className="relative aspect-square overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
        />
        <div className="absolute top-3 right-3">
          <Button
            size="sm"
            variant="ghost"
            className="bg-white/90 hover:bg-white rounded-full p-2 shadow-md"
            onClick={() => onWishlist(product.id)}
          >
            <Heart className={`h-4 w-4 transition-colors ${
              isInWishlist 
                ? 'text-myntra-pink fill-current' 
                : 'text-gray-600 hover:text-myntra-pink'
            }`} />
          </Button>
        </div>
        <div className="absolute top-3 left-3">
          <Badge className={`${getTagColor(product.tag)} border font-medium`}>
            {product.tag}
          </Badge>
        </div>
      </div>

      {/* Product Details */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-myntra-pink transition-colors">
          {product.name}
        </h3>
        
        <div className="flex items-center justify-between mb-3">
          <span className="text-lg font-bold text-myntra-pink">{product.price}</span>
          <span className="text-sm text-gray-500">{product.seller}</span>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 border-myntra-pink text-myntra-pink hover:bg-myntra-pink hover:text-white transition-colors"
            onClick={() => onView(product)}
          >
            <Eye className="h-4 w-4 mr-1" />
            View
          </Button>
          <Button
            size="sm"
            className="flex-1 bg-myntra-pink hover:bg-pink-600 text-white"
            onClick={() => onAddToCart(product)}
            disabled={isInCart}
          >
            <ShoppingCart className="h-4 w-4 mr-1" />
            {isInCart ? 'Added' : 'Add'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
