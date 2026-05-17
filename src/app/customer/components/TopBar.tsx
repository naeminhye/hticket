"use client";

interface Props {
  onBack?: () => void;
  onHome?: () => void;
  title: string;
  subtitle?: string;
  step?: number;
  totalSteps?: number;
}

export default function TopBar({ onBack, onHome, title, subtitle, step, totalSteps }: Props) {
  return (
    <div className="topbar">
      <button className="iconbtn" onClick={onBack || onHome} aria-label="back">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <div className="topbar-title">
        <div className="t-main">{title}</div>
        {subtitle && <div className="t-sub">{subtitle}</div>}
      </div>
      {step !== undefined && totalSteps !== undefined ? (
        <div className="step-indicator">
          {Array.from({ length: totalSteps }, (_, i) => (
            <span key={i} className={i + 1 <= step ? "active" : ""} />
          ))}
        </div>
      ) : (
        <button className="iconbtn" onClick={onHome} aria-label="home">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M3 11l9-8 9 8M5 10v10h14V10" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      )}
    </div>
  );
}
