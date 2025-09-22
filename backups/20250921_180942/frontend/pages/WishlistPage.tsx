import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Heart, ShoppingCart, Eye, Minus, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { festiveLooks, Product } from '@/data/festiveProducts';
import { useGlobalState } from '@/contexts/GlobalStateContext';

const WishlistPage: React.FC = () => {
  const { 
    wishlist, 
    cart, 
    addToWishlist, 
    addToCart, 
    updateCartQuantity,
    getWishlistCount,
    getCartCount,
    getTotalPrice 
  } = useGlobalState();

  // Get all products from all festive looks
  const allProducts = Object.values(festiveLooks).flatMap(look => look.products);
  
  // Filter products that are in wishlist
  const wishlistProducts = allProducts.filter(product => wishlist.includes(product.id));

  const handleRemoveFromWishlist = (productId: number) => {
    addToWishlist(productId); // This will toggle (remove if already in wishlist)
  };

  const handleAddToCartFromWishlist = (product: Product) => {
    addToCart(product);
  };

  const handleQuantityChange = (productId: number, newQuantity: number) => {
    updateCartQuantity(productId, newQuantity);
  };

  const handleViewProduct = (product: Product) => {
    // Navigate to the specific product page based on product ID
    if (product.id >= 1 && product.id <= 6) {
      window.location.href = '/products/navratri';
    } else if (product.id >= 7 && product.id <= 11) {
      window.location.href = '/products/diwali';
    } else if (product.id >= 13 && product.id <= 17) {
      window.location.href = '/products/autumn';
    } else if (product.id >= 18 && product.id <= 24) {
      window.location.href = '/products/shaadi';
    } else if (product.id >= 25 && product.id <= 29) {
      window.location.href = '/products/concert';
    } else if (product.id >= 30 && product.id <= 33) {
      window.location.href = '/products/rainy-week-vibes';
    } else if (product.id >= 34 && product.id <= 37) {
      window.location.href = '/products/college-fest-mode';
    } else if (product.id >= 38 && product.id <= 41) {
      window.location.href = '/products/beach-wedding-guest';
    } else if (product.id >= 42 && product.id <= 45) {
      window.location.href = '/products/cozy-winter-layers';
    } else if (product.id >= 46 && product.id <= 49) {
      window.location.href = '/products/date-night-glam';
    } else {
      window.location.href = '/products';
    }
  };


  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-myntra-pink to-pink-600 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 mb-6">
            <Link 
              to="/seasonal" 
              className="inline-flex items-center text-white/80 hover:text-white transition-colors group"
            >
              <ArrowLeft className="h-5 w-5 mr-2 group-hover:-translate-x-1 transition-transform" />
              <span className="font-medium">Back to Seasonal Styles</span>
            </Link>
          </div>
          
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4 flex items-center justify-center gap-3">
              <Heart className="h-10 w-10" />
              My Wishlist & Cart
            </h1>
            <p className="text-lg text-white/90">
              {getWishlistCount()} wishlist items • {getCartCount()} cart items
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {getWishlistCount() === 0 && getCartCount() === 0 ? (
          <div className="text-center py-16">
            <Heart className="h-24 w-24 text-gray-300 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Your wishlist and cart are empty</h2>
            <p className="text-gray-600 mb-8">Start adding items you love to your wishlist!</p>
            <Link to="/products">
              <Button className="bg-myntra-pink hover:bg-pink-600 text-white px-8 py-3 text-lg">
                Start Shopping
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Wishlist Section */}
            <div className="lg:col-span-2">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Heart className="h-6 w-6 text-myntra-pink" />
                Wishlist ({getWishlistCount()} items)
              </h2>
              
              {getWishlistCount() === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl shadow-lg border border-gray-100">
                  <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600">No items in your wishlist yet</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {wishlistProducts.map((product) => (
                    <div key={product.id} className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300">
                      {/* Product Image */}
                      <div className="relative aspect-square overflow-hidden">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-3 right-3">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="bg-white/90 hover:bg-white rounded-full p-2 shadow-md"
                            onClick={() => handleRemoveFromWishlist(product.id)}
                          >
                            <Heart className="h-4 w-4 text-myntra-pink fill-current" />
                          </Button>
                        </div>
                        <div className="absolute top-3 left-3">
                          <Badge className="bg-myntra-pink/10 text-myntra-pink border-myntra-pink/20 font-medium">
                            {product.tag}
                          </Badge>
                        </div>
                      </div>

                      {/* Product Details */}
                      <div className="p-4">
                        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
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
                            onClick={() => handleViewProduct(product)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          <Button
                            size="sm"
                            className="flex-1 bg-myntra-pink hover:bg-pink-600 text-white"
                            onClick={() => handleAddToCartFromWishlist(product)}
                          >
                            <ShoppingCart className="h-4 w-4 mr-1" />
                            Add to Cart
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Cart Section */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 sticky top-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <ShoppingCart className="h-6 w-6 text-myntra-pink" />
                  Shopping Cart ({getCartCount()} items)
                </h3>
                
                {getCartCount() === 0 ? (
                  <div className="text-center py-8">
                    <ShoppingCart className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-600 text-sm">Your cart is empty</p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-4 mb-6">
                      {cart.map((item) => (
                        <div key={item.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <img 
                            src={item.image} 
                            alt={item.name}
                            className="w-12 h-12 object-cover rounded"
                          />
                          <div className="flex-1">
                            <p className="font-medium text-sm text-gray-900 line-clamp-1">{item.name}</p>
                            <p className="text-myntra-pink font-semibold">{item.price}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-8 text-center font-medium text-sm">{item.quantity}</span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="border-t pt-4">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-lg font-bold text-gray-900">Total:</span>
                        <span className="text-xl font-bold text-myntra-pink">₹{getTotalPrice().toLocaleString()}</span>
                      </div>
                      <Button className="w-full bg-myntra-pink hover:bg-pink-600 text-white">
                        Proceed to Checkout
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WishlistPage;
