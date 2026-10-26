import type { ReactNode } from "react";

export interface StatCardProps {
  label:     string;
  value:     string | number;
  icon?:     ReactNode;
  trend?:    { value: string; positive?: boolean };
  className?: string;
}

export function StatCard({ label, value, icon, trend, className = "" }: StatCardProps) {
  return (
    <div className={`stat-card ${className}`}>
      {icon && (
        <div className="stat-card-icon" aria-hidden="true">
          {icon}
        </div>
      )}
      <span className="stat-label">{label}</span>
      <span className="stat-value">{value}</span>
      {trend && (
        <span className={`stat-trend ${trend.positive ? "stat-trend--up" : "stat-trend--down"}`}>
          {trend.value}
        </span>
      )}
    </div>
  );
}
