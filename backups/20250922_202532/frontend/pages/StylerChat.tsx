import React, { useState, useEffect, useRef } from "react";
import { Send, MessageCircle, Bot, User, Heart, Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { myntraCatalog } from "@/data/myntraCatalog";
import { toast } from "@/hooks/use-toast";
import { generateStylist, StylistResponse } from "@/services/wardrobeApi";
import { generateLookboardSuggestion, LookboardData } from "@/services/geminiApi";
import Lookboard from "@/components/Lookboard";
import { useNavigate } from "react-router-dom";

interface Message {
  id: string;
  type: "user" | "stylist";
  content: string;
  timestamp: Date;
  iconicImage?: string;
  wardrobeItems?: any[];
  myntraItems?: any[];
  lookboardData?: LookboardData;
}

interface ClothingItem {
  id: string;
  image: string;
  category: string;
  name?: string;
  dateAdded: string;
}

const StylerChat = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [closetItems, setClosetItems] = useState<ClothingItem[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load closet items
    const savedItems = localStorage.getItem("closetItems");
    if (savedItems) {
      setClosetItems(JSON.parse(savedItems));
    }

    // Load chat history
    const savedChat = localStorage.getItem("stylistChat");
    if (savedChat) {
      setMessages(JSON.parse(savedChat).map((msg: any) => ({
        ...msg,
        timestamp: new Date(msg.timestamp)
      })));
    } else {
      // Welcome message
      const welcomeMessage: Message = {
        id: "welcome",
        type: "stylist",
        content: "Hey bestie! 👋 I'm your AI stylist! Ask me anything about fashion - like 'What should I wear for a beach wedding?' or 'Give me a cozy monsoon fit!' ✨",
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    }
  }, []);

  useEffect(() => {
    // Save chat history
    if (messages.length > 1) { // Don't save just the welcome message
      localStorage.setItem("stylistChat", JSON.stringify(messages));
    }
  }, [messages]);

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const generateStyleResponse = (userMessage: string): string => {
    const lowercaseMessage = userMessage.toLowerCase();
    
    // Keywords mapping to occasions/styles
    if (lowercaseMessage.includes("beach") && lowercaseMessage.includes("wedding")) {
      return "Beach wedding vibe 🌴👗 → try a flowy maxi dress with sandals + add a cute straw hat! For accessories, go with delicate gold jewelry that won't compete with the ocean breeze. Light fabrics are your BFF here! ✨\n\nIconic Inspo: Think Priyanka Chopra's beachside elegance in Baywatch or those dreamy Maldives vacation looks! 🏖️💫";
    }
    
    if (lowercaseMessage.includes("monsoon") || lowercaseMessage.includes("rain") || lowercaseMessage.includes("cozy")) {
      return "Monsoon mood activated! 🌧️ Perfect time for layering - try high-waisted jeans with a cute crop top, throw on a denim jacket or waterproof blazer, and finish with ankle boots that can handle puddles! Don't forget a trendy umbrella 😉☔\n\nIconic Inspo: Channel that cozy London vibe like Emma Stone in La La Land's rainy scenes or those aesthetic K-drama monsoon moments! 🌧️✨";
    }
    
    if (lowercaseMessage.includes("party") || lowercaseMessage.includes("night out")) {
      return "Party time! 🎉 Go for a little black dress (classic for a reason!) with statement heels and bold jewelry. Or mix it up with a satin camisole + high-waisted trousers + blazer combo. Add some shimmer with metallic accessories! ✨💃\n\nIconic Inspo: Serve main character energy like Zendaya at any red carpet or those iconic Euphoria party looks! Pure glamour! 💫";
    }
    
    if (lowercaseMessage.includes("college") || lowercaseMessage.includes("casual") || lowercaseMessage.includes("everyday")) {
      return "College casual but make it cute! 📚✨ High-waisted mom jeans + crop top + oversized cardigan is always a serve! Throw on white sneakers and you're good to go. For variety, try palazzo pants with a fitted tee! Comfort meets style! 😎";
    }
    
    if (lowercaseMessage.includes("date") || lowercaseMessage.includes("romantic")) {
      return "Date night ready! 💕 For dinner dates: midi dress + heels + delicate jewelry. For casual coffee dates: high-waisted jeans + cute blouse + ankle boots. Always go for something that makes YOU feel confident - that's the best accessory! 😉\n\nIconic Inspo: Think Audrey Hepburn's timeless elegance in Breakfast at Tiffany's or modern romance like Emily in Paris café scenes! 🥐💕";
    }
    
    if (lowercaseMessage.includes("festival") || lowercaseMessage.includes("diwali") || lowercaseMessage.includes("ethnic")) {
      return "Festival glam time! 🎆 Go traditional with a kurta set in rich colors like maroon or royal blue. Add statement jhumkas and bangles. For a modern twist, try a crop top with a flowy skirt! Don't forget comfy juttis for all that dancing! 💃✨";
    }
    
    if (lowercaseMessage.includes("work") || lowercaseMessage.includes("office") || lowercaseMessage.includes("formal")) {
      return "Boss babe energy! 💼 Classic white button-down + tailored trousers + blazer = power suit vibes! Or try a midi dress with a belt to define your waist. Keep accessories minimal but impactful - think sleek watch and small hoops! 👩‍💼✨";
    }
    
    if (lowercaseMessage.includes("winter") || lowercaseMessage.includes("cold")) {
      return "Winter layers but make it fashion! ❄️ Oversized sweater + high-waisted jeans + knee-high boots = cozy chic! Add a long coat and scarf for extra warmth. For parties, try turtleneck under a slip dress with tights! Layer like a pro! 🧥✨";
    }
    
    if (lowercaseMessage.includes("summer") || lowercaseMessage.includes("hot") || lowercaseMessage.includes("sunny")) {
      return "Summer vibes! ☀️ Flowy sundresses are your best friend - they're comfy AND cute! For casual days: denim shorts + crop top + sandals. Don't forget sunglasses and a hat for that effortless cool-girl aesthetic! Light fabrics only! 🕶️✨";
    }

    // Generic responses for general questions
    const genericResponses = [
      "That's such a vibe! ✨ For any look, start with one statement piece and build around it. Mix your closet favorites with trending pieces for the perfect balance! What occasion are you dressing for? 💫",
      "Love that energy! 💕 My go-to formula: pick one color story, add different textures, and always include something that makes you smile! Tell me more about the vibe you're going for? 😊",
      "Ooh exciting! 🎉 Fashion is all about expressing YOUR personality! Start with pieces that make you feel confident and add fun elements. What's your style mood today - comfy, glam, or edgy? ✨",
      "Yes bestie! 👑 The best outfit is one that makes you feel like the main character of your own story! Mix comfort with style and don't be afraid to experiment. What's the occasion? 💫"
    ];
    
    return genericResponses[Math.floor(Math.random() * genericResponses.length)];
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: inputValue.trim(),
      timestamp: new Date()
    };

    // Optimistic: show typing toast
    toast({
      title: "Creating your lookboard! ✨",
      description: "Your AI stylist is curating the perfect look..."
    });

    setMessages(prev => [...prev, userMessage]);
    setInputValue("");

    try {
      // Use the new Gemini API for lookboard generation
      const lookboardData: LookboardData = await generateLookboardSuggestion(userMessage.content);
      
      const stylistResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: "stylist",
        content: lookboardData.textResponse.description,
        timestamp: new Date(),
        lookboardData: lookboardData,
      };
      
      setMessages(prev => [...prev, stylistResponse]);
      
      toast({
        title: "Lookboard ready! 🎨",
        description: "Check out your personalized style inspiration below"
      });
      
    } catch (err: any) {
      // Fallback to original API on error
      try {
        const res: StylistResponse = await generateStylist(userMessage.content);
        const stylistResponse: Message = {
          id: (Date.now() + 2).toString(),
          type: "stylist",
          content: res.description,
          timestamp: new Date(),
          iconicImage: res.image_url || undefined,
        };
        setMessages(prev => [...prev, stylistResponse]);
        if (res.warning) {
          toast({ title: "Partial result", description: res.warning });
        }
      } catch (fallbackErr: any) {
        // Final fallback to local generator
        const fallback: Message = {
          id: (Date.now() + 3).toString(),
          type: "stylist",
          content: generateStyleResponse(userMessage.content),
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, fallback]);
        toast({ title: "Using fallback", description: fallbackErr?.message || "Service unavailable" });
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSaveLook = (lookboardData: any) => {
    // This function is called when a look is saved
    // The actual saving is handled in the Lookboard component
    console.log('Look saved:', lookboardData);
  };

  const quickQuestions = [
    "Beach wedding outfit",
    "Diwali festive look",
    "Monsoon streetwear",
    "Concert night style",
    "Shaadi season glam"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50/30 to-purple-50/20 pt-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-gradient-primary rounded-xl shadow-lg">
                <MessageCircle className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-myntra-dark">AI Lookboard Generator</h1>
                <p className="text-lg text-gray-600 mt-1">Get personalized outfit suggestions with visual inspiration boards</p>
              </div>
            </div>
            <Button
              onClick={() => navigate('/saved-looks')}
              variant="outline"
              className="border-myntra-pink text-myntra-pink hover:bg-myntra-pink hover:text-white font-semibold px-6 py-3"
            >
              <Heart className="h-4 w-4 mr-2" />
              Saved Looks
            </Button>
          </div>
        </div>

        {/* Chat Container */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 overflow-hidden">
          {/* Chat Messages */}
          <div className="h-96 overflow-y-auto p-6 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.type === "user" ? "justify-end" : "justify-start"}`}
              >
                {message.type === "stylist" && (
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center">
                      <Bot className="h-5 w-5 text-white" />
                    </div>
                  </div>
                )}
                
                <div
                  className={`
                    max-w-4xl px-4 py-3 rounded-2xl text-sm
                    ${message.type === "user" 
                      ? "bg-myntra-pink text-white ml-12" 
                      : "bg-gray-100 text-gray-800 mr-12"
                    }
                  `}
                >
                  <p className="whitespace-pre-wrap">{message.content}</p>
                  
                  {/* Legacy iconic image support */}
                  {message.iconicImage && message.type === "stylist" && !message.lookboardData && (
                    <div className="mt-3">
                      <img
                        src={message.iconicImage}
                        alt="Iconic look reference"
                        className="rounded-lg border border-gray-200 max-h-72 object-cover"
                      />
                    </div>
                  )}
                  
                  {/* New Lookboard component */}
                  {message.lookboardData && message.type === "stylist" && (
                    <Lookboard
                      response={message.lookboardData.textResponse}
                      images={message.lookboardData.images}
                      shopUrl={message.lookboardData.shopUrl}
                      onSaveLook={handleSaveLook}
                    />
                  )}
                  
                  <p 
                    className={`
                      text-xs mt-2 opacity-70
                      ${message.type === "user" ? "text-white/70" : "text-gray-500"}
                    `}
                  >
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                
                {message.type === "user" && (
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-myntra-gray rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-white" />
                    </div>
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Questions */}
          {messages.length <= 1 && (
            <div className="px-6 pb-4 border-t border-gray-100">
              <p className="text-sm text-gray-600 mb-3 font-medium">Quick questions to get started:</p>
              <div className="flex flex-wrap gap-2">
                {quickQuestions.map((question, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="cursor-pointer hover:bg-myntra-pink-light hover:text-myntra-pink border border-gray-200 px-3 py-2 text-xs"
                    onClick={() => setInputValue(question)}
                  >
                    {question}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="border-t border-gray-100 p-4">
            <div className="flex gap-3 items-end">
              <div className="flex-1">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me anything about fashion! 💫"
                  className="resize-none border-2 border-gray-200 focus:border-myntra-pink rounded-lg text-base"
                />
              </div>
              <Button
                onClick={handleSendMessage}
                disabled={!inputValue.trim()}
                variant="myntra"
                size="lg"
                className="px-6 py-3"
              >
                <Send className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Enhanced Stats */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 text-center shadow-lg border border-gray-200/50 hover:shadow-xl transition-all duration-300">
            <div className="text-3xl font-bold text-myntra-pink mb-2">{messages.filter(m => m.type === "user").length}</div>
            <div className="text-sm text-gray-600 font-medium">Questions Asked</div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 text-center shadow-lg border border-gray-200/50 hover:shadow-xl transition-all duration-300">
            <div className="text-3xl font-bold text-myntra-pink mb-2">{closetItems.length}</div>
            <div className="text-sm text-gray-600 font-medium">Closet Items</div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 text-center shadow-lg border border-gray-200/50 hover:shadow-xl transition-all duration-300">
            <div className="text-3xl font-bold text-myntra-pink mb-2">24/7</div>
            <div className="text-sm text-gray-600 font-medium">Available</div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 text-center shadow-lg border border-gray-200/50 hover:shadow-xl transition-all duration-300">
            <div className="text-3xl font-bold text-myntra-pink mb-2">∞</div>
            <div className="text-sm text-gray-600 font-medium">Style Combos</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StylerChat;