import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, CheckCircle, Star, Target, Palette, Shirt, Sparkles } from "lucide-react";
import { Challenge } from "@/data/challenges";

interface InteractiveChallengeProps {
  challenge: Challenge;
  onBack: () => void;
  onSubmitChallenge: (challenge: Challenge, score: number) => void;
}

const InteractiveChallenge: React.FC<InteractiveChallengeProps> = ({
  challenge,
  onBack,
  onSubmitChallenge
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [userAnswers, setUserAnswers] = useState<{[key: string]: any}>({});
  const [score, setScore] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getChallengeSteps = (challengeId: string) => {
    switch (challengeId) {
      case "mix-match-master":
        return [
          {
            title: "Choose Your Myntra Item",
            description: "Select one item from your Myntra catalog to build around",
            type: "selection",
            options: [
              { id: "item1", name: "White Cotton T-Shirt", category: "Tops", color: "White" },
              { id: "item2", name: "Blue Denim Jeans", category: "Bottoms", color: "Blue" },
              { id: "item3", name: "Black Leather Jacket", category: "Outerwear", color: "Black" },
              { id: "item4", name: "Red Floral Dress", category: "Dresses", color: "Red" }
            ]
          },
          {
            title: "Add Closet Items",
            description: "Choose 2 items from your personal closet to complete the look",
            type: "multi-selection",
            options: [
              { id: "closet1", name: "White Sneakers", category: "Shoes", color: "White" },
              { id: "closet2", name: "Black Handbag", category: "Accessories", color: "Black" },
              { id: "closet3", name: "Gold Necklace", category: "Accessories", color: "Gold" },
              { id: "closet4", name: "Denim Jacket", category: "Outerwear", color: "Blue" }
            ],
            maxSelections: 2
          },
          {
            title: "Style Coordination",
            description: "Rate how well your items work together",
            type: "rating",
            question: "How cohesive is your outfit combination?"
          }
        ];

      case "color-coordination":
        return [
          {
            title: "Choose Your Color Scheme",
            description: "Select either monochrome or complementary colors",
            type: "selection",
            options: [
              { id: "monochrome", name: "Monochrome (Same Color Family)", description: "All items in similar shades" },
              { id: "complementary", name: "Complementary Colors", description: "Opposite colors on the color wheel" }
            ]
          },
          {
            title: "Select Your Items",
            description: "Choose items that match your color scheme",
            type: "multi-selection",
            options: [
              { id: "item1", name: "Navy Blue Blazer", color: "Navy", scheme: "monochrome" },
              { id: "item2", name: "Light Blue Shirt", color: "Light Blue", scheme: "monochrome" },
              { id: "item3", name: "Orange Sweater", color: "Orange", scheme: "complementary" },
              { id: "item4", name: "Blue Jeans", color: "Blue", scheme: "complementary" }
            ],
            maxSelections: 3
          },
          {
            title: "Color Theory Test",
            description: "Answer this question about color coordination",
            type: "quiz",
            question: "Which colors are complementary to blue?",
            options: ["Orange", "Green", "Purple", "Red"],
            correct: 0
          }
        ];

      case "sustainable-style":
        return [
          {
            title: "Choose Reusable Items",
            description: "Select at least 2 items you already own",
            type: "multi-selection",
            options: [
              { id: "item1", name: "Black Basic Tee", category: "Tops", owned: true },
              { id: "item2", name: "White Sneakers", category: "Shoes", owned: true },
              { id: "item3", name: "Blue Jeans", category: "Bottoms", owned: true },
              { id: "item4", name: "Red Dress", category: "Dresses", owned: false }
            ],
            minSelections: 2
          },
          {
            title: "Sustainability Quiz",
            description: "Test your knowledge about sustainable fashion",
            type: "quiz",
            question: "What's the most sustainable way to build a wardrobe?",
            options: ["Buy new items frequently", "Mix and match existing pieces", "Follow every trend", "Throw away old clothes"],
            correct: 1
          }
        ];

      case "streetwear-king":
        return [
          {
            title: "Choose Streetwear Items",
            description: "Select items that represent streetwear style",
            type: "multi-selection",
            options: [
              { id: "item1", name: "Oversized Hoodie", style: "streetwear" },
              { id: "item2", name: "Cargo Pants", style: "streetwear" },
              { id: "item3", name: "High-top Sneakers", style: "streetwear" },
              { id: "item4", name: "Baseball Cap", style: "streetwear" },
              { id: "item5", name: "Formal Suit", style: "formal" },
              { id: "item6", name: "High Heels", style: "formal" }
            ],
            maxSelections: 4
          },
          {
            title: "Streetwear Knowledge",
            description: "What defines streetwear style?",
            type: "quiz",
            question: "Which element is most important in streetwear?",
            options: ["Comfort", "Formality", "Expensive brands", "Trendy colors"],
            correct: 0
          }
        ];

      case "occasion-fit":
        return [
          {
            title: "Choose Your Occasion",
            description: "Select the event you're dressing for",
            type: "selection",
            options: [
              { id: "party", name: "Party/Night Out", description: "Fun and stylish" },
              { id: "brunch", name: "Brunch", description: "Casual and chic" },
              { id: "wedding", name: "Wedding", description: "Elegant and formal" },
              { id: "work", name: "Work Meeting", description: "Professional" }
            ]
          },
          {
            title: "Build Your Outfit",
            description: "Choose appropriate items for your selected occasion",
            type: "multi-selection",
            options: [
              { id: "item1", name: "Little Black Dress", occasions: ["party", "wedding"] },
              { id: "item2", name: "Blazer", occasions: ["work", "brunch"] },
              { id: "item3", name: "Jeans", occasions: ["brunch", "party"] },
              { id: "item4", name: "Evening Gown", occasions: ["wedding", "party"] }
            ],
            maxSelections: 3
          },
          {
            title: "Style Appropriateness",
            description: "Rate how appropriate your outfit is for the occasion",
            type: "rating",
            question: "How well does your outfit match the occasion?"
          }
        ];

      default:
        return [];
    }
  };

  const steps = getChallengeSteps(challenge.id);
  const currentStepData = steps[currentStep];

  const handleAnswer = (answer: any) => {
    setUserAnswers(prev => ({
      ...prev,
      [currentStep]: answer
    }));
  };

  const calculateScore = () => {
    let totalScore = 0;
    let maxScore = 0;

    steps.forEach((step, index) => {
      const userAnswer = userAnswers[index];
      if (!userAnswer) return;

      switch (step.type) {
        case "selection":
          maxScore += 20;
          totalScore += 20; // Full points for any selection
          break;
        case "multi-selection":
          maxScore += 30;
          if (step.maxSelections) {
            const bonus = userAnswer.length === step.maxSelections ? 10 : 0;
            totalScore += 20 + bonus;
          } else if (step.minSelections) {
            const bonus = userAnswer.length >= step.minSelections ? 10 : 0;
            totalScore += 20 + bonus;
          }
          break;
        case "quiz":
          maxScore += 25;
          if (userAnswer === step.correct) {
            totalScore += 25;
          }
          break;
        case "rating":
          maxScore += 25;
          totalScore += userAnswer * 5; // Rating from 1-5
          break;
      }
    });

    return { score: totalScore, maxScore };
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      const { score: finalScore } = calculateScore();
      setScore(finalScore);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const { score: finalScore, maxScore } = calculateScore();
    const pointsEarned = Math.round((finalScore / maxScore) * challenge.points);
    
    onSubmitChallenge(challenge, pointsEarned);
    setIsSubmitting(false);
  };

  const renderStepContent = () => {
    if (!currentStepData) return null;

    switch (currentStepData.type) {
      case "selection":
        return (
          <div className="space-y-4">
            {currentStepData.options.map((option: any) => (
              <button
                key={option.id}
                onClick={() => handleAnswer(option.id)}
                className={`w-full p-4 rounded-xl border-2 text-left transition-all duration-300 ${
                  userAnswers[currentStep] === option.id
                    ? "border-myntra-pink bg-myntra-pink-light"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-myntra-pink to-myntra-pink-dark rounded-lg flex items-center justify-center">
                    <Shirt className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{option.name}</h3>
                    {option.description && (
                      <p className="text-sm text-gray-600">{option.description}</p>
                    )}
                    {option.color && (
                      <Badge variant="outline" className="mt-1">{option.color}</Badge>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        );

      case "multi-selection":
        return (
          <div className="space-y-4">
            {currentStepData.options.map((option: any) => {
              const isSelected = userAnswers[currentStep]?.includes(option.id);
              return (
                <button
                  key={option.id}
                  onClick={() => {
                    const current = userAnswers[currentStep] || [];
                    if (isSelected) {
                      handleAnswer(current.filter((id: string) => id !== option.id));
                    } else {
                      const max = currentStepData.maxSelections || 5;
                      if (current.length < max) {
                        handleAnswer([...current, option.id]);
                      }
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
                      <h3 className="font-semibold text-gray-900">{option.name}</h3>
                      {option.description && (
                        <p className="text-sm text-gray-600">{option.description}</p>
                      )}
                      {option.color && (
                        <Badge variant="outline" className="mt-1">{option.color}</Badge>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
            {currentStepData.maxSelections && (
              <p className="text-sm text-gray-500 text-center">
                Select up to {currentStepData.maxSelections} items
              </p>
            )}
          </div>
        );

      case "quiz":
        return (
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-myntra-pink-light to-purple-50 rounded-xl p-6">
              <h3 className="font-semibold text-gray-900 mb-4">{currentStepData.question}</h3>
              <div className="space-y-3">
                {currentStepData.options.map((option: string, index: number) => (
                  <button
                    key={index}
                    onClick={() => handleAnswer(index)}
                    className={`w-full p-3 rounded-lg border-2 text-left transition-all duration-300 ${
                      userAnswers[currentStep] === index
                        ? "border-myntra-pink bg-myntra-pink-light"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case "rating":
        return (
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-myntra-pink-light to-purple-50 rounded-xl p-6">
              <h3 className="font-semibold text-gray-900 mb-4">{currentStepData.question}</h3>
              <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    onClick={() => handleAnswer(rating)}
                    className={`w-12 h-12 rounded-full border-2 transition-all duration-300 ${
                      userAnswers[currentStep] === rating
                        ? "border-myntra-pink bg-myntra-pink text-white"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                  >
                    {rating}
                  </button>
                ))}
              </div>
              <p className="text-center text-sm text-gray-600 mt-2">
                1 = Poor, 5 = Excellent
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (score > 0) {
    return (
      <div className="min-h-screen bg-myntra-light-gray pt-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Button
            variant="outline"
            onClick={onBack}
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Challenges
          </Button>

          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-10 w-10 text-white" />
            </div>
            
            <h1 className="text-3xl font-bold text-myntra-dark mb-4">
              Challenge Completed! 🎉
            </h1>
            
            <div className="bg-gradient-to-r from-myntra-pink-light to-purple-50 rounded-xl p-6 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-myntra-pink">{score}</p>
                  <p className="text-sm text-gray-600">Your Score</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-myntra-pink">{Math.round((score / 100) * challenge.points)}</p>
                  <p className="text-sm text-gray-600">Points Earned</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-myntra-pink">{challenge.points}</p>
                  <p className="text-sm text-gray-600">Max Points</p>
                </div>
              </div>
            </div>

            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              variant="myntra"
              className="font-bold py-4 px-8 text-lg"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Submitting...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  Submit Challenge
                </div>
              )}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-myntra-light-gray pt-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Button
          variant="outline"
          onClick={onBack}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Challenges
        </Button>

        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8 mb-8">
          <div className="flex items-start gap-6">
            <div className="p-4 bg-gradient-primary rounded-xl shadow-lg">
              <span className="text-4xl">{challenge.emoji}</span>
            </div>
            
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-myntra-dark mb-2">
                {challenge.title}
              </h1>
              <p className="text-lg text-gray-600 mb-4">
                {challenge.description}
              </p>
              
              <div className="flex items-center gap-3">
                <Badge className="bg-myntra-pink-light text-myntra-pink border-0">
                  <Target className="h-3 w-3 mr-1" />
                  {challenge.points} points
                </Badge>
                <Badge variant="outline" className="border-gray-300">
                  Step {currentStep + 1} of {steps.length}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8">
          <h2 className="text-2xl font-bold text-myntra-dark mb-4 flex items-center gap-2">
            <Star className="h-6 w-6 text-myntra-pink" />
            {currentStepData.title}
          </h2>
          <p className="text-gray-600 mb-6">{currentStepData.description}</p>
          
          {renderStepContent()}
          
          <div className="mt-8 flex justify-between">
            <Button
              variant="outline"
              onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
              disabled={currentStep === 0}
            >
              Previous
            </Button>
            
            <Button
              onClick={handleNext}
              disabled={!userAnswers[currentStep]}
              variant="myntra"
            >
              {currentStep === steps.length - 1 ? "Finish Challenge" : "Next Step"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InteractiveChallenge;
