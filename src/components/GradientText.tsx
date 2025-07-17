
import { cn } from "@/lib/utils";

export function GradientText({ children, className }: { children: React.ReactNode, className?: string }) {
  return (
    <span className={cn("bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent", className)}>
      {children}
    </span>
  );
}
