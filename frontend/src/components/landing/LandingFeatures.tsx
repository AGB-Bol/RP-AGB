interface Feature {
  icon: string;
  title: string;
  description: string;
}

const FEATURES: Feature[] = [
  {
    icon: "📊",
    title: "Panel de administración",
    description:
      "Visualizá métricas clave, usuarios activos y solicitudes en tiempo real desde un único lugar.",
  },
  {
    icon: "📦",
    title: "Gestión de servicios",
    description:
      "Controlá el ciclo de vida de cada servicio: estado, vencimientos y próximos cobros de tus clientes.",
  },
  {
    icon: "🔒",
    title: "Acceso por roles",
    description:
      "Administradores y clientes cuentan con paneles diferenciados, adaptados a sus necesidades.",
  },
];

export function LandingFeatures() {
  return (
    <section className="landing-features" id="features">
      <div className="landing-container">
        <div className="landing-section-header">
          <h2 className="landing-section-title">Todo en un solo lugar</h2>
          <p className="landing-section-subtitle">
            Herramientas diseñadas para simplificar la operación diaria.
          </p>
        </div>

        <div className="landing-features-grid">
          {FEATURES.map((f) => (
            <div key={f.title} className="landing-feature-card">
              <div className="landing-feature-icon">{f.icon}</div>
              <h3 className="landing-feature-title">{f.title}</h3>
              <p className="landing-feature-desc">{f.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
