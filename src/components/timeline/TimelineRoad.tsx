'use client';

import React, { useState, useEffect, useRef } from 'react';
import { TimelineEvent, TIMELINE_EVENTS } from '@/data/timelineEvents';
import { TimelineCanvas3D } from './TimelineCanvas3D';
import { retroAudio } from '@/utils/audioEffects';
import {
  Volume2,
  VolumeX,
  FastForward
} from 'lucide-react';

interface GlitchTextProps {
  text: string;
  className?: string;
}

const GlitchText: React.FC<GlitchTextProps> = ({ text, className = '' }) => {
  return (
    <span className={`relative inline-block ${className}`}>
      <span className="relative z-10">{text}</span>
      <span
        aria-hidden="true"
        className="absolute inset-0 text-[#FF5FCF] opacity-70 clip-path-glitch-1 animate-pulse -translate-x-[1px] translate-y-[1px] pointer-events-none"
      >
        {text}
      </span>
      <span
        aria-hidden="true"
        className="absolute inset-0 text-[#00F0FF] opacity-70 clip-path-glitch-2 animate-pulse translate-x-[1px] -translate-y-[1px] pointer-events-none"
      >
        {text}
      </span>
    </span>
  );
};

export const TimelineRoad: React.FC = () => {
  const stickyContainerRef = useRef<HTMLDivElement | null>(null);
  const [activeEventIndex, setActiveEventIndex] = useState<number>(0);
  const [scrollProgress, setScrollProgress] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(retroAudio.getMuted());
  const [isMobile, setIsMobile] = useState<boolean>(false);

  useEffect(() => {
    return retroAudio.subscribe((muted) => setIsMuted(muted));
  }, []);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // STICKY SCROLL PROGRESS TRACKING
  useEffect(() => {
    let ticking = false;
    let lastProgress = -1;

    const updateScroll = () => {
      if (!stickyContainerRef.current) {
        ticking = false;
        return;
      }
      const rect = stickyContainerRef.current.getBoundingClientRect();
      const totalScrollDistance = rect.height - window.innerHeight;
      const currentScrollTop = -rect.top;

      if (totalScrollDistance > 0) {
        const progress = Math.max(0, Math.min(1, currentScrollTop / totalScrollDistance));
        if (Math.abs(progress - lastProgress) > 0.0002 || progress === 0 || progress === 1) {
          lastProgress = progress;
          setScrollProgress(progress);
        }
      }
      ticking = false;
    };

    const handleScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(updateScroll);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    updateScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleSelectEvent = React.useCallback((index: number) => {
    setActiveEventIndex(prev => prev === index ? prev : index);
  }, []);

  const toggleMute = () => {
    const nextMuted = retroAudio.toggleMute();
    setIsMuted(nextMuted);
    if (!nextMuted) retroAudio.playXPDing();
  };

  const handleSkipSection = () => {
    if (!stickyContainerRef.current) return;
    const nextEl = stickyContainerRef.current.nextElementSibling;
    if (nextEl) {
      nextEl.scrollIntoView({ behavior: 'smooth' });
    } else {
      const rect = stickyContainerRef.current.getBoundingClientRect();
      window.scrollTo({
        top: window.scrollY + rect.bottom,
        behavior: 'smooth'
      });
    }
    retroAudio.playXPDing();
  };

  return (
    // Sticky scroll container with optimized runway for all 9 stages
    <section
      id="timeline"
      ref={stickyContainerRef}
      className="relative w-full bg-transparent"
      style={{ height: `${isMobile ? (TIMELINE_EVENTS.length + 1.2) * 38 : (TIMELINE_EVENTS.length + 2.5) * 75}vh` }}
    >
      {/* FULLSCREEN PINNED STICKY VIEWPORT (100vw x 100vh) */}
      <div className="sticky top-0 w-full h-[100svh] overflow-hidden flex flex-col justify-between select-none">

        {/* 1. FULL-BLEED 3D PERSPECTIVE CANVAS */}
        <TimelineCanvas3D
          activeEventIndex={activeEventIndex}
          onSelectEvent={handleSelectEvent}
          scrollProgress={scrollProgress}
          setScrollProgress={setScrollProgress}
        />

        {/* 2. TOP FLOATING HUD OVERLAY */}
        <div className="relative z-40 w-full pt-4 sm:pt-6 px-4 sm:px-10 pointer-events-none flex items-start justify-between">

          {/* Left Headline */}
          <div className="pointer-events-auto max-w-xl">
            <h2
              className="text-2xl sm:text-4xl lg:text-[44px] uppercase select-none leading-[0.92] tracking-[-0.045em] drop-shadow-[0_0_20px_rgba(0,0,0,0.8)]"
              style={{ fontFamily: '"Arial Narrow", "Helvetica Neue", Arial, sans-serif', fontWeight: 800 }}
            >
              <span className="text-white">THE </span>
              <GlitchText text="TIMELINE" className="text-[#FAEB92]" />
              <span className="text-white"> TO THE</span>
              <br />
              <span
                className="text-[#FF5FCF] inline-block mt-1"
                style={{
                  textShadow: '3px 3px 0 #9929EA, 0 0 20px rgba(255,95,207,0.5)',
                  filter: 'drop-shadow(0 0 15px rgba(255,95,207,0.4))'
                }}
              >
                GLITCHVERSE
              </span>
            </h2>
          </div>

          {/* Right Controls: Skip Section Button + Volume Toggle Button */}
          <div className="pointer-events-auto flex items-center gap-2 sm:gap-3">
            {/* Skip Section Button */}
            <button
              type="button"
              onClick={handleSkipSection}
              className="h-10 px-3 sm:px-4 rounded-xl flex items-center gap-1.5 sm:gap-2 transition-all duration-300 cursor-pointer border shadow-lg bg-[#9929EA]/25 text-[#FAEB92] border-[#FF5FCF]/50 hover:bg-[#9929EA]/40 hover:scale-105 shadow-[0_0_20px_rgba(153,41,234,0.4)] text-[11px] sm:text-xs font-mono font-bold uppercase tracking-wider"
              title="Skip Timeline Section"
              aria-label="Skip Timeline Section"
            >
              <span>SKIP</span>
              <FastForward className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#FF5FCF] drop-shadow-[0_0_8px_#FF5FCF]" />
            </button>

            {/* Sleek Purple Volume Toggle Button */}
            <button
              type="button"
              onClick={toggleMute}
              className={`
                w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 cursor-pointer border shadow-lg
                ${!isMuted
                  ? 'bg-[#9929EA]/25 text-[#FF5FCF] border-[#FF5FCF]/50 hover:bg-[#9929EA]/40 hover:scale-105 shadow-[0_0_20px_rgba(153,41,234,0.4)]'
                  : 'bg-black/60 text-gray-500 border-white/10 hover:bg-black/80 hover:text-gray-300'
                }
              `}
              title={isMuted ? 'Unmute Timeline SFX' : 'Mute Timeline SFX'}
              aria-label={isMuted ? 'Unmute Timeline SFX' : 'Mute Timeline SFX'}
            >
              {!isMuted ? (
                <Volume2 className="w-5 h-5 text-[#FF5FCF] drop-shadow-[0_0_8px_#FF5FCF]" />
              ) : (
                <VolumeX className="w-5 h-5 text-gray-500" />
              )}
            </button>
          </div>
        </div>

        {/* Empty bottom spacer for pristine clean view */}
        <div className="relative z-40 w-full pointer-events-none pb-4" />
      </div>
    </section>
  );
};
