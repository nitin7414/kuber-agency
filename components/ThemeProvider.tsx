"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

interface ThemeContextType {
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  darkMode: false,
  setDarkMode: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [darkMode, setDarkModeState] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("ssga_dark");
    if (saved === "true") {
      setDarkModeState(true);
      document.documentElement.setAttribute("data-theme", "dark");
    }
  }, []);

  const setDarkMode = (val: boolean) => {
    setDarkModeState(val);
    localStorage.setItem("ssga_dark", String(val));
    document.documentElement.setAttribute("data-theme", val ? "dark" : "light");
  };

  return (
    <ThemeContext.Provider value={{ darkMode, setDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}