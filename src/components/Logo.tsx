import { cn } from "@/lib/utils";
import Image from "next/image";
import React from "react";

export const Logo = ({ className }: { className?: string }) => {
  return (
    <Image
      src="https://i.postimg.cc/50Mj7TY0/image.png"
      alt="NeuraBit Labs Logo"
      width={60}
      height={60}
      className={cn(className)}
    />
  );
};
