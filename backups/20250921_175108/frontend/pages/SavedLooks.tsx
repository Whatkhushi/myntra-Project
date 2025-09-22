import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, ShoppingBag, Share2, Trash2, Calendar, Tag, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import Lookboard from '@/components/Lookboard';

interface SavedLook {
  id: string;
  response: any;
  images: any[];
  shopUrl: string;
  savedAt: string;
  title: string;
}

const SavedLooks: React.FC = () => {
  const navigate = useNavigate();
  const [savedLooks, setSavedLooks] = useState<SavedLook[]>([]);
  const [filteredLooks, setFilteredLooks] = useState<SavedLook[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOccasion, setSelectedOccasion] = useState('all');

  useEffect(() => {
    loadSavedLooks();
  }, []);

  useEffect(() => {
    filterLooks();
  }, [savedLooks, searchTerm, selectedOccasion]);

  const loadSavedLooks = () => {
    const saved = JSON.parse(localStorage.getItem('savedLooks') || '[]');
    setSavedLooks(saved);
  };

  const filterLooks = () => {
    let filtered = savedLooks;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(look => 
        look.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        look.response.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        look.response.styleKeywords.some((keyword: string) => 
          keyword.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Filter by occasion
    if (selectedOccasion !== 'all') {
      filtered = filtered.filter(look => 
        look.response.occasion.toLowerCase() === selectedOccasion.toLowerCase()
      );
    }

    setFilteredLooks(filtered);
  };

  const deleteLook = (lookId: string) => {
    const updatedLooks = savedLooks.filter(look => look.id !== lookId);
    setSavedLooks(updatedLooks);
    localStorage.setItem('savedLooks', JSON.stringify(updatedLooks));
    
    toast({
      title: "Look deleted",
      description: "The look has been removed from your collection"
    });
  };

  const shareLook = async (look: SavedLook) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: look.title,
          text: look.response.description,
          url: window.location.href
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      navigator.clipboard.writeText(`${look.title}: ${look.response.description}`);
      toast({
        title: "Link copied! 📋",
        description: "Look details copied to clipboard"
      });
    }
  };

  const getUniqueOccasions = () => {
    const occasions = savedLooks.map(look => look.response.occasion);
    return ['all', ...Array.from(new Set(occasions))];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50/30 to-purple-50/20 pt-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="outline"
              onClick={() => navigate(-1)}
              className="border-myntra-pink/30 text-myntra-pink hover:bg-myntra-pink hover:text-white"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-myntra-dark flex items-center gap-3">
                <div className="p-3 bg-gradient-to-r from-myntra-pink to-pink-600 rounded-xl">
                  <Heart className="h-8 w-8 text-white" />
                </div>
                My Saved Looks
              </h1>
              <p className="text-lg text-gray-600 mt-2">
                Your personal fashion inspiration collection
              </p>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search your saved looks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="border-2 border-gray-200 focus:border-myntra-pink rounded-lg"
                />
              </div>
              <div className="flex gap-2">
                <select
                  value={selectedOccasion}
                  onChange={(e) => setSelectedOccasion(e.target.value)}
                  className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-myntra-pink focus:outline-none"
                >
                  {getUniqueOccasions().map(occasion => (
                    <option key={occasion} value={occasion}>
                      {occasion === 'all' ? 'All Occasions' : occasion}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl p-6 text-center shadow-lg border border-gray-100">
            <div className="text-3xl font-bold text-myntra-pink mb-2">{savedLooks.length}</div>
            <div className="text-sm text-gray-600">Total Saved Looks</div>
          </div>
          <div className="bg-white rounded-xl p-6 text-center shadow-lg border border-gray-100">
            <div className="text-3xl font-bold text-myntra-pink mb-2">{filteredLooks.length}</div>
            <div className="text-sm text-gray-600">Filtered Results</div>
          </div>
          <div className="bg-white rounded-xl p-6 text-center shadow-lg border border-gray-100">
            <div className="text-3xl font-bold text-myntra-pink mb-2">{getUniqueOccasions().length - 1}</div>
            <div className="text-sm text-gray-600">Different Occasions</div>
          </div>
        </div>

        {/* Saved Looks Grid */}
        {filteredLooks.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              {savedLooks.length === 0 ? 'No saved looks yet' : 'No looks match your search'}
            </h3>
            <p className="text-gray-500 mb-6">
              {savedLooks.length === 0 
                ? 'Start saving looks from the AI Stylist Chat to build your collection!'
                : 'Try adjusting your search terms or filters'
              }
            </p>
            {savedLooks.length === 0 && (
              <Button
                onClick={() => navigate('/styler-chat')}
                className="bg-gradient-to-r from-myntra-pink to-pink-600 hover:from-pink-600 hover:to-myntra-pink text-white"
              >
                Start Creating Looks
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredLooks.map((look) => (
              <div
                key={look.id}
                className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                {/* Look Preview */}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{look.title}</h3>
                      <p className="text-sm text-gray-500 flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Saved on {formatDate(look.savedAt)}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => shareLook(look)}
                        className="border-gray-300 text-gray-600 hover:bg-gray-50"
                      >
                        <Share2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteLook(look.id)}
                        className="border-red-300 text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Style Keywords */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {look.response.styleKeywords.slice(0, 3).map((keyword: string, index: number) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="bg-myntra-pink/10 text-myntra-pink border-myntra-pink/20 text-xs"
                      >
                        {keyword}
                      </Badge>
                    ))}
                    {look.response.styleKeywords.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{look.response.styleKeywords.length - 3} more
                      </Badge>
                    )}
                  </div>

                  {/* Description Preview */}
                  <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                    {look.response.description}
                  </p>

                  {/* Image Preview */}
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    {look.images.slice(0, 4).map((image, index) => (
                      <div
                        key={index}
                        className="aspect-square bg-gray-100 rounded-lg overflow-hidden"
                      >
                        <img
                          src={image.url}
                          alt={image.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = '/placeholder.svg';
                          }}
                        />
                      </div>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      onClick={() => window.open(look.shopUrl, '_blank')}
                      className="flex-1 bg-gradient-to-r from-myntra-pink to-pink-600 hover:from-pink-600 hover:to-myntra-pink text-white text-sm"
                    >
                      <ShoppingBag className="h-4 w-4 mr-2" />
                      Shop Look
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        // Navigate to detailed view or expand
                        console.log('View details:', look.id);
                      }}
                      className="border-myntra-pink text-myntra-pink hover:bg-myntra-pink hover:text-white text-sm"
                    >
                      View
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SavedLooks;
