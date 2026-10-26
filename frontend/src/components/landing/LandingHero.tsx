import Link from "next/link";

export function LandingHero() {
  return (
    <section className="landing-hero">
      <div className="landing-container">
        {/* Badge */}
        <span className="landing-hero-badge">Sistema de gestión integral</span>

        <h1 className="landing-hero-title">
          Administrá tus servicios
          <br />
          <span className="landing-hero-title-accent">con total claridad</span>
        </h1>

        <p className="landing-hero-subtitle">
          Plataforma centralizada para la gestión de clientes, servicios y
          reportes de RP-AGB. Accedé a tu panel personalizado y tomá el control.
        </p>

        <div className="landing-hero-actions">
          <Link
            href="/login"
            className="btn btn-primary btn-lg"
            id="hero-btn-ingresar"
          >
            Ingresar al sistema
          </Link>
          <a
            href="#features"
            className="btn btn-ghost btn-lg"
            id="hero-btn-conocer"
          >
            Conocer más
          </a>
        </div>
      </div>

      {/* Decorative background blobs */}
      <div className="landing-hero-blob landing-hero-blob--1" aria-hidden="true" />
      <div className="landing-hero-blob landing-hero-blob--2" aria-hidden="true" />
    </section>
  );
}
