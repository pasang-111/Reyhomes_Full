"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

type Theme = "light" | "dark";

type ThemeContextValue = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
};

const ThemeContext = createContext<
  ThemeContextValue | undefined
>(undefined);

const STORAGE_KEY = "reyhomes_theme";

function applyTheme(theme: Theme) {
  if (typeof document === "undefined") {
    return;
  }

  const root = document.documentElement;

  root.setAttribute("data-theme", theme);

  root.classList.remove("light", "dark");
  root.classList.add(theme);
}

function getInitialTheme(): Theme {
  if (typeof window === "undefined") {
    return "dark";
  }

  try {
    const storedTheme =
      window.localStorage.getItem(STORAGE_KEY);

    if (
      storedTheme === "light" ||
      storedTheme === "dark"
    ) {
      return storedTheme;
    }
  } catch {
    // Ignore localStorage errors.
  }

  try {
    return window.matchMedia(
      "(prefers-color-scheme: light)"
    ).matches
      ? "light"
      : "dark";
  } catch {
    return "dark";
  }
}

export function ThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [theme, setThemeState] =
    useState<Theme>("dark");

  /*
   * Get the saved theme on the client.
   */
  useEffect(() => {
    const initialTheme = getInitialTheme();

    setThemeState(initialTheme);
    applyTheme(initialTheme);
  }, []);

  /*
   * Change theme.
   */
  const setTheme = useCallback(
    (nextTheme: Theme) => {
      setThemeState(nextTheme);
      applyTheme(nextTheme);

      try {
        window.localStorage.setItem(
          STORAGE_KEY,
          nextTheme
        );
      } catch {
        // Ignore localStorage errors.
      }
    },
    []
  );

  /*
   * Toggle light/dark mode.
   */
  const toggleTheme = useCallback(() => {
    setThemeState((currentTheme) => {
      const nextTheme: Theme =
        currentTheme === "dark"
          ? "light"
          : "dark";

      applyTheme(nextTheme);

      try {
        window.localStorage.setItem(
          STORAGE_KEY,
          nextTheme
        );
      } catch {
        // Ignore localStorage errors.
      }

      return nextTheme;
    });
  }, []);

  /*
   * Keep the context value stable.
   */
  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      setTheme,
      toggleTheme,
    }),
    [theme, setTheme, toggleTheme]
  );

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

/*
 * Hook used by navbar, theme buttons, etc.
 */
export function useTheme() {
  const context =
    useContext(ThemeContext);

  if (!context) {
    throw new Error(
      "useTheme must be used within ThemeProvider"
    );
  }

  return context;
}