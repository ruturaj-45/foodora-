import React from 'react';
import { HeroSection } from '../../components/home/HeroSection';
import { CategorySection } from '../../components/home/CategorySection';
import { OffersSection } from '../../components/home/OffersSection';
import { FeaturedRestaurants } from '../../components/home/FeaturedRestaurants';
import { TrendingDishes } from '../../components/home/TrendingDishes';
import { AIRecommendations } from '../../components/home/AIRecommendations';
import { HowItWorks } from '../../components/home/HowItWorks';

const HomePage: React.FC = () => (
  <div>
    <HeroSection />
    <CategorySection />
    <OffersSection />
    <FeaturedRestaurants />
    <TrendingDishes />
    <AIRecommendations />
    <HowItWorks />
  </div>
);

export default HomePage;
