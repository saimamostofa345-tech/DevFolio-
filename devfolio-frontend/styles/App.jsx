import { useState } from "react";
import {
    BrowserRouter,
    Link,
    Navigate,
    Outlet,
    Route,
    Routes,
    useNavigate,
} from "react-router-dom";
import api, { errorMessage } from "./api/axios";

import DashboardHome from "./dashboard/DashboardHome";
import ProfileManagement from "./dashboard/ProfileManagement";
import SkillsManagement from "./dashboard/SkillsManagement";
import ExperienceManagement from "./dashboard/ExperienceManagement";
import EducationManagement from "./dashboard/EducationManagement";
import ProjectsManagement from "./dashboard/ProjectsManagement";
import PostsManagement from "./dashboard/PostsManagement";
import CategoriesManagement from "./dashboard/CategoriesManagement";
import TagsManagement from "./dashboard/TagsManagement";
import CommentsManagement from "./dashboard/CommentsManagement";
import MessagesManagement from "./dashboard/MessagesManagement";

const dashboardLinks = [
    { label: "Overview", path: "/dashboard" },
    { label: "Profile", path: "/dashboard/profile" },
    { label: "Skills", path: "/dashboard/skills" },
    { label: "Experience", path: "/dashboard/experience" },
    { label: "Education", path: "/dashboard/education" },
    { label: "Projects", path: "/dashboard/projects" },
    { label: "Blog Posts", path: "/dashboard/posts" },
    { label: "Categories", path: "/dashboard/categories" },
    { label: "Tags", path: "/dashboard/tags" },
    { label: "Comments", path: "/dashboard/comments" },
    { label: "Messages", path: "/dashboard/messages" },
];

function HomePage() {
    return (
        <main className="public-home">
            <nav className="public-nav">
                <Link to="/" className="brand">DevFolio</Link>
                <div className="public-nav__links">
                    <a href="#about">About</a>
                    <a href="#projects">Projects</a>
                    <Link to="/login">Owner Login</Link>
                </div>
            </nav>

            <section className="hero" id="about">
                <p className="eyebrow">UI/UX Designer · Python Developer</p>
                <h1>Designing thoughtful digital experiences.</h1>
                <p>
                    Welcome to my portfolio. Explore my work, skills, and experience
                    across digital product design and web development.
                </p>
                <a className="primary-link" href="#projects">Explore Projects</a>
            </section>

            <section className="home-projects" id="projects">
                <h2>Selected Projects</h2>
                <p>
                    Project content will appear here once the public projects API is
                    connected to this homepage.
                </p>
            </section>

            <footer className="public-footer">
                © {new Date().getFullYear()} DevFolio
            </footer>
        </main>
    );
}

function LoginPage() {
    const navigate = useNavigate();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    async function handleSubmit(event) {
        event.preventDefault();
        setLoading(true);
        setError("");

        try {
            const response = await api.post("/auth/login/", {
                username,
                password,
            });

            const access = response.data?.access;
            const refresh = response.data?.refresh;

            if (!access) {
                throw new Error("The login response did not include an access token.");
            }

            localStorage.setItem("devfolio_access", access);
            if (refresh) {
                localStorage.setItem("devfolio_refresh", refresh);
            }

            navigate("/dashboard", { replace: true });
        } catch (err) {
            setError(errorMessage(err));
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="login-page">
            <form className="login-card" onSubmit={handleSubmit}>
                <Link to="/" className="brand">DevFolio</Link>
                <h1>Owner Login</h1>
                <p>Sign in to manage your portfolio.</p>

                {error && <p className="dashboard-error" role="alert">{error}</p>}

                <label className="dashboard-field">
                    Username
                    <input
                        autoComplete="username"
                        value={username}
                        onChange={(event) => setUsername(event.target.value)}
                        required
                    />
                </label>

                <label className="dashboard-field">
                    Password
                    <input
                        type="password"
                        autoComplete="current-password"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        required
                    />
                </label>

                <button type="submit" disabled={loading}>
                    {loading ? "Signing in..." : "Sign in"}
                </button>

                <Link to="/">Back to portfolio</Link>
            </form>
        </main>
    );
}

function ProtectedRoute() {
    const token = localStorage.getItem("devfolio_access");
    return token ? <Outlet /> : <Navigate to="/login" replace />;
}

function DashboardLayout() {
    function logout() {
        localStorage.removeItem("devfolio_access");
        localStorage.removeItem("devfolio_refresh");
        window.location.replace("/login");
    }

    return (
        <div className="dashboard-layout">
            <aside className="dashboard-sidebar">
                <Link to="/" className="brand">DevFolio</Link>
                <p className="sidebar-label">ADMIN PANEL</p>

                <nav className="dashboard-nav">
                    {dashboardLinks.map((item) => (
                        <Link key={item.path} to={item.path}>
                            {item.label}
                        </Link>
                    ))}
                </nav>

                <button type="button" onClick={logout}>Log out</button>
                <Link to="/">View portfolio</Link>
            </aside>

            <main className="dashboard-main">
                <Outlet />
            </main>
        </div>
    );
}

function NotFoundPage() {
    return (
        <main className="not-found">
            <h1>404 — Page not found</h1>
            <Link to="/">Return home</Link>
        </main>
    );
}

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />

                <Route element={<ProtectedRoute />}>
                    <Route path="/dashboard" element={<DashboardLayout />}>
                        <Route index element={<DashboardHome />} />
                        <Route path="profile" element={<ProfileManagement />} />
                        <Route path="skills" element={<SkillsManagement />} />
                        <Route path="experience" element={<ExperienceManagement />} />
                        <Route path="education" element={<EducationManagement />} />
                        <Route path="projects" element={<ProjectsManagement />} />
                        <Route path="posts" element={<PostsManagement />} />
                        <Route path="categories" element={<CategoriesManagement />} />
                        <Route path="tags" element={<TagsManagement />} />
                        <Route path="comments" element={<CommentsManagement />} />
                        <Route path="messages" element={<MessagesManagement />} />
                    </Route>
                </Route>

                <Route path="*" element={<NotFoundPage />} />
            </Routes>
        </BrowserRouter>
    );
}
