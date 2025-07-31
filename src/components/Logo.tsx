
import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("text-primary", className)}
    >
        <title>Insight Forge Logo</title>
        <path d="M10.15 2.5a2.26 2.26 0 0 1 3.7 0L22.5 16.54a2.26 2.26 0 0 1-1.85 3.46H3.35a2.26 2.26 0 0 1-1.85-3.46Z"/>
        <path d="m9 12 2 2 4-4"/>
    </svg>
  );
}
