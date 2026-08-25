"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Navbar } from "@/components/navbar/Navbar";
import { GlitchButton } from "@/components/ui/glitch-button";
import { cyberSoundtrack } from "@/utils/cyberSoundtrack";
import styles from "./GlitchverseHero.module.css";

const registrationUrl = "https://codeutsava-x.devfolio.co/overview";

export function GlitchverseHero() {
  const [isPlaying, setIsPlaying] = useState<boolean>(cyberSoundtrack.getIsPlaying());

  useEffect(() => {
    return cyberSoundtrack.subscribe((playing) => setIsPlaying(playing));
  }, []);

  const toggleMusic = () => {
    const isMuted = cyberSoundtrack.toggleMute();
    setIsPlaying(!isMuted);
  };
  return (
    <main className={styles.hero} id="top">
      <div className={styles.ambientLight} aria-hidden="true" />
      <div className={styles.noise} aria-hidden="true" />
      <Navbar />

      <section className={styles.heroStage} aria-labelledby="hero-title">
        <p className={styles.eyebrow}>WELCOME TO</p>

        <div className={styles.pagerShell}>
          <span className={styles.pagerTopRidge} aria-hidden="true"><i /><i /><i /></span>
          <span className={styles.pagerSpeaker} aria-hidden="true"><i /><i /><i /><i /><i /></span>
          <span className={styles.pagerControls} aria-hidden="true"><i /><i /></span>

          <div className={styles.pagerViewport}>
            <span className={styles.screenScanlines} aria-hidden="true" />
            <span className={`${styles.screenGlitchBand} ${styles.screenGlitchBandTop}`} aria-hidden="true" />
            <span className={`${styles.screenGlitchBand} ${styles.screenGlitchBandBottom}`} aria-hidden="true" />

            <h1 className={styles.identity} id="hero-title" aria-label="CodeUtsava X point zero, tenth edition">
              <span className={styles.wordmark} data-text="CODEUTSAVA">CODEUTSAVA</span>
              <span className={styles.editionCycle} aria-hidden="true">
                <span className={styles.editionX} data-text="X.0">X.0</span>
                <span className={styles.editionDas} data-text="दस" lang="hi">दस</span>
                <span className={styles.editionTen} data-text="10">10</span>
              </span>
            </h1>
          </div>
        </div>

        <p className={styles.tagline}>CODE. INNOVATE. CELEBRATE.</p>
        <p className={styles.eventLine}>NIT RAIPUR&apos;S FLAGSHIP TECH CELEBRATION&nbsp; // &nbsp;10TH EDITION</p>

        <div className={styles.heroActions} id="join">
          <GlitchButton
            label="REGISTER NOW"
            onClick={() => window.open(registrationUrl, "_blank", "noopener,noreferrer")}
          />
          <GlitchButton
            label="JOIN THE COMMUNITY"
            variant="secondary"
            icon={
              <Image
                src="/images/codeutsava/discord-symbol.svg"
                alt=""
                width={18}
                height={14}
              />
            }
            aria-label="Join the CodeUtsava community on Discord"
            onClick={() => window.open("https://discord.gg/Ek9gr2Xnqb", "_blank", "noopener,noreferrer")}
          />
        </div>
      </section>

      {/* Floating Cyber Music Indicator / Toggle on the Landing Page (Logo Only) */}
      <button
        type="button"
        onClick={toggleMusic}
        className={styles.heroMusicButton}
        title={isPlaying ? "Mute Background Music" : "Play Background Music"}
        aria-label={isPlaying ? "Mute Background Music" : "Play Background Music"}
      >
        {isPlaying ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 5L6 9H2v6h4l5 4V5z" />
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
          </svg>
        ) : (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 5L6 9H2v6h4l5 4V5z" />
            <line x1="23" y1="9" x2="17" y2="15" />
            <line x1="17" y1="9" x2="23" y2="15" />
          </svg>
        )}
      </button>

      <div className={styles.bottomRail} aria-hidden="true">
        <span>CODEUTSAVA // X</span>
        <span>BUILD / BREAK / PERCEIVE / REIMAGINE</span>
        <span>BY TURING CLUB OF PROGRAMMERS</span>
      </div>
    </main>
  );
}
