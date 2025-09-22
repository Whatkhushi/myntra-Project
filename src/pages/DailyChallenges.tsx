import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { 
  Trophy, Flame, Star, Target, Zap, Crown, Calendar, 
  CheckCircle, Play, Sparkles, Award, TrendingUp, ArrowLeft,
  Shirt
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/hooks/use-toast";
import { 
  getTodaysChallenges, 
  getUserProgress, 
  updateUserProgress, 
  calculateDynamicXP,
  forceRefreshChallenges,
  BADGES 
} from "@/data/dailyChallenges";
import ConfettiAnimation from "@/components/ConfettiAnimation";

interface DailyChallenge {
  id: string;
  title: string;
  emoji: string;
  description: string;
  instructions: string;
  difficulty: "Easy" | "Medium" | "Hard";
  category: "Style" | "Creativity" | "Social" | "Learning" | "Fun";
  points: number;
  xpReward: number;
  streakBonus: number;
  isCompleted: boolean;
  completedAt?: string;
  progress: number;
  maxProgress: number;
  type: "task" | "streak" | "creative" | "social" | "learning";
  requirements?: string[];
  rewards?: string[];
}

const DailyChallenges = () => {
  const navigate = useNavigate();
  const [challenges, setChallenges] = useState<DailyChallenge[]>([]);
  const [userProgress, setUserProgress] = useState(getUserProgress());
  const [showConfetti, setShowConfetti] = useState(false);
  const [completedChallenge, setCompletedChallenge] = useState<string | null>(null);
  const [selectedChallenge, setSelectedChallenge] = useState<DailyChallenge | null>(null);
  const [challengeAnswers, setChallengeAnswers] = useState<{[key: string]: any}>({});
  const [currentStep, setCurrentStep] = useState(0);
  const [showSummary, setShowSummary] = useState(false);
  const [summaryData, setSummaryData] = useState<{ title: string; earnedXP: number } | null>(null);

  const todayKey = new Date().toDateString();
  const getTodayXP = () => parseInt(localStorage.getItem(`todayXP:${todayKey}`) || "0", 10) || 0;
  const [todayXP, setTodayXP] = useState<number>(getTodayXP());

  useEffect(() => {
    // Load today's challenges (preserving completion status)
    const todaysChallenges = getTodaysChallenges();
    setChallenges(todaysChallenges);
    setTodayXP(getTodayXP());
    
  }, []);

  // Update user progress when challenges change
  useEffect(() => {
    const updatedProgress = getUserProgress();
    setUserProgress(updatedProgress);
  }, [challenges]);

  const persistChallenges = (updated: DailyChallenge[]) => {
    // Ensure all challenges have proper completion status
    const challengesWithStatus = updated.map(challenge => ({
      ...challenge,
      isCompleted: challenge.isCompleted || false,
      progress: challenge.progress || 0,
      maxProgress: challenge.maxProgress || challenge.requirements?.length || 1,
      completedAt: challenge.completedAt || undefined
    }));
    
    localStorage.setItem('dailyChallenges', JSON.stringify(challengesWithStatus));
    localStorage.setItem('dailyChallengesDate', todayKey);
    
    // Update the challenges state to reflect changes
    setChallenges(challengesWithStatus);
  };

  const handleStartChallenge = (challenge: DailyChallenge) => {
    // Prevent starting already completed challenges
    if (challenge.isCompleted) {
      toast({
        title: "Challenge Already Completed! ✅",
        description: "You've already completed this challenge today. Come back tomorrow for new challenges!",
        duration: 3000
      });
      return;
    }
    
    setSelectedChallenge(challenge);
    setCurrentStep(0);
    setChallengeAnswers({});
    setShowSummary(false);
  };

  const handleBackToChallenges = () => {
    setSelectedChallenge(null);
    setCurrentStep(0);
    setChallengeAnswers({});
    setShowSummary(false);
  };

  const handleAnswer = (questionId: string, answer: any) => {
    setChallengeAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleNextStep = () => {
    if (!selectedChallenge) return;
    const steps = getChallengeSteps(selectedChallenge);
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmitChallenge();
    }
  };

  const handleSubmitChallenge = () => {
    if (!selectedChallenge) return;

    // Check if challenge is already completed (one-time completion)
    if (selectedChallenge.isCompleted) {
      toast({
        title: "Already Completed! ✅",
        description: "You've already completed this challenge today. Come back tomorrow for new challenges!",
        duration: 3000
      });
      return;
    }

    // Calculate performance based on answered questions
    const steps = getChallengeSteps(selectedChallenge);
    const answeredCount = steps.reduce((acc, step: any) => {
      const val = challengeAnswers[step.id];
      if (Array.isArray(val)) return acc + (val.length > 0 ? 1 : 0);
      return acc + (val !== undefined && val !== null && val !== '' ? 1 : 0);
    }, 0);
    
    // Calculate performance ratio (0 to 1)
    const performance = answeredCount / steps.length;
    
    // Calculate dynamic XP based on performance
    const baseXP = calculateDynamicXP(selectedChallenge, performance);
    const streakBonus = userProgress.currentStreak > 0 ? selectedChallenge.streakBonus : 0;
    const totalXP = Math.min(baseXP + streakBonus, selectedChallenge.points); // Ensure we don't exceed max points

    // Update challenge immediately and persist
    const updatedChallenges = challenges.map(c => 
      c.id === selectedChallenge.id 
        ? { ...c, isCompleted: true, completedAt: new Date().toISOString(), progress: c.maxProgress }
        : c
    );
    
    // Update state immediately for UI responsiveness
    setChallenges(updatedChallenges);
    persistChallenges(updatedChallenges);

    // Update today XP and persist
    const newTodayXP = getTodayXP() + totalXP;
    localStorage.setItem(`todayXP:${todayKey}`, String(newTodayXP));
    setTodayXP(newTodayXP);

    // Update user progress immediately
    const newProgress = updateUserProgress(selectedChallenge, totalXP);
    setUserProgress(newProgress);
    
    // Force refresh the leaderboard data by updating localStorage
    localStorage.setItem('userProgress', JSON.stringify(newProgress));
    
    // Dispatch custom event to notify other components of progress update
    window.dispatchEvent(new CustomEvent('userProgressUpdated'));

    // Show confetti immediately
    setCompletedChallenge(selectedChallenge.id);
    setShowConfetti(true);

    // Show success toast immediately
    toast({
      title: "Challenge Completed! 🎉",
      description: `+${totalXP} XP earned! Streak: ${newProgress.currentStreak} days 🔥`,
      duration: 4000
    });

    // Check for new badges and show immediately
    const newBadges = newProgress.badges.filter(badge => !userProgress.badges.includes(badge));
    if (newBadges.length > 0) {
      toast({
        title: "New Badge Unlocked! 🏆",
        description: `You earned ${newBadges.length} new badge${newBadges.length > 1 ? 's' : ''}!`,
        duration: 3000
      });
    }

    // Show summary screen instead of immediate back
    setSummaryData({ title: selectedChallenge.title, earnedXP: totalXP });
    setShowSummary(true);
  };

  const getChallengeSteps = (challenge: DailyChallenge) => {
    // Generate steps based on challenge title/type
    const steps: any[] = [];

    // Fashion challenge flows
    if (challenge.title.includes("Outfit Builder")) {
      steps.push(
        { id: "base-item", type: "selection", question: "Pick a base item (top or bottom)", options: [
          { id: "top", label: "👕 Top (shirt, blouse, tank)", value: "top" },
          { id: "bottom", label: "👖 Bottom (jeans, pants, skirt)", value: "bottom" },
          { id: "dress", label: "👗 Dress", value: "dress" }
        ]},
        { id: "complementary", type: "selection", question: "Add 1 complementary piece", options: [
          { id: "jacket", label: "🧥 Jacket or Cardigan", value: "jacket" },
          { id: "accessories", label: "💍 Jewelry or Scarf", value: "accessories" },
          { id: "shoes", label: "👟 Shoes or Boots", value: "shoes" }
        ]},
        { id: "reflection", type: "text-input", question: "Why do these pieces match well together?", placeholder: "Write your thoughts on why this combination works..." }
      );
    } else if (challenge.title.includes("Color Match")) {
      steps.push(
        { id: "main-color", type: "selection", question: "Select a main color for your outfit", options: [
          { id: "black", label: "⚫ Black", value: "black" },
          { id: "white", label: "⚪ White", value: "white" },
          { id: "blue", label: "🔵 Blue", value: "blue" },
          { id: "red", label: "🔴 Red", value: "red" },
          { id: "green", label: "🟢 Green", value: "green" },
          { id: "pink", label: "🩷 Pink", value: "pink" }
        ]},
        { id: "matching-color", type: "selection", question: "Add a matching or complementary color", options: [
          { id: "neutral", label: "🤍 Neutral (beige, gray, cream)", value: "neutral" },
          { id: "complementary", label: "🌈 Complementary color", value: "complementary" },
          { id: "monochrome", label: "🎨 Same color family", value: "monochrome" }
        ]},
        { id: "accent-color", type: "selection", question: "Choose an accent color", options: [
          { id: "metallic", label: "✨ Metallic (gold, silver)", value: "metallic" },
          { id: "bright", label: "💛 Bright pop of color", value: "bright" },
          { id: "earth", label: "🤎 Earth tone", value: "earth" }
        ]},
        { id: "color-reflection", type: "text-input", question: "How does this color palette work together?", placeholder: "Reflect on the harmony and balance of your color choices..." }
      );
    } else if (challenge.title.includes("Style Challenge")) {
      steps.push(
        { id: "occasion", type: "selection", question: "Choose an event or occasion", options: [
          { id: "casual", label: "😊 Casual (hanging out, errands)", value: "casual" },
          { id: "formal", label: "👔 Formal (work, meeting, event)", value: "formal" },
          { id: "party", label: "🎉 Party (birthday, celebration)", value: "party" },
          { id: "work", label: "💼 Work (office, presentation)", value: "work" }
        ]},
        { id: "outfit-type", type: "selection", question: "What type of outfit fits this occasion?", options: [
          { id: "dress", label: "👗 Dress", value: "dress" },
          { id: "separates", label: "👕👖 Top + Bottom", value: "separates" },
          { id: "suit", label: "👔 Suit or Blazer", value: "suit" },
          { id: "casual", label: "👖 Casual Combo", value: "casual" }
        ]},
        { id: "style-rating", type: "rating", question: "How well does this outfit fit the occasion?", scale: 5 },
        { id: "occasion-reflection", type: "text-input", question: "Why does this outfit work for this occasion?", placeholder: "Explain how your outfit choices match the event..." }
      );
    } else if (challenge.title.includes("Accessory Match")) {
      steps.push(
        { id: "base-outfit", type: "selection", question: "Choose a base outfit", options: [
          { id: "dress", label: "👗 Simple Dress", value: "dress" },
          { id: "jeans-tee", label: "👖👕 Jeans + T-shirt", value: "jeans-tee" },
          { id: "pants-blouse", label: "👔👖 Pants + Blouse", value: "pants-blouse" }
        ]},
        { id: "shoes", type: "selection", question: "Add shoes", options: [
          { id: "heels", label: "👠 Heels", value: "heels" },
          { id: "sneakers", label: "👟 Sneakers", value: "sneakers" },
          { id: "boots", label: "🥾 Boots", value: "boots" },
          { id: "sandals", label: "🩴 Sandals", value: "sandals" }
        ]},
        { id: "bag", type: "selection", question: "Choose a bag", options: [
          { id: "crossbody", label: "👜 Crossbody Bag", value: "crossbody" },
          { id: "tote", label: "🛍️ Tote Bag", value: "tote" },
          { id: "clutch", label: "👛 Clutch", value: "clutch" },
          { id: "backpack", label: "🎒 Backpack", value: "backpack" }
        ]},
        { id: "jewelry", type: "selection", question: "Add one jewelry piece", options: [
          { id: "earrings", label: "💍 Earrings", value: "earrings" },
          { id: "necklace", label: "📿 Necklace", value: "necklace" },
          { id: "bracelet", label: "⌚ Bracelet or Watch", value: "bracelet" },
          { id: "ring", label: "💍 Ring", value: "ring" }
        ]},
        { id: "vibe-change", type: "rating", question: "How much do the accessories change the outfit's vibe?", scale: 5 },
        { id: "balance-reflection", type: "text-input", question: "How do you achieve balance with these accessories?", placeholder: "Reflect on how the accessories work together..." }
      );
    } else if (challenge.title.includes("Capsule Wardrobe Builder")) {
      steps.push(
        { id: "core-tops", type: "multi-selection", question: "Pick 2-3 core tops", options: [
          { id: "white-tee", label: "👕 White T-shirt", value: "white-tee" },
          { id: "blouse", label: "👔 Blouse", value: "blouse" },
          { id: "sweater", label: "🧥 Sweater", value: "sweater" },
          { id: "tank", label: "👕 Tank Top", value: "tank" }
        ]},
        { id: "core-bottoms", type: "multi-selection", question: "Pick 2-3 core bottoms", options: [
          { id: "jeans", label: "👖 Jeans", value: "jeans" },
          { id: "black-pants", label: "👖 Black Pants", value: "black-pants" },
          { id: "skirt", label: "👗 Skirt", value: "skirt" },
          { id: "shorts", label: "🩳 Shorts", value: "shorts" }
        ]},
        { id: "outerwear", type: "selection", question: "Choose 1-2 outerwear pieces", options: [
          { id: "blazer", label: "👔 Blazer", value: "blazer" },
          { id: "cardigan", label: "🧥 Cardigan", value: "cardigan" },
          { id: "jacket", label: "🧥 Jacket", value: "jacket" }
        ]},
        { id: "shoes", type: "multi-selection", question: "Pick 2-3 pairs of shoes", options: [
          { id: "sneakers", label: "👟 Sneakers", value: "sneakers" },
          { id: "heels", label: "👠 Heels", value: "heels" },
          { id: "boots", label: "🥾 Boots", value: "boots" },
          { id: "flats", label: "👞 Flats", value: "flats" }
        ]},
        { id: "outfit-count", type: "rating", question: "How many different outfits can you make?", scale: 10 },
        { id: "versatility-reflection", type: "text-input", question: "Share your reflections on this capsule wardrobe", placeholder: "How versatile are these pieces? What makes them work together?" }
      );
    } else {
      // Default steps for other challenges
      steps.push(
        { id: "general-choice", type: "selection", question: "What would you like to focus on?", options: [
          { id: "personal", label: "Personal growth", value: "personal" },
          { id: "creative", label: "Creative expression", value: "creative" },
          { id: "social", label: "Social connection", value: "social" },
          { id: "learning", label: "Learning something new", value: "learning" }
        ]},
        { id: "confidence", type: "rating", question: "How confident do you feel about this choice?", scale: 5 }
      );
    }

    return steps;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy": return "bg-green-100 text-green-700 border-green-200";
      case "Medium": return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "Hard": return "bg-red-100 text-red-700 border-red-200";
      default: return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Style": return "bg-pink-100 text-pink-700 border-pink-200";
      case "Creativity": return "bg-purple-100 text-purple-700 border-purple-200";
      case "Social": return "bg-blue-100 text-blue-700 border-blue-200";
      case "Learning": return "bg-green-100 text-green-700 border-green-200";
      case "Fun": return "bg-orange-100 text-orange-700 border-orange-200";
      default: return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const completedChallenges = challenges.filter(c => c.isCompleted).length;
  const totalXP = userProgress.totalXP;
  const level = userProgress.level;
  const streak = userProgress.currentStreak;
  
  // Calculate today's progress dynamically
  const todayProgress = challenges.length > 0 ? (completedChallenges / challenges.length) * 100 : 0;
  

  // Summary screen
  if (selectedChallenge && showSummary && summaryData) {
    return (
      <>
        <div className="min-h-screen bg-myntra-light-gray pt-8">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <Button
              variant="outline"
              onClick={() => { setShowSummary(false); handleBackToChallenges(); }}
              className="mb-6"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Challenges
            </Button>

            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8 text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="h-10 w-10 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-myntra-dark mb-2">
                Challenge Completed! 🎉
              </h1>
              <p className="text-gray-600 mb-6">
                {summaryData.title} • You earned <span className="font-bold text-myntra-pink">{summaryData.earnedXP} XP</span>
              </p>
              <Button variant="myntra" onClick={() => { setShowSummary(false); handleBackToChallenges(); }}>
                Continue
              </Button>
            </div>
          </div>
        </div>

        <ConfettiAnimation 
          trigger={showConfetti} 
          onComplete={() => {
            setShowConfetti(false);
            setCompletedChallenge(null);
          }} 
        />
      </>
    );
  }

  // Interactive challenge
  if (selectedChallenge) {
    const steps = getChallengeSteps(selectedChallenge);
    const currentStepData = steps[currentStep];

    return (
      <>
        <div className="min-h-screen bg-myntra-light-gray pt-8">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <Button
              variant="outline"
              onClick={handleBackToChallenges}
              className="mb-6"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Challenges
            </Button>

            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8 mb-8">
              <div className="flex items-start gap-6">
                <div className="p-4 bg-gradient-primary rounded-xl shadow-lg">
                  <span className="text-4xl">{selectedChallenge.emoji}</span>
                </div>
                
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-myntra-dark mb-2">
                    {selectedChallenge.title}
                  </h1>
                  <p className="text-lg text-gray-600 mb-4">
                    {selectedChallenge.description}
                  </p>
                  
                  <div className="flex items-center gap-3">
                    <Badge className="bg-myntra-pink-light text-myntra-pink border-0">
                      <Target className="h-3 w-3 mr-1" />
                      {selectedChallenge.xpReward} XP
                    </Badge>
                    <Badge variant="outline" className="border-gray-300">
                      Step {currentStep + 1} of {steps.length}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8">
              {/* Progress */}
              <div className="mb-6">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Progress</span>
                  <span>Step {currentStep + 1} of {steps.length}</span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-2 bg-myntra-pink rounded-full transition-all" style={{ width: `${((currentStep+1)/steps.length)*100}%` }} />
                </div>
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, x: 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -24 }}
                  transition={{ duration: 0.25 }}
                >
                  <h2 className="text-2xl font-bold text-myntra-dark mb-4 flex items-center gap-2">
                    <Star className="h-6 w-6 text-myntra-pink" />
                    {currentStepData.question}
                  </h2>
                  
                  <div className="mb-8">
                    {currentStepData.type === "selection" && (
                      <div className="space-y-4">
                        {currentStepData.options.map((option: any) => (
                          <button
                            key={option.id}
                            onClick={() => handleAnswer(currentStepData.id, option.value)}
                            className={`w-full p-4 rounded-xl border-2 text-left transition-all duration-300 ${
                              challengeAnswers[currentStepData.id] === option.value
                                ? "border-myntra-pink bg-myntra-pink-light"
                                : "border-gray-200 hover:border-gray-300"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 bg-gradient-to-br from-myntra-pink to-myntra-pink-dark rounded-lg flex items-center justify-center">
                                <Shirt className="h-6 w-6 text-white" />
                              </div>
                              <div>
                                <h3 className="font-semibold text-gray-900">{option.label}</h3>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}

                    {currentStepData.type === "multi-selection" && (
                      <div className="space-y-4">
                        {currentStepData.options.map((option: any) => {
                          const isSelected = challengeAnswers[currentStepData.id]?.includes(option.value);
                          return (
                            <button
                              key={option.id}
                              onClick={() => {
                                const current = challengeAnswers[currentStepData.id] || [];
                                if (isSelected) {
                                  handleAnswer(currentStepData.id, current.filter((v: any) => v !== option.value));
                                } else {
                                  handleAnswer(currentStepData.id, [...current, option.value]);
                                }
                              }}
                              className={`w-full p-4 rounded-xl border-2 text-left transition-all duration-300 ${
                                isSelected
                                  ? "border-myntra-pink bg-myntra-pink-light"
                                  : "border-gray-200 hover:border-gray-300"
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                                  <Shirt className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                  <h3 className="font-semibold text-gray-900">{option.label}</h3>
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {currentStepData.type === "rating" && (
                      <div className="space-y-4">
                        <div className="bg-gradient-to-r from-myntra-pink-light to-purple-50 rounded-xl p-6">
                          <div className="flex justify-center gap-2">
                            {Array.from({ length: currentStepData.scale }, (_, i) => i + 1).map((rating) => (
                              <button
                                key={rating}
                                onClick={() => handleAnswer(currentStepData.id, rating)}
                                className={`w-12 h-12 rounded-full border-2 transition-all duration-300 ${
                                  challengeAnswers[currentStepData.id] === rating
                                    ? "border-myntra-pink bg-myntra-pink text-white"
                                    : "border-gray-300 hover:border-gray-400"
                                }`}
                              >
                                {rating}
                              </button>
                            ))}
                          </div>
                          <p className="text-center text-sm text-gray-600 mt-2">
                            1 = Poor, {currentStepData.scale} = Excellent
                          </p>
                        </div>
                      </div>
                    )}

                    {currentStepData.type === "text-input" && (
                      <div className="space-y-4">
                        <div className="bg-gradient-to-r from-myntra-pink-light to-purple-50 rounded-xl p-6">
                          <textarea
                            value={challengeAnswers[currentStepData.id] || ""}
                            onChange={(e) => handleAnswer(currentStepData.id, e.target.value)}
                            placeholder={currentStepData.placeholder}
                            className="w-full min-h-[120px] p-4 border border-gray-200 rounded-lg focus:border-myntra-pink focus:ring-2 focus:ring-myntra-pink-light resize-none"
                            rows={4}
                          />
                          <p className="text-sm text-gray-600 mt-2">
                            Take your time to reflect and write from the heart 💝
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              </AnimatePresence>
              
              <div className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                  disabled={currentStep === 0}
                >
                  Previous
                </Button>
                
                <Button
                  onClick={handleNextStep}
                  disabled={!challengeAnswers[currentStepData.id]}
                  variant="myntra"
                >
                  {currentStep === steps.length - 1 ? "Complete Challenge" : "Next Step"}
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        <ConfettiAnimation 
          trigger={showConfetti} 
          onComplete={() => {
            setShowConfetti(false);
            setCompletedChallenge(null);
          }} 
        />
      </>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-myntra-light-gray pt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-10"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-4 bg-gradient-primary rounded-xl shadow-lg">
                  <Trophy className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-myntra-dark">Daily Challenges</h1>
                  <p className="text-lg text-gray-600 mt-2">Complete challenges to earn XP and level up!</p>
                </div>
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={() => {
                    // Only refresh if no challenges are completed
                    const hasCompleted = challenges.some(c => c.isCompleted);
                    if (hasCompleted) {
                      toast({
                        title: "Cannot Refresh! ⚠️",
                        description: "You have completed challenges today. Refresh will reset your progress!",
                        duration: 3000
                      });
                      return;
                    }
                    
                    forceRefreshChallenges();
                    const todaysChallenges = getTodaysChallenges();
                    setChallenges(todaysChallenges);
                    setTodayXP(getTodayXP());
                    toast({
                      title: "Challenges Refreshed! 🔄",
                      description: "New fashion challenges loaded successfully!"
                    });
                  }}
                  variant="outline"
                  className="border-2 border-blue-500 text-blue-500 hover:bg-blue-50"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Refresh Challenges
                </Button>
              <Button
                onClick={() => navigate('/leaderboard')}
                variant="outline"
                className="border-2 border-myntra-pink text-myntra-pink hover:bg-myntra-pink-light"
              >
                <Trophy className="h-4 w-4 mr-2" />
                View Leaderboard
              </Button>
              </div>
            </div>
          </motion.div>

          {/* Dynamic Today's Progress */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 mb-8"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-myntra-dark">Today's Progress</h2>
              <Badge className="bg-myntra-pink-light text-myntra-pink border-0">
                {completedChallenges}/{challenges.length} Complete
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-100 text-center">
                <div className="text-2xl font-bold text-myntra-dark">{completedChallenges}</div>
                <div className="text-xs text-gray-500">Challenges Completed</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-100 text-center">
                <div className="text-2xl font-bold text-myntra-dark">{todayXP}</div>
                <div className="text-xs text-gray-500">XP Earned Today</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-100 text-center">
                <div className="text-2xl font-bold text-myntra-dark">Lv.{level}</div>
                <div className="text-xs text-gray-500">Current Level</div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Daily Completion</span>
                <span>{completedChallenges}/{challenges.length}</span>
              </div>
              <Progress value={todayProgress} className="h-3" />
            </div>

            <div className="mt-3 text-sm font-medium">
              {completedChallenges >= challenges.length
                ? <span className="text-green-600">You crushed it today! 💥 Keep the streak going 🔥</span>
                : <span className="text-myntra-pink">You're on a roll! {challenges.length - completedChallenges} to go ✨</span>
              }
            </div>
          </motion.div>

          {/* Challenges Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <AnimatePresence>
              {challenges.map((challenge, index) => (
                <motion.div
                  key={challenge.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.1 }}
                  className={`
                    bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300
                    ${challenge.isCompleted 
                      ? "border-green-200 bg-green-50" 
                      : "hover:border-myntra-pink"
                    }
                    ${completedChallenge === challenge.id ? "animate-pulse" : ""}
                  `}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="text-3xl">{challenge.emoji}</div>
                      <div>
                        <h3 className="text-lg font-bold text-myntra-dark mb-1">
                          {challenge.title}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {challenge.description}
                        </p>
                      </div>
                    </div>
                    
                    {challenge.isCompleted && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="flex items-center gap-1 text-green-600"
                      >
                        <CheckCircle className="h-5 w-5" />
                      </motion.div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 mb-4">
                    <Badge className={getDifficultyColor(challenge.difficulty)}>
                      {challenge.difficulty}
                    </Badge>
                    <Badge className={getCategoryColor(challenge.category)}>
                      {challenge.category}
                    </Badge>
                    <Badge variant="secondary" className="bg-myntra-pink-light text-myntra-pink border-0">
                      {challenge.xpReward} XP
                    </Badge>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                      <span>Progress</span>
                      <span>{challenge.progress}/{challenge.maxProgress}</span>
                    </div>
                    <Progress 
                      value={(challenge.progress / (challenge.maxProgress || 1)) * 100} 
                      className="h-2" 
                    />
                  </div>

                  {/* Requirements */}
                  {challenge.requirements && (
                    <div className="mb-4">
                      <p className="text-xs text-gray-600 mb-2">Requirements:</p>
                      <div className="space-y-1">
                        {challenge.requirements.map((req, reqIndex) => (
                          <div key={reqIndex} className="flex items-center gap-2 text-xs text-gray-600">
                            <div className="w-1 h-1 bg-myntra-pink rounded-full"></div>
                            <span>{req}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action Button */}
                  {challenge.isCompleted ? (
                    <div className="flex items-center justify-center gap-2 py-3 px-4 bg-green-100 text-green-700 rounded-lg">
                      <CheckCircle className="h-4 w-4" />
                      <span className="font-medium">Completed! 🎉</span>
                    </div>
                  ) : (
                    <Button
                      onClick={() => handleStartChallenge(challenge)}
                      variant="myntra"
                      className="w-full"
                      disabled={challenge.isCompleted}
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Start Challenge
                    </Button>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Badges Section */}
          {userProgress.badges.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-xl shadow-lg border border-gray-100 p-6"
            >
              <h3 className="text-xl font-bold text-myntra-dark mb-4 flex items-center gap-2">
                <Award className="h-6 w-6 text-myntra-pink" />
                Your Badges
              </h3>
              <div className="flex flex-wrap gap-2">
                {userProgress.badges.map((badgeId, index) => {
                  const badge = BADGES.find(b => b.id === badgeId);
                  return badge ? (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0 text-lg px-3 py-1"
                    >
                      {badge.emoji} {badge.name}
                    </Badge>
                  ) : null;
                })}
              </div>
            </motion.div>
          )}
        </div>
      </div>
      
      <ConfettiAnimation 
        trigger={showConfetti} 
        onComplete={() => {
          setShowConfetti(false);
          setCompletedChallenge(null);
        }} 
      />
    </>
  );
};

export default DailyChallenges;
