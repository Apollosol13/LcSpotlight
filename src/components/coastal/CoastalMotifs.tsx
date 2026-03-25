/** Decorative coastal SVGs — low-opacity, pointer-events none */

export function PalmSilhouette({
  className,
  mirrored,
}: {
  className?: string;
  mirrored?: boolean;
}) {
  return (
    <svg
      viewBox="0 0 160 240"
      className={className}
      style={mirrored ? { transform: "scaleX(-1)" } : undefined}
      aria-hidden
    >
      <g fill="currentColor">
        <path d="M80 108Q12 52 6 72Q38 92 80 108Z" />
        <path d="M80 108Q28 32 22 12Q48 56 80 108Z" />
        <path d="M80 108Q80 24 80 8Q80 52 80 108Z" />
        <path d="M80 108Q132 32 138 12Q112 56 80 108Z" />
        <path d="M80 108Q148 52 154 72Q122 92 80 108Z" />
        <path d="M80 108Q118 68 146 62Q108 94 80 108Z" />
        <path d="M80 108Q42 68 14 62Q52 94 80 108Z" />
        <path d="M71 240h18v-2l7-128H76l-5 128v2z" />
      </g>
    </svg>
  );
}

export function WaveToTicker({ className }: { className?: string }) {
  return (
    <div
      className={`pointer-events-none absolute inset-x-0 bottom-0 h-[clamp(1.75rem,4.5vw,3rem)] translate-y-px ${className ?? ""}`}
      aria-hidden
    >
      <svg
        className="block h-full w-full text-spotlight-teal"
        viewBox="0 0 1200 48"
        preserveAspectRatio="none"
      >
        <path
          fill="currentColor"
          d="M0 28C180 6 360 42 600 22S1020 4 1200 26V48H0V28z"
        />
      </svg>
    </div>
  );
}
