"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth, type UserRole } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Alert } from "@/components/ui/Alert";
import { MailIcon, LockIcon, EyeIcon, EyeOffIcon } from "@/components/icons/Icons";
import Link from "next/link";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080/api";

interface LoginApiResponse {
  success: boolean;
  message?: string;
  user?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
  roles?: string[];
  permissions?: string[];
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: string | null;
}

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

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      setError("El correo electrónico es obligatorio.");
      return;
    }

    if (!password) {
      setError("La contraseña es obligatoria.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/Auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: normalizedEmail,
          password,
        }),
      });

      const data = (await response.json().catch(() => null)) as LoginApiResponse | null;

      if (!response.ok || !data?.success || !data.user) {
        setError(data?.message || "No fue posible iniciar sesión. Verificá tus credenciales.");
        return;
      }

      const roles = data.roles ?? [];
      const normalizedRoles = roles.map((role) => role.toUpperCase());

      let appRole: UserRole | null = null;

      if (normalizedRoles.includes("SUPERADMIN") || normalizedRoles.includes("ADMIN")) {
        appRole = "admin";
      } else if (normalizedRoles.includes("OPERADOR")) {
        appRole = "operador";
      }

      if (!appRole) {
        if (data.refreshToken) {
          try {
            await fetch(`${API_BASE_URL}/Auth/logout`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                refreshToken: data.refreshToken,
              }),
            });
          } catch {
            // No se establece una sesión local para roles sin dashboard.
          }
        }

        setError(
          `Tu cuenta tiene el rol ${roles.join(", ") || "sin rol asignado"}, pero todavía no tiene un dashboard habilitado. Contactá al administrador.`
        );
        return;
      }

      if (!data.accessToken || !data.refreshToken) {
        setError("El servidor no devolvió los tokens necesarios para iniciar sesión.");
        return;
      }

      const fullName = [
        data.user.firstName,
        data.user.lastName,
      ].filter(Boolean).join(" ");

      login(
        {
          id: String(data.user.id),
          name: fullName || data.user.email,
          email: data.user.email,
          role: appRole,
        },
        {
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
          expiresAt: data.expiresAt ?? null,
          roles,
          permissions: data.permissions ?? [],
        }
      );

      router.push(`/dashboard/${appRole}`);
    } catch {
      setError(
        "No se pudo conectar con el servidor. Verificá que el backend esté funcionando."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <button
        id="btn-login-theme-toggle"
        className="theme-toggle-btn"
        onClick={toggleTheme}
        aria-label={theme === "dark" ? "Cambiar a tema claro" : "Cambiar a tema oscuro"}
        title={theme === "dark" ? "Modo claro" : "Modo oscuro"}
        style={{ position: "fixed", top: "var(--space-4)", right: "var(--space-4)" }}
      >
        {theme === "dark" ? <SunIcon /> : <MoonIcon />}
      </button>

      <div className="login-card">
        <div className="login-brand">
          <div className="login-brand-icon">RP</div>
          <span className="login-brand-name">RP-AGB</span>
        </div>

        <h1 className="login-heading">Iniciar sesión</h1>
        <p className="login-sub">Ingresá tus credenciales para continuar.</p>

        {error && <Alert variant="error">{error}</Alert>}

        <form onSubmit={handleSubmit} noValidate>
          <Input
            id="email"
            type="email"
            label="Correo electrónico"
            placeholder="correo@ejemplo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            disabled={loading}
            leftIcon={<MailIcon size={17} />}
          />

          <Input
            id="password"
            type={showPwd ? "text" : "password"}
            label="Contraseña"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            disabled={loading}
            leftIcon={<LockIcon size={17} />}
            rightSlot={
              <button
                type="button"
                className="form-input-icon-btn"
                onClick={() => setShowPwd((v) => !v)}
                aria-label={showPwd ? "Ocultar contraseña" : "Mostrar contraseña"}
                tabIndex={-1}
              >
                {showPwd ? <EyeOffIcon size={17} /> : <EyeIcon size={17} />}
              </button>
            }
          />

          <div className="form-row">
            <label className="form-checkbox-label">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                disabled={loading}
              />
              Recordarme
            </label>
            <a href="#" className="link-small">¿Olvidaste tu contraseña?</a>
          </div>

          <Button
            id="btn-login-submit"
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            loading={loading}
          >
            {loading ? "Verificando…" : "Ingresar"}
          </Button>
        </form>

        <p className="login-hint">
          Ingresá con una cuenta habilitada por el administrador.
        </p>

        <p
          className="login-hint"
          style={{
            marginTop: "var(--space-3)",
            borderTop: "1px solid var(--color-border)",
            paddingTop: "var(--space-3)",
          }}
        >
          ¿No tenés cuenta?{" "}
          <Link href="/registro" style={{ fontWeight: 600 }}>
            Registrate gratis
          </Link>
        </p>
      </div>
    </div>
  );
}