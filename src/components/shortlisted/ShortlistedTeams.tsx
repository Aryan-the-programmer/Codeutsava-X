'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Lock } from 'lucide-react';
import { CyberLootboxIcon } from './CyberLootboxIcon';
import styles from './ShortlistedTeams.module.css';

interface ShortlistedSlot {
  id: number;
}

const SHORTLISTED_SLOTS: ShortlistedSlot[] = [
  { id: 1 },
  { id: 2 },
  { id: 3 },
  { id: 4 },
];

const GLITCH_GLYPHS = '!@#$%^&*<>[]{}|~_+?01X=/\\';

function ScrambleGlitchText({
  text,
  isHovered,
  className
}: {
  text: string;
  isHovered: boolean;
  className?: string;
}) {
  const [displayText, setDisplayText] = useState(text);

  useEffect(() => {
    if (!isHovered) {
      setDisplayText(text);
      return;
    }

    const interval = setInterval(() => {
      const scrambled = text
        .split('')
        .map((char) => {
          if (char === ' ' || char === '&' || char === '_' || char === '[' || char === ']') return char;
          if (Math.random() < 0.48) {
            return GLITCH_GLYPHS[Math.floor(Math.random() * GLITCH_GLYPHS.length)];
          }
          return char;
        })
        .join('');
      setDisplayText(scrambled);
    }, 45);

    return () => clearInterval(interval);
  }, [isHovered, text]);

  return <span className={className}>{isHovered ? displayText : text}</span>;
}

export function ShortlistedTeams() {
  const [hoveredSlot, setHoveredSlot] = useState<number | null>(null);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    const checkTouch = () => {
      setIsTouchDevice(
        'ontouchstart' in window ||
        navigator.maxTouchPoints > 0 ||
        window.innerWidth < 768
      );
    };
    checkTouch();
    window.addEventListener('resize', checkTouch);
    return () => window.removeEventListener('resize', checkTouch);
  }, []);

  return (
    <section className={styles.section} id="shortlisted-teams" aria-labelledby="shortlist-title">
      {/* Heading */}
      <div className={styles.heading}>
        <p className={styles.eyebrow}>
          <span className={styles.eyebrowDot} />
          CYBERNETIC DATA VAULT // X.0
        </p>
        <h2 id="shortlist-title">TEAMS SHORTLISTED</h2>
      </div>

      {/* Master Controls Bar - Locked State */}
      <div className={styles.controlsBar}>
        <div className={styles.statusIndicator}>
          <span>TRANSMISSION // LOCKED</span>
        </div>

        <div className={styles.btnGroup}>
          <div className={styles.lockedBadge}>
            <Lock size={11} className={styles.lockIcon} />
            <span>REVEALING SOON</span>
          </div>
        </div>
      </div>

      {/* Grid of Rectangular Lootbox Cards (Totally Locked) */}
      <div className={styles.slotsGrid}>
        {SHORTLISTED_SLOTS.map((slot) => {
          const isHovered = !isTouchDevice && hoveredSlot === slot.id;

          return (
            <div
              key={slot.id}
              className={`${styles.slotCard} ${styles.slotCardLocked} ${isHovered ? styles.slotCardHovered : ''}`}
              onMouseEnter={() => !isTouchDevice && setHoveredSlot(slot.id)}
              onMouseLeave={() => setHoveredSlot(null)}
              aria-label={`Slot ${slot.id}: Encrypted Cyber Vault`}
            >
              <div className={styles.cardScanline} aria-hidden="true" />
              <span className={styles.cardCorner} aria-hidden="true" />

              <div className={styles.cardInner}>
                <motion.div
                  className={styles.unopenedView}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  <CyberLootboxIcon
                    isOpen={false}
                    isOpening={false}
                    isHovered={isHovered}
                  />
                  <ScrambleGlitchText
                    text="[ LOCKED ]"
                    isHovered={isHovered}
                    className={styles.unopenedLabel}
                  />
                </motion.div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
