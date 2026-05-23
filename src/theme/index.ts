export const colors = {
  // Core backgrounds
  bg: '#0D0D0D',
  bgSurface: '#141414',
  card: '#1A1A1A',
  cardElevated: '#242424',
  cardBorder: '#2C2C2E',

  // Brand
  primary: '#F5A623',
  primaryDark: '#D4891A',
  primaryLight: 'rgba(245,166,35,0.15)',
  primaryMuted: 'rgba(245,166,35,0.08)',

  // Text
  textPrimary: '#FFFFFF',
  textSecondary: '#A1A1AA',
  textMuted: '#52525B',
  textInverse: '#0D0D0D',

  // Overlays
  overlay40: 'rgba(0,0,0,0.40)',
  overlay60: 'rgba(0,0,0,0.60)',
  overlay80: 'rgba(0,0,0,0.80)',

  // State
  success: '#30D158',
  error: '#FF453A',
  warning: '#FF9F0A',

  // Nav
  tabActive: '#F5A623',
  tabInactive: '#52525B',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const typography = {
  displayLarge: { fontSize: 34, fontWeight: '700' as const, letterSpacing: -0.5 },
  displayMedium: { fontSize: 28, fontWeight: '700' as const, letterSpacing: -0.3 },
  displaySmall: { fontSize: 22, fontWeight: '700' as const, letterSpacing: -0.2 },
  titleLarge: { fontSize: 20, fontWeight: '600' as const, letterSpacing: -0.1 },
  titleMedium: { fontSize: 17, fontWeight: '600' as const },
  titleSmall: { fontSize: 15, fontWeight: '600' as const },
  bodyLarge: { fontSize: 16, fontWeight: '400' as const, lineHeight: 24 },
  bodyMedium: { fontSize: 14, fontWeight: '400' as const, lineHeight: 20 },
  bodySmall: { fontSize: 12, fontWeight: '400' as const, lineHeight: 16 },
  label: { fontSize: 11, fontWeight: '600' as const, letterSpacing: 0.5 },
};
