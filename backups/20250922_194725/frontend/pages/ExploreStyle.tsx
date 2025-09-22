import React, { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, ShoppingBag, Heart, ExternalLink, Star, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";

interface Product {
  id: string;
  name: string;
  image: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  brand: string;
  rating?: number;
  category: string;
  colors: string[];
  tags: string[];
}

interface ProductGroup {
  piece: string;
  products: Product[];
  isLoading: boolean;
}

interface StyleDetails {
  id: string;
  title: string;
  emoji: string;
  description: string;
  defaultPieces: string[];
  holiday?: string;
  date?: string;
  season: string;
  occasion: string;
}

const ExploreStyle: React.FC = () => {
  const { styleId } = useParams<{ styleId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [styleDetails, setStyleDetails] = useState<StyleDetails | null>(null);
  const [productGroups, setProductGroups] = useState<ProductGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPiece, setSelectedPiece] = useState<string>("");

  // Mock product data - in real implementation, this would come from Myntra API
  const mockProducts: Product[] = [
    {
      id: "p1",
      name: "Red Wool Sweater",
      image: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400&h=400&fit=crop&crop=center",
      price: 2499,
      originalPrice: 3499,
      discount: 29,
      brand: "StyleHub",
      rating: 4.2,
      category: "tops",
      colors: ["red", "burgundy"],
      tags: ["wool", "warm", "christmas"]
    },
    {
      id: "p2",
      name: "Classic Wool Coat",
      image: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400&h=400&fit=crop&crop=center",
      price: 4599,
      originalPrice: 5999,
      discount: 23,
      brand: "WinterWear",
      rating: 4.5,
      category: "outerwear",
      colors: ["black", "navy"],
      tags: ["wool", "warm", "formal"]
    },
    {
      id: "p3",
      name: "Leather Ankle Boots",
      image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=400&fit=crop&crop=center",
      price: 3299,
      originalPrice: 4299,
      discount: 23,
      brand: "BootCraft",
      rating: 4.3,
      category: "shoes",
      colors: ["brown", "black"],
      tags: ["leather", "ankle", "casual"]
    },
    {
      id: "p4",
      name: "Cashmere Scarf",
      image: "https://images.unsplash.com/photo-1521369909029-2afed882baee?w=400&h=400&fit=crop&crop=center",
      price: 1899,
      originalPrice: 2499,
      discount: 24,
      brand: "LuxuryWarmth",
      rating: 4.7,
      category: "accessories",
      colors: ["red", "grey"],
      tags: ["cashmere", "warm", "luxury"]
    }
  ];

  useEffect(() => {
    // Get style details from location state or construct from styleId
    const stateStyle = location.state as any;
    
    if (stateStyle?.title) {
      // Construct style details from the passed data
      const style: StyleDetails = {
        id: stateStyle.styleId || styleId || "unknown",
        title: stateStyle.title,
        emoji: stateStyle.emoji || "🎄",
        description: stateStyle.description || "Festive & Warm",
        defaultPieces: stateStyle.defaultPieces || ["red sweater", "wool coat", "boots", "warm scarf"],
        season: stateStyle.season || "winter",
        occasion: stateStyle.occasion || "festive"
      };
      setStyleDetails(style);
    } else {
      // Fallback: construct from styleId
      const fallbackStyle: StyleDetails = {
        id: styleId || "unknown",
        title: "Style Collection",
        emoji: "✨",
        description: "Curated Collection",
        defaultPieces: ["top", "bottom", "shoes", "accessories"],
        season: "all",
        occasion: "general"
      };
      setStyleDetails(fallbackStyle);
    }
  }, [styleId, location.state]);

  useEffect(() => {
    if (styleDetails) {
      loadProductsForPieces();
    }
  }, [styleDetails]);

  const loadProductsForPieces = async () => {
    if (!styleDetails) return;
    
    setIsLoading(true);
    
    // Initialize product groups for each piece
    const initialGroups: ProductGroup[] = styleDetails.defaultPieces.map(piece => ({
      piece,
      products: [],
      isLoading: true
    }));
    setProductGroups(initialGroups);
    
    // Fetch products for each piece with theme context
    const updatedGroups = await Promise.all(
      styleDetails.defaultPieces.map(async (piece) => {
        try {
          // Build query parameters with theme context
          const params = new URLSearchParams({
            q: piece,
            limit: '6'
          });
          
          // Add season and occasion context if available
          if (styleDetails.season && styleDetails.season !== 'all') {
            params.append('season', styleDetails.season);
          }
          if (styleDetails.occasion && styleDetails.occasion !== 'general') {
            params.append('occasion', styleDetails.occasion);
          }
          
          // For Diwali theme, ensure we use 'diwali' as occasion
          if (styleDetails.title.toLowerCase().includes('diwali')) {
            params.set('occasion', 'diwali');
          }
          // For Navratri theme, ensure we use 'navratri' as occasion  
          if (styleDetails.title.toLowerCase().includes('navratri')) {
            params.set('occasion', 'navratri');
          }
          
          const response = await fetch(`http://localhost:5000/api/product-search?${params.toString()}`, {
            method: 'GET',
            mode: 'cors',
            credentials: 'omit',
          });

          if (response.ok) {
            const data = await response.json();
            return {
              piece,
              products: data.products,
              isLoading: false
            };
          } else {
            // Fallback to mock products
            const mockProductsForPiece = mockProducts.slice(0, 3).map((product, index) => ({
              ...product,
              id: `${piece}-${index}`,
              name: `${piece} ${product.name}`,
              tags: [...product.tags, piece.toLowerCase()]
            }));
            return {
              piece,
              products: mockProductsForPiece,
              isLoading: false
            };
          }
        } catch (error) {
          console.error(`Error fetching products for ${piece}:`, error);
          // Fallback to mock products
          const mockProductsForPiece = mockProducts.slice(0, 3).map((product, index) => ({
            ...product,
            id: `${piece}-${index}`,
            name: `${piece} ${product.name}`,
            tags: [...product.tags, piece.toLowerCase()]
          }));
          return {
            piece,
            products: mockProductsForPiece,
            isLoading: false
          };
        }
      })
    );
    
    setProductGroups(updatedGroups);
    setIsLoading(false);
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      // Filter product groups based on search query
      const filteredGroups = productGroups.map(group => ({
        ...group,
        products: group.products.filter(product =>
          product.name.toLowerCase().includes(query.toLowerCase()) ||
          product.brand.toLowerCase().includes(query.toLowerCase()) ||
          product.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
        )
      }));
      setProductGroups(filteredGroups);
    } else {
      // Reload all products
      await loadProductsForPieces();
    }
  };

  const handleAddToWishlist = (productId: string) => {
    toast({
      title: "Added to Wishlist! 💖",
      description: "Item saved to your wishlist for later."
    });
  };

  const handleViewOnMyntra = (productId: string) => {
    toast({
      title: "Opening Myntra...",
      description: "Redirecting to Myntra to view this product."
    });
    // In real implementation, this would open Myntra product page
    window.open(`https://www.myntra.com/products/${productId}`, '_blank');
  };

  const handleExplorePiece = async (piece: string) => {
    setSelectedPiece(piece);
    // Filter to show only products for the selected piece
    const filteredGroups = productGroups.map(group => ({
      ...group,
      products: group.piece.toLowerCase().includes(piece.toLowerCase()) ? group.products : []
    }));
    setProductGroups(filteredGroups);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-myntra-light-gray pt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-myntra-pink mx-auto mb-4"></div>
              <p className="text-gray-600">Loading style details and products...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-myntra-light-gray pt-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/seasonal')}
            className="mb-4 hover:bg-myntra-pink-light"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Seasonal Styling
          </Button>
          
          {styleDetails && (
            <div className="bg-gradient-primary rounded-xl p-8 text-white mb-8">
              <div className="flex items-center gap-4 mb-4">
                <div className="text-6xl">{styleDetails.emoji}</div>
                <div>
                  <h1 className="text-4xl font-bold mb-2">{styleDetails.title}</h1>
                  <p className="text-xl opacity-90">{styleDetails.description}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge className="bg-white/20 text-white border-white/20">
                      {styleDetails.season} Collection
                    </Badge>
                    <Badge className="bg-white/20 text-white border-white/20">
                      {styleDetails.occasion}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Style Pieces */}
        {styleDetails && (
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Style Essentials</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {styleDetails.defaultPieces.map((piece, index) => (
                <Button
                  key={index}
                  variant={selectedPiece === piece ? "default" : "outline"}
                  onClick={() => handleExplorePiece(piece)}
                  className={`p-4 h-auto flex flex-col items-center gap-2 ${
                    selectedPiece === piece 
                      ? "bg-myntra-pink text-white" 
                      : "border-myntra-pink text-myntra-pink hover:bg-myntra-pink-light"
                  }`}
                >
                  <div className="w-8 h-8 bg-myntra-pink-light rounded-full flex items-center justify-center">
                    <span className="text-myntra-pink font-bold text-sm">{index + 1}</span>
                  </div>
                  <span className="text-sm font-medium capitalize text-center">{piece}</span>
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Search Bar */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 mb-8">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                type="text"
                placeholder="Search for specific products..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-12 h-12 border-2 border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:border-myntra-pink transition-all duration-200"
              />
            </div>
            {selectedPiece && (
              <Badge className="bg-myntra-pink-light text-myntra-pink border-myntra-pink/20">
                Showing: {selectedPiece}
              </Badge>
            )}
          </div>
        </div>

        {/* Products by Piece */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Product Options</h2>
          
          {productGroups.length === 0 || productGroups.every(group => group.products.length === 0) ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <Search className="h-12 w-12 mx-auto" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No products found</h3>
              <p className="text-gray-600 mb-4">Try adjusting your search terms</p>
              <Button onClick={() => {
                setSearchQuery("");
                setSelectedPiece("");
                loadProductsForPieces();
              }}>
                Clear Search
              </Button>
            </div>
          ) : (
            <div className="space-y-12">
              {productGroups.map((group) => (
                group.products.length > 0 && (
                  <div key={group.piece} className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                    <div className="flex items-center gap-3 mb-6">
                      <h3 className="text-xl font-bold text-gray-900 capitalize">{group.piece}</h3>
                      <Badge className="bg-myntra-pink-light text-myntra-pink border-myntra-pink/20">
                        {group.products.length} options
                      </Badge>
                    </div>
                    
                    {group.isLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-myntra-pink"></div>
                        <span className="ml-3 text-gray-600">Loading products...</span>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {group.products.map((product) => (
                          <div
                            key={product.id}
                            className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 overflow-hidden border border-gray-100 group"
                          >
                            <div className="relative">
                              <img
                                src={product.image}
                                alt={product.name}
                                className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-300"
                              />
                              {product.discount && (
                                <Badge className="absolute top-2 left-2 bg-red-500 text-white border-0">
                                  -{product.discount}%
                                </Badge>
                              )}
                              <Button
                                size="sm"
                                variant="ghost"
                                className="absolute top-2 right-2 bg-white/80 hover:bg-white opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => handleAddToWishlist(product.id)}
                              >
                                <Heart className="h-4 w-4" />
                              </Button>
                            </div>
                            
                            <div className="p-4">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-gray-500">{product.brand}</span>
                                {product.rating && (
                                  <div className="flex items-center gap-1">
                                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                    <span className="text-xs text-gray-600">{product.rating}</span>
                                  </div>
                                )}
                              </div>
                              
                              <h4 className="font-semibold text-gray-900 mb-2 line-clamp-2">{product.name}</h4>
                              
                              <div className="flex items-center gap-2 mb-3">
                                <span className="text-lg font-bold text-myntra-pink">₹{product.price.toLocaleString()}</span>
                                {product.originalPrice && (
                                  <span className="text-sm text-gray-500 line-through">
                                    ₹{product.originalPrice.toLocaleString()}
                                  </span>
                                )}
                              </div>
                              
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="flex-1 border-myntra-pink text-myntra-pink hover:bg-myntra-pink-light"
                                  onClick={() => handleAddToWishlist(product.id)}
                                >
                                  <Heart className="h-4 w-4 mr-1" />
                                  Wishlist
                                </Button>
                                <Button
                                  variant="myntra"
                                  size="sm"
                                  className="flex-1"
                                  onClick={() => handleViewOnMyntra(product.id)}
                                >
                                  <ExternalLink className="h-4 w-4 mr-1" />
                                  View
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExploreStyle;