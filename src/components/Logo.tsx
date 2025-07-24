
import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="0.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("lucide lucide-gem", className)}
    >
      <title>Insight Forge Logo</title>
      {/* Outer Dodecagon */}
      <polygon points="12,2 19.36,5.33 22.67,12 19.36,18.67 12,22 4.64,18.67 1.33,12 4.64,5.33" />
      
      {/* Inner Circle */}
      <circle cx="12" cy="12" r="4" />
      
      {/* Connecting Lines */}
      <line x1="12" y1="2" x2="12" y2="8" />
      <line x1="12" y1="22" x2="12" y2="16" />
      <line x1="1.33" y1="12" x2="8" y2="12" />
      <line x1="22.67" y1="12" x2="16" y2="12" />
      
      <line x1="4.64" y1="5.33" x2="9.8" y2="9.8" />
      <line x1="19.36" y1="18.67" x2="14.2" y2="14.2" />
      <line x1="4.64" y1="18.67" x2="9.8" y2="14.2" />
      <line x1="19.36" y1="5.33" x2="14.2" y2="9.8" />
      
      {/* Additional Interweaving Lines for complexity */}
      <path d="M 4.64 5.33 L 19.36 5.33" />
      <path d="M 19.36 5.33 L 19.36 18.67" />
      <path d="M 19.36 18.67 L 4.64 18.67" />
      <path d="M 4.64 18.67 L 4.64 5.33" />
      
      <path d="M 1.33 12 L 12 2" />
      <path d="M 12 2 L 22.67 12" />
      <path d="M 22.67 12 L 12 22" />
      <path d="M 12 22 L 1.33 12" />
      
      <path d="M 4.64 5.33 L 4.64 18.67" transform="rotate(60 12 12)" />
      <path d="M 19.36 5.33 L 19.36 18.67" transform="rotate(60 12 12)" />

    </svg>
  );
}
