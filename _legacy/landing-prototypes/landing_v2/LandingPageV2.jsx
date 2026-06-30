import React from 'react';
import HeroV2 from './HeroV2';
import FeaturesBentoV2 from './FeaturesBentoV2';
import SocialProofV2 from './SocialProofV2';
import PricingAndRoiV2 from './PricingAndRoiV2';

export default function LandingPageV2() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 font-sans selection:bg-sky-500/30 selection:text-white">
      <HeroV2 />
      <FeaturesBentoV2 />
      <SocialProofV2 />
      <PricingAndRoiV2 />
    </div>
  );
}
