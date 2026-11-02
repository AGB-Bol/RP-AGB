"use client";

import { MenuIcon } from "@/components/icons/Icons";
import { Avatar } from "@/components/ui/Avatar";
import { useTheme } from "@/context/ThemeContext";

export interface TopbarProps {
  pageTitle:    string;
  userName?:    string;
  userEmail?:   string;
  role?:        "admin" | "gerencia" | "asociado" | "cliente" | "operador";
  onMenuClick:  () => void;
}

const roleLabel: Record<string, string> = {
  admin:    "Administrador",
  gerencia: "Gerencia",
  asociado: "Asociado",
  cliente:  "Cliente",
  operador: "Operador",
};

/* ── Iconos inline (sol / luna) para no ampliar el archivo Icons.tsx ── */
function SunIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5"/>
      <line x1="12" y1="1" x2="12" y2="3"/>
      <line x1="12" y1="21" x2="12" y2="23"/>
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
      <line x1="1" y1="12" x2="3" y2="12"/>
      <line x1="21" y1="12" x2="23" y2="12"/>
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
    </svg>
  );
}

export function Topbar({ pageTitle, userName, userEmail, role, onMenuClick }: TopbarProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="topbar">
      {/* Left: menu trigger (mobile) + title */}
      <div className="topbar-left">
        <button
          id="btn-menu-toggle"
          className="topbar-menu-btn"
          onClick={onMenuClick}
          aria-label="Abrir menú"
        >
          <MenuIcon size={20} />
        </button>
        <span className="topbar-title">{pageTitle}</span>
      </div>

      {/* Right: theme toggle + user info */}
      <div className="topbar-right">
        {/* Hide text on very small screens */}
        <div className="topbar-user-info">
          <p className="topbar-user-name">{userName ?? "Usuario"}</p>
          <p className="topbar-user-email">{userEmail ?? ""}</p>
        </div>

        {role && (
          <span className={`role-chip role-chip--${role}`}>
            {roleLabel[role] ?? role}
          </span>
        )}

        <button
          id="btn-theme-toggle"
          className="theme-toggle-btn"
          onClick={toggleTheme}
          aria-label={theme === "dark" ? "Cambiar a tema claro" : "Cambiar a tema oscuro"}
          title={theme === "dark" ? "Modo claro" : "Modo oscuro"}
        >
          {theme === "dark" ? <SunIcon /> : <MoonIcon />}
        </button>

        <Avatar name={userName} size="sm" />
      </div>
    </header>
  );
}

