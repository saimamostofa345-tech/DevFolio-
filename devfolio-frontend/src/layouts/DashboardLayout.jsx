import { useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

const navItems = [
  { label: "Overview", to: "/dashboard", icon: "📊", end: true },
  { label: "Profile", to: "/dashboard/profile", icon: "👤" },
  { label: "Skills", to: "/dashboard/skills", icon: "⚡" },
  { label: "Experience", to: "/dashboard/experience", icon: "💼" },
  { label: "Education", to: "/dashboard/education", icon: "🎓" },
  { label: "Projects", to: "/dashboard/projects", icon: "📁" },
  { label: "Blog Posts", to: "/dashboard/posts", icon: "✍️" },
  { label: "Categories", to: "/dashboard/categories", icon: "🏷️" },
  { label: "Tags", to: "/dashboard/tags", icon: "🔖" },
  { label: "Comments", to: "/dashboard/comments", icon: "💬" },
  { label: "Messages", to: "/dashboard/messages", icon: "📬" },
];

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="dashboard-container" style={{ display: "flex", minHeight: "100vh", backgroundColor: "var(--bg-primary)" }}>
      {/* Sidebar */}
      <aside
        style={{
          width: "260px",
          backgroundColor: "var(--bg-surface)",
          borderRight: "1px solid var(--border-subtle)",
          display: "flex",
          flexDirection: "column",
          position: "sticky",
          top: 0,
          height: "100vh",
          overflowY: "auto",
          zIndex: 50,
        }}
        className={`dashboard-sidebar ${mobileMenuOpen ? "dashboard-sidebar--open" : ""}`}
      >
        <div style={{ padding: "24px", borderBottom: "1px solid var(--border-subtle)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "var(--radius-sm)",
                background: "var(--accent-gradient)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                fontWeight: 700,
                fontSize: "18px",
              }}
            >
              D
            </div>
            <div>
              <div style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "18px" }}>
                DevFolio
              </div>
              <div style={{ fontSize: "11px", color: "var(--accent-primary)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Super Admin
              </div>
            </div>
          </div>
        </div>

        <nav style={{ padding: "16px 12px", flex: 1, display: "flex", flexDirection: "column", gap: "4px" }}>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => setMobileMenuOpen(false)}
              style={({ isActive }) => ({
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "10px 14px",
                borderRadius: "var(--radius-sm)",
                fontSize: "var(--text-sm)",
                fontWeight: isActive ? 600 : 500,
                color: isActive ? "var(--text-on-accent)" : "var(--text-secondary)",
                backgroundColor: isActive ? "var(--accent-primary)" : "transparent",
                transition: "all var(--transition-fast)",
              })}
            >
              <span style={{ fontSize: "16px" }}>{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div style={{ padding: "16px", borderTop: "1px solid var(--border-subtle)", display: "flex", flexDirection: "column", gap: "8px" }}>
          <Link
            to="/"
            target="_blank"
            rel="noreferrer"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "10px 12px",
              borderRadius: "var(--radius-sm)",
              fontSize: "var(--text-sm)",
              color: "var(--text-muted)",
              border: "1px solid var(--border-subtle)",
            }}
          >
            <span>↗</span>
            <span>View Public Site</span>
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "10px 12px",
              borderRadius: "var(--radius-sm)",
              fontSize: "var(--text-sm)",
              color: "var(--status-danger)",
              border: "1px solid rgba(239, 68, 68, 0.2)",
              backgroundColor: "var(--status-danger-bg)",
              fontWeight: 600,
            }}
          >
            <span>🚪</span>
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        {/* Top Header */}
        <header
          style={{
            height: "64px",
            borderBottom: "1px solid var(--border-subtle)",
            backgroundColor: "var(--bg-surface)",
            backdropFilter: "blur(12px)",
            position: "sticky",
            top: 0,
            zIndex: 40,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 24px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="dashboard-mobile-toggle"
              style={{
                display: "none",
                padding: "8px",
                borderRadius: "var(--radius-sm)",
                border: "1px solid var(--border-subtle)",
                color: "var(--text-primary)",
              }}
            >
              ☰
            </button>
            <span style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)" }}>
              Authenticated as <strong style={{ color: "var(--text-primary)" }}>{user?.username || "Owner"}</strong>
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <button
              type="button"
              onClick={toggleTheme}
              style={{
                padding: "8px 12px",
                borderRadius: "var(--radius-sm)",
                border: "1px solid var(--border-subtle)",
                backgroundColor: "var(--bg-surface)",
                color: "var(--text-primary)",
                fontSize: "var(--text-sm)",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
              title="Toggle Light/Dark Theme"
            >
              {isDark ? "☀️ Light" : "🌙 Dark"}
            </button>

            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                backgroundColor: "var(--accent-light)",
                color: "var(--accent-primary)",
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "1px solid var(--border-subtle)",
              }}
            >
              {user?.username?.charAt(0).toUpperCase() || "S"}
            </div>
          </div>
        </header>

        {/* Dynamic Nested Content */}
        <main style={{ padding: "32px 24px", flex: 1 }}>
          <Outlet />
        </main>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .dashboard-sidebar {
            position: fixed;
            left: -270px;
            transition: left var(--transition-normal);
          }
          .dashboard-sidebar--open {
            left: 0;
            box-shadow: var(--shadow-lg);
          }
          .dashboard-mobile-toggle {
            display: inline-block !important;
          }
        }
      `}</style>
    </div>
  );
}
