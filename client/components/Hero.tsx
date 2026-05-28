import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Truck,
  Shield,
  Award,
  Sparkles,
  Leaf,
  Heart,
  Star,
} from "lucide-react";

export default function Hero() {
  const [query, setQuery] = useState("");
  const [currentFeature, setCurrentFeature] = useState(0);
  const [isTyping, setIsTyping] = useState(false);

  const navigate = useNavigate();

  const searchSuggestions = [
    "Fresh tomatoes",
    "Organic spinach",
    "Seasonal fruits",
    "Farm fresh vegetables",
    "Premium dairy",
  ];

  const features = [
    {
      icon: "🌱",
      title: "Farm Fresh Daily",
      description: "Harvested this morning, delivered today",
      color: "from-green-400 to-green-600",
    },
    {
      icon: "🚚",
      title: "Free Delivery",
      description: "Above ₹499, anywhere in Delhi NCR",
      color: "from-blue-400 to-cyan-500",
    },
    {
      icon: "✅",
      title: "100% Organic",
      description: "Certified and lab-tested quality",
      color: "from-amber-400 to-orange-500",
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % features.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  const onSearch = () => {
    if (!query.trim()) return;
    navigate(`/marketplace?q=${encodeURIComponent(query.trim())}`);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      onSearch();
    }
  };

  return (
    <section className="w-full px-4 py-16 bg-gradient-to-br from-organic-cream/30 via-white to-organic-cream/20 relative overflow-hidden min-h-screen flex items-center">
      {/* Animated background elements */}
      <div className="absolute top-10 left-10 text-6xl opacity-10 animate-bounce">
        🥕
      </div>
      <div className="absolute top-20 right-20 text-5xl opacity-10 animate-pulse">
        🍎
      </div>
      <div
        className="absolute bottom-20 left-1/4 text-4xl opacity-10 animate-spin"
        style={{ animationDuration: "20s" }}
      >
        🌽
      </div>
      <div
        className="absolute bottom-10 right-10 text-5xl opacity-10 animate-bounce"
        style={{ animationDelay: "1s" }}
      >
        🍇
      </div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-8xl opacity-5 animate-pulse">
        🌿
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-organic-brown/20 rounded-full animate-bounce"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      <div className="max-w-7xl mx-auto relative z-10 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left: Main Content */}
          <div className="space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center space-x-2 bg-green-500 text-white px-4 py-2 rounded-full font-acme text-sm animate-pulse">
              <Sparkles className="w-4 h-4" />
              <span>#1 ORGANIC STORE IN DELHI NCR</span>
            </div>

            {/* Main Heading */}
            <div className="space-y-4">
              <h1 className="font-acme text-6xl lg:text-7xl text-organic-brown leading-tight">
                <span className="block">Fresh</span>
                <span className="block bg-gradient-to-r from-green-600 to-organic-brown bg-clip-text text-transparent">
                  Organic Life
                </span>
                <span className="block text-4xl lg:text-5xl text-organic-brown/80 font-normal">
                  Delivered to Your Door
                </span>
              </h1>
              <p className="text-xl text-organic-brown/70 max-w-xl leading-relaxed">
                Experience the purest connection between farm and table. Every
                product tells a story of sustainable farming and genuine care.
              </p>
            </div>

            {/* Enhanced Search Bar */}
            <div className="space-y-4">
              <div className="relative max-w-lg">
                <div className="relative flex items-center">
                  <Search className="absolute left-4 w-5 h-5 text-organic-brown/50" />
                  <input
                    type="text"
                    placeholder="What are you craving today?"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="w-full pl-12 pr-24 py-4 text-lg border-2 border-organic-brown rounded-2xl focus:outline-none focus:ring-4 focus:ring-organic-brown/20 focus:border-organic-brown transition-all duration-300 bg-white/80 backdrop-blur-sm shadow-lg"
                  />
                  <button
                    onClick={onSearch}
                    className="absolute right-2 bg-organic-brown text-white px-6 py-2 rounded-xl font-acme hover:bg-organic-black transition-all duration-300 hover:scale-105 shadow-lg flex items-center space-x-2"
                  >
                    <Search className="w-4 h-4" />
                    <span>Search</span>
                  </button>
                </div>

                {/* Search suggestions */}
                {query.length === 0 && <></>}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => navigate("/marketplace")}
                  className="bg-gradient-to-r from-organic-brown to-organic-black text-white px-8 py-4 rounded-2xl font-acme text-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 flex items-center justify-center space-x-3 group"
                >
                  <Leaf className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                  <span>Browse All Products</span>
                </button>
                <button
                  onClick={() => navigate("/about")}
                  className="border-2 border-organic-brown text-organic-brown px-8 py-4 rounded-2xl font-acme text-xl hover:bg-organic-brown hover:text-white transition-all duration-300 hover:scale-105 flex items-center justify-center space-x-3 group"
                >
                  <Heart className="w-6 h-6 group-hover:scale-110 transition-transform" />
                  <span>Our Story</span>
                </button>
              </div>
            </div>

            {/* Trust Indicators */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center space-x-2 text-organic-brown/80">
                <Truck className="w-5 h-5 text-green-500" />
                <span className="text-sm font-medium">Free Delivery ₹499+</span>
              </div>
              <div className="flex items-center space-x-2 text-organic-brown/80">
                <Shield className="w-5 h-5 text-blue-500" />
                <span className="text-sm font-medium">100% Organic</span>
              </div>
              <div className="flex items-center space-x-2 text-organic-brown/80">
                <Award className="w-5 h-5 text-amber-500" />
                <span className="text-sm font-medium">Certified Quality</span>
              </div>
              <div className="flex items-center space-x-2 text-organic-brown/80">
                <Star className="w-5 h-5 text-yellow-500" />
                <span className="text-sm font-medium">4.9/5 Rating</span>
              </div>
            </div>
          </div>

          {/* Right: Interactive Feature Showcase */}
          <div className="relative">
            {/* Main Feature Card */}
            <div className="bg-white rounded-3xl shadow-2xl border-4 border-organic-brown p-8 mb-6 relative overflow-hidden">
              {/* Background pattern */}
              <div className="absolute top-4 right-4 text-6xl opacity-10 animate-pulse">
                {features[currentFeature].icon}
              </div>

              <div className="relative z-10">
                <div
                  className={`inline-flex text-5xl p-4 rounded-2xl bg-gradient-to-br ${features[currentFeature].color} text-white mb-6 shadow-lg`}
                >
                  {features[currentFeature].icon}
                </div>
                <h3 className="font-acme text-3xl text-organic-brown mb-3">
                  {features[currentFeature].title}
                </h3>
                <p className="text-organic-brown/70 text-lg leading-relaxed mb-6">
                  {features[currentFeature].description}
                </p>

                {/* Feature indicators */}
                <div className="flex space-x-2">
                  {features.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentFeature(index)}
                      className={`w-3 h-3 rounded-full transition-all duration-300 ${
                        index === currentFeature
                          ? "bg-organic-brown scale-125"
                          : "bg-organic-brown/30 hover:bg-organic-brown/50"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-organic-brown text-center hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="text-4xl font-acme text-organic-brown mb-2">
                  10,000+
                </div>
                <div className="text-sm text-organic-brown/70">
                  Happy Families
                </div>
                <div className="text-xs text-organic-brown/50 mt-1">
                  Served daily
                </div>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-organic-brown text-center hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="text-4xl font-acme text-organic-brown mb-2">
                  25+
                </div>
                <div className="text-sm text-organic-brown/70">
                  Partner Farms
                </div>
                <div className="text-xs text-organic-brown/50 mt-1">
                  Across NCR
                </div>
              </div>
            </div>

            {/* Floating CTA */}
            {/* Removed New Customer popup as per request */}
          </div>
        </div>

        {/* Bottom Stats Bar */}
        <div className="mt-16 bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border-2 border-organic-brown/20">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-acme text-organic-brown mb-1">
                500+
              </div>
              <div className="text-sm text-organic-brown/70">
                Daily Deliveries
              </div>
            </div>
            <div>
              <div className="text-3xl font-acme text-organic-brown mb-1">
                98%
              </div>
              <div className="text-sm text-organic-brown/70">
                Customer Satisfaction
              </div>
            </div>
            <div>
              <div className="text-3xl font-acme text-organic-brown mb-1">
                24/7
              </div>
              <div className="text-sm text-organic-brown/70">
                Customer Support
              </div>
            </div>
            <div>
              <div className="text-3xl font-acme text-organic-brown mb-1">
                6+
              </div>
              <div className="text-sm text-organic-brown/70">
                Years of Trust
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
