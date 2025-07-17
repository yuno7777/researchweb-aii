
import { cn } from "@/lib/utils";

export function GradientText({ children, className }: { children: React.ReactNode, className?: string }) {
  return (
    <span className={cn("bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent", className)}>
      {children}
    </span>
  );
}
