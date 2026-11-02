export function LandingFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="landing-footer">
      <div className="landing-container landing-footer-inner">
        <div className="landing-footer-brand">
          <div className="landing-nav-logo-icon" style={{ width: 28, height: 28, fontSize: 12 }}>
            RP
          </div>
          <span className="landing-footer-name">RP-AGB</span>
        </div>
        <p className="landing-footer-copy">
          © {year} RP-AGB. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  );
}
