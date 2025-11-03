
import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      className={cn("text-primary", className)}
      fill="currentColor"
    >
      <title>Insight Forge Logo</title>
      {/* Outer hexagons */}
      <path
        d="M21.5 35.5 L16.5 44 L21.5 52.5 L31.5 52.5 L36.5 44 L31.5 35.5 Z"
        className="text-primary"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
      />
      <path
        d="M13 51 L8 59.5 L13 68 L23 68 L28 59.5 L23 51 Z"
        className="text-primary"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
      />
      <path
        d="M21.5 66.5 L16.5 75 L21.5 83.5 L31.5 83.5 L36.5 75 L31.5 66.5 Z"
        className="text-primary"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
      />

      {/* Concentric circles */}
      <path
        d="M 90,50 A 40,40 0 1,1 10,50 A 40,40 0 1,1 90,50"
        stroke="currentColor"
        strokeWidth="3.5"
        fill="none"
      />
      <path
        d="M 85,50 A 35,35 0 1,1 15,50 A 35,35 0 1,1 85,50"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
      />

      {/* Brain circuit */}
      <g stroke="currentColor" strokeWidth="1.2" fill="none">
        {/* Central Hexagon */}
        <path d="M50 42 L56.9 46 L56.9 54 L50 58 L43.1 54 L43.1 46 Z" strokeWidth="1.5" />

        {/* Lines from center */}
        <path d="M50 42 L50 34" />
        <path d="M56.9 46 L64 42" />
        <path d="M56.9 54 L64 58" />
        <path d="M50 58 L50 66" />
        <path d="M43.1 54 L36 58" />
        <path d="M43.1 46 L36 42" />
      </g>

      {/* Outer brain shape and connections */}
      <g stroke="currentColor" strokeWidth="1.2" fill="currentColor">
        {/* Top right */}
        <path d="M50 34 C 58 32, 63 34, 70 38" fill="none" />
        <path d="M64 42 C 67 42, 69 44, 74 45" fill="none" />
        <path d="M64 58 C 68 59, 72 58, 77 55" fill="none" />
        
        <circle cx="70" cy="38" r="1.5" />
        <circle cx="74" cy="45" r="1.5" />
        <circle cx="77" cy="55" r="1.5" />
        <path d="M70 38 L 73 41" fill="none" />

        {/* Bottom right */}
        <path d="M50 66 C 58 68, 63 66, 70 62" fill="none" />
        <path d="M70 62 C 73 61, 75 63, 78 65" fill="none" />
        <circle cx="70" cy="62" r="1.5" />
        <circle cx="78" cy="65" r="1.5" />

        {/* Top Left */}
        <path d="M50 34 C 42 32, 37 34, 30 38" fill="none" />
        <path d="M36 42 C 33 42, 31 44, 26 45" fill="none" />
        <path d="M36 58 C 32 59, 28 58, 23 55" fill="none" />
        <circle cx="30" cy="38" r="1.5" />
        <circle cx="26" cy="45" r="1.5" />
        <circle cx="23" cy="55" r="1.5" />
        <path d="M30 38 L 27 41" fill="none" />

        {/* Bottom Left */}
        <path d="M50 66 C 42 68, 37 66, 30 62" fill="none" />
        <path d="M30 62 C 27 61, 25 63, 22 65" fill="none" />
        <circle cx="30" cy="62" r="1.5" />
        <circle cx="22" cy="65" r="1.5" />

      </g>
    </svg>
  );
}
