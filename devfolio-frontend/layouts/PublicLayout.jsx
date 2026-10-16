import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

const menuItems = [
    { label: "Overview", path: "/dashboard", icon: "📊", end: true },
    { label: "Profile", path: "/dashboard/profile", icon: "👤" },
    { label: "Skills", path: "/dashboard/skills", icon: "⚡" },
    { label: "Experience", path: "/dashboard/experience", icon: "💼" },
    { label: "Education", path: "/dashboard/education", icon: "🎓" },
    { label: "Projects", path: "/dashboard/projects", icon: "📁" },
];

function DashboardLayout() {
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/login", { replace: true });
    };

    return (
        <div className="dashboard-layout">
            <aside className="dashboard-sidebar">
                <div className="sidebar-brand">
                    <h2>DevFolio</h2>
                    <span>Admin Panel</span>
                </div>

                <nav className="sidebar-nav">
                    {menuItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            end={item.end}
                            className={({ isActive }) =>
                                `sidebar-link ${isActive ? "active" : ""}`
                            }
                        >
                            <span>{item.icon}</span>
                            <span>{item.label}</span>
                        </NavLink>
                    ))}
                </nav>

                <div className="sidebar-bottom">
                    <NavLink to="/" className="sidebar-link">
                        <span>🌐</span>
                        <span>View Portfolio</span>
                    </NavLink>

                    <button
                        type="button"
                        className="sidebar-link logout-button"
                        onClick={handleLogout}
                    >
                        <span>🚪</span>
                        <span>Logout</span>
                    </button>
                </div>
            </aside>

            <div className="dashboard-content">
                <header className="dashboard-header">
                    <div>
                        <h3>Dashboard</h3>
                        <p>Manage your portfolio content</p>
                    </div>

                    <div className="dashboard-header-actions">
                        <button
                            type="button"
                            className="theme-toggle"
                            onClick={toggleTheme}
                            aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
                        >
                            {theme === "light" ? "🌙" : "☀️"}
                        </button>

                        <div className="dashboard-user">
                            <div className="user-avatar">
                                {user?.username?.charAt(0).toUpperCase() || "A"}
                            </div>

                            <div>
                                <strong>{user?.username || "Admin"}</strong>
                                <small>Administrator</small>
                            </div>
                        </div>
                    </div>
                </header>

                <main className="dashboard-main">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}

export default DashboardLayout;