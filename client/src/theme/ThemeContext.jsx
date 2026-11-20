import React, { createContext, useContext, useState } from 'react';
import { lightTheme, darkTheme, spacing, radii, typography } from './tokens';

const ThemeContext = createContext({
  theme: lightTheme,
  isDark: false,
  toggleTheme: () => {},
  spacing,
  radii,
  typography
});

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(false); // Default: Light theme

  const toggleTheme = () => setIsDark(prev => !prev);
  const theme = isDark ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ theme, isDark, toggleTheme, spacing, radii, typography }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
