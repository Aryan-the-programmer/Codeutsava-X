'use client';

import { motion, useInView } from 'framer-motion';
import { Activity, ArrowUpRight, Users, Zap } from 'lucide-react';
import { type ReactNode, useEffect, useId, useRef, useState } from 'react';
import styles from './GrowthAnalytics.module.css';

export type GrowthDataPoint = {
  label: string;
  teams: number;
  participants: number;
};

const DEFAULT_GROWTH_DATA: readonly GrowthDataPoint[] = [
  { label: '2016', teams: 120, participants: 400 },
  { label: '2018', teams: 200, participants: 800 },
  { label: '2020', teams: 450, participants: 1600 },
  { label: '2022', teams: 580, participants: 1900 },
  { label: '2023', teams: 640, participants: 2500 },
  { label: '2024', teams: 820, participants: 3300 },
]; 

type GrowthAnalyticsProps = {
  data?: readonly GrowthDataPoint[];
  className?: string;
};

const formatNumber = (value: number) => new Intl.NumberFormat('en-IN').format(value);

export function GrowthAnalytics({ data = DEFAULT_GROWTH_DATA, className = '' }: GrowthAnalyticsProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, { amount: 0.3 });
  const wasInView = useRef(false);
  const [animationCycle, setAnimationCycle] = useState(0);
  const [activeIndex, setActiveIndex] = useState(data.length - 1);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const gradientId = useId().replace(/:/g, '');
  const areaRevealId = `${gradientId}-area-reveal`;
  const active = data[activeIndex];
  const maxTeams = Math.max(...data.map(({ teams }) => teams));
  const maxParticipants = Math.max(...data.map(({ participants }) => participants));
  const teamGrowth = Math.round(((data.at(-1)!.teams / data[0].teams) - 1) * 100);
  const participationGrowth = Math.round(((data.at(-1)!.participants / data[0].participants) - 1) * 100);

  // Coordinates are intentionally fixed: SVG handles responsive scaling without a chart dependency.
  const points = data.map((item, index) => {
    const x = 48 + index * (504 / Math.max(data.length - 1, 1));
    const y = 204 - (item.teams / maxTeams) * 154;
    return { x, y };
  });
  const linePath = points.map(({ x, y }, index) => `${index === 0 ? 'M' : 'L'} ${x} ${y}`).join(' ');
  const areaPath = `${linePath} L ${points.at(-1)!.x} 204 L ${points[0].x} 204 Z`;

  useEffect(() => {
    if (inView && !wasInView.current) setAnimationCycle(cycle => cycle + 1);
    wasInView.current = inView;
  }, [inView]);

  return (
    <section ref={sectionRef} id="analytics" className={`relative overflow-hidden bg-[#05020a] px-5 py-20 sm:px-10 lg:px-16 lg:py-28 ${className}`} aria-labelledby="analytics-title">
      <div className="pointer-events-none absolute inset-0 opacity-40 [background-image:linear-gradient(rgba(255,95,207,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(0,240,255,0.035)_1px,transparent_1px)] [background-size:36px_36px]" />
      <div className="pointer-events-none absolute left-1/2 top-0 h-96 w-[48rem] -translate-x-1/2 rounded-full bg-[#9929ea]/20 blur-[140px]" />

      <div className="relative mx-auto max-w-7xl">
        <div className="mb-10 flex flex-col gap-6 sm:mb-14 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            {/* <p className="mb-3 flex items-center gap-2 font-mono text-[10px] tracking-[0.32em] text-cyan-200/80"><Zap className="h-3.5 w-3.5" /> LIVE ARCHIVE / 2016—2024</p> */}
            <h2 id="analytics-title" data-text="GRAPH AND ANALYTICS." className={`${styles.sponsorHeading} text-4xl uppercase leading-[.85] sm:text-6xl`}>GRAPH AND ANALYTICS.</h2>
          </div>
          <p className="max-w-sm border-l border-[#ff5fcf]/60 pl-4 font-mono text-xs leading-relaxed text-white/60">Hover or select any signal point to inspect how the Codeutsava universe keeps expanding.</p>
        </div>


        <div className="grid gap-5 lg:grid-cols-[1.08fr_.92fr]">
          <article className="relative overflow-hidden border border-[#ff5fcf]/30 bg-black/65 p-5 shadow-[0_0_50px_rgba(153,41,234,0.14)] sm:p-7">
            <CardHeader icon={<Users className="h-5 w-5" />} label="Total number of teams" value={`${formatNumber(active.teams)} teams in ${data[activeIndex]?.label || 'the current period'}`} activeKey={`teams-${activeIndex}`} />
            <div className="mt-4 overflow-x-auto">
              <svg key={`teams-chart-${animationCycle}`} viewBox="0 0 600 244" className="min-w-[520px] w-full" role="img" aria-label="Line chart showing total teams growing from 120 in 2016 to 820 in 2023–24">
                <defs>
                  <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1"><stop stopColor="#ff5fcf" stopOpacity=".45" /><stop offset="1" stopColor="#ff5fcf" stopOpacity="0" /></linearGradient>
                  <filter id={`${gradientId}-glitch`} x="-30%" y="-30%" width="160%" height="160%"><feTurbulence type="fractalNoise" baseFrequency=".025 .35" numOctaves="1" seed={activeIndex + 1} result="noise" /><feDisplacementMap in="SourceGraphic" in2="noise" scale={3} xChannelSelector="R" /></filter>
                  <clipPath id={areaRevealId}><motion.rect x="48" y="0" height="204" initial={{ width: 0 }} animate={{ width: 504 }} transition={{ duration: 2.8, delay: .2, ease: [0.16, 1, 0.3, 1] }} /></clipPath>
                </defs>
                {[50, 101, 153, 204].map(y => <line key={y} x1="48" x2="552" y1={y} y2={y} stroke="white" strokeOpacity=".10" strokeDasharray="3 6" />)}
                <path d={areaPath} fill={`url(#${gradientId})`} clipPath={`url(#${areaRevealId})`} />
                <path d={linePath} fill="none" stroke="#ff5fcf" strokeWidth="3" className={`${styles.chartLine} drop-shadow-[0_0_7px_#ff5fcf]`} />
                {points.map(({ x, y }, index) => (
                  <g key={data[index].label} className={`${styles.chartPoint} cursor-pointer`} onMouseEnter={() => { setActiveIndex(index); setSelectedIndex(index); }} onMouseLeave={() => setSelectedIndex(null)} onFocus={() => { setActiveIndex(index); setSelectedIndex(index); }} onBlur={() => setSelectedIndex(null)} onClick={() => { setActiveIndex(index); setSelectedIndex(index); }} tabIndex={0} role="button" aria-label={`${data[index].label}: ${data[index].teams} teams`}>
                    <circle cx={x} cy={y} r="13" fill="transparent" />
                    <motion.circle cx={x} cy={y} fill="#05020a" stroke="#ff5fcf" strokeWidth="3" className={activeIndex === index ? styles.activeNode : 'transition-all'} initial={{ opacity: 0, r: 0 }} animate={{ opacity: 1, r: activeIndex === index ? 8 : 4 }} transition={{ duration: .38, delay: .28 + index * .48, ease: [0.16, 1, 0.3, 1] }} />
                    {selectedIndex === index && <g filter={`url(#${gradientId}-glitch)`}><rect x={x - 61} y={y - 59} width="122" height="39" rx="2" fill="#12051d" stroke="#ff5fcf" strokeOpacity=".75" /><text x={x} y={y - 43} textAnchor="middle" fill="#faeb92" fontSize="15" fontWeight="800">{formatNumber(data[index].teams)} TEAMS</text><text x={x} y={y - 29} textAnchor="middle" fill="#9bf8ff" fontSize="10" fontWeight="700">{data[index].label}</text></g>}
                    <text x={x} y="230" textAnchor="middle" fill="rgba(255,255,255,.58)" fontSize="11">{data[index].label}</text>
                  </g>
                ))}
              </svg>
            </div>
          </article>

          <article className="relative overflow-hidden border border-[#a855f7]/35 bg-black/65 p-5 shadow-[0_0_50px_rgba(168,85,247,0.13)] sm:p-7">
            <CardHeader icon={<Activity className="h-5 w-5" />} label="Total participation" value={`${formatNumber(active.participants)} people in ${data[activeIndex]?.label || 'the current period'}`} activeKey={`participants-${activeIndex}`} />
            <div className="mt-6 space-y-3.5">
              {data.map((item, index) => {
                const selected = index === activeIndex;
                return (
                  <button key={`${item.label}-${animationCycle}`} type="button" onMouseEnter={() => setActiveIndex(index)} onFocus={() => setActiveIndex(index)} onClick={() => setActiveIndex(index)} className={`${styles.barButton} group grid w-full grid-cols-[52px_1fr_62px] items-center gap-3 text-left`} aria-label={`${item.label}: ${formatNumber(item.participants)} participants`}>
                    <span className={`font-mono text-[10px] ${selected ? 'text-[#faeb92]' : 'text-white/45'}`}>{item.label}</span>
                    <span className={`${styles.barTrack} relative block h-5 overflow-hidden border border-white/10 bg-white/5`}>
                      <motion.span className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#9929ea] via-[#c056f6] to-[#ff5fcf] shadow-[0_0_15px_rgba(192,86,246,.7)]" initial={{ width: 0, opacity: .35 }} animate={{ width: `${(item.participants / maxParticipants) * 100}%`, opacity: 1 }} transition={{ width: { duration: 1.45, delay: .3 + index * .42, ease: [0.16, 1, 0.3, 1] }, opacity: { duration: .2, delay: .3 + index * .42 } }} />
                      {selected && <span className="absolute inset-y-0 w-12 animate-pulse bg-[#faeb92]/30 blur-sm" style={{ left: `${Math.max((item.participants / maxParticipants) * 100 - 11, 0)}%` }} />}
                    </span>
                    <span className={`${styles.barValue} font-mono text-right text-xs font-bold transition-all duration-150 ${selected ? 'text-[#faeb92]' : 'text-white/65'}`}>{formatNumber(item.participants)}</span>
                  </button>
                );
              })}
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}


function CardHeader({ icon, label, value, activeKey, cyan = false }: { icon: ReactNode; label: string; value: string; activeKey: string; cyan?: boolean }) {
  return <div className="flex items-start justify-between gap-3"><div><p className={`mb-2 flex items-center gap-2 font-mono text-xs font-extrabold uppercase tracking-[.16em] sm:text-sm ${cyan ? 'text-cyan-100' : 'text-[#ff5fcf]'}`}>{icon}{label}</p><p className="font-mono text-[11px] font-medium tracking-wide text-white/55">HOVER A SIGNAL TO DECODE</p></div><output key={activeKey} data-value={value} className={`${styles.readout} ${styles.heroType} border px-3 py-2 text-right text-2xl uppercase leading-none sm:text-3xl ${cyan ? 'border-cyan-300/35 text-cyan-100' : 'border-[#ff5fcf]/35 text-[#faeb92]'}`}>{value}</output></div>;
}
