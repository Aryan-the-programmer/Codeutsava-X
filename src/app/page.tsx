import type { Metadata } from 'next';
import { ExperienceShell } from '@/components/intro/ExperienceShell';
import { GlitchverseHero } from '@/components/hero/GlitchverseHero';
import { SponsorSection } from "@/components/sponsor-section/SponsorSection";
import { TimelineRoad } from '@/components/timeline/TimelineRoad';
import { GuidelinesSection } from '@/components/sections/guidelines-section';
import { PrizesSection } from '@/components/sections/prizes-section';
import { EventSections } from '@/components/sections/EventSections';
import { AboutSection } from '@/components/sections/about-section';
import { BackgroundVideo } from '@/components/layout/BackgroundVideo';

export const metadata: Metadata = {
  title: 'Codeutsava X.0 - Build Beyond the Screen',
  description: 'Enter the Glitchverse at Codeutsava X.0, where ideas break the expected and compile into something real.',
};

export default function Home() {
  return (
    <>
      <BackgroundVideo />
      <ExperienceShell>
        <div className='flex min-h-screen flex-col bg-transparent'>
          <GlitchverseHero />
        <SponsorSection />
        <TimelineRoad />
        <GuidelinesSection />
        <PrizesSection />
        <EventSections />
      </div>
    </ExperienceShell>
      </>

  );
}
