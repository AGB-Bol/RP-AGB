import type { ReactNode } from "react";

export type BadgeVariant = "blue" | "green" | "yellow" | "red" | "gray";

export interface BadgeProps {
  variant?:  BadgeVariant;
  children:  ReactNode;
  className?: string;
}

const variantClass: Record<BadgeVariant, string> = {
  blue:   "badge-blue",
  green:  "badge-green",
  yellow: "badge-yellow",
  red:    "badge-red",
  gray:   "badge-gray",
};

export function Badge({ variant = "gray", children, className = "" }: BadgeProps) {
  return (
    <span className={`badge ${variantClass[variant]} ${className}`}>
      {children}
    </span>
  );
}
