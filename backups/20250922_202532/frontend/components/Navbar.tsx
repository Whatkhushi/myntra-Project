import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Search, User, Heart, ShoppingBag, Menu, X, Sparkles, Calendar, MessageCircle, Trophy, Shirt } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useGlobalState } from "@/contexts/GlobalStateContext";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const { getWishlistCount } = useGlobalState();

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center">
              <span className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent hover:scale-105 transition-transform duration-200">
                ClosetTwin
              </span>
            </Link>
          </div>

          {/* Desktop Search Bar */}
          <div className="hidden md:flex flex-1 max-w-2xl mx-12">
            <div className="relative w-full">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                type="text"
                placeholder="Search for products, brands and more"
                className="pl-12 h-12 border-2 border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:border-myntra-pink transition-all duration-200 text-base placeholder:text-gray-400"
              />
            </div>
          </div>

          {/* Desktop Icons */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/fashion-card">
              <Button 
                variant="ghost" 
                size="sm" 
                className={`flex flex-col items-center p-2 h-auto hover:bg-myntra-pink-light rounded-lg transition-colors group ${
                  location.pathname === '/fashion-card' ? 'bg-myntra-pink-light text-myntra-pink' : ''
                }`}
              >
                <Sparkles className={`h-5 w-5 transition-colors ${
                  location.pathname === '/fashion-card' ? 'text-myntra-pink' : 'text-gray-600 group-hover:text-myntra-pink'
                }`} />
                <span className={`text-xs mt-1 font-medium transition-colors ${
                  location.pathname === '/fashion-card' ? 'text-myntra-pink' : 'text-gray-500 group-hover:text-myntra-pink'
                }`}>Style Card</span>
              </Button>
            </Link>
            <Link to="/recommendations">
              <Button 
                variant="ghost" 
                size="sm" 
                className={`flex flex-col items-center p-2 h-auto hover:bg-myntra-pink-light rounded-lg transition-colors group ${
                  location.pathname === '/recommendations' ? 'bg-myntra-pink-light text-myntra-pink' : ''
                }`}
              >
                <Sparkles className={`h-5 w-5 transition-colors ${
                  location.pathname === '/recommendations' ? 'text-myntra-pink' : 'text-gray-600 group-hover:text-myntra-pink'
                }`} />
                <span className={`text-xs mt-1 font-medium transition-colors ${
                  location.pathname === '/recommendations' ? 'text-myntra-pink' : 'text-gray-500 group-hover:text-myntra-pink'
                }`}>Outfits</span>
              </Button>
            </Link>
            <Link to="/seasonal">
              <Button 
                variant="ghost" 
                size="sm" 
                className={`flex flex-col items-center p-2 h-auto hover:bg-myntra-pink-light rounded-lg transition-colors group ${
                  location.pathname === '/seasonal' ? 'bg-myntra-pink-light text-myntra-pink' : ''
                }`}
              >
                <Calendar className={`h-5 w-5 transition-colors ${
                  location.pathname === '/seasonal' ? 'text-myntra-pink' : 'text-gray-600 group-hover:text-myntra-pink'
                }`} />
                <span className={`text-xs mt-1 font-medium transition-colors ${
                  location.pathname === '/seasonal' ? 'text-myntra-pink' : 'text-gray-500 group-hover:text-myntra-pink'
                }`}>Seasonal</span>
              </Button>
            </Link>
            <Link to="/chat">
              <Button 
                variant="ghost" 
                size="sm" 
                className={`flex flex-col items-center p-2 h-auto hover:bg-myntra-pink-light rounded-lg transition-colors group ${
                  location.pathname === '/chat' ? 'bg-myntra-pink-light text-myntra-pink' : ''
                }`}
              >
                <MessageCircle className={`h-5 w-5 transition-colors ${
                  location.pathname === '/chat' ? 'text-myntra-pink' : 'text-gray-600 group-hover:text-myntra-pink'
                }`} />
                <span className={`text-xs mt-1 font-medium transition-colors ${
                  location.pathname === '/chat' ? 'text-myntra-pink' : 'text-gray-500 group-hover:text-myntra-pink'
                }`}>Stylist</span>
              </Button>
            </Link>
            <Link to="/products">
              <Button 
                variant="ghost" 
                size="sm" 
                className={`flex flex-col items-center p-2 h-auto hover:bg-myntra-pink-light rounded-lg transition-colors group ${
                  location.pathname.startsWith('/products') ? 'bg-myntra-pink-light text-myntra-pink' : ''
                }`}
              >
                <ShoppingBag className={`h-5 w-5 transition-colors ${
                  location.pathname.startsWith('/products') ? 'text-myntra-pink' : 'text-gray-600 group-hover:text-myntra-pink'
                }`} />
                <span className={`text-xs mt-1 font-medium transition-colors ${
                  location.pathname.startsWith('/products') ? 'text-myntra-pink' : 'text-gray-500 group-hover:text-myntra-pink'
                }`}>Shop</span>
              </Button>
            </Link>
            <Link to="/challenges">
              <Button 
                variant="ghost" 
                size="sm" 
                className={`flex flex-col items-center p-2 h-auto hover:bg-myntra-pink-light rounded-lg transition-colors group ${
                  location.pathname === '/challenges' ? 'bg-myntra-pink-light text-myntra-pink' : ''
                }`}
              >
                <Trophy className={`h-5 w-5 transition-colors ${
                  location.pathname === '/challenges' ? 'text-myntra-pink' : 'text-gray-600 group-hover:text-myntra-pink'
                }`} />
                <span className={`text-xs mt-1 font-medium transition-colors ${
                  location.pathname === '/challenges' ? 'text-myntra-pink' : 'text-gray-500 group-hover:text-myntra-pink'
                }`}>Challenges</span>
              </Button>
            </Link>
            <Link to="/wardrobe">
              <Button 
                variant="ghost" 
                size="sm" 
                className={`flex flex-col items-center p-2 h-auto hover:bg-myntra-pink-light rounded-lg transition-colors group ${
                  location.pathname === '/wardrobe' || location.pathname === '/' ? 'bg-myntra-pink-light text-myntra-pink' : ''
                }`}
              >
                <Shirt className={`h-5 w-5 transition-colors ${
                  location.pathname === '/wardrobe' || location.pathname === '/' ? 'text-myntra-pink' : 'text-gray-600 group-hover:text-myntra-pink'
                }`} />
                <span className={`text-xs mt-1 font-medium transition-colors ${
                  location.pathname === '/wardrobe' || location.pathname === '/' ? 'text-myntra-pink' : 'text-gray-500 group-hover:text-myntra-pink'
                }`}>Wardrobe</span>
              </Button>
            </Link>
            <Link to="/upload">
              <Button 
                variant="ghost" 
                size="sm" 
                className={`flex flex-col items-center p-2 h-auto hover:bg-myntra-pink-light rounded-lg transition-colors group ${
                  location.pathname === '/upload' ? 'bg-myntra-pink-light text-myntra-pink' : ''
                }`}
              >
                <ShoppingBag className={`h-5 w-5 transition-colors ${
                  location.pathname === '/upload' ? 'text-myntra-pink' : 'text-gray-600 group-hover:text-myntra-pink'
                }`} />
                <span className={`text-xs mt-1 font-medium transition-colors ${
                  location.pathname === '/upload' ? 'text-myntra-pink' : 'text-gray-500 group-hover:text-myntra-pink'
                }`}>Upload</span>
              </Button>
            </Link>
            <Link to="/wishlist">
              <Button 
                variant="ghost" 
                size="sm" 
                className={`flex flex-col items-center p-2 h-auto hover:bg-myntra-pink-light rounded-lg transition-colors group ${
                  location.pathname === '/wishlist' ? 'bg-myntra-pink-light text-myntra-pink' : ''
                }`}
              >
                <div className="relative">
                  <Heart className={`h-5 w-5 transition-colors ${
                    location.pathname === '/wishlist' ? 'text-myntra-pink' : 'text-gray-600 group-hover:text-myntra-pink'
                  }`} />
                  {getWishlistCount() > 0 && (
                    <span className="absolute -top-2 -right-2 bg-myntra-pink text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                      {getWishlistCount()}
                    </span>
                  )}
                </div>
                <span className={`text-xs mt-1 font-medium transition-colors ${
                  location.pathname === '/wishlist' ? 'text-myntra-pink' : 'text-gray-500 group-hover:text-myntra-pink'
                }`}>Wishlist</span>
              </Button>
            </Link>
            <Button variant="ghost" size="sm" className="flex flex-col items-center p-2 h-auto hover:bg-myntra-pink-light rounded-lg transition-colors group">
              <User className="h-5 w-5 text-gray-600 group-hover:text-myntra-pink transition-colors" />
              <span className="text-xs text-gray-500 mt-1 font-medium group-hover:text-myntra-pink transition-colors">Profile</span>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6 text-myntra-dark" />
              ) : (
                <Menu className="h-6 w-6 text-myntra-dark" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="md:hidden pb-4 pt-2">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              type="text"
              placeholder="Search for products, brands and more"
              className="pl-12 h-12 border-2 border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:border-myntra-pink transition-all duration-200 text-base placeholder:text-gray-400"
            />
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-100 bg-white shadow-lg">
            <div className="px-4 pt-4 pb-6 space-y-2">
              <Link to="/" className="block" onClick={() => setIsMenuOpen(false)}>
                <Button variant="ghost" className="w-full justify-start h-12 text-base hover:bg-myntra-pink-light hover:text-myntra-pink rounded-lg">
                  <ShoppingBag className="h-5 w-5 mr-3" />
                  <span>My Wardrobe</span>
                </Button>
              </Link>
              <Link to="/fashion-card" className="block" onClick={() => setIsMenuOpen(false)}>
                <Button variant="ghost" className="w-full justify-start h-12 text-base hover:bg-myntra-pink-light hover:text-myntra-pink rounded-lg">
                  <Sparkles className="h-5 w-5 mr-3" />
                  <span>Fashion Card ✨</span>
                </Button>
              </Link>
              <Link to="/recommendations" className="block" onClick={() => setIsMenuOpen(false)}>
                <Button variant="ghost" className="w-full justify-start h-12 text-base hover:bg-myntra-pink-light hover:text-myntra-pink rounded-lg">
                  <Sparkles className="h-5 w-5 mr-3" />
                  <span>AI Outfits</span>
                </Button>
              </Link>
              <Link to="/seasonal" className="block" onClick={() => setIsMenuOpen(false)}>
                <Button variant="ghost" className="w-full justify-start h-12 text-base hover:bg-myntra-pink-light hover:text-myntra-pink rounded-lg">
                  <Calendar className="h-5 w-5 mr-3" />
                  <span>Seasonal Styling</span>
                </Button>
              </Link>
              <Link to="/chat" className="block" onClick={() => setIsMenuOpen(false)}>
                <Button variant="ghost" className="w-full justify-start h-12 text-base hover:bg-myntra-pink-light hover:text-myntra-pink rounded-lg">
                  <MessageCircle className="h-5 w-5 mr-3" />
                  <span>AI Stylist Chat</span>
                </Button>
              </Link>
              <Link to="/products" className="block" onClick={() => setIsMenuOpen(false)}>
                <Button variant="ghost" className="w-full justify-start h-12 text-base hover:bg-myntra-pink-light hover:text-myntra-pink rounded-lg">
                  <ShoppingBag className="h-5 w-5 mr-3" />
                  <span>Shop</span>
                </Button>
              </Link>
              <Link to="/challenges" className="block" onClick={() => setIsMenuOpen(false)}>
                <Button variant="ghost" className="w-full justify-start h-12 text-base hover:bg-myntra-pink-light hover:text-myntra-pink rounded-lg">
                  <Trophy className="h-5 w-5 mr-3" />
                  <span>Style Challenges</span>
                </Button>
              </Link>
              <Link to="/wardrobe" className="block" onClick={() => setIsMenuOpen(false)}>
                <Button variant="ghost" className="w-full justify-start h-12 text-base hover:bg-myntra-pink-light hover:text-myntra-pink rounded-lg">
                  <Shirt className="h-5 w-5 mr-3" />
                  <span>My Wardrobe</span>
                </Button>
              </Link>
              <Link to="/upload" className="block" onClick={() => setIsMenuOpen(false)}>
                <Button variant="ghost" className="w-full justify-start h-12 text-base hover:bg-myntra-pink-light hover:text-myntra-pink rounded-lg">
                  <ShoppingBag className="h-5 w-5 mr-3" />
                  <span>Upload Item</span>
                </Button>
              </Link>
              <Link to="/wishlist" className="block" onClick={() => setIsMenuOpen(false)}>
                <Button variant="ghost" className="w-full justify-start h-12 text-base hover:bg-myntra-pink-light hover:text-myntra-pink rounded-lg">
                  <Heart className="h-5 w-5 mr-3" />
                  <span>Wishlist</span>
                </Button>
              </Link>
              <Button variant="ghost" className="w-full justify-start h-12 text-base hover:bg-myntra-pink-light hover:text-myntra-pink rounded-lg">
                <User className="h-5 w-5 mr-3" />
                <span>Profile</span>
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;