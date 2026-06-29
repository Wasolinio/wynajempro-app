import React from 'react';
import HeroApple from './HeroApple';
import FeaturesApple from './FeaturesApple';
import SocialProofApple from './SocialProofApple';
import PricingApple from './PricingApple';

export default function LandingPageApple() {
  return (
    <div className="bg-white min-h-screen text-neutral-900 font-sans selection:bg-neutral-200">
      <HeroApple />
      <FeaturesApple />
      <SocialProofApple />
      <PricingApple />
    </div>
  );
}
