import React, { createContext, useContext } from 'react';
import { theme, spacing, radii, typography } from './tokens';

const ThemeContext = createContext({
  theme,
  spacing,
  radii,
  typography
});

export function ThemeProvider({ children }) {
  return (
    <ThemeContext.Provider value={{ theme, spacing, radii, typography }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
