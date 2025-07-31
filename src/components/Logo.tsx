
import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 256 256"
      className={cn("text-primary", className)}
      fill="currentColor"
    >
      <title>Insight Forge Logo</title>
      <path
        d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24ZM152,128a24,24,0,1,1-24-24A24,24,0,0,1,152,128Z"
      />
    </svg>
  );
}
