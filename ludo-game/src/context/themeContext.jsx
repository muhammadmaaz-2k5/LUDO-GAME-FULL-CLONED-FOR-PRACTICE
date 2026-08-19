import React, { createContext, useContext, useEffect, useState } from 'react';
import { LUDO_THEMES } from '../constants/themes';

const ThemeContext = createContext();

export function ThemesProvider({ children }) {
  const [theme, setThemeState] = useState(() => {
    const savedTheme = localStorage.getItem('ludo_theme');
    if (savedTheme) {
      try {
        const parsed = JSON.parse(savedTheme);
        const exists = LUDO_THEMES.find(
          (t) => t.id === parsed.id || t.name.toLowerCase() === (parsed.name || '').toLowerCase()
        );
        return exists || LUDO_THEMES[0];
      } catch {
        return LUDO_THEMES[0];
      }
    }
    return LUDO_THEMES[0];
  });

  const setTheme = (newTheme) => {
    setThemeState(newTheme);
    localStorage.setItem('ludo_theme', JSON.stringify(newTheme));
  };

  useEffect(() => {
    if (theme?.colors) {
      const root = document.documentElement;
      root.style.setProperty('--ludo-red', theme.colors.red);
      root.style.setProperty('--ludo-green', theme.colors.green);
      root.style.setProperty('--ludo-yellow', theme.colors.yellow);
      root.style.setProperty('--ludo-blue', theme.colors.blue);
    }
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, themes: LUDO_THEMES }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useThemeContext() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useThemeContext must be used within a ThemesProvider');
  }
  return context;
}
