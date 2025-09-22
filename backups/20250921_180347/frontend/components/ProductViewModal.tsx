import React from 'react';
import { X, Heart, ShoppingCart, Minus, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Product } from '@/data/festiveProducts';

interface ProductViewModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onWishlist: (productId: number) => void;
  onAddToCart: (product: Product) => void;
  isInWishlist: boolean;
  isInCart: boolean;
  quantity: number;
  onQuantityChange: (productId: number, newQuantity: number) => void;
}

const ProductViewModal: React.FC<ProductViewModalProps> = ({
  product,
  isOpen,
  onClose,
  onWishlist,
  onAddToCart,
  isInWishlist,
  isInCart,
  quantity,
  onQuantityChange
}) => {
  if (!isOpen || !product) return null;

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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex flex-col lg:flex-row">
          {/* Product Image */}
          <div className="lg:w-1/2 relative">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-96 lg:h-full object-cover rounded-t-xl lg:rounded-l-xl lg:rounded-tr-none"
            />
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-4 right-4 bg-white/90 hover:bg-white rounded-full p-2 shadow-md"
              onClick={() => onWishlist(product.id)}
            >
              <Heart className={`h-5 w-5 transition-colors ${
                isInWishlist 
                  ? 'text-myntra-pink fill-current' 
                  : 'text-gray-600 hover:text-myntra-pink'
              }`} />
            </Button>
            <div className="absolute top-4 left-4">
              <Badge className={`${getTagColor(product.tag)} border font-medium`}>
                {product.tag}
              </Badge>
            </div>
          </div>

          {/* Product Details */}
          <div className="lg:w-1/2 p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-6 w-6" />
                </Button>
              </div>

              <div className="mb-4">
                <span className="text-3xl font-bold text-myntra-pink">{product.price}</span>
                <p className="text-gray-600 mt-1">Sold by {product.seller}</p>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Product Details</h3>
                <p className="text-gray-600">
                  This beautiful {product.name.toLowerCase()} is perfect for your festive wardrobe. 
                  Made with high-quality materials and traditional craftsmanship, it's designed to 
                  make you look and feel amazing during special occasions.
                </p>
              </div>
            </div>

            {/* Quantity and Actions */}
            <div className="space-y-4">
              {isInCart && (
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium text-gray-700">Quantity:</span>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onQuantityChange(product.id, quantity - 1)}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-8 text-center font-medium">{quantity}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onQuantityChange(product.id, quantity + 1)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1 border-myntra-pink text-myntra-pink hover:bg-myntra-pink hover:text-white"
                  onClick={() => onWishlist(product.id)}
                >
                  <Heart className="h-4 w-4 mr-2" />
                  {isInWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
                </Button>
                <Button
                  className="flex-1 bg-myntra-pink hover:bg-pink-600 text-white"
                  onClick={() => onAddToCart(product)}
                  disabled={isInCart}
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  {isInCart ? 'Added to Cart' : 'Add to Cart'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductViewModal;
