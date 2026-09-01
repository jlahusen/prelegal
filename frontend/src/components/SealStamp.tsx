const TICKS = Array.from({ length: 20 }, (_, i) => (i * 360) / 20);

interface SealStampProps {
  sealed: boolean;
  className?: string;
}

export default function SealStamp({ sealed, className = "" }: SealStampProps) {
  return (
    <div
      className={`relative flex flex-col items-center gap-2 ${className}`}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 96 96"
        width="72"
        height="72"
        className={sealed ? "seal-sealed" : "transition-opacity duration-300"}
        style={{ transform: sealed ? undefined : "rotate(-6deg)" }}
      >
        {TICKS.map((angle) => (
          <line
            key={angle}
            x1="48"
            y1="4"
            x2="48"
            y2="10"
            stroke={sealed ? "var(--seal)" : "var(--slate)"}
            strokeWidth="2.5"
            strokeLinecap="round"
            opacity={sealed ? 0.9 : 0.35}
            transform={`rotate(${angle} 48 48)`}
          />
        ))}
        <circle
          cx="48"
          cy="48"
          r="32"
          fill={sealed ? "var(--seal)" : "none"}
          stroke={sealed ? "var(--seal-dark)" : "var(--slate)"}
          strokeWidth="1.5"
          opacity={sealed ? 1 : 0.5}
        />
        <circle
          cx="48"
          cy="48"
          r="25"
          fill="none"
          stroke={sealed ? "var(--paper)" : "var(--slate)"}
          strokeWidth="1"
          strokeDasharray="2 3"
          opacity={sealed ? 0.7 : 0.4}
        />
        <text
          x="48"
          y="53"
          textAnchor="middle"
          fontFamily="var(--font-serif)"
          fontWeight="700"
          fontSize="18"
          fill={sealed ? "var(--paper)" : "var(--slate)"}
          opacity={sealed ? 1 : 0.6}
        >
          MNDA
        </text>
      </svg>
      <span
        className="font-mono text-[0.65rem] tracking-[0.2em] uppercase"
        style={{ color: sealed ? "var(--seal-dark)" : "var(--slate)" }}
      >
        {sealed ? "Sealed" : "Draft"}
      </span>
    </div>
  );
}
