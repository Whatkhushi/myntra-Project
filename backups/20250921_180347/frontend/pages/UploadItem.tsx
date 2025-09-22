import React, { useState, useRef } from "react";
import { Camera, Upload, Image as ImageIcon, CheckCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import GamificationNotification from "@/components/GamificationNotification";
import { mockAITagging, updateUserStats, getRandomGenZMessage, getNextLevelProgress, ItemTags } from "@/data/gamification";

interface ClothingItem {
  id: string;
  image: string;
  category: string;
  name?: string;
  dateAdded: string;
  tags?: ItemTags;
}

const CATEGORIES = [
  { name: "Tops", value: "tops", color: "bg-category-tops", icon: "👔" },
  { name: "Bottoms", value: "bottoms", color: "bg-category-bottoms", icon: "👖" },
  { name: "Shoes", value: "shoes", color: "bg-category-shoes", icon: "👟" },
  { name: "Accessories", value: "accessories", color: "bg-category-accessories", icon: "👜" },
  { name: "Dresses", value: "dresses", color: "bg-category-dresses", icon: "👗" },
];

const UploadItem = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [itemName, setItemName] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [showGamification, setShowGamification] = useState(false);
  const [gamificationData, setGamificationData] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const convertToJPG = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        
        if (ctx) {
          // Fill with white background for transparency
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0);
          
          canvas.toBlob((blob) => {
            if (blob) {
              const reader = new FileReader();
              reader.onload = () => resolve(reader.result as string);
              reader.onerror = reject;
              reader.readAsDataURL(blob);
            } else {
              reject(new Error('Failed to convert image'));
            }
          }, 'image/jpeg', 0.9);
        } else {
          reject(new Error('Canvas context not available'));
        }
      };
      
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  };

  const handleFileSelect = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsUploading(true);
      const convertedImage = await convertToJPG(file);
      setSelectedImage(convertedImage);
      toast({
        title: "Image uploaded successfully!",
        description: "Now select a category for your item.",
      });
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "There was an error processing your image.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const saveToCloset = async () => {
    if (!selectedImage || !selectedCategory) {
      toast({
        title: "Missing information",
        description: "Please upload an image and select a category.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsUploading(true);

      // Convert data URL to File object for backend
      const response = await fetch(selectedImage);
      const blob = await response.blob();
      const file = new File([blob], 'wardrobe-item.jpg', { type: 'image/jpeg' });

      // Create FormData for backend
      const formData = new FormData();
      formData.append('image', file);
      formData.append('category', selectedCategory);

      // Send to Flask backend
      const backendResponse = await fetch('http://localhost:5000/api/wardrobe/upload', {
        method: 'POST',
        body: formData,
      });

      if (!backendResponse.ok) {
        const errorData = await backendResponse.json();
        throw new Error(errorData.error || 'Failed to save item');
      }

      const savedItem = await backendResponse.json();

      // Generate AI tags for frontend display
      const aiTags = mockAITagging(selectedCategory);

      // Don't save to localStorage since we're using backend as primary storage
      // The item will be loaded from backend when the app refreshes

      // Update gamification stats
      const { newStats, newAchievements, pointsEarned } = await updateUserStats(selectedCategory);
      const { level } = getNextLevelProgress(newStats.closetPoints);
      const genZMessage = getRandomGenZMessage();

      // Show gamification notification
      setGamificationData({
        pointsEarned,
        newAchievements,
        genZMessage,
        currentLevel: level,
        streakCount: newStats.streak
      });
      setShowGamification(true);

      toast({
        title: "Item saved successfully!",
        description: "Your wardrobe item has been added to your collection.",
      });

      // Reset form
      setSelectedImage(null);
      setSelectedCategory("");
      setItemName("");

    } catch (error) {
      console.error('Error saving item:', error);
      toast({
        title: "Failed to save item",
        description: error instanceof Error ? error.message : "There was an error saving your item. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <>
      <GamificationNotification
        isOpen={showGamification}
        onClose={() => setShowGamification(false)}
        pointsEarned={gamificationData?.pointsEarned || 0}
        newAchievements={gamificationData?.newAchievements || []}
        genZMessage={gamificationData?.genZMessage || ""}
        currentLevel={gamificationData?.currentLevel || 1}
        streakCount={gamificationData?.streakCount || 0}
      />
      
      <div className="min-h-screen bg-gray-50 pt-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10">
          <Link to="/" className="inline-flex items-center text-gray-600 hover:text-myntra-pink mb-6 transition-colors group">
            <ArrowLeft className="h-5 w-5 mr-2 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Back to Wardrobe</span>
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Add New Item</h1>
          <p className="text-lg text-gray-600">Upload photos of your clothing to build your digital wardrobe collection</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-10">
          {/* Upload Section */}
          <div className="space-y-8">
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Upload Photo</h2>
              
              {!selectedImage ? (
                <div
                  className={`
                    border-3 border-dashed rounded-xl p-12 text-center transition-all duration-300 cursor-pointer
                    ${dragActive 
                      ? 'border-myntra-pink bg-myntra-pink-light shadow-lg transform scale-105' 
                      : 'border-gray-300 hover:border-myntra-pink hover:bg-myntra-pink-light/30 hover:shadow-md'
                    }
                  `}
                  onDrop={handleDrop}
                  onDragOver={(e) => e.preventDefault()}
                  onDragEnter={() => setDragActive(true)}
                  onDragLeave={() => setDragActive(false)}
                >
                  <div className="w-20 h-20 bg-myntra-pink-light rounded-full flex items-center justify-center mx-auto mb-6">
                    <ImageIcon className="h-10 w-10 text-myntra-pink" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    Drop your image here, or click to browse
                  </h3>
                  <p className="text-gray-600 mb-8 text-base">Support for JPG, PNG, WebP files up to 10MB</p>
                  
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button
                      variant="myntra"
                      size="lg"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                      className="px-8 py-3 font-semibold"
                    >
                      <Upload className="h-5 w-5 mr-2" />
                      Browse Files
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => cameraInputRef.current?.click()}
                      disabled={isUploading}
                      className="border-2 border-myntra-pink text-myntra-pink hover:bg-myntra-pink-light px-8 py-3 font-semibold"
                    >
                      <Camera className="h-5 w-5 mr-2" />
                      Take Photo
                    </Button>
                  </div>
                  
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileInput}
                    className="hidden"
                  />
                  
                  <input
                    ref={cameraInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleFileInput}
                    className="hidden"
                  />
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="relative rounded-xl overflow-hidden bg-gray-100 shadow-inner">
                    <img
                      src={selectedImage}
                      alt="Selected item"
                      className="w-full h-80 object-cover"
                    />
                    <div className="absolute top-4 right-4">
                      <Badge className="bg-green-500 text-white px-3 py-2 font-semibold shadow-lg">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Uploaded Successfully
                      </Badge>
                    </div>
                  </div>
                  
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => setSelectedImage(null)}
                    className="w-full border-2 border-gray-300 hover:border-myntra-pink hover:text-myntra-pink font-semibold py-3"
                  >
                    Upload Different Image
                  </Button>
                </div>
              )}
            </div>

            {/* Item Name */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8">
              <Label htmlFor="itemName" className="text-lg font-bold text-gray-900 mb-4 block">
                Item Name (Optional)
              </Label>
              <Input
                id="itemName"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                placeholder="e.g., Blue Denim Jacket, Red Sneakers..."
                className="h-12 text-base border-2 border-gray-200 focus:border-myntra-pink rounded-lg"
              />
            </div>
          </div>

          {/* Category Selection */}
          <div className="space-y-8">
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Select Category</h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {CATEGORIES.map((category) => (
                  <button
                    key={category.value}
                    onClick={() => setSelectedCategory(category.value)}
                    className={`
                      p-6 rounded-xl border-3 transition-all duration-300 text-left hover:scale-105 hover:shadow-lg
                      ${selectedCategory === category.value
                        ? 'border-myntra-pink bg-myntra-pink-light shadow-lg transform scale-105'
                        : 'border-gray-200 hover:border-myntra-pink hover:bg-myntra-pink-light/30'
                      }
                    `}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="text-3xl bg-white rounded-lg p-2 shadow-sm">
                        {category.icon}
                      </div>
                      <div className="flex-1">
                        <span className="font-bold text-gray-900 block text-lg">
                          {category.name}
                        </span>
                        {selectedCategory === category.value && (
                          <div className="flex items-center mt-2">
                            <CheckCircle className="h-5 w-5 text-myntra-pink mr-2" />
                            <span className="text-myntra-pink font-semibold text-sm">Selected</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Save Button */}
            {selectedImage && selectedCategory && (
              <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8">
                <Button
                  onClick={saveToCloset}
                  variant="myntra"
                  size="lg"
                  disabled={isUploading}
                  className="w-full py-4 text-xl font-bold shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUploading ? (
                    <>
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                      Saving to Backend...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-6 w-6 mr-3" />
                      Save to My Closet
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default UploadItem;