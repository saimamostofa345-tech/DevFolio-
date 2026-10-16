import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isOwner } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  const closeMenu = () => setMobileMenuOpen(false);

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 100,
        backgroundColor: "var(--bg-surface)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        borderBottom: "1px solid var(--border-subtle)",
        transition: "all var(--transition-normal)",
      }}
    >
      <div
        className="container"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: "76px",
        }}
      >
        {/* Brand / Logo */}
        <Link
          to="/"
          onClick={closeMenu}
          style={{
            fontFamily: "var(--font-heading)",
            fontSize: "var(--text-xl)",
            fontWeight: 800,
            letterSpacing: "-0.03em",
            display: "flex",
            alignItems: "center",
            gap: "4px",
          }}
        >
          <span>Saima</span>
          <span style={{ color: "var(--accent-primary)" }}>.</span>
          <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", fontWeight: 500, marginLeft: "4px" }}>
            DevFolio
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav
          className="desktop-nav"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "28px",
          }}
        >
          <NavLink
            to="/"
            end
            style={({ isActive }) => ({
              fontSize: "var(--text-sm)",
              fontWeight: isActive ? 600 : 500,
              color: isActive ? "var(--accent-primary)" : "var(--text-secondary)",
              transition: "color var(--transition-fast)",
            })}
          >
            Home
          </NavLink>
          <NavLink
            to="/about"
            style={({ isActive }) => ({
              fontSize: "var(--text-sm)",
              fontWeight: isActive ? 600 : 500,
              color: isActive ? "var(--accent-primary)" : "var(--text-secondary)",
              transition: "color var(--transition-fast)",
            })}
          >
            About
          </NavLink>
          <NavLink
            to="/projects"
            style={({ isActive }) => ({
              fontSize: "var(--text-sm)",
              fontWeight: isActive ? 600 : 500,
              color: isActive ? "var(--accent-primary)" : "var(--text-secondary)",
              transition: "color var(--transition-fast)",
            })}
          >
            Projects
          </NavLink>
          <NavLink
            to="/blog"
            style={({ isActive }) => ({
              fontSize: "var(--text-sm)",
              fontWeight: isActive ? 600 : 500,
              color: isActive ? "var(--accent-primary)" : "var(--text-secondary)",
              transition: "color var(--transition-fast)",
            })}
          >
            Blog
          </NavLink>
          <NavLink
            to="/contact"
            style={({ isActive }) => ({
              fontSize: "var(--text-sm)",
              fontWeight: isActive ? 600 : 500,
              color: isActive ? "var(--accent-primary)" : "var(--text-secondary)",
              transition: "color var(--transition-fast)",
            })}
          >
            Contact
          </NavLink>

          {/* Conditional Admin Affordance (ONLY visible if verified owner is logged in) */}
          {isOwner && (
            <Link
              to="/dashboard"
              style={{
                fontSize: "var(--text-xs)",
                fontWeight: 600,
                color: "var(--accent-primary)",
                backgroundColor: "var(--accent-light)",
                padding: "6px 12px",
                borderRadius: "var(--radius-full)",
                border: "1px solid var(--accent-primary)",
              }}
            >
              Dashboard ⚙️
            </Link>
          )}

          {/* Theme Toggle Button */}
          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Toggle Theme"
            style={{
              padding: "8px 12px",
              borderRadius: "var(--radius-full)",
              border: "1px solid var(--border-subtle)",
              backgroundColor: "var(--bg-surface)",
              color: "var(--text-primary)",
              fontSize: "var(--text-sm)",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            {isDark ? "☀️" : "🌙"}
          </button>
        </nav>

        {/* Mobile Hamburger Toggle */}
        <div style={{ display: "none" }} className="mobile-toggle-wrapper">
          <button
            type="button"
            onClick={toggleTheme}
            style={{
              padding: "6px 10px",
              marginRight: "8px",
              borderRadius: "var(--radius-full)",
              border: "1px solid var(--border-subtle)",
              color: "var(--text-primary)",
            }}
          >
            {isDark ? "☀️" : "🌙"}
          </button>

          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            style={{
              padding: "8px 12px",
              borderRadius: "var(--radius-sm)",
              border: "1px solid var(--border-subtle)",
              color: "var(--text-primary)",
              fontSize: "18px",
            }}
          >
            {mobileMenuOpen ? "✕" : "☰"}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div
          className="mobile-drawer"
          style={{
            borderTop: "1px solid var(--border-subtle)",
            backgroundColor: "var(--bg-surface)",
            padding: "16px 24px 24px",
            display: "flex",
            flexDirection: "column",
            gap: "16px",
          }}
        >
          <NavLink to="/" end onClick={closeMenu} style={{ fontSize: "var(--text-base)", fontWeight: 500 }}>
            Home
          </NavLink>
          <NavLink to="/about" onClick={closeMenu} style={{ fontSize: "var(--text-base)", fontWeight: 500 }}>
            About
          </NavLink>
          <NavLink to="/projects" onClick={closeMenu} style={{ fontSize: "var(--text-base)", fontWeight: 500 }}>
            Projects
          </NavLink>
          <NavLink to="/blog" onClick={closeMenu} style={{ fontSize: "var(--text-base)", fontWeight: 500 }}>
            Blog
          </NavLink>
          <NavLink to="/contact" onClick={closeMenu} style={{ fontSize: "var(--text-base)", fontWeight: 500 }}>
            Contact
          </NavLink>

          {isOwner && (
            <Link
              to="/dashboard"
              onClick={closeMenu}
              style={{
                fontSize: "var(--text-sm)",
                fontWeight: 600,
                color: "var(--accent-primary)",
                padding: "8px 0",
              }}
            >
              Owner Dashboard ⚙️
            </Link>
          )}
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav {
            display: none !important;
          }
          .mobile-toggle-wrapper {
            display: flex !important;
            align-items: center;
          }
        }
      `}</style>
    </header>
  );
}
