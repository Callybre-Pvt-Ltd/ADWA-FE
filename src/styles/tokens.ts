export const colors = {
  blue: {
    50: '#EFF6FF',
    100: '#DBEAFE',
    200: '#BFDBFE',
    400: '#3B82F6',
    600: '#1D4ED8',
    700: '#1E40AF',
    800: '#1E3A8A',
    900: '#172554',
  },
  orange: {
    50: '#FFF7ED',
    100: '#FFEDD5',
    400: '#FB923C',
    500: '#F97316',
    600: '#EA580C',
    700: '#C2410C',
  },
  green: {
    50: '#F0FDF4',
    100: '#DCFCE7',
    400: '#4ADE80',
    600: '#16A34A',
    700: '#15803D',
    800: '#166534',
  },
  amber: {
    50: '#FFFBEB',
    100: '#FEF3C7',
    400: '#FBBF24',
    600: '#D97706',
    800: '#92400E',
  },
  red: {
    50: '#FEF2F2',
    100: '#FEE2E2',
    400: '#F87171',
    600: '#DC2626',
    800: '#991B1B',
  },
  neutral: {
    50: '#F8FAFC',
    100: '#F1F5F9',
    200: '#E2E8F0',
    300: '#CBD5E1',
    400: '#94A3B8',
    600: '#475569',
    700: '#334155',
    800: '#1E293B',
    900: '#0F172A',
  },
} as const

export const semanticColors = {
  primary: colors.blue[600],
  secondary: colors.orange[500],
  accent: colors.orange[500],
  success: colors.green[600],
  warning: colors.amber[600],
  danger: colors.red[600],
  background: colors.neutral[50],
  surface: '#FFFFFF',
  border: colors.neutral[200],
  muted: colors.neutral[600],
  text: {
    primary: colors.neutral[800],
    secondary: colors.neutral[600],
    muted: colors.neutral[600],
    inverse: '#FFFFFF',
  },
} as const

export const radius = {
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '24px',
  full: '9999px',
} as const

export const shadow = {
  sm: '0 1px 3px 0 rgb(0 0 0 / 0.06)',
  md: '0 4px 12px 0 rgb(0 0 0 / 0.08)',
  lg: '0 8px 24px 0 rgb(0 0 0 / 0.10)',
  card: '0 2px 8px 0 rgb(0 0 0 / 0.06), 0 0 0 1px rgb(0 0 0 / 0.04)',
} as const

/** Icon circles: blue-100 bg + blue-600 icon — never orange */
export const accentPalette = [
  { icon: 'bg-blue-600', ring: 'ring-blue-200', gradient: 'from-blue-600 to-blue-700' },
  { icon: 'bg-blue-600', ring: 'ring-blue-200', gradient: 'from-blue-600 to-blue-700' },
  { icon: 'bg-blue-600', ring: 'ring-blue-200', gradient: 'from-blue-600 to-blue-700' },
  { icon: 'bg-blue-600', ring: 'ring-blue-200', gradient: 'from-blue-600 to-blue-700' },
] as const

export const funkyPalette = accentPalette

/** @deprecated use blue scale */
export const royal = colors.blue
