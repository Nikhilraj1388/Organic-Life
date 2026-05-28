import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle, Users, Award, Heart } from "lucide-react";
import { useState } from "react";

export default function ExploreJourney() {
  const [activeStep, setActiveStep] = useState(0);

  const journeySteps = [
    {
      id: 1,
      year: "2018",
      title: "Our Beginning",
      description:
        "Started with a small farm in Delhi NCR, committed to organic farming practices.",
      icon: "🌱",
      stats: "5 Acres",
      color: "from-green-400 to-green-600",
    },
    {
      id: 2,
      year: "2019",
      title: "First Harvest",
      description:
        "Our first successful organic harvest, supplying to local restaurants and families.",
      icon: "🌾",
      stats: "50 Families",
      color: "from-amber-400 to-orange-500",
    },
    {
      id: 3,
      year: "2020",
      title: "Digital Transformation",
      description:
        "Launched our online platform, making organic products accessible to everyone.",
      icon: "💻",
      stats: "1000+ Orders",
      color: "from-blue-400 to-cyan-500",
    },
    {
      id: 4,
      year: "2021",
      title: "Expansion",
      description:
        "Partnered with 25+ local farms, expanding our product range significantly.",
      icon: "🤝",
      stats: "25 Farms",
      color: "from-purple-400 to-pink-500",
    },
    {
      id: 5,
      year: "2022",
      title: "Quality Certification",
      description:
        "Achieved international organic certification, ensuring highest quality standards.",
      icon: "🏆",
      stats: "ISO Certified",
      color: "from-red-400 to-pink-500",
    },
    {
      id: 6,
      year: "2023",
      title: "Community Impact",
      description:
        "Supporting local farmers and communities, creating sustainable livelihoods.",
      icon: "❤️",
      stats: "5000+ Lives",
      color: "from-pink-400 to-rose-500",
    },
    {
      id: 7,
      year: "2024",
      title: "Future Forward",
      description:
        "Innovating with new technologies while staying true to our organic roots.",
      icon: "🚀",
      stats: "Growing Strong",
      color: "from-indigo-400 to-purple-500",
    },
  ];

  const features = [
    {
      icon: "🌱",
      title: "Farm Fresh",
      description:
        "Sourced directly from local organic farms with utmost care and quality.",
      color: "from-green-400 to-green-600",
    },
    {
      icon: "🚚",
      title: "Fast Delivery",
      description:
        "Quick and reliable delivery ensuring freshness at your doorstep.",
      color: "from-blue-400 to-cyan-500",
    },
    {
      icon: "✅",
      title: "100% Organic",
      description:
        "Certified organic products that promote health and sustainability.",
      color: "from-amber-400 to-orange-500",
    },
  ];

  return (
    <section className="w-full px-4 py-16 bg-gradient-to-br from-white to-organic-cream/30 relative overflow-hidden">
      {/* Background decorative elements */}
      <div
        className="absolute top-8 left-8 text-4xl opacity-10 animate-spin"
        style={{ animationDuration: "25s" }}
      >
        🌿
      </div>
      <div className="absolute top-16 right-16 text-3xl opacity-10 animate-bounce">
        🌸
      </div>
      <div className="absolute bottom-12 left-12 text-5xl opacity-10 animate-pulse">
        🌻
      </div>
      <div
        className="absolute bottom-8 right-8 text-4xl opacity-10 animate-spin"
        style={{ animationDuration: "20s" }}
      >
        🌺
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center space-x-2 bg-organic-brown text-white px-4 py-2 rounded-full font-acme text-lg mb-4">
            <Heart className="w-5 h-5" />
            <span>OUR STORY</span>
          </div>
          <h2 className="font-acme text-5xl text-organic-brown mb-4 drop-shadow-sm">
            Explore Our Journey
          </h2>
          <p className="text-lg text-organic-brown/70 max-w-2xl mx-auto">
            From a small farm to a thriving community, discover how we've grown
            while staying true to our organic roots
          </p>
        </div>

        {/* Interactive Timeline */}
        <div className="relative mb-16">
          {/* Timeline line */}
          <div className="absolute left-1/2 transform -translate-x-1/2 w-1 bg-gradient-to-b from-organic-brown to-organic-brown/50 h-full rounded-full"></div>

          <div className="space-y-12">
            {journeySteps.map((step, index) => (
              <div
                key={step.id}
                className={`flex items-center ${index % 2 === 0 ? "flex-row" : "flex-row-reverse"} relative`}
              >
                {/* Timeline dot */}
                <div
                  className={`absolute left-1/2 transform -translate-x-1/2 w-6 h-6 bg-gradient-to-br ${step.color} rounded-full border-4 border-white shadow-lg z-10`}
                ></div>

                {/* Content */}
                <div
                  className={`w-1/2 ${index % 2 === 0 ? "pr-12 text-right" : "pl-12 text-left"}`}
                >
                  <div
                    className={`bg-white rounded-2xl p-6 shadow-xl border-2 border-organic-brown hover:shadow-2xl transition-all duration-500 cursor-pointer ${
                      activeStep === index
                        ? "scale-105 border-organic-brown"
                        : "hover:scale-102"
                    }`}
                    onClick={() => setActiveStep(index)}
                  >
                    <div className="flex items-center space-x-4 mb-4">
                      <div
                        className={`text-4xl p-3 rounded-full bg-gradient-to-br ${step.color} text-white`}
                      >
                        {step.icon}
                      </div>
                      <div>
                        <div className="font-acme text-2xl text-organic-brown">
                          {step.year}
                        </div>
                        <div className="text-sm font-bold text-organic-brown/70">
                          {step.stats}
                        </div>
                      </div>
                    </div>
                    <h3 className="font-acme text-xl text-organic-brown mb-2">
                      {step.title}
                    </h3>
                    <p className="text-organic-brown/70 text-sm leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>

                {/* Empty space for the other side */}
                <div className="w-1/2"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Current Step Highlight */}
        <div className="bg-white rounded-2xl p-8 shadow-2xl border-4 border-organic-brown mb-16 max-w-4xl mx-auto">
          <div className="text-center">
            <div
              className={`inline-flex text-6xl p-4 rounded-full bg-gradient-to-br ${journeySteps[activeStep].color} text-white mb-6 shadow-lg`}
            >
              {journeySteps[activeStep].icon}
            </div>
            <h3 className="font-acme text-3xl text-organic-brown mb-2">
              {journeySteps[activeStep].year} - {journeySteps[activeStep].title}
            </h3>
            <p className="text-lg text-organic-brown/70 mb-4 max-w-2xl mx-auto">
              {journeySteps[activeStep].description}
            </p>
            <div className="text-2xl font-acme text-organic-brown font-bold">
              {journeySteps[activeStep].stats}
            </div>
          </div>
        </div>

        {/* Key Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-8 shadow-xl border-2 border-organic-brown hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 group"
              style={{ animationDelay: `${index * 0.2}s` }}
            >
              <div className="text-center">
                <div
                  className={`inline-flex text-5xl p-4 rounded-full bg-gradient-to-br ${feature.color} text-white mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}
                >
                  {feature.icon}
                </div>
                <h3 className="font-acme text-2xl text-organic-brown mb-3">
                  {feature.title}
                </h3>
                <p className="text-organic-brown/70 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Mission Statement */}
        <div className="bg-gradient-to-r from-organic-brown to-organic-black rounded-2xl p-12 text-white text-center shadow-2xl">
          <h3 className="font-acme text-4xl mb-6 drop-shadow-lg">
            Our Mission
          </h3>
          <p className="text-xl leading-relaxed mb-8 max-w-4xl mx-auto opacity-90">
            At Organic Life, we believe in providing the highest quality organic
            products to nourish your family. Our journey began with a simple
            mission: to make organic, healthy food accessible to everyone while
            supporting local farmers and promoting sustainable agriculture.
          </p>
          <div className="flex flex-wrap justify-center gap-6 mb-8">
            <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
              <CheckCircle className="w-5 h-5" />
              <span>100% Organic</span>
            </div>
            <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
              <Users className="w-5 h-5" />
              <span>Local Farmers</span>
            </div>
            <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
              <Award className="w-5 h-5" />
              <span>Quality Certified</span>
            </div>
          </div>
          <Link
            to="/about"
            className="inline-flex items-center space-x-3 bg-white text-organic-brown px-8 py-4 rounded-xl font-acme text-xl hover:bg-organic-cream transition-all duration-300 hover:scale-105 shadow-lg group"
          >
            <span>Learn More About Us</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Impact Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 max-w-4xl mx-auto">
          <div className="text-center bg-white rounded-xl p-6 shadow-md border-2 border-organic-brown/20">
            <div className="text-4xl font-acme text-organic-brown mb-2">
              25+
            </div>
            <div className="text-sm text-organic-brown/70">Partner Farms</div>
          </div>
          <div className="text-center bg-white rounded-xl p-6 shadow-md border-2 border-organic-brown/20">
            <div className="text-4xl font-acme text-organic-brown mb-2">
              5000+
            </div>
            <div className="text-sm text-organic-brown/70">Happy Families</div>
          </div>
          <div className="text-center bg-white rounded-xl p-6 shadow-md border-2 border-organic-brown/20">
            <div className="text-4xl font-acme text-organic-brown mb-2">
              100%
            </div>
            <div className="text-sm text-organic-brown/70">
              Organic Certified
            </div>
          </div>
          <div className="text-center bg-white rounded-xl p-6 shadow-md border-2 border-organic-brown/20">
            <div className="text-4xl font-acme text-organic-brown mb-2">6+</div>
            <div className="text-sm text-organic-brown/70">Years of Trust</div>
          </div>
        </div>
      </div>
    </section>
  );
}
