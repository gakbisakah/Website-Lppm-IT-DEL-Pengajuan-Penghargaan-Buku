import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
    const [theme, setTheme] = useState("light");
    const [colorTheme, setColorTheme] = useState("default");

    useEffect(() => {
        // Load saved preferences from localStorage
        const savedTheme = localStorage.getItem("theme");
        const savedColorTheme = localStorage.getItem("color-theme");

        if (savedTheme) setTheme(savedTheme);
        if (savedColorTheme) setColorTheme(savedColorTheme);
    }, []);

    useEffect(() => {
        // Load CSS theme file dynamically
        const loadThemeCSS = async () => {
            try {
                // Remove existing theme link if any
                const existingLink = document.getElementById("theme-styles");
                if (existingLink) {
                    existingLink.remove();
                }

                // Don't load CSS for default theme if you have base styles
                if (colorTheme !== "default") {
                    const link = document.createElement("link");
                    link.id = "theme-styles";
                    link.rel = "stylesheet";
                    link.href = `/styles/themes/${colorTheme}.css`;
                    document.head.appendChild(link);
                }
            } catch (error) {
                console.error("Error loading theme CSS:", error);
            }
        };

        loadThemeCSS();

        // Apply theme class to document
        const root = window.document.documentElement;

        // Remove theme classes
        root.classList.remove("light", "dark");
        // Add current theme
        root.classList.add(theme);

        // Save to localStorage
        localStorage.setItem("theme", theme);
        localStorage.setItem("color-theme", colorTheme);
    }, [theme, colorTheme]);

    const toggleTheme = () => {
        setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
    };

    const value = {
        theme,
        colorTheme,
        toggleTheme,
        setTheme,
        setColorTheme,
    };

    return (
        <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
    );
}

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error("useTheme must be used within ThemeProvider");
    }
    return context;
};
