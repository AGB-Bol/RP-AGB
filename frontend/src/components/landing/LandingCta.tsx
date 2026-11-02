import Link from "next/link";

export function LandingCta() {
  return (
    <section className="landing-cta">
      <div className="landing-container landing-cta-inner">
        <h2 className="landing-cta-title">¿Listo para comenzar?</h2>
        <p className="landing-cta-subtitle">
          Ingresá con tus credenciales y accedé a tu panel ahora mismo.
        </p>
        <Link
          href="/login"
          className="btn btn-primary btn-lg"
          id="cta-btn-ingresar"
        >
          Ir al inicio de sesión
        </Link>
      </div>
    </section>
  );
}
