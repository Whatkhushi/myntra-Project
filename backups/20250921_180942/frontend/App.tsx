import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import ClosetGrid from "./pages/ClosetGrid";
import UploadItem from "./pages/UploadItem";
import OutfitRecommendations from "./pages/OutfitRecommendations";
import SeasonalStyling from "./pages/SeasonalStyling";
import StylerChat from "./pages/StylerChat";
import StyleChallenges from "./pages/StyleChallenges";
import DailyChallenges from "./pages/DailyChallenges";
import LeaderboardPage from "./pages/LeaderboardPage";
import FashionCard from "./pages/FashionCard";
import ExploreStyle from "./pages/ExploreStyle";
import ProductOptions from "./pages/ProductOptions";
import WishlistPage from "./pages/WishlistPage";
import SavedLooks from "./pages/SavedLooks";
import NotFound from "./pages/NotFound";
import { GlobalStateProvider } from "./contexts/GlobalStateContext";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <GlobalStateProvider>
        <BrowserRouter>
          <div className="bg-myntra-light-gray min-h-screen">
            <Navbar />
            <Routes>
            <Route path="/" element={<ClosetGrid />} />
            <Route path="/wardrobe" element={<ClosetGrid />} />
            <Route path="/upload" element={<UploadItem />} />
            <Route path="/recommendations" element={<OutfitRecommendations />} />
            <Route path="/seasonal" element={<SeasonalStyling />} />
            <Route path="/chat" element={<StylerChat />} />
            <Route path="/styler-chat" element={<StylerChat />} />
            <Route path="/challenges" element={<StyleChallenges />} />
            <Route path="/daily-challenges" element={<DailyChallenges />} />
            <Route path="/leaderboard" element={<LeaderboardPage />} />
            <Route path="/fashion-card" element={<FashionCard />} />
            <Route path="/explore-style/:styleName" element={<ExploreStyle />} />
            <Route path="/explore/:styleId" element={<ExploreStyle />} />
            <Route path="/products" element={<ProductOptions />} />
            <Route path="/products/:lookType" element={<ProductOptions />} />
            <Route path="/wishlist" element={<WishlistPage />} />
            <Route path="/saved-looks" element={<SavedLooks />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </BrowserRouter>
      </GlobalStateProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
