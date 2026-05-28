import Hero from "../components/Hero";
import FeaturedCategories from "../components/FeaturedCategories";
import SeasonalOffers from "../components/SeasonalOffers";
import Reviews from "../components/Reviews";
import ExploreJourney from "../components/ExploreJourney";
// Header and Footer are provided by Layout

export default function Index() {
  return (
    <div className="min-h-screen bg-white">
      <main>
        <Hero />
        <FeaturedCategories />
        <SeasonalOffers />
        <Reviews />
        <ExploreJourney />
      </main>
    </div>
  );
}
