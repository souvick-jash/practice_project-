import React from "react";
import { cn } from "@/lib/utils";
interface RowGridProps {
  cols?: string;
  children: React.ReactNode;
  className?: string;
  gap?: string;
}

const RowGrid: React.FC<RowGridProps> = ({
  cols = "grid-cols-1 md:grid-cols-2",
  children,
  gap = "gap-6",
  className,
}) => {
  return <div className={cn("grid", gap, cols, className)}>{children}</div>;
};

export default RowGrid;
