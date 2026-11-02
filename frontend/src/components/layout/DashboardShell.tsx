"use client";

import { useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import type { UserRole } from "@/context/AuthContext";
import {
  Sidebar,
  ADMIN_NAV,
  GERENCIA_NAV,
  ASOCIADO_NAV,
  CLIENT_NAV,
  OPERADOR_NAV,
} from "./Sidebar";
import type { NavItem } from "./Sidebar";
import { Topbar } from "./Topbar";

/* ─── Mapas de nav y etiqueta por rol ────────── */
const NAV_MAP: Record<UserRole, NavItem[]> = {
  admin:    ADMIN_NAV,
  gerencia: GERENCIA_NAV,
  asociado: ASOCIADO_NAV,
  cliente:  CLIENT_NAV,
  operador: OPERADOR_NAV,
};

const ROLE_LABEL: Record<UserRole, string> = {
  admin:    "Administración",
  gerencia: "Gerencia",
  asociado: "Asociado",
  cliente:  "Mi cuenta",
  operador: "Operaciones",
};

export interface DashboardShellProps {
  children:  ReactNode;
  pageTitle: string;
}

export function DashboardShell({ children, pageTitle }: DashboardShellProps) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const role      = user?.role ?? "cliente";
  const navItems  = NAV_MAP[role];
  const roleLabel = ROLE_LABEL[role];

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <div className="dashboard">
      <Sidebar
        navItems={navItems}
        roleLabel={roleLabel}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onLogout={handleLogout}
      />

      <div className="main-content">
        <Topbar
          pageTitle={pageTitle}
          userName={user?.name}
          userEmail={user?.email}
          role={user?.role}
          onMenuClick={() => setSidebarOpen(true)}
        />
        <main className="page-content">{children}</main>
      </div>
    </div>
  );
}
