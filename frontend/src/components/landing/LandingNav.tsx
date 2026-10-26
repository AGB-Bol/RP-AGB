"use client";

import Link from "next/link";
import { useTheme } from "@/context/ThemeContext";

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

export function LandingNav() {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="landing-nav">
      <div className="landing-nav-inner">
        {/* Logo */}
        <Link href="/" className="landing-nav-logo">
          <div className="landing-nav-logo-icon">RP</div>
          <span className="landing-nav-logo-name">RP-AGB</span>
        </Link>

        {/* Actions */}
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
          <button
            id="nav-btn-theme-toggle"
            className="theme-toggle-btn"
            onClick={toggleTheme}
            aria-label={theme === "dark" ? "Cambiar a tema claro" : "Cambiar a tema oscuro"}
            title={theme === "dark" ? "Modo claro" : "Modo oscuro"}
          >
            {theme === "dark" ? <SunIcon /> : <MoonIcon />}
          </button>

          <Link href="/registro" className="btn btn-ghost btn-sm" id="nav-btn-registro">
            Registrarse
          </Link>

          <Link href="/login" className="btn btn-primary btn-sm" id="nav-btn-login">
            Iniciar sesión
          </Link>
        </div>
      </div>
    </header>
  );
}

