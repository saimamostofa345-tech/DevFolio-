import {
    createContext,
    useContext,
    useEffect,
    useState,
} from "react";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Restore the user when the app reloads
    useEffect(() => {
        try {
            const savedUser = localStorage.getItem("devfolio_user");

            if (savedUser) {
                setUser(JSON.parse(savedUser));
            }
        } catch (error) {
            console.error("Failed to restore user:", error);
            localStorage.removeItem("devfolio_user");
        } finally {
            setLoading(false);
        }
    }, []);

    // Demo login function
    const login = (userData) => {
        localStorage.setItem(
            "devfolio_user",
            JSON.stringify(userData)
        );

        setUser(userData);
    };

    // Logout function
    const logout = () => {
        localStorage.removeItem("devfolio_user");
        setUser(null);
    };

    const value = {
        user,
        loading,
        isAuthenticated: Boolean(user),
        login,
        logout,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

// Custom hook
export const useAuth = () => {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error(
            "useAuth must be used inside AuthProvider"
        );
    }

    return context;
};
