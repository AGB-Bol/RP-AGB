"use client";

import { usePathname } from "next/navigation";
import {
  HomeIcon,
  UsersIcon,
  PackageIcon,
  ClipboardIcon,
  SettingsIcon,
  BarChartIcon,
  ClockIcon,
  UserIcon,
  LogoutIcon,
  XIcon,
} from "@/components/icons/Icons";
import type { ComponentType } from "react";
import type { IconProps } from "@/components/icons/Icons";

/* ─── Nav item type ─────────────────────────── */
export interface NavItem {
  id:    string;
  label: string;
  href:  string;
  Icon:  ComponentType<IconProps>;
}

/* ─── Admin: acceso total ───────────────────── */
export const ADMIN_NAV: NavItem[] = [
  { id: "nav-admin-home",       label: "Panel principal", href: "/dashboard/admin",            Icon: HomeIcon      },
  { id: "nav-admin-usuarios",   label: "Usuarios",        href: "/dashboard/admin/usuarios",   Icon: UsersIcon     },
  { id: "nav-admin-reportes",   label: "Reportes",        href: "/dashboard/admin/reportes",   Icon: BarChartIcon  },
  { id: "nav-admin-config",     label: "Configuración",   href: "/dashboard/admin/config",     Icon: SettingsIcon  },
];

/* ─── Gerencia: todo menos configuración ───── */
export const GERENCIA_NAV: NavItem[] = [
  { id: "nav-gerencia-home",      label: "Panel principal", href: "/dashboard/gerencia",             Icon: HomeIcon     },
  { id: "nav-gerencia-usuarios",  label: "Usuarios",        href: "/dashboard/gerencia/usuarios",    Icon: UsersIcon    },
  { id: "nav-gerencia-reportes",  label: "Reportes",        href: "/dashboard/gerencia/reportes",    Icon: BarChartIcon },
];

/* ─── Asociado: registro y modificaciones ───── */
export const ASOCIADO_NAV: NavItem[] = [
  { id: "nav-asociado-home",        label: "Panel",        href: "/dashboard/asociado",              Icon: HomeIcon      },
  { id: "nav-asociado-clientes",    label: "Clientes",     href: "/dashboard/asociado/clientes",     Icon: UsersIcon     },
  { id: "nav-asociado-servicios",   label: "Servicios",    href: "/dashboard/asociado/servicios",    Icon: PackageIcon   },
  { id: "nav-asociado-solicitudes", label: "Solicitudes",  href: "/dashboard/asociado/solicitudes",  Icon: ClipboardIcon },
  { id: "nav-asociado-perfil",      label: "Mi perfil",    href: "/dashboard/asociado/perfil",       Icon: UserIcon      },
];

/* ─── Cliente: solo visualización ──────────── */
export const CLIENT_NAV: NavItem[] = [
  { id: "nav-client-home",       label: "Mi panel",      href: "/dashboard/cliente",            Icon: HomeIcon    },
  { id: "nav-client-servicios",  label: "Mis servicios", href: "/dashboard/cliente/servicios",  Icon: PackageIcon },
  { id: "nav-client-historial",  label: "Historial",     href: "/dashboard/cliente/historial",  Icon: ClockIcon   },
  { id: "nav-client-perfil",     label: "Mi perfil",     href: "/dashboard/cliente/perfil",     Icon: UserIcon    },
];

/* ─── Operador: admin de bajo nivel ────────── */
export const OPERADOR_NAV: NavItem[] = [
  { id: "nav-operador-home",        label: "Panel",       href: "/dashboard/operador",              Icon: HomeIcon      },
  { id: "nav-operador-clientes",    label: "Clientes",    href: "/dashboard/operador/clientes",     Icon: UsersIcon     },
  { id: "nav-operador-servicios",   label: "Servicios",   href: "/dashboard/operador/servicios",    Icon: PackageIcon   },
  { id: "nav-operador-solicitudes", label: "Solicitudes", href: "/dashboard/operador/solicitudes",  Icon: ClipboardIcon },
];

/* ─── Sidebar props ─────────────────────────── */
export interface SidebarProps {
  navItems:  NavItem[];
  roleLabel: string;
  open:      boolean;
  onClose:   () => void;
  onLogout:  () => void;
}

export function Sidebar({ navItems, roleLabel, open, onClose, onLogout }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="sidebar-overlay"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`sidebar${open ? " sidebar--open" : ""}`}
        aria-label="Menú principal"
      >
        {/* Header */}
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <div className="sidebar-logo-icon">RP</div>
            <span className="sidebar-logo-name">RP-AGB</span>
          </div>
          {/* Close button only visible on mobile */}
          <button
            className="sidebar-close-btn"
            onClick={onClose}
            aria-label="Cerrar menú"
          >
            <XIcon size={20} />
          </button>
        </div>

        {/* Nav */}
        <nav className="sidebar-nav">
          <p className="sidebar-section-label">{roleLabel}</p>

          {navItems.map(({ id, label, href, Icon }) => {
            const isActive = pathname === href;
            return (
              <a
                key={id}
                id={id}
                href={href}
                className={`sidebar-nav-item${isActive ? " sidebar-nav-item--active" : ""}`}
                aria-current={isActive ? "page" : undefined}
              >
                <Icon size={18} className="sidebar-nav-icon" />
                <span>{label}</span>
              </a>
            );
          })}
        </nav>

        {/* Footer / logout */}
        <div className="sidebar-footer">
          <button
            id="btn-logout"
            className="sidebar-logout-btn"
            onClick={onLogout}
            aria-label="Cerrar sesión"
          >
            <LogoutIcon size={18} className="sidebar-nav-icon" />
            <span>Cerrar sesión</span>
          </button>
        </div>
      </aside>
    </>
  );
}
