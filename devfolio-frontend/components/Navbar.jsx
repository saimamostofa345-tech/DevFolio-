import { useState } from "react";
import { Link, NavLink } from "react-router-dom";

export default function Navbar() {
    const [menuOpen, setMenuOpen] = useState(false);

    const closeMenu = () => setMenuOpen(false);

    const navItems = [
        { label: "Home", to: "/" },
        { label: "Projects", to: "/#projects" },
        { label: "Blog", to: "/blog" },
        { label: "Contact", to: "/#contact" },
    ];

    return (
        <header className="site-header">
            <nav className="site-navbar" aria-label="Main navigation">
                <Link to="/" className="brand" onClick={closeMenu}>
                    DevFolio<span className="brand-dot">.</span>
                </Link>

                <button
                    type="button"
                    className="menu-toggle"
                    aria-label={menuOpen ? "Close navigation" : "Open navigation"}
                    aria-expanded={menuOpen}
                    onClick={() => setMenuOpen((open) => !open)}
                >
                    {menuOpen ? "✕" : "☰"}
                </button>

                <div className={`nav-links ${menuOpen ? "nav-links--open" : ""}`}>
                    {navItems.map((item) => (
                        <Link key={item.label} to={item.to} onClick={closeMenu}>
                            {item.label}
                        </Link>
                    ))}

                    <Link to="/login" className="nav-login" onClick={closeMenu}>
                        Owner Login
                    </Link>
                </div>
            </nav>
        </header>
    );
}