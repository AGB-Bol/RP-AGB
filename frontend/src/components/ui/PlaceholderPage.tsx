"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import type { UserRole } from "@/context/AuthContext";
import { DashboardShell } from "@/components/layout/DashboardShell";

/**
 * Componente genérico para páginas en construcción.
 * Muestra un aviso de "próximamente" dentro del shell del rol correspondiente.
 */
export interface PlaceholderPageProps {
  /** Título que aparece en topbar y heading */
  title: string;
  /** Ícono emoji opcional */
  icon?: string;
  /** Descripción de la página */
  description?: string;
  /** Rol requerido para ver esta página */
  requiredRole: UserRole;
}

export function PlaceholderPage({
  title,
  icon = "🚧",
  description = "Esta sección está en desarrollo.",
  requiredRole,
}: PlaceholderPageProps) {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated)                  { router.push("/login");                       return; }
    if (user?.role !== requiredRole)       { router.push(`/dashboard/${user?.role}`);     return; }
  }, [isAuthenticated, user, router, requiredRole]);

  if (!isAuthenticated || user?.role !== requiredRole) return null;

  return (
    <DashboardShell pageTitle={title}>
      <div className="page-header">
        <h1 className="page-title">{title}</h1>
      </div>
      <div className="placeholder-page">
        <div className="placeholder-page-icon">{icon}</div>
        <h2 className="placeholder-page-heading">Próximamente</h2>
        <p className="placeholder-page-text">{description}</p>
        <a
          href={`/dashboard/${requiredRole}`}
          className="btn btn-outline btn-md"
          id="btn-placeholder-back"
        >
          ← Volver al panel
        </a>
      </div>
    </DashboardShell>
  );
}
