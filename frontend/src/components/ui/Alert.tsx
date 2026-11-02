import type { ReactNode } from "react";
import { AlertIcon } from "@/components/icons/Icons";

export type AlertVariant = "error" | "warning" | "info" | "success";

export interface AlertProps {
  variant?:  AlertVariant;
  children:  ReactNode;
  className?: string;
}

const variantClass: Record<AlertVariant, string> = {
  error:   "alert-error",
  warning: "alert-warning",
  info:    "alert-info",
  success: "alert-success",
};

export function Alert({ variant = "info", children, className = "" }: AlertProps) {
  return (
    <div
      className={`alert ${variantClass[variant]} ${className}`}
      role="alert"
    >
      <span className="alert-icon" aria-hidden="true">
        <AlertIcon size={16} />
      </span>
      <span className="alert-content">{children}</span>
    </div>
  );
}
