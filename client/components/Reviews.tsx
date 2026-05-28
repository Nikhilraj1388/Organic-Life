import { Star, Quote, CheckCircle, Award } from "lucide-react";
import { useState, useEffect } from "react";

export default function Reviews() {
  const [currentReview, setCurrentReview] = useState(0);

  const reviews = [
    {
      id: 1,
      name: "Sarah Johnson",
      rating: 5,
      comment:
        "Amazing quality! The vegetables are so fresh and the delivery is always on time. Highly recommend!",
      image: "👩‍💼",
      location: "Delhi, India",
      verified: true,
      badge: "Premium Customer",
      date: "2 weeks ago",
    },
    {
      id: 2,
      name: "Michael Chen",
      rating: 5,
      comment:
        "Best organic store I've found. Great variety and excellent customer service. Will definitely order again!",
      image: "👨‍💻",
      location: "Noida, India",
      verified: true,
      badge: "Loyal Customer",
      date: "1 month ago",
    },
    {
      id: 3,
      name: "Emily Rodriguez",
      rating: 5,
      comment:
        "Love the seasonal offers! The quality is outstanding and prices are reasonable for organic products.",
      image: "👩‍🍳",
      location: "Gurgaon, India",
      verified: true,
      badge: "Chef's Choice",
      date: "3 weeks ago",
    },
    {
      id: 4,
      name: "Rajesh Kumar",
      rating: 5,
      comment:
        "The fruits are incredibly fresh and juicy. My family loves the organic produce. Fast delivery too!",
      image: "👨‍👩‍👧‍👦",
      location: "Faridabad, India",
      verified: true,
      badge: "Family Favorite",
      date: "1 week ago",
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentReview((prev) => (prev + 1) % reviews.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [reviews.length]);

  const renderStars = (rating: number) => {
    return (
      <div className="flex justify-center mb-4">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`w-6 h-6 ${
              i < rating
                ? "fill-yellow-400 text-yellow-400 animate-pulse"
                : "text-gray-300"
            }`}
            style={{ animationDelay: `${i * 0.1}s` }}
          />
        ))}
      </div>
    );
  };

  const goToReview = (index: number) => {
    setCurrentReview(index);
  };

  return (
    <section className="w-full px-4 py-16 bg-gradient-to-br from-organic-cream/20 to-white relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-10 right-10 text-5xl opacity-10 animate-bounce">
        💬
      </div>
      <div className="absolute bottom-10 left-10 text-4xl opacity-10 animate-pulse">
        ⭐
      </div>
      <div
        className="absolute top-1/2 left-1/4 text-3xl opacity-10 animate-spin"
        style={{ animationDuration: "20s" }}
      >
        🌟
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-12">
          <div className="inline-flex items-center space-x-2 bg-green-500 text-white px-4 py-2 rounded-full font-acme text-lg mb-4">
            <Award className="w-5 h-5" />
            <span>4.9/5 RATING</span>
          </div>
          <h2 className="font-acme text-5xl text-organic-brown mb-4 drop-shadow-sm">
            What Our Customers Say
          </h2>
          <p className="text-lg text-organic-brown/70 max-w-2xl mx-auto">
            Join thousands of satisfied customers who trust us for their organic
            needs
          </p>
        </div>

        {/* Main Review Display */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="bg-white rounded-2xl shadow-2xl border-4 border-organic-brown p-8 md:p-12 relative overflow-hidden">
            {/* Background pattern */}
            <div className="absolute top-4 right-4 text-6xl opacity-5 animate-pulse">
              "
            </div>
            <div className="absolute bottom-4 left-4 text-6xl opacity-5 animate-pulse">
              "
            </div>

            <div className="relative z-10">
              <div className="text-center">
                {/* Customer Avatar */}
                <div className="w-24 h-24 bg-gradient-to-br from-organic-cream to-organic-brown/20 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-organic-brown shadow-lg">
                  <span className="text-4xl">
                    {reviews[currentReview].image}
                  </span>
                </div>

                {/* Rating */}
                {renderStars(reviews[currentReview].rating)}

                {/* Quote */}
                <div className="relative mb-6">
                  <Quote className="w-8 h-8 text-organic-brown/30 absolute -top-2 -left-2" />
                  <p className="text-xl text-organic-brown/80 leading-relaxed font-medium italic max-w-2xl mx-auto">
                    "{reviews[currentReview].comment}"
                  </p>
                  <Quote className="w-8 h-8 text-organic-brown/30 absolute -bottom-2 -right-2 rotate-180" />
                </div>

                {/* Customer Info */}
                <div className="mb-4">
                  <h3 className="font-acme text-2xl text-organic-brown mb-1">
                    {reviews[currentReview].name}
                  </h3>
                  <div className="flex items-center justify-center space-x-4 text-sm text-organic-brown/60">
                    <span>{reviews[currentReview].location}</span>
                    <span>•</span>
                    <span>{reviews[currentReview].date}</span>
                  </div>
                </div>

                {/* Badges */}
                <div className="flex items-center justify-center space-x-3">
                  {reviews[currentReview].verified && (
                    <div className="flex items-center space-x-1 bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-acme">
                      <CheckCircle className="w-4 h-4" />
                      <span>Verified</span>
                    </div>
                  )}
                  <div className="bg-organic-brown text-white px-3 py-1 rounded-full text-sm font-acme">
                    {reviews[currentReview].badge}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Dots */}
        <div className="flex justify-center space-x-3 mb-8">
          {reviews.map((_, index) => (
            <button
              key={index}
              onClick={() => goToReview(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentReview
                  ? "bg-organic-brown scale-125"
                  : "bg-organic-brown/30 hover:bg-organic-brown/50"
              }`}
            />
          ))}
        </div>

        {/* Review Thumbnails */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
          {reviews.map((review, index) => (
            <button
              key={review.id}
              onClick={() => goToReview(index)}
              className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                index === currentReview
                  ? "border-organic-brown bg-organic-cream shadow-lg scale-105"
                  : "border-organic-brown/20 bg-white hover:border-organic-brown/50 hover:shadow-md"
              }`}
            >
              <div className="text-center">
                <div className="text-3xl mb-2">{review.image}</div>
                <div className="text-sm font-acme text-organic-brown truncate">
                  {review.name}
                </div>
                <div className="flex justify-center mt-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3 h-3 ${
                        i < review.rating
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12 max-w-4xl mx-auto">
          <div className="text-center bg-white rounded-xl p-4 shadow-md border-2 border-organic-brown/20">
            <div className="text-3xl font-acme text-organic-brown mb-1">
              5000+
            </div>
            <div className="text-sm text-organic-brown/70">Happy Customers</div>
          </div>
          <div className="text-center bg-white rounded-xl p-4 shadow-md border-2 border-organic-brown/20">
            <div className="text-3xl font-acme text-organic-brown mb-1">
              4.9/5
            </div>
            <div className="text-sm text-organic-brown/70">Average Rating</div>
          </div>
          <div className="text-center bg-white rounded-xl p-4 shadow-md border-2 border-organic-brown/20">
            <div className="text-3xl font-acme text-organic-brown mb-1">
              98%
            </div>
            <div className="text-sm text-organic-brown/70">
              Satisfaction Rate
            </div>
          </div>
          <div className="text-center bg-white rounded-xl p-4 shadow-md border-2 border-organic-brown/20">
            <div className="text-3xl font-acme text-organic-brown mb-1">
              24/7
            </div>
            <div className="text-sm text-organic-brown/70">
              Customer Support
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-12">
          <div className="bg-gradient-to-r from-organic-brown to-organic-black rounded-2xl p-8 text-white max-w-2xl mx-auto shadow-xl">
            <h3 className="font-acme text-3xl mb-4">
              Join Our Happy Customers
            </h3>
            <p className="mb-6 opacity-90">
              Experience the difference with our premium organic products. Start
              your journey today!
            </p>
            <button className="bg-white text-organic-brown px-8 py-4 rounded-xl font-acme text-xl hover:bg-organic-cream transition-all duration-300 hover:scale-105 shadow-lg">
              Shop Now
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
