import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "./ui/separator";

export function ReportSkeleton() {
  const sections = Array(6).fill(0);
  return (
    <div className="space-y-12">
      {sections.map((_, index) => (
        <div key={index} className="space-y-4">
          <Skeleton className="h-8 w-1/3" />
          <Separator />
          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
             <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>
      ))}
    </div>
  );
}
