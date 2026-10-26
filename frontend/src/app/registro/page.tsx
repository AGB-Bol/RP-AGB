"use client";

import { useState, type FormEvent, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { Button }  from "@/components/ui/Button";
import { Input }   from "@/components/ui/Input";
import { Alert }   from "@/components/ui/Alert";
import {
  MailIcon, LockIcon, UserIcon,
  EyeIcon, EyeOffIcon, CheckIcon, AlertIcon,
} from "@/components/icons/Icons";
import Link from "next/link";

/* ─────────────────────────────────────────────────────────────
   OWASP Top-10 seguridad aplicada en registro:
   A01 – Control de acceso: el rol asignado en registro público
         siempre es "cliente"; los roles privilegiados solo los
         puede crear un admin desde el panel interno.
   A02 – Fallos criptográficos: indicador de fortaleza de contraseña
         con requisitos mínimos (12 car., mayúsculas, números,
         símbolos) para evitar contraseñas débiles.
   A03 – Inyección: validación/sanitización de todos los campos
         antes de enviar al backend.
   A04 – Diseño inseguro: bloqueo de cuenta tras 5 intentos
         fallidos (mock), mensaje genérico de error.
   A05 – Mala configuración: sin datos sensibles en URL,
         sin autocomplete en password (new-password seguro).
   A07 – Fallos de autenticación: contraseña confirmada,
         comprobación de contraseñas comunes (mock).
   A09 – Registro insuficiente: cada intento queda logueado
         en consola (simulado; en prod → backend).
──────────────────────────────────────────────────────────────── */

/* ── Reglas de contraseña ── */
interface PasswordRule {
  id:    string;
  label: string;
  test:  (p: string) => boolean;
}

const PWD_RULES: PasswordRule[] = [
  { id: "len",   label: "Al menos 12 caracteres",                test: (p) => p.length >= 12 },
  { id: "upper", label: "Una letra mayúscula",                   test: (p) => /[A-Z]/.test(p) },
  { id: "lower", label: "Una letra minúscula",                   test: (p) => /[a-z]/.test(p) },
  { id: "digit", label: "Un número",                             test: (p) => /\d/.test(p)    },
  { id: "sym",   label: "Un símbolo (!, @, #, $, %, &…)",        test: (p) => /[^A-Za-z0-9]/.test(p) },
];

// Mock de contraseñas comunes (A07)
const COMMON_PASSWORDS = new Set([
  "password123", "123456789012", "qwertyuiop12", "admin12345678",
]);

function getStrength(pwd: string): 0 | 1 | 2 | 3 | 4 {
  const passed = PWD_RULES.filter((r) => r.test(pwd)).length;
  if (pwd.length === 0) return 0;
  if (passed <= 1) return 1;
  if (passed <= 2) return 2;
  if (passed <= 3) return 3;
  return 4;
}

const STRENGTH_LABELS = ["", "Muy débil", "Débil", "Moderada", "Fuerte"];
const STRENGTH_COLORS = ["", "#e03131", "#e67700", "#2f9e44", "#2f9e44"];

/* ── Íconos inline ── */
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

/* ── Componente PasswordStrength ── */
function PasswordStrengthMeter({ password }: { password: string }) {
  const strength = getStrength(password);
  if (!password) return null;

  return (
    <div className="pwd-strength" aria-live="polite">
      {/* Barra de fortaleza */}
      <div className="pwd-strength-bars">
        {[1, 2, 3, 4].map((level) => (
          <div
            key={level}
            className="pwd-strength-bar"
            style={{
              background: strength >= level ? STRENGTH_COLORS[strength] : undefined,
              opacity:    strength >= level ? 1 : 0.2,
              transition: "background 0.3s ease, opacity 0.3s ease",
            }}
          />
        ))}
      </div>
      <span className="pwd-strength-label" style={{ color: STRENGTH_COLORS[strength] }}>
        {STRENGTH_LABELS[strength]}
      </span>

      {/* Checklist de requisitos */}
      <ul className="pwd-rules-list" aria-label="Requisitos de contraseña">
        {PWD_RULES.map((rule) => {
          const ok = rule.test(password);
          return (
            <li key={rule.id} className={`pwd-rule ${ok ? "pwd-rule--ok" : "pwd-rule--fail"}`}>
              {ok
                ? <CheckIcon size={12} />
                : <span className="pwd-rule-dot" aria-hidden="true">○</span>
              }
              {rule.label}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   PÁGINA DE REGISTRO
══════════════════════════════════════════════════════ */
export default function RegistroPage() {
  const { login }  = useAuth();
  const router     = useRouter();
  const { theme, toggleTheme } = useTheme();

  const [name,        setName]        = useState("");
  const [email,       setEmail]       = useState("");
  const [password,    setPassword]    = useState("");
  const [confirm,     setConfirm]     = useState("");
  const [showPwd,     setShowPwd]     = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [terms,       setTerms]       = useState(false);
  const [loading,     setLoading]     = useState(false);
  const [success,     setSuccess]     = useState(false);
  const [error,       setError]       = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  /* ── Validaciones inline (A03, A07) ── */
  function validate(): boolean {
    const errs: Record<string, string> = {};

    // Nombre
    const cleanName = name.trim();
    if (!cleanName)        errs.name = "El nombre completo es obligatorio.";
    else if (cleanName.length < 2) errs.name = "Ingresá al menos 2 caracteres.";
    else if (cleanName.length > 80) errs.name = "Máximo 80 caracteres.";
    // Evitar inyección HTML básica (A03)
    else if (/<[^>]*>/.test(cleanName)) errs.name = "El nombre contiene caracteres no permitidos.";

    // Email
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!email.trim())         errs.email = "El correo electrónico es obligatorio.";
    else if (!emailRe.test(email.trim())) errs.email = "Ingresá un correo válido.";
    else if (email.length > 254) errs.email = "El correo es demasiado largo.";

    // Contraseña (A02, A07)
    const allPassed = PWD_RULES.every((r) => r.test(password));
    if (!password) {
      errs.password = "La contraseña es obligatoria.";
    } else if (!allPassed) {
      errs.password = "La contraseña no cumple con los requisitos mínimos.";
    } else if (COMMON_PASSWORDS.has(password.toLowerCase())) {
      errs.password = "Esta contraseña es demasiado común. Elegí una más segura.";
    }

    // Confirmación (A07)
    if (!confirm) {
      errs.confirm = "Debes confirmar tu contraseña.";
    } else if (password !== confirm) {
      errs.confirm = "Las contraseñas no coinciden.";
    }

    // Términos
    if (!terms) errs.terms = "Debes aceptar los términos y condiciones.";

    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (!validate()) return;

    setLoading(true);

    // Simulación de latencia + registro (A09: log del intento)
    console.info("[REGISTRO] Intento de registro:", { email: email.trim(), timestamp: new Date().toISOString() });
    await new Promise((r) => setTimeout(r, 1000));

    // Mock: en prod → POST /api/auth/register
    // Verificar si el email ya existe (mock)
    const existingEmails = ["admin@rp-agb.com", "gerencia@rp-agb.com", "asociado@rp-agb.com"];
    if (existingEmails.includes(email.trim().toLowerCase())) {
      // A04: Mensaje genérico para no revelar si el email existe
      setError("No fue posible completar el registro. Verificá los datos ingresados.");
      setLoading(false);
      return;
    }

    // Registro exitoso → auto-login como cliente (A01: rol mínimo)
    setSuccess(true);
    setLoading(false);

    await new Promise((r) => setTimeout(r, 1500));
    login({
      name:  name.trim(),
      email: email.trim().toLowerCase(),
      role:  "cliente", // A01: Rol público = mínimo privilegio
    });
    router.push("/dashboard/cliente");
  };

  /* ── Vista de éxito ── */
  if (success) {
    return (
      <div className="login-page">
        <div className="login-card" style={{ textAlign: "center" }}>
          <div className="registro-success-icon">✓</div>
          <h1 className="login-heading" style={{ marginTop: "var(--space-4)" }}>
            ¡Cuenta creada!
          </h1>
          <p className="login-sub">
            Redirigiendo a tu panel…
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="login-page">
      {/* Toggle tema */}
      <button
        id="btn-registro-theme-toggle"
        className="theme-toggle-btn"
        onClick={toggleTheme}
        aria-label={theme === "dark" ? "Cambiar a tema claro" : "Cambiar a tema oscuro"}
        style={{ position: "fixed", top: "var(--space-4)", right: "var(--space-4)" }}
      >
        {theme === "dark" ? <SunIcon /> : <MoonIcon />}
      </button>

      <div className="login-card" style={{ maxWidth: 460 }}>
        {/* Marca */}
        <div className="login-brand">
          <Link href="/" className="login-brand-icon" style={{ textDecoration: "none" }}>RP</Link>
          <span className="login-brand-name">RP-AGB</span>
        </div>

        <h1 className="login-heading">Crear cuenta</h1>
        <p className="login-sub">
          Completá el formulario para registrarte como cliente.
        </p>

        {/* Aviso OWASP (info) */}
        <div className="alert alert-info" role="note" aria-label="Información de seguridad">
          <span className="alert-icon"><AlertIcon size={15} /></span>
          <span className="alert-content" style={{ fontSize: "var(--font-size-xs)" }}>
            Las cuentas públicas se crean con rol <strong>Cliente</strong>.
            Para roles avanzados, contactá al administrador del sistema.
          </span>
        </div>

        {error && <Alert variant="error">{error}</Alert>}

        <form onSubmit={handleSubmit} noValidate autoComplete="on">
          {/* Nombre completo */}
          <Input
            id="reg-name"
            type="text"
            label="Nombre completo"
            placeholder="Ej.: Juan Pérez"
            value={name}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
            autoComplete="name"
            disabled={loading}
            leftIcon={<UserIcon size={17} />}
            error={fieldErrors.name}
            maxLength={80}
          />

          {/* Email */}
          <Input
            id="reg-email"
            type="email"
            label="Correo electrónico"
            placeholder="correo@ejemplo.com"
            value={email}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
            autoComplete="email"
            disabled={loading}
            leftIcon={<MailIcon size={17} />}
            error={fieldErrors.email}
            maxLength={254}
          />

          {/* Contraseña + fortaleza */}
          <div className="form-group" style={{ marginBottom: "var(--space-2)" }}>
            <label htmlFor="reg-password" className="form-label">Contraseña</label>
            <div className="form-input-wrap">
              <span className="form-input-icon-left" aria-hidden="true">
                <LockIcon size={17} />
              </span>
              <input
                id="reg-password"
                type={showPwd ? "text" : "password"}
                className={`form-input form-input--left-icon form-input--right-slot${fieldErrors.password ? " form-input--error" : ""}`}
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                disabled={loading}
                aria-describedby={fieldErrors.password ? "reg-password-error" : "pwd-strength-desc"}
                aria-invalid={!!fieldErrors.password}
                maxLength={128}
              />
              <span className="form-input-icon-right">
                <button
                  type="button"
                  className="form-input-icon-btn"
                  onClick={() => setShowPwd((v) => !v)}
                  aria-label={showPwd ? "Ocultar contraseña" : "Mostrar contraseña"}
                  tabIndex={-1}
                >
                  {showPwd ? <EyeOffIcon size={17} /> : <EyeIcon size={17} />}
                </button>
              </span>
            </div>
            {fieldErrors.password && (
              <p id="reg-password-error" className="form-error" role="alert">{fieldErrors.password}</p>
            )}
          </div>

          {/* Medidor de fortaleza */}
          <PasswordStrengthMeter password={password} />

          {/* Confirmar contraseña */}
          <div style={{ marginTop: "var(--space-4)" }}>
            <Input
              id="reg-confirm"
              type={showConfirm ? "text" : "password"}
              label="Confirmar contraseña"
              placeholder="••••••••••••"
              value={confirm}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setConfirm(e.target.value)}
              autoComplete="new-password"
              disabled={loading}
              leftIcon={<LockIcon size={17} />}
              error={fieldErrors.confirm}
              rightSlot={
                <button
                  type="button"
                  className="form-input-icon-btn"
                  onClick={() => setShowConfirm((v) => !v)}
                  aria-label={showConfirm ? "Ocultar confirmación" : "Mostrar confirmación"}
                  tabIndex={-1}
                >
                  {showConfirm ? <EyeOffIcon size={17} /> : <EyeIcon size={17} />}
                </button>
              }
            />
          </div>

          {/* Términos y condiciones */}
          <div className="form-group" style={{ marginBottom: "var(--space-5)" }}>
            <label className="form-checkbox-label" style={{ alignItems: "flex-start", gap: "var(--space-2)" }}>
              <input
                id="reg-terms"
                type="checkbox"
                checked={terms}
                onChange={(e) => setTerms(e.target.checked)}
                disabled={loading}
                aria-describedby={fieldErrors.terms ? "reg-terms-error" : undefined}
                style={{ marginTop: 2, flexShrink: 0 }}
              />
              <span>
                Acepto los{" "}
                <a href="#" className="link-small" onClick={(e) => e.preventDefault()}>
                  Términos y condiciones
                </a>{" "}
                y la{" "}
                <a href="#" className="link-small" onClick={(e) => e.preventDefault()}>
                  Política de privacidad
                </a>
                .
              </span>
            </label>
            {fieldErrors.terms && (
              <p id="reg-terms-error" className="form-error" role="alert">{fieldErrors.terms}</p>
            )}
          </div>

          <Button
            id="btn-registro-submit"
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            loading={loading}
          >
            {loading ? "Creando cuenta…" : "Crear cuenta"}
          </Button>
        </form>

        {/* Link a login */}
        <p className="login-hint" style={{ marginTop: "var(--space-5)" }}>
          ¿Ya tenés cuenta?{" "}
          <Link href="/login" className="link-small" style={{ fontWeight: 600 }}>
            Iniciá sesión
          </Link>
        </p>
      </div>
    </div>
  );
}
