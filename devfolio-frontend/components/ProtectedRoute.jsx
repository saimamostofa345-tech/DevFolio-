import { Navigate, Outlet, useLocation } from "react-router-dom";

export default function ProtectedRoute() {
    const location = useLocation();
    const token = localStorage.getItem("devfolio_access");

    if (!token) {
        return (
            <Navigate
                to="/login"
                replace
                state={{ from: location }}
            />
        );
    }

    return <Outlet />;
}
