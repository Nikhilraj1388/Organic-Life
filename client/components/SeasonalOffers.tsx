import { Link } from "react-router-dom";
import { Clock, ShoppingCart, Flame } from "lucide-react";
import { useState, useEffect } from "react";

export default function SeasonalOffers() {
  const [timeLeft, setTimeLeft] = useState({
    hours: 24,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return prev;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const offers = [
    {
      id: 1,
      title: "Monsoon Special",
      discount: "25% OFF",
      originalPrice: "₹800",
      salePrice: "₹600",
      description: "Fresh seasonal vegetables and fruits",
      icon: "🌧️",
      bgGradient: "from-blue-400 to-cyan-500",
      urgency: "Limited Time",
      progress: 75,
    },
    {
      id: 2,
      title: "Organic Bundle",
      discount: "30% OFF",
      originalPrice: "₹850",
      salePrice: "₹595",
      description: "Complete organic family pack",
      icon: "🥬",
      bgGradient: "from-green-400 to-emerald-500",
      urgency: "Best Seller",
      progress: 60,
    },
    {
      id: 3,
      title: "Delhi Farm Fresh",
      discount: "20% OFF",
      originalPrice: "₹600",
      salePrice: "₹480",
      description: "Direct from NCR organic farms",
      icon: "🌾",
      bgGradient: "from-amber-400 to-orange-500",
      urgency: "Flash Sale",
      progress: 85,
    },
  ];

  return (
    <section className="w-full px-4 py-16 bg-gradient-to-br from-white to-organic-cream/20 relative overflow-hidden">
      {/* Animated background elements */}
      <div
        className="absolute top-8 left-8 text-4xl opacity-10 animate-spin"
        style={{ animationDuration: "20s" }}
      >
        🌟
      </div>
      <div className="absolute top-16 right-16 text-3xl opacity-10 animate-bounce">
        💫
      </div>
      <div className="absolute bottom-12 left-12 text-5xl opacity-10 animate-pulse">
        ✨
      </div>
      <div
        className="absolute bottom-8 right-8 text-4xl opacity-10 animate-spin"
        style={{ animationDuration: "15s" }}
      >
        ⭐
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-12">
          <div className="inline-flex items-center space-x-2 bg-red-500 text-white px-4 py-2 rounded-full font-acme text-lg mb-4 animate-pulse">
            <Flame className="w-5 h-5" />
            <span>LIMITED TIME OFFERS</span>
          </div>
          <h2 className="font-acme text-5xl text-organic-brown mb-4 drop-shadow-sm">
            Seasonal Offers
          </h2>
          <p className="text-lg text-organic-brown/70 max-w-2xl mx-auto mb-8">
            Don't miss out on our exclusive seasonal deals! Fresh, organic, and
            affordable.
          </p>

          {/* Countdown Timer */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-organic-brown inline-block">
            <div className="flex items-center space-x-4 text-organic-brown">
              <Clock className="w-6 h-6" />
              <span className="font-acme text-xl">Offer ends in:</span>
              <div className="flex space-x-3">
                <div className="text-center">
                  <div className="bg-organic-brown text-white rounded-lg px-3 py-2 font-acme text-2xl min-w-[60px]">
                    {timeLeft.hours.toString().padStart(2, "0")}
                  </div>
                  <div className="text-sm mt-1">Hours</div>
                </div>
                <div className="text-center">
                  <div className="bg-organic-brown text-white rounded-lg px-3 py-2 font-acme text-2xl min-w-[60px]">
                    {timeLeft.minutes.toString().padStart(2, "0")}
                  </div>
                  <div className="text-sm mt-1">Minutes</div>
                </div>
                <div className="text-center">
                  <div className="bg-organic-brown text-white rounded-lg px-3 py-2 font-acme text-2xl min-w-[60px]">
                    {timeLeft.seconds.toString().padStart(2, "0")}
                  </div>
                  <div className="text-sm mt-1">Seconds</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {offers.map((offer, index) => (
            <div
              key={offer.id}
              className="group relative bg-white rounded-2xl shadow-xl border-2 border-organic-brown overflow-hidden hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
              style={{ animationDelay: `${index * 0.2}s` }}
            >
              {/* Background gradient */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${offer.bgGradient} opacity-10 group-hover:opacity-20 transition-opacity duration-500`}
              ></div>

              {/* Urgency badge */}
              <div className="absolute top-4 left-4 z-20">
                <div className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-acme animate-pulse">
                  {offer.urgency}
                </div>
              </div>

              {/* Discount badge */}
              <div className="absolute top-4 right-4 z-20">
                <div className="bg-green-500 text-white px-4 py-2 rounded-full font-acme text-lg font-bold animate-bounce">
                  {offer.discount}
                </div>
              </div>

              {/* Main content */}
              <div className="relative z-10 p-8">
                <div className="text-center mb-6">
                  <div
                    className="text-7xl mb-4 animate-bounce"
                    style={{ animationDelay: `${index * 0.3}s` }}
                  >
                    {offer.icon}
                  </div>
                  <h3 className="font-acme text-2xl text-organic-brown mb-2">
                    {offer.title}
                  </h3>
                  <p className="text-organic-brown/70 text-sm mb-4">
                    {offer.description}
                  </p>
                </div>

                {/* Price section */}
                <div className="text-center mb-6">
                  <div className="flex items-center justify-center space-x-3 mb-2">
                    <span className="text-lg text-gray-500 line-through">
                      {offer.originalPrice}
                    </span>
                    <span className="font-acme text-3xl text-green-600 font-bold">
                      {offer.salePrice}
                    </span>
                  </div>
                  <div className="text-sm text-organic-brown/60">
                    Save ₹
                    {(
                      parseInt(offer.originalPrice.replace("₹", "")) -
                      parseInt(offer.salePrice.replace("₹", ""))
                    ).toLocaleString()}
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mb-6">
                  <div className="flex justify-between text-sm text-organic-brown/70 mb-2">
                    <span>Availability</span>
                    <span>{offer.progress}% left</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full transition-all duration-1000"
                      style={{ width: `${offer.progress}%` }}
                    ></div>
                  </div>
                </div>

                {/* CTA Button */}
                <Link
                  to={`/marketplace?offer=${offer.id}`}
                  className="w-full bg-organic-brown text-white py-4 rounded-xl font-acme text-xl hover:bg-organic-black transition-all duration-300 flex items-center justify-center space-x-2 group/btn shadow-lg"
                >
                  <ShoppingCart className="w-5 h-5 group-hover/btn:scale-110 transition-transform" />
                  <span>Shop Now</span>
                </Link>
              </div>

              {/* Hover effect overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-12">
          <div className="bg-white rounded-2xl p-8 shadow-lg border-2 border-organic-brown max-w-2xl mx-auto">
            <h3 className="font-acme text-3xl text-organic-brown mb-4">
              Don't Miss Out!
            </h3>
            <p className="text-organic-brown/70 mb-6">
              These offers are updated regularly. Follow us for the latest deals
              and seasonal specials.
            </p>
            <Link
              to="/marketplace"
              className="inline-flex items-center space-x-2 bg-gradient-to-r from-organic-brown to-organic-black text-white px-8 py-4 rounded-xl font-acme text-xl hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              <span>View All Offers</span>
              <ShoppingCart className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
