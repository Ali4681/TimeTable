// src/components/ui/empty-state.tsx

import { FileQuestion } from "lucide-react";
import { cn } from "@/lib/utils"; // Provided by shadcn/ui
import React from "react";

interface EmptyStateProps {
  title?: string;
  description?: string;
  className?: string;
  action?: React.ReactNode;
  isRTL?: boolean;
}

export function EmptyState({
  title = "No Data",
  description = "There is nothing to display here.",
  className,
  action,
  isRTL = false,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center text-muted-foreground p-6",
        isRTL && "rtl",
        className
      )}
    >
      <FileQuestion className="h-10 w-10 mb-4" />
      <h2 className="text-lg font-medium">{title}</h2>
      <p className="text-sm">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
