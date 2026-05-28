import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, ShoppingBag } from "lucide-react";
import { useState } from "react";

export default function FeaturedCategories() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const categories = [
    {
      id: 1,
      title: "Fresh Vegetables",
      description: "Organic vegetables straight from the farm",
      productCount: "25+ Products",
      gradient: "from-green-400 to-green-600",
      icon: "🥦",
      bgPattern: "🌱",
    },
    {
      id: 2,
      title: "Organic Fruits",
      description: "Sweet and nutritious seasonal fruits",
      productCount: "18+ Products",
      gradient: "from-red-400 to-pink-500",
      icon: "🍎",
      bgPattern: "🌸",
    },
    {
      id: 3,
      title: "Dairy Products",
      description: "Pure and natural dairy essentials",
      productCount: "12+ Products",
      gradient: "from-yellow-400 to-orange-500",
      icon: "🥛",
      bgPattern: "🌞",
    },
    {
      id: 4,
      title: "Whole Grains",
      description: "Nutrient-rich grains and cereals",
      productCount: "15+ Products",
      gradient: "from-amber-400 to-yellow-600",
      icon: "🌾",
      bgPattern: "🌻",
    },
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % categories.length);
  };

  const prevSlide = () => {
    setCurrentSlide(
      (prev) => (prev - 1 + categories.length) % categories.length,
    );
  };

  return (
    <section className="w-full px-4 py-16 bg-gradient-to-br from-organic-cream/30 to-white relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-10 left-10 text-6xl opacity-10 animate-bounce">
        🥕
      </div>
      <div className="absolute top-20 right-20 text-5xl opacity-10 animate-pulse">
        🍇
      </div>
      <div
        className="absolute bottom-10 left-1/4 text-4xl opacity-10 animate-bounce"
        style={{ animationDelay: "1s" }}
      >
        🌽
      </div>
      <div
        className="absolute bottom-20 right-10 text-5xl opacity-10 animate-pulse"
        style={{ animationDelay: "0.5s" }}
      >
        🍑
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-12">
          <h2 className="font-acme text-5xl text-organic-brown mb-4 drop-shadow-sm">
            Featured Categories
          </h2>
          <p className="text-lg text-organic-brown/70 max-w-2xl mx-auto">
            Discover our handpicked selection of premium organic products,
            sourced directly from local farms
          </p>
        </div>

        {/* Carousel Container */}
        <div className="relative max-w-6xl mx-auto">
          <div className="overflow-hidden rounded-2xl shadow-2xl bg-white border-4 border-organic-brown">
            <div
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {categories.map((category) => (
                <div key={category.id} className="w-full flex-shrink-0">
                  <div
                    className={`relative h-96 bg-gradient-to-br ${category.gradient} flex items-center justify-center overflow-hidden`}
                  >
                    {/* Background pattern */}
                    <div className="absolute inset-0 flex items-center justify-center text-9xl opacity-20">
                      {category.bgPattern}
                    </div>

                    {/* Content */}
                    <div className="relative z-10 text-center text-white p-8 max-w-md mx-auto">
                      <div className="text-8xl mb-6 animate-bounce">
                        {category.icon}
                      </div>
                      <h3 className="font-acme text-4xl mb-3 drop-shadow-lg">
                        {category.title}
                      </h3>
                      <p className="text-lg mb-4 opacity-90 leading-relaxed">
                        {category.description}
                      </p>
                      <div className="bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 inline-block mb-6">
                        <span className="font-acme text-lg">
                          {category.productCount}
                        </span>
                      </div>
                      <Link
                        to={`/marketplace?category=${encodeURIComponent(category.title)}`}
                        className="inline-flex items-center space-x-2 bg-white text-organic-brown px-8 py-3 rounded-full font-acme text-xl hover:bg-organic-cream transition-all duration-300 hover:scale-105 shadow-lg group"
                      >
                        <ShoppingBag className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        <span>Explore Now</span>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Buttons */}
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm text-organic-brown p-3 rounded-full shadow-lg hover:bg-white hover:scale-110 transition-all duration-300 border-2 border-organic-brown"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm text-organic-brown p-3 rounded-full shadow-lg hover:bg-white hover:scale-110 transition-all duration-300 border-2 border-organic-brown"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Dots Indicator */}
          <div className="flex justify-center space-x-3 mt-8">
            {categories.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentSlide
                    ? "bg-organic-brown scale-125"
                    : "bg-organic-brown/30 hover:bg-organic-brown/50"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12 max-w-4xl mx-auto">
          <div className="text-center bg-white rounded-xl p-4 shadow-md border-2 border-organic-brown/20">
            <div className="text-3xl font-acme text-organic-brown mb-1">
              70+
            </div>
            <div className="text-sm text-organic-brown/70">Products</div>
          </div>
          <div className="text-center bg-white rounded-xl p-4 shadow-md border-2 border-organic-brown/20">
            <div className="text-3xl font-acme text-organic-brown mb-1">
              25+
            </div>
            <div className="text-sm text-organic-brown/70">Farmers</div>
          </div>
          <div className="text-center bg-white rounded-xl p-4 shadow-md border-2 border-organic-brown/20">
            <div className="text-3xl font-acme text-organic-brown mb-1">
              100%
            </div>
            <div className="text-sm text-organic-brown/70">Organic</div>
          </div>
          <div className="text-center bg-white rounded-xl p-4 shadow-md border-2 border-organic-brown/20">
            <div className="text-3xl font-acme text-organic-brown mb-1">
              24/7
            </div>
            <div className="text-sm text-organic-brown/70">Support</div>
          </div>
        </div>
      </div>
    </section>
  );
}
