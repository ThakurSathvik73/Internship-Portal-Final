"use client";

import * as React from "react";
import { createContext, useContext, useState } from "react";

type Theme = "light" | "dark";
interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("theme") || sessionStorage.getItem("theme");
      if (stored === "dark" || stored === "light") return stored as Theme;
    }
    return "light";
  });

  // Set theme class on html element
  React.useEffect(() => {
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(theme);
    if (typeof window !== "undefined") {
      localStorage.setItem("theme", theme);
      sessionStorage.setItem("theme", theme);
    }
  }, [theme]);

  const setTheme = (t: Theme) => {
    setThemeState(t);
    // sessionStorage update handled by useEffect
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within ThemeProvider");
  return context;
}
