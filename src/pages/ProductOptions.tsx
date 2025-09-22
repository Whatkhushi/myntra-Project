import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import ProductCard from '@/components/ProductCard';
import ProductViewModal from '@/components/ProductViewModal';
import { festiveLooks, Product } from '@/data/festiveProducts';
import { useGlobalState } from '@/contexts/GlobalStateContext';

const ProductOptions: React.FC = () => {
  const { lookType = 'navratri' } = useParams<{ lookType: string }>();
  const { 
    wishlist, 
    cart, 
    addToWishlist, 
    addToCart, 
    isInWishlist, 
    isInCart,
    updateCartQuantity 
  } = useGlobalState();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const currentLook = festiveLooks[lookType] || festiveLooks.navratri;
  const allProducts = currentLook.products;

  const handleWishlist = (productId: number) => {
    addToWishlist(productId);
  };

  const handleAddToCart = (product: Product) => {
    addToCart(product);
  };

  const handleView = (product: Product) => {
    setSelectedProduct(product);
  };

  const handleQuantityChange = (productId: number, newQuantity: number) => {
    updateCartQuantity(productId, newQuantity);
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
            <h1 className="text-4xl font-bold mb-4">{currentLook.title}</h1>
            <div className="flex justify-center">
              <Badge className="bg-white/20 text-white border-white/30 px-4 py-2 text-lg font-semibold">
                {currentLook.tag}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Product Options Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Product Options</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {allProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onWishlist={handleWishlist}
                onView={handleView}
                onAddToCart={handleAddToCart}
                isInWishlist={isInWishlist(product.id)}
                isInCart={isInCart(product.id)}
              />
            ))}
          </div>
        </div>

        {/* Product View Modal */}
        <ProductViewModal
          product={selectedProduct}
          isOpen={!!selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onWishlist={handleWishlist}
          onAddToCart={handleAddToCart}
          isInWishlist={selectedProduct ? isInWishlist(selectedProduct.id) : false}
          isInCart={selectedProduct ? isInCart(selectedProduct.id) : false}
          quantity={selectedProduct ? cart.find(item => item.id === selectedProduct.id)?.quantity || 1 : 1}
          onQuantityChange={handleQuantityChange}
        />
      </div>
    </div>
  );
};

export default ProductOptions;
