import { Link } from "react-router-dom";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      style={{
        borderTop: "1px solid var(--border-subtle)",
        backgroundColor: "var(--bg-secondary)",
        padding: "64px 0 32px",
        marginTop: "auto",
      }}
    >
      <div className="container">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: "48px",
            marginBottom: "48px",
          }}
        >
          {/* Brand & Identity */}
          <div>
            <Link
              to="/"
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: "var(--text-xl)",
                fontWeight: 800,
                letterSpacing: "-0.03em",
                display: "inline-block",
                marginBottom: "12px",
              }}
            >
              Saima Mostofa Moni
            </Link>
            <p style={{ color: "var(--text-secondary)", fontSize: "var(--text-sm)", lineHeight: 1.6, maxWidth: "320px" }}>
              Full-Stack Developer & UI/UX Designer crafting scalable web applications, design systems, and delightful digital products.
            </p>
          </div>

          {/* Quick Navigation */}
          <div>
            <h4 style={{ fontSize: "var(--text-sm)", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-muted)", marginBottom: "16px" }}>
              Navigation
            </h4>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "10px" }}>
              <li>
                <Link to="/" style={{ color: "var(--text-secondary)", fontSize: "var(--text-sm)" }}>
                  Home
                </Link>
              </li>
              <li>
                <Link to="/about" style={{ color: "var(--text-secondary)", fontSize: "var(--text-sm)" }}>
                  About & Background
                </Link>
              </li>
              <li>
                <Link to="/projects" style={{ color: "var(--text-secondary)", fontSize: "var(--text-sm)" }}>
                  Featured Projects
                </Link>
              </li>
              <li>
                <Link to="/blog" style={{ color: "var(--text-secondary)", fontSize: "var(--text-sm)" }}>
                  Articles & Insights
                </Link>
              </li>
              <li>
                <Link to="/contact" style={{ color: "var(--text-secondary)", fontSize: "var(--text-sm)" }}>
                  Get in Touch
                </Link>
              </li>
            </ul>
          </div>

          {/* Professional Profiles */}
          <div>
            <h4 style={{ fontSize: "var(--text-sm)", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-muted)", marginBottom: "16px" }}>
              Connect & Portfolio
            </h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "var(--text-sm)" }}>
              <a
                href="https://www.behance.net/saimakhan28"
                target="_blank"
                rel="noreferrer"
                style={{ color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "8px" }}
              >
                <span>🎨 Behance Portfolio</span>
                <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>↗</span>
              </a>
              <a
                href="https://github.com/saimamostofa345-tech"
                target="_blank"
                rel="noreferrer"
                style={{ color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "8px" }}
              >
                <span>💻 GitHub Code</span>
                <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>↗</span>
              </a>
              <a
                href="https://www.linkedin.com/in/saima-mostofa"
                target="_blank"
                rel="noreferrer"
                style={{ color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "8px" }}
              >
                <span>💼 LinkedIn Profile</span>
                <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>↗</span>
              </a>
              <a
                href="mailto:saimamostofa345@gmail.com"
                style={{ color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "8px" }}
              >
                <span>✉️ saimamostofa345@gmail.com</span>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div
          style={{
            borderTop: "1px solid var(--border-subtle)",
            paddingTop: "24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "16px",
            fontSize: "var(--text-xs)",
            color: "var(--text-muted)",
          }}
        >
          <p>© {currentYear} Saima Mostofa Moni. All rights reserved.</p>
          <p>Built with React, Vite, and Django REST Framework.</p>
        </div>
      </div>
    </footer>
  );
}
