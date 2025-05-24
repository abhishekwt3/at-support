// app/page.js
"use client";

import { 
  Navigation, 
  HeroSection, 
  FeaturesSection, 
  PricingTestimonialsSection, 
  FAQFooterSection 
} from './components/LandingPageSections';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <HeroSection />
      <FeaturesSection />
      <PricingTestimonialsSection />
      <FAQFooterSection />
    </div>
  );
}