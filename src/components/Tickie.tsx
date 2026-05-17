"use client";

type Mood = "happy" | "wink" | "sleep" | "party" | "sad";

interface TickieProps {
  size?: number;
  mood?: Mood;
  color?: string;
  style?: React.CSSProperties;
  className?: string;
}

function Eye({ cx, cy, mood }: { cx: number; cy: number; mood: Mood }) {
  if (mood === "sleep") {
    return <path d={`M${cx - 5} ${cy} q5 4 10 0`} stroke="#2B1A2E" strokeWidth="2" strokeLinecap="round" fill="none" />;
  }
  if (mood === "wink" && cx > 50) {
    return <path d={`M${cx - 5} ${cy} q5 -4 10 0`} stroke="#2B1A2E" strokeWidth="2.2" strokeLinecap="round" fill="none" />;
  }
  return <ellipse className="mascot-eye" cx={cx} cy={cy} rx="3" ry="4" fill="#2B1A2E" />;
}

export function Tickie({ size = 80, mood = "happy", color = "#FF8FA8", style, className }: TickieProps) {
  const filterId = `tickie-shadow-${size}-${mood}`;
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={style} className={className} aria-hidden="true">
      <defs>
        <filter id={filterId} x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="3" stdDeviation="0" floodColor="#2B1A2E" floodOpacity="0.15" />
        </filter>
      </defs>
      <g filter={`url(#${filterId})`}>
        <path
          d="M20 25 Q20 18 27 18 L73 18 Q80 18 80 25 L80 42 Q74 42 74 50 Q74 58 80 58 L80 75 Q80 82 73 82 L27 82 Q20 82 20 75 L20 58 Q26 58 26 50 Q26 42 20 42 Z"
          fill={color}
          stroke="#2B1A2E"
          strokeWidth="2.5"
        />
        <line x1="50" y1="22" x2="50" y2="78" stroke="#2B1A2E" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.4" />
        {mood !== "sleep" && mood !== "sad" && (
          <>
            <ellipse cx="32" cy="58" rx="5" ry="3" fill="#FFB3C1" opacity="0.7" />
            <ellipse cx="68" cy="58" rx="5" ry="3" fill="#FFB3C1" opacity="0.7" />
          </>
        )}
        <Eye cx={38} cy={48} mood={mood} />
        <Eye cx={62} cy={48} mood={mood} />
        {mood === "happy" && <path d="M44 64 Q50 70 56 64" stroke="#2B1A2E" strokeWidth="2.2" strokeLinecap="round" fill="none" />}
        {mood === "wink" && <path d="M44 65 Q50 71 56 65" stroke="#2B1A2E" strokeWidth="2.2" strokeLinecap="round" fill="none" />}
        {mood === "sleep" && <ellipse cx="50" cy="66" rx="3" ry="2" fill="#2B1A2E" />}
        {mood === "party" && <ellipse cx="50" cy="66" rx="5" ry="4" fill="#2B1A2E" />}
        {mood === "sad" && <path d="M44 68 Q50 62 56 68" stroke="#2B1A2E" strokeWidth="2.2" strokeLinecap="round" fill="none" />}
        {mood === "party" && (
          <>
            <circle cx="22" cy="28" r="2" fill="#FFD56B" />
            <circle cx="78" cy="32" r="2" fill="#9EE6CF" />
            <circle cx="18" cy="65" r="2" fill="#C4B5FB" />
            <path d="M82 70 l3 3 M85 70 l-3 3" stroke="#FF8FA8" strokeWidth="2" strokeLinecap="round" />
          </>
        )}
      </g>
    </svg>
  );
}

export function Squiggle({ color = "#FF8FA8", w = 60, h = 20, style }: { color?: string; w?: number; h?: number; style?: React.CSSProperties }) {
  return (
    <svg width={w} height={h} viewBox="0 0 60 20" style={style} aria-hidden="true">
      <path d="M2 10 Q15 -2 30 10 T58 10" stroke={color} strokeWidth="3" fill="none" strokeLinecap="round" />
    </svg>
  );
}

export function Sparkle({ size = 20, color = "#FFD56B", style }: { size?: number; color?: string; style?: React.CSSProperties }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" style={style} aria-hidden="true">
      <path d="M10 1 L11.5 8.5 L19 10 L11.5 11.5 L10 19 L8.5 11.5 L1 10 L8.5 8.5 Z" fill={color} stroke="#2B1A2E" strokeWidth="1.2" strokeLinejoin="round" />
    </svg>
  );
}

export function Star({ size = 24, color = "#FFD56B", style }: { size?: number; color?: string; style?: React.CSSProperties }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={style} aria-hidden="true">
      <path d="M12 2 L14.6 8.6 L21.6 9.2 L16.3 13.8 L18 20.8 L12 17.3 L6 20.8 L7.7 13.8 L2.4 9.2 L9.4 8.6 Z" fill={color} stroke="#2B1A2E" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

export function Confetti({ count = 12, style }: { count?: number; style?: React.CSSProperties }) {
  const colors = ["#FF8FA8", "#9EE6CF", "#FFD56B", "#B8D9FF", "#C4B5FB"];
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", ...style }}>
      {Array.from({ length: count }, (_, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: `${(i * 8.3) % 100}%`,
            top: `${(i * 13.7) % 100}%`,
            width: 8,
            height: 12,
            background: colors[i % colors.length],
            borderRadius: 2,
            transform: `rotate(${(i * 47) % 360}deg)`,
            opacity: 0.85,
          }}
        />
      ))}
    </div>
  );
}
