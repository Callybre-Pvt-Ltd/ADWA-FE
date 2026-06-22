/** Menumind-aligned mobile portal design tokens */
export const mp = {
  bg: '#f8fafc',
  card: '#ffffff',
  border: '#E2E8F0',
  primary: '#005c33',
  primaryLight: '#168654',
  blue: '#2962FF',
  amber: '#E0A23A',
  pink: '#FF4081',
  slate: '#5E7295',
  heading: '#212121',
  headingMuted: '#424242',
  secondary: '#9E9E9E',
  secondaryDark: '#757575',
  radius: '14px',
  radiusSm: '12px',
  pad: '16px',
  gap: '14px',
  touch: '44px',
  row: '48px',
} as const

export type AccentKey = 'green' | 'blue' | 'amber' | 'pink' | 'slate'

export const accentMap: Record<AccentKey, string> = {
  green: mp.primaryLight,
  blue: mp.blue,
  amber: mp.amber,
  pink: mp.pink,
  slate: mp.slate,
}
