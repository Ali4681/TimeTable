// src/components/ui/loading-spinner.tsx

import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils"; // included by shadcn template

interface LoadingSpinnerProps {
  className?: string;
  size?: number;
}

export function LoadingSpinner({ className, size = 24 }: LoadingSpinnerProps) {
  return (
    <Loader2
      className={cn("animate-spin text-muted-foreground", className)}
      size={size}
    />
  );
}
