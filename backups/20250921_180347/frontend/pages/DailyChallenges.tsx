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
    const todaysChallenges = getTodaysChallenges();
    setChallenges(todaysChallenges);
    setTodayXP(getTodayXP());
  }, []);

  const persistChallenges = (updated: DailyChallenge[]) => {
    localStorage.setItem('dailyChallenges', JSON.stringify(updated));
    localStorage.setItem('dailyChallengesDate', todayKey);
  };

  const handleStartChallenge = (challenge: DailyChallenge) => {
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

    // Points: 10 per answered step + streak bonus
    const steps = getChallengeSteps(selectedChallenge);
    const answeredCount = steps.reduce((acc, step: any) => {
      const val = challengeAnswers[step.id];
      if (Array.isArray(val)) return acc + (val.length > 0 ? 1 : 0);
      return acc + (val !== undefined && val !== null && val !== '' ? 1 : 0);
    }, 0);
    const streakBonus = userProgress.currentStreak > 0 ? selectedChallenge.streakBonus : 0;
    const totalXP = answeredCount * 10 + streakBonus;

    // Update challenge immediately and persist
    const updatedChallenges = challenges.map(c => 
      c.id === selectedChallenge.id 
        ? { ...c, isCompleted: true, completedAt: new Date().toISOString(), progress: c.maxProgress }
        : c
    );
    setChallenges(updatedChallenges);
    persistChallenges(updatedChallenges);

    // Update today XP and persist
    const newTodayXP = getTodayXP() + totalXP;
    localStorage.setItem(`todayXP:${todayKey}`, String(newTodayXP));
    setTodayXP(newTodayXP);

    // Update user progress immediately
    const newProgress = updateUserProgress(selectedChallenge, totalXP);
    setUserProgress(newProgress);

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

    // Specific, Gen Z–friendly flows
    if (challenge.title.includes("Weekend Warrior")) {
      steps.push(
        { id: "ww-activity", type: "selection", question: "Choose your weekend activity", options: [
          { id: "picnic", label: "🥪 Picnic", value: "picnic" },
          { id: "brunch", label: "🥞 Brunch", value: "brunch" },
          { id: "roadtrip", label: "🚗 Road Trip", value: "roadtrip" },
          { id: "movie", label: "🎬 Movie Night", value: "movie" }
        ]},
        { id: "ww-palette", type: "selection", question: "Pick a color palette", options: [
          { id: "bright", label: "🌈 Bright", value: "bright" },
          { id: "pastel", label: "🍬 Pastel", value: "pastel" },
          { id: "mono", label: "⚫ Monochrome", value: "monochrome" }
        ]},
        { id: "ww-outfit", type: "selection", question: "Select outfit type", options: [
          { id: "dress", label: "👗 Dress", value: "dress" },
          { id: "coords", label: "🧥 Co-ords", value: "coords" },
          { id: "casual", label: "👖 Jeans + Tee", value: "casual" }
        ]},
        { id: "ww-accessories", type: "multi-selection", question: "Choose accessories", options: [
          { id: "sunglasses", label: "🕶️ Sunglasses", value: "sunglasses" },
          { id: "hat", label: "👒 Hat", value: "hat" },
          { id: "bag", label: "👜 Crossbody Bag", value: "bag" }
        ]},
        { id: "ww-footwear", type: "selection", question: "Pick footwear", options: [
          { id: "sneakers", label: "👟 Sneakers", value: "sneakers" },
          { id: "sandals", label: "🩴 Sandals", value: "sandals" },
          { id: "heels", label: "👠 Heels", value: "heels" }
        ]},
        { id: "ww-hair", type: "selection", question: "Select hairstyle", options: [
          { id: "bun", label: "🌀 Bun", value: "bun" },
          { id: "ponytail", label: "🎀 Ponytail", value: "ponytail" },
          { id: "waves", label: "🌊 Waves", value: "waves" }
        ]},
        { id: "ww-vibe", type: "selection", question: "Finalize vibe", options: [
          { id: "chill", label: "😎 Chill", value: "chill" },
          { id: "classy", label: "💅 Classy", value: "classy" },
          { id: "bold", label: "🔥 Bold", value: "bold" }
        ]}
      );
    } else if (challenge.title.includes("Friday Night Ready")) {
      steps.push(
        { id: "fnr-location", type: "selection", question: "Choose location", options: [
          { id: "club", label: "🎧 Club", value: "club" },
          { id: "dinner", label: "🍽️ Dinner", value: "dinner" },
          { id: "houseparty", label: "🏠 House Party", value: "houseparty" }
        ]},
        { id: "fnr-category", type: "selection", question: "Pick outfit category", options: [
          { id: "glam", label: "✨ Glam Dress", value: "glam-dress" },
          { id: "pantsuit", label: "👔 Chic Pantsuit", value: "pantsuit" },
          { id: "coords", label: "🧥 Co-ords", value: "coords" }
        ]},
        { id: "fnr-makeup", type: "selection", question: "Select makeup", options: [
          { id: "boldlips", label: "💄 Bold Lips", value: "bold-lips" },
          { id: "smokey", label: "🌫️ Smokey Eyes", value: "smokey" },
          { id: "natural", label: "🌟 Natural Glow", value: "natural" }
        ]},
        { id: "fnr-accessories", type: "multi-selection", question: "Choose accessories", options: [
          { id: "earrings", label: "✨ Statement Earrings", value: "earrings" },
          { id: "chains", label: "⛓️ Layered Chains", value: "chains" }
        ]},
        { id: "fnr-shoes", type: "selection", question: "Choose shoes", options: [
          { id: "heels", label: "👠 Heels", value: "heels" },
          { id: "boots", label: "🥾 Boots", value: "boots" },
          { id: "sneakers", label: "👟 Sneakers", value: "sneakers" }
        ]},
        { id: "fnr-mood", type: "selection", question: "Pick a final vibe/mood", options: [
          { id: "diva", label: "👑 Glam Diva", value: "diva" },
          { id: "trendsetter", label: "🆒 Cool Trendsetter", value: "trendsetter" },
          { id: "minimal", label: "🌿 Minimalist", value: "minimal" }
        ]},
        { id: "fnr-rating", type: "rating", question: "Rate your look", scale: 5 }
      );
    } else if (challenge.title.includes("Gratitude")) {
      steps.push(
        { id: "gratitude-1", type: "text-input", question: "What's the first thing you're grateful for today?", placeholder: "Write something you're thankful for..." },
        { id: "gratitude-2", type: "text-input", question: "What's the second thing you're grateful for?", placeholder: "Another thing you appreciate..." },
        { id: "gratitude-3", type: "text-input", question: "What's the third thing you're grateful for?", placeholder: "One more thing you're thankful for..." },
        { id: "gratitude-theme", type: "selection", question: "Pick today's gratitude theme", options: [
          { id: "people", label: "People", value: "people" },
          { id: "health", label: "Health", value: "health" },
          { id: "career", label: "Career/Studies", value: "career" },
          { id: "fun", label: "Fun/Little joys", value: "fun" }
        ]},
        { id: "gratitude-reflection", type: "rating", question: "How does reflecting on gratitude make you feel?", scale: 5 },
        { id: "gratitude-action", type: "selection", question: "Will you act on one gratitude today?", options: [
          { id: "yes", label: "Yes, I will", value: "yes" },
          { id: "maybe", label: "Maybe later", value: "maybe" },
          { id: "no", label: "Not today", value: "no" }
        ]}
      );
    } else if (challenge.title.includes("Mood")) {
      steps.push(
        { id: "mood-selection", type: "selection", question: "How are you feeling right now?", options: [
          { id: "happy", label: "😊 Happy", value: "happy" },
          { id: "calm", label: "😌 Calm", value: "calm" },
          { id: "energetic", label: "⚡ Energetic", value: "energetic" },
          { id: "tired", label: "😴 Tired", value: "tired" },
          { id: "stressed", label: "😰 Stressed", value: "stressed" },
          { id: "excited", label: "🎉 Excited", value: "excited" }
        ]},
        { id: "energy-level", type: "rating", question: "What's your energy level (1-10)?", scale: 10 },
        { id: "mood-reflection", type: "text-input", question: "What's influencing your mood today?", placeholder: "Write a brief reflection on what's affecting how you feel..." },
        { id: "mood-coping", type: "selection", question: "Pick a coping or boosting action", options: [
          { id: "walk", label: "Go for a short walk", value: "walk" },
          { id: "music", label: "Listen to music", value: "music" },
          { id: "friend", label: "Text a friend", value: "friend" },
          { id: "breathe", label: "Breathing exercise", value: "breathe" }
        ]},
        { id: "mood-playlist", type: "selection", question: "Pick a vibe playlist", options: [
          { id: "lofi", label: "Lo-fi", value: "lofi" },
          { id: "pop", label: "Pop", value: "pop" },
          { id: "edm", label: "EDM", value: "edm" },
          { id: "indie", label: "Indie", value: "indie" }
        ]}
      );
    } else if (challenge.title.includes("Fitness")) {
      steps.push(
        { id: "warmup-check", type: "selection", question: "Did you warm up before starting?", options: [
          { id: "yes", label: "Yes, I warmed up properly", value: "yes" },
          { id: "partial", label: "I did some light stretching", value: "partial" },
          { id: "no", label: "No, I went straight to pushups", value: "no" }
        ]},
        { id: "pushup-count", type: "selection", question: "How many pushups did you complete?", options: [
          { id: "5", label: "5 pushups", value: "5" },
          { id: "10", label: "10 pushups", value: "10" },
          { id: "15", label: "15 pushups", value: "15" },
          { id: "20", label: "20 pushups", value: "20" },
          { id: "20+", label: "20+ pushups", value: "20+" }
        ]},
        { id: "form-rating", type: "rating", question: "How would you rate your form?", scale: 5 },
        { id: "feeling-after", type: "rating", question: "How do you feel after the exercise?", scale: 5 },
        { id: "cooldown", type: "selection", question: "Did you cool down/stretch?", options: [
          { id: "yes", label: "Yes", value: "yes" },
          { id: "no", label: "No", value: "no" }
        ]}
      );
    } else if (challenge.title.includes("Learning")) {
      steps.push(
        { id: "topic-choice", type: "selection", question: "What topic would you like to learn about?", options: [
          { id: "science", label: "🔬 Science & Technology", value: "science" },
          { id: "history", label: "📚 History & Culture", value: "history" },
          { id: "art", label: "🎨 Art & Design", value: "art" },
          { id: "health", label: "💊 Health & Wellness", value: "health" },
          { id: "business", label: "💼 Business & Finance", value: "business" },
          { id: "language", label: "🗣️ Language & Communication", value: "language" }
        ]},
        { id: "quiz-q1", type: "selection", question: "What is the capital of France?", options: [
          { id: "london", label: "London", value: "london" },
          { id: "paris", label: "Paris", value: "paris" },
          { id: "berlin", label: "Berlin", value: "berlin" },
          { id: "madrid", label: "Madrid", value: "madrid" }
        ]},
        { id: "quiz-q2", type: "selection", question: "Which planet is closest to the Sun?", options: [
          { id: "venus", label: "Venus", value: "venus" },
          { id: "mercury", label: "Mercury", value: "mercury" },
          { id: "earth", label: "Earth", value: "earth" },
          { id: "mars", label: "Mars", value: "mars" }
        ]},
        { id: "quiz-q3", type: "selection", question: "What does 'CPU' stand for?", options: [
          { id: "central", label: "Central Processing Unit", value: "central" },
          { id: "computer", label: "Computer Processing Unit", value: "computer" },
          { id: "core", label: "Core Processing Unit", value: "core" },
          { id: "control", label: "Control Processing Unit", value: "control" }
        ]},
        { id: "quiz-q4", type: "selection", question: "Which color results from mixing blue and yellow?", options: [
          { id: "green", label: "Green", value: "green" },
          { id: "purple", label: "Purple", value: "purple" },
          { id: "orange", label: "Orange", value: "orange" },
          { id: "brown", label: "Brown", value: "brown" }
        ]},
        { id: "learning-confidence", type: "rating", question: "How confident do you feel about your answers?", scale: 5 }
      );
    } else if (challenge.title.includes("Social")) {
      steps.push(
        { id: "person-choice", type: "selection", question: "Who would you like to connect with?", options: [
          { id: "family", label: "👨‍👩‍👧‍👦 Family member", value: "family" },
          { id: "friend", label: "👫 Close friend", value: "friend" },
          { id: "colleague", label: "👔 Work colleague", value: "colleague" },
          { id: "acquaintance", label: "🤝 Acquaintance", value: "acquaintance" },
          { id: "mentor", label: "🎓 Mentor or teacher", value: "mentor" }
        ]},
        { id: "message-type", type: "selection", question: "What type of message will you send?", options: [
          { id: "check-in", label: "💬 Just checking in", value: "check-in" },
          { id: "support", label: "🤗 Offering support", value: "support" },
          { id: "celebration", label: "🎉 Celebrating something", value: "celebration" },
          { id: "question", label: "❓ Asking a question", value: "question" },
          { id: "sharing", label: "📝 Sharing something personal", value: "sharing" }
        ]},
        { id: "message-content", type: "text-input", question: "What will you say in your message?", placeholder: "Write your message here..." },
        { id: "tone", type: "selection", question: "Choose the tone", options: [
          { id: "warm", label: "Warm & friendly", value: "warm" },
          { id: "funny", label: "Funny", value: "funny" },
          { id: "formal", label: "Formal", value: "formal" }
        ]},
        { id: "connection-quality", type: "rating", question: "How meaningful is this connection to you?", scale: 5 }
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
              <Button
                onClick={() => navigate('/leaderboard')}
                variant="outline"
                className="border-2 border-myntra-pink text-myntra-pink hover:bg-myntra-pink-light"
              >
                <Trophy className="h-4 w-4 mr-2" />
                View Leaderboard
              </Button>
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
              <Progress value={(completedChallenges / (challenges.length || 1)) * 100} className="h-3" />
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
