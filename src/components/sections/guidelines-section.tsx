import { ExternalLink } from "lucide-react";
import sponsorStyles from "@/components/sponsor-section/SponsorSection.module.css";
import styles from "./guidelines-section.module.css";

const guidelines = [
  <>
    All <strong>team members</strong> should be from the same college;{" "}
    <strong>no inter-college teams</strong> are allowed. However, members from{" "}
    <strong>different branches</strong> of the same college/institute are encouraged
    to form a team.
  </>,
  <>
    Each team would comprise <strong>2-4 members</strong>, including the{" "}
    <strong>team leader</strong>.
  </>,
  <>
    As the <strong>software edition</strong> of the hackathon is a digital product
    development competition, the majority of the team members must be well versed
    with <strong>programming skills</strong>. For the <strong>hardware edition</strong>,
    we encourage multidisciplinary teams - which means your team should have a good
    mix of Mechanical Engineers, Electronics Engineers, Product Designers, and
    Programmers, etc.
  </>,
] as const;

export function GuidelinesSection() {
  return (
    <section
      className={styles.guidelines}
      id="guidelines"
      aria-labelledby="guidelines-title"
    >
      <div className={sponsorStyles.backgroundGrid} aria-hidden="true" />
      <div className={sponsorStyles.filmGrain} aria-hidden="true" />
      <div className={sponsorStyles.glitchBursts} aria-hidden="true">
        <span />
        <span />
        <span />
      </div>

      <div className={`${sponsorStyles.heading} ${styles.heading}`}>
        <h2 id="guidelines-title" data-text="GUIDELINES">
          GUIDELINES
        </h2>
      </div>

      <div className={styles.frame}>
        <span className={styles.frameCorner} aria-hidden="true" />
        <span className={styles.frameCorner} aria-hidden="true" />
        <span className={styles.frameCorner} aria-hidden="true" />
        <span className={styles.frameCorner} aria-hidden="true" />

        <div className={styles.frameHeader} aria-hidden="true">
          <span>PROTOCOL // CU-X.0</span>
          <span className={styles.status}>SIGNAL LOCKED</span>
        </div>

        <div className={styles.content}>
          <p className={styles.kicker}>TEAM CONFIGURATION</p>
          <h3>Team Formation</h3>

          <ol className={styles.rules}>
            {guidelines.map((guideline, index) => (
              <li key={index}>
                <span className={styles.ruleNumber} aria-hidden="true">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <p>{guideline}</p>
              </li>
            ))}
          </ol>

          <aside className={styles.note}>
            <span className={styles.noteLabel}>PLEASE NOTE</span>
            <p>
              NIT Raipur will be providing <strong>meals, travel</strong> and{" "}
              <strong>accommodation free of cost</strong>. Travel charges up to{" "}
              <strong>Rs. 1500 per person</strong> to and fro will be reimbursed when
              presented with a valid ticket/booking receipt.
            </p>
          </aside>

          <a
            className={styles.criteriaButton}
            href="/Judgement-Criteria.pdf"
            target="_blank"
            rel="noreferrer"
          >
            <span>JUDGEMENT CRITERIA</span>
            <ExternalLink aria-hidden="true" size={18} strokeWidth={1.7} />
          </a>
        </div>

        <div className={styles.frameFooter} aria-hidden="true">
          <span>READ // COMPILE // BUILD</span>
          <span>DOC: PDF</span>
        </div>
      </div>
    </section>
  );
}
