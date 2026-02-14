import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

const ThemeContext = createContext({});
const THEME_STORAGE_KEY = 'servicehubiq_theme';

const getInitialTheme = () => {
  try {
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    if (savedTheme === 'light' || savedTheme === 'dark') {
      return savedTheme;
    }
  } catch {
    // ignore storage access failures
  }
  return 'light';
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // ignore storage access failures
    }

    document.documentElement.setAttribute('data-theme', theme);
    document.body.classList.toggle('theme-dark-body', theme === 'dark');
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const value = useMemo(
    () => ({
      theme,
      setTheme,
      toggleTheme,
      isDark: theme === 'dark'
    }),
    [theme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context || !('theme' in context)) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};
