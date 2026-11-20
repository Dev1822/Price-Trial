/**
 * tokens.js
 * 
 * Design tokens for PriceTrail:
 * Mobile-first, utilitarian, calm shopping tool design system.
 * Light theme by default with clean dark theme support.
 */

export const spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32
};

export const radii = {
  xs: 4,
  sm: 6,
  md: 8,
  lg: 12,
  full: 999
};

export const typography = {
  fontSizes: {
    xs: 11,
    sm: 13,
    base: 15,
    lg: 17,
    xl: 20,
    xxl: 24,
    priceSm: 16,
    priceMd: 20,
    priceLg: 24
  },
  fontWeights: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700'
  },
  tabularNums: {
    fontVariant: ['tabular-nums']
  }
};

export const lightTheme = {
  isDark: false,
  colors: {
    background: '#f8fafc',
    surface: '#ffffff',
    surfaceSubtle: '#f1f5f9',
    surfaceHighlight: '#f8fafc',
    border: '#e2e8f0',
    borderSubtle: '#cbd5e1',
    borderStrong: '#94a3b8',
    textPrimary: '#0f172a',
    textSecondary: '#475569',
    textMuted: '#64748b',
    textInverse: '#ffffff',
    accent: '#0f766e',          // Calm deep teal
    accentSubtle: '#f0fdfa',
    accentBorder: '#99f6e4',
    success: '#15803d',
    warning: '#b45309',
    warningBg: '#fffbeb',
    warningBorder: '#fef3c7',
    danger: '#b91c1c',
    dangerBg: '#fef2f2',
    dangerBorder: '#fecaca',
    // Platform Brand Dots only (never as card fills/borders)
    platforms: {
      amazon: '#ea580c',
      flipkart: '#2563eb',
      snapdeal: '#dc2626'
    }
  },
  shadows: {
    subtle: {
      shadowColor: '#0f172a',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1
    },
    card: {
      shadowColor: '#0f172a',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.08,
      shadowRadius: 4,
      elevation: 2
    }
  }
};

export const darkTheme = {
  isDark: true,
  colors: {
    background: '#0f172a',
    surface: '#1e293b',
    surfaceSubtle: '#334155',
    surfaceHighlight: '#1e293b',
    border: '#334155',
    borderSubtle: '#475569',
    borderStrong: '#64748b',
    textPrimary: '#f8fafc',
    textSecondary: '#cbd5e1',
    textMuted: '#94a3b8',
    textInverse: '#0f172a',
    accent: '#14b8a6',          // Clean teal for dark
    accentSubtle: 'rgba(20, 184, 166, 0.12)',
    accentBorder: 'rgba(20, 184, 166, 0.3)',
    success: '#22c55e',
    warning: '#f59e0b',
    warningBg: 'rgba(245, 158, 11, 0.1)',
    warningBorder: 'rgba(245, 158, 11, 0.25)',
    danger: '#ef4444',
    dangerBg: 'rgba(239, 68, 68, 0.1)',
    dangerBorder: 'rgba(239, 68, 68, 0.25)',
    platforms: {
      amazon: '#f59e0b',
      flipkart: '#38bdf8',
      snapdeal: '#f87171'
    }
  },
  shadows: {
    subtle: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.2,
      shadowRadius: 2,
      elevation: 1
    },
    card: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 2
    }
  }
};
