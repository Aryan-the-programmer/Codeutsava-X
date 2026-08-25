import type { ButtonHTMLAttributes, ReactNode } from "react";
import styles from "./glitch-button.module.css";

type GlitchButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string;
  icon?: ReactNode;
  variant?: "primary" | "secondary";
};

export function GlitchButton({
  label,
  icon,
  variant = "primary",
  className = "",
  type = "button",
  ...props
}: GlitchButtonProps) {
  return (
    <button
      type={type}
      className={`${styles.button} ${styles[variant]} ${className}`.trim()}
      {...props}
    >
      {icon ? <span className={styles.icon} aria-hidden="true">{icon}</span> : null}
      <span className={styles.text}>{label}</span>
    </button>
  );
}
