import type { ReactNode, HTMLAttributes } from "react";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children:    ReactNode;
  noPadding?:  boolean;
  className?:  string;
}

export function Card({ children, noPadding = false, className = "", ...rest }: CardProps) {
  return (
    <div
      className={`card ${noPadding ? "card--no-padding" : ""} ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}

export interface CardHeaderProps {
  title:     string;
  subtitle?: string;
  action?:   ReactNode;
}

export function CardHeader({ title, subtitle, action }: CardHeaderProps) {
  return (
    <div className="card-header">
      <div className="card-header-text">
        <h2 className="card-title">{title}</h2>
        {subtitle && <p className="card-subtitle">{subtitle}</p>}
      </div>
      {action && <div className="card-header-action">{action}</div>}
    </div>
  );
}
