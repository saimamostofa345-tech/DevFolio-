import {
    createContext,
    useContext,
    useEffect,
    useState,
} from "react";

const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState(() => {
        try {
            const savedTheme = localStorage.getItem("devfolio_theme");

            if (savedTheme === "light" || savedTheme === "dark") {
                return savedTheme;
            }
        } catch (error) {
            console.error("Failed to load theme:", error);
        }

        return "light";
    });

    // Apply theme to the HTML document
    useEffect(() => {
        document.documentElement.setAttribute("data-theme", theme);

        document.documentElement.classList.toggle(
            "dark",
            theme === "dark"
        );

        try {
            localStorage.setItem("devfolio_theme", theme);
        } catch (error) {
            console.error("Failed to save theme:", error);
        }
    }, [theme]);

    const toggleTheme = () => {
        setTheme((currentTheme) =>
            currentTheme === "light" ? "dark" : "light"
        );
    };

    const value = {
        theme,
        setTheme,
        toggleTheme,
        isDark: theme === "dark",
    };

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
};

// Custom hook
export const useTheme = () => {
    const context = useContext(ThemeContext);

    if (!context) {
        throw new Error(
            "useTheme must be used inside ThemeProvider"
        );
    }

    return context;
};
